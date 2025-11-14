/**
 * Utility functions to generate text representations of database schemas
 * for embedding generation
 */

/**
 * Generate text for a primary key + column pair embedding
 * This creates granular embeddings for better scalability and precision
 */
export const generatePKColumnPairText = (tableInfo, column, primaryKeyColumn) => {
    let text = `Table: ${tableInfo.tableName}\n`;
    text += `Type: ${tableInfo.tableType}\n\n`;
    
    // Primary Key information
    text += `Primary Key: ${primaryKeyColumn.column_name} [${primaryKeyColumn.data_type}`;
    if (primaryKeyColumn.character_maximum_length) {
        text += `(${primaryKeyColumn.character_maximum_length})`;
    }
    text += `]\n\n`;
    
    // Column information
    text += `Column: ${column.column_name} [${column.data_type}`;
    if (column.character_maximum_length) {
        text += `(${column.character_maximum_length})`;
    }
    text += `]\n`;
    
    // Column constraints
    const constraints = [];
    if (tableInfo.primaryKeys.includes(column.column_name)) {
        constraints.push('PRIMARY KEY');
    }
    if (tableInfo.uniqueConstraints.includes(column.column_name)) {
        constraints.push('UNIQUE');
    }
    if (column.is_nullable === 'NO') {
        constraints.push('NOT NULL');
    }
    if (column.column_default) {
        constraints.push(`DEFAULT: ${column.column_default}`);
    }
    
    // Check if this column is a foreign key
    const fk = tableInfo.foreignKeys.find(f => f.column_name === column.column_name);
    if (fk) {
        constraints.push(`REFERENCES ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        text += `Foreign Key: References ${fk.foreign_table_name}.${fk.foreign_column_name}\n`;
    }
    
    if (constraints.length > 0) {
        text += `Constraints: ${constraints.join(', ')}\n`;
    }
    
    // Include indexes if this column is part of any
    const columnIndexes = tableInfo.indexes.filter(idx => 
        idx.indexdef.toLowerCase().includes(column.column_name.toLowerCase())
    );
    if (columnIndexes.length > 0) {
        text += `\nIndexes: ${columnIndexes.map(idx => idx.indexname).join(', ')}\n`;
    }
    
    return text;
};

/**
 * Generate text for a table overview embedding
 * @deprecated - Kept for backwards compatibility, but prefer PK+Column pair approach
 */
export const generateTableText = (tableInfo) => {
    let text = `Table: ${tableInfo.tableName}\n`;
    text += `Type: ${tableInfo.tableType}\n\n`;
    
    text += `Columns:\n`;
    tableInfo.columns.forEach((col) => {
        let colDesc = `  - ${col.column_name} [${col.data_type}`;
        if (col.character_maximum_length) {
            colDesc += `(${col.character_maximum_length})`;
        }
        colDesc += `]`;
        
        // Add constraints
        const constraints = [];
        if (tableInfo.primaryKeys.includes(col.column_name)) {
            constraints.push('PRIMARY KEY');
        }
        if (tableInfo.uniqueConstraints.includes(col.column_name)) {
            constraints.push('UNIQUE');
        }
        if (col.is_nullable === 'NO') {
            constraints.push('NOT NULL');
        }
        if (col.column_default) {
            constraints.push(`DEFAULT: ${col.column_default}`);
        }
        
        // Check if this column is a foreign key
        const fk = tableInfo.foreignKeys.find(f => f.column_name === col.column_name);
        if (fk) {
            constraints.push(`REFERENCES ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        }
        
        if (constraints.length > 0) {
            colDesc += ` (${constraints.join(', ')})`;
        }
        text += colDesc + '\n';
    });
    
    if (tableInfo.primaryKeys.length > 0) {
        text += `\nPrimary Keys: ${tableInfo.primaryKeys.join(', ')}\n`;
    }
    
    if (tableInfo.foreignKeys.length > 0) {
        text += `\nForeign Key Relationships:\n`;
        tableInfo.foreignKeys.forEach((fk) => {
            text += `  - ${fk.column_name} references ${fk.foreign_table_name}.${fk.foreign_column_name}\n`;
        });
    }
    
    if (tableInfo.uniqueConstraints.length > 0) {
        text += `\nUnique Constraints: ${tableInfo.uniqueConstraints.join(', ')}\n`;
    }
    
    if (tableInfo.indexes.length > 0) {
        text += `\nIndexes:\n`;
        tableInfo.indexes.forEach((idx) => {
            text += `  - ${idx.indexname}: ${idx.indexdef}\n`;
        });
    }
    
    return text;
};

/**
 * Generate text for a relationship embedding
 */
export const generateRelationshipText = (tableInfo, fk, allTables) => {
    // Find the target table info
    const targetTable = allTables.find(t => t.tableName === fk.foreign_table_name);
    
    let text = `Relationship: ${tableInfo.tableName}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}\n\n`;
    
    text += `Source Table: ${tableInfo.tableName}\n`;
    const sourceCol = tableInfo.columns.find(c => c.column_name === fk.column_name);
    if (sourceCol) {
        text += `Source Column: ${fk.column_name} [${sourceCol.data_type}`;
        if (sourceCol.character_maximum_length) {
            text += `(${sourceCol.character_maximum_length})`;
        }
        text += `]\n`;
    }
    
    text += `\nTarget Table: ${fk.foreign_table_name}\n`;
    if (targetTable) {
        const targetCol = targetTable.columns.find(c => c.column_name === fk.foreign_column_name);
        if (targetCol) {
            text += `Target Column: ${fk.foreign_column_name} [${targetCol.data_type}`;
            if (targetCol.character_maximum_length) {
                text += `(${targetCol.character_maximum_length})`;
            }
            text += `]\n`;
        }
        
        // Include context about the target table
        text += `\nTarget Table Schema:\n`;
        text += `  Type: ${targetTable.tableType}\n`;
        text += `  Columns: ${targetTable.columns.map(c => c.column_name).join(', ')}\n`;
        if (targetTable.primaryKeys.length > 0) {
            text += `  Primary Keys: ${targetTable.primaryKeys.join(', ')}\n`;
        }
    }
    
    text += `\nRelationship Type: Foreign Key (Many-to-One from ${tableInfo.tableName} to ${fk.foreign_table_name})`;
    
    return text;
};

