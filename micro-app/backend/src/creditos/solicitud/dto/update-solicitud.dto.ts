import { PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSolicitudDto } from './create-solicitud.dto';

export class UpdateSolicitudDto extends PartialType(CreateSolicitudDto) {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  estadoId?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  montoAprobado?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  plazoAprobado?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
   
  @Type(() => Number)
  tasaInteresAprobada?: number;

  @IsDateString()
  @IsOptional()
  fechaAnalisis?: string;

  @IsDateString()
  @IsOptional()
  fechaAprobacion?: string;

  @IsDateString()
  @IsOptional()
  fechaDenegacion?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  analistaId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  nombreAnalista?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  aprobadorId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  nombreAprobador?: string;

  @IsString()
  @IsOptional()
  motivoRechazo?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  scoreCredito?: number;

  @IsString()
  @IsOptional()
  @MaxLength(1)
  categoriaRiesgo?: string;
}
