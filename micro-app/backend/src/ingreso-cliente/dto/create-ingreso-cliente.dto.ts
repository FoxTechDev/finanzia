import { IsNumber, IsOptional, IsString, IsPositive, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateIngresoClienteDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  personaId: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  tipoIngresoId: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  monto: number;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
