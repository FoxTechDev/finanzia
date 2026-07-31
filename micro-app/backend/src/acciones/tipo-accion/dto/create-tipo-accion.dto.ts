import { IsString, IsBoolean, IsOptional, IsNumber, MaxLength } from 'class-validator';

export class CreateTipoAccionDto {
  @IsString()
  @MaxLength(50)
  nombre: string;

  @IsNumber()
  @IsOptional()
  tasaInteres?: number;

  @IsNumber()
  valorUnitario: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
