import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateTipoGarantiaCatalogoDto {
  @IsString()
  @MaxLength(20)
  codigo: string;

  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
