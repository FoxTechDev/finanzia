import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAhorrosTables1780000000000 implements MigrationInterface {
  name = 'CreateAhorrosTables1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. linea_ahorro
    await queryRunner.query(`
      CREATE TABLE \`linea_ahorro\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`codigo\` varchar(10) NOT NULL,
        \`nombre\` varchar(50) NOT NULL,
        \`descripcion\` varchar(255) NULL,
        \`activo\` tinyint NOT NULL DEFAULT 1,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_linea_ahorro_codigo\` (\`codigo\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // 2. tipo_ahorro
    await queryRunner.query(`
      CREATE TABLE \`tipo_ahorro\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`lineaAhorroId\` int NOT NULL,
        \`nombre\` varchar(50) NOT NULL,
        \`descripcion\` varchar(255) NULL,
        \`esPlazo\` tinyint NOT NULL DEFAULT 0,
        \`tasaMin\` decimal(8,4) NOT NULL DEFAULT 0,
        \`tasaMax\` decimal(8,4) NOT NULL DEFAULT 0,
        \`tasaVigente\` decimal(8,4) NOT NULL DEFAULT 0,
        \`plazo\` int NOT NULL DEFAULT 0,
        \`plazoMin\` int NOT NULL DEFAULT 0,
        \`plazoMax\` int NOT NULL DEFAULT 0,
        \`montoAperturaMin\` decimal(14,2) NOT NULL DEFAULT 0,
        \`diasGracia\` int NOT NULL DEFAULT 0,
        \`activo\` tinyint NOT NULL DEFAULT 1,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      ALTER TABLE \`tipo_ahorro\`
      ADD CONSTRAINT \`FK_tipo_ahorro_linea\`
      FOREIGN KEY (\`lineaAhorroId\`) REFERENCES \`linea_ahorro\`(\`id\`)
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    // 3. estado_cuenta_ahorro
    await queryRunner.query(`
      CREATE TABLE \`estado_cuenta_ahorro\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`codigo\` varchar(20) NOT NULL,
        \`nombre\` varchar(50) NOT NULL,
        \`activo\` tinyint NOT NULL DEFAULT 1,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_estado_cuenta_ahorro_codigo\` (\`codigo\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // 4. tipo_capitalizacion
    await queryRunner.query(`
      CREATE TABLE \`tipo_capitalizacion\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`codigo\` varchar(20) NOT NULL,
        \`nombre\` varchar(50) NOT NULL,
        \`dias\` int NOT NULL DEFAULT 0,
        \`activo\` tinyint NOT NULL DEFAULT 1,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_tipo_capitalizacion_codigo\` (\`codigo\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // 5. naturaleza_movimiento_ahorro
    await queryRunner.query(`
      CREATE TABLE \`naturaleza_movimiento_ahorro\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`codigo\` varchar(10) NOT NULL,
        \`nombre\` varchar(50) NOT NULL,
        \`activo\` tinyint NOT NULL DEFAULT 1,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_naturaleza_mov_codigo\` (\`codigo\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // 6. tipo_transaccion_ahorro
    await queryRunner.query(`
      CREATE TABLE \`tipo_transaccion_ahorro\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`codigo\` varchar(20) NOT NULL,
        \`nombre\` varchar(50) NOT NULL,
        \`naturalezaId\` int NULL,
        \`activo\` tinyint NOT NULL DEFAULT 1,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_tipo_transaccion_ahorro_codigo\` (\`codigo\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      ALTER TABLE \`tipo_transaccion_ahorro\`
      ADD CONSTRAINT \`FK_tipo_transaccion_naturaleza\`
      FOREIGN KEY (\`naturalezaId\`) REFERENCES \`naturaleza_movimiento_ahorro\`(\`id\`)
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // 7. cuenta_ahorro
    await queryRunner.query(`
      CREATE TABLE \`cuenta_ahorro\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`noCuenta\` varchar(20) NOT NULL,
        \`personaId\` int NOT NULL,
        \`tipoAhorroId\` int NOT NULL,
        \`estadoId\` int NOT NULL,
        \`tipoCapitalizacionId\` int NULL,
        \`fechaApertura\` date NOT NULL,
        \`fechaVencimiento\` date NULL,
        \`monto\` decimal(14,2) NOT NULL DEFAULT 0,
        \`plazo\` int NOT NULL DEFAULT 0,
        \`tasaInteres\` decimal(8,4) NOT NULL DEFAULT 0,
        \`saldo\` decimal(14,2) NOT NULL DEFAULT 0,
        \`saldoDisponible\` decimal(14,2) NOT NULL DEFAULT 0,
        \`pignorado\` tinyint NOT NULL DEFAULT 0,
        \`montoPignorado\` decimal(14,2) NOT NULL DEFAULT 0,
        \`fechaUltMovimiento\` date NULL,
        \`saldoInteres\` decimal(14,2) NOT NULL DEFAULT 0,
        \`fechaCancelacion\` date NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_cuenta_ahorro_noCuenta\` (\`noCuenta\`),
        INDEX \`IDX_cuenta_ahorro_personaId\` (\`personaId\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      ALTER TABLE \`cuenta_ahorro\`
      ADD CONSTRAINT \`FK_cuenta_ahorro_persona\`
      FOREIGN KEY (\`personaId\`) REFERENCES \`persona\`(\`idPersona\`)
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE \`cuenta_ahorro\`
      ADD CONSTRAINT \`FK_cuenta_ahorro_tipo\`
      FOREIGN KEY (\`tipoAhorroId\`) REFERENCES \`tipo_ahorro\`(\`id\`)
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE \`cuenta_ahorro\`
      ADD CONSTRAINT \`FK_cuenta_ahorro_estado\`
      FOREIGN KEY (\`estadoId\`) REFERENCES \`estado_cuenta_ahorro\`(\`id\`)
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE \`cuenta_ahorro\`
      ADD CONSTRAINT \`FK_cuenta_ahorro_tipo_cap\`
      FOREIGN KEY (\`tipoCapitalizacionId\`) REFERENCES \`tipo_capitalizacion\`(\`id\`)
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // 8. transaccion_ahorro
    await queryRunner.query(`
      CREATE TABLE \`transaccion_ahorro\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`cuentaAhorroId\` int NOT NULL,
        \`fecha\` date NOT NULL,
        \`monto\` decimal(14,2) NOT NULL,
        \`naturalezaId\` int NOT NULL,
        \`tipoTransaccionId\` int NOT NULL,
        \`saldoAnterior\` decimal(14,2) NOT NULL,
        \`nuevoSaldo\` decimal(14,2) NOT NULL,
        \`observacion\` varchar(200) NULL,
        \`usuarioId\` int NULL,
        \`nombreUsuario\` varchar(100) NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX \`IDX_transaccion_ahorro_cuentaId\` (\`cuentaAhorroId\`),
        INDEX \`IDX_transaccion_ahorro_fecha\` (\`fecha\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      ALTER TABLE \`transaccion_ahorro\`
      ADD CONSTRAINT \`FK_transaccion_ahorro_cuenta\`
      FOREIGN KEY (\`cuentaAhorroId\`) REFERENCES \`cuenta_ahorro\`(\`id\`)
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE \`transaccion_ahorro\`
      ADD CONSTRAINT \`FK_transaccion_ahorro_naturaleza\`
      FOREIGN KEY (\`naturalezaId\`) REFERENCES \`naturaleza_movimiento_ahorro\`(\`id\`)
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE \`transaccion_ahorro\`
      ADD CONSTRAINT \`FK_transaccion_ahorro_tipo\`
      FOREIGN KEY (\`tipoTransaccionId\`) REFERENCES \`tipo_transaccion_ahorro\`(\`id\`)
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    // 9. plan_capitalizacion
    await queryRunner.query(`
      CREATE TABLE \`plan_capitalizacion\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`cuentaAhorroId\` int NOT NULL,
        \`fechaCapitalizacion\` date NOT NULL,
        \`monto\` decimal(14,2) NOT NULL DEFAULT 0,
        \`procesado\` tinyint NOT NULL DEFAULT 0,
        \`fechaProcesado\` date NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX \`IDX_plan_cap_cuentaId\` (\`cuentaAhorroId\`),
        INDEX \`IDX_plan_cap_fecha\` (\`fechaCapitalizacion\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      ALTER TABLE \`plan_capitalizacion\`
      ADD CONSTRAINT \`FK_plan_cap_cuenta\`
      FOREIGN KEY (\`cuentaAhorroId\`) REFERENCES \`cuenta_ahorro\`(\`id\`)
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // 10. provision_ahorro
    await queryRunner.query(`
      CREATE TABLE \`provision_ahorro\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`cuentaAhorroId\` int NOT NULL,
        \`fecha\` date NOT NULL,
        \`saldo\` decimal(14,2) NOT NULL,
        \`tasaInteres\` decimal(8,4) NOT NULL,
        \`interesDiario\` decimal(14,2) NOT NULL,
        \`interesAcumulado\` decimal(14,2) NOT NULL,
        \`pagado\` tinyint NOT NULL DEFAULT 0,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX \`IDX_provision_cuentaId\` (\`cuentaAhorroId\`),
        INDEX \`IDX_provision_fecha\` (\`fecha\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      ALTER TABLE \`provision_ahorro\`
      ADD CONSTRAINT \`FK_provision_cuenta\`
      FOREIGN KEY (\`cuentaAhorroId\`) REFERENCES \`cuenta_ahorro\`(\`id\`)
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // 11. bitacora_renovacion
    await queryRunner.query(`
      CREATE TABLE \`bitacora_renovacion\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`cuentaAhorroId\` int NOT NULL,
        \`fechaRenovacion\` date NOT NULL,
        \`vencimientoAnterior\` date NOT NULL,
        \`nuevoVencimiento\` date NOT NULL,
        \`usuarioId\` int NULL,
        \`nombreUsuario\` varchar(100) NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX \`IDX_bitacora_cuentaId\` (\`cuentaAhorroId\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      ALTER TABLE \`bitacora_renovacion\`
      ADD CONSTRAINT \`FK_bitacora_cuenta\`
      FOREIGN KEY (\`cuentaAhorroId\`) REFERENCES \`cuenta_ahorro\`(\`id\`)
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ===== SEED DATA =====

    // Líneas de ahorro
    await queryRunner.query(`
      INSERT INTO \`linea_ahorro\` (\`codigo\`, \`nombre\`, \`descripcion\`) VALUES
      ('AV', 'Ahorro a la Vista', 'Cuenta de ahorro con disponibilidad inmediata'),
      ('AP', 'Ahorro Programado', 'Ahorro con depósitos periódicos programados'),
      ('DPF', 'Depósito a Plazo Fijo', 'Depósito con plazo y tasa fija')
    `);

    // Estados de cuenta
    await queryRunner.query(`
      INSERT INTO \`estado_cuenta_ahorro\` (\`codigo\`, \`nombre\`) VALUES
      ('ACTIVA', 'Activa'),
      ('INACTIVA', 'Inactiva'),
      ('BLOQUEADA', 'Bloqueada'),
      ('CANCELADA', 'Cancelada'),
      ('VENCIDA', 'Vencida')
    `);

    // Tipos de capitalización
    await queryRunner.query(`
      INSERT INTO \`tipo_capitalizacion\` (\`codigo\`, \`nombre\`, \`dias\`) VALUES
      ('DIARIA', 'Diaria', 1),
      ('SEMANAL', 'Semanal', 7),
      ('QUINCENAL', 'Quincenal', 15),
      ('MENSUAL', 'Mensual', 30),
      ('TRIMESTRAL', 'Trimestral', 90),
      ('SEMESTRAL', 'Semestral', 180),
      ('ANUAL', 'Anual', 365),
      ('ALVTO', 'Al Vencimiento', 0)
    `);

    // Naturaleza de movimiento
    await queryRunner.query(`
      INSERT INTO \`naturaleza_movimiento_ahorro\` (\`codigo\`, \`nombre\`) VALUES
      ('CARGO', 'Cargo'),
      ('ABONO', 'Abono')
    `);

    // Tipos de transacción
    await queryRunner.query(`
      INSERT INTO \`tipo_transaccion_ahorro\` (\`codigo\`, \`nombre\`, \`naturalezaId\`) VALUES
      ('APERTURA', 'Apertura de Cuenta', (SELECT id FROM \`naturaleza_movimiento_ahorro\` WHERE codigo = 'ABONO')),
      ('DEPOSITO', 'Depósito', (SELECT id FROM \`naturaleza_movimiento_ahorro\` WHERE codigo = 'ABONO')),
      ('RETIRO', 'Retiro', (SELECT id FROM \`naturaleza_movimiento_ahorro\` WHERE codigo = 'CARGO')),
      ('CANCELACION', 'Cancelación', (SELECT id FROM \`naturaleza_movimiento_ahorro\` WHERE codigo = 'CARGO')),
      ('PAGO_INTERESES', 'Pago de Intereses', (SELECT id FROM \`naturaleza_movimiento_ahorro\` WHERE codigo = 'ABONO')),
      ('CAPITALIZACION', 'Capitalización', (SELECT id FROM \`naturaleza_movimiento_ahorro\` WHERE codigo = 'ABONO')),
      ('ANULACION', 'Anulación', (SELECT id FROM \`naturaleza_movimiento_ahorro\` WHERE codigo = 'CARGO'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`bitacora_renovacion\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`provision_ahorro\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`plan_capitalizacion\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`transaccion_ahorro\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`cuenta_ahorro\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`tipo_transaccion_ahorro\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`naturaleza_movimiento_ahorro\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`tipo_capitalizacion\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`estado_cuenta_ahorro\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`tipo_ahorro\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`linea_ahorro\``);
  }
}
