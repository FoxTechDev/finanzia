const mysql = require('mysql2/promise');

async function fixUsersForeignKeys() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'micro_app'
  });

  try {
    console.log('='.repeat(80));
    console.log('SOLUCIÓN PARA FOREIGN KEYS DE USERS');
    console.log('='.repeat(80));

    // 1. Verificar datos existentes en users
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`\n1. Usuarios existentes en la BD: ${users[0].count}`);

    if (users[0].count > 0) {
      const [sampleUsers] = await connection.execute('SELECT id, email FROM users LIMIT 5');
      console.log('\nMuestra de usuarios:');
      sampleUsers.forEach(u => console.log(`   - ID: ${u.id}, Email: ${u.email}`));
    }

    // 2. Verificar referencias existentes
    console.log('\n2. Verificando referencias a users en otras tablas:');

    const checks = [
      { table: 'solicitud', column: 'analistaId' },
      { table: 'solicitud', column: 'aprobadorId' },
      { table: 'prestamo', column: 'usuarioDesembolsoId' },
      { table: 'pago', column: 'usuarioId' },
      { table: 'pago', column: 'usuarioAnulacionId' },
      { table: 'decision_comite', column: 'usuarioId' },
      { table: 'solicitud_historial', column: 'usuarioId' }
    ];

    let totalReferences = 0;
    for (const check of checks) {
      const [result] = await connection.execute(
        `SELECT COUNT(*) as count FROM ${check.table} WHERE ${check.column} IS NOT NULL`
      );
      totalReferences += result[0].count;
      console.log(`   - ${check.table}.${check.column}: ${result[0].count} referencias`);
    }

    console.log(`\n   Total de referencias a users: ${totalReferences}`);

    console.log('\n' + '='.repeat(80));
    console.log('OPCIONES DE SOLUCIÓN:');
    console.log('='.repeat(80));

    console.log('\n📋 OPCIÓN A: Cambiar users.id de VARCHAR(36) a INT AUTO_INCREMENT');
    console.log('   Ventajas:');
    console.log('   + Consistente con el resto de la BD');
    console.log('   + Mejor rendimiento en joins e índices');
    console.log('   + Menor consumo de almacenamiento');
    console.log('   Desventajas:');
    console.log(`   - Requiere migrar ${users[0].count} usuario(s) existente(s)`);
    console.log('   - Se perderán los UUIDs actuales');

    console.log('\n📋 OPCIÓN B: Cambiar columnas *Id de INT a VARCHAR(36)');
    console.log('   Ventajas:');
    console.log('   + Mantiene los UUIDs en users');
    console.log('   + No requiere migrar tabla users');
    console.log('   Desventajas:');
    console.log('   - Mayor consumo de almacenamiento');
    console.log('   - Peor rendimiento en joins');
    console.log('   - Inconsistente con el resto de la BD');

    if (users[0].count === 0 && totalReferences === 0) {
      console.log('\n✅ RECOMENDACIÓN: OPCIÓN A (cambiar users.id a INT)');
      console.log('   La tabla users está vacía y no hay referencias, es el momento ideal.');
      console.log('\n   ¿Deseas generar el script para ejecutar la OPCIÓN A? (Sí/No)');

      // Generar script de migración
      await generateOptionAScript(connection);
    } else if (users[0].count > 0 && totalReferences === 0) {
      console.log('\n⚠️  RECOMENDACIÓN: OPCIÓN A con cuidado');
      console.log(`   Hay ${users[0].count} usuario(s) pero sin referencias en otras tablas.`);
      console.log('   Se puede migrar pero se perderán los UUIDs actuales.');

      await generateOptionAScript(connection);
    } else {
      console.log('\n⚠️  ADVERTENCIA: Hay datos existentes');
      console.log('   Se recomienda revisar manualmente antes de proceder.');
      console.log('   Considerar OPCIÓN B si los UUIDs son importantes.');

      await generateOptionBScript(connection);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

async function generateOptionAScript(connection) {
  const fs = require('fs').promises;
  const path = require('path');

  const script = `-- ============================================================================
-- OPCIÓN A: Migrar users.id de VARCHAR(36) a INT AUTO_INCREMENT
-- ============================================================================
-- ADVERTENCIA: Este script eliminará los UUIDs existentes y creará nuevos IDs
-- Hacer BACKUP antes de ejecutar

USE micro_app;

-- Paso 1: Crear tabla temporal para migración
CREATE TABLE users_new LIKE users;

ALTER TABLE users_new
MODIFY COLUMN id INT AUTO_INCREMENT;

-- Paso 2: Migrar datos (se asignarán nuevos IDs secuenciales)
INSERT INTO users_new (email, password, firstName, lastName, isActive, createdAt, updatedAt)
SELECT email, password, firstName, lastName, isActive, createdAt, updatedAt
FROM users;

-- Paso 3: Eliminar tabla antigua y renombrar
DROP TABLE users;
RENAME TABLE users_new TO users;

-- Paso 4: Ahora podemos crear las FK pendientes
ALTER TABLE solicitud
ADD CONSTRAINT FK_solicitud_analista
FOREIGN KEY (analistaId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE solicitud
ADD CONSTRAINT FK_solicitud_aprobador
FOREIGN KEY (aprobadorId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE prestamo
ADD CONSTRAINT FK_prestamo_usuario_desembolso
FOREIGN KEY (usuarioDesembolsoId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE pago
ADD CONSTRAINT FK_pago_usuario
FOREIGN KEY (usuarioId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE pago
ADD CONSTRAINT FK_pago_usuario_anulacion
FOREIGN KEY (usuarioAnulacionId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE decision_comite
ADD CONSTRAINT FK_decision_comite_usuario
FOREIGN KEY (usuarioId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE solicitud_historial
ADD CONSTRAINT FK_solicitud_historial_usuario
FOREIGN KEY (usuarioId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;
`;

  const filePath = path.join(__dirname, 'fix-users-option-a.sql');
  await fs.writeFile(filePath, script);
  console.log(`\n✅ Script generado: ${filePath}`);
}

async function generateOptionBScript(connection) {
  const fs = require('fs').promises;
  const path = require('path');

  const script = `-- ============================================================================
-- OPCIÓN B: Cambiar columnas *Id de INT a VARCHAR(36)
-- ============================================================================
-- Esta opción mantiene los UUIDs en users pero cambia todas las referencias

USE micro_app;

-- Paso 1: Cambiar tipo de columnas
ALTER TABLE solicitud
MODIFY COLUMN analistaId VARCHAR(36) NULL;

ALTER TABLE solicitud
MODIFY COLUMN aprobadorId VARCHAR(36) NULL;

ALTER TABLE prestamo
MODIFY COLUMN usuarioDesembolsoId VARCHAR(36) NULL;

ALTER TABLE pago
MODIFY COLUMN usuarioId VARCHAR(36) NULL;

ALTER TABLE pago
MODIFY COLUMN usuarioAnulacionId VARCHAR(36) NULL;

ALTER TABLE decision_comite
MODIFY COLUMN usuarioId VARCHAR(36) NULL;

ALTER TABLE solicitud_historial
MODIFY COLUMN usuarioId VARCHAR(36) NULL;

-- Paso 2: Crear foreign keys
ALTER TABLE solicitud
ADD CONSTRAINT FK_solicitud_analista
FOREIGN KEY (analistaId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE solicitud
ADD CONSTRAINT FK_solicitud_aprobador
FOREIGN KEY (aprobadorId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE prestamo
ADD CONSTRAINT FK_prestamo_usuario_desembolso
FOREIGN KEY (usuarioDesembolsoId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE pago
ADD CONSTRAINT FK_pago_usuario
FOREIGN KEY (usuarioId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE pago
ADD CONSTRAINT FK_pago_usuario_anulacion
FOREIGN KEY (usuarioAnulacionId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE decision_comite
ADD CONSTRAINT FK_decision_comite_usuario
FOREIGN KEY (usuarioId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE solicitud_historial
ADD CONSTRAINT FK_solicitud_historial_usuario
FOREIGN KEY (usuarioId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

-- IMPORTANTE: Actualizar entidades TypeORM para cambiar tipo de columnas
-- De: @Column({ nullable: true }) usuarioId: number;
-- A:   @Column({ type: 'varchar', length: 36, nullable: true }) usuarioId: string;
`;

  const filePath = path.join(__dirname, 'fix-users-option-b.sql');
  await fs.writeFile(filePath, script);
  console.log(`\n✅ Script generado: ${filePath}`);
}

fixUsersForeignKeys();
