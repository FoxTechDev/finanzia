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

  // Nuevos campos de ingresos adicionales
  @IsNumber()
  @IsOptional()
  @Min(0)
  ingresosAdicionales?: number;

  @IsString()
  @IsOptional()
  descripcionIngresosAdicionales?: string;

  // Nuevos campos de gastos detallados
  @IsNumber()
  @IsOptional()
  @Min(0)
  gastosVivienda?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  gastosAlimentacion?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  gastosTransporte?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  gastosServiciosBasicos?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  gastosEducacion?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  gastosMedicos?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  otrosGastos?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalGastos?: number;
}
