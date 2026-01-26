-- =============================================
-- SCRIPT MAESTRO DE IMPORTACIÓN MYSQL
-- Base de datos: micro_app
-- Servidor: localhost:3306
-- Usuario: root
-- Contraseña: root
-- =============================================
--
-- Este script importa todos los datos en el orden correcto
-- para mantener la integridad referencial.
--
-- ORDEN DE IMPORTACIÓN:
-- 1. Personas (tabla base - 67 registros)
-- 2. Direcciones (referencia a personas - 67 registros)
-- 3. Préstamos (referencia a personas - 170 registros)
-- 4. Pagos (referencia a préstamos - 969 registros)
--
-- TOTAL: 1,273 registros
-- =============================================

-- Seleccionar la base de datos
USE micro_app;

-- Deshabilitar verificaciones de claves foráneas temporalmente
-- para permitir importación más rápida
SET FOREIGN_KEY_CHECKS = 0;

-- Deshabilitar autocommit para mejor rendimiento
SET AUTOCOMMIT = 0;

-- Configurar el modo SQL para compatibilidad
SET sql_mode = '';

-- =============================================
-- IMPORTAR PERSONAS
-- =============================================
SOURCE 01_insert_personas_mysql.sql;
COMMIT;

-- =============================================
-- IMPORTAR DIRECCIONES
-- =============================================
SOURCE 02_insert_direcciones_mysql.sql;
COMMIT;

-- =============================================
-- IMPORTAR PRÉSTAMOS
-- =============================================
SOURCE 03_insert_prestamos_mysql.sql;
COMMIT;

-- =============================================
-- IMPORTAR PAGOS
-- =============================================
SOURCE 04_insert_pagos_mysql.sql;
COMMIT;

-- Rehabilitar verificaciones de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- Rehabilitar autocommit
SET AUTOCOMMIT = 1;

-- =============================================
-- VERIFICACIÓN DE DATOS IMPORTADOS
-- =============================================

SELECT '======================================' AS '';
SELECT '=== RESUMEN DE IMPORTACIÓN ===' AS '';
SELECT '======================================' AS '';

SELECT 'Personas importadas:' AS 'Tabla', COUNT(*) AS 'Registros' FROM persona
UNION ALL
SELECT 'Direcciones importadas:', COUNT(*) FROM direccion
UNION ALL
SELECT 'Préstamos importados:', COUNT(*) FROM prestamo
UNION ALL
SELECT 'Pagos importados:', COUNT(*) FROM pago
UNION ALL
SELECT '--------------------------------------', '--------'
UNION ALL
SELECT 'TOTAL DE REGISTROS:',
  (SELECT COUNT(*) FROM persona) +
  (SELECT COUNT(*) FROM direccion) +
  (SELECT COUNT(*) FROM prestamo) +
  (SELECT COUNT(*) FROM pago);

SELECT '======================================' AS '';
SELECT '=== IMPORTACIÓN COMPLETADA ===' AS '';
SELECT '======================================' AS '';

-- =============================================
-- VERIFICACIONES DE INTEGRIDAD REFERENCIAL
-- =============================================

SELECT '=== Verificaciones de Integridad ===' AS '';

-- Verificar que todas las direcciones tienen una persona válida
SELECT 'Direcciones sin persona:' AS 'Verificación', COUNT(*) AS 'Registros con Problemas'
FROM direccion d
LEFT JOIN persona p ON d.`idPersona` = p.`idPersona`
WHERE p.`idPersona` IS NULL;

-- Verificar que todos los préstamos tienen una persona válida
SELECT 'Préstamos sin persona:' AS 'Verificación', COUNT(*) AS 'Registros con Problemas'
FROM prestamo pr
LEFT JOIN persona p ON pr.`personaId` = p.`idPersona`
WHERE p.`idPersona` IS NULL;

-- Verificar que todos los pagos tienen un préstamo válido
SELECT 'Pagos sin préstamo:' AS 'Verificación', COUNT(*) AS 'Registros con Problemas'
FROM pago pg
LEFT JOIN prestamo pr ON pg.`prestamoId` = pr.id
WHERE pr.id IS NULL;

SELECT '======================================' AS '';
