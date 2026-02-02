import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTipoInteresToSolicitud1770200000000
  implements MigrationInterface
{
  name = 'AddTipoInteresToSolicitud1770200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna tipoInteres a la tabla solicitud
    await queryRunner.query(`
      ALTER TABLE solicitud
      ADD COLUMN tipoInteres ENUM('FLAT', 'AMORTIZADO') NULL AFTER periodicidadPagoId
    `);

    // Actualizar solicitudes existentes con el valor del tipo de crédito
    await queryRunner.query(`
      UPDATE solicitud s
      INNER JOIN tipo_credito tc ON s.tipoCreditoId = tc.id
      SET s.tipoInteres = tc.tipoCuota
      WHERE s.tipoInteres IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar la columna tipoInteres
    await queryRunner.query(`
      ALTER TABLE solicitud
      DROP COLUMN tipoInteres
    `);
  }
}
