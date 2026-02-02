-- Crear tabla tipo_vivienda
CREATE TABLE IF NOT EXISTS tipo_vivienda (
  idTipoVivienda INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT NULL,
  activo TINYINT(1) DEFAULT 1,
  orden INT NULL
);

-- Insertar datos iniciales
INSERT INTO tipo_vivienda (codigo, nombre, descripcion, activo, orden) VALUES
('PROPIA', 'Propia', 'Vivienda de propiedad del cliente', 1, 10),
('ALQUILADA', 'Alquilada', 'Vivienda alquilada por el cliente', 1, 20),
('FAMILIAR', 'Familiar', 'Vivienda proporcionada por familiares', 1, 30),
('PRESTADA', 'Prestada', 'Vivienda prestada temporalmente', 1, 40),
('OTRA', 'Otra', 'Otro tipo de vivienda no especificado', 1, 50)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Agregar columna idTipoVivienda a direccion si no existe
SET @dbname = DATABASE();
SET @tablename = 'direccion';
SET @columnname = 'idTipoVivienda';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verificar datos insertados
SELECT * FROM tipo_vivienda ORDER BY orden;
