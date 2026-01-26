-- ============================================================================
-- SCRIPT DE CREACIÓN DE FOREIGN KEYS FALTANTES
-- Base de Datos: micro_app
-- Fecha: 2026-01-25
-- ============================================================================

-- IMPORTANTE:
-- 1. Hacer BACKUP de la base de datos antes de ejecutar este script
-- 2. Ejecutar primero la sección de validaciones
-- 3. Solo proceder con las FK si las validaciones son exitosas

USE micro_app;

-- ============================================================================
-- SECCIÓN 1: VALIDACIONES DE DATOS EXISTENTES
-- ============================================================================

-- Verificar que no haya datos huérfanos antes de crear las FK
-- Si alguna consulta retorna registros, hay datos inconsistentes que deben corregirse

-- 1.1 Validar tipo_credito.lineaCreditoId
SELECT 'VALIDACIÓN 1: tipo_credito.lineaCreditoId' as validation;
SELECT tc.id, tc.codigo, tc.lineaCreditoId
FROM tipo_credito tc
LEFT JOIN linea_credito lc ON tc.lineaCreditoId = lc.id
WHERE lc.id IS NULL;

-- 1.2 Validar solicitud.lineaCreditoId
SELECT 'VALIDACIÓN 2: solicitud.lineaCreditoId' as validation;
SELECT s.id, s.numeroSolicitud, s.lineaCreditoId
FROM solicitud s
LEFT JOIN linea_credito lc ON s.lineaCreditoId = lc.id
WHERE lc.id IS NULL;

-- 1.3 Validar solicitud.tipoCreditoId
SELECT 'VALIDACIÓN 3: solicitud.tipoCreditoId' as validation;
SELECT s.id, s.numeroSolicitud, s.tipoCreditoId
FROM solicitud s
LEFT JOIN tipo_credito tc ON s.tipoCreditoId = tc.id
WHERE tc.id IS NULL;

-- 1.4 Validar prestamo.solicitudId
SELECT 'VALIDACIÓN 4: prestamo.solicitudId' as validation;
SELECT p.id, p.numeroCredito, p.solicitudId
FROM prestamo p
LEFT JOIN solicitud s ON p.solicitudId = s.id
WHERE s.id IS NULL;

-- 1.5 Validar prestamo.personaId
SELECT 'VALIDACIÓN 5: prestamo.personaId' as validation;
SELECT p.id, p.numeroCredito, p.personaId
FROM prestamo p
LEFT JOIN persona per ON p.personaId = per.idPersona
WHERE per.idPersona IS NULL;

-- 1.6 Validar prestamo.tipoCreditoId
SELECT 'VALIDACIÓN 6: prestamo.tipoCreditoId' as validation;
SELECT p.id, p.numeroCredito, p.tipoCreditoId
FROM prestamo p
LEFT JOIN tipo_credito tc ON p.tipoCreditoId = tc.id
WHERE tc.id IS NULL;

-- 1.7 Validar plan_pago.prestamoId
SELECT 'VALIDACIÓN 7: plan_pago.prestamoId' as validation;
SELECT pp.id, pp.prestamoId, pp.numeroCuota
FROM plan_pago pp
LEFT JOIN prestamo p ON pp.prestamoId = p.id
WHERE p.id IS NULL;

-- 1.8 Validar pago.prestamoId
SELECT 'VALIDACIÓN 8: pago.prestamoId' as validation;
SELECT pg.id, pg.numeroPago, pg.prestamoId
FROM pago pg
LEFT JOIN prestamo p ON pg.prestamoId = p.id
WHERE p.id IS NULL;

-- 1.9 Validar pago_detalle_cuota.pagoId
SELECT 'VALIDACIÓN 9: pago_detalle_cuota.pagoId' as validation;
SELECT pdc.id, pdc.pagoId
FROM pago_detalle_cuota pdc
LEFT JOIN pago pg ON pdc.pagoId = pg.id
WHERE pg.id IS NULL;

-- 1.10 Validar pago_detalle_cuota.planPagoId
SELECT 'VALIDACIÓN 10: pago_detalle_cuota.planPagoId' as validation;
SELECT pdc.id, pdc.planPagoId
FROM pago_detalle_cuota pdc
LEFT JOIN plan_pago pp ON pdc.planPagoId = pp.id
WHERE pp.id IS NULL;

