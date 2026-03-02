// ===== Línea de Ahorro =====
export interface LineaAhorro {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  tiposAhorro?: TipoAhorro[];
}

export interface CreateLineaAhorroRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

// ===== Tipo de Ahorro =====
export interface TipoAhorro {
  id: number;
  lineaAhorroId: number;
  lineaAhorro?: LineaAhorro;
  nombre: string;
  descripcion: string | null;
  esPlazo: boolean;
  tasaMin: number;
  tasaMax: number;
  tasaVigente: number;
  plazo: number;
  plazoMin: number;
  plazoMax: number;
  montoAperturaMin: number;
  diasGracia: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTipoAhorroRequest {
  lineaAhorroId: number;
  nombre: string;
  descripcion?: string;
  esPlazo?: boolean;
  tasaMin?: number;
  tasaMax?: number;
  tasaVigente?: number;
  plazo?: number;
  plazoMin?: number;
  plazoMax?: number;
  montoAperturaMin?: number;
  diasGracia?: number;
  activo?: boolean;
}

// ===== Catálogos =====
export interface EstadoCuentaAhorro {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface TipoCapitalizacion {
  id: number;
  codigo: string;
  nombre: string;
  dias: number;
  activo: boolean;
}

export interface NaturalezaMovimiento {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface CreateNaturalezaMovimientoRequest {
  codigo: string;
  nombre: string;
  activo?: boolean;
}

export interface TipoTransaccionAhorro {
  id: number;
  codigo: string;
  nombre: string;
  naturalezaId?: number;
  naturaleza?: NaturalezaMovimiento;
  activo: boolean;
}

export interface CreateTipoTransaccionAhorroRequest {
  codigo: string;
  nombre: string;
  naturalezaId?: number;
  activo?: boolean;
}

export interface CreateEstadoCuentaAhorroRequest {
  codigo: string;
  nombre: string;
  activo?: boolean;
}

export interface CreateTipoCapitalizacionRequest {
  codigo: string;
  nombre: string;
  dias?: number;
  activo?: boolean;
}

// ===== Banco =====
export interface Banco {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

// ===== Cuenta AV Resumen (para select de destino de intereses) =====
export interface CuentaAVResumen {
  id: number;
  noCuenta: string;
  nombreCliente: string;
}

// ===== Cuenta de Ahorro =====
export interface CuentaAhorroResumen {
  id: number;
  noCuenta: string;
  personaId: number;
  nombreCliente: string;
  numeroDui: string;
  tipoAhorro: string;
  lineaAhorro: string;
  estado: string;
  fechaApertura: string;
  saldo: number;
  saldoDisponible: number;
  tasaInteres: number;
  pignorado: boolean;
  monto: number;
  plazo: number;
  fechaVencimiento: string | null;
}

export interface CuentaAhorroDetalle extends CuentaAhorroResumen {
  monto: number;
  plazo: number;
  fechaVencimiento: string | null;
  montoPignorado: number;
  fechaUltMovimiento: string | null;
  saldoInteres: number;
  fechaCancelacion: string | null;
  tipoCapitalizacion: string | null;
  createdAt: string;
  // Campos de destino de intereses (DPF)
  cuentaAhorroDestinoId: number | null;
  cuentaAhorroDestinoNoCuenta: string | null;
  bancoNombre: string | null;
  cuentaBancoNumero: string | null;
  cuentaBancoPropietario: string | null;
}

export interface CreateCuentaAhorroRequest {
  personaId: number;
  tipoAhorroId: number;
  tipoCapitalizacionId?: number;
  fechaApertura: string;
  fechaVencimiento?: string;
  monto: number;
  plazo?: number;
  tasaInteres?: number;
  observacion?: string;
  // Campos de destino de intereses (DPF)
  cuentaAhorroDestinoId?: number;
  bancoId?: number;
  cuentaBancoNumero?: string;
  cuentaBancoPropietario?: string;
}

// ===== Transacción =====
export interface TransaccionAhorro {
  id: number;
  cuentaAhorroId: number;
  fecha: string;
  monto: number;
  naturaleza: NaturalezaMovimiento;
  tipoTransaccion: TipoTransaccionAhorro;
  saldoAnterior: number;
  nuevoSaldo: number;
  observacion: string | null;
  nombreUsuario: string | null;
  createdAt: string;
}

export interface DepositoRequest {
  monto: number;
  fecha?: string;
  observacion?: string;
}

export interface RetiroRequest {
  monto: number;
  fecha?: string;
  observacion?: string;
}

// ===== Plan de Capitalización =====
export interface PlanCapitalizacion {
  id: number;
  cuentaAhorroId: number;
  fechaCapitalizacion: string;
  monto: number;
  procesado: boolean;
  fechaProcesado: string | null;
}

// ===== Beneficiario =====
export interface BeneficiarioCuentaAhorro {
  id: number;
  cuentaAhorroId: number;
  nombre: string;
  apellidos: string;
  fechaNacimiento: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  parentesco: string;
  porcentajeBeneficio: number;
}

export interface CreateBeneficiarioRequest {
  nombre: string;
  apellidos: string;
  fechaNacimiento?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  parentesco: string;
  porcentajeBeneficio: number;
}

// ===== Intereses por Capitalización (Reporte) =====
export interface InteresCapitalizacion {
  fechaCapitalizacion: string;
  noCuenta: string;
  nombrePropietario: string;
  tipoAhorro: string;
  tipoCapitalizacion: string;
  saldoCuenta: number;
  tasa: number;
  montoPagar: number;
}

// ===== Paginación =====
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}
