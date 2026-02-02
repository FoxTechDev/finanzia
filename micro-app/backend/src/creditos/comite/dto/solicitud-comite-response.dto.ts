import { Solicitud } from '../../solicitud/entities/solicitud.entity';
import { IngresoCliente } from '../../../ingreso-cliente/entities/ingreso-cliente.entity';
import { GastoCliente } from '../../../gasto-cliente/entities/gasto-cliente.entity';

export class AnalisisFinancieroDto {
  totalIngresos: number;
  totalGastos: number;
  capacidadPago: number;
  ratioEndeudamiento: number | null;
}

/**
 * DTO de respuesta para el endpoint GET /comite/:solicitudId/revision
 * Incluye toda la información necesaria para la revisión del comité de crédito
 */
export class SolicitudComiteResponseDto {
  solicitud: Solicitud;
  ingresos: IngresoCliente[];
  gastos: GastoCliente[];
  analisisFinanciero: AnalisisFinancieroDto;
}
