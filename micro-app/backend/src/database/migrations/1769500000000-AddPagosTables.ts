import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddPagosTables1769500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla pago
    await queryRunner.createTable(
      new Table({
        name: 'pago',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'prestamoId',
            type: 'int',
          },
          {
            name: 'numeroPago',
            type: 'varchar',
            length: '20',
            isUnique: true,
          },
          {
            name: 'fechaPago',
            type: 'date',
          },
          {
            name: 'fechaRegistro',
            type: 'datetime',
          },
          {
            name: 'montoPagado',
            type: 'decimal',
            precision: 14,
            scale: 2,
          },
          {
            name: 'capitalAplicado',
            type: 'decimal',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'interesAplicado',
            type: 'decimal',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'recargosAplicado',
            type: 'decimal',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'interesMoratorioAplicado',
            type: 'decimal',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'saldoCapitalAnterior',
            type: 'decimal',
            precision: 14,
            scale: 2,
          },
          {
            name: 'saldoInteresAnterior',
            type: 'decimal',
            precision: 14,
            scale: 2,
          },
          {
            name: 'capitalMoraAnterior',
            type: 'decimal',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'interesMoraAnterior',
            type: 'decimal',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'diasMoraAnterior',
            type: 'int',
            default: 0,
          },
          {
            name: 'saldoCapitalPosterior',
            type: 'decimal',
            precision: 14,
            scale: 2,
          },
          {
            name: 'saldoInteresPosterior',
            type: 'decimal',
            precision: 14,
            scale: 2,
          },
          {
            name: 'tipoPago',
            type: 'enum',
            enum: ['CUOTA_COMPLETA', 'PAGO_PARCIAL', 'PAGO_ADELANTADO', 'CANCELACION_TOTAL'],
            default: "'CUOTA_COMPLETA'",
          },
          {
            name: 'estado',
            type: 'enum',
            enum: ['APLICADO', 'ANULADO'],
            default: "'APLICADO'",
          },
          {
            name: 'fechaAnulacion',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'motivoAnulacion',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'usuarioAnulacionId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'nombreUsuarioAnulacion',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'usuarioId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'nombreUsuario',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'observaciones',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Foreign key para pago -> prestamo
    await queryRunner.createForeignKey(
      'pago',
      new TableForeignKey({
        columnNames: ['prestamoId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'prestamo',
        onDelete: 'RESTRICT',
      }),
    );

    // Indices para pago
    await queryRunner.createIndex(
      'pago',
      new TableIndex({
        name: 'IDX_pago_prestamoId',
        columnNames: ['prestamoId'],
      }),
    );

    await queryRunner.createIndex(
      'pago',
      new TableIndex({
        name: 'IDX_pago_fechaPago',
        columnNames: ['fechaPago'],
      }),
    );

    await queryRunner.createIndex(
      'pago',
      new TableIndex({
        name: 'IDX_pago_estado',
        columnNames: ['estado'],
      }),
    );

    // Crear tabla pago_detalle_cuota
    await queryRunner.createTable(
      new Table({
        name: 'pago_detalle_cuota',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'pagoId',
            type: 'int',
          },
          {
            name: 'planPagoId',
            type: 'int',
          },
          {
            name: 'numeroCuota',
            type: 'int',
          },
          {
            name: 'capitalAplicado',
            type: 'decimal',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'interesAplicado',
            type: 'decimal',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'recargosAplicado',
            type: 'decimal',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'interesMoratorioAplicado',
            type: 'decimal',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'estadoCuotaAnterior',
            type: 'enum',
            enum: ['PENDIENTE', 'PARCIAL', 'PAGADA', 'VENCIDA'],
          },
          {
            name: 'capitalPagadoAnterior',
            type: 'decimal',
            precision: 14,
            scale: 2,
          },
          {
            name: 'interesPagadoAnterior',
            type: 'decimal',
            precision: 14,
            scale: 2,
          },
          {
            name: 'recargosPagadoAnterior',
            type: 'decimal',
            precision: 14,
            scale: 2,
          },
          {
            name: 'interesMoratorioPagadoAnterior',
            type: 'decimal',
            precision: 14,
            scale: 2,
          },
          {
            name: 'diasMoraAnterior',
            type: 'int',
            default: 0,
          },
          {
            name: 'estadoCuotaPosterior',
            type: 'enum',
            enum: ['PENDIENTE', 'PARCIAL', 'PAGADA', 'VENCIDA'],
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Foreign keys para pago_detalle_cuota
    await queryRunner.createForeignKey(
      'pago_detalle_cuota',
      new TableForeignKey({
        columnNames: ['pagoId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'pago',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'pago_detalle_cuota',
      new TableForeignKey({
        columnNames: ['planPagoId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'plan_pago',
        onDelete: 'RESTRICT',
      }),
    );

    // Indices para pago_detalle_cuota
    await queryRunner.createIndex(
      'pago_detalle_cuota',
      new TableIndex({
        name: 'IDX_pago_detalle_pagoId',
        columnNames: ['pagoId'],
      }),
    );

    await queryRunner.createIndex(
      'pago_detalle_cuota',
      new TableIndex({
        name: 'IDX_pago_detalle_planPagoId',
        columnNames: ['planPagoId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar tabla pago_detalle_cuota primero (tiene FK a pago)
    await queryRunner.dropTable('pago_detalle_cuota', true);

    // Eliminar tabla pago
    await queryRunner.dropTable('pago', true);
  }
}
