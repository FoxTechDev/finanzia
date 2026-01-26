export enum RoleCodes {
  ADMIN = 'ADMIN',
  ASESOR = 'ASESOR',
  COMITE = 'COMITE',
}

export interface Rol {
  id: number;
  codigo: string;
  nombre: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  rol?: Rol | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

/**
 * Mapa de acceso por funcionalidad
 * Define qué roles tienen acceso a cada funcionalidad del sistema
 */
export const FeatureAccess: Record<string, RoleCodes[]> = {
  // Clientes
  'clientes': [RoleCodes.ADMIN, RoleCodes.ASESOR],
  'clientes.crear': [RoleCodes.ADMIN, RoleCodes.ASESOR],
  'clientes.editar': [RoleCodes.ADMIN, RoleCodes.ASESOR],

  // Solicitudes
  'solicitudes': [RoleCodes.ADMIN, RoleCodes.ASESOR, RoleCodes.COMITE],
  'solicitudes.crear': [RoleCodes.ADMIN, RoleCodes.ASESOR],
  'solicitudes.editar': [RoleCodes.ADMIN, RoleCodes.ASESOR],
  'analisis-asesor': [RoleCodes.ADMIN, RoleCodes.ASESOR],

  // Comité
  'comite': [RoleCodes.ADMIN, RoleCodes.COMITE],

  // Desembolsos, Préstamos, Pagos
  'desembolsos': [RoleCodes.ADMIN],
  'prestamos': [RoleCodes.ADMIN],
  'pagos': [RoleCodes.ADMIN],

  // Catálogos
  'catalogos': [RoleCodes.ADMIN],
  'lineas-credito': [RoleCodes.ADMIN],
  'tipos-credito': [RoleCodes.ADMIN],
  'catalogos-garantia': [RoleCodes.ADMIN],
  'clasificacion-prestamos': [RoleCodes.ADMIN],
};
