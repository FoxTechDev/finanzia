-- ============================================================
-- MIGRACION: Mejoras de auditoría e integridad de datos
-- Fecha: 2026-04-02
-- Descripcion: Agrega columnas de soft delete, audit trail,
--              unique constraints y estandariza precision decimal
-- ============================================================

-- IMPORTANTE: Ejecutar en orden. Si alguna columna ya existe,
-- el ALTER TABLE dara error y se puede omitir esa linea.

-- ============================================================
-- 1. SOFT DELETE - Columnas deletedAt para borrado logico
-- ============================================================

ALTER TABLE solicitud ADD COLUMN deletedAt datetime(6) NULL DEFAULT NULL;
ALTER TABLE prestamo ADD COLUMN deletedAt datetime(6) NULL DEFAULT NULL;
ALTER TABLE pago ADD COLUMN deletedAt datetime(6) NULL DEFAULT NULL;
ALTER TABLE cuenta_ahorro ADD COLUMN deletedAt datetime(6) NULL DEFAULT NULL;

-- ============================================================
-- 2. AUDIT TRAIL - Columna updatedAt en tablas de detalle
-- ============================================================

-- pago_detalle_cuota: rastrear cuando se modifico un detalle de pago
ALTER TABLE pago_detalle_cuota ADD COLUMN updatedAt datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6);

-- plan_pago: verificar si ya existe (creada en migraciones previas)
-- Si da error "Duplicate column name", omitir esta linea
-- ALTER TABLE plan_pago ADD COLUMN updatedAt datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6);

-- ============================================================
-- 3. UNIQUE CONSTRAINT - Evitar cuotas duplicadas por prestamo
-- ============================================================

-- Primero eliminar el indice no-unico existente si lo hay
-- (el nombre puede variar; verificar con SHOW INDEX FROM plan_pago)
DROP INDEX IF EXISTS `IDX_plan_pago_prestamoId_numeroCuota` ON plan_pago;

-- Crear indice unico compuesto
ALTER TABLE plan_pago ADD UNIQUE INDEX `UQ_plan_pago_prestamoId_numeroCuota` (prestamoId, numeroCuota);

-- ============================================================
-- 4. PRECISION DECIMAL - Estandarizar tasas de interes
--    De precision 5,2 a precision 8,4 (igual que tabla prestamo)
-- ============================================================

ALTER TABLE solicitud MODIFY COLUMN tasaInteresPropuesta decimal(8,4) NULL;
ALTER TABLE solicitud MODIFY COLUMN tasaInteresAprobada decimal(8,4) NULL;

-- ============================================================
-- VERIFICACION: Ejecutar estas consultas para confirmar
-- ============================================================

-- SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_SCHEMA = 'micro_app'
--   AND TABLE_NAME = 'solicitud'
--   AND COLUMN_NAME IN ('deletedAt', 'tasaInteresPropuesta', 'tasaInteresAprobada');

-- SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_SCHEMA = 'micro_app'
--   AND TABLE_NAME IN ('prestamo', 'pago', 'cuenta_ahorro')
--   AND COLUMN_NAME = 'deletedAt';

-- SHOW INDEX FROM plan_pago WHERE Key_name = 'UQ_plan_pago_prestamoId_numeroCuota';
