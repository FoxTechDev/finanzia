import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

/**
 * Migración para agregar las tablas de clasificación y estado de préstamos
 * Este es un ejemplo de cómo debería verse la migración
 */
export class AddClasificacionYEstadoPrestamo1737600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla clasificacion_prestamo
    await queryRunner.createTable(
      new Table({
        name: 'clasificacion_prestamo',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'codigo',
            type: 'varchar',
            length: '10',
            isUnique: true,
          },
          {
            name: 'nombre',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'descripcion',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'diasMoraMinimo',
            type: 'int',
            default: 0,
          },
          {
            name: 'diasMoraMaximo',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'porcentajeProvision',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'activo',
            type: 'boolean',
            default: true,
          },
          {
            name: 'orden',
            type: 'int',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Crear tabla estado_prestamo
    await queryRunner.createTable(
      new Table({
        name: 'estado_prestamo',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'codigo',
            type: 'varchar',
            length: '20',
            isUnique: true,
          },
          {
            name: 'nombre',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'descripcion',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'activo',
            type: 'boolean',
            default: true,
          },
          {
            name: 'orden',
            type: 'int',
            default: 0,
          },
          {
            name: 'color',
            type: 'varchar',
            length: '7',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Agregar columnas a la tabla prestamo
    await queryRunner.query(`
      ALTER TABLE prestamo
        ADD COLUMN clasificacionPrestamoId INT NULL,
        ADD COLUMN estadoPrestamoId INT NULL
    `);

    // Crear foreign keys
    await queryRunner.createForeignKey(
      'prestamo',
      new TableForeignKey({
        columnNames: ['clasificacionPrestamoId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'clasificacion_prestamo',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'prestamo',
      new TableForeignKey({
        columnNames: ['estadoPrestamoId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'estado_prestamo',
        onDelete: 'SET NULL',
      }),
    );

    // Insertar clasificaciones NCB-022
    await queryRunner.query(`
      INSERT INTO clasificacion_prestamo
        (codigo, nombre, descripcion, diasMoraMinimo, diasMoraMaximo, porcentajeProvision, orden)
      VALUES
        ('A', 'Normal', 'Créditos con bajo riesgo de incumplimiento', 0, 30, 1.00, 1),
        ('B', 'Subnormal', 'Créditos con debilidades que ameritan atención', 31, 60, 5.00, 2),
        ('C', 'Deficiente', 'Créditos con alto riesgo de incumplimiento', 61, 90, 20.00, 3),
        ('D', 'Difícil Recuperación', 'Créditos con muy alto riesgo de pérdida', 91, 180, 50.00, 4),
        ('E', 'Irrecuperable', 'Créditos con pérdida prácticamente cierta', 181, NULL, 100.00, 5)
    `);

    // Insertar estados de préstamo
    await queryRunner.query(`
      INSERT INTO estado_prestamo
        (codigo, nombre, descripcion, color, orden)
      VALUES
        ('ACTIVO', 'Activo', 'Préstamo vigente con pagos al día o con atraso tolerable', '#28a745', 1),
        ('CANCELADO', 'Cancelado', 'Préstamo pagado completamente', '#6c757d', 2),
        ('ANULADO', 'Anulado', 'Préstamo anulado o reversado', '#dc3545', 3)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign keys
    const table = await queryRunner.getTable('prestamo');
    if (table) {
      const foreignKeys = table.foreignKeys.filter(
        (fk) =>
          fk.columnNames.includes('clasificacionPrestamoId') ||
          fk.columnNames.includes('estadoPrestamoId'),
      );
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('prestamo', fk);
      }
    }

    // Eliminar columnas de prestamo
    await queryRunner.query(`
      ALTER TABLE prestamo
        DROP COLUMN clasificacionPrestamoId,
        DROP COLUMN estadoPrestamoId
    `);

    // Eliminar tablas
    await queryRunner.dropTable('estado_prestamo', true);
    await queryRunner.dropTable('clasificacion_prestamo', true);
  }
}
