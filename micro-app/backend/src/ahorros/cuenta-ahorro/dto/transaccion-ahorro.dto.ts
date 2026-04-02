import { IsNumber, IsOptional, IsDateString, IsString, MaxLength, Min } from 'class-validator';

export class DepositoAhorroDto {
  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  monto: number;

  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  observacion?: string;

  @IsNumber()
  @IsOptional()
  tipoTransaccionId?: number;
}

export class RetiroAhorroDto {
  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  monto: number;

  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  observacion?: string;

  @IsNumber()
  @IsOptional()
  tipoTransaccionId?: number;
}
