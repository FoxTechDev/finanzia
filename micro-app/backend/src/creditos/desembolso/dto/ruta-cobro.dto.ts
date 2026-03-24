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
 * Un registro por préstamo (sin duplicados)
 */
export class RutaCobroItemDto {
  fechaVencimiento: string;
  nombreCliente: string;
  numeroCredito: string;
  periodicidadPago: string;
  seccion: SeccionRutaCobro;
  /** Para al día: monto de la próxima cuota. Para vencido: saldo total del crédito */
  montoCobrar: number;
  /** Descripción del monto (ej: "Cuota #3" o "Saldo total") */
  detalleCobro: string;
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
