import express from 'express';
import { 
  registerUserController, 
  loginUserController, 
  walletLoginController,
  checkAuth, 
  updateProfile, 
  logoutUserController,
  linkFamily,
  leaveFamily,
  forgotPasswordRequest,
  verifyOtp,
  resetPassword
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

// Forgot Password Flow
userRouter.post('/forgot-password', forgotPasswordRequest);
userRouter.post('/verify-otp', verifyOtp);
userRouter.post('/reset-password', resetPassword);

export default userRouter;