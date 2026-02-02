import { IsNumber, IsOptional, IsString, MaxLength, IsInt, Min, Max } from 'class-validator';

export class CreateDireccionDto {
  @IsNumber()
  departamentoId: number;

  @IsNumber()
  municipioId: number;

  @IsNumber()
  distritoId: number;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  detalleDireccion?: string;

  @IsOptional()
  @IsNumber()
  tipoViviendaId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  tiempoResidenciaAnios?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(11)
  tiempoResidenciaMeses?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  montoAlquiler?: number;
}
