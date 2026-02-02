-- =====================================================
-- SCRIPT DE CONFIGURACIÓN BASE PARA MYSQL
-- Base de datos FINANZIA en Digital Ocean
-- =====================================================
--
-- Este script configura:
-- 1. Creación de base de datos
-- 2. Catálogos básicos (estados, tipos, etc.)
-- 3. Datos maestros (roles, líneas de crédito, tipos de crédito)
-- 4. Usuario administrador inicial
--
-- Ejecutar PRIMERO antes de importar datos transaccionales
-- =====================================================

-- Seleccionar la base de datos
USE micro_app;

-- Deshabilitar verificaciones temporalmente para importación
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;
SET sql_mode = '';

-- =====================================================
-- PARTE 1: CATÁLOGOS BÁSICOS
-- =====================================================

-- 1. Estado de Garantía
INSERT IGNORE INTO `estado_garantia` (`codigo`, `nombre`, `descripcion`, `orden`, `color`, `activo`) VALUES
('PENDIENTE', 'Pendiente', 'Garantía pendiente de constitución', 1, '#FFA500', 1),
('CONSTITUIDA', 'Constituida', 'Garantía constituida formalmente', 2, '#28A745', 1),
('LIBERADA', 'Liberada', 'Garantía liberada después del pago del crédito', 3, '#17A2B8', 1),
('EJECUTADA', 'Ejecutada', 'Garantía ejecutada por incumplimiento', 4, '#DC3545', 1);

-- 2. Recomendación de Asesor
INSERT IGNORE INTO `recomendacion_asesor` (`codigo`, `nombre`, `descripcion`, `orden`, `color`, `activo`) VALUES
('APROBAR', 'Aprobar', 'Recomienda aprobar la solicitud', 1, '#28A745', 1),
('RECHAZAR', 'Rechazar', 'Recomienda rechazar la solicitud', 2, '#DC3545', 1),
('OBSERVAR', 'Observar', 'Requiere observaciones o aclaraciones', 3, '#FFC107', 1);

-- 3. Tipo de Decisión de Comité
INSERT IGNORE INTO `tipo_decision_comite` (`codigo`, `nombre`, `descripcion`, `orden`, `color`, `activo`) VALUES
('AUTORIZADA', 'Autorizada', 'Solicitud autorizada por el comité', 1, '#28A745', 1),
('DENEGADA', 'Denegada', 'Solicitud denegada por el comité', 2, '#DC3545', 1),
('OBSERVADA', 'Observada', 'Solicitud con observaciones del comité', 3, '#FFC107', 1);

-- 4. Tipo de Pago
INSERT IGNORE INTO `tipo_pago` (`codigo`, `nombre`, `descripcion`, `orden`, `color`, `activo`) VALUES
('CUOTA_COMPLETA', 'Cuota Completa', 'Pago de cuota completa según plan de pagos', 1, '#28A745', 1),
('PAGO_PARCIAL', 'Pago Parcial', 'Pago parcial de una o más cuotas', 2, '#FFC107', 1),
('PAGO_ADELANTADO', 'Pago Adelantado', 'Pago anticipado de cuotas futuras', 3, '#17A2B8', 1),
('CANCELACION_TOTAL', 'Cancelación Total', 'Pago total del saldo del préstamo', 4, '#6610F2', 1);

-- 5. Estado de Pago
INSERT IGNORE INTO `estado_pago` (`codigo`, `nombre`, `descripcion`, `orden`, `color`, `activo`) VALUES
('APLICADO', 'Aplicado', 'Pago aplicado correctamente', 1, '#28A745', 1),
('ANULADO', 'Anulado', 'Pago anulado por error o reversión', 2, '#DC3545', 1);

-- 6. Sexo
INSERT IGNORE INTO `sexo` (`codigo`, `nombre`, `descripcion`, `orden`, `activo`) VALUES
('MASCULINO', 'Masculino', 'Persona de sexo masculino', 1, 1),
('FEMENINO', 'Femenino', 'Persona de sexo femenino', 2, 1),
('OTRO', 'Otro', 'Otra identidad de género', 3, 1);

