-- =====================================================
-- SCRIPT OPCIONAL: Eliminar columnas ENUM antiguas
-- ADVERTENCIA: Solo ejecutar después de verificar que
-- todas las relaciones con catálogos funcionan correctamente
-- =====================================================

-- IMPORTANTE: Hacer backup de la base de datos antes de ejecutar

-- 1. Eliminar columna enum de garantia
ALTER TABLE `garantia`
DROP COLUMN `estado`;

-- 2. Eliminar columnas enum de solicitud
ALTER TABLE `solicitud`
DROP COLUMN `recomendacionAsesor`,
DROP COLUMN `estado`,
DROP COLUMN `destinoCredito`;

-- 3. Eliminar columna enum de decision_comite
ALTER TABLE `decision_comite`
DROP COLUMN `tipoDecision`;

-- 4. Eliminar columnas enum de pago
ALTER TABLE `pago`
DROP COLUMN `tipoPago`,
DROP COLUMN `estado`;

-- 5. Eliminar columna enum de persona
ALTER TABLE `persona`
DROP COLUMN `sexo`;

-- 6. Eliminar columna enum de plan_pago
ALTER TABLE `plan_pago`
DROP COLUMN `estado`;

-- 7. Eliminar columnas enum de prestamo
ALTER TABLE `prestamo`
DROP COLUMN `tipoInteres`,
DROP COLUMN `periodicidadPago`,
DROP COLUMN `categoriaNCB022`;

-- 8. Eliminar columna enum de tipo_deduccion
ALTER TABLE `tipo_deduccion`
DROP COLUMN `tipoCalculoDefault`;

-- =====================================================
-- Verificar que las columnas fueron eliminadas
-- =====================================================

SELECT
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'micro_app'
    AND DATA_TYPE = 'enum'
ORDER BY
    TABLE_NAME, COLUMN_NAME;

-- Si el resultado está vacío, todas las columnas enum fueron eliminadas exitosamente
