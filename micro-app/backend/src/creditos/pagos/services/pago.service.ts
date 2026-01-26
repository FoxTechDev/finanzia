import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Pago, EstadoPago, TipoPago } from '../entities/pago.entity';
import { PagoDetalleCuota } from '../entities/pago-detalle-cuota.entity';
import { Prestamo, EstadoPrestamo } from '../../desembolso/entities/prestamo.entity';
import { PlanPago, EstadoCuota } from '../../desembolso/entities/plan-pago.entity';
import { PagoCalculoService, ResumenAdeudo, DistribucionPago } from './pago-calculo.service';
import { CrearPagoDto } from '../dto/crear-pago.dto';
import { PreviewPagoDto } from '../dto/preview-pago.dto';
import { AnularPagoDto } from '../dto/anular-pago.dto';

export interface PreviewPagoResponse {
  resumenAdeudo: ResumenAdeudo;
  distribucion: DistribucionPago;
  saldosPosterior: {
    saldoCapital: number;
    saldoInteres: number;
  };
}

@Injectable()
export class PagoService {
  constructor(
    @InjectRepository(Pago)
    private pagoRepository: Repository<Pago>,
    @InjectRepository(PagoDetalleCuota)
    private pagoDetalleRepository: Repository<PagoDetalleCuota>,
    @InjectRepository(Prestamo)
    private prestamoRepository: Repository<Prestamo>,
    @InjectRepository(PlanPago)
    private planPagoRepository: Repository<PlanPago>,
    private dataSource: DataSource,
    private pagoCalculoService: PagoCalculoService,
  ) {}

  /**
   * Genera preview de un pago sin aplicarlo
   */
  async preview(dto: PreviewPagoDto): Promise<PreviewPagoResponse> {
    const fechaPago = new Date(dto.fechaPago);

    // Validar préstamo existe y está vigente
    const prestamo = await this.prestamoRepository.findOne({
      where: { id: dto.prestamoId },
    });

    if (!prestamo) {
      throw new NotFoundException(`Préstamo ${dto.prestamoId} no encontrado`);
    }

    if (prestamo.estado === EstadoPrestamo.CANCELADO) {
      throw new BadRequestException('El préstamo ya está cancelado');
    }

    if (prestamo.estado === EstadoPrestamo.CASTIGADO) {
      throw new BadRequestException('El préstamo está castigado');
    }

    // Obtener resumen de adeudo
    const resumenAdeudo = await this.pagoCalculoService.obtenerResumenAdeudo(
      dto.prestamoId,
      fechaPago,
    );

    // Validar monto
    if (dto.montoPagar <= 0) {
      throw new BadRequestException('El monto a pagar debe ser mayor a 0');
    }

    // Calcular distribución
    const distribucion = this.pagoCalculoService.calcularDistribucion(
      dto.montoPagar,
      resumenAdeudo.cuotasPendientes,
    );

    // Calcular saldos posteriores
    const saldoCapitalPosterior = this.redondear(
      Number(prestamo.saldoCapital) - distribucion.capitalAplicado,
    );
    const saldoInteresPosterior = this.redondear(
      Number(prestamo.saldoInteres) - distribucion.interesAplicado,
    );

    return {
      resumenAdeudo,
      distribucion,
      saldosPosterior: {
        saldoCapital: Math.max(0, saldoCapitalPosterior),
        saldoInteres: Math.max(0, saldoInteresPosterior),
      },
    };
  }

  /**
   * Crea y aplica un pago
   */
  async crear(dto: CrearPagoDto): Promise<Pago> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fechaPago = new Date(dto.fechaPago);
      const fechaRegistro = new Date();

