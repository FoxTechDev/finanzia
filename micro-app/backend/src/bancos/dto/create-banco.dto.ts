import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateBancoDto {
  @IsString()
  @IsOptional()
  @MaxLength(10)
  codigo?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
