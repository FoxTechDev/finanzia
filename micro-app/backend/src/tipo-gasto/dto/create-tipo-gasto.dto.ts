import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateTipoGastoDto {
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
