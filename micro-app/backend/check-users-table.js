const mysql = require('mysql2/promise');

async function checkUsersTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'micro_app'
  });

  try {
    console.log('Verificando estructura de la tabla users...\n');

    const [columns] = await connection.execute(`
      SELECT
        COLUMN_NAME,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_KEY,
        EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'micro_app' AND TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('Columnas de la tabla users:');
    console.log('='.repeat(80));
    columns.forEach(col => {
      console.log(`${col.COLUMN_NAME}: ${col.COLUMN_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.EXTRA}`);
    });

    console.log('\n\nVerificando columnas *Id que referencian a users:');
    console.log('='.repeat(80));

    const tables = [
      'solicitud.analistaId',
      'solicitud.aprobadorId',
      'prestamo.usuarioDesembolsoId',
      'pago.usuarioId',
      'pago.usuarioAnulacionId',
      'decision_comite.usuarioId',
      'solicitud_historial.usuarioId'
    ];

    for (const tableCol of tables) {
      const [tableName, columnName] = tableCol.split('.');
      const [result] = await connection.execute(`
        SELECT
          COLUMN_NAME,
          COLUMN_TYPE,
          IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'micro_app'
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
      `, [tableName, columnName]);

      if (result.length > 0) {
        console.log(`${tableCol}: ${result[0].COLUMN_TYPE} (nullable: ${result[0].IS_NULLABLE})`);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkUsersTable();