-- 7. Estado de Solicitud
INSERT IGNORE INTO `estado_solicitud` (`codigo`, `nombre`, `descripcion`, `orden`, `color`, `activo`) VALUES
('CREADA', 'Creada', 'Solicitud creada, pendiente de análisis', 1, '#6C757D', 1),
('EN_ANALISIS', 'En Análisis', 'Solicitud en proceso de análisis', 2, '#17A2B8', 1),
('OBSERVADA', 'Observada', 'Solicitud con observaciones pendientes', 3, '#FFC107', 1),
('DENEGADA', 'Denegada', 'Solicitud denegada', 4, '#DC3545', 1),
('APROBADA', 'Aprobada', 'Solicitud aprobada', 5, '#28A745', 1),
('DESEMBOLSADA', 'Desembolsada', 'Solicitud desembolsada', 6, '#007BFF', 1),
('CANCELADA', 'Cancelada', 'Solicitud cancelada', 7, '#6C757D', 1),
('PENDIENTE_COMITE', 'Pendiente Comité', 'Solicitud pendiente de revisión por comité de crédito', 8, '#FD7E14', 1),
('AUTORIZADA', 'Autorizada', 'Solicitud autorizada por el comité', 9, '#20C997', 1),
('DENEGADA_COMITE', 'Denegada por Comité', 'Solicitud denegada por el comité de crédito', 10, '#E83E8C', 1),
('OBSERVADA_COMITE', 'Observada por Comité', 'Solicitud con observaciones del comité de crédito', 11, '#F8B739', 1);

-- 8. Destino de Crédito
INSERT IGNORE INTO `destino_credito` (`codigo`, `nombre`, `descripcion`, `orden`, `activo`) VALUES
('CAPITAL_TRABAJO', 'Capital de Trabajo', 'Crédito destinado a capital de trabajo empresarial', 1, 1),
('ACTIVO_FIJO', 'Activo Fijo', 'Crédito para adquisición de activos fijos', 2, 1),
('CONSUMO_PERSONAL', 'Consumo Personal', 'Crédito para consumo personal', 3, 1),
('VIVIENDA_NUEVA', 'Vivienda Nueva', 'Crédito para compra de vivienda nueva', 4, 1),
('VIVIENDA_USADA', 'Vivienda Usada', 'Crédito para compra de vivienda usada', 5, 1),
('MEJORA_VIVIENDA', 'Mejora de Vivienda', 'Crédito para mejoras o remodelación de vivienda', 6, 1),
('CONSOLIDACION_DEUDAS', 'Consolidación de Deudas', 'Crédito para consolidar deudas existentes', 7, 1),
('EDUCACION', 'Educación', 'Crédito para gastos educativos', 8, 1),
('SALUD', 'Salud', 'Crédito para gastos de salud', 9, 1),
('VEHICULO', 'Vehículo', 'Crédito para compra de vehículo', 10, 1),
('OTRO', 'Otro', 'Otro destino de crédito', 11, 1);

-- 9. Estado de Cuota
INSERT IGNORE INTO `estado_cuota` (`codigo`, `nombre`, `descripcion`, `orden`, `color`, `activo`) VALUES
('PENDIENTE', 'Pendiente', 'Cuota pendiente de pago', 1, '#FFC107', 1),
('PAGADA', 'Pagada', 'Cuota pagada completamente', 2, '#28A745', 1),
('PARCIAL', 'Parcial', 'Cuota con pago parcial', 3, '#17A2B8', 1),
('MORA', 'En Mora', 'Cuota en estado de mora', 4, '#DC3545', 1);

-- 10. Tipo de Interés
INSERT IGNORE INTO `tipo_interes` (`codigo`, `nombre`, `descripcion`, `orden`, `activo`) VALUES
('FLAT', 'Tasa Flat', 'Interés calculado sobre el saldo inicial durante todo el plazo', 1, 1),
('AMORTIZADO', 'Amortizado', 'Interés calculado sobre saldo decreciente (sistema francés)', 2, 1);

