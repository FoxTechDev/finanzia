import { IsOptional, IsNumber, IsString, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGarantiaDocumentariaDto {
  @IsNumber()
  @Type(() => Number)
  tipoDocumentoId: number;

  @IsOptional()
  @IsString()
  numeroDocumento?: string;

  @IsOptional()
  @IsDateString()
  fechaEmision?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  montoDocumento?: number;
}
