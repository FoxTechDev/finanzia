import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsDateString,
  IsEnum,
  Min,
} from 'class-validator';
import { TipoInteres, PeriodicidadPago } from '../entities/prestamo.entity';

export class ModificarPlanPagoDto {
  @IsNumber()
  prestamoId: number;

  @IsString()
  @IsNotEmpty({ message: 'La observacion es requerida' })
  observacion: string;

  @IsBoolean()
  usarSaldoActual: boolean;

  @IsNumber()
  @Min(0)
  tasaInteres: number;

  @IsNumber()
  @Min(1)
  plazo: number;

  @IsEnum(PeriodicidadPago)
  periodicidadPago: PeriodicidadPago;

  @IsEnum(TipoInteres)
  tipoInteres: TipoInteres;

  @IsOptional()
  @IsNumber()
  @Min(1)
  numeroCuotas?: number;

  @IsDateString()
  fechaPrimeraCuota: string;

  @IsOptional()
  @IsNumber()
  usuarioId?: number;

  @IsOptional()
  @IsString()
  nombreUsuario?: string;
}

export class PreviewPlanPagoDto {
  @IsBoolean()
  usarSaldoActual: boolean;

  @IsNumber()
  @Min(0)
  tasaInteres: number;

  @IsNumber()
  @Min(1)
  plazo: number;

  @IsEnum(PeriodicidadPago)
  periodicidadPago: PeriodicidadPago;

  @IsEnum(TipoInteres)
  tipoInteres: TipoInteres;

  @IsOptional()
  @IsNumber()
  @Min(1)
  numeroCuotas?: number;

  @IsDateString()
  fechaPrimeraCuota: string;
}
