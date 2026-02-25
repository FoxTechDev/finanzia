import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanPago, EstadoCuota } from '../entities/plan-pago.entity';
import {
  RutaCobroItemDto,
  RutaCobroParamsDto,
  RutaCobroResponseDto,
} from '../dto/ruta-cobro.dto';
import {
  parseLocalDate,
  formatLocalDate,
} from '../../../common/utils/date.utils';

/**
 * Servicio para generar el reporte de Ruta de Cobro
 * Lista las cuotas pendientes de pago en un rango de fechas de vencimiento
 */
@Injectable()
export class RutaCobroService {
  constructor(
    @InjectRepository(PlanPago)
    private readonly planPagoRepository: Repository<PlanPago>,
  ) {}

  /**
   * Genera el reporte de ruta de cobro para un rango de fechas
   *
   * @param params - Parámetros con fechaDesde y fechaHasta (YYYY-MM-DD)
   * @returns Listado de cuotas pendientes ordenadas por fecha y apellido del cliente
   */
  async generarReporte(params: RutaCobroParamsDto): Promise<RutaCobroResponseDto> {
    const fechaDesde = parseLocalDate(params.fechaDesde);
    const fechaHasta = parseLocalDate(params.fechaHasta);

    // Formatear como YYYY-MM-DD para la comparación directa con columna type:'date'
    const fechaDesdeStr = formatLocalDate(fechaDesde);
    const fechaHastaStr = formatLocalDate(fechaHasta);

    const cuotasRaw = await this.planPagoRepository
      .createQueryBuilder('planPago')
      .innerJoinAndSelect('planPago.prestamo', 'prestamo')
      .innerJoinAndSelect('prestamo.persona', 'persona')
      .where('planPago.fechaVencimiento BETWEEN :fechaDesde AND :fechaHasta', {
        fechaDesde: fechaDesdeStr,
        fechaHasta: fechaHastaStr,
      })
      .andWhere('planPago.estado IN (:...estados)', {
        estados: [EstadoCuota.PENDIENTE, EstadoCuota.PARCIAL, EstadoCuota.MORA],
      })
      .orderBy('planPago.fechaVencimiento', 'ASC')
      .addOrderBy('persona.apellido', 'ASC')
      .addOrderBy('persona.nombre', 'ASC')
      .getMany();

    const cuotas: RutaCobroItemDto[] = cuotasRaw.map((planPago) => ({
      fechaVencimiento: formatLocalDate(parseLocalDate(String(planPago.fechaVencimiento))),
      nombreCliente: planPago.prestamo?.persona
        ? `${planPago.prestamo.persona.nombre} ${planPago.prestamo.persona.apellido}`
        : '',
      numeroCredito: planPago.prestamo?.numeroCredito ?? '',
      numeroCuota: planPago.numeroCuota,
      cuotaTotal: Number(planPago.cuotaTotal),
      estado: planPago.estado,
    }));

    const totalMonto = cuotas.reduce(
      (suma, cuota) => suma + cuota.cuotaTotal,
      0,
    );

    return {
      fechaDesde: fechaDesdeStr,
      fechaHasta: fechaHastaStr,
      totalCuotas: cuotas.length,
      totalMonto: Number(totalMonto.toFixed(2)),
      cuotas,
    };
  }
}