      // Validar préstamo
      const prestamo = await queryRunner.manager.findOne(Prestamo, {
        where: { id: dto.prestamoId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!prestamo) {
        throw new NotFoundException(`Préstamo ${dto.prestamoId} no encontrado`);
      }

      if (prestamo.estado === EstadoPrestamo.CANCELADO) {
        throw new BadRequestException('El préstamo ya está cancelado');
      }

      if (prestamo.estado === EstadoPrestamo.CASTIGADO) {
        throw new BadRequestException('El préstamo está castigado');
      }

      // Obtener resumen y calcular distribución
      const resumenAdeudo = await this.pagoCalculoService.obtenerResumenAdeudo(
        dto.prestamoId,
        fechaPago,
      );

      const distribucion = this.pagoCalculoService.calcularDistribucion(
        dto.montoPagar,
        resumenAdeudo.cuotasPendientes,
      );

      // Validar que hay algo que aplicar
      const totalAplicado =
        distribucion.capitalAplicado +
        distribucion.interesAplicado +
        distribucion.recargosAplicado +
        distribucion.interesMoratorioAplicado;

      if (totalAplicado <= 0) {
        throw new BadRequestException(
          'No hay montos pendientes para aplicar el pago',
        );
      }

      // Generar número de pago
      const numeroPago = await this.generarNumeroPago(queryRunner);

      // Calcular saldos posteriores
      const saldoCapitalPosterior = this.redondear(
        Number(prestamo.saldoCapital) - distribucion.capitalAplicado,
      );
      const saldoInteresPosterior = this.redondear(
        Number(prestamo.saldoInteres) - distribucion.interesAplicado,
      );

      // Crear registro de pago
      const pago = queryRunner.manager.create(Pago, {
        prestamoId: dto.prestamoId,
        numeroPago,
        fechaPago,
        fechaRegistro,
        montoPagado: dto.montoPagar,
        capitalAplicado: distribucion.capitalAplicado,
        interesAplicado: distribucion.interesAplicado,
        recargosAplicado: distribucion.recargosAplicado,
        interesMoratorioAplicado: distribucion.interesMoratorioAplicado,
        // Saldos anteriores para reversa
        saldoCapitalAnterior: Number(prestamo.saldoCapital),
        saldoInteresAnterior: Number(prestamo.saldoInteres),
        capitalMoraAnterior: Number(prestamo.capitalMora),
        interesMoraAnterior: Number(prestamo.interesMora),
        diasMoraAnterior: prestamo.diasMora,
        // Saldos posteriores
        saldoCapitalPosterior: Math.max(0, saldoCapitalPosterior),
        saldoInteresPosterior: Math.max(0, saldoInteresPosterior),
        tipoPago: distribucion.tipoPago,
        estado: EstadoPago.APLICADO,
        usuarioId: dto.usuarioId,
        nombreUsuario: dto.nombreUsuario,
        observaciones: dto.observaciones,
      });

      const pagoGuardado = await queryRunner.manager.save(pago);

      // Crear detalles de cuotas afectadas y actualizar cuotas
      for (const cuotaAplicacion of distribucion.cuotasAfectadas) {
        // Crear detalle
        const detalle = queryRunner.manager.create(PagoDetalleCuota, {
          pagoId: pagoGuardado.id,
          planPagoId: cuotaAplicacion.planPagoId,
          numeroCuota: cuotaAplicacion.numeroCuota,
          capitalAplicado: cuotaAplicacion.capitalAplicado,
          interesAplicado: cuotaAplicacion.interesAplicado,
          recargosAplicado: cuotaAplicacion.recargosAplicado,
          interesMoratorioAplicado: cuotaAplicacion.interesMoratorioAplicado,
          estadoCuotaAnterior: cuotaAplicacion.estadoAnterior,
          capitalPagadoAnterior: cuotaAplicacion.capitalPagadoAnterior,
          interesPagadoAnterior: cuotaAplicacion.interesPagadoAnterior,
          recargosPagadoAnterior: cuotaAplicacion.recargosPagadoAnterior,
          interesMoratorioPagadoAnterior: cuotaAplicacion.interesMoratorioPagadoAnterior,
          diasMoraAnterior: cuotaAplicacion.diasMoraAnterior,
          estadoCuotaPosterior: cuotaAplicacion.estadoPosterior,
        });

        await queryRunner.manager.save(detalle);

        // Actualizar cuota
        await queryRunner.manager.update(PlanPago, cuotaAplicacion.planPagoId, {
          capitalPagado: this.redondear(
            cuotaAplicacion.capitalPagadoAnterior + cuotaAplicacion.capitalAplicado,
          ),
          interesPagado: this.redondear(
            cuotaAplicacion.interesPagadoAnterior + cuotaAplicacion.interesAplicado,
          ),
          recargosPagado: this.redondear(
            cuotaAplicacion.recargosPagadoAnterior + cuotaAplicacion.recargosAplicado,
          ),
          interesMoratorioPagado: this.redondear(
            cuotaAplicacion.interesMoratorioPagadoAnterior + cuotaAplicacion.interesMoratorioAplicado,
          ),
          estado: cuotaAplicacion.estadoPosterior,
          fechaPago: cuotaAplicacion.estadoPosterior === EstadoCuota.PAGADA ? fechaPago : undefined,
        });
      }

      // Actualizar préstamo
      const nuevoEstado =
        distribucion.tipoPago === TipoPago.CANCELACION_TOTAL
          ? EstadoPrestamo.CANCELADO
          : prestamo.estado;

      await queryRunner.manager.update(Prestamo, dto.prestamoId, {
        saldoCapital: Math.max(0, saldoCapitalPosterior),
        saldoInteres: Math.max(0, saldoInteresPosterior),
        fechaUltimoPago: fechaPago,
        estado: nuevoEstado,
        fechaCancelacion:
          nuevoEstado === EstadoPrestamo.CANCELADO ? fechaPago : undefined,
      });

      await queryRunner.commitTransaction();

      // Retornar pago con relaciones
      return this.findOne(pagoGuardado.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Anula un pago y revierte los cambios
   */
  async anular(id: number, dto: AnularPagoDto): Promise<Pago> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Obtener pago con detalles
      const pago = await queryRunner.manager.findOne(Pago, {
        where: { id },
        relations: ['detallesCuota', 'prestamo'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!pago) {
        throw new NotFoundException(`Pago ${id} no encontrado`);
      }

      if (pago.estado === EstadoPago.ANULADO) {
        throw new BadRequestException('El pago ya está anulado');
      }

      // Verificar que no hay pagos posteriores
      const pagosPosteriores = await queryRunner.manager.count(Pago, {
        where: {
          prestamoId: pago.prestamoId,
          estado: EstadoPago.APLICADO,
          fechaRegistro: pago.fechaRegistro,
        },
      });

      // Buscar pagos con fecha de registro mayor
      const pagosConFechaMayor = await queryRunner.manager
        .createQueryBuilder(Pago, 'p')
        .where('p.prestamoId = :prestamoId', { prestamoId: pago.prestamoId })
        .andWhere('p.estado = :estado', { estado: EstadoPago.APLICADO })
        .andWhere('p.fechaRegistro > :fecha', { fecha: pago.fechaRegistro })
        .getCount();

      if (pagosConFechaMayor > 0) {
        throw new BadRequestException(
          'No se puede anular este pago porque existen pagos posteriores. Anule primero los pagos más recientes.',
        );
      }

      // Revertir cuotas afectadas
      for (const detalle of pago.detallesCuota) {
        await queryRunner.manager.update(PlanPago, detalle.planPagoId, {
          capitalPagado: detalle.capitalPagadoAnterior,
          interesPagado: detalle.interesPagadoAnterior,
          recargosPagado: detalle.recargosPagadoAnterior,
          interesMoratorioPagado: detalle.interesMoratorioPagadoAnterior,
          diasMora: detalle.diasMoraAnterior,
          estado: detalle.estadoCuotaAnterior,
          fechaPago: null as any,
        });
      }

      // Revertir préstamo a saldos anteriores
      await queryRunner.manager.update(Prestamo, pago.prestamoId, {
        saldoCapital: pago.saldoCapitalAnterior,
        saldoInteres: pago.saldoInteresAnterior,
        capitalMora: pago.capitalMoraAnterior,
        interesMora: pago.interesMoraAnterior,
        diasMora: pago.diasMoraAnterior,
        estado: EstadoPrestamo.VIGENTE, // Si estaba cancelado, vuelve a vigente
        fechaCancelacion: null as any,
      });

      // Marcar pago como anulado
      await queryRunner.manager.update(Pago, id, {
        estado: EstadoPago.ANULADO,
        fechaAnulacion: new Date(),
        motivoAnulacion: dto.motivoAnulacion,
        usuarioAnulacionId: dto.usuarioAnulacionId,
        nombreUsuarioAnulacion: dto.nombreUsuarioAnulacion,
      });

      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene un pago por ID con todas sus relaciones
   */
  async findOne(id: number): Promise<Pago> {
    const pago = await this.pagoRepository.findOne({
      where: { id },
      relations: ['prestamo', 'prestamo.persona', 'detallesCuota'],
    });

    if (!pago) {
      throw new NotFoundException(`Pago ${id} no encontrado`);
    }

    return pago;
  }

  /**
   * Genera número único de pago
   */
  private async generarNumeroPago(queryRunner: any): Promise<string> {
    const anio = new Date().getFullYear();
    const prefijo = `PAG${anio}`;

    // Buscar último número del año
    const ultimoPago = await queryRunner.manager
      .createQueryBuilder(Pago, 'p')
      .where('p.numeroPago LIKE :prefijo', { prefijo: `${prefijo}%` })
      .orderBy('p.numeroPago', 'DESC')
      .getOne();

    let numero = 1;
    if (ultimoPago) {
      const ultimoNumero = parseInt(ultimoPago.numeroPago.slice(-6), 10);
      numero = ultimoNumero + 1;
    }

    return `${prefijo}${numero.toString().padStart(6, '0')}`;
  }

  /**
   * Redondea a 2 decimales
   */
  private redondear(valor: number): number {
    return Math.round(valor * 100) / 100;
  }
}
