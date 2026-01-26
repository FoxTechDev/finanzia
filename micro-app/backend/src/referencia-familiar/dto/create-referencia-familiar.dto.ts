import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReferenciaFamiliarDto {
  @IsString()
  @MaxLength(150)
  nombreFamiliar: string;

  @IsString()
  @MaxLength(80)
  parentesco: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  telefonoFamiliar?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  direccionFamiliar?: string;
}
