import express from 'express'
import { register, login, logout, refresh, me } from '../../controllers/auth.controller.js';

const authRouter=express.Router();

authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/refresh',refresh);
authRouter.post('/logout',logout);
authRouter.get('/me',me);

export default authRouter;