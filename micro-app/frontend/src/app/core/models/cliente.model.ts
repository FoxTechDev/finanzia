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

export interface Direccion {
  id?: number;
  departamentoId: number;
  municipioId: number;
  distritoId: number;
  detalleDireccion?: string;
  departamento?: Departamento;
  municipio?: Municipio;
  distrito?: Distrito;
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
  referenciasPersonales?: Omit<ReferenciaPersonal, 'id'>[];
  referenciasFamiliares?: Omit<ReferenciaFamiliar, 'id'>[];
}
