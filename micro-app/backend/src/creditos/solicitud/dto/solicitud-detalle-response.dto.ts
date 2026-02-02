import { Solicitud } from '../entities/solicitud.entity';

export class CuotaPlanPagoDto {
  numeroCuota: number;
  fechaVencimiento: Date;
  capital: number;
  interes: number;
  cuotaTotal: number;
  saldoCapital: number;
}

export class PlanPagoDto {
  cuotaNormal: number;
  totalInteres: number;
  totalPagar: number;
  numeroCuotas: number;
  cuotas: CuotaPlanPagoDto[];
}

/**
 * DTO de respuesta para el endpoint GET /solicitudes/:id/detalle
 * Incluye todos los datos de la solicitud más el plan de pago calculado
 */
export class SolicitudDetalleResponseDto extends Solicitud {
  /**
   * Plan de pago calculado (diferente a planPago de la entidad que es la relación con PlanPagoSolicitud)
   */
  planPagoCalculado: PlanPagoDto | null;
}
