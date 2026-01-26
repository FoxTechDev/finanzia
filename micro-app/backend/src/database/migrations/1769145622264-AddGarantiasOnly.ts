import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGarantiasOnly1769145622264 implements MigrationInterface {
    name = 'AddGarantiasOnly1769145622264'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla principal de garantías
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS garantia (
                id INT NOT NULL AUTO_INCREMENT,
                solicitudId INT NOT NULL,
                tipoGarantia ENUM('HIPOTECARIA', 'PRENDARIA', 'FIDUCIARIA', 'DOCUMENTARIA', 'SGR') NOT NULL,
                descripcion TEXT NULL,
                valorEstimado DECIMAL(14,2) NULL,
                estado ENUM('PENDIENTE', 'CONSTITUIDA', 'LIBERADA', 'EJECUTADA') NOT NULL DEFAULT 'PENDIENTE',
                fechaConstitucion DATE NULL,
                fechaVencimiento DATE NULL,
                observaciones TEXT NULL,
                createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (id),
                CONSTRAINT FK_garantia_solicitud FOREIGN KEY (solicitudId) REFERENCES solicitud(id) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);

        // Crear tabla de garantía hipotecaria
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS garantia_hipotecaria (
                id INT NOT NULL AUTO_INCREMENT,
                garantiaId INT NOT NULL,
                tipoInmueble ENUM('CASA', 'TERRENO', 'APARTAMENTO', 'LOCAL_COMERCIAL', 'BODEGA', 'EDIFICIO', 'OTRO') NOT NULL DEFAULT 'CASA',
                direccion TEXT NULL,
                municipioId INT NULL,
                numeroRegistro VARCHAR(50) NULL,
                folioRegistro VARCHAR(50) NULL,
                libroRegistro VARCHAR(50) NULL,
                areaTerreno DECIMAL(10,2) NULL,
                areaConstruccion DECIMAL(10,2) NULL,
                valorPericial DECIMAL(14,2) NULL,
                nombrePerito VARCHAR(150) NULL,
                fechaAvaluo DATE NULL,
                PRIMARY KEY (id),
                UNIQUE INDEX UQ_garantia_hipotecaria_garantiaId (garantiaId),
                CONSTRAINT FK_garantia_hipotecaria_garantia FOREIGN KEY (garantiaId) REFERENCES garantia(id) ON DELETE CASCADE,
                CONSTRAINT FK_garantia_hipotecaria_municipio FOREIGN KEY (municipioId) REFERENCES municipio(idMunicipio) ON DELETE SET NULL
            ) ENGINE=InnoDB
        `);

        // Crear tabla de garantía prendaria
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS garantia_prendaria (
                id INT NOT NULL AUTO_INCREMENT,
                garantiaId INT NOT NULL,
                tipoBien VARCHAR(100) NULL,
                descripcionBien TEXT NULL,
                marca VARCHAR(100) NULL,
                modelo VARCHAR(100) NULL,
                serie VARCHAR(100) NULL,
                placa VARCHAR(20) NULL,
                anio INT NULL,
                valorPericial DECIMAL(14,2) NULL,
                ubicacionBien TEXT NULL,
                PRIMARY KEY (id),
                UNIQUE INDEX UQ_garantia_prendaria_garantiaId (garantiaId),
                CONSTRAINT FK_garantia_prendaria_garantia FOREIGN KEY (garantiaId) REFERENCES garantia(id) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);

        // Crear tabla de garantía fiador
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS garantia_fiador (
                id INT NOT NULL AUTO_INCREMENT,
                garantiaId INT NOT NULL,
                personaFiadorId INT NOT NULL,
                parentesco VARCHAR(50) NULL,
                ocupacion VARCHAR(100) NULL,
                ingresoMensual DECIMAL(14,2) NULL,
                direccionLaboral TEXT NULL,
                telefonoLaboral VARCHAR(30) NULL,
                tipoFiador ENUM('SOLIDARIO', 'SIMPLE') NOT NULL DEFAULT 'SOLIDARIO',
                PRIMARY KEY (id),
                UNIQUE INDEX UQ_garantia_fiador_garantiaId (garantiaId),
                CONSTRAINT FK_garantia_fiador_garantia FOREIGN KEY (garantiaId) REFERENCES garantia(id) ON DELETE CASCADE,
                CONSTRAINT FK_garantia_fiador_persona FOREIGN KEY (personaFiadorId) REFERENCES persona(idPersona) ON DELETE RESTRICT
            ) ENGINE=InnoDB
        `);

        // Crear tabla de garantía documentaria
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS garantia_documentaria (
                id INT NOT NULL AUTO_INCREMENT,
                garantiaId INT NOT NULL,
                tipoDocumento ENUM('PAGARE', 'LETRA_CAMBIO', 'CHEQUE') NOT NULL DEFAULT 'PAGARE',
                numeroDocumento VARCHAR(50) NULL,
                fechaEmision DATE NULL,
                fechaVencimiento DATE NULL,
                montoDocumento DECIMAL(14,2) NULL,
                emisor VARCHAR(150) NULL,
                beneficiario VARCHAR(150) NULL,
                PRIMARY KEY (id),
                UNIQUE INDEX UQ_garantia_documentaria_garantiaId (garantiaId),
                CONSTRAINT FK_garantia_documentaria_garantia FOREIGN KEY (garantiaId) REFERENCES garantia(id) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);

        // Agregar campos de análisis del asesor a solicitud
        // Verificar si las columnas existen antes de agregarlas
        const columns = await queryRunner.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'solicitud'
        `);
        const existingColumns = columns.map((c: any) => c.COLUMN_NAME);

        if (!existingColumns.includes('analisisAsesor')) {
            await queryRunner.query(`ALTER TABLE solicitud ADD COLUMN analisisAsesor TEXT NULL`);
        }
        if (!existingColumns.includes('recomendacionAsesor')) {
            await queryRunner.query(`ALTER TABLE solicitud ADD COLUMN recomendacionAsesor ENUM('APROBAR', 'RECHAZAR', 'OBSERVAR') NULL`);
        }
        if (!existingColumns.includes('comentariosRiesgo')) {
            await queryRunner.query(`ALTER TABLE solicitud ADD COLUMN comentariosRiesgo TEXT NULL`);
        }
        if (!existingColumns.includes('capacidadPago')) {
            await queryRunner.query(`ALTER TABLE solicitud ADD COLUMN capacidadPago DECIMAL(14,2) NULL`);
        }
        if (!existingColumns.includes('antecedentesCliente')) {
            await queryRunner.query(`ALTER TABLE solicitud ADD COLUMN antecedentesCliente TEXT NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Verificar columnas existentes
        const columns = await queryRunner.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'solicitud'
        `);
        const existingColumns = columns.map((c: any) => c.COLUMN_NAME);

        // Eliminar campos de análisis del asesor
        if (existingColumns.includes('antecedentesCliente')) {
            await queryRunner.query(`ALTER TABLE solicitud DROP COLUMN antecedentesCliente`);
        }
        if (existingColumns.includes('capacidadPago')) {
            await queryRunner.query(`ALTER TABLE solicitud DROP COLUMN capacidadPago`);
        }
        if (existingColumns.includes('comentariosRiesgo')) {
            await queryRunner.query(`ALTER TABLE solicitud DROP COLUMN comentariosRiesgo`);
        }
        if (existingColumns.includes('recomendacionAsesor')) {
            await queryRunner.query(`ALTER TABLE solicitud DROP COLUMN recomendacionAsesor`);
        }
        if (existingColumns.includes('analisisAsesor')) {
            await queryRunner.query(`ALTER TABLE solicitud DROP COLUMN analisisAsesor`);
        }

        // Eliminar tablas de garantías
        await queryRunner.query(`DROP TABLE IF EXISTS garantia_documentaria`);
        await queryRunner.query(`DROP TABLE IF EXISTS garantia_fiador`);
        await queryRunner.query(`DROP TABLE IF EXISTS garantia_prendaria`);
        await queryRunner.query(`DROP TABLE IF EXISTS garantia_hipotecaria`);
        await queryRunner.query(`DROP TABLE IF EXISTS garantia`);
    }
}
