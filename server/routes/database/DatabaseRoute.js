import express from 'express'
import { createDatabase, getUserDatabases, getDatabaseById, deleteDatabase } from '../../controllers/database.controller.js';

const databaseRouter = express.Router();

databaseRouter.post('/', createDatabase);
databaseRouter.get('/', getUserDatabases);
databaseRouter.get('/:id', getDatabaseById);
databaseRouter.delete('/:id', deleteDatabase);

export default databaseRouter;
