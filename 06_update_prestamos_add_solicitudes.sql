-- =====================================================
-- ACTUALIZAR PRÉSTAMOS PARA VINCULAR CON SOLICITUDES
-- Total: 170 préstamos
-- =====================================================
--
-- Este script actualiza la tabla prestamo para vincular cada
-- préstamo con su solicitud correspondiente.
--
-- IMPORTANTE: Ejecutar DESPUÉS de:
--   1. 00_setup_base_mysql.sql
--   2. 01_insert_personas_mysql.sql
--   3. 02_insert_direcciones_mysql.sql
--   4. 05_generate_solicitudes_mysql.sql
--   5. 03_insert_prestamos_mysql.sql (original sin modificar)
--
-- =====================================================

USE micro_app;

SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;

-- =====================================================
-- ACTUALIZAR RELACIÓN PRÉSTAMO -> SOLICITUD
-- =====================================================
--
-- Estrategia: Vincular cada préstamo con la solicitud que tiene
-- el mismo ID (1:1 correspondence)
--
-- =====================================================

-- Actualizar todos los préstamos para que apunten a su solicitud correspondiente
UPDATE prestamo p
SET p.solicitudId = p.id
WHERE p.solicitudId IS NULL;

COMMIT;

-- =====================================================
-- VERIFICAR QUE TODOS LOS PRÉSTAMOS TENGAN SOLICITUD
-- =====================================================

SELECT '======================================' AS '';
SELECT '=== VERIFICACIÓN DE VÍNCULOS ===' AS '';
SELECT '======================================' AS '';

-- Contar préstamos sin solicitud
SELECT 'Préstamos sin solicitud:' AS 'Verificación',
    COUNT(*) AS 'Cantidad'
FROM prestamo
WHERE solicitudId IS NULL;

-- Contar préstamos con solicitud válida
SELECT 'Préstamos con solicitud:' AS 'Verificación',
    COUNT(*) AS 'Cantidad'
FROM prestamo p
INNER JOIN solicitud s ON p.solicitudId = s.id;

-- Verificar integridad (préstamos que apuntan a solicitudes inexistentes)
SELECT 'Préstamos con solicitud inválida:' AS 'Verificación',
    COUNT(*) AS 'Cantidad'
FROM prestamo p
LEFT JOIN solicitud s ON p.solicitudId = s.id
WHERE p.solicitudId IS NOT NULL AND s.id IS NULL;

-- Mostrar resumen por estado
SELECT 'Estado del Préstamo' AS 'Categoría',
    p.estado AS Estado,
    COUNT(*) AS Cantidad,
    SUM(p.saldoCapital) AS 'Saldo Capital Total'
FROM prestamo p
GROUP BY p.estado
ORDER BY COUNT(*) DESC;

SELECT '======================================' AS '';
SELECT '=== ACTUALIZACIÓN COMPLETADA ===' AS '';
SELECT '======================================' AS '';

SET FOREIGN_KEY_CHECKS = 1;
SET AUTOCOMMIT = 1;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
--
-- 1. Esta actualización asume que:
--    - Los IDs de préstamos y solicitudes coinciden (1:1)
--    - Las solicitudes ya fueron creadas previamente
--
-- 2. Si hay préstamos sin solicitud después de esta actualización,
--    revisar el script 05_generate_solicitudes_mysql.sql
--
-- 3. La relación es 1:1 (un préstamo = una solicitud)
--    pero en el modelo de datos está como OneToOne
--
-- =====================================================
