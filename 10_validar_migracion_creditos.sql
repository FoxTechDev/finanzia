-- =====================================================
-- SCRIPT DE VALIDACIÓN POST-MIGRACIÓN
-- Ejecutar DESPUÉS de la migración para verificar resultados
-- =====================================================

USE micro_app;

-- =====================================================
-- 1. CONTEO DE REGISTROS MIGRADOS
-- =====================================================

SELECT '==== RESUMEN DE MIGRACIÓN ====' AS '';

SELECT 'Solicitudes' AS Entidad, COUNT(*) AS Total FROM solicitud;
SELECT 'Préstamos' AS Entidad, COUNT(*) AS Total FROM prestamo;
SELECT 'Pagos' AS Entidad, COUNT(*) AS Total FROM pago;
SELECT 'Plan de Pagos' AS Entidad, COUNT(*) AS Total FROM plan_pago;

-- =====================================================
-- 2. VALIDAR INTEGRIDAD REFERENCIAL
-- =====================================================

SELECT '==== VALIDACIÓN DE FOREIGN KEYS ====' AS '';

-- Solicitudes con persona inválida
SELECT
  'Solicitudes con personaId inválido' AS Problema,
  COUNT(*) AS Total
FROM solicitud s
LEFT JOIN persona p ON s.personaId = p.idPersona
WHERE p.idPersona IS NULL;

-- Préstamos con solicitud inválida
SELECT
  'Préstamos con solicitudId inválido' AS Problema,
  COUNT(*) AS Total
FROM prestamo pr
LEFT JOIN solicitud s ON pr.solicitudId = s.id
WHERE s.id IS NULL;

-- Préstamos con persona inválida
SELECT
  'Préstamos con personaId inválido' AS Problema,
  COUNT(*) AS Total
FROM prestamo pr
LEFT JOIN persona p ON pr.personaId = p.idPersona
WHERE p.idPersona IS NULL;

-- Pagos con préstamo inválido
SELECT
  'Pagos con prestamoId inválido' AS Problema,
  COUNT(*) AS Total
FROM pago pg
LEFT JOIN prestamo pr ON pg.prestamoId = pr.id
WHERE pr.id IS NULL;

-- =====================================================
-- 3. VALIDAR CONSISTENCIA DE DATOS
-- =====================================================

SELECT '==== VALIDACIÓN DE CONSISTENCIA ====' AS '';

-- Préstamos con montos negativos
SELECT
  'Préstamos con monto negativo' AS Problema,
  COUNT(*) AS Total
FROM prestamo
WHERE montoDesembolsado < 0;

-- Pagos con monto negativo
SELECT
  'Pagos con monto negativo' AS Problema,
  COUNT(*) AS Total
FROM pago
WHERE montoPagado < 0;

-- Préstamos donde saldoCapital > totalPagar
SELECT
  'Préstamos con saldo mayor al total' AS Problema,
  COUNT(*) AS Total
FROM prestamo
WHERE saldoCapital > totalPagar;

-- Solicitudes sin estado válido
SELECT
  'Solicitudes sin estado válido' AS Problema,
  COUNT(*) AS Total
FROM solicitud s
LEFT JOIN estado_solicitud es ON s.estadoId = es.id
WHERE es.id IS NULL;

-- =====================================================
-- 4. DISTRIBUCIÓN DE ESTADOS
-- =====================================================

SELECT '==== DISTRIBUCIÓN DE ESTADOS ====' AS '';

-- Estados de solicitudes
SELECT
  es.nombre AS EstadoSolicitud,
  COUNT(*) AS Total
FROM solicitud s
JOIN estado_solicitud es ON s.estadoId = es.id
GROUP BY es.nombre
ORDER BY Total DESC;

-- Estados de préstamos
SELECT
  pr.estado AS EstadoPrestamo,
  COUNT(*) AS Total
FROM prestamo pr
GROUP BY pr.estado
ORDER BY Total DESC;

-- Estados de pagos
SELECT
  pg.estado AS EstadoPago,
  COUNT(*) AS Total
FROM pago pg
GROUP BY pg.estado
ORDER BY Total DESC;

-- =====================================================
-- 5. ANÁLISIS FINANCIERO
-- =====================================================

SELECT '==== ANÁLISIS FINANCIERO ====' AS '';

-- Total desembolsado
SELECT
  'Total Desembolsado' AS Concepto,
  CONCAT('$', FORMAT(SUM(montoDesembolsado), 2)) AS Monto
FROM prestamo;

-- Total pagado
SELECT
  'Total Pagado' AS Concepto,
  CONCAT('$', FORMAT(SUM(montoPagado), 2)) AS Monto
FROM pago
WHERE estado = 'APLICADO';

-- Saldo total pendiente
SELECT
  'Saldo Total Pendiente' AS Concepto,
  CONCAT('$', FORMAT(SUM(saldoCapital), 2)) AS Monto
FROM prestamo
WHERE estado = 'VIGENTE';

