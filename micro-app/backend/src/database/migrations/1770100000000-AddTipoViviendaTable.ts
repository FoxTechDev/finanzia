import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddTipoViviendaTable1770100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si la tabla ya existe
    const tableExists = await queryRunner.hasTable('tipo_vivienda');

    if (!tableExists) {
      // Crear tabla tipo_vivienda solo si no existe
      await queryRunner.createTable(
        new Table({
          name: 'tipo_vivienda',
          columns: [
            {
              name: 'idTipoVivienda',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'codigo',
              type: 'varchar',
              length: '50',
              isUnique: true,
            },
            {
              name: 'nombre',
              type: 'varchar',
              length: '100',
              isUnique: true,
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
              isNullable: true,
            },
          ],
        }),
        true,
      );
    }

    // Insertar datos iniciales (INSERT IGNORE para evitar duplicados)
    await queryRunner.query(`
      INSERT IGNORE INTO tipo_vivienda (codigo, nombre, descripcion, activo, orden) VALUES
      ('PROPIA', 'Propia', 'Vivienda en propiedad', true, 1),
      ('ALQUILADA', 'Alquilada', 'Vivienda en alquiler', true, 2),
      ('FAMILIAR', 'Familiar', 'Vivienda familiar', true, 3),
      ('PRESTADA', 'Prestada', 'Vivienda prestada', true, 4),
      ('OTRA', 'Otra', 'Otro tipo de vivienda', true, 5)
    `);

    // Verificar si la columna idTipoVivienda ya existe en direccion
    const columnExists = await queryRunner.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'direccion'
      AND COLUMN_NAME = 'idTipoVivienda'
    `);

    if (columnExists.length === 0) {
      // Agregar columna idTipoVivienda a la tabla direccion
      await queryRunner.query(`
        ALTER TABLE direccion
        ADD COLUMN idTipoVivienda INT NULL
      `);

      // Verificar si existe la columna tipoVivienda (enum antiguo)
      const oldColumnExists = await queryRunner.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'direccion'
        AND COLUMN_NAME = 'tipoVivienda'
      `);

      if (oldColumnExists.length > 0) {
        // Migrar datos existentes del enum al nuevo campo
        await queryRunner.query(`
          UPDATE direccion
          SET idTipoVivienda = CASE tipoVivienda
            WHEN 'Propia' THEN 1
            WHEN 'Alquilada' THEN 2
            WHEN 'Familiar' THEN 3
            WHEN 'Prestada' THEN 4
            WHEN 'Otra' THEN 5
            ELSE NULL
          END
          WHERE tipoVivienda IS NOT NULL
        `);

        // Eliminar la columna enum antigua (tipoVivienda)
        await queryRunner.query(`
          ALTER TABLE direccion DROP COLUMN tipoVivienda
        `);
      }

      // Verificar si la foreign key ya existe
      const fkExists = await queryRunner.query(`
        SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'direccion'
        AND CONSTRAINT_NAME = 'FK_direccion_tipo_vivienda'
      `);

      if (fkExists.length === 0) {
        // Crear la foreign key
        await queryRunner.createForeignKey(
          'direccion',
          new TableForeignKey({
            name: 'FK_direccion_tipo_vivienda',
            columnNames: ['idTipoVivienda'],
            referencedTableName: 'tipo_vivienda',
            referencedColumnNames: ['idTipoVivienda'],
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Verificar si existe la foreign key antes de eliminarla
    const fkExists = await queryRunner.query(`
      SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'direccion'
      AND CONSTRAINT_NAME = 'FK_direccion_tipo_vivienda'
    `);

    if (fkExists.length > 0) {
      await queryRunner.dropForeignKey('direccion', 'FK_direccion_tipo_vivienda');
    }

    // Verificar si la columna idTipoVivienda existe
    const columnExists = await queryRunner.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'direccion'
      AND COLUMN_NAME = 'idTipoVivienda'
    `);

    if (columnExists.length > 0) {
      // Agregar de vuelta la columna enum si no existe
      const oldColumnExists = await queryRunner.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'direccion'
        AND COLUMN_NAME = 'tipoVivienda'
      `);

      if (oldColumnExists.length === 0) {
        await queryRunner.query(`
          ALTER TABLE direccion
          ADD COLUMN tipoVivienda ENUM('Propia', 'Alquilada', 'Familiar', 'Prestada', 'Otra') NULL
        `);

        // Migrar datos de vuelta al enum
        await queryRunner.query(`
          UPDATE direccion d
          INNER JOIN tipo_vivienda tv ON d.idTipoVivienda = tv.idTipoVivienda
          SET d.tipoVivienda = tv.nombre
          WHERE d.idTipoVivienda IS NOT NULL
        `);
      }

      // Eliminar la columna idTipoVivienda
      await queryRunner.query(`
        ALTER TABLE direccion DROP COLUMN idTipoVivienda
      `);
    }

    // Eliminar la tabla tipo_vivienda si existe
    const tableExists = await queryRunner.hasTable('tipo_vivienda');
    if (tableExists) {
      await queryRunner.dropTable('tipo_vivienda');
    }
  }
}