-- 1.11 Validar deduccion_prestamo.prestamoId
SELECT 'VALIDACIÓN 11: deduccion_prestamo.prestamoId' as validation;
SELECT dp.id, dp.prestamoId
FROM deduccion_prestamo dp
LEFT JOIN prestamo p ON dp.prestamoId = p.id
WHERE p.id IS NULL;

-- 1.12 Validar recargo_prestamo.prestamoId
SELECT 'VALIDACIÓN 12: recargo_prestamo.prestamoId' as validation;
SELECT rp.id, rp.prestamoId
FROM recargo_prestamo rp
LEFT JOIN prestamo p ON rp.prestamoId = p.id
WHERE p.id IS NULL;

-- 1.13 Validar decision_comite.solicitudId
SELECT 'VALIDACIÓN 13: decision_comite.solicitudId' as validation;
SELECT dc.id, dc.solicitudId
FROM decision_comite dc
LEFT JOIN solicitud s ON dc.solicitudId = s.id
WHERE s.id IS NULL;

-- ============================================================================
-- SECCIÓN 2: CREACIÓN DE FOREIGN KEYS - PRIORIDAD 1 (CRÍTICA)
-- ============================================================================

-- Deshabilitar temporalmente las verificaciones de FK
SET FOREIGN_KEY_CHECKS = 0;

