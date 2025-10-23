import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth/UserRoute.js';

const app=express();

// Configure CORS for Next.js client on port 3000
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',authRouter);

app.listen(3004,()=>{
    console.log('Server is running on port 3004');
});

app.get('/',(req,res)=>{
    res.send('Hello World');
});
