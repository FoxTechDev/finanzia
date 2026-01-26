import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TipoDecisionComite } from '../entities/decision-comite.entity';

export class DecisionComiteDto {
  @IsEnum(TipoDecisionComite)
  tipoDecision: TipoDecisionComite;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsString()
  @IsOptional()
  condicionesEspeciales?: string;

  // Montos autorizados (pueden diferir de lo solicitado)
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  @Transform(({ value }) => value !== undefined && value !== null && value !== '' ? Number(value) : undefined)
  montoAutorizado?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  @Transform(({ value }) => value !== undefined && value !== null && value !== '' ? Number(value) : undefined)
  plazoAutorizado?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  
  @Type(() => Number)
  @Transform(({ value }) => value !== undefined && value !== null && value !== '' ? Number(value) : undefined)
  tasaAutorizada?: number;

  // Datos del usuario que registra la decisión
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  usuarioId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  nombreUsuario?: string;
}
