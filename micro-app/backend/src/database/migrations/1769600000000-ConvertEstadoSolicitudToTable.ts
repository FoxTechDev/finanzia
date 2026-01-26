import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migración para convertir el campo estado de enum a relación con tabla estado_solicitud
 *
 * Pasos:
 * 1. Actualizar los estados en la tabla estado_solicitud según el nuevo flujo
 * 2. Agregar columna estadoId a la tabla solicitud
 * 3. Migrar datos del enum al estadoId
 * 4. Eliminar la columna enum antigua
 */
export class ConvertEstadoSolicitudToTable1769600000000 implements MigrationInterface {
    name = 'ConvertEstadoSolicitudToTable1769600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Iniciando migración: Convertir estado de enum a tabla...');

        // 1. Actualizar estados en la tabla estado_solicitud
        console.log('📝 Paso 1: Actualizando estados en la tabla estado_solicitud...');

        // Desactivar estados antiguos que ya no se usan
        await queryRunner.query(`
            UPDATE estado_solicitud
            SET activo = false
            WHERE codigo IN ('CREADA', 'EN_ANALISIS', 'CANCELADA', 'PENDIENTE_COMITE', 'AUTORIZADA', 'DENEGADA_COMITE', 'OBSERVADA_COMITE')
        `);

        // Insertar o actualizar los nuevos estados
        const estados = [
            { codigo: 'REGISTRADA', nombre: 'Registrada', descripcion: 'Estado inicial al crear la solicitud', orden: 1, color: '#6C757D' },
            { codigo: 'ANALIZADA', nombre: 'Analizada', descripcion: 'Se asigna automáticamente cuando el asesor ingresa su análisis', orden: 2, color: '#17A2B8' },
            { codigo: 'EN_COMITE', nombre: 'En Comité', descripcion: 'Cuando el asesor traslada a comité', orden: 3, color: '#FD7E14' },
            { codigo: 'OBSERVADA', nombre: 'Observada', descripcion: 'Cuando el comité observa la solicitud (permite al asesor modificar y reenviar)', orden: 4, color: '#FFC107' },
            { codigo: 'DENEGADA', nombre: 'Denegada', descripcion: 'Cuando el comité deniega (estado final, no se puede modificar)', orden: 5, color: '#DC3545' },
            { codigo: 'APROBADA', nombre: 'Aprobada', descripcion: 'Cuando el comité aprueba', orden: 6, color: '#28A745' },
            { codigo: 'DESEMBOLSADA', nombre: 'Desembolsada', descripcion: 'Estado final después del desembolso', orden: 7, color: '#007BFF' },
        ];

        for (const estado of estados) {
            await queryRunner.query(`
                INSERT INTO estado_solicitud (codigo, nombre, descripcion, orden, color, activo, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, true, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    nombre = VALUES(nombre),
                    descripcion = VALUES(descripcion),
                    orden = VALUES(orden),
                    color = VALUES(color),
                    activo = true,
                    updatedAt = NOW()
            `, [estado.codigo, estado.nombre, estado.descripcion, estado.orden, estado.color]);
        }

        console.log('✅ Estados actualizados correctamente');

        // 2. Agregar columna estadoId a la tabla solicitud
        console.log('📝 Paso 2: Agregando columna estadoId...');

        await queryRunner.query(`
            ALTER TABLE solicitud
            ADD COLUMN estadoId INT NULL
            AFTER estado
        `);

        console.log('✅ Columna estadoId agregada');

        // 3. Migrar datos del enum al estadoId
        console.log('📝 Paso 3: Migrando datos del enum a estadoId...');

        // Mapear estados antiguos a nuevos
        const mapeoEstados = [
            { antiguo: 'CREADA', nuevo: 'REGISTRADA' },
            { antiguo: 'EN_ANALISIS', nuevo: 'ANALIZADA' },
            { antiguo: 'PENDIENTE_COMITE', nuevo: 'EN_COMITE' },
            { antiguo: 'OBSERVADA', nuevo: 'OBSERVADA' },
            { antiguo: 'OBSERVADA_COMITE', nuevo: 'OBSERVADA' },
            { antiguo: 'DENEGADA', nuevo: 'DENEGADA' },
            { antiguo: 'DENEGADA_COMITE', nuevo: 'DENEGADA' },
            { antiguo: 'AUTORIZADA', nuevo: 'APROBADA' },
            { antiguo: 'APROBADA', nuevo: 'APROBADA' },
            { antiguo: 'DESEMBOLSADA', nuevo: 'DESEMBOLSADA' },
            { antiguo: 'CANCELADA', nuevo: 'DENEGADA' }, // Canceladas se convierten en denegadas
        ];

        for (const mapeo of mapeoEstados) {
            await queryRunner.query(`
                UPDATE solicitud s
                INNER JOIN estado_solicitud e ON e.codigo = ?
                SET s.estadoId = e.id
                WHERE s.estado = ?
            `, [mapeo.nuevo, mapeo.antiguo]);
        }

        console.log('✅ Datos migrados correctamente');

        // 4. Hacer estadoId NOT NULL y agregar foreign key
        console.log('📝 Paso 4: Configurando estadoId como NOT NULL y agregando foreign key...');

        await queryRunner.query(`
            ALTER TABLE solicitud
            MODIFY COLUMN estadoId INT NOT NULL
        `);

        await queryRunner.query(`
            ALTER TABLE solicitud
            ADD CONSTRAINT FK_solicitud_estado
            FOREIGN KEY (estadoId) REFERENCES estado_solicitud(id)
        `);

        console.log('✅ Foreign key agregada');

        // 5. Eliminar el enum antiguo y renombrar la columna
        console.log('📝 Paso 5: Eliminando columna enum antigua...');

        // Primero guardar una copia de seguridad del enum en una columna temporal (por si acaso)
        await queryRunner.query(`
            ALTER TABLE solicitud
            ADD COLUMN estado_backup VARCHAR(50) NULL
            AFTER estadoId
        `);

        await queryRunner.query(`
            UPDATE solicitud
            SET estado_backup = estado
        `);

        // Ahora eliminar la columna enum antigua
        await queryRunner.query(`
            ALTER TABLE solicitud
            DROP COLUMN estado
        `);

        console.log('✅ Columna enum eliminada');

        // 6. Actualizar el historial para usar códigos de estado
        console.log('📝 Paso 6: Actualizando solicitud_historial...');

        // Ampliar el tamaño de las columnas de estado en el historial
        await queryRunner.query(`
            ALTER TABLE solicitud_historial
            MODIFY COLUMN estadoAnterior VARCHAR(50),
            MODIFY COLUMN estadoNuevo VARCHAR(50)
        `);

        // Actualizar valores en el historial
        for (const mapeo of mapeoEstados) {
            await queryRunner.query(`
                UPDATE solicitud_historial
                SET estadoAnterior = ?
                WHERE estadoAnterior = ?
            `, [mapeo.nuevo, mapeo.antiguo]);

            await queryRunner.query(`
                UPDATE solicitud_historial
                SET estadoNuevo = ?
                WHERE estadoNuevo = ?
            `, [mapeo.nuevo, mapeo.antiguo]);
        }

        console.log('✅ Historial actualizado');

        // 7. Crear índice para mejorar las consultas
        console.log('📝 Paso 7: Creando índices...');

        await queryRunner.query(`
            CREATE INDEX IDX_solicitud_estadoId ON solicitud (estadoId)
        `);

        console.log('✅ Índices creados');
        console.log('🎉 Migración completada exitosamente!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⏪ Revirtiendo migración: Convertir estado de enum a tabla...');

        // 1. Eliminar índice
        await queryRunner.query(`DROP INDEX IDX_solicitud_estadoId ON solicitud`);

        // 2. Restaurar columna enum
        await queryRunner.query(`
            ALTER TABLE solicitud
            ADD COLUMN estado ENUM('CREADA', 'EN_ANALISIS', 'OBSERVADA', 'DENEGADA', 'APROBADA', 'DESEMBOLSADA', 'CANCELADA', 'PENDIENTE_COMITE', 'AUTORIZADA', 'DENEGADA_COMITE', 'OBSERVADA_COMITE')
            NOT NULL DEFAULT 'CREADA'
            AFTER id
        `);

        // 3. Restaurar valores del backup
        await queryRunner.query(`
            UPDATE solicitud
            SET estado = estado_backup
            WHERE estado_backup IS NOT NULL
        `);

        // 4. Eliminar columnas nuevas
        await queryRunner.query(`ALTER TABLE solicitud DROP COLUMN estado_backup`);
        await queryRunner.query(`ALTER TABLE solicitud DROP FOREIGN KEY FK_solicitud_estado`);
        await queryRunner.query(`ALTER TABLE solicitud DROP COLUMN estadoId`);

        // 5. Revertir cambios en historial
        await queryRunner.query(`
            ALTER TABLE solicitud_historial
            MODIFY COLUMN estadoAnterior VARCHAR(20),
            MODIFY COLUMN estadoNuevo VARCHAR(20)
        `);

        console.log('✅ Migración revertida');
    }
}
