import { Injectable } from '@nestjs/common';
import { TipoInteres, PeriodicidadPago } from '../entities/prestamo.entity';

export interface CuotaCalculada {
  numeroCuota: number;
  capital: number;
  interes: number;
  cuotaTotal: number;
  saldoCapital: number;
}

export interface ResultadoCalculo {
  cuotaNormal: number;
  totalInteres: number;
  totalPagar: number;
  numeroCuotas: number;
  cuotas: CuotaCalculada[];
}

@Injectable()
export class CalculoInteresService {
  /**
   * Convierte un valor a número, manejando strings de decimales
   */
  private toNumber(value: any, fieldName: string): number {
    if (value == null) {
      throw new Error(`${fieldName} es nulo o indefinido`);
    }

    const num = typeof value === 'number' ? value : Number(value);

    if (!Number.isFinite(num)) {
      throw new Error(`${fieldName} no es un número válido: ${value} (tipo: ${typeof value})`);
    }

    return num;
  }

  /**
   * Obtiene el número de períodos por año según la periodicidad
   */
  getPeriodosPorAnio(periodicidad: PeriodicidadPago): number {
    const periodos: Record<PeriodicidadPago, number> = {
      [PeriodicidadPago.DIARIO]: 365,
      [PeriodicidadPago.SEMANAL]: 52,
      [PeriodicidadPago.QUINCENAL]: 24,
      [PeriodicidadPago.MENSUAL]: 12,
      [PeriodicidadPago.TRIMESTRAL]: 4,
      [PeriodicidadPago.SEMESTRAL]: 2,
      [PeriodicidadPago.ANUAL]: 1,
      [PeriodicidadPago.AL_VENCIMIENTO]: 1,
    };

    const resultado = periodos[periodicidad];
    if (resultado === undefined) {
      throw new Error(`Periodicidad de pago inválida: ${periodicidad}. Valores válidos: ${Object.keys(periodos).join(', ')}`);
    }

    return resultado;
  }

  /**
   * Convierte el plazo en meses a número de cuotas según la periodicidad
   *
   * REGLA DE CONVERSIÓN (1 mes = 4 semanas base):
   * - DIARIO: NO se usa esta función, el plazo ya viene en días directamente
   * - SEMANAL: plazo_meses × 4 (exactamente 4 semanas por mes)
   * - QUINCENAL: plazo_meses × 2 (exactamente 2 quincenas por mes)
   * - MENSUAL: plazo_meses × 1 (sin conversión)
   * - TRIMESTRAL: plazo_meses / 3
   * - SEMESTRAL: plazo_meses / 6
   * - ANUAL: plazo_meses / 12
   *
   * Ejemplo: 3 meses con periodicidad SEMANAL = 3 × 4 = 12 cuotas
   */
  calcularNumeroCuotas(
    plazoMeses: number,
    periodicidad: PeriodicidadPago,
  ): number {
    switch (periodicidad) {
      case PeriodicidadPago.DIARIO:
        // Para DIARIO, normalmente el plazo ya viene en días cuando plazoEnCuotas=true
        // Si llega aquí, convertir meses a días hábiles (28 días por mes, excluyendo domingos)
        return Math.round(plazoMeses * 28);
      case PeriodicidadPago.SEMANAL:
        // Exactamente 4 semanas por mes (1 mes = 4 semanas)
        return plazoMeses * 4;
      case PeriodicidadPago.QUINCENAL:
        // Exactamente 2 quincenas por mes
        return plazoMeses * 2;
      case PeriodicidadPago.MENSUAL:
        return plazoMeses;
      case PeriodicidadPago.TRIMESTRAL:
        return Math.round(plazoMeses / 3);
      case PeriodicidadPago.SEMESTRAL:
        return Math.round(plazoMeses / 6);
      case PeriodicidadPago.ANUAL:
        return Math.round(plazoMeses / 12);
      case PeriodicidadPago.AL_VENCIMIENTO:
        return 1;
      default:
        return plazoMeses;
    }
  }

