import { IsNotEmpty, IsNumber, IsDateString, IsOptional, IsString, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearPagoDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  prestamoId: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  montoPagar: number;

  @IsNotEmpty()
  @IsDateString()
  fechaPago: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observaciones?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  usuarioId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombreUsuario?: string;

  /**
   * Recargo manual aplicado cuando el tipo de crédito tiene aplicaRecargoManual = true
   * Este campo es opcional y editable por el usuario
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'El recargo no puede ser negativo' })
  recargoManual?: number;
}
