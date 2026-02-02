export interface LineaCredito {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  tiposCredito?: TipoCredito[];
}

export interface CreateLineaCreditoRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface TipoCredito {
  id: number;
  codigo: string; // Generado automáticamente por el backend
  nombre: string;
  descripcion: string | null;
  lineaCreditoId: number;
  lineaCredito?: LineaCredito;
  tasaInteres: number;
  tasaInteresMinima: number;
  tasaInteresMaxima: number;
  tasaInteresMoratorio: number;
  montoMinimo: number;
  montoMaximo: number;
  plazoMinimo: number;
  plazoMaximo: number;
  periodicidadPago: string;
  tipoCuota: string;
  diasGracia: number;
  requiereGarantia: boolean;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTipoCreditoRequest {
  // El código se genera automáticamente en el backend
  nombre: string;
  descripcion?: string;
  lineaCreditoId: number;
  tasaInteres: number;
  tasaInteresMinima: number;
  tasaInteresMaxima: number;
  tasaInteresMoratorio: number;
  montoMinimo: number;
  montoMaximo: number;
  plazoMinimo: number;
  plazoMaximo: number;
  periodicidadPago?: string;
  tipoCuota?: string;
  diasGracia?: number;
  requiereGarantia?: boolean;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta?: string;
  activo?: boolean;
}

// Interface para el estado de solicitud que viene del catálogo en el backend
export interface EstadoSolicitud {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  orden?: number;
}

export enum DestinoCredito {
  CAPITAL_TRABAJO = 'CAPITAL_TRABAJO',
  ACTIVO_FIJO = 'ACTIVO_FIJO',
  CONSUMO_PERSONAL = 'CONSUMO_PERSONAL',
  VIVIENDA_NUEVA = 'VIVIENDA_NUEVA',
  VIVIENDA_USADA = 'VIVIENDA_USADA',
  MEJORA_VIVIENDA = 'MEJORA_VIVIENDA',
  CONSOLIDACION_DEUDAS = 'CONSOLIDACION_DEUDAS',
  EDUCACION = 'EDUCACION',
  SALUD = 'SALUD',
  VEHICULO = 'VEHICULO',
  OTRO = 'OTRO',
}

import { Garantia, RecomendacionAsesor } from './garantia.model';
import { CatalogoBase } from './catalogo.model';

// Interface para Periodicidad de Pago del catálogo
export interface PeriodicidadPagoCatalogo extends CatalogoBase {}

export interface Solicitud {
  id: number;
  numeroSolicitud: string;
  personaId: number;
  persona?: {
    id: number;
    nombre: string;
    apellido: string;
    numeroDui: string;
  };
  lineaCreditoId: number;
  lineaCredito?: LineaCredito;
  tipoCreditoId: number;
  tipoCredito?: TipoCredito;
  montoSolicitado: number;
  plazoSolicitado: number;
  tasaInteresPropuesta: number;
  periodicidadPagoId?: number;
  periodicidadPago?: PeriodicidadPagoCatalogo;
  tipoInteres?: TipoInteres; // Tipo de interés para el plan de pago
  fechaDesdePago?: string | null;
  fechaHastaPago?: string | null;
  destinoCredito: DestinoCredito;
  descripcionDestino: string | null;
  estadoId: number;
  estado?: EstadoSolicitud; // Objeto completo del estado desde el catálogo
  montoAprobado: number | null;
  plazoAprobado: number | null;
  tasaInteresAprobada: number | null;
  fechaSolicitud: string;
  fechaAnalisis: string | null;
  fechaAprobacion: string | null;
  fechaDenegacion: string | null;
  fechaVencimiento: string | null;
  analistaId: number | null;
  nombreAnalista: string | null;
  aprobadorId: number | null;
  nombreAprobador: string | null;
  observaciones: string | null;
  motivoRechazo: string | null;
  scoreCredito: number | null;
  categoriaRiesgo: string | null;
  // Campos de análisis del asesor
  analisisAsesor: string | null;
  recomendacionAsesor: RecomendacionAsesor | null;
  capacidadPago: number | null;
  antecedentesCliente: string | null;
  // Campos del Comité de Crédito
  fechaTrasladoComite: string | null;
  fechaDecisionComite: string | null;
  observacionesComite: string | null;
  // Garantías
  garantias?: Garantia[];
  createdAt: Date;
  updatedAt: Date;
  historial?: SolicitudHistorial[];
}

export interface CreateSolicitudRequest {
  personaId: number;
  lineaCreditoId: number;
  tipoCreditoId: number;
  montoSolicitado: number;
  plazoSolicitado: number;
  tasaInteresPropuesta: number;
  periodicidadPagoId?: number;
  tipoInteres?: TipoInteres; // Tipo de interés para el plan de pago
  fechaDesdePago?: string;
  fechaHastaPago?: string;
  destinoCredito: DestinoCredito;
  descripcionDestino?: string;
  fechaSolicitud: string;
}

export interface CambiarEstadoSolicitudRequest {
  nuevoEstadoId: number; // ID del estado desde el catálogo
  observacion?: string;
  motivoRechazo?: string;
  montoAprobado?: number;
  plazoAprobado?: number;
  tasaInteresAprobada?: number;
  usuarioId?: number;
  nombreUsuario?: string;
}

export interface SolicitudHistorial {
  id: number;
  solicitudId: number;
  estadoAnteriorId: number;
  estadoAnterior?: EstadoSolicitud; // Objeto completo del estado
  estadoNuevoId: number;
  estadoNuevo?: EstadoSolicitud; // Objeto completo del estado
  observacion: string | null;
  usuarioId: number | null;
  nombreUsuario: string | null;
  fechaCambio: Date;
}

export interface SolicitudEstadisticas {
  estadoId: number;
  estado?: EstadoSolicitud;
  cantidad: number;
  montoTotal: number;
}

// Códigos de estados conocidos para validaciones de flujo
export const CODIGO_ESTADO_SOLICITUD = {
  REGISTRADA: 'REGISTRADA',
  ANALIZADA: 'ANALIZADA',
  EN_COMITE: 'EN_COMITE',
  OBSERVADA: 'OBSERVADA',
  DENEGADA: 'DENEGADA',
  APROBADA: 'APROBADA',
  DESEMBOLSADA: 'DESEMBOLSADA',
} as const;

// Tipos para el Comité de Crédito
export enum TipoDecisionComite {
  AUTORIZADA = 'AUTORIZADA',
  DENEGADA = 'DENEGADA',
  OBSERVADA = 'OBSERVADA',
}

export const TIPO_DECISION_COMITE_LABELS: Record<TipoDecisionComite, string> = {
  [TipoDecisionComite.AUTORIZADA]: 'Autorizada',
  [TipoDecisionComite.DENEGADA]: 'Denegada',
  [TipoDecisionComite.OBSERVADA]: 'Observada',
};

export interface DecisionComite {
  id: number;
  solicitudId: number;
  solicitud?: Solicitud;
  tipoDecision: TipoDecisionComite;
  observaciones: string | null;
  condicionesEspeciales: string | null;
  montoAutorizado: number | null;
  plazoAutorizado: number | null;
  tasaAutorizada: number | null;
  usuarioId: number | null;
  nombreUsuario: string | null;
  fechaDecision: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrasladarComiteRequest {
  observacionAsesor?: string;
  usuarioId?: number;
  nombreUsuario?: string;
}

export interface DecisionComiteRequest {
  tipoDecision: TipoDecisionComite;
  observaciones?: string;
  condicionesEspeciales?: string;
  montoAutorizado?: number;
  plazoAutorizado?: number;
  tasaAutorizada?: number;
  usuarioId?: number;
  nombreUsuario?: string;
}

export interface ComiteEstadisticas {
  totalPendientes: number;
  montoTotal: number;
}

export const DESTINO_CREDITO_LABELS: Record<DestinoCredito, string> = {
  [DestinoCredito.CAPITAL_TRABAJO]: 'Capital de Trabajo',
  [DestinoCredito.ACTIVO_FIJO]: 'Activo Fijo',
  [DestinoCredito.CONSUMO_PERSONAL]: 'Consumo Personal',
  [DestinoCredito.VIVIENDA_NUEVA]: 'Vivienda Nueva',
  [DestinoCredito.VIVIENDA_USADA]: 'Vivienda Usada',
  [DestinoCredito.MEJORA_VIVIENDA]: 'Mejora de Vivienda',
  [DestinoCredito.CONSOLIDACION_DEUDAS]: 'Consolidación de Deudas',
  [DestinoCredito.EDUCACION]: 'Educación',
  [DestinoCredito.SALUD]: 'Salud',
  [DestinoCredito.VEHICULO]: 'Vehículo',
  [DestinoCredito.OTRO]: 'Otro',
};

// ============================================
// MODELOS DE DESEMBOLSO Y PRÉSTAMOS
// ============================================

export enum TipoInteres {
  FLAT = 'FLAT',
  AMORTIZADO = 'AMORTIZADO',
}

export enum PeriodicidadPago {
  DIARIO = 'DIARIO',
  SEMANAL = 'SEMANAL',
  QUINCENAL = 'QUINCENAL',
  MENSUAL = 'MENSUAL',
  TRIMESTRAL = 'TRIMESTRAL',
  SEMESTRAL = 'SEMESTRAL',
  ANUAL = 'ANUAL',
  AL_VENCIMIENTO = 'AL_VENCIMIENTO',
}

export enum EstadoPrestamo {
  VIGENTE = 'VIGENTE',
  MORA = 'MORA',
  CANCELADO = 'CANCELADO',
  CASTIGADO = 'CASTIGADO',
}

export enum CategoriaNCB022 {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
}

export enum EstadoCuota {
  PENDIENTE = 'PENDIENTE',
  PAGADA = 'PAGADA',
  PARCIAL = 'PARCIAL',
  MORA = 'MORA',
}

export enum TipoCalculo {
  FIJO = 'FIJO',
  PORCENTAJE = 'PORCENTAJE',
}

export const TIPO_INTERES_LABELS: Record<TipoInteres, string> = {
  [TipoInteres.FLAT]: 'Flat (Microcréditos)',
  [TipoInteres.AMORTIZADO]: 'Amortizado (Sistema Francés)',
};

export const PERIODICIDAD_PAGO_LABELS: Record<PeriodicidadPago, string> = {
  [PeriodicidadPago.DIARIO]: 'Diario',
  [PeriodicidadPago.SEMANAL]: 'Semanal',
  [PeriodicidadPago.QUINCENAL]: 'Quincenal',
  [PeriodicidadPago.MENSUAL]: 'Mensual',
  [PeriodicidadPago.TRIMESTRAL]: 'Trimestral',
  [PeriodicidadPago.SEMESTRAL]: 'Semestral',
  [PeriodicidadPago.ANUAL]: 'Anual',
  [PeriodicidadPago.AL_VENCIMIENTO]: 'Al Vencimiento',
};

export const ESTADO_PRESTAMO_LABELS: Record<EstadoPrestamo, string> = {
  [EstadoPrestamo.VIGENTE]: 'Vigente',
  [EstadoPrestamo.MORA]: 'En Mora',
  [EstadoPrestamo.CANCELADO]: 'Cancelado',
  [EstadoPrestamo.CASTIGADO]: 'Castigado',
};

export const CATEGORIA_NCB022_LABELS: Record<CategoriaNCB022, string> = {
  [CategoriaNCB022.A]: 'A - Normal',
  [CategoriaNCB022.B]: 'B - Subnormal',
  [CategoriaNCB022.C]: 'C - Deficiente',
  [CategoriaNCB022.D]: 'D - Difícil Recuperación',
  [CategoriaNCB022.E]: 'E - Irrecuperable',
};

export const ESTADO_CUOTA_LABELS: Record<EstadoCuota, string> = {
  [EstadoCuota.PENDIENTE]: 'Pendiente',
  [EstadoCuota.PAGADA]: 'Pagada',
  [EstadoCuota.PARCIAL]: 'Pago Parcial',
  [EstadoCuota.MORA]: 'En Mora',
};

export const TIPO_CALCULO_LABELS: Record<TipoCalculo, string> = {
  [TipoCalculo.FIJO]: 'Monto Fijo',
  [TipoCalculo.PORCENTAJE]: 'Porcentaje',
};

// Interfaces para Catálogos
export interface TipoDeduccion {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  tipoCalculoDefault: TipoCalculo;
  valorDefault: number;
  activo: boolean;
  cancelacionPrestamo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TipoRecargo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  tipoCalculoDefault: TipoCalculo;
  valorDefault: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTipoDeduccionRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipoCalculoDefault: TipoCalculo;
  valorDefault: number;
  activo?: boolean;
  cancelacionPrestamo?: boolean;
}

export interface CreateTipoRecargoRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipoCalculoDefault: TipoCalculo;
  valorDefault: number;
  activo?: boolean;
}

// Interfaces para Préstamo
export interface Prestamo {
  id: number;
  solicitudId: number;
  solicitud?: Solicitud;
  personaId: number;
  persona?: {
    id: number;
    nombre: string;
    apellido: string;
    numeroDui: string;
  };
  numeroCredito: string;
  tipoCreditoId: number;
  tipoCredito?: TipoCredito;
  montoAutorizado: number;
  montoDesembolsado: number;
  plazoAutorizado: number;
  tasaInteres: number;
  tasaInteresMoratorio: number;
  tipoInteres: TipoInteres;
  periodicidadPago: PeriodicidadPago;
  cuotaNormal: number;
  cuotaTotal: number;
  numeroCuotas: number;
  totalInteres: number;
  totalRecargos: number;
  totalPagar: number;
  saldoCapital: number;
  saldoInteres: number;
  capitalMora: number;
  interesMora: number;
  diasMora: number;
  fechaOtorgamiento: string;
  fechaPrimeraCuota: string;
  fechaVencimiento: string;
  fechaUltimoPago: string | null;
  fechaCancelacion: string | null;
  categoriaNCB022: CategoriaNCB022;
  estado: EstadoPrestamo;
  refinanciamiento: boolean;
  usuarioDesembolsoId: number | null;
  nombreUsuarioDesembolso: string | null;
  createdAt: Date;
  updatedAt: Date;
  planPago?: PlanPago[];
  deducciones?: DeduccionPrestamo[];
  recargos?: RecargoPrestamo[];
}

// Interface para préstamos activos (con saldo total para refinanciamiento)
export interface PrestamoActivo {
  id: number;
  numeroCredito: string;
  estado: EstadoPrestamo;
  categoriaNCB022: CategoriaNCB022;
  cliente: {
    id: number;
    nombreCompleto: string;
    numeroDui: string;
  };
  tipoCredito: {
    id: number;
    nombre: string;
  };
  montoAutorizado: number;
  montoDesembolsado: number;
  saldoCapital: number;
  diasMora: number;
  fechaOtorgamiento: string;
  fechaVencimiento: string;
  proximaCuota: {
    numeroCuota: number;
    fechaVencimiento: string;
    cuotaTotal: number;
  } | null;
  saldoTotal: number;
}

export interface PlanPago {
  id: number;
  prestamoId: number;
  numeroCuota: number;
  fechaVencimiento: string;
  capital: number;
  interes: number;
  recargos: number;
  cuotaTotal: number;
  saldoCapital: number;
  capitalPagado: number;
  interesPagado: number;
  recargosPagado: number;
  fechaPago: string | null;
  diasMora: number;
  interesMoratorio: number;
  interesMoratorioPagado: number;
  estado: EstadoCuota;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeduccionPrestamo {
  id: number;
  prestamoId: number;
  tipoDeduccionId: number | null;
  tipoDeduccion?: TipoDeduccion;
  nombre: string;
  tipoCalculo: TipoCalculo;
  valor: number;
  montoCalculado: number;
  prestamoACancelarId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecargoPrestamo {
  id: number;
  prestamoId: number;
  tipoRecargoId: number | null;
  tipoRecargo?: TipoRecargo;
  nombre: string;
  tipoCalculo: TipoCalculo;
  valor: number;
  montoCalculado: number;
  aplicaDesde: number;
  aplicaHasta: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaces para DTOs de Desembolso
export interface DeduccionDesembolsoDto {
  tipoDeduccionId?: number;
  nombre?: string;
  tipoCalculo: TipoCalculo;
  valor: number;
  prestamoACancelarId?: number;
}

export interface RecargoDesembolsoDto {
  tipoRecargoId?: number;
  nombre?: string;
  tipoCalculo: TipoCalculo;
  valor: number;
  aplicaDesde?: number;
  aplicaHasta?: number;
}

export interface PreviewDesembolsoRequest {
  solicitudId: number;
  periodicidadPago: PeriodicidadPago;
  tipoInteres: TipoInteres;
  fechaPrimeraCuota: string;
  numeroCuotas?: number;
  deducciones: DeduccionDesembolsoDto[];
  recargos: RecargoDesembolsoDto[];
}

export interface CrearDesembolsoRequest extends PreviewDesembolsoRequest {
  usuarioDesembolsoId?: number;
  nombreUsuarioDesembolso?: string;
}

export interface DeduccionCalculada {
  nombre: string;
  tipoDeduccionId?: number;
  tipoCalculo: TipoCalculo;
  valor: number;
  monto: number;
}

export interface CuotaPlanPago {
  numeroCuota: number;
  fechaVencimiento: string;
  capital: number;
  interes: number;
  recargos: number;
  cuotaTotal: number;
  saldoCapital: number;
}

export interface PreviewDesembolsoResponse {
  // Información de la solicitud
  solicitudId: number;
  numeroSolicitud: string;
  personaId: number;
  nombreCliente: string;
  tipoCreditoId: number;
  nombreTipoCredito: string;

  // Montos
  montoAutorizado: number;
  deducciones: DeduccionCalculada[];
  totalDeducciones: number;
  montoDesembolsado: number;

  // Recargos
  recargos: {
    nombre: string;
    montoPorCuota: number;
  }[];
  totalRecargosPorCuota: number;

  // Cuotas
  cuotaNormal: number;
  cuotaTotal: number;
  numeroCuotas: number;

  // Totales
  totalInteres: number;
  totalRecargos: number;
  totalAPagar: number;

  // Plan de pago
  planPago: CuotaPlanPago[];

  // Fechas
  fechaOtorgamiento: string;
  fechaPrimeraCuota: string;
  fechaVencimiento: string;
}

// ============================================
// CLASIFICACIÓN DE PRÉSTAMOS NCB-022
// ============================================

export interface ClasificacionPrestamo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  diasMoraMinimo: number;
  diasMoraMaximo: number | null;
  porcentajeProvision: number;
  activo: boolean;
  orden: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClasificacionPrestamoRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  diasMoraMinimo: number;
  diasMoraMaximo?: number;
  porcentajeProvision: number;
  activo?: boolean;
  orden?: number;
}

export interface UpdateClasificacionPrestamoRequest {
  nombre?: string;
  descripcion?: string;
  diasMoraMinimo?: number;
  diasMoraMaximo?: number;
  porcentajeProvision?: number;
  activo?: boolean;
  orden?: number;
}

// ============================================
// MODELOS DE PAGOS DE PRÉSTAMOS
// ============================================

export enum TipoPago {
  CUOTA_COMPLETA = 'CUOTA_COMPLETA',
  PAGO_PARCIAL = 'PAGO_PARCIAL',
  PAGO_ADELANTADO = 'PAGO_ADELANTADO',
  CANCELACION_TOTAL = 'CANCELACION_TOTAL',
}

export enum EstadoPago {
  APLICADO = 'APLICADO',
  ANULADO = 'ANULADO',
}

export const TIPO_PAGO_LABELS: Record<TipoPago, string> = {
  [TipoPago.CUOTA_COMPLETA]: 'Cuota Completa',
  [TipoPago.PAGO_PARCIAL]: 'Pago Parcial',
  [TipoPago.PAGO_ADELANTADO]: 'Pago Adelantado',
  [TipoPago.CANCELACION_TOTAL]: 'Cancelación Total',
};

export const ESTADO_PAGO_LABELS: Record<EstadoPago, string> = {
  [EstadoPago.APLICADO]: 'Aplicado',
  [EstadoPago.ANULADO]: 'Anulado',
};

export interface PagoDetalleCuota {
  id: number;
  pagoId: number;
  planPagoId: number;
  numeroCuota: number;
  capitalAplicado: number;
  interesAplicado: number;
  recargosAplicado: number;
  interesMoratorioAplicado: number;
  estadoCuotaAnterior: EstadoCuota;
  estadoCuotaPosterior: EstadoCuota;
  capitalPagadoAnterior: number;
  interesPagadoAnterior: number;
  recargosPagadoAnterior: number;
  interesMoratorioPagadoAnterior: number;
  diasMoraAnterior: number;
  createdAt: Date;
}

export interface Pago {
  id: number;
  prestamoId: number;
  prestamo?: Prestamo;
  numeroPago: string;
  fechaPago: string;
  fechaRegistro: string;
  montoPagado: number;
  capitalAplicado: number;
  interesAplicado: number;
  recargosAplicado: number;
  interesMoratorioAplicado: number;
  recargoManualAplicado: number;
  saldoCapitalAnterior: number;
  saldoInteresAnterior: number;
  capitalMoraAnterior: number;
  interesMoraAnterior: number;
  diasMoraAnterior: number;
  saldoCapitalPosterior: number;
  saldoInteresPosterior: number;
  tipoPago: TipoPago;
  estado: EstadoPago;
  fechaAnulacion: string | null;
  motivoAnulacion: string | null;
  usuarioAnulacionId: number | null;
  nombreUsuarioAnulacion: string | null;
  usuarioId: number | null;
  nombreUsuario: string | null;
  observaciones: string | null;
  createdAt: Date;
  updatedAt: Date;
  detallesCuota?: PagoDetalleCuota[];
}

export interface CuotaPendiente {
  id: number;
  numeroCuota: number;
  fechaVencimiento: string;
  capital: number;
  interes: number;
  recargos: number;
  interesMoratorio: number;
  capitalPagado: number;
  interesPagado: number;
  recargosPagado: number;
  interesMoratorioPagado: number;
  diasMora: number;
  estado: EstadoCuota;
  capitalPendiente: number;
  interesPendiente: number;
  recargosPendiente: number;
  interesMoratorioPendiente: number;
  totalPendiente: number;
}

export interface ResumenAdeudo {
  prestamo: {
    id: number;
    numeroCredito: string;
    personaNombre: string;
    montoDesembolsado: number;
    saldoCapital: number;
    saldoInteres: number;
    capitalMora: number;
    interesMora: number;
    diasMora: number;
    estado: EstadoPrestamo;
    tasaInteresMoratorio: number;
  };
  cuotasPendientes: CuotaPendiente[];
  totales: {
    capitalPendiente: number;
    interesPendiente: number;
    recargosPendiente: number;
    interesMoratorioPendiente: number;
    totalAdeudado: number;
  };
  cuotasVencidas: number;
  cuotasParciales: number;
  proximaCuota: CuotaPendiente | null;
  // Información de recargo manual
  recargoManual: {
    aplica: boolean;           // true si el tipo de crédito usa recargo manual
    montoSugerido: number;     // monto por defecto del tipo de crédito
    tieneAtraso: boolean;      // true si hay cuotas vencidas
  };
}

export interface DistribucionPago {
  capitalAplicado: number;
  interesAplicado: number;
  recargosAplicado: number;
  interesMoratorioAplicado: number;
  recargoManualAplicado: number;  // Recargo manual cuando aplica
  excedente: number;
  cuotasAfectadas: {
    planPagoId: number;
    numeroCuota: number;
    capitalAplicado: number;
    interesAplicado: number;
    recargosAplicado: number;
    interesMoratorioAplicado: number;
    estadoAnterior: EstadoCuota;
    estadoPosterior: EstadoCuota;
  }[];
  tipoPago: TipoPago;
}

export interface PreviewPagoResponse {
  resumenAdeudo: ResumenAdeudo;
  distribucion: DistribucionPago;
  saldosPosterior: {
    saldoCapital: number;
    saldoInteres: number;
  };
}

export interface PreviewPagoRequest {
  prestamoId: number;
  montoPagar: number;
  fechaPago: string;
  recargoManual?: number;  // Recargo manual editable (solo cuando el tipo de crédito lo requiere)
}

export interface CrearPagoRequest {
  prestamoId: number;
  montoPagar: number;
  fechaPago: string;
  observaciones?: string;
  usuarioId?: number;
  nombreUsuario?: string;
  recargoManual?: number;  // Recargo manual editable (solo cuando el tipo de crédito lo requiere)
}

export interface AnularPagoRequest {
  motivoAnulacion: string;
  usuarioAnulacionId?: number;
  nombreUsuarioAnulacion?: string;
}

export interface EstadoCuenta {
  prestamo: {
    id: number;
    numeroCredito: string;
    personaNombre: string;
    montoDesembolsado: number;
    fechaOtorgamiento: string;
    fechaVencimiento: string;
    saldoCapital: number;
    saldoInteres: number;
    estado: string;
  };
  resumenPagos: {
    totalPagado: number;
    capitalPagado: number;
    interesPagado: number;
    recargosPagado: number;
    moratorioPagado: number;
    numeroPagos: number;
  };
  pagos: Pago[];
  planPago: PlanPago[];
}

export interface FiltrosPago {
  prestamoId?: number;
  estado?: EstadoPago;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedPagos {
  data: Pago[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// DATOS DEL RECIBO DE PAGO
// ============================================

export interface ReciboData {
  // Datos del recibo
  pagoId: number;
  numeroPago: string;
  fechaPago: string;
  fechaImpresion: string;

  // Datos del cliente
  cliente: {
    nombre: string;
    apellido: string;
    numeroDui: string;
  };

  // Datos del préstamo
  prestamo: {
    numeroCredito: string;
    tipoCredito: string;
  };

  // Detalle del pago
  montoPagado: number;
  distribucion: {
    capitalAplicado: number;
    interesAplicado: number;
    recargosAplicado: number;
    interesMoratorioAplicado: number;
    recargoManualAplicado: number;
  };

  // Saldos
  saldoAnterior: number;
  saldoActual: number;

  // Información del usuario
  nombreUsuario: string;
}

// ============================================
// DATOS DEL ESTADO DE CUENTA MÓVIL
// ============================================

export interface EstadoCuentaDatos {
  institucion: {
    nombre: string;
    direccion: string;
  };
  cliente: {
    nombre: string;
    apellido: string;
    nombreCompleto: string;
    numeroDui: string;
    telefono: string;
    correoElectronico: string;
    direccion: string;
  };
  prestamo: {
    numeroCredito: string;
    tipoCredito: string;
    montoDesembolsado: number;
    plazoMeses: number;
    tasaInteres: number;
    tasaInteresMoratorio: number;
    fechaOtorgamiento: string;
    fechaVencimiento: string;
    estado: string;
    periodicidadPago: string;
  };
  saldos: {
    saldoCapital: number;
    saldoInteres: number;
    capitalMora: number;
    interesMora: number;
    diasMora: number;
    saldoTotal: number;
  };
  resumenPagos: {
    totalPagado: number;
    capitalPagado: number;
    interesPagado: number;
    recargosPagado: number;
    moratorioPagado: number;
    recargoManualPagado: number;
    numeroPagos: number;
  };
  pagos: {
    numero: number;
    fechaPago: string;
    montoPagado: number;
    capitalAplicado: number;
    interesAplicado: number;
    recargosAplicado: number;
    moratorioAplicado: number;
    recargoManualAplicado: number;
    numeroPago: string;
  }[];
  fechaEmision: string;
}

// ============================================
// CÁLCULO DE PLAN DE PAGO PARA SOLICITUD
// ============================================

export interface RecargoSolicitudDto {
  nombre: string;
  tipo: 'FIJO' | 'PORCENTAJE';
  valor: number;
  aplicaDesde?: number;
  aplicaHasta?: number;
}

export interface CalcularPlanPagoRequest {
  monto: number;
  plazo: number;
  tasaInteres: number;
  periodicidad: string;
  tipoInteres: string;
  fechaPrimeraCuota?: string;
  numeroCuotas?: number; // Número de cuotas (obligatorio para DIARIA, opcional para otras)
  recargos?: RecargoSolicitudDto[];
}

export interface CuotaPlanPagoPreview {
  numeroCuota: number;
  fechaVencimiento: string;
  capital: number;
  interes: number;
  recargos: number;
  cuotaTotal: number;
  saldoCapital: number;
}

export interface PlanPagoCalculado {
  cuotaNormal: number;
  totalInteres: number;
  totalPagar: number;
  numeroCuotas: number;
  planPago: CuotaPlanPagoPreview[];
}
