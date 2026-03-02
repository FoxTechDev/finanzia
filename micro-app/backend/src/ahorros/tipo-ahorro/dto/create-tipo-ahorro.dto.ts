import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  MaxLength,
} from 'class-validator';

export class CreateTipoAhorroDto {
  @IsNumber()
  lineaAhorroId: number;

  @IsString()
  @MaxLength(50)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  esPlazo?: boolean;

  @IsNumber()
  @IsOptional()
  tasaMin?: number;

  @IsNumber()
  @IsOptional()
  tasaMax?: number;

  @IsNumber()
  @IsOptional()
  tasaVigente?: number;

  @IsNumber()
  @IsOptional()
  plazo?: number;

  @IsNumber()
  @IsOptional()
  plazoMin?: number;

  @IsNumber()
  @IsOptional()
  plazoMax?: number;

  @IsNumber()
  @IsOptional()
  montoAperturaMin?: number;

  @IsNumber()
  @IsOptional()
  diasGracia?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
