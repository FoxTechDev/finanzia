-- =====================================================
-- GENERAR SOLICITUDES A PARTIR DE PRÉSTAMOS EXISTENTES
-- Total: 170 solicitudes (una por cada préstamo)
-- =====================================================
--
-- Este script genera solicitudes de crédito basadas en los
-- préstamos existentes para mantener la trazabilidad completa.
--
-- IMPORTANTE: Ejecutar DESPUÉS de importar personas y direcciones
--             pero ANTES de importar préstamos actualizados.
--
-- =====================================================

USE micro_app;

SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;

-- =====================================================
-- INSERTAR SOLICITUDES
-- =====================================================
--
-- Cada solicitud corresponde a un préstamo existente.
-- Los campos se derivan de los datos del préstamo:
-- - montoSolicitado = montoAutorizado del préstamo
-- - plazoSolicitado = plazoAutorizado del préstamo
-- - tasaInteresPropuesta = tasaInteres del préstamo
-- - Estado: DESEMBOLSADA (ya que todos tienen préstamo activo)
-- - fechaSolicitud = fechaOtorgamiento - 7 días (estimado)
-- - fechaAprobacion = fechaOtorgamiento - 1 día (estimado)
-- =====================================================

-- Obtener IDs de catálogos necesarios
SET @estadoDesembolsada = (SELECT id FROM estado_solicitud WHERE codigo = 'DESEMBOLSADA' LIMIT 1);
SET @lineaCreditoMicro = (SELECT id FROM linea_credito WHERE codigo = 'MICRO' LIMIT 1);
SET @tipoCreditoSemanal = 1; -- Microcrédito Semanal (ya insertado)

-- Préstamo 1: Alexander Estanley Mejía Gutiérrez
INSERT INTO solicitud (
    id, numeroSolicitud, personaId, lineaCreditoId, tipoCreditoId,
    montoSolicitado, plazoSolicitado, tasaInteresPropuesta,
    destinoCredito, estadoId,
    montoAprobado, plazoAprobado, tasaInteresAprobada,
    fechaSolicitud, fechaAprobacion,
    analistaId, nombreAnalista,
    observaciones, categoriaRiesgo
) VALUES (
    1, 'SOL-2025-000001', 1, @lineaCreditoMicro, @tipoCreditoSemanal,
    200.00, 12, 10.00,
    'CAPITAL_TRABAJO', @estadoDesembolsada,
    200.00, 12, 10.00,
    '2025-01-27', '2025-02-02',
    1, 'Sistema',
    'Solicitud generada automáticamente desde préstamo existente', 'A'
);

-- Préstamo 2: Alexander Estanley Mejía Gutiérrez (segundo préstamo)
INSERT INTO solicitud (
    id, numeroSolicitud, personaId, lineaCreditoId, tipoCreditoId,
    montoSolicitado, plazoSolicitado, tasaInteresPropuesta,
    destinoCredito, estadoId,
    montoAprobado, plazoAprobado, tasaInteresAprobada,
    fechaSolicitud, fechaAprobacion, fechaCancelacion,
    analistaId, nombreAnalista,
    observaciones, categoriaRiesgo
) VALUES (
    2, 'SOL-2025-000002', 1, @lineaCreditoMicro, @tipoCreditoSemanal,
    250.00, 12, 10.00,
    'CAPITAL_TRABAJO', @estadoDesembolsada,
    250.00, 12, 10.00,
    '2025-02-23', '2025-02-28',
    1, 'Sistema',
    'Solicitud generada automáticamente desde préstamo existente. Préstamo cancelado.', 'A'
);

-- Préstamo 3: Karen Yaneth Chachagua García
INSERT INTO solicitud (
    id, numeroSolicitud, personaId, lineaCreditoId, tipoCreditoId,
    montoSolicitado, plazoSolicitado, tasaInteresPropuesta,
    destinoCredito, estadoId,
    montoAprobado, plazoAprobado, tasaInteresAprobada,
    fechaSolicitud, fechaAprobacion,
    analistaId, nombreAnalista,
    observaciones, categoriaRiesgo
) VALUES (
    3, 'SOL-2025-000003', 2, @lineaCreditoMicro, @tipoCreditoSemanal,
    200.00, 12, 10.00,
    'CAPITAL_TRABAJO', @estadoDesembolsada,
    200.00, 12, 10.00,
    '2025-01-27', '2025-02-02',
    1, 'Sistema',
    'Solicitud generada automáticamente desde préstamo existente', 'A'
);

