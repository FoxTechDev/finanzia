import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, In } from 'typeorm';
import { Prestamo, EstadoPrestamo } from '../entities/prestamo.entity';
import { PlanPago, EstadoCuota } from '../entities/plan-pago.entity';
import { Pago, EstadoPago } from '../../pagos/entities/pago.entity';
import { PagoDetalleCuota } from '../../pagos/entities/pago-detalle-cuota.entity';
import {
  ReporteCarteraItemDto,
  ReporteCarteraResponseDto,
} from '../dto/reporte-cartera.dto';
import { parseLocalDate } from '../../../common/utils/date.utils';

/**
 * Servicio para generar el reporte de Cartera de Préstamos
 * Este reporte muestra el estado de la cartera a una fecha de corte específica
 */
@Injectable()
export class ReporteCarteraService {
  constructor(
    @InjectRepository(Prestamo)
    private prestamoRepository: Repository<Prestamo>,
    @InjectRepository(PlanPago)
    private planPagoRepository: Repository<PlanPago>,
    @InjectRepository(Pago)
    private pagoRepository: Repository<Pago>,
    @InjectRepository(PagoDetalleCuota)
    private pagoDetalleCuotaRepository: Repository<PagoDetalleCuota>,
  ) {}

  /**
   * Genera el reporte de cartera a una fecha de corte específica
   */
  async generarReporte(fechaCorte: Date): Promise<ReporteCarteraResponseDto> {
    // 1. Obtener todos los préstamos VIGENTES o en MORA
    const prestamos = await this.prestamoRepository.find({
      where: {
        estado: In([EstadoPrestamo.VIGENTE, EstadoPrestamo.MORA]),
      },
      relations: [
        'persona',
        'tipoCredito',
        'tipoCredito.lineaCredito',
      ],
      order: { numeroCredito: 'ASC' },
    });

    // 2. Procesar cada préstamo
    const items: ReporteCarteraItemDto[] = [];
    let totalMonto = 0;
    let totalSaldoCapital = 0;
    let totalSaldoInteres = 0;
    let totalCapitalMora = 0;
    let totalInteresMora = 0;

    for (const prestamo of prestamos) {
      const item = await this.procesarPrestamo(prestamo, fechaCorte);
      items.push(item);

      // Acumular totales
      totalMonto += item.monto;
      totalSaldoCapital += item.saldoCapital;
      totalSaldoInteres += item.saldoInteres;
      totalCapitalMora += item.capitalMora;
      totalInteresMora += item.interesMora;
    }

    return {
      fechaCorte,
      totalPrestamos: items.length,
      totalMonto,
      totalSaldoCapital,
      totalSaldoInteres,
      totalCapitalMora,
      totalInteresMora,
      prestamos: items,
    };
  }

  /**
   * Procesa un préstamo individual y calcula sus valores a la fecha de corte
   */
  private async procesarPrestamo(
    prestamo: Prestamo,
    fechaCorte: Date,
  ): Promise<ReporteCarteraItemDto> {
    // Obtener el plan de pagos del préstamo
    const planPago = await this.planPagoRepository.find({
      where: { prestamoId: prestamo.id },
      order: { numeroCuota: 'ASC' },
    });

    // Obtener los pagos realizados HASTA la fecha de corte (solo aplicados)
    const pagos = await this.pagoRepository.find({
      where: {
        prestamoId: prestamo.id,
        estado: EstadoPago.APLICADO,
      },
      relations: ['detallesCuota'],
      order: { fechaPago: 'ASC' },
    });

    // Filtrar solo los pagos hasta la fecha de corte
    const pagosHastaCorte = pagos.filter(
      (pago) => parseLocalDate(String(pago.fechaPago)) <= fechaCorte,
    );

    // Calcular saldos considerando solo pagos hasta la fecha de corte
    const { saldoCapital, saldoInteres } = this.calcularSaldos(
      prestamo,
      planPago,
      pagosHastaCorte,
    );

    // Identificar cuotas vencidas y calcular mora
    const { cuotasAtrasadas, capitalMora, interesMora } = await this.calcularMora(
      prestamo.id,
      planPago,
      pagosHastaCorte,
      fechaCorte,
    );

    // Construir el item del reporte
    return {
      numeroCredito: prestamo.numeroCredito,
      nombreCliente: prestamo.persona
        ? `${prestamo.persona.nombre} ${prestamo.persona.apellido}`
        : '',
      lineaCredito: prestamo.tipoCredito?.lineaCredito?.nombre || '',
      tipoCredito: prestamo.tipoCredito?.nombre || '',
      fechaOtorgamiento: prestamo.fechaOtorgamiento,
      fechaVencimiento: prestamo.fechaVencimiento,
      monto: Number(prestamo.montoDesembolsado),
      plazo: prestamo.plazoAutorizado,
      tasaInteres: Number(prestamo.tasaInteres),
      cuotaTotal: Number(prestamo.cuotaTotal),
      numeroCuotas: prestamo.numeroCuotas,
      saldoCapital,
      saldoInteres,
      cuotasAtrasadas,
      capitalMora,
      interesMora,
    };
  }

