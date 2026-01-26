import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsDateString,
  MaxLength,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Sexo } from '../entities/persona.entity';
import { CreateDireccionDto } from '../../direccion/dto/create-direccion.dto';
import { CreateActividadEconomicaDto } from '../../actividad-economica/dto/create-actividad-economica.dto';
import { CreateReferenciaPersonalDto } from '../../referencia-personal/dto/create-referencia-personal.dto';
import { CreateReferenciaFamiliarDto } from '../../referencia-familiar/dto/create-referencia-familiar.dto';

export class CreatePersonaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido: string;

  @IsDateString()
  @IsNotEmpty()
  fechaNacimiento: string;

  @IsEnum(Sexo)
  @IsOptional()
  sexo?: Sexo;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nacionalidad: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  estadoCivil?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  telefono?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(120)
  correoElectronico?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  numeroDui: string;

  @IsDateString()
  @IsNotEmpty()
  fechaEmisionDui: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  lugarEmisionDui: string;

  @ValidateNested()
  @Type(() => CreateDireccionDto)
  @IsOptional()
  direccion?: CreateDireccionDto;

  @ValidateNested()
  @Type(() => CreateActividadEconomicaDto)
  @IsOptional()
  actividadEconomica?: CreateActividadEconomicaDto;

  @ValidateNested({ each: true })
  @Type(() => CreateReferenciaPersonalDto)
  @IsArray()
  @IsOptional()
  referenciasPersonales?: CreateReferenciaPersonalDto[];

  @ValidateNested({ each: true })
  @Type(() => CreateReferenciaFamiliarDto)
  @IsArray()
  @IsOptional()
  referenciasFamiliares?: CreateReferenciaFamiliarDto[];
}
