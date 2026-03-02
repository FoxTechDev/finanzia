import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FiltrosCuentaAhorroDto {
  @IsOptional()
  @IsString()
  buscar?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tipoAhorroId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  estadoId?: number;

  @IsOptional()
  @IsString()
  lineaCodigo?: string;

  @IsOptional()
  @IsString()
  fechaDesde?: string;

  @IsOptional()
  @IsString()
  fechaHasta?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;
}
