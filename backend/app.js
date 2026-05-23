import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

//mongodb connection
import connectDB from './config/db.js';
connectDB();

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

export default app;