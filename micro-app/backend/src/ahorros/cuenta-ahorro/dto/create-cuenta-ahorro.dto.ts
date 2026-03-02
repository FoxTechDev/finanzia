import {
  IsNumber,
  IsOptional,
  IsDateString,
  IsString,
  MaxLength,
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
  monto: number;

  @IsNumber()
  @IsOptional()
  plazo?: number;

  @IsNumber()
  @IsOptional()
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
