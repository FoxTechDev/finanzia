import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateActividadEconomicaDto {
  @IsString()
  @MaxLength(60)
  tipoActividad: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  nombreEmpresa?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  cargoOcupacion?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  ingresosMensuales?: number;

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

  @IsNumber()
  @IsOptional()
  latitud?: number;

  @IsNumber()
  @IsOptional()
  longitud?: number;
}
