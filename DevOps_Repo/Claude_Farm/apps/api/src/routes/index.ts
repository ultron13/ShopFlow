import { Router } from 'express';
import { authRouter } from './auth.js';
import { cooperativesRouter } from './cooperatives.js';
import { listingsRouter } from './listings.js';
import { ordersRouter } from './orders.js';
import { collectionsRouter } from './collections.js';
import { deliveriesRouter } from './deliveries.js';
import { paymentsRouter } from './payments.js';
import { disputesRouter } from './disputes.js';
import { adminRouter } from './admin.js';

export const router = Router();

router.use('/auth', authRouter);
router.use('/cooperatives', cooperativesRouter);
router.use('/listings', listingsRouter);
router.use('/orders', ordersRouter);
router.use('/collections', collectionsRouter);
router.use('/deliveries', deliveriesRouter);
router.use('/payments', paymentsRouter);
router.use('/disputes', disputesRouter);
router.use('/admin', adminRouter);
