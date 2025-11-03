import express from 'express'
import { createDatabase, getUserDatabases, getDatabaseById, deleteDatabase } from '../../controllers/database.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const databaseRouter = express.Router();

// Apply authentication middleware to all routes
databaseRouter.use(authenticate);

databaseRouter.post('/', createDatabase);
databaseRouter.get('/', getUserDatabases);
databaseRouter.get('/:id', getDatabaseById);
databaseRouter.delete('/:id', deleteDatabase);

export default databaseRouter;
