import { MigrationInterface, QueryRunner } from "typeorm";

export class AddComiteCreditoFeature1769300000000 implements MigrationInterface {
    name = 'AddComiteCreditoFeature1769300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Modificar el ENUM de estado en la tabla solicitud para agregar nuevos estados
        await queryRunner.query(`
            ALTER TABLE solicitud MODIFY COLUMN estado
            ENUM('CREADA', 'EN_ANALISIS', 'OBSERVADA', 'DENEGADA', 'APROBADA', 'DESEMBOLSADA', 'CANCELADA', 'PENDIENTE_COMITE', 'AUTORIZADA', 'DENEGADA_COMITE', 'OBSERVADA_COMITE')
            NOT NULL DEFAULT 'CREADA'
        `);

        // 2. Agregar nuevos campos a la tabla solicitud para el comité
        await queryRunner.query(`
            ALTER TABLE solicitud
            ADD COLUMN fechaTrasladoComite DATETIME NULL
        `);

        await queryRunner.query(`
            ALTER TABLE solicitud
            ADD COLUMN fechaDecisionComite DATETIME NULL
        `);

        await queryRunner.query(`
            ALTER TABLE solicitud
            ADD COLUMN observacionesComite TEXT NULL
        `);

        // 3. Crear tabla decision_comite
        await queryRunner.query(`
            CREATE TABLE decision_comite (
                id INT NOT NULL AUTO_INCREMENT,
                solicitudId INT NOT NULL,
                tipoDecision ENUM('AUTORIZADA', 'DENEGADA', 'OBSERVADA') NOT NULL,
                observaciones TEXT NULL,
                condicionesEspeciales TEXT NULL,
                montoAutorizado DECIMAL(14,2) NULL,
                plazoAutorizado INT NULL,
                tasaAutorizada DECIMAL(5,2) NULL,
                usuarioId INT NULL,
                nombreUsuario VARCHAR(150) NULL,
                fechaDecision DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (id),
                CONSTRAINT FK_decision_comite_solicitud FOREIGN KEY (solicitudId) REFERENCES solicitud(id) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);

        // 4. Crear índice para mejorar las consultas por solicitudId
        await queryRunner.query(`
            CREATE INDEX IDX_decision_comite_solicitud ON decision_comite (solicitudId)
        `);

        // 5. Crear índice para las consultas de pendientes por estado y fecha
        await queryRunner.query(`
            CREATE INDEX IDX_solicitud_estado_fecha_traslado ON solicitud (estado, fechaTrasladoComite)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`DROP INDEX IDX_solicitud_estado_fecha_traslado ON solicitud`);
        await queryRunner.query(`DROP INDEX IDX_decision_comite_solicitud ON decision_comite`);

        // Eliminar tabla decision_comite
        await queryRunner.query(`DROP TABLE IF EXISTS decision_comite`);

        // Eliminar columnas de la tabla solicitud
        await queryRunner.query(`ALTER TABLE solicitud DROP COLUMN observacionesComite`);
        await queryRunner.query(`ALTER TABLE solicitud DROP COLUMN fechaDecisionComite`);
        await queryRunner.query(`ALTER TABLE solicitud DROP COLUMN fechaTrasladoComite`);

        // Revertir el ENUM de estado (quitar los nuevos estados)
        // Nota: Esto solo funcionará si no hay registros con los nuevos estados
        await queryRunner.query(`
            ALTER TABLE solicitud MODIFY COLUMN estado
            ENUM('CREADA', 'EN_ANALISIS', 'OBSERVADA', 'DENEGADA', 'APROBADA', 'DESEMBOLSADA', 'CANCELADA')
            NOT NULL DEFAULT 'CREADA'
        `);
    }
}
