import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLoanRefinancingFields1770300000000 implements MigrationInterface {
  name = 'AddLoanRefinancingFields1770300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Agregar cancelacionPrestamo a tipo_deduccion
    await queryRunner.query(`
      ALTER TABLE \`tipo_deduccion\`
      ADD COLUMN \`cancelacionPrestamo\` tinyint NOT NULL DEFAULT 0
    `);

    // 2. Agregar prestamoACancelarId a deduccion_prestamo
    await queryRunner.query(`
      ALTER TABLE \`deduccion_prestamo\`
      ADD COLUMN \`prestamoACancelarId\` int NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`deduccion_prestamo\`
      ADD CONSTRAINT \`FK_deduccion_prestamo_cancelar\`
      FOREIGN KEY (\`prestamoACancelarId\`) REFERENCES \`prestamo\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // 3. Agregar refinanciamiento a prestamo
    await queryRunner.query(`
      ALTER TABLE \`prestamo\`
      ADD COLUMN \`refinanciamiento\` tinyint NOT NULL DEFAULT 0
    `);

    // 4. Insertar tipo de deducción para cancelación de préstamo
    await queryRunner.query(`
      INSERT INTO \`tipo_deduccion\` (\`codigo\`, \`nombre\`, \`descripcion\`, \`tipoCalculoDefault\`, \`valorDefault\`, \`activo\`, \`cancelacionPrestamo\`)
      VALUES ('CANCEL_PREST', 'Cancelación de Préstamo Anterior', 'Deducción para cancelar saldo de préstamo existente por refinanciamiento', 'FIJO', 0, 1, 1)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar el tipo de deducción
    await queryRunner.query(`
      DELETE FROM \`tipo_deduccion\` WHERE \`codigo\` = 'CANCEL_PREST'
    `);

    // Eliminar columna refinanciamiento de prestamo
    await queryRunner.query(`
      ALTER TABLE \`prestamo\` DROP COLUMN \`refinanciamiento\`
    `);

    // Eliminar FK y columna prestamoACancelarId de deduccion_prestamo
    await queryRunner.query(`
      ALTER TABLE \`deduccion_prestamo\` DROP FOREIGN KEY \`FK_deduccion_prestamo_cancelar\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`deduccion_prestamo\` DROP COLUMN \`prestamoACancelarId\`
    `);

    // Eliminar columna cancelacionPrestamo de tipo_deduccion
    await queryRunner.query(`
      ALTER TABLE \`tipo_deduccion\` DROP COLUMN \`cancelacionPrestamo\`
    `);
  }
}
