import { IsString, IsEnum, IsInt, IsBoolean, IsOptional, MaxLength, Min, Max } from 'class-validator';
import { Parentesco } from '../entities/dependencia-familiar.entity';

export class CreateDependenciaFamiliarDto {
  @IsString()
  @MaxLength(150)
  nombreDependiente: string;

  @IsEnum(Parentesco)
  parentesco: Parentesco;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  edad?: number;

  @IsOptional()
  @IsBoolean()
  trabaja?: boolean;

  @IsOptional()
  @IsBoolean()
  estudia?: boolean;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
