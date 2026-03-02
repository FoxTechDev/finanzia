import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CuentaAhorro } from '../entities/cuenta-ahorro.entity';
import { TransaccionAhorro } from '../entities/transaccion-ahorro.entity';
import { PlanCapitalizacion } from '../entities/plan-capitalizacion.entity';
import { FiltrosCuentaAhorroDto } from '../dto/filtros-cuenta-ahorro.dto';
import {
  CuentaAhorroResumenDto,
  CuentaAhorroDetalleDto,
} from '../dto/cuenta-ahorro-detalle.dto';

@Injectable()
export class CuentaAhorroConsultaService {
  constructor(
    @InjectRepository(CuentaAhorro)
    private readonly cuentaRepo: Repository<CuentaAhorro>,
    @InjectRepository(TransaccionAhorro)
    private readonly transRepo: Repository<TransaccionAhorro>,
    @InjectRepository(PlanCapitalizacion)
    private readonly planCapRepo: Repository<PlanCapitalizacion>,
  ) {}

  async findAll(
    filtros: FiltrosCuentaAhorroDto,
  ): Promise<{ data: CuentaAhorroResumenDto[]; total: number }> {
    const page = filtros.page || 1;
    const limit = filtros.limit || 20;

    const qb = this.cuentaRepo
      .createQueryBuilder('cuenta')
      .leftJoinAndSelect('cuenta.persona', 'persona')
      .leftJoinAndSelect('cuenta.tipoAhorro', 'tipoAhorro')
      .leftJoinAndSelect('tipoAhorro.lineaAhorro', 'lineaAhorro')
      .leftJoinAndSelect('cuenta.estado', 'estado');

    if (filtros.buscar) {
      qb.andWhere(
        '(persona.nombre LIKE :buscar OR persona.apellido LIKE :buscar OR cuenta.noCuenta LIKE :buscar OR persona.numeroDui LIKE :buscar)',
        { buscar: `%${filtros.buscar}%` },
      );
    }

    if (filtros.tipoAhorroId) {
      qb.andWhere('cuenta.tipoAhorroId = :tipoAhorroId', {
        tipoAhorroId: filtros.tipoAhorroId,
      });
    }

    if (filtros.estadoId) {
      qb.andWhere('cuenta.estadoId = :estadoId', {
        estadoId: filtros.estadoId,
      });
    }

    if (filtros.lineaCodigo) {
      qb.andWhere('lineaAhorro.codigo = :lineaCodigo', {
        lineaCodigo: filtros.lineaCodigo,
      });
    }

    if (filtros.fechaDesde) {
      qb.andWhere('cuenta.fechaApertura >= :fechaDesde', {
        fechaDesde: filtros.fechaDesde,
      });
    }

    if (filtros.fechaHasta) {
      qb.andWhere('cuenta.fechaApertura <= :fechaHasta', {
        fechaHasta: filtros.fechaHasta,
      });
    }

    qb.orderBy('cuenta.id', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [cuentas, total] = await qb.getManyAndCount();

    const data = cuentas.map((c) => this.toResumen(c));
    return { data, total };
  }

  async findDetalle(id: number): Promise<CuentaAhorroDetalleDto> {
    const cuenta = await this.cuentaRepo.findOne({
      where: { id },
      relations: [
        'persona',
        'tipoAhorro',
        'tipoAhorro.lineaAhorro',
        'estado',
        'tipoCapitalizacion',
        'cuentaAhorroDestino',
        'banco',
      ],
    });
    if (!cuenta) {
      throw new NotFoundException(`Cuenta de ahorro ID ${id} no encontrada`);
    }
    return this.toDetalle(cuenta);
  }

  async findTransacciones(
    cuentaId: number,
    page: number = 1,
    limit: number = 50,
  ) {
    const [data, total] = await this.transRepo.findAndCount({
      where: { cuentaAhorroId: cuentaId },
      relations: ['naturaleza', 'tipoTransaccion'],
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async getEstadoCuenta(id: number) {
    const cuenta = await this.cuentaRepo.findOne({
      where: { id },
      relations: [
        'persona',
        'tipoAhorro',
        'tipoAhorro.lineaAhorro',
        'estado',
        'tipoCapitalizacion',
        'cuentaAhorroDestino',
        'banco',
      ],
    });
    if (!cuenta) {
      throw new NotFoundException(`Cuenta de ahorro ID ${id} no encontrada`);
    }

    const transacciones = await this.transRepo.find({
      where: { cuentaAhorroId: id },
      relations: ['naturaleza', 'tipoTransaccion'],
      order: { id: 'ASC' },
    });

    return {
      cuenta: this.toDetalle(cuenta),
      transacciones,
    };
  }

  private toResumen(c: CuentaAhorro): CuentaAhorroResumenDto {
    return {
      id: c.id,
      noCuenta: c.noCuenta,
      personaId: c.personaId,
      nombreCliente: c.persona
        ? `${c.persona.nombre} ${c.persona.apellido}`
        : '',
      numeroDui: c.persona?.numeroDui || '',
      tipoAhorro: c.tipoAhorro?.nombre || '',
      lineaAhorro: c.tipoAhorro?.lineaAhorro?.nombre || '',
      estado: c.estado?.nombre || '',
      fechaApertura: c.fechaApertura,
      saldo: Number(c.saldo),
      saldoDisponible: Number(c.saldoDisponible),
      tasaInteres: Number(c.tasaInteres),
      pignorado: c.pignorado,
      monto: Number(c.monto),
      plazo: c.plazo,
      fechaVencimiento: c.fechaVencimiento,
    };
  }

  private toDetalle(c: CuentaAhorro): CuentaAhorroDetalleDto {
    return {
      ...this.toResumen(c),
      monto: Number(c.monto),
      plazo: c.plazo,
      fechaVencimiento: c.fechaVencimiento,
      montoPignorado: Number(c.montoPignorado),
      fechaUltMovimiento: c.fechaUltMovimiento,
      saldoInteres: Number(c.saldoInteres),
      fechaCancelacion: c.fechaCancelacion,
      tipoCapitalizacion: c.tipoCapitalizacion?.nombre || null,
      createdAt: c.createdAt,
      cuentaAhorroDestinoId: c.cuentaAhorroDestinoId || null,
      cuentaAhorroDestinoNoCuenta: c.cuentaAhorroDestino?.noCuenta || null,
      bancoNombre: c.banco?.nombre || null,
      cuentaBancoNumero: c.cuentaBancoNumero || null,
      cuentaBancoPropietario: c.cuentaBancoPropietario || null,
    };
  }

  async findActivasAV(
    personaId?: number,
  ): Promise<{ id: number; noCuenta: string; nombreCliente: string }[]> {
    const qb = this.cuentaRepo
      .createQueryBuilder('cuenta')
      .leftJoinAndSelect('cuenta.persona', 'persona')
      .leftJoinAndSelect('cuenta.tipoAhorro', 'tipoAhorro')
      .leftJoinAndSelect('tipoAhorro.lineaAhorro', 'lineaAhorro')
      .leftJoinAndSelect('cuenta.estado', 'estado')
      .where('lineaAhorro.codigo = :codigo', { codigo: 'AV' })
      .andWhere('estado.codigo = :estado', { estado: 'ACTIVA' });

    if (personaId) {
      qb.andWhere('cuenta.personaId = :personaId', { personaId });
    }

    qb.orderBy('cuenta.noCuenta', 'ASC');
    const cuentas = await qb.getMany();

    return cuentas.map((c) => ({
      id: c.id,
      noCuenta: c.noCuenta,
      nombreCliente: c.persona
        ? `${c.persona.nombre} ${c.persona.apellido}`
        : '',
    }));
  }

  async findInteresesPorPagar(
    fechaDesde: string,
    fechaHasta: string,
  ): Promise<{ data: any[]; total: number }> {
    const planes = await this.planCapRepo
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.cuentaAhorro', 'cuenta')
      .leftJoinAndSelect('cuenta.persona', 'persona')
      .leftJoinAndSelect('cuenta.tipoAhorro', 'tipoAhorro')
      .leftJoinAndSelect('cuenta.tipoCapitalizacion', 'tipoCapitalizacion')
      .leftJoinAndSelect('cuenta.estado', 'estado')
      .where('plan.fechaCapitalizacion BETWEEN :fechaDesde AND :fechaHasta', {
        fechaDesde,
        fechaHasta,
      })
      .andWhere('estado.codigo = :estado', { estado: 'ACTIVA' })
      .orderBy('plan.fechaCapitalizacion', 'ASC')
      .getMany();

    const data = planes.map((p) => ({
      fechaCapitalizacion: p.fechaCapitalizacion,
      noCuenta: p.cuentaAhorro?.noCuenta || '',
      nombrePropietario: p.cuentaAhorro?.persona
        ? `${p.cuentaAhorro.persona.nombre} ${p.cuentaAhorro.persona.apellido}`
        : '',
      tipoAhorro: p.cuentaAhorro?.tipoAhorro?.nombre || '',
      tipoCapitalizacion: p.cuentaAhorro?.tipoCapitalizacion?.nombre || '',
      saldoCuenta: Number(p.cuentaAhorro?.saldo) || 0,
      tasa: Number(p.cuentaAhorro?.tasaInteres) || 0,
      montoPagar: Number(p.monto) || 0,
    }));

    return { data, total: data.length };
  }
}
