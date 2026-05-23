import express from 'express';
import { protectRoute } from '../middleware/auth.js';
import {
  getChatHistory,
  clearChatHistory,
  getSubscriptions,
  postChatMessage,
  getReport,
  getAudit,
  getIntelligence
} from '../controllers/aiController.js';

const aiRouter = express.Router();

aiRouter.get('/chat', protectRoute, getChatHistory);
aiRouter.delete('/chat', protectRoute, clearChatHistory);
aiRouter.post('/chat', protectRoute, postChatMessage);
aiRouter.get('/subscriptions', protectRoute, getSubscriptions);
aiRouter.get('/report', protectRoute, getReport);
aiRouter.get('/audit', protectRoute, getAudit);
aiRouter.get('/intelligence', protectRoute, getIntelligence);

export default aiRouter;
