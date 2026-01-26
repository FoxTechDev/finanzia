import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCreditosTables1769055162256 implements MigrationInterface {
    name = 'CreateCreditosTables1769055162256'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`actividadEconomica\` (\`idActividad\` int NOT NULL AUTO_INCREMENT, \`idPersona\` int NOT NULL, \`tipoActividad\` varchar(60) NOT NULL, \`nombreEmpresa\` varchar(150) NULL, \`cargoOcupacion\` varchar(120) NULL, \`ingresosMensuales\` decimal(14,2) NULL, \`idDepartamento\` int NOT NULL, \`idMunicipio\` int NOT NULL, \`idDistrito\` int NOT NULL, \`detalleDireccion\` varchar(200) NULL, \`latitud\` decimal(10,7) NULL, \`longitud\` decimal(10,7) NULL, UNIQUE INDEX \`REL_6baa58b643e3e7b958e77881f7\` (\`idPersona\`), PRIMARY KEY (\`idActividad\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`referenciaFamiliar\` (\`idFamiliar\` int NOT NULL AUTO_INCREMENT, \`idPersona\` int NOT NULL, \`nombreFamiliar\` varchar(150) NOT NULL, \`parentesco\` varchar(80) NOT NULL, \`telefonoFamiliar\` varchar(30) NULL, \`direccionFamiliar\` varchar(200) NULL, PRIMARY KEY (\`idFamiliar\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`referenciaPersonal\` (\`idReferencia\` int NOT NULL AUTO_INCREMENT, \`idPersona\` int NOT NULL, \`nombreReferencia\` varchar(150) NOT NULL, \`relacion\` varchar(80) NOT NULL, \`telefonoReferencia\` varchar(30) NULL, \`direccionReferencia\` varchar(200) NULL, PRIMARY KEY (\`idReferencia\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`lineaCredito\` (\`id\` int NOT NULL AUTO_INCREMENT, \`codigo\` varchar(10) NOT NULL, \`nombre\` varchar(100) NOT NULL, \`descripcion\` varchar(255) NULL, \`activo\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_2d51b32a567d2460f4abb6b0f7\` (\`codigo\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`solicitudHistorial\` (\`id\` int NOT NULL AUTO_INCREMENT, \`solicitudId\` int NOT NULL, \`estadoAnterior\` varchar(20) NOT NULL, \`estadoNuevo\` varchar(20) NOT NULL, \`observacion\` text NULL, \`usuarioId\` int NULL, \`nombreUsuario\` varchar(150) NULL, \`ipAddress\` varchar(50) NULL, \`fechaCambio\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`solicitud\` (\`id\` int NOT NULL AUTO_INCREMENT, \`numeroSolicitud\` varchar(20) NOT NULL, \`personaId\` int NOT NULL, \`lineaCreditoId\` int NOT NULL, \`tipoCreditoId\` int NOT NULL, \`montoSolicitado\` decimal(14,2) NOT NULL, \`plazoSolicitado\` int NOT NULL, \`tasaInteresPropuesta\` decimal(5,2) NOT NULL, \`destinoCredito\` enum ('CAPITAL_TRABAJO', 'ACTIVO_FIJO', 'CONSUMO_PERSONAL', 'VIVIENDA_NUEVA', 'VIVIENDA_USADA', 'MEJORA_VIVIENDA', 'CONSOLIDACION_DEUDAS', 'EDUCACION', 'SALUD', 'VEHICULO', 'OTRO') NOT NULL DEFAULT 'CONSUMO_PERSONAL', \`descripcionDestino\` text NULL, \`estado\` enum ('CREADA', 'EN_ANALISIS', 'OBSERVADA', 'DENEGADA', 'APROBADA', 'DESEMBOLSADA', 'CANCELADA') NOT NULL DEFAULT 'CREADA', \`montoAprobado\` decimal(14,2) NULL, \`plazoAprobado\` int NULL, \`tasaInteresAprobada\` decimal(5,2) NULL, \`fechaSolicitud\` date NOT NULL, \`fechaAnalisis\` date NULL, \`fechaAprobacion\` date NULL, \`fechaDenegacion\` date NULL, \`fechaVencimiento\` date NULL, \`analistaId\` int NULL, \`nombreAnalista\` varchar(150) NULL, \`aprobadorId\` int NULL, \`nombreAprobador\` varchar(150) NULL, \`observaciones\` text NULL, \`motivoRechazo\` text NULL, \`scoreCredito\` decimal(5,2) NULL, \`categoriaRiesgo\` varchar(1) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_caf819fede6d190af32389eba0\` (\`numeroSolicitud\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tipoCredito\` (\`id\` int NOT NULL AUTO_INCREMENT, \`codigo\` varchar(20) NOT NULL, \`nombre\` varchar(150) NOT NULL, \`descripcion\` text NULL, \`lineaCreditoId\` int NOT NULL, \`tasaInteres\` decimal(5,2) NOT NULL, \`tasaInteresMinima\` decimal(5,2) NOT NULL, \`tasaInteresMaxima\` decimal(5,2) NOT NULL, \`tasaInteresMoratorio\` decimal(5,2) NOT NULL, \`montoMinimo\` decimal(14,2) NOT NULL, \`montoMaximo\` decimal(14,2) NOT NULL, \`plazoMinimo\` int NOT NULL, \`plazoMaximo\` int NOT NULL, \`periodicidadPago\` varchar(20) NOT NULL DEFAULT 'mensual', \`tipoCuota\` varchar(20) NOT NULL DEFAULT 'fija', \`diasGracia\` int NOT NULL DEFAULT '0', \`porcentajeFinanciamiento\` decimal(5,2) NULL, \`requiereGarantia\` tinyint NOT NULL DEFAULT 0, \`fechaVigenciaDesde\` date NOT NULL, \`fechaVigenciaHasta\` date NULL, \`activo\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_57fc39e304c6a0807e41a9a80d\` (\`codigo\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`actividadEconomica\` ADD CONSTRAINT \`FK_6baa58b643e3e7b958e77881f73\` FOREIGN KEY (\`idPersona\`) REFERENCES \`persona\`(\`idPersona\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`actividadEconomica\` ADD CONSTRAINT \`FK_fd607829e236752a2d8cc458725\` FOREIGN KEY (\`idDepartamento\`) REFERENCES \`departamento\`(\`idDepartamento\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`actividadEconomica\` ADD CONSTRAINT \`FK_2d5f6c59dc20a75763cde2702e3\` FOREIGN KEY (\`idMunicipio\`) REFERENCES \`municipio\`(\`idMunicipio\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`actividadEconomica\` ADD CONSTRAINT \`FK_0a2eb709b571af3452d41044a2b\` FOREIGN KEY (\`idDistrito\`) REFERENCES \`distrito\`(\`idDistrito\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`referenciaFamiliar\` ADD CONSTRAINT \`FK_dd8bef830766a97d899f92459d4\` FOREIGN KEY (\`idPersona\`) REFERENCES \`persona\`(\`idPersona\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`referenciaPersonal\` ADD CONSTRAINT \`FK_8232c80c2ced882f99345abe00f\` FOREIGN KEY (\`idPersona\`) REFERENCES \`persona\`(\`idPersona\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`solicitudHistorial\` ADD CONSTRAINT \`FK_58b7f32b4b570c438855f20a87b\` FOREIGN KEY (\`solicitudId\`) REFERENCES \`solicitud\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud\` ADD CONSTRAINT \`FK_3b9c019a3ee301b41b50f62b0c0\` FOREIGN KEY (\`personaId\`) REFERENCES \`persona\`(\`idPersona\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud\` ADD CONSTRAINT \`FK_db83f7a0a62749ea3f327fbdb50\` FOREIGN KEY (\`lineaCreditoId\`) REFERENCES \`lineaCredito\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud\` ADD CONSTRAINT \`FK_f5ca449a6aec8d2376e7e3b0f2c\` FOREIGN KEY (\`tipoCreditoId\`) REFERENCES \`tipoCredito\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tipoCredito\` ADD CONSTRAINT \`FK_85b879aee42ff43a9ac8daadd56\` FOREIGN KEY (\`lineaCreditoId\`) REFERENCES \`lineaCredito\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tipoCredito\` DROP FOREIGN KEY \`FK_85b879aee42ff43a9ac8daadd56\``);
        await queryRunner.query(`ALTER TABLE \`solicitud\` DROP FOREIGN KEY \`FK_f5ca449a6aec8d2376e7e3b0f2c\``);
        await queryRunner.query(`ALTER TABLE \`solicitud\` DROP FOREIGN KEY \`FK_db83f7a0a62749ea3f327fbdb50\``);
        await queryRunner.query(`ALTER TABLE \`solicitud\` DROP FOREIGN KEY \`FK_3b9c019a3ee301b41b50f62b0c0\``);
        await queryRunner.query(`ALTER TABLE \`solicitudHistorial\` DROP FOREIGN KEY \`FK_58b7f32b4b570c438855f20a87b\``);
        await queryRunner.query(`ALTER TABLE \`referenciaPersonal\` DROP FOREIGN KEY \`FK_8232c80c2ced882f99345abe00f\``);
        await queryRunner.query(`ALTER TABLE \`referenciaFamiliar\` DROP FOREIGN KEY \`FK_dd8bef830766a97d899f92459d4\``);
        await queryRunner.query(`ALTER TABLE \`actividadEconomica\` DROP FOREIGN KEY \`FK_0a2eb709b571af3452d41044a2b\``);
        await queryRunner.query(`ALTER TABLE \`actividadEconomica\` DROP FOREIGN KEY \`FK_2d5f6c59dc20a75763cde2702e3\``);
        await queryRunner.query(`ALTER TABLE \`actividadEconomica\` DROP FOREIGN KEY \`FK_fd607829e236752a2d8cc458725\``);
        await queryRunner.query(`ALTER TABLE \`actividadEconomica\` DROP FOREIGN KEY \`FK_6baa58b643e3e7b958e77881f73\``);
        await queryRunner.query(`DROP INDEX \`IDX_57fc39e304c6a0807e41a9a80d\` ON \`tipoCredito\``);
        await queryRunner.query(`DROP TABLE \`tipoCredito\``);
        await queryRunner.query(`DROP INDEX \`IDX_caf819fede6d190af32389eba0\` ON \`solicitud\``);
        await queryRunner.query(`DROP TABLE \`solicitud\``);
        await queryRunner.query(`DROP TABLE \`solicitudHistorial\``);
        await queryRunner.query(`DROP INDEX \`IDX_2d51b32a567d2460f4abb6b0f7\` ON \`lineaCredito\``);
        await queryRunner.query(`DROP TABLE \`lineaCredito\``);
        await queryRunner.query(`DROP TABLE \`referenciaPersonal\``);
        await queryRunner.query(`DROP TABLE \`referenciaFamiliar\``);
        await queryRunner.query(`DROP INDEX \`REL_6baa58b643e3e7b958e77881f7\` ON \`actividadEconomica\``);
        await queryRunner.query(`DROP TABLE \`actividadEconomica\``);
    }

}
