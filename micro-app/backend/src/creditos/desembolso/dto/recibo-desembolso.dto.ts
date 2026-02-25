import { TipoInteres, PeriodicidadPago } from '../entities/prestamo.entity';

/**
 * Datos del cliente para el recibo de desembolso
 */
export class ClienteReciboDesembolsoDto {
  nombre: string;
  apellido: string;
  numeroDui: string;
}

/**
 * Datos del préstamo para el recibo de desembolso
 */
export class PrestamoReciboDesembolsoDto {
  id: number;
  numeroCredito: string;
  montoAutorizado: number;
  plazoAutorizado: number;
  tasaInteres: number;
  tipoInteres: TipoInteres;
  periodicidadPago: PeriodicidadPago;
  numeroCuotas: number;
  cuotaTotal: number;
  fechaOtorgamiento: Date;
  fechaVencimiento: Date;
}

/**
 * Datos de una deducción aplicada al préstamo
 */
export class DeduccionReciboDto {
  nombre: string;
  montoCalculado: number;
}

/**
 * DTO principal del recibo de desembolso
 * Contiene toda la información necesaria para imprimir el comprobante en impresora térmica
 */
export class ReciboDesembolsoDto {
  institucion: string;
  fechaEmision: string;
  cliente: ClienteReciboDesembolsoDto;
  prestamo: PrestamoReciboDesembolsoDto;
  deducciones: DeduccionReciboDto[];
  totalDeducciones: number;
  montoLiquido: number;
}
