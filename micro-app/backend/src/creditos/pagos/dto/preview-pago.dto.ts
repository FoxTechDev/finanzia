import { IsNotEmpty, IsNumber, IsDateString, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PreviewPagoDto {
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
