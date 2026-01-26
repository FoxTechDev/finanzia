import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PeriodicidadPago, TipoInteres } from '../entities/prestamo.entity';
import { TipoCalculo } from '../entities/tipo-deduccion.entity';

export class DeduccionDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  tipoDeduccionId?: number;

  @IsOptional()
  nombre?: string;

  @IsEnum(TipoCalculo)
  tipoCalculo: TipoCalculo;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @Transform(({ value }) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  })
  valor: number;
}

export class RecargoDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  tipoRecargoId?: number;

  @IsOptional()
  nombre?: string;

  @IsEnum(TipoCalculo)
  tipoCalculo: TipoCalculo;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @Transform(({ value }) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  })
  valor: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @Transform(({ value }) => {
    if (value == null) return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : 1;
  })
  aplicaDesde?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => {
    if (value == null) return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  })
  aplicaHasta?: number;
}

export class PreviewDesembolsoDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  solicitudId: number;

  @IsEnum(PeriodicidadPago)
  periodicidadPago: PeriodicidadPago;

  @IsEnum(TipoInteres)
  tipoInteres: TipoInteres;

  @IsDateString()
  fechaPrimeraCuota: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeduccionDto)
  deducciones: DeduccionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecargoDto)
  recargos: RecargoDto[];
}
