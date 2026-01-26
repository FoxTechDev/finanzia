import {
  IsOptional,
  IsNumber,
  IsString,
  IsDateString,
  IsEnum,
  Min,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoGarantia } from '../enums/tipo-garantia.enum';
import { CreateGarantiaHipotecariaDto } from './create-garantia-hipotecaria.dto';
import { CreateGarantiaPrendariaDto } from './create-garantia-prendaria.dto';
import { CreateGarantiaFiadorDto } from './create-garantia-fiador.dto';
import { CreateGarantiaDocumentariaDto } from './create-garantia-documentaria.dto';

export class CreateGarantiaDto {
  @IsNumber()
  @Type(() => Number)
  solicitudId: number;

  @IsNumber()
  @Type(() => Number)
  tipoGarantiaId: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  valorEstimado?: number;

  @IsOptional()
  @IsEnum(EstadoGarantia)
  estado?: EstadoGarantia;

  @IsOptional()
  @IsDateString()
  fechaConstitucion?: string;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  // Detalles según tipo de garantía (código del catálogo)
  // HIPOTECARIA = código 'HIPOTECARIA'
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateGarantiaHipotecariaDto)
  hipotecaria?: CreateGarantiaHipotecariaDto;

  // PRENDARIA = código 'PRENDARIA'
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateGarantiaPrendariaDto)
  prendaria?: CreateGarantiaPrendariaDto;

  // FIDUCIARIA = código 'FIDUCIARIA'
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateGarantiaFiadorDto)
  fiador?: CreateGarantiaFiadorDto;

  // DOCUMENTARIA = código 'DOCUMENTARIA'
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateGarantiaDocumentariaDto)
  documentaria?: CreateGarantiaDocumentariaDto;

  // Certificación SGR (simple texto/referencia)
  @IsOptional()
  @IsString()
  certificacionSGR?: string;
}
