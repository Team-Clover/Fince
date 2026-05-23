import express from 'express';
import { signup, login, logout, checkAuth, updateProfile } from '../controllers/userController.js';
import { protectRoute } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', signup);
userRouter.post('/login', login);
userRouter.post('/logout', logout);
userRouter.get('/profile', protectRoute, checkAuth);
userRouter.put('/update-profile', protectRoute, updateProfile);

export default userRouter;