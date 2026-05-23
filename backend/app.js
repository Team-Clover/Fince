import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRouter from './routes/userRoute.js';
import invoiceRouter from './routes/invoiceRoute.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB connection
connectDB();

// Routes
app.use('/api/user', userRouter);
app.use('/api/invoices', invoiceRouter);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

export default app;