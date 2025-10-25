import { eq, and } from 'drizzle-orm';
import { db } from '../config/database.js';
import { databases } from '../models/database.js';
import { verifyAccessToken } from '../utils/tokenUtils.js';

export const createDatabase = async (req, res) => {
    try {
        const accessToken = req.cookies.accessToken;
        
        if (!accessToken) {
            return res.status(401).json({ message: 'No access token provided' });
        }

        const decoded = verifyAccessToken(accessToken);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid access token' });
        }

        const { name, host, port, database, username, password, url } = req.body;
        
        if (!name || !host || !port || !database || !username || !password) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        const newDatabase = await db.insert(databases).values({
            userId: decoded.userId,
            name,
            host,
            port: parseInt(port),
            database,
            username,
            password,
            url: url || null
        }).returning();

        res.status(201).json({ 
            message: 'Database connection created successfully',
            database: newDatabase[0]
        });
    } catch (error) {
        console.error('Create database error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUserDatabases = async (req, res) => {
    try {
        const accessToken = req.cookies.accessToken;
        
        if (!accessToken) {
            return res.status(401).json({ message: 'No access token provided' });
        }

        const decoded = verifyAccessToken(accessToken);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid access token' });
        }

        const userDatabases = await db.select().from(databases).where(eq(databases.userId, decoded.userId));

        res.status(200).json({ databases: userDatabases });
    } catch (error) {
        console.error('Get databases error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getDatabaseById = async (req, res) => {
    try {
        const accessToken = req.cookies.accessToken;
        
        if (!accessToken) {
            return res.status(401).json({ message: 'No access token provided' });
        }

        const decoded = verifyAccessToken(accessToken);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid access token' });
        }

        const { id } = req.params;
        const database = await db.select().from(databases).where(
            and(
                eq(databases.id, parseInt(id)),
                eq(databases.userId, decoded.userId)
            )
        ).limit(1);

        if (database.length === 0) {
            return res.status(404).json({ message: 'Database not found' });
        }

        res.status(200).json({ database: database[0] });
    } catch (error) {
        console.error('Get database error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteDatabase = async (req, res) => {
    try {
        const accessToken = req.cookies.accessToken;
        
        if (!accessToken) {
            return res.status(401).json({ message: 'No access token provided' });
        }

        const decoded = verifyAccessToken(accessToken);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid access token' });
        }

        const { id } = req.params;
        const deletedDatabase = await db.delete(databases).where(
            and(
                eq(databases.id, parseInt(id)),
                eq(databases.userId, decoded.userId)
            )
        ).returning();

        if (deletedDatabase.length === 0) {
            return res.status(404).json({ message: 'Database not found' });
        }

        res.status(200).json({ message: 'Database deleted successfully' });
    } catch (error) {
        console.error('Delete database error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
