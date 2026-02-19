import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Pago, EstadoPago } from '../entities/pago.entity';
import { PagoDetalleCuota } from '../entities/pago-detalle-cuota.entity';
import { Prestamo } from '../../desembolso/entities/prestamo.entity';
import { PlanPago } from '../../desembolso/entities/plan-pago.entity';
import { FiltrosPagoDto } from '../dto/filtros-pago.dto';
import { PagoCalculoService } from './pago-calculo.service';

export interface EstadoCuenta {
  prestamo: {
    id: number;
    numeroCredito: string;
    personaNombre: string;
    montoDesembolsado: number;
    fechaOtorgamiento: Date;
    fechaVencimiento: Date;
    saldoCapital: number;
    saldoInteres: number;
    estado: string;
  };
  resumenPagos: {
    totalPagado: number;
    capitalPagado: number;
    interesPagado: number;
    recargosPagado: number;
    moratorioPagado: number;
    numeroPagos: number;
  };
  pagos: Pago[];
  planPago: PlanPago[];
}

export interface PaginatedPagos {
  data: Pago[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class PagoConsultaService {
  constructor(
    @InjectRepository(Pago)
    private pagoRepository: Repository<Pago>,
    @InjectRepository(PagoDetalleCuota)
    private pagoDetalleRepository: Repository<PagoDetalleCuota>,
    @InjectRepository(Prestamo)
    private prestamoRepository: Repository<Prestamo>,
    @InjectRepository(PlanPago)
    private planPagoRepository: Repository<PlanPago>,
    private pagoCalculoService: PagoCalculoService,
  ) {}

  /**
   * Lista pagos de un préstamo específico
   */
  async findByPrestamo(prestamoId: number): Promise<Pago[]> {
    // Verificar que el préstamo existe
    const prestamo = await this.prestamoRepository.findOne({
      where: { id: prestamoId },
    });

    if (!prestamo) {
      throw new NotFoundException(`Préstamo ${prestamoId} no encontrado`);
    }

    return this.pagoRepository.find({
      where: { prestamoId },
      relations: ['detallesCuota'],
      order: { fechaRegistro: 'DESC' },
    });
  }

  /**
   * Lista pagos con filtros y paginación
   */
  async findAll(filtros: FiltrosPagoDto): Promise<PaginatedPagos> {
    const page = filtros.page || 1;
    const limit = filtros.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.pagoRepository
      .createQueryBuilder('pago')
      .leftJoinAndSelect('pago.prestamo', 'prestamo')
      .leftJoinAndSelect('prestamo.persona', 'persona')
      .leftJoinAndSelect('pago.detallesCuota', 'detalles');

    // Aplicar filtros
    if (filtros.prestamoId) {
      queryBuilder.andWhere('pago.prestamoId = :prestamoId', {
        prestamoId: filtros.prestamoId,
      });
    }

    if (filtros.estado) {
      queryBuilder.andWhere('pago.estado = :estado', {
        estado: filtros.estado,
      });
    }

    if (filtros.cliente) {
      queryBuilder.andWhere(
        '(persona.nombre LIKE :cliente OR persona.apellido LIKE :cliente OR persona.numeroDui LIKE :cliente OR CONCAT(persona.nombre, \' \', persona.apellido) LIKE :cliente)',
        { cliente: `%${filtros.cliente}%` },
      );
    }

    if (filtros.fechaDesde && filtros.fechaHasta) {
      queryBuilder.andWhere('pago.fechaPago BETWEEN :desde AND :hasta', {
        desde: filtros.fechaDesde,
        hasta: filtros.fechaHasta,
      });
    } else if (filtros.fechaDesde) {
      queryBuilder.andWhere('pago.fechaPago >= :desde', {
        desde: filtros.fechaDesde,
      });
    } else if (filtros.fechaHasta) {
      queryBuilder.andWhere('pago.fechaPago <= :hasta', {
        hasta: filtros.fechaHasta,
      });
    }

    // Ordenar por fecha de registro descendente
    queryBuilder.orderBy('pago.fechaRegistro', 'DESC');

    // Obtener total
    const total = await queryBuilder.getCount();

    // Aplicar paginación
    queryBuilder.skip(skip).take(limit);

    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtiene estado de cuenta completo de un préstamo
   */
  async getEstadoCuenta(prestamoId: number): Promise<EstadoCuenta> {
    // Obtener préstamo con relaciones
    const prestamo = await this.prestamoRepository.findOne({
      where: { id: prestamoId },
      relations: ['persona', 'tipoCredito'],
    });

    if (!prestamo) {
      throw new NotFoundException(`Préstamo ${prestamoId} no encontrado`);
    }

    // Obtener todos los pagos aplicados
    const pagos = await this.pagoRepository.find({
      where: {
        prestamoId,
        estado: EstadoPago.APLICADO,
      },
      relations: ['detallesCuota'],
      order: { fechaPago: 'ASC' },
    });

    // Obtener plan de pagos
    const planPago = await this.planPagoRepository.find({
      where: { prestamoId },
      order: { numeroCuota: 'ASC' },
    });

    // Calcular resumen de pagos
    const resumenPagos = pagos.reduce(
      (acc, p) => ({
        totalPagado: acc.totalPagado + Number(p.montoPagado),
        capitalPagado: acc.capitalPagado + Number(p.capitalAplicado),
        interesPagado: acc.interesPagado + Number(p.interesAplicado),
        recargosPagado: acc.recargosPagado + Number(p.recargosAplicado),
        moratorioPagado: acc.moratorioPagado + Number(p.interesMoratorioAplicado),
        numeroPagos: acc.numeroPagos + 1,
      }),
      {
        totalPagado: 0,
        capitalPagado: 0,
        interesPagado: 0,
        recargosPagado: 0,
        moratorioPagado: 0,
        numeroPagos: 0,
      },
    );

    // Redondear valores
    resumenPagos.totalPagado = this.redondear(resumenPagos.totalPagado);
    resumenPagos.capitalPagado = this.redondear(resumenPagos.capitalPagado);
    resumenPagos.interesPagado = this.redondear(resumenPagos.interesPagado);
    resumenPagos.recargosPagado = this.redondear(resumenPagos.recargosPagado);
    resumenPagos.moratorioPagado = this.redondear(resumenPagos.moratorioPagado);

    return {
      prestamo: {
        id: prestamo.id,
        numeroCredito: prestamo.numeroCredito,
        personaNombre: prestamo.persona
          ? `${prestamo.persona.nombre} ${prestamo.persona.apellido}`
          : 'N/A',
        montoDesembolsado: Number(prestamo.montoDesembolsado),
        fechaOtorgamiento: prestamo.fechaOtorgamiento,
        fechaVencimiento: prestamo.fechaVencimiento,
        saldoCapital: Number(prestamo.saldoCapital),
        saldoInteres: Number(prestamo.saldoInteres),
        estado: prestamo.estado,
      },
      resumenPagos,
      pagos,
      planPago,
    };
  }

  /**
   * Obtiene el resumen de adeudo actualizado
   */
  async getResumenAdeudo(prestamoId: number) {
    return this.pagoCalculoService.obtenerResumenAdeudo(
      prestamoId,
      new Date(),
    );
  }

  /**
   * Redondea a 2 decimales
   */
  private redondear(valor: number): number {
    return Math.round(valor * 100) / 100;
  }
}
