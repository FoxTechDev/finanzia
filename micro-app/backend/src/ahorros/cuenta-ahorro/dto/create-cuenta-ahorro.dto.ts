import {
  IsNumber,
  IsOptional,
  IsDateString,
  IsString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateCuentaAhorroDto {
  @IsNumber()
  personaId: number;

  @IsNumber()
  tipoAhorroId: number;

  @IsNumber()
  @IsOptional()
  tipoCapitalizacionId?: number;

  @IsDateString()
  fechaApertura: string;

  @IsDateString()
  @IsOptional()
  fechaVencimiento?: string;

  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  monto: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  plazo?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  tasaInteres?: number;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  observacion?: string;

  @IsNumber()
  @IsOptional()
  cuentaAhorroDestinoId?: number;

  @IsNumber()
  @IsOptional()
  bancoId?: number;

  @IsString()
  @IsOptional()
  cuentaBancoNumero?: string;

  @IsString()
  @IsOptional()
  cuentaBancoPropietario?: string;
}
