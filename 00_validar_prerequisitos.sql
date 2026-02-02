-- =====================================================
-- SCRIPT DE VALIDACIÓN DE PREREQUISITOS
-- Ejecutar ANTES de la migración para verificar que todo esté listo
-- =====================================================

USE micro_app;

-- =====================================================
-- 1. VERIFICAR CATÁLOGOS NECESARIOS
-- =====================================================

SELECT '==== VERIFICACIÓN DE CATÁLOGOS ====' AS '';

SELECT 'Estado de Solicitud' AS Catalogo, COUNT(*) AS Total FROM estado_solicitud;
SELECT 'Estado de Préstamo' AS Catalogo, COUNT(*) AS Total FROM estado_prestamo;
SELECT 'Estado de Pago' AS Catalogo, COUNT(*) AS Total FROM estado_pago;
SELECT 'Estado de Cuota' AS Catalogo, COUNT(*) AS Total FROM estado_cuota;
SELECT 'Tipo de Interés' AS Catalogo, COUNT(*) AS Total FROM tipo_interes;
SELECT 'Periodicidad de Pago' AS Catalogo, COUNT(*) AS Total FROM periodicidad_pago;
SELECT 'Tipo de Pago' AS Catalogo, COUNT(*) AS Total FROM tipo_pago;
SELECT 'Destino de Crédito' AS Catalogo, COUNT(*) AS Total FROM destino_credito;
SELECT 'Clasificación de Préstamo' AS Catalogo, COUNT(*) AS Total FROM clasificacion_prestamo;

-- =====================================================
-- 2. VERIFICAR LÍNEAS Y TIPOS DE CRÉDITO
-- =====================================================

SELECT '==== LÍNEAS DE CRÉDITO ====' AS '';
SELECT id, codigo, nombre, activo FROM linea_credito ORDER BY id;

SELECT '==== TIPOS DE CRÉDITO ====' AS '';
SELECT id, codigo, nombre, activo FROM tipo_credito ORDER BY id;

-- =====================================================
-- 3. VERIFICAR PERSONAS (CLIENTES)
-- =====================================================

SELECT '==== PERSONAS EN LA BASE DE DATOS ====' AS '';
SELECT COUNT(*) AS TotalPersonas FROM persona;

SELECT '==== PRIMERAS 10 PERSONAS ====' AS '';
SELECT
  idPersona,
  CONCAT(nombre, ' ', apellido) AS NombreCompleto,
  numeroDui
FROM persona
ORDER BY idPersona
LIMIT 10;

-- =====================================================
-- 4. VERIFICAR USUARIOS
-- =====================================================

SELECT '==== USUARIOS PARA AUDITORÍA ====' AS '';
SELECT id, username, nombre, activo FROM user LIMIT 5;

-- =====================================================
-- 5. VERIFICAR TABLAS VACÍAS (ANTES DE MIGRACIÓN)
-- =====================================================

SELECT '==== ESTADO ACTUAL DE TABLAS DE CRÉDITOS ====' AS '';
SELECT 'Solicitudes' AS Tabla, COUNT(*) AS Total FROM solicitud;
SELECT 'Préstamos' AS Tabla, COUNT(*) AS Total FROM prestamo;
SELECT 'Pagos' AS Tabla, COUNT(*) AS Total FROM pago;
SELECT 'Plan de Pagos' AS Tabla, COUNT(*) AS Total FROM plan_pago;

-- =====================================================
-- 6. VERIFICAR IDs ESPECÍFICOS QUE SE USARÁN
-- =====================================================

SELECT '==== VERIFICACIÓN DE IDs ESPECÍFICOS ====' AS '';

-- Estado de solicitud ID 6 = DESEMBOLSADA
SELECT id, codigo, nombre FROM estado_solicitud WHERE id = 6;

-- Estado de préstamo ID 1 = VIGENTE
SELECT id, codigo, nombre FROM estado_prestamo WHERE id = 1;

-- Estado de préstamo ID 3 = CANCELADO
SELECT id, codigo, nombre FROM estado_prestamo WHERE id = 3;

-- Clasificación préstamo ID 1 = Categoría A
SELECT id, codigo, nombre FROM clasificacion_prestamo WHERE id = 1;

-- Línea de crédito ID 1
SELECT id, codigo, nombre FROM linea_credito WHERE id = 1;

-- Tipo de crédito ID 1
SELECT id, codigo, nombre FROM tipo_credito WHERE id = 1;

-- Usuario ID 1
SELECT id, username, nombre FROM user WHERE id = 1;

-- =====================================================
-- RESUMEN
-- =====================================================

SELECT '==== RESUMEN DE VALIDACIÓN ====' AS '';

SELECT
  CASE
    WHEN (SELECT COUNT(*) FROM estado_solicitud) >= 6 THEN '✓'
    ELSE '✗'
  END AS EstadoSolicitud,
  CASE
    WHEN (SELECT COUNT(*) FROM estado_prestamo) >= 3 THEN '✓'
    ELSE '✗'
  END AS EstadoPrestamo,
  CASE
    WHEN (SELECT COUNT(*) FROM linea_credito) >= 1 THEN '✓'
    ELSE '✗'
  END AS LineaCredito,
  CASE
    WHEN (SELECT COUNT(*) FROM tipo_credito) >= 1 THEN '✓'
    ELSE '✗'
  END AS TipoCredito,
  CASE
    WHEN (SELECT COUNT(*) FROM persona) >= 67 THEN '✓'
    ELSE '✗'
  END AS Personas,
  CASE
    WHEN (SELECT COUNT(*) FROM user) >= 1 THEN '✓'
    ELSE '✗'
  END AS Usuarios;

SELECT 'Si todos los valores anteriores son ✓, puede proceder con la migración' AS Conclusion;
