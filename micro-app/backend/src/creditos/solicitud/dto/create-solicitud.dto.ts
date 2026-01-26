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
import { DestinoCredito } from '../entities/solicitud.entity';
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
}
