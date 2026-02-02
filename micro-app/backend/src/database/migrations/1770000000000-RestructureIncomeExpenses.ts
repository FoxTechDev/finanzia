import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class RestructureIncomeExpenses1770000000000 implements MigrationInterface {
  name = 'RestructureIncomeExpenses1770000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear tabla tipo_gasto (catálogo de tipos de gasto)
    await queryRunner.createTable(
      new Table({
        name: 'tipo_gasto',
        columns: [
          {
            name: 'idTipoGasto',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'nombre',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false,
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
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // 2. Crear tabla tipo_ingreso (catálogo de tipos de ingreso)
    await queryRunner.createTable(
      new Table({
        name: 'tipo_ingreso',
        columns: [
          {
            name: 'idTipoIngreso',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'nombre',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false,
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
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // 3. Seed tipo_gasto con valores iniciales
    await queryRunner.query(`
      INSERT INTO tipo_gasto (nombre, descripcion, activo) VALUES
      ('Vivienda', 'Gastos relacionados con alquiler, hipoteca y mantenimiento de vivienda', true),
      ('Alimentación', 'Gastos en comida y bebidas', true),
      ('Transporte', 'Gastos de transporte público, combustible y mantenimiento de vehículo', true),
      ('Servicios Básicos', 'Agua, electricidad, teléfono, internet', true),
      ('Educación', 'Gastos educativos, matrícula, libros y materiales', true),
      ('Gastos Médicos', 'Gastos en salud, medicina y consultas médicas', true),
      ('Otros', 'Otros gastos no categorizados', true);
    `);

    // 4. Seed tipo_ingreso con valores iniciales
    await queryRunner.query(`
      INSERT INTO tipo_ingreso (nombre, descripcion, activo) VALUES
      ('Salario Principal', 'Ingresos provenientes del salario principal del trabajo', true),
      ('Ingresos Adicionales', 'Ingresos adicionales de trabajos secundarios', true),
      ('Negocio Propio', 'Ingresos provenientes de negocio o actividad empresarial', true),
      ('Remesas', 'Dinero recibido del extranjero', true),
      ('Alquileres', 'Ingresos por alquiler de propiedades', true),
      ('Otros', 'Otros ingresos no categorizados', true);
    `);

    // 5. Crear tabla gasto_cliente (gastos de los clientes)
    await queryRunner.createTable(
      new Table({
        name: 'gasto_cliente',
        columns: [
          {
            name: 'idGasto',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'idPersona',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'idTipoGasto',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'monto',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'descripcion',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Crear índice para búsquedas rápidas por persona
    await queryRunner.createIndex(
      'gasto_cliente',
      new TableIndex({
        name: 'IDX_gasto_cliente_persona',
        columnNames: ['idPersona'],
      }),
    );

    // Crear foreign key hacia persona
    await queryRunner.createForeignKey(
      'gasto_cliente',
      new TableForeignKey({
        name: 'FK_gasto_cliente_persona',
        columnNames: ['idPersona'],
        referencedTableName: 'persona',
        referencedColumnNames: ['idPersona'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Crear foreign key hacia tipo_gasto
    await queryRunner.createForeignKey(
      'gasto_cliente',
      new TableForeignKey({
        name: 'FK_gasto_cliente_tipo_gasto',
        columnNames: ['idTipoGasto'],
        referencedTableName: 'tipo_gasto',
        referencedColumnNames: ['idTipoGasto'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    // 6. Crear tabla ingreso_cliente (ingresos de los clientes)
    await queryRunner.createTable(
      new Table({
        name: 'ingreso_cliente',
        columns: [
          {
            name: 'idIngreso',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'idPersona',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'idTipoIngreso',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'monto',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'descripcion',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Crear índice para búsquedas rápidas por persona
    await queryRunner.createIndex(
      'ingreso_cliente',
      new TableIndex({
        name: 'IDX_ingreso_cliente_persona',
        columnNames: ['idPersona'],
      }),
    );

    // Crear foreign key hacia persona
    await queryRunner.createForeignKey(
      'ingreso_cliente',
      new TableForeignKey({
        name: 'FK_ingreso_cliente_persona',
        columnNames: ['idPersona'],
        referencedTableName: 'persona',
        referencedColumnNames: ['idPersona'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Crear foreign key hacia tipo_ingreso
    await queryRunner.createForeignKey(
      'ingreso_cliente',
      new TableForeignKey({
        name: 'FK_ingreso_cliente_tipo_ingreso',
        columnNames: ['idTipoIngreso'],
        referencedTableName: 'tipo_ingreso',
        referencedColumnNames: ['idTipoIngreso'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    // 7. Eliminar columnas de direccion
    await queryRunner.dropColumn('direccion', 'tiempoResidenciaMeses');
    await queryRunner.dropColumn('direccion', 'montoAlquiler');

    // 8. Eliminar columnas de actividad_economica
    await queryRunner.dropColumn('actividad_economica', 'ingresosAdicionales');
    await queryRunner.dropColumn('actividad_economica', 'descripcionIngresosAdicionales');
    await queryRunner.dropColumn('actividad_economica', 'gastosVivienda');
    await queryRunner.dropColumn('actividad_economica', 'gastosAlimentacion');
    await queryRunner.dropColumn('actividad_economica', 'gastosTransporte');
    await queryRunner.dropColumn('actividad_economica', 'gastosServiciosBasicos');
    await queryRunner.dropColumn('actividad_economica', 'gastosEducacion');
    await queryRunner.dropColumn('actividad_economica', 'gastosMedicos');
    await queryRunner.dropColumn('actividad_economica', 'otrosGastos');
    await queryRunner.dropColumn('actividad_economica', 'totalGastos');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir cambios en orden inverso

    // 1. Re-agregar columnas a actividad_economica
    await queryRunner.query(`
      ALTER TABLE actividad_economica
      ADD COLUMN ingresosAdicionales DECIMAL(14,2) NULL,
      ADD COLUMN descripcionIngresosAdicionales TEXT NULL,
      ADD COLUMN gastosVivienda DECIMAL(10,2) NULL COMMENT 'Alquiler o hipoteca mensual',
      ADD COLUMN gastosAlimentacion DECIMAL(10,2) NULL,
      ADD COLUMN gastosTransporte DECIMAL(10,2) NULL,
      ADD COLUMN gastosServiciosBasicos DECIMAL(10,2) NULL COMMENT 'Agua, luz, teléfono, internet',
      ADD COLUMN gastosEducacion DECIMAL(10,2) NULL,
      ADD COLUMN gastosMedicos DECIMAL(10,2) NULL,
      ADD COLUMN otrosGastos DECIMAL(10,2) NULL,
      ADD COLUMN totalGastos DECIMAL(14,2) NULL COMMENT 'Suma total de todos los gastos';
    `);

    // 2. Re-agregar columnas a direccion
    await queryRunner.query(`
      ALTER TABLE direccion
      ADD COLUMN tiempoResidenciaMeses INT NULL,
      ADD COLUMN montoAlquiler DECIMAL(10,2) NULL;
    `);

    // 3. Eliminar tablas en orden inverso
    await queryRunner.dropTable('ingreso_cliente', true);
    await queryRunner.dropTable('gasto_cliente', true);
    await queryRunner.dropTable('tipo_ingreso', true);
    await queryRunner.dropTable('tipo_gasto', true);
  }
}