-- 11. Periodicidad de Pago
INSERT IGNORE INTO `periodicidad_pago` (`codigo`, `nombre`, `descripcion`, `orden`, `activo`) VALUES
('DIARIO', 'Diario', 'Pagos diarios', 1, 1),
('SEMANAL', 'Semanal', 'Pagos semanales', 2, 1),
('QUINCENAL', 'Quincenal', 'Pagos quincenales', 3, 1),
('MENSUAL', 'Mensual', 'Pagos mensuales', 4, 1),
('TRIMESTRAL', 'Trimestral', 'Pagos trimestrales', 5, 1),
('SEMESTRAL', 'Semestral', 'Pagos semestrales', 6, 1),
('ANUAL', 'Anual', 'Pagos anuales', 7, 1),
('AL_VENCIMIENTO', 'Al Vencimiento', 'Pago único al vencimiento del préstamo', 8, 1);

-- 12. Tipo de Cálculo
INSERT IGNORE INTO `tipo_calculo` (`codigo`, `nombre`, `descripcion`, `orden`, `activo`) VALUES
('FIJO', 'Monto Fijo', 'Monto fijo en dólares', 1, 1),
('PORCENTAJE', 'Porcentaje', 'Porcentaje sobre el monto', 2, 1);

-- 13. Clasificación de Préstamos (NCB-022)
INSERT IGNORE INTO `clasificacion_prestamo` (`codigo`, `nombre`, `descripcion`, `orden`, `color`, `activo`) VALUES
('A', 'Categoría A - Normal', 'Créditos con pago puntual, sin atrasos', 1, '#28A745', 1),
('B', 'Categoría B - Mención Especial', 'Atrasos de 1 a 30 días', 2, '#FFC107', 1),
('C', 'Categoría C - Deficiente', 'Atrasos de 31 a 90 días', 3, '#FD7E14', 1),
('D', 'Categoría D - Dudosa Recuperación', 'Atrasos de 91 a 180 días', 4, '#DC3545', 1),
('E', 'Categoría E - Irrecuperable', 'Atrasos mayores a 180 días', 5, '#6C757D', 1);

-- 14. Estado de Préstamo
INSERT IGNORE INTO `estado_prestamo` (`codigo`, `nombre`, `descripcion`, `orden`, `color`, `activo`) VALUES
('VIGENTE', 'Vigente', 'Préstamo activo en proceso de pago', 1, '#28A745', 1),
('MORA', 'En Mora', 'Préstamo con pagos atrasados', 2, '#DC3545', 1),
('CANCELADO', 'Cancelado', 'Préstamo totalmente pagado', 3, '#17A2B8', 1),
('CASTIGADO', 'Castigado', 'Préstamo declarado incobrable', 4, '#6C757D', 1);

COMMIT;

-- =====================================================
-- PARTE 2: ROLES DEL SISTEMA
-- =====================================================

INSERT IGNORE INTO `rol` (`codigo`, `nombre`, `descripcion`, `orden`, `activo`) VALUES
('ADMIN', 'Administrador', 'Acceso completo a todo el sistema', 1, 1),
('ASESOR', 'Asesor de Negocio', 'Acceso a clientes, solicitudes y análisis del asesor', 2, 1),
('COMITE', 'Comité de Crédito', 'Acceso al comité de crédito y visualización de solicitudes', 3, 1),
('CAJERO', 'Cajero', 'Acceso a registro de pagos y consultas', 4, 1),
('GERENTE', 'Gerente', 'Acceso a reportes y supervisión', 5, 1);

COMMIT;

-- =====================================================
-- PARTE 3: LÍNEAS DE CRÉDITO
-- =====================================================

INSERT IGNORE INTO `linea_credito` (`id`, `codigo`, `nombre`, `descripcion`, `activo`) VALUES
(1, 'MICRO', 'Microcrédito', 'Línea de crédito para microempresas y pequeños negocios', 1),
(2, 'CONSUMO', 'Crédito de Consumo', 'Línea de crédito para consumo personal', 1),
(3, 'VIVIENDA', 'Crédito Hipotecario', 'Línea de crédito para vivienda', 1);

COMMIT;

-- =====================================================
-- PARTE 4: TIPOS DE CRÉDITO
-- =====================================================

