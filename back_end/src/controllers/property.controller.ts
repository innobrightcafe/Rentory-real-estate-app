import { Request, Response } from 'express';
import { db } from '../config/firebase.js';
import { analyzePropertyImages } from '../services/property_ai.service.js';
import { uploadFile } from '../services/storage.service.js';
import { z } from 'zod';

const createPropertySchema = z.object({
    landlord_id: z.string(),
    category: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'EVENT_CENTER', 'LAND', 'SHORTLET']),
    title: z.string(),
    description: z.string(),
    neighborhood_description: z.string().optional(),
    price: z.number().positive(),
    address: z.string(),
    amenities: z.array(z.string()).optional(),
    suggested_price: z.number().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional()
});

/**
 * Endpoint for AI ingestion of property photos. Max 10 photos.
 */
export const analyzeProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            res.status(400).json({ error: 'Please upload at least one property image.' });
            return;
        }

        const imageBuffers = files.map(file => ({
            buffer: file.buffer,
            mimeType: file.mimetype
        }));

        const aiResult = await analyzePropertyImages(imageBuffers);

        res.status(200).json({
            message: 'Property analysis complete',
            analysis: aiResult
        });
    } catch (error) {
        console.error('Analyze property error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Creates a new property listing.
 */
export const createProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsedData = createPropertySchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ error: 'Invalid property data', details: parsedData.error.issues });
            return;
        }

        const files = req.files as Express.Multer.File[];
        let imageUrls: string[] = [];

        // Optional: upload images if they are provided directly during creation
        if (files && files.length > 0) {
            imageUrls = await Promise.all(
                files.map(file => uploadFile(file.buffer, file.originalname, file.mimetype, 'property_images'))
            );
        }

        const data = parsedData.data;
        const propertyRef = db.collection('properties').doc();

        const newProperty = {
            ...data,
            images: imageUrls,
            status: 'PENDING',
            is_verified: false,
            rentory_managed: false,
            created_at: new Date()
        };

        await propertyRef.set(newProperty);

        res.status(201).json({
            message: 'Property listed successfully',
            propertyId: propertyRef.id,
            property: newProperty
        });
    } catch (error) {
        console.error('Create property error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Discover endpoint matching tenant preferences. 
 * Dummy implementation for matching score.
 */
export const discoverProperties = async (req: Request, res: Response): Promise<void> => {
    try {
        // In a real scenario, extract user preferences and use an AI embedding search 
        // or heuristic scoring against active properties.
        const snapshot = await db.collection('properties').where('status', 'in', ['ACTIVE', 'PENDING']).limit(20).get();

        const properties = snapshot.docs.map(doc => {
            const data = doc.data();
            // Mock match score based on random logic for this iteration
            const match_score = Math.floor(Math.random() * 40) + 60; // 60 to 100
            return { id: doc.id, ...data, match_score };
        });

        // Sort descending by match score
        properties.sort((a, b) => b.match_score - a.match_score);

        res.status(200).json({ properties });
    } catch (error) {
        console.error('Discover properties error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
