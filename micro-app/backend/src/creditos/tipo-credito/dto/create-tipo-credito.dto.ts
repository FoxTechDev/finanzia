import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  MaxLength,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateTipoCreditoDto {
  @IsString()
  @MaxLength(150)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @Type(() => Number)
  @IsNumber()
  lineaCreditoId: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(999.99)
  tasaInteres: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(999.99)
  tasaInteresMinima: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(999.99)
  tasaInteresMaxima: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(999.99)
  tasaInteresMoratorio: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  montoMinimo: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  montoMaximo: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  plazoMinimo: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  plazoMaximo: number;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  periodicidadPago?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  tipoCuota?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  diasGracia?: number;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  requiereGarantia?: boolean;

  @IsDateString()
  fechaVigenciaDesde: string;

  @IsDateString()
  @IsOptional()
  fechaVigenciaHasta?: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
