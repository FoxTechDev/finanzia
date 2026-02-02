-- =====================================================
-- SCRIPT MAESTRO DE IMPORTACIÓN COMPLETA
-- Base de datos FINANZIA para Digital Ocean MySQL
-- =====================================================
--
-- Este script coordina la importación completa de datos
-- a la base de datos en Digital Ocean.
--
-- ORDEN DE EJECUCIÓN:
-- 1. Configuración base (catálogos, roles, tipos de crédito)
-- 2. Datos de clientes (personas y direcciones)
-- 3. Solicitudes de crédito (generadas desde préstamos)
-- 4. Préstamos desembolsados
-- 5. Actualización de vínculos préstamo-solicitud
-- 6. Pagos realizados
--
-- TOTAL DE DATOS A IMPORTAR:
-- - 67 personas (clientes)
-- - 67 direcciones
-- - 170 solicitudes (generadas)
-- - 170 préstamos
-- - ~969 pagos (según datos existentes)
--
-- TIEMPO ESTIMADO: 2-5 minutos
-- =====================================================

-- Seleccionar la base de datos
USE micro_app;

-- Configuración de sesión para importación óptima
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;
SET sql_mode = '';
SET SESSION sql_log_bin = 0; -- Deshabilitar binary log si es réplica

SELECT '======================================' AS '';
SELECT '=== INICIANDO IMPORTACIÓN COMPLETA ===' AS '';
SELECT CONCAT('Fecha: ', NOW()) AS 'Timestamp';
SELECT '======================================' AS '';

-- =====================================================
-- PASO 1: CONFIGURACIÓN BASE
-- =====================================================

SELECT '📋 PASO 1/6: Cargando configuración base...' AS 'Estado';

SOURCE 00_setup_base_mysql.sql;

SELECT '✅ Configuración base completada' AS 'Estado';
SELECT '======================================' AS '';

-- =====================================================
-- PASO 2: IMPORTAR PERSONAS
-- =====================================================

SELECT '👥 PASO 2/6: Importando personas (clientes)...' AS 'Estado';

SOURCE 01_insert_personas_mysql.sql;
COMMIT;

SELECT '✅ Personas importadas' AS 'Estado';
SELECT CONCAT('Total: ', (SELECT COUNT(*) FROM persona), ' registros') AS 'Resultado';
SELECT '======================================' AS '';

-- =====================================================
-- PASO 3: IMPORTAR DIRECCIONES
-- =====================================================

SELECT '📍 PASO 3/6: Importando direcciones...' AS 'Estado';

SOURCE 02_insert_direcciones_mysql.sql;
COMMIT;

SELECT '✅ Direcciones importadas' AS 'Estado';
SELECT CONCAT('Total: ', (SELECT COUNT(*) FROM direccion), ' registros') AS 'Resultado';
SELECT '======================================' AS '';

-- =====================================================
-- PASO 4: GENERAR SOLICITUDES
-- =====================================================

SELECT '📝 PASO 4/6: Generando solicitudes de crédito...' AS 'Estado';

SOURCE 05_generate_solicitudes_mysql.sql;
COMMIT;

SELECT '✅ Solicitudes generadas' AS 'Estado';
SELECT CONCAT('Total: ', (SELECT COUNT(*) FROM solicitud), ' registros') AS 'Resultado';
SELECT '======================================' AS '';

-- =====================================================
-- PASO 5: IMPORTAR PRÉSTAMOS
-- =====================================================

SELECT '💰 PASO 5/6: Importando préstamos...' AS 'Estado';

SOURCE 03_insert_prestamos_mysql.sql;
COMMIT;

-- Actualizar vínculos préstamo-solicitud
SELECT '🔗 Vinculando préstamos con solicitudes...' AS 'Estado';
SOURCE 06_update_prestamos_add_solicitudes.sql;
COMMIT;

SELECT '✅ Préstamos importados y vinculados' AS 'Estado';
SELECT CONCAT('Total: ', (SELECT COUNT(*) FROM prestamo), ' registros') AS 'Resultado';
SELECT '======================================' AS '';

-- =====================================================
-- PASO 6: IMPORTAR PAGOS
-- =====================================================

SELECT '💵 PASO 6/6: Importando pagos...' AS 'Estado';

SOURCE 04_insert_pagos_mysql.sql;
COMMIT;

SELECT '✅ Pagos importados' AS 'Estado';
SELECT CONCAT('Total: ', (SELECT COUNT(*) FROM pago), ' registros') AS 'Resultado';
SELECT '======================================' AS '';

-- =====================================================
-- REHABILITAR CONFIGURACIONES
-- =====================================================

SET FOREIGN_KEY_CHECKS = 1;
SET AUTOCOMMIT = 1;

-- =====================================================
-- RESUMEN FINAL DE IMPORTACIÓN
-- =====================================================

SELECT '======================================' AS '';
SELECT '=== RESUMEN FINAL DE IMPORTACIÓN ===' AS '';
SELECT '======================================' AS '';

-- Tabla de resumen
SELECT 'Catálogos' AS 'Categoría',
    CONCAT(
        (SELECT COUNT(*) FROM estado_solicitud), ' estados solicitud + ',
        (SELECT COUNT(*) FROM estado_prestamo), ' estados préstamo + ',
        (SELECT COUNT(*) FROM clasificacion_prestamo), ' clasificaciones'
    ) AS 'Registros';

SELECT 'Configuración' AS 'Categoría',
    CONCAT(
        (SELECT COUNT(*) FROM rol), ' roles + ',
        (SELECT COUNT(*) FROM linea_credito), ' líneas crédito + ',
        (SELECT COUNT(*) FROM tipo_credito), ' tipos crédito'
    ) AS 'Registros';

