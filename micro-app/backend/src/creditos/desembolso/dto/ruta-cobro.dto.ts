import { IsDateString, IsNotEmpty } from 'class-validator';

/**
 * DTO para parámetros del reporte de Ruta de Cobro
 */
export class RutaCobroParamsDto {
  @IsNotEmpty({ message: 'La fecha desde es obligatoria' })
  @IsDateString({}, { message: 'La fecha desde debe ser una fecha válida (YYYY-MM-DD)' })
  fechaDesde: string;

  @IsNotEmpty({ message: 'La fecha hasta es obligatoria' })
  @IsDateString({}, { message: 'La fecha hasta debe ser una fecha válida (YYYY-MM-DD)' })
  fechaHasta: string;
}

/**
 * DTO para una fila del reporte de Ruta de Cobro
 */
export class RutaCobroItemDto {
  fechaVencimiento: string;
  nombreCliente: string;
  numeroCredito: string;
  numeroCuota: number;
  cuotaTotal: number;
  estado: string;
}

/**
 * DTO para la respuesta del reporte de Ruta de Cobro
 */
export class RutaCobroResponseDto {
  fechaDesde: string;
  fechaHasta: string;
  totalCuotas: number;
  totalMonto: number;
  cuotas: RutaCobroItemDto[];
}
