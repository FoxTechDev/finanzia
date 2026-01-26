import { IsString, IsOptional, IsNumber, IsBoolean, Min, Max, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * DTO para actualizar una clasificación de préstamo
 */
export class UpdateClasificacionPrestamoDto {
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  @Transform(({ value }) => value && value.trim() ? value.trim() : null)
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Los días de mora mínimo deben ser mayor o igual a 0' })
  @Type(() => Number)
  diasMoraMinimo?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Los días de mora máximo deben ser mayor o igual a 0' })
  @Type(() => Number)
  @Transform(({ value }) => {
    // Convertir valores vacíos o undefined a null
    if (value === '' || value === undefined || value === null) {
      return null;
    }
    return Number(value);
  })
  diasMoraMaximo?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'El porcentaje de provisión debe ser mayor o igual a 0' })
  @Max(100, { message: 'El porcentaje de provisión debe ser menor o igual a 100' })
  @Type(() => Number)
  porcentajeProvision?: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  activo?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'El orden debe ser mayor o igual a 0' })
  @Type(() => Number)
  orden?: number;
}
