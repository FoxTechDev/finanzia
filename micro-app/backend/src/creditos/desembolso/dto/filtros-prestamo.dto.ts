import { IsOptional, IsEnum, IsString, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoPrestamo, CategoriaNCB022 } from '../entities/prestamo.entity';

/**
 * DTO para filtrar préstamos
 */
export class FiltrosPrestamoDto {
  // Filtro por estado del préstamo
  @IsOptional()
  @IsEnum(EstadoPrestamo)
  estado?: EstadoPrestamo;

  // Filtro por clasificación NCB-022
  @IsOptional()
  @IsEnum(CategoriaNCB022)
  clasificacion?: CategoriaNCB022;

  // Filtro por ID de clasificación (catálogo)
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  clasificacionPrestamoId?: number;

  // Filtro por ID de estado (catálogo)
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  estadoPrestamoId?: number;

  // Filtro por cliente
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  personaId?: number;

  // Filtro por tipo de crédito
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tipoCreditoId?: number;

  // Filtro por número de crédito
  @IsOptional()
  @IsString()
  numeroCredito?: string;

  // Filtro por DUI del cliente
  @IsOptional()
  @IsString()
  numeroDui?: string;

  // Filtro por nombre del cliente
  @IsOptional()
  @IsString()
  nombreCliente?: string;

  // Filtro por rango de fechas
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  // Filtro por préstamos en mora
  @IsOptional()
  @Type(() => Boolean)
  enMora?: boolean;

  // Filtro por días de mora mínimos
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  diasMoraMinimo?: number;

  // Paginación
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  // Ordenamiento
  @IsOptional()
  @IsString()
  orderBy?: string; // Campo por el cual ordenar (ej: fechaOtorgamiento, montoAutorizado)

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  orderDirection?: 'ASC' | 'DESC';
}
