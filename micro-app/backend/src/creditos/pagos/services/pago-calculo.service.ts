import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanPago, EstadoCuota } from '../../desembolso/entities/plan-pago.entity';
import { Prestamo, EstadoPrestamo } from '../../desembolso/entities/prestamo.entity';
import { CalculoInteresService } from '../../desembolso/services/calculo-interes.service';
import { TipoPago } from '../entities/pago.entity';
import { parseLocalDate } from '../../../common/utils/date.utils';

export interface CuotaPendiente {
  id: number;
  numeroCuota: number;
  fechaVencimiento: Date;
  capital: number;
  interes: number;
  recargos: number;
  interesMoratorio: number;
  capitalPagado: number;
  interesPagado: number;
  recargosPagado: number;
  interesMoratorioPagado: number;
  diasMora: number;
  estado: EstadoCuota;
  // Pendientes de pago
  capitalPendiente: number;
  interesPendiente: number;
  recargosPendiente: number;
  interesMoratorioPendiente: number;
  totalPendiente: number;
}

export interface ResumenAdeudo {
  prestamo: {
    id: number;
    numeroCredito: string;
    personaNombre: string;
    montoDesembolsado: number;
    saldoCapital: number;
    saldoInteres: number;
    capitalMora: number;
    interesMora: number;
    diasMora: number;
    estado: EstadoPrestamo;
    tasaInteresMoratorio: number;
  };
  cuotasPendientes: CuotaPendiente[];
  totales: {
    capitalPendiente: number;
    interesPendiente: number;
    recargosPendiente: number;
    interesMoratorioPendiente: number;
    totalAdeudado: number;
  };
  cuotasVencidas: number;
  cuotasParciales: number;
  proximaCuota: CuotaPendiente | null;
  // Información de recargo manual
  recargoManual: {
    aplica: boolean;           // true si el tipo de crédito usa recargo manual
    montoSugerido: number;     // monto por defecto del tipo de crédito
    tieneAtraso: boolean;      // true si hay cuotas vencidas
  };
}

export interface DistribucionPago {
  capitalAplicado: number;
  interesAplicado: number;
  recargosAplicado: number;
  interesMoratorioAplicado: number;
  recargoManualAplicado: number;  // Recargo manual cuando aplica
  excedente: number;
  cuotasAfectadas: CuotaAplicacion[];
  tipoPago: TipoPago;
}

export interface CuotaAplicacion {
  planPagoId: number;
  numeroCuota: number;
  capitalAplicado: number;
  interesAplicado: number;
  recargosAplicado: number;
  interesMoratorioAplicado: number;
  estadoAnterior: EstadoCuota;
  estadoPosterior: EstadoCuota;
  capitalPagadoAnterior: number;
  interesPagadoAnterior: number;
  recargosPagadoAnterior: number;
  interesMoratorioPagadoAnterior: number;
  diasMoraAnterior: number;
}

@Injectable()
export class PagoCalculoService {
  constructor(
    @InjectRepository(PlanPago)
    private planPagoRepository: Repository<PlanPago>,
    @InjectRepository(Prestamo)
    private prestamoRepository: Repository<Prestamo>,
    private calculoInteresService: CalculoInteresService,
  ) {}

  /**
   * Normaliza una fecha a medianoche (00:00:00) para comparaciones de solo fecha
   * Esto evita problemas donde la hora del día afecta la comparación
   */
  private normalizarFecha(fecha: Date): Date {
    const normalizada = new Date(fecha);
    normalizada.setHours(0, 0, 0, 0);
    return normalizada;
  }

