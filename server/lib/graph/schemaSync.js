import { driver } from '../../utils/neo4j.js';

const NEO4J_DB = process.env.NEO4J_DATABASE || 'neo4j';

/**
 * Push database schema to Neo4j graph database
 * Creates nodes for tables and columns, with relationships
 * Uses batch processing to avoid overwhelming the instance
 */
export const syncSchemaToGraph = async (schemaInfo, connectionData) => {
    try {
        if (!driver) {
            console.warn('⚠️  Neo4j driver not available, skipping schema sync');
            return;
        }
        
        console.log(`\n🕸️  Starting schema sync to Neo4j for connection: ${connectionData.name} (ID: ${connectionData.id})`);
        
        const connectionId = String(connectionData.id);
        const batchSize = 5; // Process 5 tables at a time to avoid overwhelming
        
        // Process tables in batches
        for (let i = 0; i < schemaInfo.length; i += batchSize) {
            const batch = schemaInfo.slice(i, i + batchSize);
            console.log(`   📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(schemaInfo.length / batchSize)} (${batch.length} tables)...`);
            
            for (const tableInfo of batch) {
                await syncTableToGraph(tableInfo, connectionId, connectionData);
            }
            
            // Small delay between batches to avoid overwhelming Neo4j
            if (i + batchSize < schemaInfo.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        console.log(`✅ Schema sync completed for connection ${connectionData.id}`);
    } catch (error) {
        console.error('Error syncing schema to Neo4j:', error);
        // Don't throw - schema sync failure shouldn't break embedding creation
    }
};

/**
 * Sync a single table and its columns to Neo4j
 */
async function syncTableToGraph(tableInfo, connectionId, connectionData) {
    try {
        // Create or update Table node
        await driver.executeQuery(`
            MERGE (t:Table {connectionId: $connectionId, tableName: $tableName})
            SET t.primaryKey = $primaryKey,
                t.tableType = $tableType,
                t.connectionName = $connectionName,
                t.dbType = $dbType
        `, {
            connectionId,
            tableName: tableInfo.tableName,
            primaryKey: tableInfo.primaryKeys[0] || null,
            tableType: tableInfo.tableType,
            connectionName: connectionData.name,
            dbType: connectionData.dbType || 'postgresql'
        }, {
            database: NEO4J_DB
        });

        // Analyze table schema using actual schema data (indexes, constraints, data types) - no hardcoded patterns
        const columnAnalysis = analyzeTableColumns(tableInfo);
        
        // Process columns in smaller batches
        const columnBatchSize = 15; // Smaller batches to avoid overwhelming
        for (let i = 0; i < tableInfo.columns.length; i += columnBatchSize) {
            const columnBatch = tableInfo.columns.slice(i, i + columnBatchSize);
            
            for (const column of columnBatch) {
                // Get rule-based column type analysis
                const analyzedColumn = columnAnalysis.find(c => c.columnName === column.column_name);
                const columnType = analyzedColumn?.columnType || 'attribute';
                const semanticRelationships = analyzedColumn?.semanticRelationships || [];

                const fk = tableInfo.foreignKeys.find(fk => fk.column_name === column.column_name);

                // Create or update Column node
                await driver.executeQuery(`
                    MERGE (c:Column {connectionId: $connectionId, tableName: $tableName, columnName: $columnName})
                    SET c.dataType = $dataType,
                        c.isPrimaryKey = $isPrimaryKey,
                        c.isForeignKey = $isForeignKey,
                        c.isNullable = $isNullable,
                        c.columnType = $columnType,
                        c.relatedTable = $relatedTable
                `, {
                    connectionId,
                    tableName: tableInfo.tableName,
                    columnName: column.column_name,
                    dataType: column.data_type,
                    isPrimaryKey: tableInfo.primaryKeys.includes(column.column_name),
                    isForeignKey: !!fk,
                    isNullable: column.is_nullable === 'YES',
                    columnType,
                    relatedTable: fk?.foreign_table_name || null
                }, {
                    database: NEO4J_DB
                });

                // Create HAS_COLUMN relationship
                await driver.executeQuery(`
                    MATCH (t:Table {connectionId: $connectionId, tableName: $tableName})
                    MATCH (c:Column {connectionId: $connectionId, tableName: $tableName, columnName: $columnName})
                    MERGE (t)-[:HAS_COLUMN]->(c)
                `, {
                    connectionId,
                    tableName: tableInfo.tableName,
                    columnName: column.column_name
                }, {
                    database: NEO4J_DB
                });

                // Create FOREIGN_KEY relationships
                if (fk) {
                    await driver.executeQuery(`
                        MATCH (c1:Column {connectionId: $connectionId, tableName: $tableName, columnName: $columnName})
                        MATCH (c2:Column {connectionId: $connectionId, tableName: $relatedTable, columnName: $relatedColumn})
                        MERGE (c1)-[:FOREIGN_KEY {fromColumn: $columnName, toColumn: $relatedColumn}]->(c2)
                    `, {
                        connectionId,
                        tableName: tableInfo.tableName,
                        columnName: column.column_name,
                        relatedTable: fk.foreign_table_name,
                        relatedColumn: fk.foreign_column_name
                    }, {
                        database: NEO4J_DB
                    });
                }

                // Create SEMANTICALLY_RELATED relationships based on rule-based analysis
                for (const relatedColumnName of semanticRelationships) {
                    // Verify the related column exists in this table
                    const relatedCol = tableInfo.columns.find(col => col.column_name === relatedColumnName);
                    if (relatedCol && relatedCol.column_name !== column.column_name) {
                        await driver.executeQuery(`
                            MATCH (c1:Column {connectionId: $connectionId, tableName: $tableName, columnName: $columnName})
                            MATCH (c2:Column {connectionId: $connectionId, tableName: $tableName, columnName: $relatedColumnName})
                            MERGE (c1)-[:SEMANTICALLY_RELATED]->(c2)
                        `, {
                            connectionId,
                            tableName: tableInfo.tableName,
                            columnName: column.column_name,
                            relatedColumnName: relatedCol.column_name
                        }, {
                            database: NEO4J_DB
                        });
                    }
                }
            }
        }

        console.log(`      ✅ Synced table: ${tableInfo.tableName} (${tableInfo.columns.length} columns)`);
    } catch (error) {
        console.error(`      ❌ Error syncing table ${tableInfo.tableName}:`, error);
    }
}

/**
 * Data-driven analysis of table columns using actual schema information
 * Uses indexes, constraints, data types, and schema patterns - no hardcoded rules
 */
function analyzeTableColumns(tableInfo) {
    const analysis = [];
    const columnMap = new Map();
    
    // Build column map and extract index information
    const columnsInIndexes = new Map(); // column -> Set of other columns in same indexes
    const columnsInUniqueConstraints = new Map(); // column -> Set of other columns in same unique constraints
    
    // Parse indexes to find columns that are indexed together
    for (const index of tableInfo.indexes) {
        const indexDef = index.indexdef.toLowerCase();
        const columnsInIndex = extractColumnsFromIndex(indexDef, tableInfo.columns);
        
        // All columns in this index are related to each other
        for (let i = 0; i < columnsInIndex.length; i++) {
            const col1 = columnsInIndex[i];
            if (!columnsInIndexes.has(col1)) {
                columnsInIndexes.set(col1, new Set());
            }
            for (let j = i + 1; j < columnsInIndex.length; j++) {
                const col2 = columnsInIndex[j];
                columnsInIndexes.get(col1).add(col2);
                if (!columnsInIndexes.has(col2)) {
                    columnsInIndexes.set(col2, new Set());
                }
                columnsInIndexes.get(col2).add(col1);
            }
        }
    }
    
    // Parse unique constraints to find columns that are unique together
    // (Note: unique constraints are already extracted, but composite unique constraints
    // would need additional parsing - for now we use the fact that they're in uniqueConstraints array)
    
    // First pass: determine column types based on actual schema data
    for (const column of tableInfo.columns) {
        const dataType = column.data_type.toLowerCase();
        const isPrimaryKey = tableInfo.primaryKeys.includes(column.column_name);
        const isForeignKey = tableInfo.foreignKeys.some(fk => fk.column_name === column.column_name);
        const isUnique = tableInfo.uniqueConstraints.includes(column.column_name);
        const charLength = column.character_maximum_length ? parseInt(column.character_maximum_length) : 0;
        
        let columnType = 'attribute'; // default
        
        // Use actual constraints to determine type
        if (isPrimaryKey || isForeignKey) {
            columnType = 'identifier';
        } else if (isUnique && (dataType.includes('varchar') || dataType.includes('text') || dataType.includes('char'))) {
            // Unique text fields are often identifiers
            columnType = 'identifier';
        } else if (dataType.includes('uuid') || dataType.includes('guid')) {
            columnType = 'identifier';
        } else if (dataType.includes('text') || (charLength > 1000)) {
            // Long text fields are typically descriptions
            columnType = 'description';
        } else if (charLength > 0 && charLength <= 100 && 
                   (dataType.includes('varchar') || dataType.includes('char')) &&
                   !isUnique) {
            // Short non-unique varchar might be identifier-like
            columnType = 'identifier';
        }
        
        analysis.push({
            columnName: column.column_name,
            columnType,
            semanticRelationships: []
        });
        
        columnMap.set(column.column_name, { column, columnType });
    }
    
    // Second pass: find semantic relationships using actual schema data
    for (let i = 0; i < analysis.length; i++) {
        const current = analysis[i];
        const currentCol = columnMap.get(current.columnName);
        const relationships = new Set();
        
        for (let j = 0; j < analysis.length; j++) {
            if (i === j) continue;
            
            const other = analysis[j];
            const otherCol = columnMap.get(other.columnName);
            
            // 1. Columns in the same index are strongly related
            if (columnsInIndexes.has(current.columnName) && 
                columnsInIndexes.get(current.columnName).has(other.columnName)) {
                relationships.add(other.columnName);
                continue;
            }
            
            // 2. Columns that are part of composite primary key together
            if (tableInfo.primaryKeys.length > 1 && 
                tableInfo.primaryKeys.includes(current.columnName) &&
                tableInfo.primaryKeys.includes(other.columnName)) {
                relationships.add(other.columnName);
                continue;
            }
            
            // 3. Adjacent columns (by ordinal position) with same data type are often related
            const posDiff = Math.abs(currentCol.column.ordinal_position - otherCol.column.ordinal_position);
            if (posDiff === 1 && currentCol.column.data_type === otherCol.column.data_type) {
                relationships.add(other.columnName);
                continue;
            }
            
            // 4. Columns with same data type and similar naming (learned from schema)
            if (currentCol.column.data_type === otherCol.column.data_type &&
                areNamesSimilar(current.columnName, other.columnName)) {
                relationships.add(other.columnName);
                continue;
            }
            
            // 5. Foreign key relationships (already handled separately, but can add semantic link)
            const isCurrentFK = tableInfo.foreignKeys.some(fk => fk.column_name === current.columnName);
            const isOtherFK = tableInfo.foreignKeys.some(fk => fk.column_name === other.columnName);
            if (isCurrentFK && isOtherFK && 
                currentCol.column.data_type === otherCol.column.data_type) {
                // Two foreign keys of same type might be related
                relationships.add(other.columnName);
                continue;
            }
        }
        
        current.semanticRelationships = Array.from(relationships);
    }
    
    console.log(`      📊 Schema-driven analysis: ${analysis.length} columns for table ${tableInfo.tableName}`);
    return analysis;
}

/**
 * Extract column names from an index definition
 */
function extractColumnsFromIndex(indexDef, allColumns) {
    const columns = [];
    const colNames = allColumns.map(c => c.column_name.toLowerCase());
    
    // Try to find column names in the index definition
    // Index definitions typically look like: CREATE INDEX ... ON table (col1, col2, ...)
    const match = indexDef.match(/\(([^)]+)\)/);
    if (match) {
        const colList = match[1];
        // Split by comma and clean up
        const potentialCols = colList.split(',').map(c => c.trim().toLowerCase().replace(/["']/g, ''));
        
        for (const potentialCol of potentialCols) {
            // Remove function calls, operators, etc. - just get the column name
            const cleanCol = potentialCol.split('(')[0].split(' ')[0].split('::')[0].trim();
            
            // Check if this matches any actual column name
            const foundCol = colNames.find(cn => cn === cleanCol || cn.includes(cleanCol) || cleanCol.includes(cn));
            if (foundCol) {
                const actualCol = allColumns.find(c => c.column_name.toLowerCase() === foundCol);
                if (actualCol && !columns.includes(actualCol.column_name)) {
                    columns.push(actualCol.column_name);
                }
            }
        }
    }
    
    return columns;
}

/**
 * Check if two column names are similar based on common patterns learned from schema
 */
function areNamesSimilar(name1, name2) {
    const n1 = name1.toLowerCase();
    const n2 = name2.toLowerCase();
    
    // Same base name with different suffixes/prefixes
    const parts1 = n1.split('_');
    const parts2 = n2.split('_');
    
    // Check if they share common parts
    const commonParts = parts1.filter(p => parts2.includes(p) && p.length > 2);
    if (commonParts.length > 0 && commonParts.length >= Math.min(parts1.length, parts2.length) - 1) {
        return true;
    }
    
    // Check for common prefixes
    if (parts1.length > 1 && parts2.length > 1) {
        const prefix1 = parts1[0];
        const prefix2 = parts2[0];
        if (prefix1 === prefix2 && prefix1.length > 2) {
            return true;
        }
    }
    
    // Check for common suffixes
    if (parts1.length > 1 && parts2.length > 1) {
        const suffix1 = parts1[parts1.length - 1];
        const suffix2 = parts2[parts2.length - 1];
        if (suffix1 === suffix2 && suffix1.length > 2) {
            return true;
        }
    }
    
    // Simple similarity check - if names are very similar
    const longer = n1.length > n2.length ? n1 : n2;
    const shorter = n1.length > n2.length ? n2 : n1;
    if (longer.includes(shorter) && shorter.length > 3) {
        return true;
    }
    
    return false;
}