SELECT 'Personas' AS 'Categoría', COUNT(*) AS 'Registros' FROM persona;
SELECT 'Direcciones' AS 'Categoría', COUNT(*) AS 'Registros' FROM direccion;
SELECT 'Solicitudes' AS 'Categoría', COUNT(*) AS 'Registros' FROM solicitud;
SELECT 'Préstamos' AS 'Categoría', COUNT(*) AS 'Registros' FROM prestamo;
SELECT 'Pagos' AS 'Categoría', COUNT(*) AS 'Registros' FROM pago;

SELECT '--------------------------------------' AS '', '--------' AS '';

SELECT 'TOTAL REGISTROS' AS 'Categoría',
    (SELECT COUNT(*) FROM persona) +
    (SELECT COUNT(*) FROM direccion) +
    (SELECT COUNT(*) FROM solicitud) +
    (SELECT COUNT(*) FROM prestamo) +
    (SELECT COUNT(*) FROM pago) AS 'Registros';

SELECT '======================================' AS '';
SELECT '=== VERIFICACIONES DE INTEGRIDAD ===' AS '';
SELECT '======================================' AS '';

-- Verificación 1: Direcciones sin persona
SELECT 'Direcciones sin persona:' AS 'Verificación',
    COUNT(*) AS 'Problemas Encontrados'
FROM direccion d
LEFT JOIN persona p ON d.idPersona = p.idPersona
WHERE p.idPersona IS NULL;

-- Verificación 2: Solicitudes sin persona
SELECT 'Solicitudes sin persona:' AS 'Verificación',
    COUNT(*) AS 'Problemas Encontrados'
FROM solicitud s
LEFT JOIN persona p ON s.personaId = p.idPersona
WHERE p.idPersona IS NULL;

-- Verificación 3: Préstamos sin persona
SELECT 'Préstamos sin persona:' AS 'Verificación',
    COUNT(*) AS 'Problemas Encontrados'
FROM prestamo pr
LEFT JOIN persona p ON pr.personaId = p.idPersona
WHERE p.idPersona IS NULL;

-- Verificación 4: Préstamos sin solicitud
SELECT 'Préstamos sin solicitud:' AS 'Verificación',
    COUNT(*) AS 'Problemas Encontrados'
FROM prestamo pr
LEFT JOIN solicitud s ON pr.solicitudId = s.id
WHERE pr.solicitudId IS NULL OR s.id IS NULL;

-- Verificación 5: Pagos sin préstamo
SELECT 'Pagos sin préstamo:' AS 'Verificación',
    COUNT(*) AS 'Problemas Encontrados'
FROM pago pg
LEFT JOIN prestamo pr ON pg.prestamoId = pr.id
WHERE pr.id IS NULL;

SELECT '======================================' AS '';
SELECT '=== ESTADÍSTICAS DE CARTERA ===' AS '';
SELECT '======================================' AS '';

-- Distribución de préstamos por estado
SELECT 'Distribución por Estado' AS 'Métrica',
    estado AS 'Estado',
    COUNT(*) AS 'Cantidad',
    CONCAT('$', FORMAT(SUM(saldoCapital), 2)) AS 'Saldo Capital'
FROM prestamo
GROUP BY estado
ORDER BY COUNT(*) DESC;

-- Resumen financiero
SELECT 'Cartera Total' AS 'Métrica',
    CONCAT('$', FORMAT(SUM(montoDesembolsado), 2)) AS 'Monto Desembolsado',
    CONCAT('$', FORMAT(SUM(saldoCapital), 2)) AS 'Saldo Capital',
    CONCAT('$', FORMAT(SUM(totalInteres), 2)) AS 'Intereses Totales'
FROM prestamo;

-- Préstamos en mora
SELECT 'Préstamos en Mora' AS 'Métrica',
    COUNT(*) AS 'Cantidad',
    CONCAT('$', FORMAT(SUM(capitalMora), 2)) AS 'Capital en Mora',
    ROUND(AVG(diasMora), 0) AS 'Días Mora Promedio'
FROM prestamo
WHERE estado = 'MORA';

SELECT '======================================' AS '';
SELECT '=== IMPORTACIÓN COMPLETADA ===' AS '';
SELECT CONCAT('Finalizado: ', NOW()) AS 'Timestamp';
SELECT '======================================' AS '';

-- =====================================================
-- NOTAS POST-IMPORTACIÓN
-- =====================================================
--
-- ✅ SIGUIENTE PASO:
--
-- 1. Verificar que todas las verificaciones de integridad
--    muestren 0 problemas encontrados.
--
-- 2. Actualizar el password del usuario administrador:
--    UPDATE users
--    SET password = '$2b$10$[NUEVO_HASH_BCRYPT]'
--    WHERE email = 'admin@finanzia.com';
--
-- 3. Crear usuarios adicionales según sea necesario:
--    - Asesores de negocio
--    - Miembros del comité de crédito
--    - Cajeros
--
-- 4. Verificar la aplicación:
--    - Login con admin@finanzia.com
--    - Revisar dashboard
--    - Verificar listados de clientes, solicitudes, préstamos
--
-- 5. Configurar backups automáticos en Digital Ocean
--
-- ⚠️ IMPORTANTE:
--
-- - Este script asume que la base de datos 'micro_app' ya existe
-- - Las tablas se crean automáticamente con TypeORM (synchronize: true)
-- - Si synchronize está en false, ejecutar migraciones antes
--
-- =====================================================
