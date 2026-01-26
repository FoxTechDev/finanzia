import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGarantiaFiadorDto {
  @IsNumber()
  @Type(() => Number)
  personaFiadorId: number;

  @IsOptional()
  @IsString()
  parentesco?: string;

  @IsOptional()
  @IsString()
  ocupacion?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  ingresoMensual?: number;

  @IsOptional()
  @IsString()
  lugarTrabajo?: string;

  @IsOptional()
  @IsString()
  direccionLaboral?: string;

  @IsOptional()
  @IsString()
  telefonoLaboral?: string;
}
