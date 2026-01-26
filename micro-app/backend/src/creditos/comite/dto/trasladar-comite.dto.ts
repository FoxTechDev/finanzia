import { IsString, IsNumber, IsOptional, MaxLength } from 'class-validator';

export class TrasladarComiteDto {
  @IsString()
  @IsOptional()
  observacionAsesor?: string;

  @IsNumber()
  @IsOptional()
  usuarioId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  nombreUsuario?: string;
}
