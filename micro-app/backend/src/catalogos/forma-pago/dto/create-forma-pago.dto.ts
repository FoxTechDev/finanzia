import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateFormaPagoDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  formaPago?: string;
}
