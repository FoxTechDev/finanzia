-- Script para migrar datos existentes de tipo de vivienda (string) a IDs
-- Este script debe ejecutarse DESPUÉS de:
-- 1. Ejecutar la migración AddCodigoOrdenToTipoVivienda
-- 2. Insertar los tipos de vivienda predeterminados (seed-tipos-vivienda.sql)

-- PASO 1: Verificar cuántos registros tienen tipoVivienda como string
SELECT
    tipoVivienda,
    COUNT(*) as total
FROM direccion
WHERE tipoVivienda IS NOT NULL
GROUP BY tipoVivienda
ORDER BY total DESC;

-- PASO 2: Ver qué tipos de vivienda existen en el catálogo
SELECT id, codigo, nombre FROM tipo_vivienda ORDER BY orden;

-- PASO 3: Agregar columna tipoViviendaId si no existe
-- (Esta columna debería existir desde la migración original de direccion)
-- ALTER TABLE direccion ADD COLUMN tipoViviendaId INT NULL;
-- ALTER TABLE direccion ADD CONSTRAINT fk_direccion_tipo_vivienda
--   FOREIGN KEY (tipoViviendaId) REFERENCES tipo_vivienda(idTipoVivienda);

-- PASO 4: Migrar datos - Mapeo directo de nombres
UPDATE direccion d
INNER JOIN tipo_vivienda tv ON LOWER(TRIM(d.tipoVivienda)) = LOWER(TRIM(tv.nombre))
SET d.tipoViviendaId = tv.id
WHERE d.tipoVivienda IS NOT NULL
  AND d.tipoViviendaId IS NULL;

-- PASO 5: Migrar casos comunes que no coinciden exactamente
-- Mapear variaciones de "Propia"
UPDATE direccion d
INNER JOIN tipo_vivienda tv ON tv.codigo = 'PROPIA'
SET d.tipoViviendaId = tv.id
WHERE d.tipoVivienda IS NOT NULL
  AND d.tipoViviendaId IS NULL
  AND (
    LOWER(TRIM(d.tipoVivienda)) IN ('propia', 'casa propia', 'vivienda propia', 'propiedad')
    OR LOWER(TRIM(d.tipoVivienda)) LIKE '%propia%'
  );

-- Mapear variaciones de "Alquilada"
UPDATE direccion d
INNER JOIN tipo_vivienda tv ON tv.codigo = 'ALQUILADA'
SET d.tipoViviendaId = tv.id
WHERE d.tipoVivienda IS NOT NULL
  AND d.tipoViviendaId IS NULL
  AND (
    LOWER(TRIM(d.tipoVivienda)) IN ('alquilada', 'alquilado', 'renta', 'rentada', 'arrendada')
    OR LOWER(TRIM(d.tipoVivienda)) LIKE '%alquil%'
    OR LOWER(TRIM(d.tipoVivienda)) LIKE '%rent%'
  );

-- Mapear variaciones de "Familiar"
UPDATE direccion d
INNER JOIN tipo_vivienda tv ON tv.codigo = 'FAMILIAR'
SET d.tipoViviendaId = tv.id
WHERE d.tipoVivienda IS NOT NULL
  AND d.tipoViviendaId IS NULL
  AND (
    LOWER(TRIM(d.tipoVivienda)) IN ('familiar', 'familia', 'de familiar', 'familiares')
    OR LOWER(TRIM(d.tipoVivienda)) LIKE '%familiar%'
  );

-- Mapear variaciones de "Prestada"
UPDATE direccion d
INNER JOIN tipo_vivienda tv ON tv.codigo = 'PRESTADA'
SET d.tipoViviendaId = tv.id
WHERE d.tipoVivienda IS NOT NULL
  AND d.tipoViviendaId IS NULL
  AND (
    LOWER(TRIM(d.tipoVivienda)) IN ('prestada', 'prestado', 'prestamo')
    OR LOWER(TRIM(d.tipoVivienda)) LIKE '%prest%'
  );

-- Mapear todo lo demás a "Otra"
UPDATE direccion d
INNER JOIN tipo_vivienda tv ON tv.codigo = 'OTRA'
SET d.tipoViviendaId = tv.id
WHERE d.tipoVivienda IS NOT NULL
  AND d.tipoViviendaId IS NULL;

-- PASO 6: Verificar resultados de la migración
SELECT
    CASE
        WHEN d.tipoViviendaId IS NOT NULL THEN 'MIGRADO'
        WHEN d.tipoVivienda IS NULL THEN 'SIN_DATO'
        ELSE 'NO_MIGRADO'
    END as estado,
    COUNT(*) as total
FROM direccion d
GROUP BY estado;

-- PASO 7: Ver detalles de registros migrados
SELECT
    d.tipoVivienda as vivienda_antigua,
    tv.nombre as tipo_nuevo,
    COUNT(*) as total
FROM direccion d
LEFT JOIN tipo_vivienda tv ON d.tipoViviendaId = tv.id
WHERE d.tipoVivienda IS NOT NULL
GROUP BY d.tipoVivienda, tv.nombre
ORDER BY total DESC;

-- PASO 8: Identificar registros que no se migraron (si hay alguno)
SELECT
    idDireccion,
    tipoVivienda,
    tipoViviendaId
FROM direccion
WHERE tipoVivienda IS NOT NULL
  AND tipoViviendaId IS NULL
LIMIT 50;

-- PASO 9: OPCIONAL - Limpiar campo tipoVivienda después de verificar que todo migró correctamente
-- ADVERTENCIA: Ejecutar solo después de verificar que todos los datos se migraron correctamente
-- y que el sistema frontend está usando tipoViviendaId

-- UPDATE direccion SET tipoVivienda = NULL WHERE tipoViviendaId IS NOT NULL;

-- PASO 10: Verificación final
SELECT
    'Total direcciones' as metrica,
    COUNT(*) as valor
FROM direccion
UNION ALL
SELECT
    'Con tipoViviendaId',
    COUNT(*)
FROM direccion
WHERE tipoViviendaId IS NOT NULL
UNION ALL
SELECT
    'Con tipoVivienda (string)',
    COUNT(*)
FROM direccion
WHERE tipoVivienda IS NOT NULL
UNION ALL
SELECT
    'Sin tipo de vivienda',
    COUNT(*)
FROM direccion
WHERE tipoVivienda IS NULL AND tipoViviendaId IS NULL;

-- Resumen por tipo
SELECT
    tv.codigo,
    tv.nombre,
    COUNT(d.idDireccion) as total_direcciones
FROM tipo_vivienda tv
LEFT JOIN direccion d ON d.tipoViviendaId = tv.id
GROUP BY tv.id, tv.codigo, tv.nombre
ORDER BY tv.orden;
