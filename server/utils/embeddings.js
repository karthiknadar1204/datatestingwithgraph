import { openai } from './openai.js';
import { index } from './pinecone.js';
import { generatePKColumnPairText, generateRelationshipText } from './schemaTextGenerator.js';
import { syncSchemaToGraph } from '../lib/graph/schemaSync.js';

/**
 * Estimate token count (rough approximation: ~4 characters = 1 token)
 */
const estimateTokens = (text) => {
    return Math.ceil(text.length / 4);
};

/**
 * Batch texts together up to maxTokens limit
 */
const batchTextsByTokenLimit = (texts, maxTokens = 4000) => {
    const batches = [];
    let currentBatch = [];
    let currentBatchTokens = 0;
    
    for (const text of texts) {
        const textTokens = estimateTokens(text);
        
        // If single text exceeds limit, add it as its own batch
        if (textTokens > maxTokens) {
            if (currentBatch.length > 0) {
                batches.push(currentBatch);
                currentBatch = [];
                currentBatchTokens = 0;
            }
            batches.push([text]);
            continue;
        }
        
        // If adding this text would exceed limit, start new batch
        if (currentBatchTokens + textTokens > maxTokens && currentBatch.length > 0) {
            batches.push(currentBatch);
            currentBatch = [text];
            currentBatchTokens = textTokens;
        } else {
            currentBatch.push(text);
            currentBatchTokens += textTokens;
        }
    }
    
    // Add remaining batch
    if (currentBatch.length > 0) {
        batches.push(currentBatch);
    }
    
    return batches;
};

/**
 * Generator function to create and yield embeddings for schema columns
 */
async function* generateColumnEmbeddings(tableInfo, connectionData, primaryKeyColumn, primaryKeyName) {
    // Prepare all column texts first
    const columnTexts = [];
    const columnMetadata = [];
    
    for (let i = 0; i < tableInfo.columns.length; i++) {
        const column = tableInfo.columns[i];
        const pairText = generatePKColumnPairText(tableInfo, column, primaryKeyColumn);
        const fk = tableInfo.foreignKeys.find(f => f.column_name === column.column_name);
        
        columnTexts.push(pairText);
        columnMetadata.push({
            columnIndex: i,
            column: column,
            text: pairText,
            fk: fk
        });
    }
    
    // Batch texts by 4k token limit
    const textBatches = batchTextsByTokenLimit(columnTexts, 4000);
    console.log(`   📦 Batching into ${textBatches.length} OpenAI API call(s) (4k token limit per batch)...`);
    
    let columnIndex = 0;
    
    // Process each batch
    for (let batchIdx = 0; batchIdx < textBatches.length; batchIdx++) {
        const textBatch = textBatches[batchIdx];
        const batchTokens = textBatch.reduce((sum, text) => sum + estimateTokens(text), 0);
        
        console.log(`   📝 Batch ${batchIdx + 1}/${textBatches.length}: ${textBatch.length} column(s), ~${batchTokens} tokens`);
        
        // Create embeddings for batch
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: textBatch
        });
        
        console.log(`      ✅ Embeddings created (${embeddingResponse.data.length} embeddings, ${embeddingResponse.data[0].embedding.length} dimensions each)`);
        
        // Map embeddings back to columns and yield
        for (let i = 0; i < textBatch.length; i++) {
            const embedding = embeddingResponse.data[i].embedding;
            const metadata = columnMetadata[columnIndex];
            
            console.log(`      📝 [${columnIndex}] Column: ${metadata.column.column_name} [${metadata.column.data_type}]`);
            
            const embedMetadata = {
                connectionId: String(connectionData.id),
                connectionName: connectionData.name,
                dbType: connectionData.dbType || 'postgresql',
                tableName: tableInfo.tableName,
                columnName: metadata.column.column_name,
                primaryKey: primaryKeyName,
                text: metadata.text,
                type: 'schema'
            };
            
            if (metadata.fk) {
                embedMetadata.relatedTable = metadata.fk.foreign_table_name;
                embedMetadata.isForeignKey = true;
            }
            
            yield {
                id: `schema-${connectionData.id}-${tableInfo.tableName}-${columnIndex}`,
                values: embedding,
                metadata: embedMetadata
            };
            
            columnIndex++;
        }
    }
}

