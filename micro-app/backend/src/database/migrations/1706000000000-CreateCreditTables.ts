import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCreditTables1706000000000 implements MigrationInterface {
  name = 'CreateCreditTables1706000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tabla lineaCredito
    await queryRunner.createTable(
      new Table({
        name: 'lineaCredito',
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
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'activo',
            type: 'boolean',
            default: true,
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

    // Tabla tipoCredito
    await queryRunner.createTable(
      new Table({
        name: 'tipoCredito',
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
            length: '150',
          },
          {
            name: 'descripcion',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'lineaCreditoId',
            type: 'int',
          },
          {
            name: 'tasaInteres',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'tasaInteresMinima',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'tasaInteresMaxima',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'tasaInteresMoratorio',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'montoMinimo',
            type: 'decimal',
            precision: 14,
            scale: 2,
          },
          {
            name: 'montoMaximo',
            type: 'decimal',
            precision: 14,
            scale: 2,
          },
          {
            name: 'plazoMinimo',
            type: 'int',
          },
          {
            name: 'plazoMaximo',
            type: 'int',
          },
          {
            name: 'periodicidadPago',
            type: 'varchar',
            length: '20',
            default: "'mensual'",
          },
          {
            name: 'tipoCuota',
            type: 'varchar',
            length: '20',
            default: "'fija'",
          },
          {
            name: 'diasGracia',
            type: 'int',
            default: 0,
          },
          {
            name: 'porcentajeFinanciamiento',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'requiereGarantia',
            type: 'boolean',
            default: false,
          },
          {
            name: 'fechaVigenciaDesde',
            type: 'date',
          },
          {
            name: 'fechaVigenciaHasta',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'activo',
            type: 'boolean',
            default: true,
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

    await queryRunner.createForeignKey(
      'tipoCredito',
      new TableForeignKey({
        columnNames: ['lineaCreditoId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lineaCredito',
        onDelete: 'RESTRICT',
      }),
    );

    // Tabla solicitud
    await queryRunner.createTable(
      new Table({
        name: 'solicitud',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'numeroSolicitud',
            type: 'varchar',
            length: '20',
            isUnique: true,
          },
          {
            name: 'personaId',
            type: 'int',
          },
          {
            name: 'lineaCreditoId',
            type: 'int',
          },
          {
            name: 'tipoCreditoId',
            type: 'int',
          },
          {
            name: 'estado',
            type: 'enum',
            enum: ['CREADA', 'EN_ANALISIS', 'OBSERVADA', 'DENEGADA', 'APROBADA', 'DESEMBOLSADA', 'CANCELADA'],
            default: "'CREADA'",
          },
          {
            name: 'montoSolicitado',
            type: 'decimal',
            precision: 14,
            scale: 2,
          },
          {
            name: 'plazoSolicitado',
            type: 'int',
          },
          {
            name: 'tasaInteresPropuesta',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'destinoCredito',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'garantiaOfrecida',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'fechaSolicitud',
            type: 'date',
          },
          {
            name: 'fechaAnalisis',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'fechaAprobacion',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'fechaDenegacion',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'montoAprobado',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'plazoAprobado',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'tasaInteresAprobada',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'observaciones',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'motivoRechazo',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'analistaId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'nombreAnalista',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'aprobadorId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'nombreAprobador',
            type: 'varchar',
            length: '150',
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

    await queryRunner.createForeignKey(
      'solicitud',
      new TableForeignKey({
        columnNames: ['personaId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'persona',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'solicitud',
      new TableForeignKey({
        columnNames: ['lineaCreditoId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lineaCredito',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'solicitud',
      new TableForeignKey({
        columnNames: ['tipoCreditoId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tipoCredito',
        onDelete: 'RESTRICT',
      }),
    );

    // Tabla solicitudHistorial
    await queryRunner.createTable(
      new Table({
        name: 'solicitudHistorial',
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
          },
          {
            name: 'estadoAnterior',
            type: 'enum',
            enum: ['CREADA', 'EN_ANALISIS', 'OBSERVADA', 'DENEGADA', 'APROBADA', 'DESEMBOLSADA', 'CANCELADA'],
          },
          {
            name: 'estadoNuevo',
            type: 'enum',
            enum: ['CREADA', 'EN_ANALISIS', 'OBSERVADA', 'DENEGADA', 'APROBADA', 'DESEMBOLSADA', 'CANCELADA'],
          },
          {
            name: 'observacion',
            type: 'text',
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
            name: 'fechaCambio',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'solicitudHistorial',
      new TableForeignKey({
        columnNames: ['solicitudId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'solicitud',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const solicitudHistorialTable = await queryRunner.getTable('solicitudHistorial');
    if (solicitudHistorialTable) {
      const fk = solicitudHistorialTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('solicitudId') !== -1,
      );
      if (fk) await queryRunner.dropForeignKey('solicitudHistorial', fk);
    }
    await queryRunner.dropTable('solicitudHistorial', true);

    const solicitudTable = await queryRunner.getTable('solicitud');
    if (solicitudTable) {
      for (const fk of solicitudTable.foreignKeys) {
        await queryRunner.dropForeignKey('solicitud', fk);
      }
    }
    await queryRunner.dropTable('solicitud', true);

    const tipoCreditoTable = await queryRunner.getTable('tipoCredito');
    if (tipoCreditoTable) {
      const fk = tipoCreditoTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('lineaCreditoId') !== -1,
      );
      if (fk) await queryRunner.dropForeignKey('tipoCredito', fk);
    }
    await queryRunner.dropTable('tipoCredito', true);

    await queryRunner.dropTable('lineaCredito', true);
  }
}