  /**
   * Convierte el número de cuotas a meses según la periodicidad
   * (Operación inversa de calcularNumeroCuotas)
   *
   * Ejemplo: 12 cuotas semanales = 12 / 4 = 3 meses
   */
  convertirCuotasAMeses(
    numeroCuotas: number,
    periodicidad: PeriodicidadPago,
  ): number {
    switch (periodicidad) {
      case PeriodicidadPago.DIARIO:
        return numeroCuotas / 28; // 28 días por mes (excluyendo domingos)
      case PeriodicidadPago.SEMANAL:
        // Exactamente 4 semanas por mes (1 mes = 4 semanas)
        return numeroCuotas / 4;
      case PeriodicidadPago.QUINCENAL:
        return numeroCuotas / 2;
      case PeriodicidadPago.MENSUAL:
        return numeroCuotas;
      case PeriodicidadPago.TRIMESTRAL:
        return numeroCuotas * 3;
      case PeriodicidadPago.SEMESTRAL:
        return numeroCuotas * 6;
      case PeriodicidadPago.ANUAL:
        return numeroCuotas * 12;
      case PeriodicidadPago.AL_VENCIMIENTO:
        return numeroCuotas; // Asumimos 1 mes por cuota
      default:
        return numeroCuotas;
    }
  }

  /**
   * Calcula el plan de pagos según el tipo de interés
   * @param capitalInput - Monto del capital
   * @param tasaAnualInput - Tasa de interés anual
   * @param plazoInput - Plazo (en meses o en cuotas según plazoEnCuotas)
   * @param tipoInteres - Tipo de interés (FLAT o AMORTIZADO)
   * @param periodicidad - Periodicidad de pago
   * @param plazoEnCuotas - Si es true, el plazo ya está en número de cuotas
   *
   * IMPORTANTE para periodicidad DIARIA:
   * - Cuando plazoEnCuotas=true, el plazo representa el número de cuotas (días) directamente
   * - Las fechas del plan de pago excluirán domingos automáticamente en PlanPagoService
   */
  calcular(
    capitalInput: number | string,
    tasaAnualInput: number | string,
    plazoInput: number | string,
    tipoInteres: TipoInteres,
    periodicidad: PeriodicidadPago,
    plazoEnCuotas: boolean = false,
  ): ResultadoCalculo {
    // Convertir y validar parámetros (TypeORM devuelve decimales como strings)
    const capital = this.toNumber(capitalInput, 'Capital');
    const tasaAnual = this.toNumber(tasaAnualInput, 'Tasa anual');
    const plazoMeses = this.toNumber(plazoInput, 'Plazo');

    // Validar valores positivos
    if (capital <= 0) {
      throw new Error(`Capital debe ser mayor a 0, recibido: ${capital}`);
    }

    if (plazoMeses <= 0) {
      throw new Error(`Plazo debe ser mayor a 0, recibido: ${plazoMeses}`);
    }

    if (tasaAnual < 0) {
      throw new Error(`Tasa anual no puede ser negativa, recibido: ${tasaAnual}`);
    }

    // Validar que tipoInteres sea válido
    if (tipoInteres !== TipoInteres.FLAT && tipoInteres !== TipoInteres.AMORTIZADO) {
      throw new Error(`Tipo de interés inválido: ${tipoInteres}. Valores válidos: FLAT, AMORTIZADO`);
    }

    // Validar periodicidad (esto también valida en getPeriodosPorAnio)
    this.getPeriodosPorAnio(periodicidad);

    if (tipoInteres === TipoInteres.FLAT) {
      return this.calcularFlat(capital, tasaAnual, plazoMeses, periodicidad, plazoEnCuotas);
    } else {
      return this.calcularAmortizado(
        capital,
        tasaAnual,
        plazoMeses,
        periodicidad,
        plazoEnCuotas,
      );
    }
  }

