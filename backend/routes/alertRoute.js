import express from 'express';
import { protectRoute } from '../middleware/auth.js';
import { getAlerts, markAllRead, clearAlerts } from '../controllers/alertController.js';

const alertRouter = express.Router();

alertRouter.get('/', protectRoute, getAlerts);
alertRouter.put('/read-all', protectRoute, markAllRead);
alertRouter.delete('/', protectRoute, clearAlerts);

export default alertRouter;