-- 2.1 tipo_credito → linea_credito
ALTER TABLE tipo_credito
ADD CONSTRAINT FK_tipo_credito_linea_credito
FOREIGN KEY (lineaCreditoId)
REFERENCES linea_credito(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- 2.2 solicitud → linea_credito
ALTER TABLE solicitud
ADD CONSTRAINT FK_solicitud_linea_credito
FOREIGN KEY (lineaCreditoId)
REFERENCES linea_credito(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- 2.3 solicitud → tipo_credito
ALTER TABLE solicitud
ADD CONSTRAINT FK_solicitud_tipo_credito
FOREIGN KEY (tipoCreditoId)
REFERENCES tipo_credito(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- 2.4 prestamo → solicitud (ONE TO ONE)
ALTER TABLE prestamo
ADD CONSTRAINT FK_prestamo_solicitud
FOREIGN KEY (solicitudId)
REFERENCES solicitud(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- 2.5 prestamo → persona
ALTER TABLE prestamo
ADD CONSTRAINT FK_prestamo_persona
FOREIGN KEY (personaId)
REFERENCES persona(idPersona)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- 2.6 prestamo → tipo_credito
ALTER TABLE prestamo
ADD CONSTRAINT FK_prestamo_tipo_credito
FOREIGN KEY (tipoCreditoId)
REFERENCES tipo_credito(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- 2.7 plan_pago → prestamo
ALTER TABLE plan_pago
ADD CONSTRAINT FK_plan_pago_prestamo
FOREIGN KEY (prestamoId)
REFERENCES prestamo(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 2.8 pago → prestamo
ALTER TABLE pago
ADD CONSTRAINT FK_pago_prestamo
FOREIGN KEY (prestamoId)
REFERENCES prestamo(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- ============================================================================
-- SECCIÓN 3: CREACIÓN DE FOREIGN KEYS - PRIORIDAD 2 (ALTA)
-- ============================================================================

-- 3.1 pago_detalle_cuota → pago
ALTER TABLE pago_detalle_cuota
ADD CONSTRAINT FK_pago_detalle_cuota_pago
FOREIGN KEY (pagoId)
REFERENCES pago(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 3.2 pago_detalle_cuota → plan_pago
ALTER TABLE pago_detalle_cuota
ADD CONSTRAINT FK_pago_detalle_cuota_plan_pago
FOREIGN KEY (planPagoId)
REFERENCES plan_pago(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- 3.3 deduccion_prestamo → prestamo
ALTER TABLE deduccion_prestamo
ADD CONSTRAINT FK_deduccion_prestamo_prestamo
FOREIGN KEY (prestamoId)
REFERENCES prestamo(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 3.4 recargo_prestamo → prestamo
ALTER TABLE recargo_prestamo
ADD CONSTRAINT FK_recargo_prestamo_prestamo
FOREIGN KEY (prestamoId)
REFERENCES prestamo(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 3.5 decision_comite → solicitud
ALTER TABLE decision_comite
ADD CONSTRAINT FK_decision_comite_solicitud
FOREIGN KEY (solicitudId)
REFERENCES solicitud(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- ============================================================================
-- SECCIÓN 4: CREACIÓN DE FOREIGN KEYS - PRIORIDAD 3 (MEDIA - CATÁLOGOS)
-- ============================================================================

-- 4.1 deduccion_prestamo → tipo_deduccion
ALTER TABLE deduccion_prestamo
ADD CONSTRAINT FK_deduccion_prestamo_tipo_deduccion
FOREIGN KEY (tipoDeduccionId)
REFERENCES tipo_deduccion(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 4.2 recargo_prestamo → tipo_recargo
ALTER TABLE recargo_prestamo
ADD CONSTRAINT FK_recargo_prestamo_tipo_recargo
FOREIGN KEY (tipoRecargoId)
REFERENCES tipo_recargo(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 4.3 prestamo → clasificacion_prestamo
ALTER TABLE prestamo
ADD CONSTRAINT FK_prestamo_clasificacion_prestamo
FOREIGN KEY (clasificacionPrestamoId)
REFERENCES clasificacion_prestamo(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 4.4 prestamo → estado_prestamo
ALTER TABLE prestamo
ADD CONSTRAINT FK_prestamo_estado_prestamo
FOREIGN KEY (estadoPrestamoId)
REFERENCES estado_prestamo(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- ============================================================================
-- SECCIÓN 5: CREACIÓN DE FOREIGN KEYS - PRIORIDAD 4 (BAJA - USUARIOS)
-- ============================================================================

-- 5.1 solicitud → users (analista)
ALTER TABLE solicitud
ADD CONSTRAINT FK_solicitud_analista
FOREIGN KEY (analistaId)
REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 5.2 solicitud → users (aprobador)
ALTER TABLE solicitud
ADD CONSTRAINT FK_solicitud_aprobador
FOREIGN KEY (aprobadorId)
REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 5.3 prestamo → users (usuario desembolso)
ALTER TABLE prestamo
ADD CONSTRAINT FK_prestamo_usuario_desembolso
FOREIGN KEY (usuarioDesembolsoId)
REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 5.4 pago → users (usuario)
ALTER TABLE pago
ADD CONSTRAINT FK_pago_usuario
FOREIGN KEY (usuarioId)
REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 5.5 pago → users (usuario anulación)
ALTER TABLE pago
ADD CONSTRAINT FK_pago_usuario_anulacion
FOREIGN KEY (usuarioAnulacionId)
REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 5.6 decision_comite → users
ALTER TABLE decision_comite
ADD CONSTRAINT FK_decision_comite_usuario
FOREIGN KEY (usuarioId)
REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 5.7 solicitud_historial → users
ALTER TABLE solicitud_historial
ADD CONSTRAINT FK_solicitud_historial_usuario
FOREIGN KEY (usuarioId)
REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Rehabilitar las verificaciones de FK
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- SECCIÓN 6: VERIFICACIÓN FINAL
-- ============================================================================

-- Consultar todas las foreign keys creadas
SELECT
  TABLE_NAME,
  COLUMN_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'micro_app'
  AND REFERENCED_TABLE_NAME IS NOT NULL
  AND TABLE_NAME IN (
    'tipo_credito', 'solicitud', 'prestamo', 'plan_pago', 'pago',
    'pago_detalle_cuota', 'deduccion_prestamo', 'recargo_prestamo',
    'decision_comite', 'solicitud_historial'
  )
ORDER BY TABLE_NAME, COLUMN_NAME;

-- ============================================================================
-- NOTAS FINALES
-- ============================================================================

-- 1. Si alguna FK falla, verificar los datos huérfanos en las validaciones
-- 2. Las FK con ON DELETE CASCADE eliminarán registros relacionados automáticamente
-- 3. Las FK con ON DELETE RESTRICT impedirán la eliminación si hay registros relacionados
-- 4. Las FK con ON DELETE SET NULL establecerán el campo a NULL
-- 5. Considerar crear índices adicionales si hay consultas lentas en las FK
