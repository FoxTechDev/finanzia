import { Injectable } from '@nestjs/common';
import { PeriodicidadPago } from '../entities/prestamo.entity';
import { CuotaCalculada } from './calculo-interes.service';
import { RecargoDto } from '../dto/preview-desembolso.dto';
import { TipoCalculo } from '../entities/tipo-deduccion.entity';

export interface CuotaPlanPago {
  numeroCuota: number;
  fechaVencimiento: Date;
  capital: number;
  interes: number;
  recargos: number;
  cuotaTotal: number;
  saldoCapital: number;
}

export interface RecargoCalculado {
  nombre: string;
  tipoRecargoId?: number;
  tipoCalculo: TipoCalculo;
  valor: number;
  montoCalculado: number;
  aplicaDesde: number;
  aplicaHasta: number;
}

@Injectable()
export class PlanPagoService {
  /**
   * Genera el plan de pagos con fechas y recargos
   */
  generarPlanPago(
    fechaPrimeraCuota: Date,
    periodicidad: PeriodicidadPago,
    cuotasCalculadas: CuotaCalculada[],
    recargosCalculados: RecargoCalculado[],
    cuotaNormal: number,
  ): CuotaPlanPago[] {
    const planPago: CuotaPlanPago[] = [];
    const numeroCuotas = cuotasCalculadas.length;

    for (const cuota of cuotasCalculadas) {
      // Calcular fecha de vencimiento
      const fechaVencimiento = this.calcularFechaVencimiento(
        fechaPrimeraCuota,
        periodicidad,
        cuota.numeroCuota,
      );

      // Calcular recargos aplicables a esta cuota
      const recargosAplicables = this.calcularRecargosParaCuota(
        cuota.numeroCuota,
        recargosCalculados,
        cuotaNormal,
        numeroCuotas,
      );

      planPago.push({
        numeroCuota: cuota.numeroCuota,
        fechaVencimiento,
        capital: cuota.capital,
        interes: cuota.interes,
        recargos: recargosAplicables,
        cuotaTotal: this.redondear(
          cuota.capital + cuota.interes + recargosAplicables,
        ),
        saldoCapital: cuota.saldoCapital,
      });
    }

    return planPago;
  }

  /**
   * Calcula la fecha de vencimiento según la periodicidad
   */
  calcularFechaVencimiento(
    fechaPrimeraCuota: Date,
    periodicidad: PeriodicidadPago,
    numeroCuota: number,
  ): Date {
    const fecha = new Date(fechaPrimeraCuota);
    const cuotasAdicionales = numeroCuota - 1;

    switch (periodicidad) {
      case PeriodicidadPago.DIARIO:
        fecha.setDate(fecha.getDate() + cuotasAdicionales);
        break;
      case PeriodicidadPago.SEMANAL:
        fecha.setDate(fecha.getDate() + cuotasAdicionales * 7);
        break;
      case PeriodicidadPago.QUINCENAL:
        fecha.setDate(fecha.getDate() + cuotasAdicionales * 15);
        break;
      case PeriodicidadPago.MENSUAL:
        fecha.setMonth(fecha.getMonth() + cuotasAdicionales);
        break;
      case PeriodicidadPago.TRIMESTRAL:
        fecha.setMonth(fecha.getMonth() + cuotasAdicionales * 3);
        break;
      case PeriodicidadPago.SEMESTRAL:
        fecha.setMonth(fecha.getMonth() + cuotasAdicionales * 6);
        break;
      case PeriodicidadPago.ANUAL:
        fecha.setFullYear(fecha.getFullYear() + cuotasAdicionales);
        break;
      case PeriodicidadPago.AL_VENCIMIENTO:
        // No se modifica la fecha
        break;
    }

    return fecha;
  }

  /**
   * Calcula la fecha de vencimiento (última cuota)
   */
  calcularFechaVencimientoPrestamo(
    fechaPrimeraCuota: Date,
    periodicidad: PeriodicidadPago,
    numeroCuotas: number,
  ): Date {
    return this.calcularFechaVencimiento(
      fechaPrimeraCuota,
      periodicidad,
      numeroCuotas,
    );
  }

  /**
   * Calcula los recargos aplicables a una cuota específica
   */
  private calcularRecargosParaCuota(
    numeroCuota: number,
    recargosCalculados: RecargoCalculado[],
    cuotaNormal: number,
    numeroCuotas: number,
  ): number {
    let totalRecargos = 0;

    for (const recargo of recargosCalculados) {
      const aplicaDesde = recargo.aplicaDesde || 1;
      const aplicaHasta = recargo.aplicaHasta || numeroCuotas;

      if (numeroCuota >= aplicaDesde && numeroCuota <= aplicaHasta) {
        totalRecargos += recargo.montoCalculado;
      }
    }

    return this.redondear(totalRecargos);
  }

  /**
   * Calcula el monto de un recargo
   */
  calcularMontoRecargo(
    recargo: RecargoDto,
    cuotaNormal: number,
    nombreDefault: string,
  ): RecargoCalculado {
    let montoCalculado: number;

    // Validar que cuotaNormal sea un número válido
    const cuotaValida = Number.isFinite(cuotaNormal) ? cuotaNormal : 0;

    if (recargo.tipoCalculo === TipoCalculo.PORCENTAJE) {
      montoCalculado = this.redondear(cuotaValida * (recargo.valor / 100));
    } else {
      montoCalculado = this.redondear(recargo.valor);
    }

    return {
      nombre: recargo.nombre || nombreDefault,
      tipoRecargoId: recargo.tipoRecargoId,
      tipoCalculo: recargo.tipoCalculo,
      valor: recargo.valor,
      montoCalculado,
      aplicaDesde: recargo.aplicaDesde || 1,
      aplicaHasta: recargo.aplicaHasta || 0, // 0 significa hasta el final
    };
  }

  /**
   * Calcula el total de recargos para todo el préstamo
   */
  calcularTotalRecargos(
    recargosCalculados: RecargoCalculado[],
    numeroCuotas: number,
  ): number {
    let totalRecargos = 0;

    for (const recargo of recargosCalculados) {
      const aplicaDesde = recargo.aplicaDesde || 1;
      const aplicaHasta = recargo.aplicaHasta || numeroCuotas;
      const cuotasAplicables = Math.max(0, aplicaHasta - aplicaDesde + 1);

      totalRecargos += recargo.montoCalculado * cuotasAplicables;
    }

    return this.redondear(totalRecargos);
  }

  /**
   * Redondea a 2 decimales
   * Protege contra NaN e Infinity
   */
  private redondear(valor: number): number {
    // Si el valor no es un número finito, retornar 0
    if (!Number.isFinite(valor)) {
      return 0;
    }
    return Math.round(valor * 100) / 100;
  }
}