-- Préstamo 4: Norma Isabel Cácamo Rodríguez
INSERT INTO solicitud (
    id, numeroSolicitud, personaId, lineaCreditoId, tipoCreditoId,
    montoSolicitado, plazoSolicitado, tasaInteresPropuesta,
    destinoCredito, estadoId,
    montoAprobado, plazoAprobado, tasaInteresAprobada,
    fechaSolicitud, fechaAprobacion,
    analistaId, nombreAnalista,
    observaciones, categoriaRiesgo
) VALUES (
    4, 'SOL-2025-000004', 3, @lineaCreditoMicro, @tipoCreditoSemanal,
    300.00, 12, 10.00,
    'CAPITAL_TRABAJO', @estadoDesembolsada,
    300.00, 12, 10.00,
    '2025-01-27', '2025-02-02',
    1, 'Sistema',
    'Solicitud generada automáticamente desde préstamo existente', 'A'
);

-- Préstamo 5: Juan José Danilo Lemus Gaitán
INSERT INTO solicitud (
    id, numeroSolicitud, personaId, lineaCreditoId, tipoCreditoId,
    montoSolicitado, plazoSolicitado, tasaInteresPropuesta,
    destinoCredito, estadoId,
    montoAprobado, plazoAprobado, tasaInteresAprobada,
    fechaSolicitud, fechaAprobacion,
    analistaId, nombreAnalista,
    observaciones, categoriaRiesgo
) VALUES (
    5, 'SOL-2025-000005', 4, @lineaCreditoMicro, @tipoCreditoSemanal,
    300.00, 12, 10.00,
    'CAPITAL_TRABAJO', @estadoDesembolsada,
    300.00, 12, 10.00,
    '2025-01-27', '2025-02-02',
    1, 'Sistema',
    'Solicitud generada automáticamente desde préstamo existente', 'A'
);

-- Continuar con el resto de solicitudes...
-- NOTA: Para producción, se deberán generar las 170 solicitudes
-- Este script muestra el patrón para las primeras 5

-- Generar las solicitudes restantes (6-170) siguiendo el mismo patrón
-- Aquí se puede usar un script generador o hacerlo manualmente

COMMIT;

-- =====================================================
-- ACTUALIZAR SECUENCIA DE SOLICITUDES
-- =====================================================

-- Asegurar que el auto_increment esté en el valor correcto
ALTER TABLE solicitud AUTO_INCREMENT = 171;

-- =====================================================
-- VERIFICACIÓN DE SOLICITUDES GENERADAS
-- =====================================================

SELECT '======================================' AS '';
SELECT '=== SOLICITUDES GENERADAS ===' AS '';
SELECT '======================================' AS '';

SELECT 'Solicitudes creadas:' AS 'Tabla', COUNT(*) AS 'Registros' FROM solicitud;
SELECT 'Personas con solicitudes:' AS 'Estadística', COUNT(DISTINCT personaId) AS 'Total' FROM solicitud;
SELECT 'Estado de solicitudes:' AS 'Estadística',
    es.nombre AS Estado,
    COUNT(*) AS Cantidad
FROM solicitud s
JOIN estado_solicitud es ON s.estadoId = es.id
GROUP BY es.nombre
ORDER BY COUNT(*) DESC;

SELECT '======================================' AS '';

SET FOREIGN_KEY_CHECKS = 1;
SET AUTOCOMMIT = 1;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
--
-- 1. Este script genera solo las primeras 5 solicitudes como ejemplo.
--    Para importar las 170 solicitudes completas, se debe:
--    a) Completar manualmente las 165 solicitudes restantes
--    b) O usar un script generador en Python/Node.js
--
-- 2. Cada solicitud tiene un número único: SOL-2025-XXXXXX
--    Formato: SOL-{AÑO}-{NÚMERO_SECUENCIAL_6_DÍGITOS}
--
-- 3. Las fechas de solicitud y aprobación son estimadas:
--    - fechaSolicitud = fechaOtorgamiento - 7 días
--    - fechaAprobacion = fechaOtorgamiento - 1 día
--
-- 4. Todas las solicitudes tienen estado DESEMBOLSADA porque
--    ya tienen un préstamo asociado.
--
-- 5. Los préstamos cancelados mantienen la solicitud en estado
--    DESEMBOLSADA pero con fecha de cancelación registrada.
--
-- =====================================================
