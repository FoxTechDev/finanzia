/**
 * Datos de prueba para el componente de recibo de pago
 * Útil para desarrollo y testing
 */

import { ReciboData } from '@core/models/credito.model';

export const MOCK_RECIBO_DATA: ReciboData = {
  numeroPago: 'PAG2026000001',
  fechaPago: '2026-01-23',
  fechaImpresion: '2026-01-23T16:30:45.123Z',

  cliente: {
    nombre: 'Juan',
    apellido: 'Pérez García',
    numeroDui: '12345678-9',
  },

  prestamo: {
    numeroCredito: 'CRE-2026-0001',
    tipoCredito: 'Crédito Personal',
  },

  montoPagado: 500.00,
  distribucion: {
    capitalAplicado: 400.00,
    interesAplicado: 80.00,
    recargosAplicado: 10.00,
    interesMoratorioAplicado: 10.00,
  },

  saldoAnterior: 2500.00,
  saldoActual: 2100.00,
  nombreUsuario: 'admin',
};

export const MOCK_RECIBO_DATA_2: ReciboData = {
  numeroPago: 'PAG2026000025',
  fechaPago: '2026-01-23',
  fechaImpresion: '2026-01-23T17:15:30.456Z',

  cliente: {
    nombre: 'María',
    apellido: 'González López',
    numeroDui: '98765432-1',
  },

  prestamo: {
    numeroCredito: 'CRE-2026-0015',
    tipoCredito: 'Crédito Comercial',
  },

  montoPagado: 1250.50,
  distribucion: {
    capitalAplicado: 1000.00,
    interesAplicado: 200.00,
    recargosAplicado: 25.50,
    interesMoratorioAplicado: 25.00,
  },

  saldoAnterior: 8500.00,
  saldoActual: 7249.50,
  nombreUsuario: 'jperez',
};

export const MOCK_RECIBO_CANCELACION_TOTAL: ReciboData = {
  numeroPago: 'PAG2026000100',
  fechaPago: '2026-01-23',
  fechaImpresion: '2026-01-23T18:45:12.789Z',

  cliente: {
    nombre: 'Carlos',
    apellido: 'Martínez Rodríguez',
    numeroDui: '11223344-5',
  },

  prestamo: {
    numeroCredito: 'CRE-2025-0500',
    tipoCredito: 'Microcrédito',
  },

  montoPagado: 1500.00,
  distribucion: {
    capitalAplicado: 1350.00,
    interesAplicado: 120.00,
    recargosAplicado: 15.00,
    interesMoratorioAplicado: 15.00,
  },

  saldoAnterior: 1500.00,
  saldoActual: 0.00,
  nombreUsuario: 'mlopez',
};

/**
 * Datos con montos muy pequeños (para probar formateo de decimales)
 */
export const MOCK_RECIBO_SMALL_AMOUNTS: ReciboData = {
  numeroPago: 'PAG2026000150',
  fechaPago: '2026-01-23',
  fechaImpresion: '2026-01-23T19:20:05.321Z',

  cliente: {
    nombre: 'Ana',
    apellido: 'Ramírez Flores',
    numeroDui: '55667788-9',
  },

  prestamo: {
    numeroCredito: 'CRE-2026-0075',
    tipoCredito: 'Crédito Personal',
  },

  montoPagado: 15.50,
  distribucion: {
    capitalAplicado: 10.00,
    interesAplicado: 3.50,
    recargosAplicado: 1.00,
    interesMoratorioAplicado: 1.00,
  },

  saldoAnterior: 100.00,
  saldoActual: 84.50,
  nombreUsuario: 'sistema',
};

/**
 * Datos con montos muy grandes (para probar formateo de miles)
 */
export const MOCK_RECIBO_LARGE_AMOUNTS: ReciboData = {
  numeroPago: 'PAG2026000200',
  fechaPago: '2026-01-23',
  fechaImpresion: '2026-01-23T20:10:55.654Z',

  cliente: {
    nombre: 'Roberto',
    apellido: 'Hernández Castro',
    numeroDui: '99887766-5',
  },

  prestamo: {
    numeroCredito: 'CRE-2026-0250',
    tipoCredito: 'Crédito Empresarial',
  },

  montoPagado: 15750.75,
  distribucion: {
    capitalAplicado: 12500.00,
    interesAplicado: 2800.00,
    recargosAplicado: 250.75,
    interesMoratorioAplicado: 200.00,
  },

  saldoAnterior: 125000.00,
  saldoActual: 109249.25,
  nombreUsuario: 'admin',
};

/**
 * Datos con nombres largos (para probar overflow de texto)
 */
export const MOCK_RECIBO_LONG_NAMES: ReciboData = {
  numeroPago: 'PAG2026000300',
  fechaPago: '2026-01-23',
  fechaImpresion: '2026-01-23T21:30:15.987Z',

  cliente: {
    nombre: 'María Guadalupe',
    apellido: 'Fernández Rodríguez de los Santos',
    numeroDui: '44556677-8',
  },

  prestamo: {
    numeroCredito: 'CRE-2026-0400',
    tipoCredito: 'Crédito de Consumo Personal para Empleados',
  },

  montoPagado: 850.00,
  distribucion: {
    capitalAplicado: 700.00,
    interesAplicado: 120.00,
    recargosAplicado: 15.00,
    interesMoratorioAplicado: 15.00,
  },

  saldoAnterior: 5600.00,
  saldoActual: 4750.00,
  nombreUsuario: 'usuario_con_nombre_muy_largo',
};

/**
 * Array con todos los mocks para facilitar las pruebas
 */
export const ALL_MOCK_RECIBOS: ReciboData[] = [
  MOCK_RECIBO_DATA,
  MOCK_RECIBO_DATA_2,
  MOCK_RECIBO_CANCELACION_TOTAL,
  MOCK_RECIBO_SMALL_AMOUNTS,
  MOCK_RECIBO_LARGE_AMOUNTS,
  MOCK_RECIBO_LONG_NAMES,
];
