-- ================================================
-- MIGRACION: Nuevos Campos para Módulo de Clientes
-- Fecha: 2026-01-26
-- ================================================

-- IMPORTANTE: Hacer backup de la base de datos antes de ejecutar

USE micro_app;

-- ================================================
-- 1. CREAR TABLA dependencia_familiar
-- ================================================

CREATE TABLE IF NOT EXISTS dependencia_familiar (
  idDependencia INT PRIMARY KEY AUTO_INCREMENT,
  idPersona INT NOT NULL,
  nombreDependiente VARCHAR(150) NOT NULL,
  parentesco ENUM('Hijo','Hija','Cónyuge','Padre','Madre','Hermano','Hermana','Abuelo','Abuela','Otro') DEFAULT 'Otro' NOT NULL,
  edad INT NULL,
  trabaja BOOLEAN DEFAULT FALSE NOT NULL,
  estudia BOOLEAN DEFAULT FALSE NOT NULL,
  observaciones TEXT NULL,

  -- Índice para mejorar búsquedas por persona
  INDEX IDX_dependencia_familiar_persona (idPersona),

  -- Foreign key hacia tabla persona
  CONSTRAINT FK_dependencia_familiar_persona
    FOREIGN KEY (idPersona)
    REFERENCES persona(idPersona)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 2. AGREGAR CAMPOS DE VIVIENDA A direccion
-- ================================================

ALTER TABLE direccion
  ADD COLUMN IF NOT EXISTS tipoVivienda ENUM('Propia','Alquilada','Familiar','Prestada','Otra') NULL AFTER detalleDireccion,
  ADD COLUMN IF NOT EXISTS tiempoResidenciaAnios INT NULL AFTER tipoVivienda,
  ADD COLUMN IF NOT EXISTS tiempoResidenciaMeses INT NULL AFTER tiempoResidenciaAnios,
  ADD COLUMN IF NOT EXISTS montoAlquiler DECIMAL(10,2) NULL AFTER tiempoResidenciaMeses;

-- ================================================
-- 3. AGREGAR CAMPOS DE INGRESOS Y GASTOS A actividad_economica
-- ================================================

ALTER TABLE actividad_economica
  -- Ingresos adicionales
  ADD COLUMN IF NOT EXISTS ingresosAdicionales DECIMAL(14,2) NULL AFTER longitud,
  ADD COLUMN IF NOT EXISTS descripcionIngresosAdicionales TEXT NULL AFTER ingresosAdicionales,

  -- Gastos detallados
  ADD COLUMN IF NOT EXISTS gastosVivienda DECIMAL(10,2) NULL COMMENT 'Alquiler o hipoteca mensual' AFTER descripcionIngresosAdicionales,
  ADD COLUMN IF NOT EXISTS gastosAlimentacion DECIMAL(10,2) NULL AFTER gastosVivienda,
  ADD COLUMN IF NOT EXISTS gastosTransporte DECIMAL(10,2) NULL AFTER gastosAlimentacion,
  ADD COLUMN IF NOT EXISTS gastosServiciosBasicos DECIMAL(10,2) NULL COMMENT 'Agua, luz, teléfono, internet' AFTER gastosTransporte,
  ADD COLUMN IF NOT EXISTS gastosEducacion DECIMAL(10,2) NULL AFTER gastosServiciosBasicos,
  ADD COLUMN IF NOT EXISTS gastosMedicos DECIMAL(10,2) NULL AFTER gastosEducacion,
  ADD COLUMN IF NOT EXISTS otrosGastos DECIMAL(10,2) NULL AFTER gastosMedicos,
  ADD COLUMN IF NOT EXISTS totalGastos DECIMAL(14,2) NULL COMMENT 'Suma total de todos los gastos' AFTER otrosGastos;

-- ================================================
-- VERIFICACIÓN
-- ================================================

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla dependencia_familiar creada' AS status, COUNT(*) AS count
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'micro_app'
  AND TABLE_NAME = 'dependencia_familiar';

-- Verificar campos de direccion
SELECT 'Campos de vivienda en direccion' AS status, COUNT(*) AS count
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'micro_app'
  AND TABLE_NAME = 'direccion'
  AND COLUMN_NAME IN ('tipoVivienda', 'tiempoResidenciaAnios', 'tiempoResidenciaMeses', 'montoAlquiler');

-- Verificar campos de actividad_economica
SELECT 'Campos de ingresos/gastos en actividad_economica' AS status, COUNT(*) AS count
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'micro_app'
  AND TABLE_NAME = 'actividad_economica'
  AND COLUMN_NAME IN ('ingresosAdicionales', 'descripcionIngresosAdicionales',
                      'gastosVivienda', 'gastosAlimentacion', 'gastosTransporte',
                      'gastosServiciosBasicos', 'gastosEducacion', 'gastosMedicos',
                      'otrosGastos', 'totalGastos');

-- ================================================
-- ROLLBACK (Solo si es necesario)
-- ================================================
/*
-- Para revertir los cambios, descomentar y ejecutar:

ALTER TABLE actividad_economica
  DROP COLUMN IF EXISTS totalGastos,
  DROP COLUMN IF EXISTS otrosGastos,
  DROP COLUMN IF EXISTS gastosMedicos,
  DROP COLUMN IF EXISTS gastosEducacion,
  DROP COLUMN IF EXISTS gastosServiciosBasicos,
  DROP COLUMN IF EXISTS gastosTransporte,
  DROP COLUMN IF EXISTS gastosAlimentacion,
  DROP COLUMN IF EXISTS gastosVivienda,
  DROP COLUMN IF EXISTS descripcionIngresosAdicionales,
  DROP COLUMN IF EXISTS ingresosAdicionales;

ALTER TABLE direccion
  DROP COLUMN IF EXISTS montoAlquiler,
  DROP COLUMN IF EXISTS tiempoResidenciaMeses,
  DROP COLUMN IF EXISTS tiempoResidenciaAnios,
  DROP COLUMN IF EXISTS tipoVivienda;

DROP TABLE IF EXISTS dependencia_familiar;
*/

-- ================================================
-- FIN DE MIGRACIÓN
-- ================================================
