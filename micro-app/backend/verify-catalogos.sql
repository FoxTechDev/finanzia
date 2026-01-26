-- =====================================================
-- SCRIPT DE VERIFICACIÓN DE CATÁLOGOS
-- Verifica que todas las tablas y datos estén correctos
-- =====================================================

USE micro_app;

-- =====================================================
-- 1. VERIFICAR QUE TODAS LAS TABLAS EXISTEN
-- =====================================================

SELECT 'VERIFICANDO TABLAS DE CATÁLOGOS...' as '';

SELECT
    TABLE_NAME,
    TABLE_ROWS as 'Registros'
FROM
    INFORMATION_SCHEMA.TABLES
WHERE
    TABLE_SCHEMA = 'micro_app'
    AND TABLE_NAME IN (
        'estado_garantia',
        'recomendacion_asesor',
        'tipo_decision_comite',
        'tipo_pago',
        'estado_pago',
        'sexo',
        'estado_solicitud',
        'destino_credito',
        'estado_cuota',
        'tipo_interes',
        'periodicidad_pago',
        'categoria_ncb022',
        'tipo_calculo'
    )
ORDER BY TABLE_NAME;

-- =====================================================
-- 2. VERIFICAR CANTIDAD DE REGISTROS POR CATÁLOGO
-- =====================================================

SELECT 'VERIFICANDO CANTIDAD DE REGISTROS...' as '';

SELECT 'estado_garantia' as Catalogo, COUNT(*) as Total, SUM(activo) as Activos FROM estado_garantia
UNION ALL
SELECT 'recomendacion_asesor', COUNT(*), SUM(activo) FROM recomendacion_asesor
UNION ALL
SELECT 'tipo_decision_comite', COUNT(*), SUM(activo) FROM tipo_decision_comite
UNION ALL
SELECT 'tipo_pago', COUNT(*), SUM(activo) FROM tipo_pago
UNION ALL
SELECT 'estado_pago', COUNT(*), SUM(activo) FROM estado_pago
UNION ALL
SELECT 'sexo', COUNT(*), SUM(activo) FROM sexo
UNION ALL
SELECT 'estado_solicitud', COUNT(*), SUM(activo) FROM estado_solicitud
UNION ALL
SELECT 'destino_credito', COUNT(*), SUM(activo) FROM destino_credito
UNION ALL
SELECT 'estado_cuota', COUNT(*), SUM(activo) FROM estado_cuota
UNION ALL
SELECT 'tipo_interes', COUNT(*), SUM(activo) FROM tipo_interes
UNION ALL
SELECT 'periodicidad_pago', COUNT(*), SUM(activo) FROM periodicidad_pago
UNION ALL
SELECT 'categoria_ncb022', COUNT(*), SUM(activo) FROM categoria_ncb022
UNION ALL
SELECT 'tipo_calculo', COUNT(*), SUM(activo) FROM tipo_calculo;

-- =====================================================
-- 3. VERIFICAR DATOS DE CADA CATÁLOGO
-- =====================================================

SELECT 'VERIFICANDO ESTADO_GARANTIA...' as '';
SELECT id, codigo, nombre, orden, activo FROM estado_garantia ORDER BY orden;

SELECT 'VERIFICANDO RECOMENDACION_ASESOR...' as '';
SELECT id, codigo, nombre, orden, activo FROM recomendacion_asesor ORDER BY orden;

SELECT 'VERIFICANDO TIPO_DECISION_COMITE...' as '';
SELECT id, codigo, nombre, orden, activo FROM tipo_decision_comite ORDER BY orden;

SELECT 'VERIFICANDO TIPO_PAGO...' as '';
SELECT id, codigo, nombre, orden, activo FROM tipo_pago ORDER BY orden;

SELECT 'VERIFICANDO ESTADO_PAGO...' as '';
SELECT id, codigo, nombre, orden, activo FROM estado_pago ORDER BY orden;

SELECT 'VERIFICANDO SEXO...' as '';
SELECT id, codigo, nombre, orden, activo FROM sexo ORDER BY orden;

SELECT 'VERIFICANDO ESTADO_SOLICITUD...' as '';
SELECT id, codigo, nombre, orden, activo FROM estado_solicitud ORDER BY orden;

SELECT 'VERIFICANDO DESTINO_CREDITO...' as '';
SELECT id, codigo, nombre, orden, activo FROM destino_credito ORDER BY orden;

SELECT 'VERIFICANDO ESTADO_CUOTA...' as '';
SELECT id, codigo, nombre, orden, activo FROM estado_cuota ORDER BY orden;

SELECT 'VERIFICANDO TIPO_INTERES...' as '';
SELECT id, codigo, nombre, orden, activo FROM tipo_interes ORDER BY orden;

SELECT 'VERIFICANDO PERIODICIDAD_PAGO...' as '';
SELECT id, codigo, nombre, orden, activo FROM periodicidad_pago ORDER BY orden;

