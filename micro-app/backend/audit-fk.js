const mysql = require('mysql2/promise');

async function auditForeignKeys() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'micro_app'
  });

  try {
    console.log('='.repeat(80));
    console.log('AUDITORÍA DE FOREIGN KEYS - BASE DE DATOS micro_app');
    console.log('='.repeat(80));
    console.log();

    // Consultar foreign keys actuales
    const [foreignKeys] = await connection.execute(`
      SELECT
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'micro_app'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY TABLE_NAME, COLUMN_NAME
    `);

    console.log('FOREIGN KEYS EXISTENTES EN LA BASE DE DATOS:');
    console.log('-'.repeat(80));

    if (foreignKeys.length === 0) {
      console.log('⚠️  NO SE ENCONTRARON FOREIGN KEYS EN LA BASE DE DATOS');
    } else {
      foreignKeys.forEach((fk, index) => {
        console.log(`${index + 1}. ${fk.TABLE_NAME}.${fk.COLUMN_NAME}`);
        console.log(`   └─> Referencias: ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
        console.log(`   └─> Constraint: ${fk.CONSTRAINT_NAME}`);
        console.log();
      });
    }

    console.log();
    console.log('='.repeat(80));
    console.log('TABLAS EN LA BASE DE DATOS:');
    console.log('-'.repeat(80));

    const [tables] = await connection.execute(`SHOW TABLES`);
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`${index + 1}. ${tableName}`);
    });

    console.log();
    console.log('='.repeat(80));
    console.log('COLUMNAS CON PATRON *Id (posibles foreign keys):');
    console.log('-'.repeat(80));

    const [columns] = await connection.execute(`
      SELECT
        TABLE_NAME,
        COLUMN_NAME,
        COLUMN_TYPE,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'micro_app'
        AND (COLUMN_NAME LIKE '%Id' OR COLUMN_NAME LIKE '%_id')
        AND COLUMN_NAME NOT IN ('id', 'idPersona')
      ORDER BY TABLE_NAME, COLUMN_NAME
    `);

    const groupedByTable = {};
    columns.forEach(col => {
      if (!groupedByTable[col.TABLE_NAME]) {
        groupedByTable[col.TABLE_NAME] = [];
      }
      groupedByTable[col.TABLE_NAME].push(col);
    });

    Object.keys(groupedByTable).sort().forEach(tableName => {
      console.log(`\n📋 ${tableName}:`);
      groupedByTable[tableName].forEach(col => {
        // Verificar si tiene FK
        const hasFk = foreignKeys.find(fk =>
          fk.TABLE_NAME === tableName && fk.COLUMN_NAME === col.COLUMN_NAME
        );
        const status = hasFk ? '✅' : '❌';
        console.log(`   ${status} ${col.COLUMN_NAME} (${col.COLUMN_TYPE}, nullable: ${col.IS_NULLABLE})`);
        if (hasFk) {
          console.log(`      └─> FK: ${hasFk.REFERENCED_TABLE_NAME}.${hasFk.REFERENCED_COLUMN_NAME}`);
        }
      });
    });

  } catch (error) {
    console.error('Error durante la auditoría:', error.message);
  } finally {
    await connection.end();
  }
}

auditForeignKeys();
