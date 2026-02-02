import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Migración para agregar las tablas plan_pago_solicitud y recargo_solicitud
 * Estas tablas permiten almacenar el plan de pago calculado de una solicitud de crédito
 * antes de que se realice el desembolso.
 */
export class AddPlanPagoSolicitudTables1770200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla plan_pago_solicitud
    await queryRunner.createTable(
      new Table({
        name: 'plan_pago_solicitud',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'solicitudId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'numeroCuota',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'fechaVencimiento',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'capital',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'interes',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'recargos',
            type: 'decimal',
            precision: 14,
            scale: 2,
            default: 0,
            isNullable: false,
          },
          {
            name: 'cuotaTotal',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'saldoCapital',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Crear foreign key para solicitudId
    await queryRunner.createForeignKey(
      'plan_pago_solicitud',
      new TableForeignKey({
        columnNames: ['solicitudId'],
        referencedTableName: 'solicitud',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Crear índices
    await queryRunner.createIndex(
      'plan_pago_solicitud',
      new TableIndex({
        name: 'IDX_plan_pago_solicitud_solicitudId',
        columnNames: ['solicitudId'],
      }),
    );

    await queryRunner.createIndex(
      'plan_pago_solicitud',
      new TableIndex({
        name: 'IDX_plan_pago_solicitud_solicitudId_numeroCuota',
        columnNames: ['solicitudId', 'numeroCuota'],
      }),
    );

    await queryRunner.createIndex(
      'plan_pago_solicitud',
      new TableIndex({
        name: 'IDX_plan_pago_solicitud_fechaVencimiento',
        columnNames: ['fechaVencimiento'],
      }),
    );

    // Crear tabla recargo_solicitud
    await queryRunner.createTable(
      new Table({
        name: 'recargo_solicitud',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'solicitudId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'nombre',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'tipo',
            type: 'enum',
            enum: ['FIJO', 'PORCENTAJE'],
            default: "'FIJO'",
            isNullable: false,
          },
          {
            name: 'valor',
            type: 'decimal',
            precision: 14,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'montoCalculado',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'aplicaDesde',
            type: 'int',
            default: 1,
            isNullable: false,
          },
          {
            name: 'aplicaHasta',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'activo',
            type: 'tinyint',
            default: 1,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Crear foreign key para solicitudId
    await queryRunner.createForeignKey(
      'recargo_solicitud',
      new TableForeignKey({
        columnNames: ['solicitudId'],
        referencedTableName: 'solicitud',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Crear índice
    await queryRunner.createIndex(
      'recargo_solicitud',
      new TableIndex({
        name: 'IDX_recargo_solicitud_solicitudId',
        columnNames: ['solicitudId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices de recargo_solicitud
    await queryRunner.dropIndex('recargo_solicitud', 'IDX_recargo_solicitud_solicitudId');

    // Eliminar foreign key de recargo_solicitud
    const recargoTable = await queryRunner.getTable('recargo_solicitud');
    const recargoForeignKey = recargoTable!.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('solicitudId') !== -1,
    );
    if (recargoForeignKey) {
      await queryRunner.dropForeignKey('recargo_solicitud', recargoForeignKey);
    }

    // Eliminar tabla recargo_solicitud
    await queryRunner.dropTable('recargo_solicitud');

    // Eliminar índices de plan_pago_solicitud
    await queryRunner.dropIndex('plan_pago_solicitud', 'IDX_plan_pago_solicitud_fechaVencimiento');
    await queryRunner.dropIndex('plan_pago_solicitud', 'IDX_plan_pago_solicitud_solicitudId_numeroCuota');
    await queryRunner.dropIndex('plan_pago_solicitud', 'IDX_plan_pago_solicitud_solicitudId');

    // Eliminar foreign key de plan_pago_solicitud
    const planPagoTable = await queryRunner.getTable('plan_pago_solicitud');
    const planPagoForeignKey = planPagoTable!.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('solicitudId') !== -1,
    );
    if (planPagoForeignKey) {
      await queryRunner.dropForeignKey('plan_pago_solicitud', planPagoForeignKey);
    }

    // Eliminar tabla plan_pago_solicitud
    await queryRunner.dropTable('plan_pago_solicitud');
  }
}
