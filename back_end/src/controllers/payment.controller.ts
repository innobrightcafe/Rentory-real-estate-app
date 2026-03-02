import { Request, Response } from 'express';
import { db } from '../config/firebase.js';
import * as crypto from 'crypto';

/**
 * Validates Paystack webhook signature.
 */
const verifyPaystackSignature = (signature: string | string[] | undefined, body: any): boolean => {
    if (!signature || typeof signature !== 'string') return false;
    const secret = process.env.PAYSTACK_SECRET_KEY || 'test_secret';
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(body)).digest('hex');
    return hash === signature;
};

/**
 * Handle incoming Paystack webhooks
 * Endpoint: POST /payments/webhook
 */
export const handlePaystackWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        const signature = req.headers['x-paystack-signature'];

        // In production, ALWAYS verify the signature to prevent bad actors
        if (process.env.NODE_ENV === 'production') {
            if (!verifyPaystackSignature(signature, req.body)) {
                res.status(401).send('Invalid signature');
                return;
            }
        }

        const event = req.body;

        if (event.event === 'charge.success') {
            const data = event.data;
            const metadata = data.metadata || {};

            const userId = metadata.user_id;
            const paymentType = metadata.payment_type; // 'CONTACT_UNLOCK' or 'RENT'
            const amount = data.amount / 100; // Paystack sends in kobo (if NGN)

            if (paymentType === 'CONTACT_UNLOCK') {
                const targetUserId = metadata.target_user_id;

                // Record the transaction
                const transactionRef = db.collection('users').doc(userId).collection('transactions').doc(data.reference);
                await transactionRef.set({
                    amount,
                    status: 'SUCCESS',
                    type: 'CONTACT_UNLOCK',
                    reference: data.reference,
                    target_user_id: targetUserId,
                    created_at: new Date()
                });

            } else if (paymentType === 'RENT') {
                const leaseId = metadata.lease_id;

                const paymentRef = db.collection('leases').doc(leaseId).collection('payments').doc(data.reference);
                await paymentRef.set({
                    amount,
                    status: 'SUCCESS',
                    reference: data.reference,
                    created_at: new Date()
                });
            }
        }

        // Acknowledge webhook
        res.status(200).send('Webhook received');
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).send('Webhook parsing error');
    }
};