  /**
   * Calcula el plan de pagos con número de cuotas personalizado
   * Utilizado especialmente para periodicidad DIARIA donde:
   * - El interés se calcula sobre el plazo en meses
   * - El número de cuotas es definido por el usuario
   *
   * @param capitalInput - Monto del capital
   * @param tasaAnualInput - Tasa de interés anual
   * @param plazoMeses - Plazo en meses (usado para calcular el interés)
   * @param numeroCuotas - Número de cuotas a generar (definido por usuario)
   * @param tipoInteres - Tipo de interés (FLAT o AMORTIZADO)
   * @param periodicidad - Periodicidad de pago
   */
  calcularConCuotasPersonalizadas(
    capitalInput: number | string,
    tasaAnualInput: number | string,
    plazoMeses: number,
    numeroCuotas: number,
    tipoInteres: TipoInteres,
    periodicidad: PeriodicidadPago,
  ): ResultadoCalculo {
    // Convertir y validar parámetros
    const capital = this.toNumber(capitalInput, 'Capital');
    const tasaAnual = this.toNumber(tasaAnualInput, 'Tasa anual');

    // Validar valores positivos
    if (capital <= 0) {
      throw new Error(`Capital debe ser mayor a 0, recibido: ${capital}`);
    }

    if (plazoMeses < 1) {
      throw new Error(`Plazo en meses debe ser mínimo 1, recibido: ${plazoMeses}`);
    }

    if (numeroCuotas < 1) {
      throw new Error(`Número de cuotas debe ser mayor a 0, recibido: ${numeroCuotas}`);
    }

    if (tasaAnual < 0) {
      throw new Error(`Tasa anual no puede ser negativa, recibido: ${tasaAnual}`);
    }

    // Validar que tipoInteres sea válido
    if (tipoInteres !== TipoInteres.FLAT && tipoInteres !== TipoInteres.AMORTIZADO) {
      throw new Error(`Tipo de interés inválido: ${tipoInteres}. Valores válidos: FLAT, AMORTIZADO`);
    }

    if (tipoInteres === TipoInteres.FLAT) {
      return this.calcularFlatConCuotasPersonalizadas(
        capital,
        tasaAnual,
        plazoMeses,
        numeroCuotas,
        periodicidad,
      );
    } else {
      return this.calcularAmortizadoConCuotasPersonalizadas(
        capital,
        tasaAnual,
        plazoMeses,
        numeroCuotas,
        periodicidad,
      );
    }
  }

  /**
   * Cálculo de interés FLAT (microcréditos)
   * El interés se calcula sobre el monto original durante todo el plazo
   */
  private calcularFlat(
    capital: number,
    tasaAnual: number,
    plazo: number,
    periodicidad: PeriodicidadPago,
    plazoEnCuotas: boolean = false,
  ): ResultadoCalculo {
    // Si plazoEnCuotas es true, el plazo ya es el número de cuotas
    const numeroCuotas = plazoEnCuotas ? plazo : this.calcularNumeroCuotas(plazo, periodicidad);
    // Para el cálculo de interés, necesitamos el plazo en meses
    const plazoMeses = plazoEnCuotas ? this.convertirCuotasAMeses(plazo, periodicidad) : plazo;

    // Validar que numeroCuotas sea válido para evitar división por cero
    if (!numeroCuotas || numeroCuotas <= 0) {
      throw new Error(
        `Número de cuotas inválido: ${numeroCuotas}. Plazo: ${plazo}, Periodicidad: ${periodicidad}`,
      );
    }

    // Interés Total = Capital × Tasa Anual × (Plazo en años)
    const plazoAnios = plazoMeses / 12;
    const totalInteres = capital * (tasaAnual / 100) * plazoAnios;
    const totalPagar = capital + totalInteres;

    // Validar antes de redondear
    const cuotaNormalSinRedondear = totalPagar / numeroCuotas;
    if (!Number.isFinite(cuotaNormalSinRedondear)) {
      throw new Error(
        `Error al calcular cuota normal FLAT. Total a pagar: ${totalPagar}, Número de cuotas: ${numeroCuotas}`,
      );
    }
    const cuotaNormal = this.redondear(cuotaNormalSinRedondear, 'cuota normal FLAT');

    // El capital y el interés se distribuyen uniformemente
    const capitalPorCuota = this.redondear(capital / numeroCuotas, 'capital por cuota');
    const interesPorCuota = this.redondearSeguro(totalInteres / numeroCuotas); // Puede ser 0 si tasa es 0

    const cuotas: CuotaCalculada[] = [];
    let saldoCapital = capital;

    for (let i = 1; i <= numeroCuotas; i++) {
      // Última cuota ajusta el saldo restante
      const esUltimaCuota = i === numeroCuotas;
      const capitalCuota = esUltimaCuota
        ? saldoCapital
        : Math.min(capitalPorCuota, saldoCapital);

      saldoCapital = this.redondear(Math.max(0, saldoCapital - capitalCuota), 'saldo capital');

      cuotas.push({
        numeroCuota: i,
        capital: capitalCuota,
        interes: interesPorCuota,
        cuotaTotal: this.redondear(capitalCuota + interesPorCuota, 'cuota total'),
        saldoCapital: Math.max(0, saldoCapital),
      });
    }

    return {
      cuotaNormal,
      totalInteres: this.redondearSeguro(totalInteres),
      totalPagar: this.redondear(totalPagar, 'total a pagar'),
      numeroCuotas,
      cuotas,
    };
  }

