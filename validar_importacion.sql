-- =============================================
-- SCRIPT DE VALIDACIÓN POST-IMPORTACIÓN
-- Sistema de Microcréditos
-- =============================================
--
-- Ejecute este script después de importar los datos
-- para validar la integridad y consistencia
--
-- =============================================

\echo '================================================'
\echo 'VALIDACIÓN DE IMPORTACIÓN DE DATOS'
\echo '================================================'
\echo ''

-- =============================================
-- 1. CONTEO DE REGISTROS IMPORTADOS
-- =============================================

\echo '1. CONTEO DE REGISTROS IMPORTADOS'
\echo '-----------------------------------'

SELECT
  'Personas' as tabla,
  COUNT(*) as registros,
  67 as esperados,
  CASE WHEN COUNT(*) = 67 THEN 'OK' ELSE 'ERROR' END as status
FROM persona
WHERE "numeroDui" LIKE '10000%'

UNION ALL

SELECT
  'Direcciones' as tabla,
  COUNT(*) as registros,
  67 as esperados,
  CASE WHEN COUNT(*) = 67 THEN 'OK' ELSE 'ERROR' END as status
FROM direccion
WHERE "idPersona" IN (SELECT "idPersona" FROM persona WHERE "numeroDui" LIKE '10000%')

UNION ALL

SELECT
  'Préstamos' as tabla,
  COUNT(*) as registros,
  170 as esperados,
  CASE WHEN COUNT(*) = 170 THEN 'OK' ELSE 'ERROR' END as status
FROM prestamo
WHERE "numeroCredito" LIKE 'CRE2026%'

UNION ALL

SELECT
  'Pagos' as tabla,
  COUNT(*) as registros,
  969 as esperados,
  CASE WHEN COUNT(*) = 969 THEN 'OK' ELSE 'ERROR' END as status
FROM pago
WHERE "numeroPago" LIKE 'PAG2026%';

\echo ''

-- =============================================
-- 2. VALIDACIÓN DE INTEGRIDAD REFERENCIAL
-- =============================================

\echo '2. VALIDACIÓN DE INTEGRIDAD REFERENCIAL'
\echo '----------------------------------------'

-- Direcciones sin persona
\echo 'Direcciones sin persona válida:'
SELECT COUNT(*) as errores
FROM direccion d
LEFT JOIN persona p ON d."idPersona" = p."idPersona"
WHERE p."idPersona" IS NULL
  AND d."idPersona" IN (SELECT "idPersona" FROM persona WHERE "numeroDui" LIKE '10000%');

-- Préstamos sin persona
\echo 'Préstamos sin persona válida:'
SELECT COUNT(*) as errores
FROM prestamo pr
LEFT JOIN persona p ON pr."personaId" = p."idPersona"
WHERE p."idPersona" IS NULL
  AND pr."numeroCredito" LIKE 'CRE2026%';

-- Pagos sin préstamo
\echo 'Pagos sin préstamo válido:'
SELECT COUNT(*) as errores
FROM pago pg
LEFT JOIN prestamo pr ON pg."prestamoId" = pr.id
WHERE pr.id IS NULL
  AND pg."numeroPago" LIKE 'PAG2026%';

\echo ''

-- =============================================
-- 3. VALIDACIÓN DE MONTOS FINANCIEROS
-- =============================================

\echo '3. VALIDACIÓN DE MONTOS FINANCIEROS'
\echo '------------------------------------'

-- Totales esperados
SELECT
  'Total Desembolsado' as metrica,
  ROUND(SUM("montoDesembolsado")::numeric, 2) as valor_actual,
  48702.50 as valor_esperado,
  CASE
    WHEN ABS(SUM("montoDesembolsado") - 48702.50) < 0.01 THEN 'OK'
    ELSE 'REVISAR'
  END as status
FROM prestamo
WHERE "numeroCredito" LIKE 'CRE2026%'

UNION ALL

SELECT
  'Total Pagado' as metrica,
  ROUND(SUM("montoPagado")::numeric, 2) as valor_actual,
  45209.30 as valor_esperado,
  CASE
    WHEN ABS(SUM("montoPagado") - 45209.30) < 0.01 THEN 'OK'
    ELSE 'REVISAR'
  END as status
FROM pago
WHERE "numeroPago" LIKE 'PAG2026%'

