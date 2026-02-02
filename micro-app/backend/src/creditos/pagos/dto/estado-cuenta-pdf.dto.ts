/**
 * DTO para la información del estado de cuenta en PDF
 */

export class InstitucionPdfDto {
  nombre: string;
  direccion: string;
}

export class ClientePdfDto {
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  numeroDui: string;
  telefono: string;
  correoElectronico: string;
  direccion: string;
}

export class PrestamoPdfDto {
  numeroCredito: string;
  tipoCredito: string;
  montoDesembolsado: number;
  plazoMeses: number;
  tasaInteres: number;
  tasaInteresMoratorio: number;
  fechaOtorgamiento: Date;
  fechaVencimiento: Date;
  estado: string;
  periodicidadPago: string;
}

export class SaldosPdfDto {
  saldoCapital: number;
  saldoInteres: number;
  capitalMora: number;
  interesMora: number;
  diasMora: number;
  saldoTotal: number;
}

export class ResumenPagosPdfDto {
  totalPagado: number;
  capitalPagado: number;
  interesPagado: number;
  recargosPagado: number;
  moratorioPagado: number;
  recargoManualPagado: number;
  numeroPagos: number;
}

export class PagoDetallePdfDto {
  numero: number;
  fechaPago: Date;
  montoPagado: number;
  capitalAplicado: number;
  interesAplicado: number;
  recargosAplicado: number;
  moratorioAplicado: number;
  recargoManualAplicado: number;
  numeroPago: string;
}

export class EstadoCuentaPdfDto {
  institucion: InstitucionPdfDto;
  cliente: ClientePdfDto;
  prestamo: PrestamoPdfDto;
  saldos: SaldosPdfDto;
  resumenPagos: ResumenPagosPdfDto;
  pagos: PagoDetallePdfDto[];
  fechaEmision: Date;
}
