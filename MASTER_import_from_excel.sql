-- =====================================================
-- SCRIPT MAESTRO DE MIGRACIÓN - MÓDULO DE CRÉDITOS
-- Generado automáticamente desde prestamos.xlsx
-- Fecha: 26/1/2026, 4:48:19 a. m.
-- =====================================================

USE micro_app;

-- Deshabilitar verificaciones temporalmente
SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;
SET AUTOCOMMIT = 0;

START TRANSACTION;

-- =====================================================
-- PASO 1: Ejecutar solicitudes
-- =====================================================
SOURCE 07_insert_solicitudes_from_excel.sql;

-- =====================================================
-- PASO 2: Ejecutar préstamos
-- =====================================================
SOURCE 08_insert_prestamos_from_excel.sql;

-- =====================================================
-- PASO 3: Ejecutar pagos
-- =====================================================
SOURCE 09_insert_pagos_from_excel.sql;

COMMIT;

-- Rehabilitar verificaciones
SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;
SET AUTOCOMMIT = 1;

SELECT "Migración completada exitosamente" AS STATUS;
