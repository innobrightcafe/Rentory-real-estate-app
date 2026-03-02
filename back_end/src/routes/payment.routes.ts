import { Router } from 'express';
import { handlePaystackWebhook } from '../controllers/payment.controller.js';

const router = Router();

// Endpoint for Paystack to hit with webhook payloads
router.post('/webhook', handlePaystackWebhook);

export default router;