INSERT IGNORE INTO `tipo_credito` (
    `id`, `codigo`, `nombre`, `descripcion`, `lineaCreditoId`,
    `tasaInteres`, `tasaInteresMinima`, `tasaInteresMaxima`, `tasaInteresMoratorio`,
    `montoMinimo`, `montoMaximo`, `plazoMinimo`, `plazoMaximo`,
    `periodicidadPago`, `tipoCuota`, `diasGracia`, `requiereGarantia`,
    `fechaVigenciaDesde`, `fechaVigenciaHasta`, `activo`
) VALUES
(1, 'MICRO-SEMANAL', 'Microcrédito Semanal', 'Microcrédito con pagos semanales', 1,
    10.00, 8.00, 15.00, 15.00,
    100.00, 5000.00, 1, 12,
    'semanal', 'fija', 0, 0,
    '2020-01-01', NULL, 1),
(2, 'MICRO-MENSUAL', 'Microcrédito Mensual', 'Microcrédito con pagos mensuales', 1,
    12.00, 10.00, 18.00, 18.00,
    500.00, 10000.00, 3, 24,
    'mensual', 'fija', 3, 0,
    '2020-01-01', NULL, 1),
(3, 'CONSUMO-MENSUAL', 'Crédito de Consumo', 'Crédito personal para consumo', 2,
    15.00, 12.00, 20.00, 20.00,
    300.00, 8000.00, 6, 36,
    'mensual', 'fija', 5, 0,
    '2020-01-01', NULL, 1);

COMMIT;

-- =====================================================
-- PARTE 5: USUARIO ADMINISTRADOR INICIAL
-- =====================================================

-- Obtener el ID del rol ADMIN
SET @adminRolId = (SELECT id FROM rol WHERE codigo = 'ADMIN' LIMIT 1);

-- Insertar usuario administrador
-- Password: Admin123! (deberá cambiarse en producción)
-- Hash bcrypt generado con salt rounds = 10
INSERT IGNORE INTO `users` (
    `email`,
    `password`,
    `firstName`,
    `lastName`,
    `isActive`,
    `rolId`
) VALUES (
    'admin@finanzia.com',
    '$2b$10$XYZ123ABCHashPlaceholderChangeInProduction',
    'Administrador',
    'Sistema',
    1,
    @adminRolId
);

COMMIT;

-- =====================================================
-- REHABILITAR VERIFICACIONES
-- =====================================================

SET FOREIGN_KEY_CHECKS = 1;
SET AUTOCOMMIT = 1;

-- =====================================================
-- VERIFICACIÓN DE DATOS BASE
-- =====================================================

SELECT '======================================' AS '';
SELECT '=== DATOS BASE CONFIGURADOS ===' AS '';
SELECT '======================================' AS '';

SELECT 'Catálogos configurados:' AS 'Categoría',
    CONCAT(
        (SELECT COUNT(*) FROM estado_garantia), ' estados garantía, ',
        (SELECT COUNT(*) FROM estado_solicitud), ' estados solicitud, ',
        (SELECT COUNT(*) FROM estado_prestamo), ' estados préstamo'
    ) AS 'Registros';

SELECT 'Roles configurados:' AS 'Categoría', COUNT(*) AS 'Registros' FROM rol;
SELECT 'Líneas de crédito:' AS 'Categoría', COUNT(*) AS 'Registros' FROM linea_credito;
SELECT 'Tipos de crédito:' AS 'Categoría', COUNT(*) AS 'Registros' FROM tipo_credito;
SELECT 'Usuarios iniciales:' AS 'Categoría', COUNT(*) AS 'Registros' FROM users;

SELECT '======================================' AS '';
SELECT '=== CONFIGURACIÓN BASE COMPLETADA ===' AS '';
SELECT '======================================' AS '';

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
--
-- 1. El password del usuario admin es un hash placeholder.
--    DEBE cambiarse en producción usando bcrypt.
--
-- 2. Los IDs de tipos de crédito están hardcodeados (1, 2, 3)
--    para mantener compatibilidad con los préstamos existentes.
--
-- 3. Después de ejecutar este script, continuar con:
--    - 01_insert_personas_mysql.sql
--    - 02_insert_direcciones_mysql.sql
--    - 05_generate_solicitudes_mysql.sql (NUEVO)
--    - 03_insert_prestamos_mysql.sql (ACTUALIZADO)
--    - 04_insert_pagos_mysql.sql
--
-- =====================================================