  /**
   * Cálculo de interés AMORTIZADO (Sistema Francés)
   * El interés se calcula sobre saldo insoluto
   */
  private calcularAmortizado(
    capital: number,
    tasaAnual: number,
    plazo: number,
    periodicidad: PeriodicidadPago,
    plazoEnCuotas: boolean = false,
  ): ResultadoCalculo {
    // Si plazoEnCuotas es true, el plazo ya es el número de cuotas
    const numeroCuotas = plazoEnCuotas ? plazo : this.calcularNumeroCuotas(plazo, periodicidad);

    // Validar que numeroCuotas sea válido para evitar división por cero
    if (!numeroCuotas || numeroCuotas <= 0) {
      throw new Error(
        `Número de cuotas inválido: ${numeroCuotas}. Plazo: ${plazo}, Periodicidad: ${periodicidad}`,
      );
    }

    const periodosPorAnio = this.getPeriodosPorAnio(periodicidad);

    // Validar que periodosPorAnio es válido
    if (!periodosPorAnio || periodosPorAnio <= 0) {
      throw new Error(
        `Períodos por año inválido: ${periodosPorAnio}. Periodicidad: ${periodicidad}`,
      );
    }

    // Tasa periódica = Tasa anual / períodos por año
    const tasaPeriodica = tasaAnual / 100 / periodosPorAnio;

    // Cuota = P × [r(1+r)^n] / [(1+r)^n - 1]
    let cuotaNormalSinRedondear: number;
    if (tasaPeriodica === 0) {
      cuotaNormalSinRedondear = capital / numeroCuotas;
    } else {
      const factor = Math.pow(1 + tasaPeriodica, numeroCuotas);
      const denominador = factor - 1;

      // Validar que el denominador no sea 0
      if (denominador === 0) {
        throw new Error(
          `Error en cálculo amortizado: denominador es 0. Factor: ${factor}, Tasa periódica: ${tasaPeriodica}`,
        );
      }

      cuotaNormalSinRedondear = (capital * (tasaPeriodica * factor)) / denominador;
    }

    // Validar ANTES de redondear
    if (!Number.isFinite(cuotaNormalSinRedondear)) {
      throw new Error(
        `Error al calcular cuota normal amortizada. Capital: ${capital}, Tasa periódica: ${tasaPeriodica}, Número de cuotas: ${numeroCuotas}`,
      );
    }

    const cuotaNormal = this.redondear(cuotaNormalSinRedondear, 'cuota normal amortizada');

    const cuotas: CuotaCalculada[] = [];
    let saldoCapital = capital;
    let totalInteres = 0;

    for (let i = 1; i <= numeroCuotas; i++) {
      // Interés de la cuota = Saldo × Tasa Periódica
      const interesCuota = this.redondearSeguro(saldoCapital * tasaPeriodica);
      let capitalCuota = this.redondear(Math.max(0, cuotaNormal - interesCuota), 'capital cuota');

      // Última cuota ajusta el saldo restante
      if (i === numeroCuotas) {
        capitalCuota = saldoCapital;
      }

      saldoCapital = this.redondear(Math.max(0, saldoCapital - capitalCuota), 'saldo capital');
      totalInteres += interesCuota;

      cuotas.push({
        numeroCuota: i,
        capital: capitalCuota,
        interes: interesCuota,
        cuotaTotal: this.redondear(capitalCuota + interesCuota, 'cuota total'),
        saldoCapital: Math.max(0, saldoCapital),
      });
    }

    const totalPagar = capital + this.redondearSeguro(totalInteres);

    return {
      cuotaNormal,
      totalInteres: this.redondearSeguro(totalInteres),
      totalPagar: this.redondear(totalPagar, 'total a pagar'),
      numeroCuotas,
      cuotas,
    };
  }

