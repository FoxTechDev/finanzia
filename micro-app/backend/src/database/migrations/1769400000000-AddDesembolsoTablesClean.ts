import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDesembolsoTablesClean1769400000000 implements MigrationInterface {
  name = 'AddDesembolsoTablesClean1769400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla tipo_deduccion (catálogo)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`tipo_deduccion\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`codigo\` varchar(20) NOT NULL,
        \`nombre\` varchar(100) NOT NULL,
        \`descripcion\` text NULL,
        \`tipoCalculoDefault\` enum ('FIJO', 'PORCENTAJE') NOT NULL DEFAULT 'PORCENTAJE',
        \`valorDefault\` decimal(14,4) NOT NULL DEFAULT '0.0000',
        \`activo\` tinyint NOT NULL DEFAULT 1,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_tipo_deduccion_codigo\` (\`codigo\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Crear tabla tipo_recargo (catálogo)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`tipo_recargo\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`codigo\` varchar(20) NOT NULL,
        \`nombre\` varchar(100) NOT NULL,
        \`descripcion\` text NULL,
        \`tipoCalculoDefault\` enum ('FIJO', 'PORCENTAJE') NOT NULL DEFAULT 'FIJO',
        \`valorDefault\` decimal(14,4) NOT NULL DEFAULT '0.0000',
        \`activo\` tinyint NOT NULL DEFAULT 1,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_tipo_recargo_codigo\` (\`codigo\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Crear tabla prestamo
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`prestamo\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`solicitudId\` int NOT NULL,
        \`personaId\` int NOT NULL,
        \`numeroCredito\` varchar(20) NOT NULL,
        \`tipoCreditoId\` int NOT NULL,
        \`montoAutorizado\` decimal(14,2) NOT NULL,
        \`montoDesembolsado\` decimal(14,2) NOT NULL,
        \`plazoAutorizado\` int NOT NULL,
        \`tasaInteres\` decimal(6,4) NOT NULL,
        \`tasaInteresMoratorio\` decimal(6,4) NOT NULL,
        \`tipoInteres\` enum ('FLAT', 'AMORTIZADO') NOT NULL DEFAULT 'FLAT',
        \`periodicidadPago\` enum ('DIARIO', 'SEMANAL', 'QUINCENAL', 'MENSUAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL', 'AL_VENCIMIENTO') NOT NULL DEFAULT 'MENSUAL',
        \`cuotaNormal\` decimal(14,2) NOT NULL,
        \`cuotaTotal\` decimal(14,2) NOT NULL,
        \`numeroCuotas\` int NOT NULL,
        \`totalInteres\` decimal(14,2) NOT NULL,
        \`totalRecargos\` decimal(14,2) NOT NULL,
        \`totalPagar\` decimal(14,2) NOT NULL,
        \`saldoCapital\` decimal(14,2) NOT NULL,
        \`saldoInteres\` decimal(14,2) NOT NULL DEFAULT '0.00',
        \`capitalMora\` decimal(14,2) NOT NULL DEFAULT '0.00',
        \`interesMora\` decimal(14,2) NOT NULL DEFAULT '0.00',
        \`diasMora\` int NOT NULL DEFAULT '0',
        \`fechaOtorgamiento\` date NOT NULL,
        \`fechaPrimeraCuota\` date NOT NULL,
        \`fechaVencimiento\` date NOT NULL,
        \`fechaUltimoPago\` date NULL,
        \`fechaCancelacion\` date NULL,
        \`categoriaNCB022\` enum ('A', 'B', 'C', 'D', 'E') NOT NULL DEFAULT 'A',
        \`estado\` enum ('VIGENTE', 'MORA', 'CANCELADO', 'CASTIGADO') NOT NULL DEFAULT 'VIGENTE',
        \`usuarioDesembolsoId\` int NULL,
        \`nombreUsuarioDesembolso\` varchar(150) NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_prestamo_solicitudId\` (\`solicitudId\`),
        UNIQUE INDEX \`IDX_prestamo_numeroCredito\` (\`numeroCredito\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Crear tabla plan_pago
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`plan_pago\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`prestamoId\` int NOT NULL,
        \`numeroCuota\` int NOT NULL,
        \`fechaVencimiento\` date NOT NULL,
        \`capital\` decimal(14,2) NOT NULL,
        \`interes\` decimal(14,2) NOT NULL,
        \`recargos\` decimal(14,2) NOT NULL DEFAULT '0.00',
        \`cuotaTotal\` decimal(14,2) NOT NULL,
        \`saldoCapital\` decimal(14,2) NOT NULL,
        \`capitalPagado\` decimal(14,2) NOT NULL DEFAULT '0.00',
        \`interesPagado\` decimal(14,2) NOT NULL DEFAULT '0.00',
        \`recargosPagado\` decimal(14,2) NOT NULL DEFAULT '0.00',
        \`fechaPago\` date NULL,
        \`diasMora\` int NOT NULL DEFAULT '0',
        \`interesMoratorio\` decimal(14,2) NOT NULL DEFAULT '0.00',
        \`interesMoratorioPagado\` decimal(14,2) NOT NULL DEFAULT '0.00',
        \`estado\` enum ('PENDIENTE', 'PAGADA', 'PARCIAL', 'MORA') NOT NULL DEFAULT 'PENDIENTE',
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX \`IDX_plan_pago_prestamoId\` (\`prestamoId\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Crear tabla deduccion_prestamo
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`deduccion_prestamo\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`prestamoId\` int NOT NULL,
        \`tipoDeduccionId\` int NULL,
        \`nombre\` varchar(100) NOT NULL,
        \`tipoCalculo\` enum ('FIJO', 'PORCENTAJE') NOT NULL DEFAULT 'PORCENTAJE',
        \`valor\` decimal(14,4) NOT NULL,
        \`montoCalculado\` decimal(14,2) NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX \`IDX_deduccion_prestamo_prestamoId\` (\`prestamoId\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Crear tabla recargo_prestamo
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`recargo_prestamo\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`prestamoId\` int NOT NULL,
        \`tipoRecargoId\` int NULL,
        \`nombre\` varchar(100) NOT NULL,
        \`tipoCalculo\` enum ('FIJO', 'PORCENTAJE') NOT NULL DEFAULT 'FIJO',
        \`valor\` decimal(14,4) NOT NULL,
        \`montoCalculado\` decimal(14,2) NOT NULL,
        \`aplicaDesde\` int NOT NULL DEFAULT '1',
        \`aplicaHasta\` int NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX \`IDX_recargo_prestamo_prestamoId\` (\`prestamoId\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Agregar foreign keys
    await queryRunner.query(`
      ALTER TABLE \`prestamo\`
      ADD CONSTRAINT \`FK_prestamo_solicitud\` FOREIGN KEY (\`solicitudId\`) REFERENCES \`solicitud\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`prestamo\`
      ADD CONSTRAINT \`FK_prestamo_persona\` FOREIGN KEY (\`personaId\`) REFERENCES \`persona\`(\`idPersona\`) ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`prestamo\`
      ADD CONSTRAINT \`FK_prestamo_tipoCredito\` FOREIGN KEY (\`tipoCreditoId\`) REFERENCES \`tipoCredito\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`plan_pago\`
      ADD CONSTRAINT \`FK_plan_pago_prestamo\` FOREIGN KEY (\`prestamoId\`) REFERENCES \`prestamo\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`deduccion_prestamo\`
      ADD CONSTRAINT \`FK_deduccion_prestamo_prestamo\` FOREIGN KEY (\`prestamoId\`) REFERENCES \`prestamo\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`deduccion_prestamo\`
      ADD CONSTRAINT \`FK_deduccion_prestamo_tipo\` FOREIGN KEY (\`tipoDeduccionId\`) REFERENCES \`tipo_deduccion\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`recargo_prestamo\`
      ADD CONSTRAINT \`FK_recargo_prestamo_prestamo\` FOREIGN KEY (\`prestamoId\`) REFERENCES \`prestamo\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`recargo_prestamo\`
      ADD CONSTRAINT \`FK_recargo_prestamo_tipo\` FOREIGN KEY (\`tipoRecargoId\`) REFERENCES \`tipo_recargo\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Insertar datos iniciales de catálogos
    await queryRunner.query(`
      INSERT INTO \`tipo_deduccion\` (\`codigo\`, \`nombre\`, \`descripcion\`, \`tipoCalculoDefault\`, \`valorDefault\`) VALUES
      ('COM', 'Comisión por Desembolso', 'Comisión administrativa por el otorgamiento del crédito', 'PORCENTAJE', 2.0000),
      ('BURO', 'Consulta Buró de Crédito', 'Costo por consulta al buró de crédito', 'FIJO', 5.0000),
      ('FORM', 'Formalización', 'Gastos de formalización del crédito', 'FIJO', 10.0000),
      ('SEG_DES', 'Seguro de Desgravamen', 'Prima de seguro de vida sobre el crédito', 'PORCENTAJE', 0.5000)
    `);

    await queryRunner.query(`
      INSERT INTO \`tipo_recargo\` (\`codigo\`, \`nombre\`, \`descripcion\`, \`tipoCalculoDefault\`, \`valorDefault\`) VALUES
      ('SEG_VIDA', 'Seguro de Vida', 'Seguro de vida mensual', 'FIJO', 5.0000),
      ('AHORRO', 'Ahorro Obligatorio', 'Ahorro programado mensual', 'PORCENTAJE', 1.0000),
      ('GPS', 'Servicio GPS', 'Monitoreo GPS para vehículos', 'FIJO', 15.0000),
      ('MANT', 'Mantenimiento de Cuenta', 'Costo mensual de mantenimiento', 'FIJO', 2.0000)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign keys
    await queryRunner.query(`ALTER TABLE \`recargo_prestamo\` DROP FOREIGN KEY \`FK_recargo_prestamo_tipo\``);
    await queryRunner.query(`ALTER TABLE \`recargo_prestamo\` DROP FOREIGN KEY \`FK_recargo_prestamo_prestamo\``);
    await queryRunner.query(`ALTER TABLE \`deduccion_prestamo\` DROP FOREIGN KEY \`FK_deduccion_prestamo_tipo\``);
    await queryRunner.query(`ALTER TABLE \`deduccion_prestamo\` DROP FOREIGN KEY \`FK_deduccion_prestamo_prestamo\``);
    await queryRunner.query(`ALTER TABLE \`plan_pago\` DROP FOREIGN KEY \`FK_plan_pago_prestamo\``);
    await queryRunner.query(`ALTER TABLE \`prestamo\` DROP FOREIGN KEY \`FK_prestamo_tipoCredito\``);
    await queryRunner.query(`ALTER TABLE \`prestamo\` DROP FOREIGN KEY \`FK_prestamo_persona\``);
    await queryRunner.query(`ALTER TABLE \`prestamo\` DROP FOREIGN KEY \`FK_prestamo_solicitud\``);

    // Eliminar tablas
    await queryRunner.query(`DROP TABLE IF EXISTS \`recargo_prestamo\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`deduccion_prestamo\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`plan_pago\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`prestamo\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`tipo_recargo\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`tipo_deduccion\``);
  }
}
