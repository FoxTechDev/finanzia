import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PeriodicidadPago, TipoInteres } from '../entities/prestamo.entity';
import { DeduccionDto, RecargoDto } from './preview-desembolso.dto';

export class CrearDesembolsoDto {
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

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  numeroCuotas?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeduccionDto)
  deducciones: DeduccionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecargoDto)
  recargos: RecargoDto[];

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  fondosPropios: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  transferenciaBancaria: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  usuarioDesembolsoId?: number;

  @IsOptional()
  nombreUsuarioDesembolso?: string;
}
