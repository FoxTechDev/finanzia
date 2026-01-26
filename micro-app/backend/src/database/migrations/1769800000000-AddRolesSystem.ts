import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migración para implementar el sistema de roles RBAC
 *
 * Pasos:
 * 1. Crear tabla 'rol' para los roles del sistema
 * 2. Agregar columna 'rolId' a la tabla 'users'
 * 3. Insertar roles iniciales (ADMIN, ASESOR, COMITE)
 * 4. Crear índices y foreign keys
 */
export class AddRolesSystem1769800000000 implements MigrationInterface {
    name = 'AddRolesSystem1769800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Iniciando migración: Sistema de Roles RBAC...');

        // 1. Crear tabla rol
        console.log('📝 Paso 1: Creando tabla rol...');

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS rol (
                id INT AUTO_INCREMENT PRIMARY KEY,
                codigo VARCHAR(20) NOT NULL UNIQUE,
                nombre VARCHAR(50) NOT NULL,
                descripcion VARCHAR(255) NULL,
                activo BOOLEAN DEFAULT TRUE,
                orden INT DEFAULT 0,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX IDX_rol_codigo (codigo),
                INDEX IDX_rol_activo (activo)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('✅ Tabla rol creada');

        // 2. Insertar roles iniciales
        console.log('📝 Paso 2: Insertando roles iniciales...');

        const roles = [
            { codigo: 'ADMIN', nombre: 'Administrador', descripcion: 'Acceso completo a todo el sistema', orden: 1 },
            { codigo: 'ASESOR', nombre: 'Asesor de Negocio', descripcion: 'Acceso a clientes, solicitudes y análisis del asesor', orden: 2 },
            { codigo: 'COMITE', nombre: 'Comité de Crédito', descripcion: 'Acceso al comité de crédito y visualización de solicitudes', orden: 3 },
        ];

        for (const rol of roles) {
            await queryRunner.query(`
                INSERT INTO rol (codigo, nombre, descripcion, orden, activo)
                VALUES (?, ?, ?, ?, true)
                ON DUPLICATE KEY UPDATE
                    nombre = VALUES(nombre),
                    descripcion = VALUES(descripcion),
                    orden = VALUES(orden)
            `, [rol.codigo, rol.nombre, rol.descripcion, rol.orden]);
        }

        console.log('✅ Roles iniciales insertados');

        // 3. Agregar columna rolId a la tabla users
        console.log('📝 Paso 3: Agregando columna rolId a users...');

        await queryRunner.query(`
            ALTER TABLE users
            ADD COLUMN rolId INT NULL
        `);

        console.log('✅ Columna rolId agregada');

        // 4. Agregar foreign key
        console.log('📝 Paso 4: Agregando foreign key...');

        await queryRunner.query(`
            ALTER TABLE users
            ADD CONSTRAINT FK_users_rol
            FOREIGN KEY (rolId) REFERENCES rol(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
        `);

        console.log('✅ Foreign key agregada');

        // 5. Asignar rol ADMIN a usuarios existentes (opcional)
        console.log('📝 Paso 5: Asignando rol ADMIN a usuarios existentes...');

        await queryRunner.query(`
            UPDATE users u
            INNER JOIN rol r ON r.codigo = 'ADMIN'
            SET u.rolId = r.id
            WHERE u.rolId IS NULL
        `);

        console.log('✅ Rol ADMIN asignado a usuarios existentes');

        // 6. Crear índice para rolId
        console.log('📝 Paso 6: Creando índice para rolId...');

        await queryRunner.query(`
            CREATE INDEX IDX_users_rolId ON users (rolId)
        `);

        console.log('✅ Índice creado');
        console.log('🎉 Migración de Sistema de Roles completada exitosamente!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⏪ Revirtiendo migración: Sistema de Roles RBAC...');

        // 1. Eliminar índice
        await queryRunner.query(`DROP INDEX IDX_users_rolId ON users`);

        // 2. Eliminar foreign key
        await queryRunner.query(`ALTER TABLE users DROP FOREIGN KEY FK_users_rol`);

        // 3. Eliminar columna rolId
        await queryRunner.query(`ALTER TABLE users DROP COLUMN rolId`);

        // 4. Eliminar tabla rol
        await queryRunner.query(`DROP TABLE IF EXISTS rol`);

        console.log('✅ Migración revertida');
    }
}
