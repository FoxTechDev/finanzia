export class CuentaAhorroResumenDto {
  id: number;
  noCuenta: string;
  personaId: number;
  nombreCliente: string;
  numeroDui: string;
  tipoAhorroId: number;
  tipoAhorro: string;
  lineaAhorro: string;
  estado: string;
  fechaApertura: Date;
  saldo: number;
  saldoDisponible: number;
  tasaInteres: number;
  pignorado: boolean;
  monto: number;
  plazo: number;
  fechaVencimiento: Date | null;
}

export class CuentaAhorroDetalleDto extends CuentaAhorroResumenDto {
  monto: number;
  plazo: number;
  fechaVencimiento: Date | null;
  montoPignorado: number;
  fechaUltMovimiento: Date | null;
  saldoInteres: number;
  fechaCancelacion: Date | null;
  tipoCapitalizacion: string | null;
  createdAt: Date;
  cuentaAhorroDestinoId: number | null;
  cuentaAhorroDestinoNoCuenta: string | null;
  bancoNombre: string | null;
  cuentaBancoNumero: string | null;
  cuentaBancoPropietario: string | null;
}
