import { openai } from '../utils/openai.js';
import { index } from '../utils/pinecone.js';
import { generateSQLQuery } from '../lib/ai/sqlGenerator.js';
import { executeSQLQuery } from '../lib/db/executeQuery.js';

/**
 * Query the vector database, generate SQL, and execute it
 * Full pipeline: Vector DB → AI SQL Generation → SQL Execution → Results
 */
export const queryDatabase = async (req, res) => {
    try {
        // Get connectionId from URL params or body
        const connectionId = req.params.id || req.body.connectionId;
        const { question } = req.body;
        
        if (!question || !connectionId) {
            return res.status(400).json({ message: 'Question and connectionId are required' });
        }

        console.log(`\n💬 Query received for connection ${connectionId}: "${question}"`);

        // Step 1: Convert user question to embedding
        const questionEmbedding = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: question
        });

        const queryVector = questionEmbedding.data[0].embedding;
        console.log(`✅ Question embedding created (${queryVector.length} dimensions)`);

        // Step 2: Query Pinecone for similar schema embeddings
        const pineconeResult = await index.query({
            vector: queryVector,
            filter: { 
                connectionId: String(connectionId),
                type: 'schema'
            },
            topK: 15, // Get top 15 most relevant results
            includeMetadata: true
        });

        console.log(`📊 Found ${pineconeResult.matches?.length || 0} relevant schema matches`);

        // Step 3: Process and format results from vector DB
        const matches = pineconeResult.matches || [];
        
        // Group by table and extract relevant information
        const tableInfo = {};
        const relationships = [];

        matches.forEach((match) => {
            const metadata = match.metadata;
            const tableName = metadata.tableName;

            if (!tableName) return;

            if (!tableInfo[tableName]) {
                tableInfo[tableName] = {
                    tableName: tableName,
                    columns: [],
                    primaryKey: metadata.primaryKey,
                    score: match.score
                };
            }

            // Add column information
            if (metadata.columnName) {
                const columnInfo = {
                    name: metadata.columnName,
                    type: metadata.text?.match(/\[([^\]]+)\]/)?.[1] || 'unknown',
                    isForeignKey: metadata.isForeignKey || false,
                    relatedTable: metadata.relatedTable || null,
                    score: match.score
                };
                
                // Avoid duplicates
                if (!tableInfo[tableName].columns.find(c => c.name === columnInfo.name)) {
                    tableInfo[tableName].columns.push(columnInfo);
                }
            }

            // Collect relationship information
            if (metadata.relationshipType === 'foreign_key') {
                relationships.push({
                    fromTable: tableName,
                    toTable: metadata.relatedTable,
                    score: match.score
                });
            }
        });

        // Convert to array format
        const relevantTables = Object.values(tableInfo).map(table => ({
            tableName: table.tableName,
            primaryKey: table.primaryKey,
            columns: table.columns,
            relevanceScore: table.score
        }));

        // Step 4: Generate SQL query using AI
        let sqlQuery = null;
        let sqlExecutionResult = null;
        let response = '';

        if (relevantTables.length > 0) {
            try {
                console.log(`🤖 Generating SQL query based on ${relevantTables.length} relevant table(s)...`);
                sqlQuery = await generateSQLQuery(relevantTables, question);
                console.log(`✅ SQL Query generated: ${sqlQuery}`);

                // Step 5: Execute SQL query on the database
                console.log(`🔍 Executing SQL query on database...`);
                sqlExecutionResult = await executeSQLQuery(connectionId, sqlQuery);

                if (sqlExecutionResult.success) {
                    const rows = sqlExecutionResult.rows || [];
                    const rowCount = sqlExecutionResult.rowCount || 0;

                    console.log(`✅ Query executed successfully. Rows returned: ${rowCount}`);

                    // Format response with results
                    if (rowCount === 0) {
                        response = `I executed the query but found no results.\n\nQuery used:\n\`\`\`sql\n${sqlQuery}\n\`\`\`\n\nThis could mean:\n- The data doesn't exist in the database\n- The search criteria might need adjustment`;
                    } else {
                        response = `Query Results (${rowCount} row${rowCount !== 1 ? 's' : ''}):\n\n`;
                        
                        // Format first few rows for display
                        const displayRows = rows.slice(0, 10);
                        const columns = Object.keys(displayRows[0] || {});
                        
                        if (columns.length > 0) {
                            // Create a simple table format
                            response += 'Columns: ' + columns.join(', ') + '\n\n';
                            
                            displayRows.forEach((row, idx) => {
                                response += `Row ${idx + 1}:\n`;
                                columns.forEach(col => {
                                    response += `  ${col}: ${row[col]}\n`;
                                });
                                response += '\n';
                            });

                            if (rows.length > 10) {
                                response += `\n... and ${rows.length - 10} more row(s)\n`;
                            }
                        }

                        response += `\nSQL Query used:\n\`\`\`sql\n${sqlQuery}\n\`\`\``;
                    }
                } else {
                    // SQL execution failed
                    response = `I generated a SQL query but encountered an error executing it:\n\nError: ${sqlExecutionResult.error}\n\nGenerated Query:\n\`\`\`sql\n${sqlQuery}\n\`\`\`\n\nPlease try rephrasing your question.`;
                }
            } catch (sqlError) {
                console.error('Error in SQL generation/execution:', sqlError);
                // Fallback to schema-only response
                response = `I found relevant schema information but couldn't generate a query:\n\n${sqlError.message}\n\nRelevant Tables:\n`;
                relevantTables.forEach((table, index) => {
                    response += `${index + 1}. ${table.tableName} (PK: ${table.primaryKey})\n`;
                });
            }
        } else {
            // No relevant tables found
            response = `I couldn't find specific information related to "${question}" in the database schema.\n\nTry asking about:\n- Table names\n- Column names\n- Relationships between tables\n- Specific data types`;
        }

        console.log(`✅ Response generated for connection ${connectionId}`);

        res.status(200).json({
            response,
            relevantTables,
            relationships,
            matchesCount: matches.length,
            sqlQuery: sqlQuery || null,
            queryResult: sqlExecutionResult?.success ? {
                rowCount: sqlExecutionResult.rowCount,
                rows: sqlExecutionResult.rows?.slice(0, 50) // Limit response size
            } : null,
            error: sqlExecutionResult?.success === false ? sqlExecutionResult.error : null
        });

    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ 
            message: 'Error querying database',
            error: error.message 
        });
    }
};

