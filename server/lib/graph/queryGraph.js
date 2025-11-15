import { driver } from '../../utils/neo4j.js';

const NEO4J_DB = process.env.NEO4J_DATABASE || 'neo4j';

/**
 * Query Neo4j graph to find relevant columns based on Pinecone results
 * Uses graph traversal to discover related columns that should be included
 */
export const discoverColumnsFromGraph = async (connectionId, relevantTables, userQuery) => {
    try {
        if (!driver) {
            console.warn('⚠️  Neo4j driver not available, using Pinecone results only');
            return relevantTables;
        }
        
        console.log(`\n🕸️  Starting graph discovery for connection ${connectionId}...`);
        console.log(`   📊 Analyzing ${relevantTables.length} table(s) from Pinecone results`);
        
        const queryLower = userQuery.toLowerCase();
        const needsIdentifiers = queryLower.includes('who') || queryLower.includes('user') || 
                                queryLower.includes('person') || queryLower.includes('people');
        
        if (needsIdentifiers) {
            console.log(`   🔍 Query requires identifier columns (who/user/person detected)`);
        }
        
        const discoveredColumns = new Map(); // tableName -> columns array
        
        // For each relevant table from Pinecone
        for (const table of relevantTables) {
            const tableName = table.tableName;
            const existingColumns = table.columns?.map(c => c.name) || [];
            
            console.log(`\n   📋 Processing table: ${tableName}`);
            console.log(`      📌 Existing columns from Pinecone: ${existingColumns.length} (${existingColumns.join(', ') || 'none'})`);
            
            // Query graph for additional columns to include
            // Find: existing columns, identifier columns (if needed), and semantically related columns
            console.log(`      🔎 Querying Neo4j graph for related columns...`);
            
            // Build the Cypher query with parameters
            const cypherQuery = `
                MATCH (t:Table {connectionId: $connectionId, tableName: $tableName})-[:HAS_COLUMN]->(c:Column)
                OPTIONAL MATCH (c)-[:SEMANTICALLY_RELATED]->(related:Column {connectionId: $connectionId, tableName: $tableName})
                WHERE c.columnName IN $existingColumns 
                   OR ($needsIdentifiers AND c.columnType = 'identifier')
                   OR (related IS NOT NULL AND related.columnName IN $existingColumns)
                WITH DISTINCT c, 
                     CASE WHEN c.columnName IN $existingColumns THEN 0 ELSE 1 END AS isExisting,
                     CASE WHEN c.columnType = 'identifier' THEN 0 ELSE 1 END AS isIdentifier
                RETURN c.columnName AS columnName, 
                       c.dataType AS dataType,
                       c.columnType AS columnType,
                       c.isPrimaryKey AS isPrimaryKey,
                       c.isForeignKey AS isForeignKey,
                       c.relatedTable AS relatedTable
                ORDER BY isExisting, isIdentifier, c.columnName
            `;
            
            const queryParams = {
                connectionId: String(connectionId),
                tableName,
                existingColumns,
                needsIdentifiers
            };
            
            console.log(`      📝 Query Parameters:`);
            console.log(`         - connectionId: ${queryParams.connectionId}`);
            console.log(`         - tableName: ${queryParams.tableName}`);
            console.log(`         - existingColumns: [${existingColumns.length} columns] ${existingColumns.slice(0, 5).join(', ')}${existingColumns.length > 5 ? '...' : ''}`);
            console.log(`         - needsIdentifiers: ${needsIdentifiers}`);
            console.log(`      🔍 Query Logic:`);
            console.log(`         1. Find columns that match existing columns from Pinecone`);
            if (needsIdentifiers) {
                console.log(`         2. Include ALL identifier columns (columnType = 'identifier')`);
            }
            console.log(`         3. Include columns semantically related to existing columns`);
            console.log(`         4. Order by: existing first, then identifiers, then alphabetically`);
            console.log(`      📄 Cypher Query (simplified):`);
            console.log(`         MATCH (t:Table {connectionId: "${connectionId}", tableName: "${tableName}"})-[:HAS_COLUMN]->(c:Column)`);
            console.log(`         OPTIONAL MATCH (c)-[:SEMANTICALLY_RELATED]->(related:Column)`);
            console.log(`         WHERE c.columnName IN [${existingColumns.slice(0, 3).join(', ')}${existingColumns.length > 3 ? '...' : ''}]`);
            if (needsIdentifiers) {
                console.log(`            OR c.columnType = 'identifier'`);
            }
            console.log(`            OR related.columnName IN existing columns`);
            console.log(`         RETURN c.columnName, c.dataType, c.columnType, ...`);
            
            const result = await driver.executeQuery(cypherQuery, queryParams, {
                database: NEO4J_DB
            });
            
            console.log(`      ✅ Graph query returned ${result.records.length} column(s)`);
            
            const columns = [];
            const seenColumns = new Set();
            const newColumns = [];
            const existingColumnsFound = [];
            
            for (const record of result.records) {
                const columnName = record.get('columnName');
                
                // Avoid duplicates
                if (seenColumns.has(columnName)) continue;
                seenColumns.add(columnName);
                
                const columnInfo = {
                    name: columnName,
                    type: record.get('dataType') || 'unknown',
                    columnType: record.get('columnType') || 'attribute',
                    isPrimaryKey: record.get('isPrimaryKey') || false,
                    isForeignKey: record.get('isForeignKey') || false,
                    relatedTable: record.get('relatedTable')
                };
                
                // Check if this column already exists in the table's columns
                const existingCol = table.columns?.find(c => c.name === columnName);
                if (existingCol) {
                    // Merge with existing info, preserving original data
                    columns.push({
                        ...existingCol,
                        ...columnInfo
                    });
                    existingColumnsFound.push(columnName);
                } else {
                    // New column discovered from graph
                    columns.push(columnInfo);
                    newColumns.push({
                        name: columnName,
                        type: columnInfo.columnType,
                        isFK: columnInfo.isForeignKey,
                        relatedTable: columnInfo.relatedTable
                    });
                }
            }
            
            if (existingColumnsFound.length > 0) {
                console.log(`      ✓ Found ${existingColumnsFound.length} existing column(s) in graph`);
            }
            
            if (newColumns.length > 0) {
                console.log(`      ✨ Discovered ${newColumns.length} new column(s) from graph:`);
                newColumns.forEach(col => {
                    const details = [
                        `type:${col.type}`,
                        col.isFK ? `FK→${col.relatedTable}` : '',
                        col.type === 'identifier' ? 'identifier' : ''
                    ].filter(Boolean).join(', ');
                    console.log(`         - ${col.name} (${details})`);
                });
            } else {
                console.log(`      ℹ️  No new columns discovered for this table`);
            }
            
            if (columns.length > 0) {
                discoveredColumns.set(tableName, columns);
                console.log(`      📊 Total columns after graph discovery: ${columns.length} (${existingColumns.length} original + ${newColumns.length} new)`);
            }
        }
        
        // Merge discovered columns back into relevant tables
        console.log(`\n   🔄 Merging discovered columns into table definitions...`);
        const enhancedTables = relevantTables.map(table => {
            const discovered = discoveredColumns.get(table.tableName);
            const originalColumnCount = table.columns?.length || 0;
            
            if (discovered && discovered.length >= originalColumnCount) {
                return {
                    ...table,
                    columns: discovered
                };
            }
            return table;
        });
        
        const enhancedCount = enhancedTables.filter(t => {
            const discovered = discoveredColumns.get(t.tableName);
            const originalCount = relevantTables.find(rt => rt.tableName === t.tableName)?.columns?.length || 0;
            return discovered && discovered.length > originalCount;
        }).length;
        
        const totalNewColumns = enhancedTables.reduce((sum, table) => {
            const discovered = discoveredColumns.get(table.tableName);
            const originalCount = relevantTables.find(rt => rt.tableName === table.tableName)?.columns?.length || 0;
            return sum + (discovered ? Math.max(0, discovered.length - originalCount) : 0);
        }, 0);
        
        console.log(`\n   📈 Graph Discovery Summary:`);
        console.log(`      - Tables processed: ${relevantTables.length}`);
        console.log(`      - Tables enhanced: ${enhancedCount}`);
        console.log(`      - New columns discovered: ${totalNewColumns}`);
        console.log(`🕸️  Graph discovery: Enhanced ${enhancedCount} table(s) with ${totalNewColumns} related column(s)`);
        
        return enhancedTables;
    } catch (error) {
        console.error('❌ Error querying Neo4j graph:', error);
        console.error(`   Connection ID: ${connectionId}`);
        console.error(`   Error details:`, error.message);
        // Return original tables if graph query fails
        return relevantTables;
    }
}

