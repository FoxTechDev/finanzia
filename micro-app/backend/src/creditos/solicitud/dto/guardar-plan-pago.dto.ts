import {
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  Min,
  ValidateIf,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoInteres, PeriodicidadPago } from '../../desembolso/entities/prestamo.entity';
import { RecargoDto } from './calcular-plan-pago.dto';

/**
 * DTO para guardar el plan de pago calculado de una solicitud
 * Este endpoint calcula Y GUARDA el plan de pago en la base de datos
 * Se usa cuando la solicitud es aprobada y se quiere persistir el plan
 */
export class GuardarPlanPagoDto {
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
  fechaPrimeraCuota?: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  @ValidateIf((dto) => dto.periodicidad === PeriodicidadPago.DIARIO)
  numeroCuotas?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecargoDto)
  @IsOptional()
  recargos?: RecargoDto[];
}
