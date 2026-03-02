import { Request, Response } from 'express';
import { db } from '../config/firebase.js';
import { uploadFile } from '../services/storage.service.js';
import { verifyIdentityPhotos, FaceMatchAuditResult } from '../services/gemini.service.js';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email(),
    pin: z.string().length(4), // Assuming a 4-digit PIN
    fullName: z.string().min(2),
    phone: z.string().optional(),
    bio: z.string().optional(),
    role: z.enum(['TENANT', 'LANDLORD', 'GUIDE', 'STAFF']).default('TENANT'),
});

const loginSchema = z.object({
    email: z.string().email(),
    pin: z.string().length(4),
});

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (!files || !files.id_image || !files.face_scan) {
            res.status(400).json({ error: 'Missing id_image or face_scan in form data.' });
            return;
        }

        const parsedData = registerSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ error: 'Invalid input data', details: parsedData.error.issues });
            return;
        }

        const { email, pin, fullName, phone, bio, role } = parsedData.data;

        // 1. Check if user already exists
        const usersRef = db.collection('users');
        const existingUser = await usersRef.where('email', '==', email).get();
        if (!existingUser.empty) {
            res.status(409).json({ error: 'User with this email already exists' });
            return;
        }

        const idPhoto = files.id_image[0];
        const faceScan = files.face_scan[0];

        // 2. Perform Face Match Audit via Gemini
        let auditResult: FaceMatchAuditResult;
        try {
            auditResult = await verifyIdentityPhotos(
                idPhoto.buffer,
                idPhoto.mimetype,
                faceScan.buffer,
                faceScan.mimetype
            );
        } catch (aiError) {
            res.status(500).json({ error: 'Identity verification service failed', details: aiError });
            return;
        }

        // 3. Upload images to Firebase Storage
        const idUrl = await uploadFile(idPhoto.buffer, idPhoto.originalname, idPhoto.mimetype, 'kyc_id_images');
        const faceUrl = await uploadFile(faceScan.buffer, faceScan.originalname, faceScan.mimetype, 'kyc_face_scans');

        // 4. Create User Record and Profile in Firestore
        const salt = await bcrypt.genSalt(10);
        const pinHash = await bcrypt.hash(pin, salt);

        const newUserRef = usersRef.doc(); // Auto-generate ID
        const userId = newUserRef.id;

        const userStatus = auditResult.status === 'PASSED' ? 'ACTIVE' : 'PENDING';

        await newUserRef.set({
            email,
            pin_hash: pinHash,
            role,
            status: userStatus,
            created_at: new Date(),
            full_name: fullName,
            phone: phone || null,
            bio: bio || null,
            preferences: {}
        });

        // 5. Create Verification Request
        const verifyRef = db.collection('verification_requests').doc();
        await verifyRef.set({
            user_id: userId,
            id_image_url: idUrl,
            face_scan_url: faceUrl,
            status: auditResult.status === 'PASSED' ? 'APPROVED' : (auditResult.status === 'FAILED' ? 'REJECTED' : 'PENDING'),
            role_requested: role,
            created_at: new Date(),
            updated_at: new Date()
        });

        // 6. Save Audit Result
        await db.collection('face_match_audits').doc(verifyRef.id).set({
            verification_request_id: verifyRef.id,
            match_score: auditResult.match_score,
            ai_confidence: auditResult.ai_confidence,
            reasoning: auditResult.reasoning,
            status: auditResult.status,
            timestamp: new Date()
        });

        res.status(201).json({
            message: 'Registration successful',
            userId,
            verification_status: userStatus,
            audit: {
                score: auditResult.match_score,
                reasoning: auditResult.reasoning
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsedData = loginSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ error: 'Invalid email or pin' });
            return;
        }

        const { email, pin } = parsedData.data;

        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).limit(1).get();

        if (snapshot.empty) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        // Verify PIN
        const isValid = await bcrypt.compare(pin, userData.pin_hash);
        if (!isValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        if (userData.status === 'SUSPENDED') {
            res.status(403).json({ error: 'Account suspended' });
            return;
        }

        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_dev';
        const token = jwt.sign(
            { userId: userDoc.id, role: userData.role, email: userData.email },
            jwtSecret,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: userDoc.id,
                email: userData.email,
                role: userData.role,
                status: userData.status,
                fullName: userData.full_name
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
