import express from 'express';
import { 
  registerUserController, 
  loginUserController, 
  walletLoginController,
  checkAuth, 
  updateProfile, 
  logoutUserController,
  linkFamily,
  leaveFamily
} from '../controllers/userController.js';
import { protectRoute } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUserController);
userRouter.post('/login', loginUserController);
userRouter.post('/wallet-login', walletLoginController);
userRouter.post('/logout', logoutUserController);
userRouter.get('/check-auth', checkAuth);
userRouter.get('/profile', protectRoute, checkAuth);
userRouter.put('/update-profile', protectRoute, updateProfile);
userRouter.post('/family/link', protectRoute, linkFamily);
userRouter.post('/family/leave', protectRoute, leaveFamily);

export default userRouter;