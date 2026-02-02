import { IsNumber, IsOptional, IsString, IsPositive, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateGastoClienteDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  personaId: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  tipoGastoId: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  monto: number;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
