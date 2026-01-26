import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreateLineaCreditoDto {
  @IsString()
  @MaxLength(10)
  codigo: string;

  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
