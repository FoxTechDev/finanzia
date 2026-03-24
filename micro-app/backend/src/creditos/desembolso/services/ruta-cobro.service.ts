import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { PlanPago, EstadoCuota } from '../entities/plan-pago.entity';
import { EstadoPrestamo, PeriodicidadPago } from '../entities/prestamo.entity';
import {
  RutaCobroItemDto,
  RutaCobroParamsDto,
  RutaCobroResponseDto,
  RutaCobroSeccionResumenDto,
  SeccionRutaCobro,
} from '../dto/ruta-cobro.dto';
import {
  parseLocalDate,
  formatLocalDate,
} from '../../../common/utils/date.utils';

/**
 * Servicio para generar el reporte de Ruta de Cobro
 *
 * Muestra un registro por préstamo (sin duplicados):
 * - DIARIO: Préstamos con periodicidad diaria (siempre se muestran) → próxima cuota
 * - EN_RANGO: Préstamos no diarios con cuotas dentro del rango → próxima cuota
 * - VENCIDO: Préstamos cuya fecha de vencimiento del crédito ya pasó → saldo total
 */
@Injectable()
export class RutaCobroService {
  constructor(
    @InjectRepository(PlanPago)
    private readonly planPagoRepository: Repository<PlanPago>,
  ) {}

