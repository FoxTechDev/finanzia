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
   * IMPORTANTE: Para periodicidad DIARIA, excluye los domingos
   */
  calcularFechaVencimiento(
    fechaPrimeraCuota: Date,
    periodicidad: PeriodicidadPago,
    numeroCuota: number,
  ): Date {
    const fecha = new Date(fechaPrimeraCuota);

    switch (periodicidad) {
      case PeriodicidadPago.DIARIO:
        // Para la primera cuota, ajustar si cae en domingo
        if (numeroCuota === 1) {
          if (fecha.getDay() === 0) {
            fecha.setDate(fecha.getDate() + 1);
          }
        } else {
          // Para las siguientes cuotas, agregar días excluyendo domingos
          const cuotasAdicionales = numeroCuota - 1;
          this.agregarDiasHabilesExcluyendoDomingos(fecha, cuotasAdicionales);
        }
        break;
      case PeriodicidadPago.SEMANAL:
        fecha.setDate(fecha.getDate() + (numeroCuota - 1) * 7);
        break;
      case PeriodicidadPago.QUINCENAL:
        fecha.setDate(fecha.getDate() + (numeroCuota - 1) * 15);
        break;
      case PeriodicidadPago.MENSUAL:
        fecha.setMonth(fecha.getMonth() + (numeroCuota - 1));
        break;
      case PeriodicidadPago.TRIMESTRAL:
        fecha.setMonth(fecha.getMonth() + (numeroCuota - 1) * 3);
        break;
      case PeriodicidadPago.SEMESTRAL:
        fecha.setMonth(fecha.getMonth() + (numeroCuota - 1) * 6);
        break;
      case PeriodicidadPago.ANUAL:
        fecha.setFullYear(fecha.getFullYear() + (numeroCuota - 1));
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
   * Agrega días hábiles a una fecha, excluyendo domingos
   * Si una fecha cae en domingo (getDay() === 0), se mueve al lunes siguiente
   *
   * IMPORTANTE: Esta función asume que la fecha inicial ya ha sido validada
   * y no es domingo (el ajuste de la fecha inicial debe hacerse antes de llamar
   * a este método)
   *
   * @param fecha - Fecha base a modificar (se modifica in-place)
   * @param diasAgregar - Número de días hábiles a agregar desde la fecha base
   */
  private agregarDiasHabilesExcluyendoDomingos(fecha: Date, diasAgregar: number): void {
    // Ajustar la fecha inicial si es domingo antes de empezar a agregar días
    if (fecha.getDay() === 0) {
      fecha.setDate(fecha.getDate() + 1);
    }

    // Agregar los días adicionales, saltando domingos
    for (let i = 0; i < diasAgregar; i++) {
      // Agregar 1 día
      fecha.setDate(fecha.getDate() + 1);

      // Si cae en domingo (0), avanzar al lunes
      if (fecha.getDay() === 0) {
        fecha.setDate(fecha.getDate() + 1);
      }
    }
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