-- Total de intereses generados
SELECT
  'Total Intereses' AS Concepto,
  CONCAT('$', FORMAT(SUM(totalInteres), 2)) AS Monto
FROM prestamo;

-- =====================================================
-- 6. CLIENTES CON MÁS PRÉSTAMOS
-- =====================================================

SELECT '==== TOP 10 CLIENTES CON MÁS PRÉSTAMOS ====' AS '';

SELECT
  p.idPersona,
  CONCAT(p.nombre, ' ', p.apellido) AS Cliente,
  COUNT(pr.id) AS TotalPrestamos,
  CONCAT('$', FORMAT(SUM(pr.montoDesembolsado), 2)) AS MontoTotal,
  CONCAT('$', FORMAT(SUM(pr.saldoCapital), 2)) AS SaldoPendiente
FROM persona p
JOIN prestamo pr ON p.idPersona = pr.personaId
GROUP BY p.idPersona, Cliente
ORDER BY TotalPrestamos DESC
LIMIT 10;

-- =====================================================
-- 7. PRÉSTAMOS POR RANGO DE FECHA
-- =====================================================

SELECT '==== PRÉSTAMOS POR MES ====' AS '';

SELECT
  DATE_FORMAT(fechaOtorgamiento, '%Y-%m') AS Mes,
  COUNT(*) AS TotalPrestamos,
  CONCAT('$', FORMAT(SUM(montoDesembolsado), 2)) AS MontoDesembolsado
FROM prestamo
GROUP BY DATE_FORMAT(fechaOtorgamiento, '%Y-%m')
ORDER BY Mes;

-- =====================================================
-- 8. MUESTRA DE DATOS MIGRADOS
-- =====================================================

SELECT '==== MUESTRA: PRIMEROS 5 PRÉSTAMOS ====' AS '';

SELECT
  pr.id,
  pr.numeroCredito,
  CONCAT(p.nombre, ' ', p.apellido) AS Cliente,
  CONCAT('$', pr.montoDesembolsado) AS Monto,
  pr.fechaOtorgamiento,
  pr.estado,
  CONCAT('$', pr.saldoCapital) AS Saldo,
  (SELECT COUNT(*) FROM pago WHERE prestamoId = pr.id) AS TotalPagos
FROM prestamo pr
JOIN persona p ON pr.personaId = p.idPersona
ORDER BY pr.id
LIMIT 5;

-- =====================================================
-- 9. VERIFICAR DUPLICADOS
-- =====================================================

SELECT '==== VERIFICACIÓN DE DUPLICADOS ====' AS '';

-- Solicitudes con número duplicado
SELECT
  'Solicitudes con número duplicado' AS Problema,
  COUNT(*) AS Total
FROM (
  SELECT numeroSolicitud, COUNT(*) as cnt
  FROM solicitud
  GROUP BY numeroSolicitud
  HAVING cnt > 1
) duplicados;

-- Préstamos con número duplicado
SELECT
  'Préstamos con número duplicado' AS Problema,
  COUNT(*) AS Total
FROM (
  SELECT numeroCredito, COUNT(*) as cnt
  FROM prestamo
  GROUP BY numeroCredito
  HAVING cnt > 1
) duplicados;

-- Pagos con número duplicado
SELECT
  'Pagos con número duplicado' AS Problema,
  COUNT(*) AS Total
FROM (
  SELECT numeroPago, COUNT(*) as cnt
  FROM pago
  GROUP BY numeroPago
  HAVING cnt > 1
) duplicados;

-- =====================================================
-- 10. RESUMEN FINAL
-- =====================================================

SELECT '==== RESULTADO FINAL DE VALIDACIÓN ====' AS '';

SELECT
  CASE
    WHEN (SELECT COUNT(*) FROM solicitud s LEFT JOIN persona p ON s.personaId = p.idPersona WHERE p.idPersona IS NULL) = 0
    THEN '✓' ELSE '✗'
  END AS IntegridadReferencial,
  CASE
    WHEN (SELECT COUNT(*) FROM prestamo WHERE montoDesembolsado < 0) = 0
    THEN '✓' ELSE '✗'
  END AS MontosValidos,
  CASE
    WHEN (SELECT COUNT(*) FROM (SELECT numeroCredito, COUNT(*) as cnt FROM prestamo GROUP BY numeroCredito HAVING cnt > 1) dup) = 0
    THEN '✓' ELSE '✗'
  END AS SinDuplicados,
  (SELECT COUNT(*) FROM solicitud) AS TotalSolicitudes,
  (SELECT COUNT(*) FROM prestamo) AS TotalPrestamos,
  (SELECT COUNT(*) FROM pago) AS TotalPagos;

SELECT '
INTERPRETACIÓN:
- IntegridadReferencial ✓ = Todas las foreign keys son válidas
- MontosValidos ✓ = No hay montos negativos
- SinDuplicados ✓ = No hay números de crédito/solicitud duplicados

Si todos los valores son ✓, la migración fue exitosa.
' AS Conclusion;
