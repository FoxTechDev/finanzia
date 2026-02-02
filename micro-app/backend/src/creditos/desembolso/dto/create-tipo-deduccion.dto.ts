import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { TipoCalculo } from '../entities/tipo-deduccion.entity';

export class CreateTipoDeduccionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  codigo: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsEnum(TipoCalculo)
  tipoCalculoDefault: TipoCalculo;

  @IsNumber()
  @Min(0)
  valorDefault: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsBoolean()
  cancelacionPrestamo?: boolean;
}

export class UpdateTipoDeduccionDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(TipoCalculo)
  tipoCalculoDefault?: TipoCalculo;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorDefault?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsBoolean()
  cancelacionPrestamo?: boolean;
}
