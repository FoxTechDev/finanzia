// Solo se mantiene el enum de estado de garantía
// Los tipos de garantía, inmueble y documento ahora son tablas de catálogo

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
