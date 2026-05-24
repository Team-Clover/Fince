import express from 'express';
import { syncSMS } from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// SMS Sync Route
router.post('/sms-sync', syncSMS);

export default router;
