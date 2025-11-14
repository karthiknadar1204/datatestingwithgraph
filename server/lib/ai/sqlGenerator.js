import { openai } from '../../utils/openai.js';

/**
 * Generate SQL query using OpenAI based on schema and user query
 * @param {Array} relevantTables The relevant tables from vector DB
 * @param {string} userQuery The original user query
 * @returns {Promise<string>} The generated SQL query
 */
export async function generateSQLQuery(relevantTables, userQuery) {
    try {
        // Build schema analysis from relevant tables
        const schemaAnalysis = {};

        relevantTables.forEach(table => {
            const columns = table.columns || [];
            const foreignKeys = columns.filter(col => col.isForeignKey);

            schemaAnalysis[table.tableName] = {
                primaryKey: table.primaryKey,
                columns: columns.map(col => ({
                    name: col.name,
                    type: col.type || 'unknown',
                    isForeignKey: col.isForeignKey,
                    relatedTable: col.relatedTable
                })),
                foreignKeys: foreignKeys.map(fk => ({
                    name: fk.name,
                    referencesTable: fk.relatedTable
                }))
            };
        });

        // Build relationships map
        const relationships = [];
        relevantTables.forEach(table => {
            table.columns?.forEach(col => {
                if (col.isForeignKey && col.relatedTable) {
                    relationships.push({
                        fromTable: table.tableName,
                        fromColumn: col.name,
                        toTable: col.relatedTable,
                        toColumn: 'id' // Assuming FK references id, could be improved
                    });
                }
            });
        });

        const prompt = `Given the following database schema and user query, generate a SQL query to answer the question.

IMPORTANT RULES:
1. Always use double quotes around table and column names in PostgreSQL
2. Use ILIKE for case-insensitive text matching
3. When searching for names or text, use ILIKE with wildcards: column ILIKE '%term%'
4. Use appropriate JOINs based on the schema relationships
5. Use table aliases for better readability
6. Only include necessary columns in the SELECT clause
7. DO NOT use LIMIT unless specifically asked in the user query
8. Ensure all quotes are properly closed
9. Use proper PostgreSQL syntax

Schema:
${Object.entries(schemaAnalysis).map(([tableName, analysis]) => `
Table: "${tableName}"
- Primary Key: ${analysis.primaryKey || 'None'}
- Foreign Keys: ${analysis.foreignKeys.map(fk => `${fk.name} → ${fk.referencesTable}`).join(', ') || 'None'}
- Columns: ${analysis.columns.map(col => `${col.name} (${col.type})${col.isForeignKey ? ' [FK]' : ''}`).join(', ')}
`).join('\n')}

Relationships:
${relationships.map(rel => `- "${rel.fromTable}"."${rel.fromColumn}" → "${rel.toTable}"."${rel.toColumn}"`).join('\n') || 'None'}

User Query: ${userQuery}

Generate ONLY the SQL query without any explanation or markdown formatting.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a SQL expert. Generate only the SQL query without any explanation, markdown, or additional text.
                    
Rules:
1. Use double quotes for PostgreSQL identifiers
2. Use ILIKE for text searches
3. Use proper JOINs for relationships
4. No LIMIT unless requested
5. Ensure all quotes are balanced and closed`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.1,
            max_tokens: 500
        });

        if (!response.choices?.[0]?.message?.content) {
            throw new Error('No response content from OpenAI');
        }

        let sqlQuery = response.choices[0].message.content.trim();

        // Remove markdown code blocks if present
        sqlQuery = sqlQuery.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim();

        // Validate the generated SQL query
        if (!sqlQuery.toUpperCase().includes('SELECT')) {
            throw new Error('Generated query must include SELECT statement');
        }

        console.log(`✅ Generated SQL query: ${sqlQuery.substring(0, 100)}...`);

        return sqlQuery;
    } catch (error) {
        console.error('Error generating SQL query:', error);
        throw new Error(`Failed to generate SQL query: ${error.message}`);
    }
}

