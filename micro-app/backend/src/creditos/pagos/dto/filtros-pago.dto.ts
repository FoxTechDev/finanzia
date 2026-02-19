import { IsOptional, IsNumber, IsEnum, IsDateString, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoPago } from '../entities/pago.entity';

export class FiltrosPagoDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  prestamoId?: number;

  @IsOptional()
  @IsEnum(EstadoPago)
  estado?: EstadoPago;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @IsOptional()
  @IsString()
  cliente?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
