import { IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateMunicipioDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsNumber()
  departamentoId: number;
}
