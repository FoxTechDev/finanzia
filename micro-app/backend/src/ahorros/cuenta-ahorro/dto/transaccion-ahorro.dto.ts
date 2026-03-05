import { IsNumber, IsOptional, IsDateString, IsString, MaxLength } from 'class-validator';

export class DepositoAhorroDto {
  @IsNumber()
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
