import { eq, and } from 'drizzle-orm';
import { db } from '../config/database.js';
import { databases } from '../models/database.js';
import { authenticate } from '../middleware/auth.middleware.js';
import pg from 'pg';
const { Client } = pg;

const fetchPostgreSQLSchema = async (host, port, database, username, password) => {
    const client = new Client({
        host,
        port: parseInt(port),
        database,
        user: username,
        password,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('\n' + '='.repeat(80));
        console.log('📊 FETCHING POSTGRESQL SCHEMA');
        console.log('='.repeat(80));

        // Get all tables
        const tablesResult = await client.query(`
            SELECT 
                table_name,
                table_type
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        
        const tables = tablesResult.rows;
        console.log('\n📋 TABLES & VIEWS:');
        console.log('-'.repeat(80));
        tables.forEach((table, index) => {
            console.log(`${index + 1}. ${table.table_name} (${table.table_type})`);
        });
        console.log(`\nTotal: ${tables.length} ${tables.length === 1 ? 'table/view' : 'tables/views'}`);

        // Get detailed column information for each table
        const schemaInfo = [];
        for (const table of tables) {
            const tableName = table.table_name;
            
            // Get columns
            const columnsResult = await client.query(`
                SELECT 
                    column_name,
                    data_type,
                    character_maximum_length,
                    is_nullable,
                    column_default,
                    ordinal_position
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = $1
                ORDER BY ordinal_position;
            `, [tableName]);

            const columns = columnsResult.rows;
            
            // Get primary keys
            const pkResult = await client.query(`
                SELECT 
                    kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu 
                    ON tc.constraint_name = kcu.constraint_name
                WHERE tc.table_schema = 'public' 
                    AND tc.table_name = $1 
                    AND tc.constraint_type = 'PRIMARY KEY';
            `, [tableName]);
            const primaryKeys = pkResult.rows.map(r => r.column_name);

            // Get foreign keys
            const fkResult = await client.query(`
                SELECT
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name,
                    tc.constraint_name
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY' 
                    AND tc.table_schema = 'public'
                    AND tc.table_name = $1;
            `, [tableName]);
            const foreignKeys = fkResult.rows;

            // Get unique constraints
            const uniqueResult = await client.query(`
                SELECT 
                    kcu.column_name,
                    tc.constraint_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu 
                    ON tc.constraint_name = kcu.constraint_name
                WHERE tc.table_schema = 'public' 
                    AND tc.table_name = $1 
                    AND tc.constraint_type = 'UNIQUE';
            `, [tableName]);
            const uniqueConstraints = uniqueResult.rows.map(r => r.column_name);

            // Get indexes
            const indexesResult = await client.query(`
                SELECT
                    indexname,
                    indexdef
                FROM pg_indexes
                WHERE schemaname = 'public' AND tablename = $1;
            `, [tableName]);
            const indexes = indexesResult.rows;

            schemaInfo.push({
                tableName,
                tableType: table.table_type,
                columns,
                primaryKeys,
                foreignKeys,
                uniqueConstraints,
                indexes
            });
        }

        // Log detailed information
        console.log('\n' + '='.repeat(80));
        console.log('📝 DETAILED SCHEMA INFORMATION');
        console.log('='.repeat(80));

        schemaInfo.forEach((tableInfo, tableIndex) => {
            console.log(`\n${'─'.repeat(80)}`);
            console.log(`\n📊 TABLE ${tableIndex + 1}: ${tableInfo.tableName.toUpperCase()}`);
            console.log(`   Type: ${tableInfo.tableType}`);
            console.log(`\n   📋 COLUMNS (${tableInfo.columns.length}):`);
            
            tableInfo.columns.forEach((col, colIndex) => {
                let colInfo = `      ${colIndex + 1}. ${col.column_name}`;
                colInfo += ` [${col.data_type}`;
                if (col.character_maximum_length) {
                    colInfo += `(${col.character_maximum_length})`;
                }
                colInfo += `]`;
                
                if (tableInfo.primaryKeys.includes(col.column_name)) {
                    colInfo += ` 🔑 PRIMARY KEY`;
                }
                if (tableInfo.uniqueConstraints.includes(col.column_name)) {
                    colInfo += ` ✨ UNIQUE`;
                }
                if (col.is_nullable === 'NO') {
                    colInfo += ` ❌ NOT NULL`;
                }
                if (col.column_default) {
                    colInfo += ` ⚡ DEFAULT: ${col.column_default}`;
                }
                
                console.log(colInfo);
            });

            if (tableInfo.foreignKeys.length > 0) {
                console.log(`\n   🔗 FOREIGN KEYS (${tableInfo.foreignKeys.length}):`);
                tableInfo.foreignKeys.forEach((fk, fkIndex) => {
                    console.log(`      ${fkIndex + 1}. ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
                });
            }

            if (tableInfo.indexes.length > 0) {
                console.log(`\n   📇 INDEXES (${tableInfo.indexes.length}):`);
                tableInfo.indexes.forEach((idx, idxIndex) => {
                    console.log(`      ${idxIndex + 1}. ${idx.indexname}`);
                    console.log(`         ${idx.indexdef}`);
                });
            }
        });

        // Get relationships summary
        console.log('\n' + '='.repeat(80));
        console.log('🔗 TABLE RELATIONSHIPS');
        console.log('='.repeat(80));
        
        const allFKs = schemaInfo.flatMap(table => 
            table.foreignKeys.map(fk => ({
                fromTable: table.tableName,
                fromColumn: fk.column_name,
                toTable: fk.foreign_table_name,
                toColumn: fk.foreign_column_name
            }))
        );

        if (allFKs.length > 0) {
            allFKs.forEach((rel, index) => {
                console.log(`${index + 1}. ${rel.fromTable}.${rel.fromColumn} → ${rel.toTable}.${rel.toColumn}`);
            });
        } else {
            console.log('No foreign key relationships found.');
        }

        // Summary
        console.log('\n' + '='.repeat(80));
        console.log('📊 SCHEMA SUMMARY');
        console.log('='.repeat(80));
        console.log(`Database: ${database}`);
        console.log(`Tables: ${schemaInfo.filter(t => t.tableType === 'BASE TABLE').length}`);
        console.log(`Views: ${schemaInfo.filter(t => t.tableType === 'VIEW').length}`);
        console.log(`Total Columns: ${schemaInfo.reduce((sum, t) => sum + t.columns.length, 0)}`);
        console.log(`Total Foreign Keys: ${allFKs.length}`);
        console.log(`Total Indexes: ${schemaInfo.reduce((sum, t) => sum + t.indexes.length, 0)}`);
        console.log('='.repeat(80) + '\n');

        await client.end();
        return schemaInfo;
    } catch (error) {
        console.error('\n❌ ERROR FETCHING SCHEMA:', error.message);
        if (client) {
            await client.end();
        }
        throw error;
    }
};

export const createDatabase = async (req, res) => {
    try {
        const { name, host, port, database, username, password, url } = req.body;
        
        if (!name || !host || !port || !database || !username || !password) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        try {
            const schemaInfo=await fetchPostgreSQLSchema(host, port, database, username, password);
            console.log(schemaInfo);
        } catch (error) {
            console.error('Failed to fetch schema:', error);
        }

        const newDatabase = await db.insert(databases).values({
            userId: req.userId,
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
        const userDatabases = await db.select().from(databases).where(eq(databases.userId, req.userId));

        res.status(200).json({ databases: userDatabases });
    } catch (error) {
        console.error('Get databases error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getDatabaseById = async (req, res) => {
    try {
        const { id } = req.params;
        const database = await db.select().from(databases).where(
            and(
                eq(databases.id, parseInt(id)),
                eq(databases.userId, req.userId)
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
        const { id } = req.params;
        const deletedDatabase = await db.delete(databases).where(
            and(
                eq(databases.id, parseInt(id)),
                eq(databases.userId, req.userId)
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