  /**
   * Obtiene el resumen completo de adeudo de un préstamo
   */
  async obtenerResumenAdeudo(
    prestamoId: number,
    fechaCorte: Date,
  ): Promise<ResumenAdeudo> {
    const prestamo = await this.prestamoRepository.findOne({
      where: { id: prestamoId },
      relations: ['persona', 'tipoCredito'],
    });

    if (!prestamo) {
      throw new Error(`Préstamo ${prestamoId} no encontrado`);
    }

    // Obtener TODAS las cuotas para calcular el saldo esperado
    const todasLasCuotas = await this.planPagoRepository.find({
      where: { prestamoId },
      order: { numeroCuota: 'ASC' },
    });

    // Obtener cuotas no pagadas completamente (PENDIENTE, PARCIAL, MORA)
    const cuotasNoPagadas = todasLasCuotas.filter(
      c => c.estado === EstadoCuota.PENDIENTE ||
           c.estado === EstadoCuota.PARCIAL ||
           c.estado === EstadoCuota.MORA
    );

    // Verificar si el tipo de crédito usa recargo manual (sin interés moratorio automático)
    const aplicaRecargoManual = prestamo.tipoCredito?.aplicaRecargoManual || false;
    const montoRecargoSugerido = Number(prestamo.tipoCredito?.montoRecargo) || 0;

    // Calcular mora para cada cuota vencida
    const cuotasPendientes: CuotaPendiente[] = [];
    let cuotasVencidas = 0;
    let cuotasParciales = 0;

    // Normalizar fechaCorte a medianoche para comparaciones justas
    const fechaCorteNormalizada = this.normalizarFecha(fechaCorte);

    for (const cuota of cuotasNoPagadas) {
      const fechaVencimiento = parseLocalDate(String(cuota.fechaVencimiento));
      // Normalizar la fecha de vencimiento también para comparación justa
      const fechaVencimientoNormalizada = this.normalizarFecha(fechaVencimiento);
      let diasMora = 0;
      let interesMoratorioCalculado = 0;

      // Si la cuota está vencida, calcular mora
      // Usamos fechas normalizadas para comparar solo por día, no por hora
      if (fechaCorteNormalizada > fechaVencimientoNormalizada) {
        diasMora = this.calculoInteresService.calcularDiasEntreFechas(
          fechaVencimientoNormalizada,
          fechaCorteNormalizada,
        );

        // Solo calcular interés moratorio si NO aplica recargo manual
        if (!aplicaRecargoManual) {
          // Calcular interés moratorio sobre capital pendiente
          const capitalPendiente = this.redondear(
            Number(cuota.capital) - Number(cuota.capitalPagado),
          );

          interesMoratorioCalculado = this.calculoInteresService.calcularInteresMoratorio(
            capitalPendiente,
            Number(prestamo.tasaInteresMoratorio),
            diasMora,
          );
        }
        // Siempre contar las cuotas vencidas
        cuotasVencidas++;
      }

      if (cuota.estado === EstadoCuota.PARCIAL) {
        cuotasParciales++;
      }

      const capitalPendiente = this.redondear(
        Number(cuota.capital) - Number(cuota.capitalPagado),
      );
      const interesPendiente = this.redondear(
        Number(cuota.interes) - Number(cuota.interesPagado),
      );
      const recargosPendiente = this.redondear(
        Number(cuota.recargos) - Number(cuota.recargosPagado),
      );
      // Usar el mayor entre moratorio calculado y el registrado
      const interesMoratorioTotal = Math.max(
        interesMoratorioCalculado,
        Number(cuota.interesMoratorio),
      );
      const interesMoratorioPendiente = this.redondear(
        interesMoratorioTotal - Number(cuota.interesMoratorioPagado),
      );

      cuotasPendientes.push({
        id: cuota.id,
        numeroCuota: cuota.numeroCuota,
        fechaVencimiento,
        capital: Number(cuota.capital),
        interes: Number(cuota.interes),
        recargos: Number(cuota.recargos),
        interesMoratorio: interesMoratorioTotal,
        capitalPagado: Number(cuota.capitalPagado),
        interesPagado: Number(cuota.interesPagado),
        recargosPagado: Number(cuota.recargosPagado),
        interesMoratorioPagado: Number(cuota.interesMoratorioPagado),
        diasMora,
        estado: cuota.estado,
        capitalPendiente,
        interesPendiente,
        recargosPendiente,
        interesMoratorioPendiente,
        totalPendiente: this.redondear(
          capitalPendiente + interesPendiente + recargosPendiente + interesMoratorioPendiente,
        ),
      });
    }

    // Calcular totales
    const totales = cuotasPendientes.reduce(
      (acc, c) => ({
        capitalPendiente: acc.capitalPendiente + c.capitalPendiente,
        interesPendiente: acc.interesPendiente + c.interesPendiente,
        recargosPendiente: acc.recargosPendiente + c.recargosPendiente,
        interesMoratorioPendiente: acc.interesMoratorioPendiente + c.interesMoratorioPendiente,
        totalAdeudado: acc.totalAdeudado + c.totalPendiente,
      }),
      {
        capitalPendiente: 0,
        interesPendiente: 0,
        recargosPendiente: 0,
        interesMoratorioPendiente: 0,
        totalAdeudado: 0,
      },
    );

    // Redondear totales
    totales.capitalPendiente = this.redondear(totales.capitalPendiente);
    totales.interesPendiente = this.redondear(totales.interesPendiente);
    totales.recargosPendiente = this.redondear(totales.recargosPendiente);
    totales.interesMoratorioPendiente = this.redondear(totales.interesMoratorioPendiente);
    totales.totalAdeudado = this.redondear(totales.totalAdeudado);

    return {
      prestamo: {
        id: prestamo.id,
        numeroCredito: prestamo.numeroCredito,
        personaNombre: prestamo.persona
          ? `${prestamo.persona.nombre} ${prestamo.persona.apellido}`
          : 'N/A',
        montoDesembolsado: Number(prestamo.montoDesembolsado),
        saldoCapital: Number(prestamo.saldoCapital),
        saldoInteres: Number(prestamo.saldoInteres),
        capitalMora: Number(prestamo.capitalMora),
        interesMora: Number(prestamo.interesMora),
        diasMora: prestamo.diasMora,
        estado: prestamo.estado,
        tasaInteresMoratorio: Number(prestamo.tasaInteresMoratorio),
      },
      cuotasPendientes,
      totales,
      cuotasVencidas,
      cuotasParciales,
      proximaCuota: cuotasPendientes.length > 0 ? cuotasPendientes[0] : null,
      // Información de recargo manual
      recargoManual: {
        aplica: aplicaRecargoManual,
        montoSugerido: montoRecargoSugerido,
        // Calcular si hay un verdadero atraso comparando saldo real vs saldo esperado
        tieneAtraso: this.calcularTieneAtraso(
          Number(prestamo.saldoCapital),
          todasLasCuotas,
          fechaCorteNormalizada,
        ),
      },
    };
  }

