import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGarantiaPrendariaDto {
  @IsOptional()
  @IsString()
  tipoBien?: string;

  @IsOptional()
  @IsString()
  descripcionBien?: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsString()
  serie?: string;

  @IsOptional()
  @IsString()
  placa?: string;

  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Type(() => Number)
  anio?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  valorPericial?: number;

  @IsOptional()
  @IsString()
  ubicacionBien?: string;
}
