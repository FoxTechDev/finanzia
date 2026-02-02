import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DestinoCredito, TipoInteresSolicitud } from '../entities/solicitud.entity';
import { RecomendacionAsesor } from '../../garantia/enums/tipo-garantia.enum';

export class CreateSolicitudDto {
  @IsNumber()
  @Type(() => Number)
  personaId: number;

  @IsNumber()
  @Type(() => Number)
  lineaCreditoId: number;

  @IsNumber()
  @Type(() => Number)
  tipoCreditoId: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  montoSolicitado: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  plazoSolicitado: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  tasaInteresPropuesta: number;

  @IsEnum(DestinoCredito)
  destinoCredito: DestinoCredito;

  @IsString()
  @IsOptional()
  descripcionDestino?: string;

  @IsDateString()
  fechaSolicitud: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  // Campos de análisis del asesor (opcionales al crear)
  @IsString()
  @IsOptional()
  analisisAsesor?: string;

  @IsEnum(RecomendacionAsesor)
  @IsOptional()
  recomendacionAsesor?: RecomendacionAsesor;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  capacidadPago?: number;

  @IsString()
  @IsOptional()
  antecedentesCliente?: string;

  // Campos de periodicidad de pago
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  periodicidadPagoId?: number;

  // Tipo de interés para el plan de pago
  @IsEnum(TipoInteresSolicitud)
  @IsOptional()
  tipoInteres?: TipoInteresSolicitud;

  @IsDateString()
  @IsOptional()
  fechaDesdePago?: string;

  @IsDateString()
  @IsOptional()
  fechaHastaPago?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  diasCalculados?: number;
}
