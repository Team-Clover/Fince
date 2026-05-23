import express from 'express';

const userRouter = express.Router();

userRouter.post('/register', (req, res) => {
    // Handle user registration logic here
    res.send('User registered successfully');
});

userRouter.post('/login', (req, res) => {
    // Handle user login logic here
    res.send('User logged in successfully');
});
userRouter.get('/profile', (req, res) => {
    // Handle fetching user profile logic here
    res.send('User profile data');
});

export default userRouter;