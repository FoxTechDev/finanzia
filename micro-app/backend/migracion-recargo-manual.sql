-- ============================================
-- MIGRACIÓN: Agregar campos de recargo manual a tipo_credito y pago
-- Fecha: 2026-02-01
-- Descripción:
--   Los tipos de crédito con aplicaRecargoManual = true:
--   - NO generarán interés moratorio automáticamente
--   - NO calcularán capital en mora
--   - Mostrarán un campo editable de recargo al registrar pagos con atraso
--   - El monto por defecto del recargo se toma de montoRecargo del tipo de crédito
-- ============================================

-- =====================
-- TABLA: tipo_credito
-- =====================

-- Verificar si la columna ya existe antes de agregarla (MySQL)
SET @dbname = DATABASE();
SET @tablename = 'tipo_credito';

-- Agregar columna aplicaRecargoManual si no existe
SET @columnname = 'aplicaRecargoManual';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT ''La columna aplicaRecargoManual ya existe''',
  'ALTER TABLE tipo_credito ADD COLUMN aplicaRecargoManual BOOLEAN DEFAULT FALSE'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar columna montoRecargo si no existe
SET @columnname = 'montoRecargo';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT ''La columna montoRecargo ya existe''',
  'ALTER TABLE tipo_credito ADD COLUMN montoRecargo DECIMAL(14, 2) DEFAULT 0.00'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- =====================
-- TABLA: pago
-- =====================
SET @tablename = 'pago';

-- Agregar columna recargoManualAplicado si no existe
SET @columnname = 'recargoManualAplicado';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT ''La columna recargoManualAplicado ya existe''',
  'ALTER TABLE pago ADD COLUMN recargoManualAplicado DECIMAL(14, 2) DEFAULT 0.00'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- =====================
-- VERIFICACIÓN
-- =====================
SELECT 'Verificando columnas agregadas:' as mensaje;

SELECT
    'tipo_credito' as tabla,
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_DEFAULT,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tipo_credito'
    AND COLUMN_NAME IN ('aplicaRecargoManual', 'montoRecargo')
UNION ALL
SELECT
    'pago' as tabla,
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_DEFAULT,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'pago'
    AND COLUMN_NAME = 'recargoManualAplicado';

-- =====================
-- EJEMPLO DE USO
-- =====================
-- Para habilitar recargo manual en un tipo de crédito:
-- UPDATE tipo_credito SET aplicaRecargoManual = TRUE, montoRecargo = 5.00 WHERE id = 1;
--
-- Esto hará que:
-- 1. No se calcule interés moratorio automático para préstamos de este tipo
-- 2. Al registrar un pago con atraso, aparezca un campo editable con $5.00 por defecto
-- 3. El usuario pueda modificar el monto del recargo antes de confirmar el pago
