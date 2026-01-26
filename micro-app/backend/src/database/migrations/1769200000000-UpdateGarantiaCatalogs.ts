import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateGarantiaCatalogs1769200000000 implements MigrationInterface {
    name = 'UpdateGarantiaCatalogs1769200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Crear tabla tipo_garantia_catalogo
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS tipo_garantia_catalogo (
                id INT NOT NULL AUTO_INCREMENT,
                codigo VARCHAR(20) NOT NULL,
                nombre VARCHAR(100) NOT NULL,
                descripcion TEXT NULL,
                activo TINYINT NOT NULL DEFAULT 1,
                createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (id),
                UNIQUE INDEX UQ_tipo_garantia_codigo (codigo)
            ) ENGINE=InnoDB
        `);

        // Insertar datos iniciales tipo_garantia_catalogo
        await queryRunner.query(`
            INSERT INTO tipo_garantia_catalogo (codigo, nombre, descripcion) VALUES
            ('HIPOTECARIA', 'Garantía Hipotecaria', 'Garantía sobre bienes inmuebles'),
            ('PRENDARIA', 'Garantía Prendaria', 'Garantía sobre bienes muebles'),
            ('FIDUCIARIA', 'Garantía Fiduciaria', 'Garantía con fiadores personales'),
            ('DOCUMENTARIA', 'Garantía Documentaria', 'Garantía con documentos como pagarés'),
            ('SGR', 'Sociedad de Garantía Recíproca', 'Certificación de SGR')
        `);

        // 2. Crear tabla tipo_inmueble
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS tipo_inmueble (
                id INT NOT NULL AUTO_INCREMENT,
                codigo VARCHAR(20) NOT NULL,
                nombre VARCHAR(100) NOT NULL,
                descripcion TEXT NULL,
                activo TINYINT NOT NULL DEFAULT 1,
                createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (id),
                UNIQUE INDEX UQ_tipo_inmueble_codigo (codigo)
            ) ENGINE=InnoDB
        `);

        // Insertar datos iniciales tipo_inmueble
        await queryRunner.query(`
            INSERT INTO tipo_inmueble (codigo, nombre) VALUES
            ('CASA', 'Casa'),
            ('TERRENO', 'Terreno'),
            ('APARTAMENTO', 'Apartamento'),
            ('LOCAL_COMERCIAL', 'Local Comercial'),
            ('BODEGA', 'Bodega'),
            ('EDIFICIO', 'Edificio'),
            ('OTRO', 'Otro')
        `);

        // 3. Crear tabla tipo_documento_garantia
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS tipo_documento_garantia (
                id INT NOT NULL AUTO_INCREMENT,
                codigo VARCHAR(20) NOT NULL,
                nombre VARCHAR(100) NOT NULL,
                descripcion TEXT NULL,
                activo TINYINT NOT NULL DEFAULT 1,
                createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (id),
                UNIQUE INDEX UQ_tipo_documento_garantia_codigo (codigo)
            ) ENGINE=InnoDB
        `);

        // Insertar datos iniciales tipo_documento_garantia
        await queryRunner.query(`
            INSERT INTO tipo_documento_garantia (codigo, nombre) VALUES
            ('PAGARE', 'Pagaré'),
            ('LETRA_CAMBIO', 'Letra de Cambio'),
            ('CHEQUE', 'Cheque')
        `);

        // 4. Modificar tabla garantia - agregar tipoGarantiaId
        await queryRunner.query(`ALTER TABLE garantia ADD COLUMN tipoGarantiaId INT NULL`);

        // Migrar datos existentes de garantia.tipoGarantia (enum) a tipoGarantiaId (FK)
        await queryRunner.query(`
            UPDATE garantia g
            SET g.tipoGarantiaId = (SELECT id FROM tipo_garantia_catalogo WHERE codigo = g.tipoGarantia)
            WHERE g.tipoGarantia IS NOT NULL
        `);

        // Hacer tipoGarantiaId NOT NULL después de migrar datos
        await queryRunner.query(`ALTER TABLE garantia MODIFY COLUMN tipoGarantiaId INT NOT NULL`);

        // Agregar FK
        await queryRunner.query(`
            ALTER TABLE garantia
            ADD CONSTRAINT FK_garantia_tipo_garantia
            FOREIGN KEY (tipoGarantiaId) REFERENCES tipo_garantia_catalogo(id)
        `);

        // Eliminar columna enum tipoGarantia
        await queryRunner.query(`ALTER TABLE garantia DROP COLUMN tipoGarantia`);

        // 5. Modificar tabla garantia_hipotecaria
        // Agregar tipoInmuebleId
        await queryRunner.query(`ALTER TABLE garantia_hipotecaria ADD COLUMN tipoInmuebleId INT NULL`);

        // Migrar datos existentes
        await queryRunner.query(`
            UPDATE garantia_hipotecaria gh
            SET gh.tipoInmuebleId = (SELECT id FROM tipo_inmueble WHERE codigo = gh.tipoInmueble)
            WHERE gh.tipoInmueble IS NOT NULL
        `);

        // Hacer NOT NULL
        await queryRunner.query(`ALTER TABLE garantia_hipotecaria MODIFY COLUMN tipoInmuebleId INT NOT NULL`);

        // Agregar FK
        await queryRunner.query(`
            ALTER TABLE garantia_hipotecaria
            ADD CONSTRAINT FK_garantia_hipotecaria_tipo_inmueble
            FOREIGN KEY (tipoInmuebleId) REFERENCES tipo_inmueble(id)
        `);

        // Eliminar columna enum tipoInmueble
        await queryRunner.query(`ALTER TABLE garantia_hipotecaria DROP COLUMN tipoInmueble`);

        // Agregar departamentoId y distritoId
        await queryRunner.query(`ALTER TABLE garantia_hipotecaria ADD COLUMN departamentoId INT NULL`);
        await queryRunner.query(`ALTER TABLE garantia_hipotecaria ADD COLUMN distritoId INT NULL`);

        await queryRunner.query(`
            ALTER TABLE garantia_hipotecaria
            ADD CONSTRAINT FK_garantia_hipotecaria_departamento
            FOREIGN KEY (departamentoId) REFERENCES departamento(idDepartamento) ON DELETE SET NULL
        `);
        await queryRunner.query(`
            ALTER TABLE garantia_hipotecaria
            ADD CONSTRAINT FK_garantia_hipotecaria_distrito
            FOREIGN KEY (distritoId) REFERENCES distrito(idDistrito) ON DELETE SET NULL
        `);

        // 6. Modificar tabla garantia_fiador
        // Agregar lugarTrabajo
        await queryRunner.query(`ALTER TABLE garantia_fiador ADD COLUMN lugarTrabajo VARCHAR(200) NULL`);

        // Eliminar tipoFiador
        await queryRunner.query(`ALTER TABLE garantia_fiador DROP COLUMN tipoFiador`);

        // 7. Modificar tabla garantia_documentaria
        // Agregar tipoDocumentoId
        await queryRunner.query(`ALTER TABLE garantia_documentaria ADD COLUMN tipoDocumentoId INT NULL`);

        // Migrar datos existentes
        await queryRunner.query(`
            UPDATE garantia_documentaria gd
            SET gd.tipoDocumentoId = (SELECT id FROM tipo_documento_garantia WHERE codigo = gd.tipoDocumento)
            WHERE gd.tipoDocumento IS NOT NULL
        `);

        // Hacer NOT NULL
        await queryRunner.query(`ALTER TABLE garantia_documentaria MODIFY COLUMN tipoDocumentoId INT NOT NULL`);

        // Agregar FK
        await queryRunner.query(`
            ALTER TABLE garantia_documentaria
            ADD CONSTRAINT FK_garantia_documentaria_tipo_documento
            FOREIGN KEY (tipoDocumentoId) REFERENCES tipo_documento_garantia(id)
        `);

        // Eliminar columnas
        await queryRunner.query(`ALTER TABLE garantia_documentaria DROP COLUMN tipoDocumento`);
        await queryRunner.query(`ALTER TABLE garantia_documentaria DROP COLUMN fechaVencimiento`);
        await queryRunner.query(`ALTER TABLE garantia_documentaria DROP COLUMN emisor`);
        await queryRunner.query(`ALTER TABLE garantia_documentaria DROP COLUMN beneficiario`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir cambios en garantia_documentaria
        await queryRunner.query(`ALTER TABLE garantia_documentaria ADD COLUMN beneficiario VARCHAR(150) NULL`);
        await queryRunner.query(`ALTER TABLE garantia_documentaria ADD COLUMN emisor VARCHAR(150) NULL`);
        await queryRunner.query(`ALTER TABLE garantia_documentaria ADD COLUMN fechaVencimiento DATE NULL`);
        await queryRunner.query(`ALTER TABLE garantia_documentaria ADD COLUMN tipoDocumento ENUM('PAGARE', 'LETRA_CAMBIO', 'CHEQUE') NULL`);
        await queryRunner.query(`ALTER TABLE garantia_documentaria DROP FOREIGN KEY FK_garantia_documentaria_tipo_documento`);
        await queryRunner.query(`ALTER TABLE garantia_documentaria DROP COLUMN tipoDocumentoId`);

        // Revertir cambios en garantia_fiador
        await queryRunner.query(`ALTER TABLE garantia_fiador ADD COLUMN tipoFiador ENUM('SOLIDARIO', 'SIMPLE') NOT NULL DEFAULT 'SOLIDARIO'`);
        await queryRunner.query(`ALTER TABLE garantia_fiador DROP COLUMN lugarTrabajo`);

        // Revertir cambios en garantia_hipotecaria
        await queryRunner.query(`ALTER TABLE garantia_hipotecaria DROP FOREIGN KEY FK_garantia_hipotecaria_distrito`);
        await queryRunner.query(`ALTER TABLE garantia_hipotecaria DROP FOREIGN KEY FK_garantia_hipotecaria_departamento`);
        await queryRunner.query(`ALTER TABLE garantia_hipotecaria DROP COLUMN distritoId`);
        await queryRunner.query(`ALTER TABLE garantia_hipotecaria DROP COLUMN departamentoId`);
        await queryRunner.query(`ALTER TABLE garantia_hipotecaria ADD COLUMN tipoInmueble ENUM('CASA', 'TERRENO', 'APARTAMENTO', 'LOCAL_COMERCIAL', 'BODEGA', 'EDIFICIO', 'OTRO') NOT NULL DEFAULT 'CASA'`);
        await queryRunner.query(`ALTER TABLE garantia_hipotecaria DROP FOREIGN KEY FK_garantia_hipotecaria_tipo_inmueble`);
        await queryRunner.query(`ALTER TABLE garantia_hipotecaria DROP COLUMN tipoInmuebleId`);

        // Revertir cambios en garantia
        await queryRunner.query(`ALTER TABLE garantia ADD COLUMN tipoGarantia ENUM('HIPOTECARIA', 'PRENDARIA', 'FIDUCIARIA', 'DOCUMENTARIA', 'SGR') NULL`);
        await queryRunner.query(`ALTER TABLE garantia DROP FOREIGN KEY FK_garantia_tipo_garantia`);
        await queryRunner.query(`ALTER TABLE garantia DROP COLUMN tipoGarantiaId`);

        // Eliminar tablas de catálogo
        await queryRunner.query(`DROP TABLE IF EXISTS tipo_documento_garantia`);
        await queryRunner.query(`DROP TABLE IF EXISTS tipo_inmueble`);
        await queryRunner.query(`DROP TABLE IF EXISTS tipo_garantia_catalogo`);
    }
}