SELECT 'VERIFICANDO CATEGORIA_NCB022...' as '';
SELECT id, codigo, nombre, orden, activo FROM categoria_ncb022 ORDER BY orden;

SELECT 'VERIFICANDO TIPO_CALCULO...' as '';
SELECT id, codigo, nombre, orden, activo FROM tipo_calculo ORDER BY orden;

-- =====================================================
-- 4. VERIFICAR CÓDIGOS ÚNICOS (No debe haber duplicados)
-- =====================================================

SELECT 'VERIFICANDO CÓDIGOS ÚNICOS...' as '';

SELECT
    'estado_garantia' as Tabla,
    codigo,
    COUNT(*) as Duplicados
FROM estado_garantia
GROUP BY codigo
HAVING COUNT(*) > 1

UNION ALL

SELECT 'recomendacion_asesor', codigo, COUNT(*)
FROM recomendacion_asesor
GROUP BY codigo
HAVING COUNT(*) > 1

UNION ALL

SELECT 'tipo_decision_comite', codigo, COUNT(*)
FROM tipo_decision_comite
GROUP BY codigo
HAVING COUNT(*) > 1

UNION ALL

SELECT 'tipo_pago', codigo, COUNT(*)
FROM tipo_pago
GROUP BY codigo
HAVING COUNT(*) > 1

UNION ALL

SELECT 'estado_pago', codigo, COUNT(*)
FROM estado_pago
GROUP BY codigo
HAVING COUNT(*) > 1

UNION ALL

SELECT 'sexo', codigo, COUNT(*)
FROM sexo
GROUP BY codigo
HAVING COUNT(*) > 1

UNION ALL

SELECT 'estado_solicitud', codigo, COUNT(*)
FROM estado_solicitud
GROUP BY codigo
HAVING COUNT(*) > 1

UNION ALL

SELECT 'destino_credito', codigo, COUNT(*)
FROM destino_credito
GROUP BY codigo
HAVING COUNT(*) > 1

UNION ALL

SELECT 'estado_cuota', codigo, COUNT(*)
FROM estado_cuota
GROUP BY codigo
HAVING COUNT(*) > 1

UNION ALL

SELECT 'tipo_interes', codigo, COUNT(*)
FROM tipo_interes
GROUP BY codigo
HAVING COUNT(*) > 1

UNION ALL

SELECT 'periodicidad_pago', codigo, COUNT(*)
FROM periodicidad_pago
GROUP BY codigo
HAVING COUNT(*) > 1

UNION ALL

SELECT 'categoria_ncb022', codigo, COUNT(*)
FROM categoria_ncb022
GROUP BY codigo
HAVING COUNT(*) > 1

UNION ALL

SELECT 'tipo_calculo', codigo, COUNT(*)
FROM tipo_calculo
GROUP BY codigo
HAVING COUNT(*) > 1;

-- Si esta consulta no devuelve filas, todos los códigos son únicos ✓

-- =====================================================
-- 5. VERIFICAR COLUMNAS FK AGREGADAS
-- =====================================================

SELECT 'VERIFICANDO COLUMNAS FK...' as '';

SELECT
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'micro_app'
    AND (
        COLUMN_NAME LIKE '%Id' AND TABLE_NAME IN (
            'garantia',
            'solicitud',
            'decision_comite',
            'pago',
            'persona',
            'plan_pago',
            'prestamo',
            'tipo_deduccion'
        )
        AND COLUMN_NAME IN (
            'estadoGarantiaId',
            'recomendacionAsesorId',
            'estadoSolicitudId',
            'destinoCreditoId',
            'tipoDecisionComiteId',
            'tipoPagoId',
            'estadoPagoId',
            'sexoId',
            'estadoCuotaId',
            'tipoInteresId',
            'periodicidadPagoId',
            'categoriaNcb022Id',
            'tipoCalculoId'
        )
    )
ORDER BY TABLE_NAME, COLUMN_NAME;

-- =====================================================
-- 6. VERIFICAR FOREIGN KEYS
-- =====================================================

SELECT 'VERIFICANDO FOREIGN KEYS...' as '';

SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE
    TABLE_SCHEMA = 'micro_app'
    AND REFERENCED_TABLE_NAME IN (
        'estado_garantia',
        'recomendacion_asesor',
        'tipo_decision_comite',
        'tipo_pago',
        'estado_pago',
        'sexo',
        'estado_solicitud',
        'destino_credito',
        'estado_cuota',
        'tipo_interes',
        'periodicidad_pago',
        'categoria_ncb022',
        'tipo_calculo'
    )
ORDER BY TABLE_NAME, COLUMN_NAME;

-- =====================================================
-- 7. VERIFICAR ÍNDICES
-- =====================================================

SELECT 'VERIFICANDO ÍNDICES...' as '';

SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM
    INFORMATION_SCHEMA.STATISTICS
