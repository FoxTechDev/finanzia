import { IsNotEmpty, IsNumber, IsDateString, Min } from 'class-validator';
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
}
