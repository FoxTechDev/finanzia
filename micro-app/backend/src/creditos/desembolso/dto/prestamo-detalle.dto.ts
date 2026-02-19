import { EstadoPrestamo, CategoriaNCB022, TipoInteres, PeriodicidadPago } from '../entities/prestamo.entity';
import { EstadoCuota } from '../entities/plan-pago.entity';

/**
 * DTO con información completa del préstamo
 */
export class PrestamoDetalleDto {
  // Información básica del préstamo
  id: number;
  numeroCredito: string;
  estado: EstadoPrestamo;
  categoriaNCB022: CategoriaNCB022;

  // Información del cliente
  cliente: {
    id: number;
    nombre: string;
    apellido: string;
    nombreCompleto: string;
    numeroDui: string;
    telefono: string;
    correoElectronico: string;
  };

  // Información del tipo de crédito
  tipoCredito: {
    id: number;
    nombre: string;
    codigo: string;
  };

  // Información de la solicitud
  solicitud: {
    id: number;
    numeroSolicitud: string;
    fechaSolicitud: Date;
  };

  // Montos
  montoAutorizado: number;
  montoDesembolsado: number;
  totalPagar: number;
  totalInteres: number;
  totalRecargos: number;

  // Saldos actuales
  saldoCapital: number;
  saldoInteres: number;
  capitalMora: number;
  interesMora: number;
  diasMora: number;

  // Términos del préstamo
  plazoAutorizado: number;
  numeroCuotas: number;
  cuotaNormal: number;
  cuotaTotal: number;
  tasaInteres: number;
  tasaInteresMoratorio: number;
  tipoInteres: TipoInteres;
  periodicidadPago: PeriodicidadPago;

  // Fechas
  fechaOtorgamiento: Date;
  fechaPrimeraCuota: Date;
  fechaVencimiento: Date;
  fechaUltimoPago: Date | null;
  fechaCancelacion: Date | null;

  // Deducciones aplicadas
  deducciones: {
    id: number;
    nombre: string;
    tipoCalculo: string;
    valor: number;
    montoCalculado: number;
  }[];

  // Recargos aplicados
  recargos: {
    id: number;
    nombre: string;
    tipoCalculo: string;
    valor: number;
    montoCalculado: number;
    aplicaDesde: number;
    aplicaHasta: number;
  }[];

  // Resumen del plan de pagos
  resumenPlanPago: {
    totalCuotas: number;
    cuotasPendientes: number;
    cuotasPagadas: number;
    cuotasEnMora: number;
    proximaCuota: {
      numeroCuota: number;
      fechaVencimiento: Date;
      cuotaTotal: number;
      saldoPendiente: number;
    } | null;
  };

  // Información de auditoría
  usuarioDesembolsoId: number | null;
  nombreUsuarioDesembolso: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO para el plan de pagos detallado
 */
export class PlanPagoDetalleDto {
  id: number;
  numeroCuota: number;
  fechaVencimiento: Date;

  // Componentes de la cuota
  capital: number;
  interes: number;
  recargos: number;
  cuotaTotal: number;

  // Saldo después de esta cuota
  saldoCapital: number;

  // Montos pagados
  capitalPagado: number;
  interesPagado: number;
  recargosPagado: number;

  // Mora
  diasMora: number;
  interesMoratorio: number;
  interesMoratorioPagado: number;

  // Estado
  estado: EstadoCuota;
  fechaPago: Date | null;

  // Saldo pendiente de esta cuota
  saldoPendiente: number;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO para lista de préstamos (resumen)
 */
export class PrestamoResumenDto {
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
    lineaCredito?: {
      id: number;
      nombre: string;
    };
  };

  montoAutorizado: number;
  montoDesembolsado: number;
  saldoCapital: number;
  diasMora: number;
  periodicidadPago: string;
  tasaInteres: number;
  numeroCuotas: number;

  fechaOtorgamiento: Date;
  fechaVencimiento: Date;

  proximaCuota: {
    numeroCuota: number;
    fechaVencimiento: Date;
    cuotaTotal: number;
  } | null;
}

/**
 * DTO para respuesta paginada de préstamos
 */
export class PrestamoPaginadoDto {
  data: PrestamoResumenDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
