import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCodigoOrdenToTipoVivienda1770100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si la columna codigo ya existe
    const codigoExists = await queryRunner.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tipo_vivienda'
      AND COLUMN_NAME = 'codigo'
    `);

    if (codigoExists.length === 0) {
      // Agregar columna codigo
      await queryRunner.addColumn(
        'tipo_vivienda',
        new TableColumn({
          name: 'codigo',
          type: 'varchar',
          length: '50',
          isNullable: true,
        }),
      );
    }

    // Verificar si la columna orden ya existe
    const ordenExists = await queryRunner.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tipo_vivienda'
      AND COLUMN_NAME = 'orden'
    `);

    if (ordenExists.length === 0) {
      // Agregar columna orden
      await queryRunner.addColumn(
        'tipo_vivienda',
        new TableColumn({
          name: 'orden',
          type: 'int',
          isNullable: true,
        }),
      );
    }

    // Generar códigos automáticos para registros que no tengan código
    const tiposSinCodigo = await queryRunner.query(
      'SELECT idTipoVivienda, nombre FROM tipo_vivienda WHERE codigo IS NULL OR codigo = ""',
    );

    for (let i = 0; i < tiposSinCodigo.length; i++) {
      const tipo = tiposSinCodigo[i];
      const codigo = this.generateCodigo(tipo.nombre);
      await queryRunner.query(
        `UPDATE tipo_vivienda SET codigo = ?, orden = COALESCE(orden, ?) WHERE idTipoVivienda = ?`,
        [codigo, (i + 1) * 10, tipo.idTipoVivienda],
      );
    }

    // Verificar si codigo es NULL y hacer NOT NULL
    if (codigoExists.length === 0) {
      // Solo cambiar si la columna fue creada en esta migración
      await queryRunner.changeColumn(
        'tipo_vivienda',
        'codigo',
        new TableColumn({
          name: 'codigo',
          type: 'varchar',
          length: '50',
          isNullable: false,
          isUnique: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Verificar antes de eliminar
    const ordenExists = await queryRunner.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tipo_vivienda'
      AND COLUMN_NAME = 'orden'
    `);

    if (ordenExists.length > 0) {
      await queryRunner.dropColumn('tipo_vivienda', 'orden');
    }

    const codigoExists = await queryRunner.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tipo_vivienda'
      AND COLUMN_NAME = 'codigo'
    `);

    if (codigoExists.length > 0) {
      await queryRunner.dropColumn('tipo_vivienda', 'codigo');
    }
  }

  /**
   * Genera un código a partir del nombre
   */
  private generateCodigo(nombre: string): string {
    return nombre
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]/g, '_')
      .substring(0, 50);
  }
}