/**
 * Generator function to create and yield embeddings for relationships
 */
async function* generateRelationshipEmbeddings(tableInfo, connectionData, schemaInfo, columnIndex) {
    if (tableInfo.foreignKeys.length === 0) {
        return;
    }
    
    // Prepare relationship texts with their corresponding FK objects
    const relationshipData = [];
    
    for (const fk of tableInfo.foreignKeys) {
        const relationshipText = generateRelationshipText(tableInfo, fk, schemaInfo);
        relationshipData.push({
            text: relationshipText,
            fk: fk
        });
    }
    
    // Extract texts for batching (preserving order)
    const relationshipTexts = relationshipData.map(rd => rd.text);
    
    // Batch relationship texts by 4k token limit
    const relationshipTextBatches = batchTextsByTokenLimit(relationshipTexts, 4000);
    let relationshipIndex = columnIndex;
    let relationshipDataOffset = 0;
    
    // Process each batch
    for (let batchIdx = 0; batchIdx < relationshipTextBatches.length; batchIdx++) {
        const textBatch = relationshipTextBatches[batchIdx];
        const batchTokens = textBatch.reduce((sum, text) => sum + estimateTokens(text), 0);
        
        console.log(`   📝 Relationship batch ${batchIdx + 1}/${relationshipTextBatches.length}: ${textBatch.length} relationship(s), ~${batchTokens} tokens`);
        
        // Create embeddings for batch
        const relationshipEmbeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: textBatch
        });
        
        console.log(`      ✅ Relationship embeddings created (${relationshipEmbeddingResponse.data.length} embeddings)`);
        
        // Map embeddings back to relationships and yield
        for (let i = 0; i < textBatch.length; i++) {
            const relationshipDataItem = relationshipData[relationshipDataOffset + i];
            const fk = relationshipDataItem.fk;
            const relationshipEmbedding = relationshipEmbeddingResponse.data[i].embedding;
            const relationshipText = textBatch[i];
            
            console.log(`      📝 [${relationshipIndex}] Relationship: ${tableInfo.tableName}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
            
            yield {
                id: `schema-${connectionData.id}-${tableInfo.tableName}-${relationshipIndex}`,
                values: relationshipEmbedding,
                metadata: {
                    connectionId: String(connectionData.id),
                    connectionName: connectionData.name,
                    dbType: connectionData.dbType || 'postgresql',
                    tableName: tableInfo.tableName,
                    relatedTable: fk.foreign_table_name,
                    relationshipType: 'foreign_key',
                    text: relationshipText,
                    type: 'schema'
                }
            };
            
            relationshipIndex++;
        }
        
        relationshipDataOffset += textBatch.length;
    }
}

export const createSchemaEmbeddings = async (schemaInfo, connectionData) => {
    try {
        console.log(`\n🚀 Starting schema embedding creation for connection: ${connectionData.name} (ID: ${connectionData.id})`);
        console.log(`📊 Processing ${schemaInfo.length} table(s)...\n`);
        
        const PINECONE_BATCH_SIZE = 10;
        let totalTablesProcessed = 0;
        let totalColumnsProcessed = 0;
        let totalRelationshipsProcessed = 0;
        let batchCount = 0;
        let batch = [];
        
        // Process each table using generator pattern
        for (const tableInfo of schemaInfo) {
            console.log(`\n📋 Processing table: ${tableInfo.tableName} (${tableInfo.tableType})`);
            console.log(`   Columns: ${tableInfo.columns.length}, Foreign Keys: ${tableInfo.foreignKeys.length}`);
            
            // Get primary key column(s) - use first PK if multiple exist
            const primaryKeyName = tableInfo.primaryKeys.length > 0 
                ? tableInfo.primaryKeys[0] 
                : null;
            
            if (!primaryKeyName) {
                console.warn(`⚠️  Table ${tableInfo.tableName} has no primary key, skipping column pair embeddings`);
                continue;
            }
            
            const primaryKeyColumn = tableInfo.columns.find(c => c.column_name === primaryKeyName);
            if (!primaryKeyColumn) {
                console.warn(`⚠️  Primary key column ${primaryKeyName} not found in columns for ${tableInfo.tableName}`);
                continue;
            }
            
            console.log(`   Primary Key: ${primaryKeyName}`);
            console.log(`   Creating ${tableInfo.columns.length} column embeddings...`);
            
            // Process column embeddings using generator
            let columnIndex = 0;
            for await (const embeddingData of generateColumnEmbeddings(tableInfo, connectionData, primaryKeyColumn, primaryKeyName)) {
                batch.push(embeddingData);
                totalColumnsProcessed++;
                columnIndex++;
                
                // Upsert in batches to Pinecone
                if (batch.length >= PINECONE_BATCH_SIZE) {
                    await index.upsert(batch);
                    batchCount++;
                    console.log(`   📦 Upserted batch ${batchCount} with ${batch.length} embeddings to Pinecone`);
                    batch = [];
                }
            }
            
            console.log(`   ✅ Completed ${tableInfo.columns.length} column embeddings for ${tableInfo.tableName}`);
            
            // Process relationship embeddings using generator
            if (tableInfo.foreignKeys.length > 0) {
                console.log(`   🔗 Creating ${tableInfo.foreignKeys.length} relationship embedding(s)...`);
                
                for await (const embeddingData of generateRelationshipEmbeddings(tableInfo, connectionData, schemaInfo, columnIndex)) {
                    batch.push(embeddingData);
                    totalRelationshipsProcessed++;
                    
                    // Upsert in batches to Pinecone
                    if (batch.length >= PINECONE_BATCH_SIZE) {
                        await index.upsert(batch);
                        batchCount++;
                        console.log(`   📦 Upserted batch ${batchCount} with ${batch.length} embeddings to Pinecone`);
                        batch = [];
                    }
                }
                
                console.log(`   ✅ Completed ${tableInfo.foreignKeys.length} relationship embeddings for ${tableInfo.tableName}`);
            }
            
            totalTablesProcessed++;
            console.log(`\n✅ Finished processing table: ${tableInfo.tableName}`);
        }
        
        // Upsert remaining batch
        if (batch.length > 0) {
            await index.upsert(batch);
            batchCount++;
            console.log(`   📦 Upserted final batch ${batchCount} with ${batch.length} embeddings to Pinecone`);
        }
        
        const totalEmbeddings = totalColumnsProcessed + totalRelationshipsProcessed;
        console.log(`\n🎉 Successfully created and uploaded ${totalEmbeddings} schema embeddings!`);
        console.log(`   📊 Summary:`);
        console.log(`      - Tables processed: ${totalTablesProcessed}`);
        console.log(`      - Column embeddings: ${totalColumnsProcessed}`);
        console.log(`      - Relationship embeddings: ${totalRelationshipsProcessed}`);
        console.log(`      - Total embeddings: ${totalEmbeddings}`);
        console.log(`      - Pinecone batches: ${batchCount}`);
        console.log(`   Connection: ${connectionData.name} (ID: ${connectionData.id})\n`);
        
        // Sync schema to Neo4j graph database (non-blocking)
        syncSchemaToGraph(schemaInfo, connectionData).catch(error => {
            console.error('Failed to sync schema to Neo4j (non-critical):', error);
        });
        
    } catch (error) {
        console.error('\n❌ Error creating schema embeddings:', error);
        console.error(`   Connection: ${connectionData.name} (ID: ${connectionData.id})`);
        console.error(`   Error details:`, error.message);
        // Don't throw - we don't want to break database creation if embeddings fail
        // Error is already logged, let the caller handle if needed
    }
};

