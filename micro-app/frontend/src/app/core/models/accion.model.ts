// ===== Tipo de Acción (catálogo) =====
export interface TipoAccion {
  id: number;
  nombre: string;
  tasaInteres: number;
  valorUnitario: number;
  activo: boolean;
}

export interface CreateTipoAccionRequest {
  nombre: string;
  tasaInteres: number;
  valorUnitario: number;
  activo?: boolean;
}

// ===== Acción =====
export interface Accion {
  id: number;
  correlativo: string;
  personaId: number;
  persona?: {
    id: number;
    nombre: string;
    apellido: string;
    numeroDui: string;
  };
  tipoAccionId: number;
  tipoAccion?: TipoAccion;
  fechaApertura: string;
  monto: number;
  cantidadAcciones: number;
  tasaInteres: number;
  cuentaAhorroDestinoId: number | null;
  cuentaAhorroDestino?: {
    id: number;
    noCuenta: string;
  };
  bancoId: number | null;
  banco?: {
    id: number;
    nombre: string;
  };
  cuentaBancoNumero: string | null;
  cuentaBancoPropietario: string | null;
  activa: boolean;
  fechaUltimoPagoIntereses: string | null;
  observacion: string | null;
  createdAt: string;
}

export interface CreateAccionRequest {
  personaId: number;
  tipoAccionId: number;
  fechaApertura: string;
  monto: number;
  cuentaAhorroDestinoId?: number;
  bancoId?: number;
  cuentaBancoNumero?: string;
  cuentaBancoPropietario?: string;
  observacion?: string;
}

export interface AccionDividendo {
  id: number;
  accionId: number;
  fecha: string;
  monto: number;
  createdAt: string;
}
