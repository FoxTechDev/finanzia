import { IsString, MaxLength } from 'class-validator';

export class CreateDepartamentoDto {
  @IsString()
  @MaxLength(100)
  nombre: string;
}
