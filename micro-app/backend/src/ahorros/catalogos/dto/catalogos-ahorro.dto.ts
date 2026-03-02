import {
  IsString,
  IsBoolean,
  IsOptional,
  IsInt,
  MaxLength,
  Min,
} from 'class-validator';

// ===== Estado Cuenta Ahorro =====
export class CreateEstadoCuentaAhorroDto {
  @IsString()
  @MaxLength(20)
  codigo: string;

  @IsString()
  @MaxLength(50)
  nombre: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpdateEstadoCuentaAhorroDto {
  @IsString()
  @MaxLength(20)
  @IsOptional()
  codigo?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  nombre?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

// ===== Tipo Capitalización =====
export class CreateTipoCapitalizacionDto {
  @IsString()
  @MaxLength(20)
  codigo: string;

  @IsString()
  @MaxLength(50)
  nombre: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  dias?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpdateTipoCapitalizacionDto {
  @IsString()
  @MaxLength(20)
  @IsOptional()
  codigo?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  nombre?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  dias?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

// ===== Naturaleza Movimiento =====
export class CreateNaturalezaMovimientoDto {
  @IsString()
  @MaxLength(10)
  codigo: string;

  @IsString()
  @MaxLength(50)
  nombre: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpdateNaturalezaMovimientoDto {
  @IsString()
  @MaxLength(10)
  @IsOptional()
  codigo?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  nombre?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

// ===== Tipo Transacción =====
export class CreateTipoTransaccionAhorroDto {
  @IsString()
  @MaxLength(20)
  codigo: string;

  @IsString()
  @MaxLength(50)
  nombre: string;

  @IsInt()
  @IsOptional()
  naturalezaId?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpdateTipoTransaccionAhorroDto {
  @IsString()
  @MaxLength(20)
  @IsOptional()
  codigo?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  nombre?: string;

  @IsInt()
  @IsOptional()
  naturalezaId?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
