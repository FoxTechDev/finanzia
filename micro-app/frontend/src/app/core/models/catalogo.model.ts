/**
 * Interface base para todos los catálogos del sistema
 */
export interface CatalogoBase {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  orden?: number;
}

/**
 * Interface para crear o actualizar catálogos
 */
export interface CatalogoDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  orden?: number;
}

/**
 * Configuración para el componente de catálogo genérico
 */
export interface CatalogoConfig {
  titulo: string;
  tituloDialogo: string;
  endpoint: string;
  icono: string;
}

/**
 * Interface para el catálogo de Estados de Préstamo
 * Extiende CatalogoBase con el campo color específico
 */
export interface EstadoPrestamoModel extends CatalogoBase {
  color: string;
}
