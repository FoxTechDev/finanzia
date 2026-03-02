import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreateLineaAhorroDto {
  @IsString()
  @MaxLength(10)
  codigo: string;

  @IsString()
  @MaxLength(50)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