UNION ALL

SELECT
  'Saldo Pendiente' as metrica,
  ROUND(SUM("saldoCapital")::numeric, 2) as valor_actual,
  26999.40 as valor_esperado,
  CASE
    WHEN ABS(SUM("saldoCapital") - 26999.40) < 0.01 THEN 'OK'
    ELSE 'REVISAR'
  END as status
FROM prestamo
WHERE "numeroCredito" LIKE 'CRE2026%';

\echo ''

-- =============================================
-- 4. VALIDACIÓN DE RANGOS DE FECHAS
-- =============================================

\echo '4. VALIDACIÓN DE RANGOS DE FECHAS'
\echo '-----------------------------------'

SELECT
  'Rango de Fechas Préstamos' as metrica,
  MIN("fechaOtorgamiento")::text as fecha_inicio,
  MAX("fechaOtorgamiento")::text as fecha_fin,
  CASE
    WHEN MIN("fechaOtorgamiento") >= '2025-02-03' AND MAX("fechaOtorgamiento") <= '2026-01-17'
    THEN 'OK'
    ELSE 'REVISAR'
  END as status
FROM prestamo
WHERE "numeroCredito" LIKE 'CRE2026%';

SELECT
  'Rango de Fechas Pagos' as metrica,
  MIN("fechaPago")::text as fecha_inicio,
  MAX("fechaPago")::text as fecha_fin,
  CASE
    WHEN MIN("fechaPago") >= '2025-02-03' AND MAX("fechaPago") <= '2026-01-17'
    THEN 'OK'
    ELSE 'REVISAR'
  END as status
FROM pago
WHERE "numeroPago" LIKE 'PAG2026%';

\echo ''

-- =============================================
-- 5. VALIDACIÓN DE UNICIDAD
-- =============================================

\echo '5. VALIDACIÓN DE UNICIDAD'
\echo '--------------------------'

-- DUIs duplicados
\echo 'DUIs duplicados:'
SELECT COUNT(*) as errores
FROM (
  SELECT "numeroDui", COUNT(*)
  FROM persona
  WHERE "numeroDui" LIKE '10000%'
  GROUP BY "numeroDui"
  HAVING COUNT(*) > 1
) duplicados;

-- Números de crédito duplicados
\echo 'Números de crédito duplicados:'
SELECT COUNT(*) as errores
FROM (
  SELECT "numeroCredito", COUNT(*)
  FROM prestamo
  WHERE "numeroCredito" LIKE 'CRE2026%'
  GROUP BY "numeroCredito"
  HAVING COUNT(*) > 1
) duplicados;

-- Números de pago duplicados
\echo 'Números de pago duplicados:'
SELECT COUNT(*) as errores
FROM (
  SELECT "numeroPago", COUNT(*)
  FROM pago
  WHERE "numeroPago" LIKE 'PAG2026%'
  GROUP BY "numeroPago"
  HAVING COUNT(*) > 1
) duplicados;

\echo ''

-- =============================================
-- 6. DISTRIBUCIÓN DE ESTADOS DE PRÉSTAMOS
-- =============================================

\echo '6. DISTRIBUCIÓN DE ESTADOS DE PRÉSTAMOS'
\echo '----------------------------------------'

SELECT
  estado,
  COUNT(*) as cantidad,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM prestamo WHERE "numeroCredito" LIKE 'CRE2026%'), 2) as porcentaje
FROM prestamo
WHERE "numeroCredito" LIKE 'CRE2026%'
GROUP BY estado
ORDER BY cantidad DESC;

\echo ''

-- =============================================
-- 7. TOP 10 CLIENTES POR MONTO DESEMBOLSADO
-- =============================================

\echo '7. TOP 10 CLIENTES POR MONTO DESEMBOLSADO'
\echo '------------------------------------------'

SELECT
  p."idPersona",
  CONCAT(p.nombre, ' ', p.apellido) as cliente,
  COUNT(pr.id) as num_prestamos,
  ROUND(SUM(pr."montoDesembolsado")::numeric, 2) as total_desembolsado,
  ROUND(SUM(pr."saldoCapital")::numeric, 2) as saldo_actual
FROM persona p
INNER JOIN prestamo pr ON p."idPersona" = pr."personaId"
WHERE p."numeroDui" LIKE '10000%'
  AND pr."numeroCredito" LIKE 'CRE2026%'
