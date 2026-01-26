import { IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class AnularPagoDto {
  @IsNotEmpty({ message: 'El motivo de anulación es requerido' })
  @IsString()
  @MinLength(10, { message: 'El motivo debe tener al menos 10 caracteres' })
  motivoAnulacion: string;

  @IsOptional()
  @IsNumber()
  usuarioAnulacionId?: number;

  @IsOptional()
  @IsString()
  nombreUsuarioAnulacion?: string;
}
