import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateBeneficiarioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellidos: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? null : value))
  fechaNacimiento?: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? null : value))
  @MaxLength(255)
  direccion?: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? null : value))
  @MaxLength(20)
  telefono?: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? null : value))
  @MaxLength(100)
  email?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  parentesco: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  @Max(100)
  porcentajeBeneficio: number;
}

export class UpdateBeneficiarioDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellidos?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? null : value))
  fechaNacimiento?: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? null : value))
  @MaxLength(255)
  direccion?: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? null : value))
  @MaxLength(20)
  telefono?: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? null : value))
  @MaxLength(100)
  email?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  parentesco?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  @Max(100)
  porcentajeBeneficio?: number;
}
