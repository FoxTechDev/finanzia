-- =====================================================
-- SCRIPT DE ROLLBACK - MIGRACIÓN DE CRÉDITOS
-- USO: Solo si la migración falló o se detectaron errores
-- ADVERTENCIA: Este script ELIMINA todos los registros migrados
-- =====================================================

USE micro_app;

-- Confirmar antes de ejecutar
SELECT '
⚠️  ADVERTENCIA ⚠️

Este script eliminará TODOS los registros de créditos migrados desde Excel.

Para continuar, ejecute las siguientes líneas manualmente:
' AS ATENCION;

-- =====================================================
-- PASO 1: Hacer backup antes del rollback (RECOMENDADO)
-- =====================================================

-- Ejecutar esto en terminal ANTES del rollback:
-- mysqldump -u root -p micro_app solicitud prestamo pago plan_pago > backup_before_rollback.sql

-- =====================================================
-- PASO 2: Deshabilitar verificaciones
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;

-- =====================================================
-- PASO 3: Eliminar pagos migrados
-- =====================================================

-- Opción A: Eliminar SOLO los registros migrados (recomendado)
DELETE FROM pago
WHERE observaciones = 'Pago migrado desde Excel'
  OR nombreUsuario = 'Sistema';

-- Opción B: Eliminar TODOS los pagos (usar solo si toda la tabla es migración)
-- TRUNCATE TABLE pago;

SELECT CONCAT('Pagos eliminados: ', ROW_COUNT()) AS Resultado;

-- =====================================================
-- PASO 4: Eliminar plan de pagos (si se generó)
-- =====================================================

-- Si generaste planes de pago después de la migración
DELETE FROM plan_pago
WHERE prestamoId IN (
  SELECT id FROM prestamo WHERE nombreUsuarioDesembolso = 'Sistema'
);

-- O truncar toda la tabla
-- TRUNCATE TABLE plan_pago;

SELECT CONCAT('Planes de pago eliminados: ', ROW_COUNT()) AS Resultado;

-- =====================================================
-- PASO 5: Eliminar préstamos migrados
-- =====================================================

-- Opción A: Eliminar SOLO los registros migrados (recomendado)
DELETE FROM prestamo
WHERE nombreUsuarioDesembolso = 'Sistema'
  OR numeroCredito LIKE 'CRE-%';

-- Opción B: Eliminar TODOS los préstamos
-- TRUNCATE TABLE prestamo;

SELECT CONCAT('Préstamos eliminados: ', ROW_COUNT()) AS Resultado;

-- =====================================================
-- PASO 6: Eliminar solicitudes migradas
-- =====================================================

-- Opción A: Eliminar SOLO los registros migrados (recomendado)
DELETE FROM solicitud
WHERE observaciones = 'Solicitud migrada desde Excel'
  OR nombreAnalista = 'Sistema';

-- Opción B: Eliminar TODAS las solicitudes
-- TRUNCATE TABLE solicitud;

SELECT CONCAT('Solicitudes eliminadas: ', ROW_COUNT()) AS Resultado;

-- =====================================================
-- PASO 7: Eliminar historial de solicitudes (si existe)
-- =====================================================

DELETE FROM solicitud_historial
WHERE solicitudId NOT IN (SELECT id FROM solicitud);

SELECT CONCAT('Historiales huérfanos eliminados: ', ROW_COUNT()) AS Resultado;

-- =====================================================
-- PASO 8: Eliminar garantías huérfanas (si existen)
-- =====================================================

DELETE FROM garantia
WHERE solicitudId NOT IN (SELECT id FROM solicitud);

SELECT CONCAT('Garantías huérfanas eliminadas: ', ROW_COUNT()) AS Resultado;

-- =====================================================
-- PASO 9: Eliminar decisiones de comité huérfanas
-- =====================================================

DELETE FROM decision_comite
WHERE solicitudId NOT IN (SELECT id FROM solicitud);

SELECT CONCAT('Decisiones de comité huérfanas eliminadas: ', ROW_COUNT()) AS Resultado;

-- =====================================================
-- PASO 10: Reestablecer auto_increment (opcional)
-- =====================================================

-- Resetear los contadores de ID para que empiecen en 1
ALTER TABLE solicitud AUTO_INCREMENT = 1;
ALTER TABLE prestamo AUTO_INCREMENT = 1;
ALTER TABLE pago AUTO_INCREMENT = 1;
ALTER TABLE plan_pago AUTO_INCREMENT = 1;

-- =====================================================
-- PASO 11: Rehabilitar verificaciones
-- =====================================================

SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;

-- =====================================================
-- PASO 12: Verificar resultado del rollback
-- =====================================================

SELECT '==== RESULTADO DEL ROLLBACK ====' AS '';

SELECT 'Solicitudes' AS Tabla, COUNT(*) AS RegistrosRestantes FROM solicitud;
SELECT 'Préstamos' AS Tabla, COUNT(*) AS RegistrosRestantes FROM prestamo;
SELECT 'Pagos' AS Tabla, COUNT(*) AS RegistrosRestantes FROM pago;
SELECT 'Plan de Pagos' AS Tabla, COUNT(*) AS RegistrosRestantes FROM plan_pago;

SELECT '
✓ Rollback completado

Si todos los contadores muestran 0 (o el número esperado si había datos previos),
el rollback fue exitoso.

Puedes volver a ejecutar la migración corrigiendo los errores detectados.
' AS Conclusion;

-- =====================================================
-- ROLLBACK COMPLETO - OPCIÓN NUCLEAR (usar con extremo cuidado)
-- =====================================================

-- Si necesitas eliminar TODO (incluyendo datos no migrados),
-- descomenta y ejecuta esto:

/*
TRUNCATE TABLE pago_detalle_cuota;
TRUNCATE TABLE pago;
TRUNCATE TABLE plan_pago;
TRUNCATE TABLE recargo_prestamo;
TRUNCATE TABLE deduccion_prestamo;
TRUNCATE TABLE prestamo;
TRUNCATE TABLE garantia_documentaria;
TRUNCATE TABLE garantia_fiador;
TRUNCATE TABLE garantia_hipotecaria;
TRUNCATE TABLE garantia_prendaria;
TRUNCATE TABLE garantia;
TRUNCATE TABLE decision_comite;
TRUNCATE TABLE solicitud_historial;
TRUNCATE TABLE solicitud;

SELECT 'ROLLBACK NUCLEAR COMPLETADO - Todas las tablas de créditos vaciadas' AS Status;
*/
