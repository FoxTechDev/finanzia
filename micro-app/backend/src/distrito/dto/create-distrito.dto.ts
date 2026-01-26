import { IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateDistritoDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsNumber()
  municipioId: number;
}
