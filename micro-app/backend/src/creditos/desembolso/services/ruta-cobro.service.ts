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
 * Secciones:
 * 1. DIARIO: Préstamos con periodicidad diaria (siempre se muestran)
 * 2. EN_RANGO: Préstamos no diarios con cuotas dentro del rango de fechas
 * 3. VENCIDO: Préstamos no diarios con cuotas vencidas (antes del rango)
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
            // Sección 1: Préstamos DIARIOS — siempre se muestran (cuotas pendientes hasta fechaHasta)
            .where(
              new Brackets((sub) => {
                sub
                  .where('prestamo.periodicidadPago = :diario', {
                    diario: PeriodicidadPago.DIARIO,
                  })
                  .andWhere('planPago.fechaVencimiento <= :fechaHasta', {
                    fechaHasta: fechaHastaStr,
                  });
              }),
            )
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
            // Sección 3: No diarios — cuotas vencidas (antes del rango)
            .orWhere(
              new Brackets((sub) => {
                sub
                  .where('prestamo.periodicidadPago != :diario3', {
                    diario3: PeriodicidadPago.DIARIO,
                  })
                  .andWhere('planPago.fechaVencimiento < :fechaDesde2', {
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

    // Clasificar cada cuota en su sección
    const cuotas: RutaCobroItemDto[] = cuotasRaw.map((planPago) => {
      const esDiario =
        planPago.prestamo?.periodicidadPago === PeriodicidadPago.DIARIO;
      const fechaVenc = formatLocalDate(
        parseLocalDate(String(planPago.fechaVencimiento)),
      );

      let seccion: SeccionRutaCobro;
      if (esDiario) {
        seccion = SeccionRutaCobro.DIARIO;
      } else if (fechaVenc < fechaDesdeStr) {
        seccion = SeccionRutaCobro.VENCIDO;
      } else {
        seccion = SeccionRutaCobro.EN_RANGO;
      }

      const pagado =
        Number(planPago.capitalPagado || 0) +
        Number(planPago.interesPagado || 0) +
        Number(planPago.recargosPagado || 0);
      const saldoCuota = Number(planPago.cuotaTotal) - pagado;

      return {
        fechaVencimiento: fechaVenc,
        nombreCliente: planPago.prestamo?.persona
          ? `${planPago.prestamo.persona.nombre} ${planPago.prestamo.persona.apellido}`
          : '',
        numeroCredito: planPago.prestamo?.numeroCredito ?? '',
        numeroCuota: planPago.numeroCuota,
        cuotaTotal: Number(planPago.cuotaTotal),
        saldoCuota: Number(saldoCuota.toFixed(2)),
        estado: planPago.estado,
        periodicidadPago: planPago.prestamo?.periodicidadPago ?? '',
        seccion,
      };
    });

    // Ordenar: VENCIDO primero, luego DIARIO, luego EN_RANGO
    const ordenSeccion = {
      [SeccionRutaCobro.VENCIDO]: 0,
      [SeccionRutaCobro.DIARIO]: 1,
      [SeccionRutaCobro.EN_RANGO]: 2,
    };

    cuotas.sort((a, b) => {
      const secDiff = ordenSeccion[a.seccion] - ordenSeccion[b.seccion];
      if (secDiff !== 0) return secDiff;
      // Dentro de la misma sección, ordenar por fecha y nombre
      if (a.fechaVencimiento !== b.fechaVencimiento)
        return a.fechaVencimiento.localeCompare(b.fechaVencimiento);
      return a.nombreCliente.localeCompare(b.nombreCliente);
    });

    // Resumen por sección
    const labelMap: Record<SeccionRutaCobro, string> = {
      [SeccionRutaCobro.VENCIDO]: 'Cuotas Vencidas',
      [SeccionRutaCobro.DIARIO]: 'Cobro Diario',
      [SeccionRutaCobro.EN_RANGO]: 'Cuotas en Rango',
    };

    const resumenSecciones: RutaCobroSeccionResumenDto[] = Object.values(
      SeccionRutaCobro,
    ).map((sec) => {
      const items = cuotas.filter((c) => c.seccion === sec);
      return {
        seccion: sec,
        label: labelMap[sec],
        totalCuotas: items.length,
        totalMonto: Number(
          items.reduce((sum, c) => sum + c.saldoCuota, 0).toFixed(2),
        ),
      };
    });

    const totalMonto = cuotas.reduce((sum, c) => sum + c.saldoCuota, 0);

    return {
      fechaDesde: fechaDesdeStr,
      fechaHasta: fechaHastaStr,
      totalCuotas: cuotas.length,
      totalMonto: Number(totalMonto.toFixed(2)),
      resumenSecciones,
      cuotas,
    };
  }
}
