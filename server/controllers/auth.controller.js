import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { users } from '../models/user.js';

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.insert(users).values({ name, email, password: hashedPassword }).returning();
        
        res.status(201).json({ message: 'User registered successfully', user: newUser[0] });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const usersFound = await db.select().from(users).where(eq(users.email, email)).limit(1);
        const user = usersFound[0];
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        res.cookie('userId', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });

        res.status(200).json({ 
            message: 'Login successful',
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const logout = async (req, res) => {
    res.clearCookie('userId', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.status(200).json({ message: 'Logout successful' });
}

export const me = async (req, res) => {
    try {
        const userId = req.cookies.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const usersFound = await db.select().from(users).where(eq(users.id, parseInt(userId))).limit(1);
        const user = usersFound[0];
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ 
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('Me endpoint error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}