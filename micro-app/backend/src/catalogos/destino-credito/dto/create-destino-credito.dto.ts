import { IsString, IsBoolean, IsOptional, IsNumber, MaxLength } from 'class-validator';

export class CreateDestinoCreditoDto {
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

  @IsOptional()
  @IsNumber()
  orden?: number;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;
}