  /**
   * Cálculo de interés FLAT con número de cuotas personalizado
   * El interés se calcula sobre el monto original durante el plazo en meses
   * Pero se distribuye en el número de cuotas especificado
   */
  private calcularFlatConCuotasPersonalizadas(
    capital: number,
    tasaAnual: number,
    plazoMeses: number,
    numeroCuotas: number,
    periodicidad: PeriodicidadPago,
  ): ResultadoCalculo {
    // Interés Total = Capital × Tasa Anual × (Plazo en años)
    const plazoAnios = plazoMeses / 12;
    const totalInteres = capital * (tasaAnual / 100) * plazoAnios;
    const totalPagar = capital + totalInteres;

    // Validar antes de redondear
    const cuotaNormalSinRedondear = totalPagar / numeroCuotas;
    if (!Number.isFinite(cuotaNormalSinRedondear)) {
      throw new Error(
        `Error al calcular cuota normal FLAT. Total a pagar: ${totalPagar}, Número de cuotas: ${numeroCuotas}`,
      );
    }
    const cuotaNormal = this.redondear(cuotaNormalSinRedondear, 'cuota normal FLAT');

    // El capital y el interés se distribuyen uniformemente
    const capitalPorCuota = this.redondear(capital / numeroCuotas, 'capital por cuota');
    const interesPorCuota = this.redondearSeguro(totalInteres / numeroCuotas);

    const cuotas: CuotaCalculada[] = [];
    let saldoCapital = capital;

    for (let i = 1; i <= numeroCuotas; i++) {
      // Última cuota ajusta el saldo restante
      const esUltimaCuota = i === numeroCuotas;
      const capitalCuota = esUltimaCuota
        ? saldoCapital
        : Math.min(capitalPorCuota, saldoCapital);

      saldoCapital = this.redondear(Math.max(0, saldoCapital - capitalCuota), 'saldo capital');

      cuotas.push({
        numeroCuota: i,
        capital: capitalCuota,
        interes: interesPorCuota,
        cuotaTotal: this.redondear(capitalCuota + interesPorCuota, 'cuota total'),
        saldoCapital: Math.max(0, saldoCapital),
      });
    }

    return {
      cuotaNormal,
      totalInteres: this.redondearSeguro(totalInteres),
      totalPagar: this.redondear(totalPagar, 'total a pagar'),
      numeroCuotas,
      cuotas,
    };
  }