  /**
   * Determina si hay un verdadero atraso en el préstamo
   * Compara el saldo de capital actual vs el saldo esperado según el plan de pagos
   *
   * @param saldoCapitalActual - El saldo de capital actual del préstamo
   * @param todasLasCuotas - Todas las cuotas del plan de pagos
   * @param fechaCorte - La fecha de corte (normalizada a medianoche)
   * @returns true si hay atraso (saldo actual > saldo esperado)
   */
  private calcularTieneAtraso(
    saldoCapitalActual: number,
    todasLasCuotas: PlanPago[],
    fechaCorte: Date,
  ): boolean {
    // Buscar la última cuota cuya fecha de vencimiento ya pasó
    // Esta cuota nos dice cuál debería ser el saldo esperado
    let ultimaCuotaVencida: PlanPago | null = null;

    for (const cuota of todasLasCuotas) {
      const fechaVencimiento = this.normalizarFecha(parseLocalDate(String(cuota.fechaVencimiento)));

      // Si la fecha de vencimiento es menor o igual a la fecha de corte, la cuota ya venció
      if (fechaVencimiento <= fechaCorte) {
        // Guardamos la cuota con mayor número de cuota que haya vencido
        if (!ultimaCuotaVencida || cuota.numeroCuota > ultimaCuotaVencida.numeroCuota) {
          ultimaCuotaVencida = cuota;
        }
      }
    }

    // Si no hay cuotas vencidas, no hay atraso
    if (!ultimaCuotaVencida) {
      return false;
    }

    // El saldo esperado es el saldoCapital que debería quedar después de pagar la última cuota vencida
    const saldoCapitalEsperado = Number(ultimaCuotaVencida.saldoCapital);

    // Hay atraso si el saldo actual es mayor al esperado (con tolerancia de 0.01 para redondeos)
    return saldoCapitalActual > (saldoCapitalEsperado + 0.01);
  }

