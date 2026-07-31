import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Accion } from '../entities/accion.entity';
import { TipoAccion } from '../../tipo-accion/entities/tipo-accion.entity';
import { CreateAccionDto } from '../dto/create-accion.dto';

@Injectable()
export class AccionService {
  constructor(
    @InjectRepository(Accion)
    private readonly accionRepo: Repository<Accion>,
    @InjectRepository(TipoAccion)
    private readonly tipoAccionRepo: Repository<TipoAccion>,
    private readonly dataSource: DataSource,
  ) {}

  async abrir(dto: CreateAccionDto): Promise<Accion> {
    const tipoAccion = await this.tipoAccionRepo.findOne({
      where: { id: dto.tipoAccionId },
    });
    if (!tipoAccion) {
      throw new NotFoundException(
        `Tipo de acción ID ${dto.tipoAccionId} no encontrado`,
      );
    }
    if (!tipoAccion.activo) {
      throw new BadRequestException('El tipo de acción no está activo');
    }

    if (!dto.cuentaAhorroDestinoId && !dto.bancoId) {
      throw new BadRequestException(
        'Debe indicar la cuenta de ahorro o el banco donde se pagarán los intereses',
      );
    }

    const valorUnitario = Number(tipoAccion.valorUnitario);
    if (valorUnitario <= 0) {
      throw new BadRequestException(
        'El tipo de acción no tiene un valor unitario configurado',
      );
    }

    const cantidadAcciones =
      Math.round((dto.monto / valorUnitario) * 10000) / 10000;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const correlativo = await this.generarCorrelativo(queryRunner);

      const accion = Object.assign(new Accion(), {
        correlativo,
        personaId: dto.personaId,
        tipoAccionId: dto.tipoAccionId,
        fechaApertura: dto.fechaApertura,
        monto: dto.monto,
        cantidadAcciones,
        tasaInteres: Number(tipoAccion.tasaInteres),
        cuentaAhorroDestinoId: dto.cuentaAhorroDestinoId || null,
        bancoId: dto.bancoId || null,
        cuentaBancoNumero: dto.cuentaBancoNumero || null,
        cuentaBancoPropietario: dto.cuentaBancoPropietario || null,
        activa: true,
        observacion: dto.observacion || null,
      });

      const savedAccion = await queryRunner.manager.save(Accion, accion);

      await queryRunner.commitTransaction();

      return this.findOneEntity(savedAccion.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(personaId?: number, activa?: boolean): Promise<Accion[]> {
    const qb = this.accionRepo
      .createQueryBuilder('accion')
      .leftJoinAndSelect('accion.persona', 'persona')
      .leftJoinAndSelect('accion.tipoAccion', 'tipoAccion')
      .leftJoinAndSelect('accion.cuentaAhorroDestino', 'cuentaAhorroDestino')
      .leftJoinAndSelect('accion.banco', 'banco');

    if (personaId !== undefined) {
      qb.andWhere('accion.personaId = :personaId', { personaId });
    }
    if (activa !== undefined) {
      qb.andWhere('accion.activa = :activa', { activa });
    }

    qb.orderBy('accion.createdAt', 'DESC');
    return qb.getMany();
  }

  async findOneEntity(id: number): Promise<Accion> {
    const accion = await this.accionRepo.findOne({
      where: { id },
      relations: ['persona', 'tipoAccion', 'cuentaAhorroDestino', 'banco'],
    });
    if (!accion) {
      throw new NotFoundException(`Acción ID ${id} no encontrada`);
    }
    return accion;
  }

  /**
   * Genera el correlativo de la acción de forma atómica (formato ACC2026000001).
   * Debe ejecutarse dentro de una transacción activa para que el FOR UPDATE tenga efecto.
   */
  private async generarCorrelativo(
    queryRunner: import('typeorm').QueryRunner,
  ): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ACC${year}`;

    const result = await queryRunner.query(
      `SELECT MAX(CAST(SUBSTRING(correlativo, ?) AS UNSIGNED)) as maxNum
       FROM accion
       WHERE correlativo LIKE ?
       FOR UPDATE`,
      [prefix.length + 1, `${prefix}%`],
    );

    const secuencia = (parseInt(result[0]?.maxNum, 10) || 0) + 1;
    return `${prefix}${secuencia.toString().padStart(6, '0')}`;
  }
}
