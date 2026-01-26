const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'micro_app'
  });

  console.log('Conectado a la base de datos');

  // Crear tabla migrations si no existe
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT NOT NULL AUTO_INCREMENT,
      timestamp BIGINT NOT NULL,
      name VARCHAR(255) NOT NULL,
      PRIMARY KEY (id)
    )
  `);
  console.log('Tabla migrations verificada');

  // Insertar migraciones previas como ejecutadas
  const migrations = [
    { timestamp: 1706000000000, name: 'CreateCreditTables1706000000000' },
    { timestamp: 1769055162256, name: 'CreateCreditosTables1769055162256' }
  ];

  for (const m of migrations) {
    try {
      await connection.execute(
        'INSERT INTO migrations (timestamp, name) VALUES (?, ?)',
        [m.timestamp, m.name]
      );
      console.log('Registrada:', m.name);
    } catch(e) {
      if (e.code === 'ER_DUP_ENTRY') {
        console.log('Ya existe:', m.name);
      } else {
        console.error('Error:', e.message);
      }
    }
  }

  console.log('Proceso completado');
  await connection.end();
}

main().catch(console.error);
