import { db } from '../../config/database.js';
import { databases } from '../../models/database.js';
import { eq } from 'drizzle-orm';
import { getExistingPool, getPool } from './pool.js';

/**
 * Validate SQL query for common syntax errors and attempt to fix them
 * @param {string} sqlQuery The SQL query to validate
 * @returns {Object} Object indicating if the query is valid, with optional fixed query and error
 */
function validateSqlQuery(sqlQuery) {
    if (!sqlQuery || typeof sqlQuery !== 'string') {
        return { valid: false, error: 'Empty or invalid SQL query' };
    }

    try {
        // Check for unbalanced quotes
        let inSingleQuote = false;
        let inDoubleQuote = false;
        let lastChar = '';

        for (let i = 0; i < sqlQuery.length; i++) {
            const char = sqlQuery[i];
            
            // Handle single quotes
            if (char === "'" && lastChar !== '\\') {
                inSingleQuote = !inSingleQuote;
            }
            
            // Handle double quotes
            if (char === '"' && lastChar !== '\\' && !inSingleQuote) {
                inDoubleQuote = !inDoubleQuote;
            }
            
            lastChar = char;
        }

        // If we're still in a quote at the end, the query has unbalanced quotes
        if (inSingleQuote || inDoubleQuote) {
            let fixedQuery = sqlQuery;
            
            // Try to fix the query by adding closing quotes
            if (inSingleQuote) {
                fixedQuery += "'";
            }
            if (inDoubleQuote) {
                fixedQuery += '"';
            }
            
            return {
                valid: false,
                fixedQuery,
                error: `Unbalanced quotes in SQL query${inDoubleQuote ? ': missing closing double quote (")' : ''}${inSingleQuote ? ': missing closing single quote (\')' : ''}`
            };
        }

        // Check for basic syntax issues
        if (!sqlQuery.toUpperCase().includes('SELECT')) {
            return { valid: false, error: 'Query must include a SELECT statement' };
        }

        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : 'Unknown validation error'
        };
    }
}

/**
 * Execute SQL query on the database connection
 * @param {string} connectionId The database connection ID
 * @param {string} sqlQuery The SQL query to execute
 * @returns {Promise<Object>} The query results
 */
export async function executeSQLQuery(connectionId, sqlQuery) {
    try {
        // Validate the SQL query before executing
        const validation = validateSqlQuery(sqlQuery);
        if (!validation.valid) {
            console.log('SQL validation failed:', validation.error);
            
            // If we have a fixed query, use it
            if (validation.fixedQuery) {
                console.log('Using fixed SQL query:', validation.fixedQuery);
                sqlQuery = validation.fixedQuery;
            } else {
                // If we couldn't fix it, return the error
                return {
                    success: false,
                    error: validation.error
                };
            }
        }

        const [connection] = await db
            .select()
            .from(databases)
            .where(eq(databases.id, parseInt(connectionId)));

        if (!connection) {
            throw new Error('Connection not found');
        }

        // Build connection string from connection details
        const connectionString = `postgresql://${encodeURIComponent(connection.username)}:${encodeURIComponent(connection.password)}@${connection.host}:${connection.port}/${connection.database}`;

        let pool = getExistingPool(connectionId);
        if (!pool) {
            console.log('No existing pool found, creating new pool for connection:', connectionId);
            pool = getPool(connectionId, connectionString);
        }

        const result = await pool.query(sqlQuery);
        console.log('Query executed successfully');

        return {
            success: true,
            rows: result.rows,
            rowCount: result.rowCount
        };
    } catch (error) {
        console.error('Error executing SQL query:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        };
    }
}

