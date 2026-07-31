import { IsString, IsNumber, IsOptional, MaxLength } from 'class-validator';

export class CreateAccionDto {
  @IsNumber()
  personaId: number;

  @IsNumber()
  tipoAccionId: number;

  @IsString()
  fechaApertura: string;

  @IsNumber()
  monto: number;

  @IsNumber()
  @IsOptional()
  cuentaAhorroDestinoId?: number;

  @IsNumber()
  @IsOptional()
  bancoId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  cuentaBancoNumero?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  cuentaBancoPropietario?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  observacion?: string;
}
