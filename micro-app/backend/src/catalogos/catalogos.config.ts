/**
 * Configuración de todos los catálogos del sistema
 * Cada catálogo define sus valores iniciales para el seeder
 */

export interface CatalogoConfig {
  nombre: string;
  tabla: string;
  carpeta: string;
  clase: string;
  valores: Array<{
    codigo: string;
    nombre: string;
    descripcion?: string;
    orden?: number;
    color?: string;
  }>;
}

export const CATALOGOS_CONFIG: CatalogoConfig[] = [
  {
    nombre: 'Estado de Garantía',
    tabla: 'estado_garantia',
    carpeta: 'estado-garantia',
    clase: 'EstadoGarantia',
    valores: [
      {
        codigo: 'PENDIENTE',
        nombre: 'Pendiente',
        descripcion: 'Garantía pendiente de constitución',
        orden: 1,
        color: '#FFA500',
      },
      {
        codigo: 'CONSTITUIDA',
        nombre: 'Constituida',
        descripcion: 'Garantía constituida formalmente',
        orden: 2,
        color: '#28A745',
      },
      {
        codigo: 'LIBERADA',
        nombre: 'Liberada',
        descripcion: 'Garantía liberada después del pago del crédito',
        orden: 3,
        color: '#17A2B8',
      },
      {
        codigo: 'EJECUTADA',
        nombre: 'Ejecutada',
        descripcion: 'Garantía ejecutada por incumplimiento',
        orden: 4,
        color: '#DC3545',
      },
    ],
  },
  {
    nombre: 'Recomendación de Asesor',
    tabla: 'recomendacion_asesor',
    carpeta: 'recomendacion-asesor',
    clase: 'RecomendacionAsesor',
    valores: [
      {
        codigo: 'APROBAR',
        nombre: 'Aprobar',
        descripcion: 'Recomienda aprobar la solicitud',
        orden: 1,
        color: '#28A745',
      },
      {
        codigo: 'RECHAZAR',
        nombre: 'Rechazar',
        descripcion: 'Recomienda rechazar la solicitud',
        orden: 2,
        color: '#DC3545',
      },
      {
        codigo: 'OBSERVAR',
        nombre: 'Observar',
        descripcion: 'Requiere observaciones o aclaraciones',
        orden: 3,
        color: '#FFC107',
      },
    ],
  },
  {
    nombre: 'Tipo de Decisión de Comité',
    tabla: 'tipo_decision_comite',
    carpeta: 'tipo-decision-comite',
    clase: 'TipoDecisionComite',
    valores: [
      {
        codigo: 'AUTORIZADA',
        nombre: 'Autorizada',
        descripcion: 'Solicitud autorizada por el comité',
        orden: 1,
        color: '#28A745',
      },
      {
        codigo: 'DENEGADA',
        nombre: 'Denegada',
        descripcion: 'Solicitud denegada por el comité',
        orden: 2,
        color: '#DC3545',
      },
      {
        codigo: 'OBSERVADA',
        nombre: 'Observada',
        descripcion: 'Solicitud con observaciones del comité',
        orden: 3,
        color: '#FFC107',
      },
    ],
  },
  {
    nombre: 'Tipo de Pago',
    tabla: 'tipo_pago',
    carpeta: 'tipo-pago',
    clase: 'TipoPago',
    valores: [
      {
        codigo: 'CUOTA_COMPLETA',
        nombre: 'Cuota Completa',
        descripcion: 'Pago de cuota completa según plan de pagos',
        orden: 1,
        color: '#28A745',
      },
      {
        codigo: 'PAGO_PARCIAL',
        nombre: 'Pago Parcial',
        descripcion: 'Pago parcial de una o más cuotas',
        orden: 2,
        color: '#FFC107',
      },
      {
        codigo: 'PAGO_ADELANTADO',
        nombre: 'Pago Adelantado',
        descripcion: 'Pago anticipado de cuotas futuras',
        orden: 3,
        color: '#17A2B8',
      },
      {
        codigo: 'CANCELACION_TOTAL',
        nombre: 'Cancelación Total',
        descripcion: 'Pago total del saldo del préstamo',
        orden: 4,
        color: '#6610F2',
      },
    ],
  },
  {
    nombre: 'Estado de Pago',
    tabla: 'estado_pago',
    carpeta: 'estado-pago',
    clase: 'EstadoPago',
    valores: [
      {
        codigo: 'APLICADO',
        nombre: 'Aplicado',
        descripcion: 'Pago aplicado correctamente',
        orden: 1,
        color: '#28A745',
      },
      {
        codigo: 'ANULADO',
        nombre: 'Anulado',
        descripcion: 'Pago anulado por error o reversión',
        orden: 2,
        color: '#DC3545',
      },
    ],
  },
  {
    nombre: 'Sexo',
    tabla: 'sexo',
    carpeta: 'sexo',
    clase: 'Sexo',
    valores: [
      {
        codigo: 'MASCULINO',
        nombre: 'Masculino',
        descripcion: 'Persona de sexo masculino',
        orden: 1,
      },
      {
        codigo: 'FEMENINO',
        nombre: 'Femenino',
        descripcion: 'Persona de sexo femenino',
        orden: 2,
      },
      {
        codigo: 'OTRO',
        nombre: 'Otro',
        descripcion: 'Otra identidad de género',
        orden: 3,
      },
    ],
  },
  {
    nombre: 'Estado de Solicitud',
    tabla: 'estado_solicitud',
    carpeta: 'estado-solicitud',
    clase: 'EstadoSolicitud',
    valores: [
      {
        codigo: 'REGISTRADA',
        nombre: 'Registrada',
        descripcion: 'Estado inicial al crear la solicitud',
        orden: 1,
        color: '#6C757D',
      },
      {
        codigo: 'ANALIZADA',
        nombre: 'Analizada',
        descripcion: 'Se asigna automáticamente cuando el asesor ingresa su análisis',
        orden: 2,
        color: '#17A2B8',
      },
      {
        codigo: 'EN_COMITE',
        nombre: 'En Comité',
        descripcion: 'Cuando el asesor traslada a comité',
        orden: 3,
        color: '#FD7E14',
      },
      {
        codigo: 'OBSERVADA',
        nombre: 'Observada',
        descripcion: 'Cuando el comité observa la solicitud (permite al asesor modificar y reenviar)',
        orden: 4,
        color: '#FFC107',
      },
      {
        codigo: 'DENEGADA',
        nombre: 'Denegada',
        descripcion: 'Cuando el comité deniega (estado final, no se puede modificar)',
        orden: 5,
        color: '#DC3545',
      },
      {
        codigo: 'APROBADA',
        nombre: 'Aprobada',
        descripcion: 'Cuando el comité aprueba',
        orden: 6,
        color: '#28A745',
      },
      {
        codigo: 'DESEMBOLSADA',
        nombre: 'Desembolsada',
        descripcion: 'Estado final después del desembolso',
        orden: 7,
        color: '#007BFF',
      },
    ],
  },
  {
    nombre: 'Destino de Crédito',
    tabla: 'destino_credito',
    carpeta: 'destino-credito',
    clase: 'DestinoCredito',
    valores: [
      {
        codigo: 'CAPITAL_TRABAJO',
        nombre: 'Capital de Trabajo',
        descripcion: 'Crédito destinado a capital de trabajo empresarial',
        orden: 1,
      },
      {
        codigo: 'ACTIVO_FIJO',
        nombre: 'Activo Fijo',
        descripcion: 'Crédito para adquisición de activos fijos',
        orden: 2,
      },
      {
        codigo: 'CONSUMO_PERSONAL',
        nombre: 'Consumo Personal',
        descripcion: 'Crédito para consumo personal',
        orden: 3,
      },
      {
        codigo: 'VIVIENDA_NUEVA',
        nombre: 'Vivienda Nueva',
        descripcion: 'Crédito para compra de vivienda nueva',
        orden: 4,
      },
      {
        codigo: 'VIVIENDA_USADA',
        nombre: 'Vivienda Usada',
        descripcion: 'Crédito para compra de vivienda usada',
        orden: 5,
      },
      {
        codigo: 'MEJORA_VIVIENDA',
        nombre: 'Mejora de Vivienda',
        descripcion: 'Crédito para mejoras o remodelación de vivienda',
        orden: 6,
      },
      {
        codigo: 'CONSOLIDACION_DEUDAS',
        nombre: 'Consolidación de Deudas',
        descripcion: 'Crédito para consolidar deudas existentes',
        orden: 7,
      },
      {
        codigo: 'EDUCACION',
        nombre: 'Educación',
        descripcion: 'Crédito para gastos educativos',
        orden: 8,
      },
      {
        codigo: 'SALUD',
        nombre: 'Salud',
        descripcion: 'Crédito para gastos de salud',
        orden: 9,
      },
      {
        codigo: 'VEHICULO',
        nombre: 'Vehículo',
        descripcion: 'Crédito para compra de vehículo',
        orden: 10,
      },
      {
        codigo: 'OTRO',
        nombre: 'Otro',
        descripcion: 'Otro destino de crédito',
        orden: 11,
      },
    ],
  },
  {
    nombre: 'Estado de Cuota',
    tabla: 'estado_cuota',
    carpeta: 'estado-cuota',
    clase: 'EstadoCuota',
    valores: [
      {
        codigo: 'PENDIENTE',
        nombre: 'Pendiente',
        descripcion: 'Cuota pendiente de pago',
        orden: 1,
        color: '#FFC107',
      },
      {
        codigo: 'PAGADA',
        nombre: 'Pagada',
        descripcion: 'Cuota pagada completamente',
        orden: 2,
        color: '#28A745',
      },
      {
        codigo: 'PARCIAL',
        nombre: 'Parcial',
        descripcion: 'Cuota con pago parcial',
        orden: 3,
        color: '#17A2B8',
      },
      {
        codigo: 'MORA',
        nombre: 'En Mora',
        descripcion: 'Cuota en estado de mora',
        orden: 4,
        color: '#DC3545',
      },
    ],
  },
  {
    nombre: 'Tipo de Interés',
    tabla: 'tipo_interes',
    carpeta: 'tipo-interes',
    clase: 'TipoInteres',
    valores: [
      {
        codigo: 'FLAT',
        nombre: 'Tasa Flat',
        descripcion: 'Interés calculado sobre el saldo inicial durante todo el plazo',
        orden: 1,
      },
      {
        codigo: 'AMORTIZADO',
        nombre: 'Amortizado',
        descripcion: 'Interés calculado sobre saldo decreciente (sistema francés)',
        orden: 2,
      },
    ],
  },
  {
    nombre: 'Periodicidad de Pago',
    tabla: 'periodicidad_pago',
    carpeta: 'periodicidad-pago',
    clase: 'PeriodicidadPago',
    valores: [
      {
        codigo: 'DIARIO',
        nombre: 'Diario',
        descripcion: 'Pagos diarios',
        orden: 1,
      },
      {
        codigo: 'SEMANAL',
        nombre: 'Semanal',
        descripcion: 'Pagos semanales',
        orden: 2,
      },
      {
        codigo: 'QUINCENAL',
        nombre: 'Quincenal',
        descripcion: 'Pagos quincenales',
        orden: 3,
      },
      {
        codigo: 'MENSUAL',
        nombre: 'Mensual',
        descripcion: 'Pagos mensuales',
        orden: 4,
      },
      {
        codigo: 'TRIMESTRAL',
        nombre: 'Trimestral',
        descripcion: 'Pagos trimestrales',
        orden: 5,
      },
      {
        codigo: 'SEMESTRAL',
        nombre: 'Semestral',
        descripcion: 'Pagos semestrales',
        orden: 6,
      },
      {
        codigo: 'ANUAL',
        nombre: 'Anual',
        descripcion: 'Pagos anuales',
        orden: 7,
      },
      {
        codigo: 'AL_VENCIMIENTO',
        nombre: 'Al Vencimiento',
        descripcion: 'Pago único al vencimiento del préstamo',
        orden: 8,
      },
    ],
  },
  {
    nombre: 'Tipo de Cálculo',
    tabla: 'tipo_calculo',
    carpeta: 'tipo-calculo',
    clase: 'TipoCalculo',
    valores: [
      {
        codigo: 'FIJO',
        nombre: 'Monto Fijo',
        descripcion: 'Monto fijo en dólares',
        orden: 1,
      },
      {
        codigo: 'PORCENTAJE',
        nombre: 'Porcentaje',
        descripcion: 'Porcentaje sobre el monto',
        orden: 2,
      },
    ],
  },
];
