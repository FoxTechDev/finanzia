-- =====================================================
-- MIGRACIÓN: Convertir TipoVivienda de ENUM a Tabla
-- =====================================================
-- Descripción: Este script convierte el campo enum 'tipoVivienda'
--              en la tabla 'direccion' a una relación con la nueva
--              tabla 'tipo_vivienda'
-- =====================================================

-- Paso 1: Crear la tabla tipo_vivienda
CREATE TABLE IF NOT EXISTS tipo_vivienda (
  idTipoVivienda INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT NULL,
  activo BOOLEAN DEFAULT TRUE,
  orden INT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Paso 2: Insertar datos iniciales
INSERT INTO tipo_vivienda (codigo, nombre, descripcion, activo, orden) VALUES
('PROPIA', 'Propia', 'Vivienda en propiedad', true, 1),
('ALQUILADA', 'Alquilada', 'Vivienda en alquiler', true, 2),
('FAMILIAR', 'Familiar', 'Vivienda familiar', true, 3),
('PRESTADA', 'Prestada', 'Vivienda prestada', true, 4),
('OTRA', 'Otra', 'Otro tipo de vivienda', true, 5);

-- Paso 3: Agregar nueva columna idTipoVivienda a la tabla direccion
ALTER TABLE direccion
ADD COLUMN idTipoVivienda INT NULL AFTER detalleDireccion;

-- Paso 4: Migrar datos del enum al nuevo campo
UPDATE direccion
SET idTipoVivienda = CASE tipoVivienda
  WHEN 'Propia' THEN 1
  WHEN 'Alquilada' THEN 2
  WHEN 'Familiar' THEN 3
  WHEN 'Prestada' THEN 4
  WHEN 'Otra' THEN 5
  ELSE NULL
END
WHERE tipoVivienda IS NOT NULL;

-- Paso 5: Crear la foreign key
ALTER TABLE direccion
ADD CONSTRAINT FK_direccion_tipo_vivienda
FOREIGN KEY (idTipoVivienda) REFERENCES tipo_vivienda(idTipoVivienda)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Paso 6: Verificar la migración antes de eliminar la columna antigua
SELECT
  'Registros totales en direccion' AS descripcion,
  COUNT(*) AS cantidad
FROM direccion
UNION ALL
SELECT
  'Registros con tipoVivienda enum',
  COUNT(*)
FROM direccion
WHERE tipoVivienda IS NOT NULL
UNION ALL
SELECT
  'Registros con idTipoVivienda migrados',
  COUNT(*)
FROM direccion
WHERE idTipoVivienda IS NOT NULL;

-- Paso 7: SOLO SI LA VERIFICACIÓN ES CORRECTA, eliminar la columna enum antigua
-- DESCOMENTAR LA SIGUIENTE LÍNEA DESPUÉS DE VERIFICAR:
-- ALTER TABLE direccion DROP COLUMN tipoVivienda;

-- =====================================================
-- ROLLBACK (en caso de necesitar revertir)
-- =====================================================
/*
-- Agregar de vuelta la columna enum
ALTER TABLE direccion
ADD COLUMN tipoVivienda_restored ENUM('Propia', 'Alquilada', 'Familiar', 'Prestada', 'Otra') NULL
AFTER detalleDireccion;

-- Restaurar datos del enum
UPDATE direccion d
INNER JOIN tipo_vivienda tv ON d.idTipoVivienda = tv.idTipoVivienda
SET d.tipoVivienda_restored = tv.nombre
WHERE d.idTipoVivienda IS NOT NULL;

-- Eliminar foreign key
ALTER TABLE direccion DROP FOREIGN KEY FK_direccion_tipo_vivienda;

-- Eliminar columna idTipoVivienda
ALTER TABLE direccion DROP COLUMN idTipoVivienda;

-- Eliminar tabla tipo_vivienda
DROP TABLE tipo_vivienda;

-- Renombrar columna restaurada
ALTER TABLE direccion CHANGE tipoVivienda_restored tipoVivienda
ENUM('Propia', 'Alquilada', 'Familiar', 'Prestada', 'Otra') NULL;
*/
