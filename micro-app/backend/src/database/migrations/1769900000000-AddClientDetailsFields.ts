import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddClientDetailsFields1769900000000 implements MigrationInterface {
  name = 'AddClientDetailsFields1769900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear tabla dependencia_familiar
    await queryRunner.createTable(
      new Table({
        name: 'dependencia_familiar',
        columns: [
          {
            name: 'idDependencia',
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
            name: 'nombreDependiente',
            type: 'varchar',
            length: '150',
            isNullable: false,
          },
          {
            name: 'parentesco',
            type: 'enum',
            enum: ['Hijo', 'Hija', 'Cónyuge', 'Padre', 'Madre', 'Hermano', 'Hermana', 'Abuelo', 'Abuela', 'Otro'],
            default: "'Otro'",
            isNullable: false,
          },
          {
            name: 'edad',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'trabaja',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'estudia',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'observaciones',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Crear índice para búsquedas rápidas por persona
    await queryRunner.createIndex(
      'dependencia_familiar',
      new TableIndex({
        name: 'IDX_dependencia_familiar_persona',
        columnNames: ['idPersona'],
      }),
    );

    // Crear foreign key hacia persona
    await queryRunner.createForeignKey(
      'dependencia_familiar',
      new TableForeignKey({
        name: 'FK_dependencia_familiar_persona',
        columnNames: ['idPersona'],
        referencedTableName: 'persona',
        referencedColumnNames: ['idPersona'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // 2. Agregar campos de vivienda a la tabla direccion
    await queryRunner.addColumn(
      'direccion',
      new TableColumn({
        name: 'tipoVivienda',
        type: 'enum',
        enum: ['Propia', 'Alquilada', 'Familiar', 'Prestada', 'Otra'],
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'direccion',
      new TableColumn({
        name: 'tiempoResidenciaAnios',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'direccion',
      new TableColumn({
        name: 'tiempoResidenciaMeses',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'direccion',
      new TableColumn({
        name: 'montoAlquiler',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );

    // 3. Agregar campos de ingresos y gastos a actividad_economica
    await queryRunner.addColumn(
      'actividad_economica',
      new TableColumn({
        name: 'ingresosAdicionales',
        type: 'decimal',
        precision: 14,
        scale: 2,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'actividad_economica',
      new TableColumn({
        name: 'descripcionIngresosAdicionales',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'actividad_economica',
      new TableColumn({
        name: 'gastosVivienda',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
        comment: 'Alquiler o hipoteca mensual',
      }),
    );

    await queryRunner.addColumn(
      'actividad_economica',
      new TableColumn({
        name: 'gastosAlimentacion',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'actividad_economica',
      new TableColumn({
        name: 'gastosTransporte',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'actividad_economica',
      new TableColumn({
        name: 'gastosServiciosBasicos',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
        comment: 'Agua, luz, teléfono, internet',
      }),
    );

    await queryRunner.addColumn(
      'actividad_economica',
      new TableColumn({
        name: 'gastosEducacion',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'actividad_economica',
      new TableColumn({
        name: 'gastosMedicos',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'actividad_economica',
      new TableColumn({
        name: 'otrosGastos',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'actividad_economica',
      new TableColumn({
        name: 'totalGastos',
        type: 'decimal',
        precision: 14,
        scale: 2,
        isNullable: true,
        comment: 'Suma total de todos los gastos',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir cambios en orden inverso

    // 1. Eliminar columnas de actividad_economica
    await queryRunner.dropColumn('actividad_economica', 'totalGastos');
    await queryRunner.dropColumn('actividad_economica', 'otrosGastos');
    await queryRunner.dropColumn('actividad_economica', 'gastosMedicos');
    await queryRunner.dropColumn('actividad_economica', 'gastosEducacion');
    await queryRunner.dropColumn('actividad_economica', 'gastosServiciosBasicos');
    await queryRunner.dropColumn('actividad_economica', 'gastosTransporte');
    await queryRunner.dropColumn('actividad_economica', 'gastosAlimentacion');
    await queryRunner.dropColumn('actividad_economica', 'gastosVivienda');
    await queryRunner.dropColumn('actividad_economica', 'descripcionIngresosAdicionales');
    await queryRunner.dropColumn('actividad_economica', 'ingresosAdicionales');

    // 2. Eliminar columnas de direccion
    await queryRunner.dropColumn('direccion', 'montoAlquiler');
    await queryRunner.dropColumn('direccion', 'tiempoResidenciaMeses');
    await queryRunner.dropColumn('direccion', 'tiempoResidenciaAnios');
    await queryRunner.dropColumn('direccion', 'tipoVivienda');

    // 3. Eliminar tabla dependencia_familiar (FK e índice se eliminan automáticamente)
    await queryRunner.dropTable('dependencia_familiar', true);
  }
}
