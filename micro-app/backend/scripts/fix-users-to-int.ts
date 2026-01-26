import * as mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'micro_app'
  });

  console.log('=== Aplicando Opción A: Cambiar users.id a INT ===\n');

  await conn.execute('SET FOREIGN_KEY_CHECKS = 0');

  // 1. Ver usuarios actuales
  const [users] = await conn.execute('SELECT id, email, firstName FROM users') as any[];
  console.log('Usuarios actuales:', users.length);
  users.forEach((u: any) => console.log('  - ' + u.id + ' | ' + u.email));

  // 2. Crear tabla temporal con nueva estructura
  console.log('\nCreando tabla users_new con id INT...');
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS users_new (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      firstName VARCHAR(255) NULL,
      lastName VARCHAR(255) NULL,
      isActive TINYINT DEFAULT 1,
      createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
      updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
    )
  `);

  // 3. Migrar datos
  console.log('Migrando datos...');
  await conn.execute(`
    INSERT INTO users_new (email, password, firstName, lastName, isActive, createdAt, updatedAt)
    SELECT email, password, firstName, lastName, isActive, createdAt, updatedAt FROM users
  `);

  // 4. Obtener mapeo de IDs viejos a nuevos
  const [newUsers] = await conn.execute('SELECT id, email FROM users_new') as any[];
  const idMap: Record<string, number> = {};
  for (const u of users) {
    const newUser = newUsers.find((nu: any) => nu.email === u.email);
    if (newUser) {
      idMap[u.id] = newUser.id;
    }
  }
  console.log('Mapeo de IDs:', idMap);

  // 5. Actualizar referencias en otras tablas (si existen registros)
  const tablesWithUserRef = [
    ['solicitud', 'analistaId'],
    ['solicitud', 'aprobadorId'],
    ['prestamo', 'usuarioDesembolsoId'],
    ['pago', 'usuarioId'],
    ['pago', 'usuarioAnulacionId'],
    ['decision_comite', 'usuarioId'],
    ['solicitud_historial', 'usuarioId']
  ];

  for (const [table, column] of tablesWithUserRef) {
    try {
      for (const [oldId, newId] of Object.entries(idMap)) {
        await conn.execute(`UPDATE ${table} SET ${column} = ? WHERE ${column} = ?`, [newId, oldId]);
      }
    } catch (e: any) {
      // Ignorar errores si la tabla/columna no existe o no hay datos
    }
  }

  // 6. Eliminar tabla vieja y renombrar nueva
  console.log('\nReemplazando tabla users...');
  await conn.execute('DROP TABLE users');
  await conn.execute('RENAME TABLE users_new TO users');

  // 7. Crear foreign keys
  console.log('Creando foreign keys...');

  const fks = [
    ['solicitud', 'analistaId', 'FK_solicitud_analista'],
    ['solicitud', 'aprobadorId', 'FK_solicitud_aprobador'],
    ['prestamo', 'usuarioDesembolsoId', 'FK_prestamo_usuario'],
    ['decision_comite', 'usuarioId', 'FK_decision_usuario']
  ];

  for (const [table, column, fkName] of fks) {
    try {
      await conn.execute(`ALTER TABLE ${table} ADD CONSTRAINT ${fkName} FOREIGN KEY (${column}) REFERENCES users(id) ON DELETE SET NULL`);
      console.log('  ✅ ' + fkName);
    } catch (e: any) {
      console.log('  ⚠️ ' + fkName + ': ' + e.message.substring(0, 60));
    }
  }

  await conn.execute('SET FOREIGN_KEY_CHECKS = 1');

  // 8. Verificar resultado
  const [finalUsers] = await conn.execute('SELECT id, email FROM users') as any[];
  console.log('\n=== Resultado Final ===');
  console.log('Usuarios migrados:');
  finalUsers.forEach((u: any) => console.log('  - ID: ' + u.id + ' | ' + u.email));

  await conn.end();
  console.log('\n✅ Migración completada');
}

main().catch(console.error);
