export interface Departamento {
  id: number;
  nombre: string;
}

export interface Municipio {
  id: number;
  nombre: string;
  departamentoId: number;
  departamento?: Departamento;
}

export interface Distrito {
  id: number;
  nombre: string;
  municipioId: number;
  municipio?: Municipio;
}

export interface TipoVivienda {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Direccion {
  id?: number;
  departamentoId: number;
  municipioId: number;
  distritoId: number;
  detalleDireccion?: string;
  tipoVivienda?: string; // Mantener compatibilidad con datos antiguos
  tipoViviendaId?: number; // Nuevo campo que apunta al catálogo
  tiempoResidenciaAnios?: number;
  departamento?: Departamento;
  municipio?: Municipio;
  distrito?: Distrito;
  tipoViviendaRelacion?: TipoVivienda;
}

export interface ActividadEconomica {
  id?: number;
  tipoActividad: string;
  nombreEmpresa?: string;
  cargoOcupacion?: string;
  ingresosMensuales?: number;
  departamentoId: number;
  municipioId: number;
  distritoId: number;
  detalleDireccion?: string;
  latitud?: number;
  longitud?: number;
  departamento?: Departamento;
  municipio?: Municipio;
  distrito?: Distrito;
}

export interface ReferenciaPersonal {
  id?: number;
  personaId?: number;
  nombreReferencia: string;
  relacion: string;
  telefonoReferencia?: string;
  direccionReferencia?: string;
}

export interface ReferenciaFamiliar {
  id?: number;
  personaId?: number;
  nombreFamiliar: string;
  parentesco: string;
  telefonoFamiliar?: string;
  direccionFamiliar?: string;
}

// Tipos de Ingreso
export interface TipoIngreso {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

// Tipos de Gasto
export interface TipoGasto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

// Ingreso del Cliente
export interface IngresoCliente {
  id?: number;
  personaId?: number;
  tipoIngresoId: number;
  monto: number;
  descripcion?: string;
  tipoIngreso?: TipoIngreso;
}

// Gasto del Cliente
export interface GastoCliente {
  id?: number;
  personaId?: number;
  tipoGastoId: number;
  monto: number;
  descripcion?: string;
  tipoGasto?: TipoGasto;
}

// Dependencia Familiar
export interface DependenciaFamiliar {
  id?: number;
  personaId?: number;
  nombreDependiente: string;
  parentesco: string;
  edad?: number;
  trabaja: boolean;
  estudia: boolean;
  observaciones?: string;
}

export type Sexo = 'Masculino' | 'Femenino' | 'Otro';

export interface Persona {
  id?: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  sexo?: Sexo;
  nacionalidad: string;
  estadoCivil?: string;
  telefono?: string;
  correoElectronico?: string;
  numeroDui: string;
  fechaEmisionDui: string;
  lugarEmisionDui: string;
  direccion?: Direccion;
  actividadEconomica?: ActividadEconomica;
  referenciasPersonales?: ReferenciaPersonal[];
  referenciasFamiliares?: ReferenciaFamiliar[];
  ingresos?: IngresoCliente[];
  gastos?: GastoCliente[];
  dependenciasFamiliares?: DependenciaFamiliar[];
}

export interface CreatePersonaRequest {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  sexo?: Sexo;
  nacionalidad: string;
  estadoCivil?: string;
  telefono?: string;
  correoElectronico?: string;
  numeroDui: string;
  fechaEmisionDui: string;
  lugarEmisionDui: string;
  direccion?: Omit<Direccion, 'id' | 'departamento' | 'municipio' | 'distrito'>;
  actividadEconomica?: Omit<ActividadEconomica, 'id' | 'departamento' | 'municipio' | 'distrito'>;
  referenciasPersonales?: Omit<ReferenciaPersonal, 'id' | 'personaId'>[];
  referenciasFamiliares?: Omit<ReferenciaFamiliar, 'id' | 'personaId'>[];
  ingresos?: Omit<IngresoCliente, 'id' | 'personaId' | 'tipoIngreso'>[];
  gastos?: Omit<GastoCliente, 'id' | 'personaId' | 'tipoGasto'>[];
  dependenciasFamiliares?: Omit<DependenciaFamiliar, 'id' | 'personaId'>[];
}
