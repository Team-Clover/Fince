import express from 'express';
import { protectRoute } from '../middleware/auth.js';
import { getBudgets, saveBudget, deleteBudget, aiAllocateBudget } from '../controllers/budgetController.js';

const budgetRouter = express.Router();

budgetRouter.get('/', protectRoute, getBudgets);
budgetRouter.post('/', protectRoute, saveBudget);
budgetRouter.delete('/:id', protectRoute, deleteBudget);
budgetRouter.post('/ai-allocate', protectRoute, aiAllocateBudget);

export default budgetRouter;
