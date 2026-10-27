const fs = require('fs');
const path = require('path');
const { query } = require('../src/db');

async function generateSchemaSql() {
  try {
    console.log('Fetching database schema from Neon PostgreSQL...');

    // 1. Fetch all user tables in public schema
    const tablesRes = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const tables = tablesRes.rows.map(r => r.table_name);
    console.log(`Found ${tables.length} tables in public schema.`);

    // 2. Fetch all column definitions
    const colsRes = await query(`
      SELECT 
        table_name, 
        column_name, 
        data_type, 
        udt_name, 
        character_maximum_length,
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position;
    `);

    // 3. Fetch primary keys
    const pkRes = await query(`
      SELECT
        tc.table_name, 
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.ordinal_position;
    `);

    const pkMap = {};
    for (const r of pkRes.rows) {
      if (!pkMap[r.table_name]) pkMap[r.table_name] = [];
      pkMap[r.table_name].push(r.column_name);
    }

    // 4. Fetch unique constraints
    const uqRes = await query(`
      SELECT
        tc.table_name, 
        kcu.column_name,
        tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'UNIQUE'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name;
    `);

    const uqMap = {};
    for (const r of uqRes.rows) {
      if (!uqMap[r.table_name]) uqMap[r.table_name] = [];
      uqMap[r.table_name].push(r.column_name);
    }

    // 5. Fetch indexes
    const idxRes = await query(`
      SELECT
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname NOT LIKE '%_pkey'
      ORDER BY tablename, indexname;
    `);

    // Group columns by table
    const tableCols = {};
    for (const col of colsRes.rows) {
      if (!tableCols[col.table_name]) tableCols[col.table_name] = [];
      tableCols[col.table_name].push(col);
    }

    let sql = `-- =============================================================================\n`;
    sql += `-- Multiix / OXOO Database Schema (Neon PostgreSQL)\n`;
    sql += `-- Generated on: ${new Date().toISOString()}\n`;
    sql += `-- Target Database: Neon PostgreSQL Serverless\n`;
    sql += `-- Total Tables: ${tables.length}\n`;
    sql += `-- =============================================================================\n\n`;

    sql += `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n`;
    sql += `CREATE EXTENSION IF NOT EXISTS "pgcrypto";\n\n`;

    for (const table of tables) {
      const cols = tableCols[table] || [];
      const pks = pkMap[table] || [];
      const uqs = uqMap[table] || [];

      sql += `-- -----------------------------------------------------------------------------\n`;
      sql += `-- Table: ${table}\n`;
      sql += `-- -----------------------------------------------------------------------------\n`;
      sql += `CREATE TABLE IF NOT EXISTS ${table} (\n`;

      const colDefs = cols.map(c => {
        let typeStr = c.data_type.toUpperCase();
        if (c.data_type === 'character varying') {
          typeStr = c.character_maximum_length ? `VARCHAR(${c.character_maximum_length})` : 'VARCHAR(255)';
        } else if (c.data_type === 'USER-DEFINED') {
          typeStr = c.udt_name.toUpperCase();
        } else if (c.udt_name === 'timestamptz') {
          typeStr = 'TIMESTAMPTZ';
        } else if (c.udt_name === 'int4') {
          typeStr = (c.column_default && c.column_default.includes('nextval')) ? 'SERIAL' : 'INTEGER';
        } else if (c.udt_name === 'int8') {
          typeStr = (c.column_default && c.column_default.includes('nextval')) ? 'BIGSERIAL' : 'BIGINT';
        } else if (c.udt_name === 'jsonb') {
          typeStr = 'JSONB';
        } else if (c.udt_name === 'bool') {
          typeStr = 'BOOLEAN';
        } else if (c.udt_name === 'numeric') {
          typeStr = 'NUMERIC(12, 2)';
        }

        let defStr = `  ${c.column_name.padEnd(28)} ${typeStr}`;

        const isSerial = typeStr === 'SERIAL' || typeStr === 'BIGSERIAL';

        if (c.is_nullable === 'NO' && !isSerial) {
          defStr += ' NOT NULL';
        }

        if (c.column_default && !isSerial) {
          defStr += ` DEFAULT ${c.column_default}`;
        }

        if (pks.length === 1 && pks[0] === c.column_name && isSerial) {
          defStr += ' PRIMARY KEY';
        }

        return defStr;
      });

      // Composite or non-serial primary keys
      if (pks.length > 0 && !(pks.length === 1 && cols.find(c => c.column_name === pks[0] && (c.column_default || '').includes('nextval')))) {
        colDefs.push(`  PRIMARY KEY (${pks.join(', ')})`);
      }

      sql += colDefs.join(',\n');
      sql += `\n);\n\n`;
    }

    // Indexes
    if (idxRes.rows.length > 0) {
      sql += `-- =============================================================================\n`;
      sql += `-- Secondary Indexes\n`;
      sql += `-- =============================================================================\n\n`;
      for (const idx of idxRes.rows) {
        sql += `${idx.indexdef};\n`;
      }
      sql += `\n`;
    }

    const outputPath = path.join(__dirname, '..', 'schema.sql');
    const rootOutputPath = path.join(__dirname, '..', '..', 'schema.sql');
    fs.writeFileSync(outputPath, sql, 'utf8');
    fs.writeFileSync(rootOutputPath, sql, 'utf8');

    console.log(`✓ schema.sql generated successfully at:\n  - ${outputPath}\n  - ${rootOutputPath}`);
    process.exit(0);
  } catch (err) {
    console.error('Error generating schema:', err);
    process.exit(1);
  }
}

generateSchemaSql();
