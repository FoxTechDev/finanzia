-- =====================================================
-- DATOS INICIALES PARA CATÁLOGOS
-- Inserta los valores predefinidos para todos los catálogos
-- =====================================================

-- 1. Estado de Garantía
INSERT IGNORE INTO `estado_garantia` (`codigo`, `nombre`, `descripcion`, `orden`, `color`, `activo`) VALUES
('PENDIENTE', 'Pendiente', 'Garantía pendiente de constitución', 1, '#FFA500', 1),
('CONSTITUIDA', 'Constituida', 'Garantía constituida formalmente', 2, '#28A745', 1),
('LIBERADA', 'Liberada', 'Garantía liberada después del pago del crédito', 3, '#17A2B8', 1),
('EJECUTADA', 'Ejecutada', 'Garantía ejecutada por incumplimiento', 4, '#DC3545', 1);

-- 2. Recomendación de Asesor
INSERT IGNORE INTO `recomendacion_asesor` (`codigo`, `nombre`, `descripcion`, `orden`, `color`, `activo`) VALUES
('APROBAR', 'Aprobar', 'Recomienda aprobar la solicitud', 1, '#28A745', 1),
('RECHAZAR', 'Rechazar', 'Recomienda rechazar la solicitud', 2, '#DC3545', 1),
('OBSERVAR', 'Observar', 'Requiere observaciones o aclaraciones', 3, '#FFC107', 1);

-- 3. Tipo de Decisión de Comité
INSERT IGNORE INTO `tipo_decision_comite` (`codigo`, `nombre`, `descripcion`, `orden`, `color`, `activo`) VALUES
('AUTORIZADA', 'Autorizada', 'Solicitud autorizada por el comité', 1, '#28A745', 1),
('DENEGADA', 'Denegada', 'Solicitud denegada por el comité', 2, '#DC3545', 1),
('OBSERVADA', 'Observada', 'Solicitud con observaciones del comité', 3, '#FFC107', 1);

-- 4. Tipo de Pago
INSERT IGNORE INTO `tipo_pago` (`codigo`, `nombre`, `descripcion`, `orden`, `color`, `activo`) VALUES
('CUOTA_COMPLETA', 'Cuota Completa', 'Pago de cuota completa según plan de pagos', 1, '#28A745', 1),
('PAGO_PARCIAL', 'Pago Parcial', 'Pago parcial de una o más cuotas', 2, '#FFC107', 1),
('PAGO_ADELANTADO', 'Pago Adelantado', 'Pago anticipado de cuotas futuras', 3, '#17A2B8', 1),
('CANCELACION_TOTAL', 'Cancelación Total', 'Pago total del saldo del préstamo', 4, '#6610F2', 1);

-- 5. Estado de Pago
INSERT IGNORE INTO `estado_pago` (`codigo`, `nombre`, `descripcion`, `orden`, `color`, `activo`) VALUES
('APLICADO', 'Aplicado', 'Pago aplicado correctamente', 1, '#28A745', 1),
('ANULADO', 'Anulado', 'Pago anulado por error o reversión', 2, '#DC3545', 1);

-- 6. Sexo
INSERT IGNORE INTO `sexo` (`codigo`, `nombre`, `descripcion`, `orden`, `activo`) VALUES
('MASCULINO', 'Masculino', 'Persona de sexo masculino', 1, 1),
('FEMENINO', 'Femenino', 'Persona de sexo femenino', 2, 1),
('OTRO', 'Otro', 'Otra identidad de género', 3, 1);

-- 7. Estado de Solicitud
INSERT IGNORE INTO `estado_solicitud` (`codigo`, `nombre`, `descripcion`, `orden`, `color`, `activo`) VALUES
('CREADA', 'Creada', 'Solicitud creada, pendiente de análisis', 1, '#6C757D', 1),
('EN_ANALISIS', 'En Análisis', 'Solicitud en proceso de análisis', 2, '#17A2B8', 1),
('OBSERVADA', 'Observada', 'Solicitud con observaciones pendientes', 3, '#FFC107', 1),
('DENEGADA', 'Denegada', 'Solicitud denegada', 4, '#DC3545', 1),
('APROBADA', 'Aprobada', 'Solicitud aprobada', 5, '#28A745', 1),
('DESEMBOLSADA', 'Desembolsada', 'Solicitud desembolsada', 6, '#007BFF', 1),
('CANCELADA', 'Cancelada', 'Solicitud cancelada', 7, '#6C757D', 1),
('PENDIENTE_COMITE', 'Pendiente Comité', 'Solicitud pendiente de revisión por comité de crédito', 8, '#FD7E14', 1),
('AUTORIZADA', 'Autorizada', 'Solicitud autorizada por el comité', 9, '#20C997', 1),
('DENEGADA_COMITE', 'Denegada por Comité', 'Solicitud denegada por el comité de crédito', 10, '#E83E8C', 1),
('OBSERVADA_COMITE', 'Observada por Comité', 'Solicitud con observaciones del comité de crédito', 11, '#F8B739', 1);

