import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength, MinLength } from 'class-validator';

export class CreateRolDto {
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  codigo: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsNumber()
  orden?: number;
}
