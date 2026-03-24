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
 * Secciones del reporte de Ruta de Cobro
 */
export enum SeccionRutaCobro {
  DIARIO = 'DIARIO',
  EN_RANGO = 'EN_RANGO',
  VENCIDO = 'VENCIDO',
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
  saldoCuota: number;
  estado: string;
  periodicidadPago: string;
  seccion: SeccionRutaCobro;
}

/**
 * Resumen por sección
 */
export class RutaCobroSeccionResumenDto {
  seccion: SeccionRutaCobro;
  label: string;
  totalCuotas: number;
  totalMonto: number;
}

/**
 * DTO para la respuesta del reporte de Ruta de Cobro
 */
export class RutaCobroResponseDto {
  fechaDesde: string;
  fechaHasta: string;
  totalCuotas: number;
  totalMonto: number;
  resumenSecciones: RutaCobroSeccionResumenDto[];
  cuotas: RutaCobroItemDto[];
}
