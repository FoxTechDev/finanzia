import { IsString, IsOptional, IsBoolean, MaxLength, IsNumber, Min } from 'class-validator';

export class CreateTipoViviendaDto {
  @IsString()
  @MaxLength(50)
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

  @IsOptional()
  @IsNumber()
  @Min(0)
  orden?: number;
}
