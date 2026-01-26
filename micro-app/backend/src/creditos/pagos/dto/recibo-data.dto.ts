export class ClienteReciboDto {
  nombre: string;
  apellido: string;
  numeroDui: string;
}

export class PrestamoReciboDto {
  numeroCredito: string;
  tipoCredito: string;
}

export class DistribucionReciboDto {
  capitalAplicado: number;
  interesAplicado: number;
  recargosAplicado: number;
  interesMoratorioAplicado: number;
}

export class UsuarioReciboDto {
  nombre: string;
}

export class ReciboDataDto {
  // Datos de la institución
  institucion: string;

  // Datos del recibo
  numeroPago: string;
  pagoId: number;
  fechaPago: Date;
  fechaEmision: Date;

  // Datos del cliente
  cliente: ClienteReciboDto;

  // Datos del préstamo
  prestamo: PrestamoReciboDto;

  // Datos del pago
  montoPagado: number;
  distribucion: DistribucionReciboDto;

  // Saldos
  saldoAnterior: number;
  saldoActual: number;

  // Usuario
  usuario: UsuarioReciboDto;
}
