import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlanPagoHistorialTable1770400000000 implements MigrationInterface {
  name = 'CreatePlanPagoHistorialTable1770400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear tabla plan_pago_historial
    await queryRunner.query(`
      CREATE TABLE \`plan_pago_historial\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`prestamoId\` int NOT NULL,
        \`loteModificacion\` varchar(50) NOT NULL,
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
        \`diasMora\` int NOT NULL DEFAULT 0,
        \`interesMoratorio\` decimal(14,2) NOT NULL DEFAULT '0.00',
        \`interesMoratorioPagado\` decimal(14,2) NOT NULL DEFAULT '0.00',
        \`estado\` enum('PENDIENTE', 'PAGADA', 'PARCIAL', 'MORA') NOT NULL,
        \`observacion\` text NOT NULL,
        \`usuarioId\` int NULL,
        \`nombreUsuario\` varchar(150) NULL,
        \`fechaModificacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // 2. Agregar FK a prestamo
    await queryRunner.query(`
      ALTER TABLE \`plan_pago_historial\`
      ADD CONSTRAINT \`FK_plan_pago_historial_prestamo\`
      FOREIGN KEY (\`prestamoId\`) REFERENCES \`prestamo\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // 3. Agregar indices
    await queryRunner.query(`
      CREATE INDEX \`IDX_plan_pago_historial_prestamoId\` ON \`plan_pago_historial\` (\`prestamoId\`)
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_plan_pago_historial_loteModificacion\` ON \`plan_pago_historial\` (\`loteModificacion\`)
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_plan_pago_historial_fechaModificacion\` ON \`plan_pago_historial\` (\`fechaModificacion\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar indices
    await queryRunner.query(`DROP INDEX \`IDX_plan_pago_historial_fechaModificacion\` ON \`plan_pago_historial\``);
    await queryRunner.query(`DROP INDEX \`IDX_plan_pago_historial_loteModificacion\` ON \`plan_pago_historial\``);
    await queryRunner.query(`DROP INDEX \`IDX_plan_pago_historial_prestamoId\` ON \`plan_pago_historial\``);

    // Eliminar FK
    await queryRunner.query(`ALTER TABLE \`plan_pago_historial\` DROP FOREIGN KEY \`FK_plan_pago_historial_prestamo\``);

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE \`plan_pago_historial\``);
  }
}
