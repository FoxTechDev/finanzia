-- Script para insertar tipos de vivienda predeterminados
-- Ejecutar después de la migración AddCodigoOrdenToTipoVivienda

-- Verificar si ya existen tipos de vivienda
SELECT COUNT(*) as total FROM tipo_vivienda;

-- Insertar tipos de vivienda comunes si la tabla está vacía
INSERT INTO tipo_vivienda (codigo, nombre, descripcion, activo, orden)
SELECT * FROM (
  SELECT 'PROPIA' as codigo, 'Propia' as nombre, 'Vivienda de propiedad del cliente' as descripcion, true as activo, 10 as orden
  UNION ALL
  SELECT 'ALQUILADA', 'Alquilada', 'Vivienda alquilada por el cliente', true, 20
  UNION ALL
  SELECT 'FAMILIAR', 'Familiar', 'Vivienda proporcionada por familiares', true, 30
  UNION ALL
  SELECT 'PRESTADA', 'Prestada', 'Vivienda prestada temporalmente', true, 40
  UNION ALL
  SELECT 'OTRA', 'Otra', 'Otro tipo de vivienda no especificado', true, 50
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM tipo_vivienda LIMIT 1);

-- Verificar los registros insertados
SELECT * FROM tipo_vivienda ORDER BY orden;
