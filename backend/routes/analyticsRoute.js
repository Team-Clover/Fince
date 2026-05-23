import express from 'express';
import { protectRoute } from '../middleware/auth.js';
import { getAnalytics } from '../controllers/analyticsController.js';

const analyticsRouter = express.Router();

analyticsRouter.get('/', protectRoute, getAnalytics);

export default analyticsRouter;
