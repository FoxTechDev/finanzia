import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReferenciaPersonalDto {
  @IsString()
  @MaxLength(150)
  nombreReferencia: string;

  @IsString()
  @MaxLength(80)
  relacion: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  telefonoReferencia?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  direccionReferencia?: string;
}
