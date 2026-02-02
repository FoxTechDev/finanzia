import {
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  Min,
  ValidateIf,
  IsArray,
  ValidateNested,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoInteres, PeriodicidadPago } from '../../desembolso/entities/prestamo.entity';
import { TipoCalculo } from '../../desembolso/entities/tipo-deduccion.entity';

/**
 * DTO para especificar un recargo en el plan de pago
 */
export class RecargoDto {
  @IsString()
  nombre: string;

  @IsEnum(TipoCalculo, {
    message: 'Tipo debe ser: FIJO o PORCENTAJE',
  })
  tipo: TipoCalculo;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  valor: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  aplicaDesde?: number; // Por defecto: 1

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  aplicaHasta?: number; // Por defecto: hasta el final
}

/**
 * DTO para calcular el plan de pago de una solicitud
 * Este endpoint no guarda nada, solo calcula y retorna los valores
 *
 * IMPORTANTE - El campo `plazo` SIEMPRE se ingresa en MESES para todas las periodicidades:
 * - Mínimo: 1 mes para cualquier periodicidad
 * - El plazo representa la duración total del crédito en meses
 *
 * CAMPO `numeroCuotas`:
 * - OBLIGATORIO para periodicidad DIARIA: el usuario define manualmente el número de cuotas diarias
 * - IGNORADO para otras periodicidades: se calcula automáticamente según el plazo
 *
 * REGLA DE CONVERSIÓN (plazo en meses → número de cuotas):
 * | Periodicidad | Fórmula           | Ejemplo (2 meses) |
 * |--------------|-------------------|-------------------|
 * | DIARIA       | numeroCuotas (manual) | numeroCuotas: 45 (usuario define) |
 * | SEMANAL      | plazo_meses × 4   | 2 × 4 = 8 cuotas  |
 * | QUINCENAL    | plazo_meses × 2   | 2 × 2 = 4 cuotas  |
 * | MENSUAL      | plazo_meses × 1   | 2 × 1 = 2 cuotas  |
 * | TRIMESTRAL   | plazo_meses / 3   | 6 / 3 = 2 cuotas  |
 * | SEMESTRAL    | plazo_meses / 6   | 6 / 6 = 1 cuota   |
 * | ANUAL        | plazo_meses / 12  | 12 / 12 = 1 cuota |
 *
 * Ejemplo PERIODICIDAD DIARIA:
 * - plazo: 2 (meses)
 * - numeroCuotas: 45 (ingresado por usuario)
 * - Plan de pago: 45 cuotas diarias excluyendo domingos
 * - Cálculo de interés: sobre 2 meses
 *
 * Ejemplo PERIODICIDAD SEMANAL:
 * - plazo: 3 (meses)
 * - numeroCuotas: no se envía (se calcula automáticamente: 3 × 4 = 12)
 * - Plan de pago: 12 cuotas semanales
 */
export class CalcularPlanPagoDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  monto: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  plazo: number; // SIEMPRE en meses para todas las periodicidades

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  tasaInteres: number;

  @IsEnum(PeriodicidadPago, {
    message: 'Periodicidad debe ser uno de: DIARIO, SEMANAL, QUINCENAL, MENSUAL, TRIMESTRAL, SEMESTRAL, ANUAL, AL_VENCIMIENTO',
  })
  periodicidad: PeriodicidadPago;

  @IsEnum(TipoInteres, {
    message: 'Tipo de interés debe ser: FLAT o AMORTIZADO',
  })
  tipoInteres: TipoInteres;

  @IsDateString()
  @IsOptional()
  fechaPrimeraCuota?: string; // Fecha de solicitud. La primera cuota se calculará para el día POSTERIOR. Por defecto: hoy + 30 días

  /**
   * Número de cuotas a generar
   * - OBLIGATORIO para periodicidad DIARIA: define cuántas cuotas diarias se generarán
   * - OPCIONAL/IGNORADO para otras periodicidades: se calcula automáticamente según el plazo
   */
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  @ValidateIf((dto) => dto.periodicidad === PeriodicidadPago.DIARIO)
  numeroCuotas?: number;

  /**
   * Recargos opcionales a aplicar en el plan de pago
   * - FIJO: monto fijo que se suma a las cuotas en el rango especificado
   * - PORCENTAJE: porcentaje del monto del crédito que se distribuye en las cuotas del rango
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecargoDto)
  @IsOptional()
  recargos?: RecargoDto[];
}
