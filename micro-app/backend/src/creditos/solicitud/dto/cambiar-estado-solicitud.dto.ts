import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';

export class CambiarEstadoSolicitudDto {
  @IsString()
  @MaxLength(50)
  nuevoEstadoCodigo: string; // Código del estado desde la tabla de catálogo

  @IsString()
  @IsOptional()
  observacion?: string;

  // Datos para aprobación
  @IsNumber()
  @IsOptional()
  @Min(0)
  montoAprobado?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  plazoAprobado?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
 
  tasaInteresAprobada?: number;

  // Datos del usuario que realiza el cambio
  @IsNumber()
  @IsOptional()
  usuarioId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  nombreUsuario?: string;

  // Motivo de rechazo (para denegación)
  @IsString()
  @IsOptional()
  motivoRechazo?: string;
}