-- 8. Destino de Crédito
INSERT IGNORE INTO `destino_credito` (`codigo`, `nombre`, `descripcion`, `orden`, `activo`) VALUES
('CAPITAL_TRABAJO', 'Capital de Trabajo', 'Crédito destinado a capital de trabajo empresarial', 1, 1),
('ACTIVO_FIJO', 'Activo Fijo', 'Crédito para adquisición de activos fijos', 2, 1),
('CONSUMO_PERSONAL', 'Consumo Personal', 'Crédito para consumo personal', 3, 1),
('VIVIENDA_NUEVA', 'Vivienda Nueva', 'Crédito para compra de vivienda nueva', 4, 1),
('VIVIENDA_USADA', 'Vivienda Usada', 'Crédito para compra de vivienda usada', 5, 1),
('MEJORA_VIVIENDA', 'Mejora de Vivienda', 'Crédito para mejoras o remodelación de vivienda', 6, 1),
('CONSOLIDACION_DEUDAS', 'Consolidación de Deudas', 'Crédito para consolidar deudas existentes', 7, 1),
('EDUCACION', 'Educación', 'Crédito para gastos educativos', 8, 1),
('SALUD', 'Salud', 'Crédito para gastos de salud', 9, 1),
('VEHICULO', 'Vehículo', 'Crédito para compra de vehículo', 10, 1),
('OTRO', 'Otro', 'Otro destino de crédito', 11, 1);

-- 9. Estado de Cuota
INSERT IGNORE INTO `estado_cuota` (`codigo`, `nombre`, `descripcion`, `orden`, `color`, `activo`) VALUES
('PENDIENTE', 'Pendiente', 'Cuota pendiente de pago', 1, '#FFC107', 1),
('PAGADA', 'Pagada', 'Cuota pagada completamente', 2, '#28A745', 1),
('PARCIAL', 'Parcial', 'Cuota con pago parcial', 3, '#17A2B8', 1),
('MORA', 'En Mora', 'Cuota en estado de mora', 4, '#DC3545', 1);

-- 10. Tipo de Interés
INSERT IGNORE INTO `tipo_interes` (`codigo`, `nombre`, `descripcion`, `orden`, `activo`) VALUES
('FLAT', 'Tasa Flat', 'Interés calculado sobre el saldo inicial durante todo el plazo', 1, 1),
('AMORTIZADO', 'Amortizado', 'Interés calculado sobre saldo decreciente (sistema francés)', 2, 1);

-- 11. Periodicidad de Pago
INSERT IGNORE INTO `periodicidad_pago` (`codigo`, `nombre`, `descripcion`, `orden`, `activo`) VALUES
('DIARIO', 'Diario', 'Pagos diarios', 1, 1),
('SEMANAL', 'Semanal', 'Pagos semanales', 2, 1),
('QUINCENAL', 'Quincenal', 'Pagos quincenales', 3, 1),
('MENSUAL', 'Mensual', 'Pagos mensuales', 4, 1),
('TRIMESTRAL', 'Trimestral', 'Pagos trimestrales', 5, 1),
('SEMESTRAL', 'Semestral', 'Pagos semestrales', 6, 1),
('ANUAL', 'Anual', 'Pagos anuales', 7, 1),
('AL_VENCIMIENTO', 'Al Vencimiento', 'Pago único al vencimiento del préstamo', 8, 1);

-- 12. Categoría NCB-022
-- NOTA: Esta tabla ya existe como 'clasificacion_prestamo' con datos
-- Los datos ya están en la tabla clasificacion_prestamo

-- 13. Tipo de Cálculo
INSERT IGNORE INTO `tipo_calculo` (`codigo`, `nombre`, `descripcion`, `orden`, `activo`) VALUES
('FIJO', 'Monto Fijo', 'Monto fijo en dólares', 1, 1),
('PORCENTAJE', 'Porcentaje', 'Porcentaje sobre el monto', 2, 1);
