import { Router } from 'express';
import { analyzeProperty, createProperty, discoverProperties } from '../controllers/property.controller.js';
import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit
    },
});

const router = Router();

// /properties/analyze processes up to 10 photos
router.post('/analyze', upload.array('photos', 10), analyzeProperty);

// /properties creates the listing (could also take photos directly)
router.post('/', upload.array('photos', 10), createProperty);

// /properties/discover returns AI scored listings
router.get('/discover', discoverProperties);

export default router;
