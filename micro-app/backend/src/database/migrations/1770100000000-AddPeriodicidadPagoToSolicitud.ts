import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddPeriodicidadPagoToSolicitud1770100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si las columnas ya existen
    const columns = ['periodicidadPagoId', 'fechaDesdePago', 'fechaHastaPago', 'diasCalculados'];

    for (const columnName of columns) {
      const columnExists = await queryRunner.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'solicitud'
        AND COLUMN_NAME = '${columnName}'
      `);

      if (columnExists.length === 0) {
        let columnType = 'int';
        if (columnName === 'fechaDesdePago' || columnName === 'fechaHastaPago') {
          columnType = 'date';
        }

        await queryRunner.addColumn(
          'solicitud',
          new TableColumn({
            name: columnName,
            type: columnType,
            isNullable: true,
          }),
        );
      }
    }

    // Verificar si la foreign key ya existe
    const fkExists = await queryRunner.query(`
      SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'solicitud'
      AND CONSTRAINT_NAME = 'FK_solicitud_periodicidad_pago'
    `);

    if (fkExists.length === 0) {
      // Crear foreign key hacia periodicidad_pago
      await queryRunner.createForeignKey(
        'solicitud',
        new TableForeignKey({
          name: 'FK_solicitud_periodicidad_pago',
          columnNames: ['periodicidadPagoId'],
          referencedTableName: 'periodicidad_pago',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Verificar y eliminar foreign key
    const fkExists = await queryRunner.query(`
      SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'solicitud'
      AND CONSTRAINT_NAME = 'FK_solicitud_periodicidad_pago'
    `);

    if (fkExists.length > 0) {
      await queryRunner.dropForeignKey('solicitud', 'FK_solicitud_periodicidad_pago');
    }

    // Eliminar columnas si existen
    const columns = ['diasCalculados', 'fechaHastaPago', 'fechaDesdePago', 'periodicidadPagoId'];

    for (const columnName of columns) {
      const columnExists = await queryRunner.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'solicitud'
        AND COLUMN_NAME = '${columnName}'
      `);

      if (columnExists.length > 0) {
        await queryRunner.dropColumn('solicitud', columnName);
      }
    }
  }
}