GROUP BY p."idPersona", p.nombre, p.apellido
ORDER BY total_desembolsado DESC
LIMIT 10;

\echo ''

-- =============================================
-- 8. VALIDACIÓN DE SALDOS
-- =============================================

\echo '8. VALIDACIÓN DE SALDOS'
\echo '------------------------'

-- Préstamos con saldo negativo (ERROR)
\echo 'Préstamos con saldo negativo (ERROR):'
SELECT COUNT(*) as errores
FROM prestamo
WHERE "numeroCredito" LIKE 'CRE2026%'
  AND "saldoCapital" < 0;

-- Préstamos cancelados pero con saldo > 0 (ADVERTENCIA)
\echo 'Préstamos CANCELADOS pero con saldo > 0:'
SELECT COUNT(*) as advertencias
FROM prestamo
WHERE "numeroCredito" LIKE 'CRE2026%'
  AND estado = 'CANCELADO'
  AND "saldoCapital" > 0;

-- Préstamos VIGENTES pero con saldo = 0 (ADVERTENCIA)
\echo 'Préstamos VIGENTES pero con saldo = 0:'
SELECT COUNT(*) as advertencias
FROM prestamo
WHERE "numeroCredito" LIKE 'CRE2026%'
  AND estado = 'VIGENTE'
  AND "saldoCapital" = 0;

\echo ''

-- =============================================
-- 9. VALIDACIÓN DE CONSISTENCIA DE PAGOS
-- =============================================

\echo '9. VALIDACIÓN DE CONSISTENCIA DE PAGOS'
\echo '---------------------------------------'

-- Pagos con monto = 0 (ADVERTENCIA)
\echo 'Pagos con monto = 0:'
SELECT COUNT(*) as advertencias
FROM pago
WHERE "numeroPago" LIKE 'PAG2026%'
  AND "montoPagado" = 0;

-- Pagos donde capital + interés != monto (permitir 0.01 de diferencia por redondeo)
\echo 'Pagos con distribución inconsistente:'
SELECT COUNT(*) as advertencias
FROM pago
WHERE "numeroPago" LIKE 'PAG2026%'
  AND ABS("montoPagado" - ("capitalAplicado" + "interesAplicado" + "recargosAplicado" + "interesMoratorioAplicado")) > 0.01;

\echo ''

-- =============================================
-- 10. RESUMEN DE DATOS FALTANTES
-- =============================================

\echo '10. RESUMEN DE DATOS FALTANTES (para completar)'
\echo '------------------------------------------------'

SELECT
  'Personas sin teléfono' as campo,
  COUNT(*) as cantidad
FROM persona
WHERE "numeroDui" LIKE '10000%'
  AND (telefono IS NULL OR telefono = '')

UNION ALL

SELECT
  'Personas sin email' as campo,
  COUNT(*) as cantidad
FROM persona
WHERE "numeroDui" LIKE '10000%'
  AND ("correoElectronico" IS NULL OR "correoElectronico" = '')

UNION ALL

SELECT
  'Personas sin estado civil' as campo,
  COUNT(*) as cantidad
FROM persona
WHERE "numeroDui" LIKE '10000%'
  AND ("estadoCivil" IS NULL OR "estadoCivil" = '')

UNION ALL

SELECT
  'Direcciones sin detalle' as campo,
  COUNT(*) as cantidad
FROM direccion
WHERE "idPersona" IN (SELECT "idPersona" FROM persona WHERE "numeroDui" LIKE '10000%')
  AND ("detalleDireccion" IS NULL OR "detalleDireccion" = '')

UNION ALL

SELECT
  'Préstamos sin solicitud' as campo,
  COUNT(*) as cantidad
FROM prestamo
WHERE "numeroCredito" LIKE 'CRE2026%'
  AND "solicitudId" IS NULL;

\echo ''

-- =============================================
-- FIN DE VALIDACIÓN
-- =============================================

\echo '================================================'
\echo 'VALIDACIÓN COMPLETADA'
\echo '================================================'
\echo ''
\echo 'NOTA: Revise cualquier registro con status ERROR'
\echo 'Los campos con ADVERTENCIA requieren revisión manual'
\echo 'Los datos faltantes deben completarse antes de producción'
\echo ''