WHERE
    TABLE_SCHEMA = 'micro_app'
    AND (
        INDEX_NAME LIKE 'IDX_%'
        AND TABLE_NAME IN (
            'garantia',
            'solicitud',
            'decision_comite',
            'pago',
            'persona',
            'plan_pago',
            'prestamo',
            'tipo_deduccion'
        )
    )
ORDER BY TABLE_NAME, INDEX_NAME;

-- =====================================================
-- 8. VERIFICAR MIGRACIÓN DE DATOS
-- =====================================================

SELECT 'VERIFICANDO MIGRACIÓN DE DATOS...' as '';

-- Verificar que las columnas FK tienen valores
SELECT
    'garantia' as Tabla,
    COUNT(*) as Total,
    SUM(CASE WHEN estadoGarantiaId IS NOT NULL THEN 1 ELSE 0 END) as Migrados,
    SUM(CASE WHEN estadoGarantiaId IS NULL THEN 1 ELSE 0 END) as NoMigrados
FROM garantia
WHERE EXISTS (SELECT 1 FROM garantia LIMIT 1)

UNION ALL

SELECT
    'solicitud',
    COUNT(*),
    SUM(CASE WHEN estadoSolicitudId IS NOT NULL THEN 1 ELSE 0 END),
    SUM(CASE WHEN estadoSolicitudId IS NULL THEN 1 ELSE 0 END)
FROM solicitud
WHERE EXISTS (SELECT 1 FROM solicitud LIMIT 1)

UNION ALL

SELECT
    'pago',
    COUNT(*),
    SUM(CASE WHEN tipoPagoId IS NOT NULL THEN 1 ELSE 0 END),
    SUM(CASE WHEN tipoPagoId IS NULL THEN 1 ELSE 0 END)
FROM pago
WHERE EXISTS (SELECT 1 FROM pago LIMIT 1)

UNION ALL

SELECT
    'plan_pago',
    COUNT(*),
    SUM(CASE WHEN estadoCuotaId IS NOT NULL THEN 1 ELSE 0 END),
    SUM(CASE WHEN estadoCuotaId IS NULL THEN 1 ELSE 0 END)
FROM plan_pago
WHERE EXISTS (SELECT 1 FROM plan_pago LIMIT 1)

UNION ALL

SELECT
    'prestamo',
    COUNT(*),
    SUM(CASE WHEN tipoInteresId IS NOT NULL THEN 1 ELSE 0 END),
    SUM(CASE WHEN tipoInteresId IS NULL THEN 1 ELSE 0 END)
FROM prestamo
WHERE EXISTS (SELECT 1 FROM prestamo LIMIT 1);

-- =====================================================
-- 9. RESUMEN FINAL
-- =====================================================

SELECT 'RESUMEN FINAL' as '';

SELECT
    '✓ Tablas de catálogos' as Check,
    COUNT(*) as Cantidad
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'micro_app'
AND TABLE_NAME IN (
    'estado_garantia',
    'recomendacion_asesor',
    'tipo_decision_comite',
    'tipo_pago',
    'estado_pago',
    'sexo',
    'estado_solicitud',
    'destino_credito',
    'estado_cuota',
    'tipo_interes',
    'periodicidad_pago',
    'categoria_ncb022',
    'tipo_calculo'
)

UNION ALL

SELECT
    '✓ Registros totales',
    SUM(total) as cantidad
FROM (
    SELECT COUNT(*) as total FROM estado_garantia
    UNION ALL SELECT COUNT(*) FROM recomendacion_asesor
    UNION ALL SELECT COUNT(*) FROM tipo_decision_comite
    UNION ALL SELECT COUNT(*) FROM tipo_pago
    UNION ALL SELECT COUNT(*) FROM estado_pago
    UNION ALL SELECT COUNT(*) FROM sexo
    UNION ALL SELECT COUNT(*) FROM estado_solicitud
    UNION ALL SELECT COUNT(*) FROM destino_credito
    UNION ALL SELECT COUNT(*) FROM estado_cuota
    UNION ALL SELECT COUNT(*) FROM tipo_interes
    UNION ALL SELECT COUNT(*) FROM periodicidad_pago
    UNION ALL SELECT COUNT(*) FROM categoria_ncb022
    UNION ALL SELECT COUNT(*) FROM tipo_calculo
) as counts

UNION ALL

SELECT
    '✓ Foreign Keys',
    COUNT(DISTINCT CONSTRAINT_NAME)
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'micro_app'
AND REFERENCED_TABLE_NAME IN (
    'estado_garantia',
    'recomendacion_asesor',
    'tipo_decision_comite',
    'tipo_pago',
    'estado_pago',
    'sexo',
    'estado_solicitud',
    'destino_credito',
    'estado_cuota',
    'tipo_interes',
    'periodicidad_pago',
    'categoria_ncb022',
    'tipo_calculo'
);

-- =====================================================
-- FIN DE VERIFICACIÓN
-- =====================================================

SELECT 'VERIFICACIÓN COMPLETADA' as '';
SELECT 'Si todos los checks muestran los valores esperados, la implementación es correcta' as '';