  /**
   * Cálculo de interés AMORTIZADO con número de cuotas personalizado
   * El interés se calcula sobre saldo insoluto
   * Se usa una tasa periódica ajustada según el número de cuotas y el plazo en meses
   */
  private calcularAmortizadoConCuotasPersonalizadas(
    capital: number,
    tasaAnual: number,
    plazoMeses: number,
    numeroCuotas: number,
    periodicidad: PeriodicidadPago,
  ): ResultadoCalculo {
    const periodosPorAnio = this.getPeriodosPorAnio(periodicidad);

    // Validar que periodosPorAnio es válido
    if (!periodosPorAnio || periodosPorAnio <= 0) {
      throw new Error(
        `Períodos por año inválido: ${periodosPorAnio}. Periodicidad: ${periodicidad}`,
      );
    }

    // Tasa periódica = Tasa anual / períodos por año
    const tasaPeriodica = tasaAnual / 100 / periodosPorAnio;

    // Cuota = P × [r(1+r)^n] / [(1+r)^n - 1]
    let cuotaNormalSinRedondear: number;
    if (tasaPeriodica === 0) {
      cuotaNormalSinRedondear = capital / numeroCuotas;
    } else {
      const factor = Math.pow(1 + tasaPeriodica, numeroCuotas);
      const denominador = factor - 1;

      // Validar que el denominador no sea 0
      if (denominador === 0) {
        throw new Error(
          `Error en cálculo amortizado: denominador es 0. Factor: ${factor}, Tasa periódica: ${tasaPeriodica}`,
        );
      }

      cuotaNormalSinRedondear = (capital * (tasaPeriodica * factor)) / denominador;
    }

    // Validar ANTES de redondear
    if (!Number.isFinite(cuotaNormalSinRedondear)) {
      throw new Error(
        `Error al calcular cuota normal amortizada. Capital: ${capital}, Tasa periódica: ${tasaPeriodica}, Número de cuotas: ${numeroCuotas}`,
      );
    }

    const cuotaNormal = this.redondear(cuotaNormalSinRedondear, 'cuota normal amortizada');

    const cuotas: CuotaCalculada[] = [];
    let saldoCapital = capital;
    let totalInteres = 0;

    for (let i = 1; i <= numeroCuotas; i++) {
      // Interés de la cuota = Saldo × Tasa Periódica
      const interesCuota = this.redondearSeguro(saldoCapital * tasaPeriodica);
      let capitalCuota = this.redondear(Math.max(0, cuotaNormal - interesCuota), 'capital cuota');

      // Última cuota ajusta el saldo restante
      if (i === numeroCuotas) {
        capitalCuota = saldoCapital;
      }

      saldoCapital = this.redondear(Math.max(0, saldoCapital - capitalCuota), 'saldo capital');
      totalInteres += interesCuota;

      cuotas.push({
        numeroCuota: i,
        capital: capitalCuota,
        interes: interesCuota,
        cuotaTotal: this.redondear(capitalCuota + interesCuota, 'cuota total'),
        saldoCapital: Math.max(0, saldoCapital),
      });
    }

    const totalPagar = capital + this.redondearSeguro(totalInteres);

    return {
      cuotaNormal,
      totalInteres: this.redondearSeguro(totalInteres),
      totalPagar: this.redondear(totalPagar, 'total a pagar'),
      numeroCuotas,
      cuotas,
    };
  }

  /**
   * Redondea a 2 decimales
   * Lanza error si el valor no es válido
   */
  private redondear(valor: number, descripcion?: string): number {
    // Si el valor no es un número finito, lanzar error
    if (!Number.isFinite(valor)) {
      throw new Error(`Valor inválido en cálculo${descripcion ? ` de ${descripcion}` : ''}: ${valor}`);
    }
    return Math.round(valor * 100) / 100;
  }

  /**
   * Redondea a 2 decimales, pero permite 0 como valor por defecto para NaN
   * Usar solo para valores que pueden ser legítimamente 0
   */
  private redondearSeguro(valor: number): number {
    if (!Number.isFinite(valor)) {
      return 0;
    }
    return Math.round(valor * 100) / 100;
  }

  /**
   * Calcula los días entre dos fechas
   */
  calcularDiasEntreFechas(fecha1: Date, fecha2: Date): number {
    const diffTime = Math.abs(fecha2.getTime() - fecha1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calcula el interés moratorio
   */
  calcularInteresMoratorio(
    capitalEnMora: number,
    tasaMoratoriaAnual: number,
    diasMora: number,
  ): number {
    // Interés moratorio = Capital en mora × (Tasa moratoria anual / 365) × Días de mora
    const interesMoratorio =
      capitalEnMora * (tasaMoratoriaAnual / 100 / 365) * diasMora;
    return this.redondear(interesMoratorio);
  }
}