  /**
   * Calcula los saldos de capital e interés considerando solo pagos hasta la fecha de corte
   */
  private calcularSaldos(
    prestamo: Prestamo,
    planPago: PlanPago[],
    pagos: Pago[],
  ): { saldoCapital: number; saldoInteres: number } {
    // Calcular el total de capital e interés original del plan
    let capitalTotal = 0;
    let interesTotal = 0;

    for (const cuota of planPago) {
      capitalTotal += Number(cuota.capital);
      interesTotal += Number(cuota.interes);
    }

    // Calcular lo pagado hasta la fecha de corte
    let capitalPagado = 0;
    let interesPagado = 0;

    for (const pago of pagos) {
      capitalPagado += Number(pago.capitalAplicado);
      interesPagado += Number(pago.interesAplicado);
    }

    // Calcular saldos
    const saldoCapital = Math.max(0, capitalTotal - capitalPagado);
    const saldoInteres = Math.max(0, interesTotal - interesPagado);

    return {
      saldoCapital: Number(saldoCapital.toFixed(2)),
      saldoInteres: Number(saldoInteres.toFixed(2)),
    };
  }

  /**
   * Calcula las cuotas atrasadas y los montos en mora a la fecha de corte
   */
  private async calcularMora(
    prestamoId: number,
    planPago: PlanPago[],
    pagos: Pago[],
    fechaCorte: Date,
  ): Promise<{
    cuotasAtrasadas: number;
    capitalMora: number;
    interesMora: number;
  }> {
    let cuotasAtrasadas = 0;
    let capitalMora = 0;
    let interesMora = 0;

    // Obtener los detalles de pagos aplicados a cada cuota
    const pagoDetalles = await this.pagoDetalleCuotaRepository.find({
      where: {
        pagoId: In(pagos.map((p) => p.id)),
      },
    });

    // Crear un mapa de cuota -> pagos aplicados
    const pagosPorCuota = new Map<number, {
      capitalPagado: number;
      interesPagado: number;
    }>();

    for (const detalle of pagoDetalles) {
      const cuotaId = detalle.planPagoId;
      const existing = pagosPorCuota.get(cuotaId) || {
        capitalPagado: 0,
        interesPagado: 0,
      };

      pagosPorCuota.set(cuotaId, {
        capitalPagado: existing.capitalPagado + Number(detalle.capitalAplicado),
        interesPagado: existing.interesPagado + Number(detalle.interesAplicado),
      });
    }

    // Recorrer el plan de pagos y verificar cuotas vencidas
    for (const cuota of planPago) {
      const fechaVencimiento = parseLocalDate(String(cuota.fechaVencimiento));

      // Si la fecha de vencimiento es mayor a la fecha de corte, no está vencida aún
      if (fechaVencimiento > fechaCorte) {
        continue;
      }

      // Obtener lo pagado en esta cuota
      const pagado = pagosPorCuota.get(cuota.id) || {
        capitalPagado: 0,
        interesPagado: 0,
      };

      // Calcular lo pendiente
      const capitalPendiente = Number(cuota.capital) - pagado.capitalPagado;
      const interesPendiente = Number(cuota.interes) - pagado.interesPagado;

      // Si tiene saldo pendiente, está en mora
      if (capitalPendiente > 0.01 || interesPendiente > 0.01) {
        cuotasAtrasadas++;
        capitalMora += Math.max(0, capitalPendiente);
        interesMora += Math.max(0, interesPendiente);
      }
    }

    return {
      cuotasAtrasadas,
      capitalMora: Number(capitalMora.toFixed(2)),
      interesMora: Number(interesMora.toFixed(2)),
    };
  }
}
