// Enums que se mantienen
export enum EstadoGarantia {
  PENDIENTE = 'PENDIENTE',
  CONSTITUIDA = 'CONSTITUIDA',
  LIBERADA = 'LIBERADA',
  EJECUTADA = 'EJECUTADA',
}

export enum RecomendacionAsesor {
  APROBAR = 'APROBAR',
  RECHAZAR = 'RECHAZAR',
  OBSERVAR = 'OBSERVAR',
}

// Labels para UI de enums que se mantienen
export const ESTADO_GARANTIA_LABELS: Record<EstadoGarantia, string> = {
  [EstadoGarantia.PENDIENTE]: 'Pendiente',
  [EstadoGarantia.CONSTITUIDA]: 'Constituida',
  [EstadoGarantia.LIBERADA]: 'Liberada',
  [EstadoGarantia.EJECUTADA]: 'Ejecutada',
};

export const RECOMENDACION_ASESOR_LABELS: Record<RecomendacionAsesor, string> = {
  [RecomendacionAsesor.APROBAR]: 'Aprobar',
  [RecomendacionAsesor.RECHAZAR]: 'Rechazar',
  [RecomendacionAsesor.OBSERVAR]: 'Observar',
};

// Interfaces para catálogos (tablas en BD)
export interface TipoGarantiaCatalogo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TipoInmuebleCatalogo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TipoDocumentoCatalogo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Interfaces para crear/actualizar catálogos
export interface CreateTipoGarantiaCatalogoRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface CreateTipoInmuebleRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface CreateTipoDocumentoRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

// Interfaces de garantías específicas
export interface GarantiaHipotecaria {
  id?: number;
  garantiaId?: number;
  tipoInmuebleId: number;
  tipoInmuebleEntity?: TipoInmuebleCatalogo;
  direccion?: string;
  departamentoId?: number;
  departamento?: any; // Departamento entity
  municipioId?: number;
  municipio?: any; // Municipio entity
  distritoId?: number;
  distrito?: any; // Distrito entity
  numeroRegistro?: string;
  folioRegistro?: string;
  libroRegistro?: string;
  areaTerreno?: number;
  areaConstruccion?: number;
  valorPericial?: number;
  nombrePerito?: string;
  fechaAvaluo?: string;
}

export interface GarantiaPrendaria {
  id?: number;
  garantiaId?: number;
  tipoBien?: string;
  descripcionBien?: string;
  marca?: string;
  modelo?: string;
  serie?: string;
  placa?: string;
  anio?: number;
  valorPericial?: number;
  ubicacionBien?: string;
}

export interface GarantiaFiador {
  id?: number;
  garantiaId?: number;
  personaFiadorId: number;
  personaFiador?: any; // Persona completa
  parentesco?: string;
  ocupacion?: string;
  ingresoMensual?: number;
  direccionLaboral?: string;
  telefonoLaboral?: string;
  lugarTrabajo?: string;
}

export interface GarantiaDocumentaria {
  id?: number;
  garantiaId?: number;
  tipoDocumentoId: number;
  tipoDocumentoEntity?: TipoDocumentoCatalogo;
  numeroDocumento?: string;
  fechaEmision?: string;
  montoDocumento?: number;
}

export interface Garantia {
  id?: number;
  solicitudId: number;
  tipoGarantiaId: number;
  tipoGarantiaCatalogo?: TipoGarantiaCatalogo;
  descripcion?: string;
  valorEstimado?: number;
  estado?: EstadoGarantia;
  fechaConstitucion?: string;
  fechaVencimiento?: string;
  observaciones?: string;
  createdAt?: string;
  updatedAt?: string;
  // Detalles según tipo
  hipotecaria?: GarantiaHipotecaria;
  prendaria?: GarantiaPrendaria;
  fiador?: GarantiaFiador;
  documentaria?: GarantiaDocumentaria;
}

// DTOs para crear/actualizar garantías
export interface CreateGarantiaHipotecariaRequest {
  tipoInmuebleId: number;
  direccion?: string;
  departamentoId?: number;
  municipioId?: number;
  distritoId?: number;
  numeroRegistro?: string;
  folioRegistro?: string;
  libroRegistro?: string;
  areaTerreno?: number;
  areaConstruccion?: number;
  valorPericial?: number;
  nombrePerito?: string;
  fechaAvaluo?: string;
}

export interface CreateGarantiaPrendariaRequest {
  tipoBien?: string;
  descripcionBien?: string;
  marca?: string;
  modelo?: string;
  serie?: string;
  placa?: string;
  anio?: number;
  valorPericial?: number;
  ubicacionBien?: string;
}

export interface CreateGarantiaFiadorRequest {
  personaFiadorId: number;
  parentesco?: string;
  ocupacion?: string;
  ingresoMensual?: number;
  direccionLaboral?: string;
  telefonoLaboral?: string;
  lugarTrabajo?: string;
}

export interface CreateGarantiaDocumentariaRequest {
  tipoDocumentoId: number;
  numeroDocumento?: string;
  fechaEmision?: string;
  montoDocumento?: number;
}

export interface CreateGarantiaRequest {
  solicitudId: number;
  tipoGarantiaId: number;
  descripcion?: string;
  valorEstimado?: number;
  estado?: EstadoGarantia;
  fechaConstitucion?: string;
  fechaVencimiento?: string;
  observaciones?: string;
  hipotecaria?: CreateGarantiaHipotecariaRequest;
  prendaria?: CreateGarantiaPrendariaRequest;
  fiador?: CreateGarantiaFiadorRequest;
  documentaria?: CreateGarantiaDocumentariaRequest;
  certificacionSGR?: string;
}

export interface UpdateGarantiaRequest extends Partial<Omit<CreateGarantiaRequest, 'solicitudId'>> {}

export interface CoberturaGarantia {
  totalGarantias: number;
  montoSolicitado: number;
  cobertura: number;
}

// DTO para análisis del asesor
export interface UpdateAnalisisAsesorRequest {
  analisisAsesor?: string;
  recomendacionAsesor?: RecomendacionAsesor;
  capacidadPago?: number;
  antecedentesCliente?: string;
}
