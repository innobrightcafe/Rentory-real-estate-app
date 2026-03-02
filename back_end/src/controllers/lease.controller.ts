import { Request, Response } from 'express';
import { db } from '../config/firebase.js';
import { generateLeaseAgreement } from '../services/lease_ai.service.js';
import { z } from 'zod';

const generateLeaseSchema = z.object({
    property_id: z.string(),
    tenant_id: z.string(),
    landlord_id: z.string(),
    negotiation_points: z.array(z.string()).optional()
});

/**
 * Endpoint to generate a new lease via Gemini Legal Architect.
 */
export const createLease = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsedData = generateLeaseSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ error: 'Invalid data', details: parsedData.error.issues });
            return;
        }

        const { property_id, tenant_id, landlord_id, negotiation_points } = parsedData.data;

        // Fetch details
        const [propertyDoc, tenantDoc, landlordDoc] = await Promise.all([
            db.collection('properties').doc(property_id).get(),
            db.collection('users').doc(tenant_id).get(),
            db.collection('users').doc(landlord_id).get(),
        ]);

        if (!propertyDoc.exists || !tenantDoc.exists || !landlordDoc.exists) {
            res.status(404).json({ error: 'Property, Tenant, or Landlord not found.' });
            return;
        }

        // Generate Lease Content
        const leaseContent = await generateLeaseAgreement(
            propertyDoc.data(),
            tenantDoc.data(),
            landlordDoc.data(),
            negotiation_points
        );

        // Save Lease
        const leaseRef = db.collection('leases').doc();
        const newLease = {
            property_id,
            tenant_id,
            landlord_id,
            content: leaseContent,
            status: 'DRAFT',
            created_at: new Date(),
            updated_at: new Date()
        };

        await leaseRef.set(newLease);

        res.status(201).json({
            message: 'Lease generated successfully',
            leaseId: leaseRef.id,
            status: newLease.status
        });
    } catch (error) {
        console.error('Create lease error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const signSchema = z.object({
    role: z.enum(['TENANT', 'LANDLORD']),
    user_id: z.string() // in a real app, this comes from the auth token
});

/**
 * Endpoint for digital signatures.
 */
export const signLease = async (req: Request, res: Response): Promise<void> => {
    try {
        const leaseId = req.params.id as string;
        const parsedData = signSchema.safeParse(req.body);

        if (!parsedData.success) {
            res.status(400).json({ error: 'Invalid sign request data', details: parsedData.error.issues });
            return;
        }

        const { role, user_id } = parsedData.data;

        const leaseRef = db.collection('leases').doc(leaseId);
        const leaseDoc = await leaseRef.get();

        if (!leaseDoc.exists) {
            res.status(404).json({ error: 'Lease not found' });
            return;
        }
        const lease = leaseDoc.data()!;

        // Verify ownership
        if (role === 'TENANT' && lease.tenant_id !== user_id) {
            res.status(403).json({ error: 'Unauthorized to sign as tenant.' });
            return;
        }
        if (role === 'LANDLORD' && lease.landlord_id !== user_id) {
            res.status(403).json({ error: 'Unauthorized to sign as landlord.' });
            return;
        }

        let newStatus = lease.status;

        if (lease.status === 'DRAFT') {
            newStatus = role === 'LANDLORD' ? 'SIGNED_BY_LANDLORD' : 'SIGNED_BY_TENANT';
        } else if (lease.status === 'SIGNED_BY_LANDLORD' && role === 'TENANT') {
            newStatus = 'PENDING_ADMIN';
        } else if (lease.status === 'SIGNED_BY_TENANT' && role === 'LANDLORD') {
            newStatus = 'PENDING_ADMIN';
        }

        await leaseRef.update({
            status: newStatus,
            updated_at: new Date()
        });

        res.status(200).json({ message: 'Lease signed successfully', status: newStatus });
    } catch (error) {
        console.error('Sign lease error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Admin authorize lease.
 */
export const authorizeLease = async (req: Request, res: Response): Promise<void> => {
    try {
        const leaseId = req.params.id as string;
        // Assuming middleware checks if actor is ADMIN
        const leaseRef = db.collection('leases').doc(leaseId);

        await leaseRef.update({
            status: 'FULLY_SIGNED',
            updated_at: new Date()
        });

        res.status(200).json({ message: 'Lease fully authorized.' });
    } catch (error) {
        console.error('Authorize lease error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