  async generarReporte(params: RutaCobroParamsDto): Promise<RutaCobroResponseDto> {
    const fechaDesde = parseLocalDate(params.fechaDesde);
    const fechaHasta = parseLocalDate(params.fechaHasta);

    const fechaDesdeStr = formatLocalDate(fechaDesde);
    const fechaHastaStr = formatLocalDate(fechaHasta);

    const estadosCuota = [EstadoCuota.PENDIENTE, EstadoCuota.PARCIAL, EstadoCuota.MORA];
    const estadosPrestamo = [EstadoPrestamo.VIGENTE, EstadoPrestamo.MORA];

    const cuotasRaw = await this.planPagoRepository
      .createQueryBuilder('planPago')
      .innerJoinAndSelect('planPago.prestamo', 'prestamo')
      .innerJoinAndSelect('prestamo.persona', 'persona')
      .where('planPago.estado IN (:...estadosCuota)', { estadosCuota })
      .andWhere('prestamo.estado IN (:...estadosPrestamo)', { estadosPrestamo })
      .andWhere(
        new Brackets((qb) => {
          qb
            // Sección 1: Préstamos DIARIOS — siempre se muestran
            .where('prestamo.periodicidadPago = :diario', {
              diario: PeriodicidadPago.DIARIO,
            })
            // Sección 2: No diarios — cuotas dentro del rango de fechas
            .orWhere(
              new Brackets((sub) => {
                sub
                  .where('prestamo.periodicidadPago != :diario2', {
                    diario2: PeriodicidadPago.DIARIO,
                  })
                  .andWhere(
                    'planPago.fechaVencimiento BETWEEN :fechaDesde AND :fechaHasta2',
                    {
                      fechaDesde: fechaDesdeStr,
                      fechaHasta2: fechaHastaStr,
                    },
                  );
              }),
            )
            // Sección 3: Préstamos cuya fecha de vencimiento del crédito ya pasó
            .orWhere(
              new Brackets((sub) => {
                sub.where('prestamo.fechaVencimiento < :fechaDesde2', {
                  fechaDesde2: fechaDesdeStr,
                });
              }),
            );
        }),
      )
      .orderBy('planPago.fechaVencimiento', 'ASC')
      .addOrderBy('persona.apellido', 'ASC')
      .addOrderBy('persona.nombre', 'ASC')
      .getMany();

    // Agrupar por préstamo: un solo registro por crédito
    const prestamosMap = new Map<number, {
      prestamo: typeof cuotasRaw[0]['prestamo'];
      cuotas: typeof cuotasRaw;
      seccion: SeccionRutaCobro;
    }>();

    for (const cuota of cuotasRaw) {
      const prestamoId = cuota.prestamo?.id;
      if (!prestamoId) continue;

      if (!prestamosMap.has(prestamoId)) {
        const esDiario = cuota.prestamo.periodicidadPago === PeriodicidadPago.DIARIO;
        const fechaVencPrestamo = cuota.prestamo.fechaVencimiento
          ? formatLocalDate(parseLocalDate(String(cuota.prestamo.fechaVencimiento)))
          : '';

        let seccion: SeccionRutaCobro;
        if (fechaVencPrestamo && fechaVencPrestamo < fechaDesdeStr) {
          seccion = SeccionRutaCobro.VENCIDO;
        } else if (esDiario) {
          seccion = SeccionRutaCobro.DIARIO;
        } else {
          seccion = SeccionRutaCobro.EN_RANGO;
        }

        prestamosMap.set(prestamoId, {
          prestamo: cuota.prestamo,
          cuotas: [],
          seccion,
        });
      }

      prestamosMap.get(prestamoId)!.cuotas.push(cuota);
    }

    // Construir un item por préstamo
    const items: RutaCobroItemDto[] = [];

    for (const [, data] of prestamosMap) {
      const { prestamo, cuotas, seccion } = data;
      const nombreCliente = prestamo.persona
        ? `${prestamo.persona.nombre} ${prestamo.persona.apellido}`
        : '';

      if (seccion === SeccionRutaCobro.VENCIDO) {
        // Vencido: mostrar saldo total del crédito
        const saldoTotal = Number(prestamo.saldoCapital || 0) +
          Number(prestamo.saldoInteres || 0);

        items.push({
          fechaVencimiento: formatLocalDate(
            parseLocalDate(String(prestamo.fechaVencimiento)),
          ),
          nombreCliente,
          numeroCredito: prestamo.numeroCredito ?? '',
          periodicidadPago: prestamo.periodicidadPago ?? '',
          seccion,
          montoCobrar: Number(saldoTotal.toFixed(2)),
          detalleCobro: 'Saldo total',
        });
      } else {
        // Al día (DIARIO o EN_RANGO): mostrar la próxima cuota pendiente
        // Las cuotas ya vienen ordenadas por fechaVencimiento ASC
        const proximaCuota = cuotas[0];
        const pagado =
          Number(proximaCuota.capitalPagado || 0) +
          Number(proximaCuota.interesPagado || 0) +
          Number(proximaCuota.recargosPagado || 0);
        const saldoCuota = Number(proximaCuota.cuotaTotal) - pagado;

        items.push({
          fechaVencimiento: formatLocalDate(
            parseLocalDate(String(proximaCuota.fechaVencimiento)),
          ),
          nombreCliente,
          numeroCredito: prestamo.numeroCredito ?? '',
          periodicidadPago: prestamo.periodicidadPago ?? '',
          seccion,
          montoCobrar: Number(saldoCuota.toFixed(2)),
          detalleCobro: `Cuota #${proximaCuota.numeroCuota}`,
        });
      }
    }

    // Ordenar: VENCIDO primero, luego DIARIO, luego EN_RANGO
    const ordenSeccion = {
      [SeccionRutaCobro.VENCIDO]: 0,
      [SeccionRutaCobro.DIARIO]: 1,
      [SeccionRutaCobro.EN_RANGO]: 2,
    };

    items.sort((a, b) => {
      const secDiff = ordenSeccion[a.seccion] - ordenSeccion[b.seccion];
      if (secDiff !== 0) return secDiff;
      if (a.fechaVencimiento !== b.fechaVencimiento)
        return a.fechaVencimiento.localeCompare(b.fechaVencimiento);
      return a.nombreCliente.localeCompare(b.nombreCliente);
    });

    // Resumen por sección
    const labelMap: Record<SeccionRutaCobro, string> = {
      [SeccionRutaCobro.VENCIDO]: 'Créditos Vencidos',
      [SeccionRutaCobro.DIARIO]: 'Cobro Diario',
      [SeccionRutaCobro.EN_RANGO]: 'Cuotas en Rango',
    };

    const resumenSecciones: RutaCobroSeccionResumenDto[] = Object.values(
      SeccionRutaCobro,
    ).map((sec) => {
      const secItems = items.filter((c) => c.seccion === sec);
      return {
        seccion: sec,
        label: labelMap[sec],
        totalCuotas: secItems.length,
        totalMonto: Number(
          secItems.reduce((sum, c) => sum + c.montoCobrar, 0).toFixed(2),
        ),
      };
    });

    const totalMonto = items.reduce((sum, c) => sum + c.montoCobrar, 0);

    return {
      fechaDesde: fechaDesdeStr,
      fechaHasta: fechaHastaStr,
      totalCuotas: items.length,
      totalMonto: Number(totalMonto.toFixed(2)),
      resumenSecciones,
      cuotas: items,
    };
  }
}
