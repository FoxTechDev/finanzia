import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDireccionDto {
  @IsNumber()
  departamentoId: number;

  @IsNumber()
  municipioId: number;

  @IsNumber()
  distritoId: number;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  detalleDireccion?: string;
}
