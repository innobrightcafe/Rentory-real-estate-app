import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import multer from 'multer';

// Use memory storage so we can process the buffers directly
// and send them to Gemini and Firebase Storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit
    },
});

const router = Router();

// /auth/register expects a multi-part form data with text fields and two files
router.post(
    '/register',
    upload.fields([
        { name: 'id_image', maxCount: 1 },
        { name: 'face_scan', maxCount: 1 },
    ]),
    register
);

// /auth/login expects standard JSON body
router.post('/login', login);

export default router;