  /**
   * Calcula la distribución de un pago
   * Orden de aplicación: Recargo manual (si aplica) → Interés moratorio → Intereses → Recargos → Capital
   * @param montoPagar - Monto total a pagar
   * @param cuotasPendientes - Lista de cuotas pendientes
   * @param recargoManual - Monto del recargo manual a aplicar (solo cuando el tipo de crédito lo requiere)
   */
  calcularDistribucion(
    montoPagar: number,
    cuotasPendientes: CuotaPendiente[],
    recargoManual: number = 0,
  ): DistribucionPago {
    let montoRestante = montoPagar;
    let capitalAplicado = 0;
    let interesAplicado = 0;
    let recargosAplicado = 0;
    let interesMoratorioAplicado = 0;
    let recargoManualAplicado = 0;
    const cuotasAfectadas: CuotaAplicacion[] = [];

    // Si hay recargo manual, descontarlo primero del monto a pagar
    if (recargoManual > 0 && montoRestante > 0) {
      const aplicarRecargo = Math.min(montoRestante, recargoManual);
      recargoManualAplicado = this.redondear(aplicarRecargo);
      montoRestante -= aplicarRecargo;
    }

    // Procesar cuotas en orden (más antiguas primero)
    for (const cuota of cuotasPendientes) {
      if (montoRestante <= 0) break;

      const aplicacion: CuotaAplicacion = {
        planPagoId: cuota.id,
        numeroCuota: cuota.numeroCuota,
        capitalAplicado: 0,
        interesAplicado: 0,
        recargosAplicado: 0,
        interesMoratorioAplicado: 0,
        estadoAnterior: cuota.estado,
        estadoPosterior: cuota.estado,
        capitalPagadoAnterior: cuota.capitalPagado,
        interesPagadoAnterior: cuota.interesPagado,
        recargosPagadoAnterior: cuota.recargosPagado,
        interesMoratorioPagadoAnterior: cuota.interesMoratorioPagado,
        diasMoraAnterior: cuota.diasMora,
      };

      // 1. Aplicar a interés moratorio
      if (montoRestante > 0 && cuota.interesMoratorioPendiente > 0) {
        const aplicar = Math.min(montoRestante, cuota.interesMoratorioPendiente);
        aplicacion.interesMoratorioAplicado = this.redondear(aplicar);
        interesMoratorioAplicado += aplicar;
        montoRestante -= aplicar;
      }

      // 2. Aplicar a intereses corrientes
      if (montoRestante > 0 && cuota.interesPendiente > 0) {
        const aplicar = Math.min(montoRestante, cuota.interesPendiente);
        aplicacion.interesAplicado = this.redondear(aplicar);
        interesAplicado += aplicar;
        montoRestante -= aplicar;
      }

      // 3. Aplicar a recargos
      if (montoRestante > 0 && cuota.recargosPendiente > 0) {
        const aplicar = Math.min(montoRestante, cuota.recargosPendiente);
        aplicacion.recargosAplicado = this.redondear(aplicar);
        recargosAplicado += aplicar;
        montoRestante -= aplicar;
      }

      // 4. Aplicar a capital
      if (montoRestante > 0 && cuota.capitalPendiente > 0) {
        const aplicar = Math.min(montoRestante, cuota.capitalPendiente);
        aplicacion.capitalAplicado = this.redondear(aplicar);
        capitalAplicado += aplicar;
        montoRestante -= aplicar;
      }

      // Determinar nuevo estado de la cuota
      const nuevoCapitalPagado = cuota.capitalPagado + aplicacion.capitalAplicado;
      const nuevoInteresPagado = cuota.interesPagado + aplicacion.interesAplicado;
      const nuevoRecargosPagado = cuota.recargosPagado + aplicacion.recargosAplicado;
      const nuevoMoratorioPagado = cuota.interesMoratorioPagado + aplicacion.interesMoratorioAplicado;

      const capitalCompleto = nuevoCapitalPagado >= cuota.capital - 0.01;
      const interesCompleto = nuevoInteresPagado >= cuota.interes - 0.01;
      const recargosCompleto = nuevoRecargosPagado >= cuota.recargos - 0.01;
      const moratorioCompleto = nuevoMoratorioPagado >= cuota.interesMoratorio - 0.01;

      if (capitalCompleto && interesCompleto && recargosCompleto && moratorioCompleto) {
        aplicacion.estadoPosterior = EstadoCuota.PAGADA;
      } else if (
        aplicacion.capitalAplicado > 0 ||
        aplicacion.interesAplicado > 0 ||
        aplicacion.recargosAplicado > 0 ||
        aplicacion.interesMoratorioAplicado > 0
      ) {
        aplicacion.estadoPosterior = EstadoCuota.PARCIAL;
      }

      // Solo agregar si se aplicó algo
      if (
        aplicacion.capitalAplicado > 0 ||
        aplicacion.interesAplicado > 0 ||
        aplicacion.recargosAplicado > 0 ||
        aplicacion.interesMoratorioAplicado > 0
      ) {
        cuotasAfectadas.push(aplicacion);
      }
    }

    // Determinar tipo de pago
    let tipoPago: TipoPago;
    const totalAplicado = capitalAplicado + interesAplicado + recargosAplicado + interesMoratorioAplicado;

    if (cuotasAfectadas.length === 0) {
      tipoPago = TipoPago.PAGO_PARCIAL;
    } else if (cuotasAfectadas.every(c => c.estadoPosterior === EstadoCuota.PAGADA)) {
      // Verificar si es cancelación total
      const todasPagadas = cuotasPendientes.every(c =>
        cuotasAfectadas.find(a => a.planPagoId === c.id)?.estadoPosterior === EstadoCuota.PAGADA
      );
      if (todasPagadas) {
        tipoPago = TipoPago.CANCELACION_TOTAL;
      } else if (cuotasAfectadas.some(c => {
        const cuotaOrig = cuotasPendientes.find(cp => cp.id === c.planPagoId);
        // Normalizar fechas para comparar solo por día
        const fechaVencNorm = cuotaOrig ? this.normalizarFecha(parseLocalDate(String(cuotaOrig.fechaVencimiento))) : null;
        const hoyNorm = this.normalizarFecha(new Date());
        return fechaVencNorm && fechaVencNorm > hoyNorm;
      })) {
        tipoPago = TipoPago.PAGO_ADELANTADO;
      } else {
        tipoPago = TipoPago.CUOTA_COMPLETA;
      }
    } else {
      tipoPago = TipoPago.PAGO_PARCIAL;
    }

    return {
      capitalAplicado: this.redondear(capitalAplicado),
      interesAplicado: this.redondear(interesAplicado),
      recargosAplicado: this.redondear(recargosAplicado),
      interesMoratorioAplicado: this.redondear(interesMoratorioAplicado),
      recargoManualAplicado: this.redondear(recargoManualAplicado),
      excedente: this.redondear(Math.max(0, montoRestante)),
      cuotasAfectadas,
      tipoPago,
    };
  }

  /**
   * Redondea a 2 decimales
   */
  private redondear(valor: number): number {
    return Math.round(valor * 100) / 100;
  }
}
