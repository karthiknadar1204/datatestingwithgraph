import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth/UserRoute.js';
import databaseRouter from './routes/database/DatabaseRoute.js';

const app=express();

// Configure CORS for Next.js client on port 3000
const allowedOrigins = ['http://localhost:3000', 'http://localhost:8025'];

// CORS configuration - must use specific origin (not wildcard) when credentials are enabled
const corsOptions = {
    origin: function (origin, callback) {
        // For preflight and actual requests, origin will be present from browser
        // When credentials are enabled, we MUST return the specific origin string, never '*'
        if (!origin) {
            // Requests without origin (Postman, curl, etc.) - don't set CORS headers
            return callback(null, false);
        }
        
        if (allowedOrigins.includes(origin)) {
            // Return the specific origin string to set Access-Control-Allow-Origin header correctly
            callback(null, origin);
        } else {
            // Reject origins not in allowed list
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // This requires a specific origin, not wildcard
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: false, // Let CORS handle preflight
    optionsSuccessStatus: 204 // Use 204 for successful OPTIONS requests
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',authRouter);
app.use('/api/databases',databaseRouter);

app.listen(3004,()=>{
    console.log('Server is running on port 3004');
});

app.get('/',(req,res)=>{
    res.send('Hello World');
});
