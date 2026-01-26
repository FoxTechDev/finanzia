import { IsNotEmpty, IsNumber, IsDateString, IsOptional, IsString, Min } from 'class-validator';
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
  observaciones?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  usuarioId?: number;

  @IsOptional()
  @IsString()
  nombreUsuario?: string;
}
