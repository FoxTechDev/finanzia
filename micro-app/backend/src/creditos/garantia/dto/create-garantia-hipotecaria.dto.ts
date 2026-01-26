import { IsOptional, IsNumber, IsString, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGarantiaHipotecariaDto {
  @IsNumber()
  @Type(() => Number)
  tipoInmuebleId: number;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  departamentoId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  municipioId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  distritoId?: number;

  @IsOptional()
  @IsString()
  numeroRegistro?: string;

  @IsOptional()
  @IsString()
  folioRegistro?: string;

  @IsOptional()
  @IsString()
  libroRegistro?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  areaTerreno?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  areaConstruccion?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  valorPericial?: number;

  @IsOptional()
  @IsString()
  nombrePerito?: string;

  @IsOptional()
  @IsDateString()
  fechaAvaluo?: string;
}
