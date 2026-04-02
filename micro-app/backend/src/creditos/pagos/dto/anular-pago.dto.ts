import { IsNotEmpty, IsNumber, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class AnularPagoDto {
  @IsNotEmpty({ message: 'El motivo de anulación es requerido' })
  @IsString()
  @MinLength(10, { message: 'El motivo debe tener al menos 10 caracteres' })
  @MaxLength(1000)
  motivoAnulacion: string;

  @IsOptional()
  @IsNumber()
  usuarioAnulacionId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombreUsuarioAnulacion?: string;
}
