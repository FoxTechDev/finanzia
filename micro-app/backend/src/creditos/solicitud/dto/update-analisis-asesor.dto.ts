import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RecomendacionAsesor } from '../../garantia/enums/tipo-garantia.enum';

export class UpdateAnalisisAsesorDto {
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
