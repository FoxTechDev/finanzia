import { IsDateString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para parámetros del reporte de cartera
 */
export class ReporteCarteraParamsDto {
  @IsNotEmpty({ message: 'La fecha de corte es obligatoria' })
  @IsDateString({}, { message: 'La fecha de corte debe ser una fecha válida (YYYY-MM-DD)' })
  fechaCorte: string;
}

/**
 * DTO para una fila del reporte de cartera
 */
export class ReporteCarteraItemDto {
  // Información básica
  numeroCredito: string;
  nombreCliente: string;
  lineaCredito: string;
  tipoCredito: string;

  // Fechas
  fechaOtorgamiento: Date;
  fechaVencimiento: Date;

  // Términos del préstamo
  monto: number; // montoDesembolsado
  plazo: number; // plazoAutorizado
  tasaInteres: number;
  cuotaTotal: number;
  numeroCuotas: number;

  // Saldos recalculados a la fecha de corte
  saldoCapital: number;
  saldoInteres: number;

  // Mora calculada a la fecha de corte
  cuotasAtrasadas: number;
  capitalMora: number;
  interesMora: number;
}

/**
 * DTO para la respuesta del reporte de cartera
 */
export class ReporteCarteraResponseDto {
  fechaCorte: Date;
  totalPrestamos: number;
  totalMonto: number;
  totalSaldoCapital: number;
  totalSaldoInteres: number;
  totalCapitalMora: number;
  totalInteresMora: number;
  prestamos: ReporteCarteraItemDto[];
}
