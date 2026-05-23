import express from 'express';
import { registerUserController, loginUserController, checkAuth, updateProfile, logoutUserController } from '../controllers/userController.js';
import { protectRoute } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUserController);
userRouter.post('/login', loginUserController);
userRouter.post('/logout', logoutUserController);
userRouter.get('/check-auth', checkAuth);
userRouter.put('/update-profile', protectRoute, updateProfile);

export default userRouter;