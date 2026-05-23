import express from 'express';



const userRouter = express.Router();

userRouter.post('/register',registerUserController);
userRouter.post('/login',loginUserController);
userRouter.post('/logout',logoutUserController);
userRouter.get('/profile',updateProfile);


export default userRouter;