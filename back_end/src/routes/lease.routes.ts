import { Router } from 'express';
import { createLease, signLease, authorizeLease } from '../controllers/lease.controller.js';

const router = Router();

// /leases generates a new lease via Gemini Legal Architect
router.post('/', createLease);

// /leases/:id/sign allows landlords and tenants to sign
router.patch('/:id/sign', signLease);

// /leases/:id/authorize allows admins to finish the workflow
router.post('/:id/authorize', authorizeLease);

export default router;
