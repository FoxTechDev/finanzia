-- Script para insertar estados de préstamo basados en el enum EstadoPrestamo
-- Fecha: 2026-01-24

USE micro_app;

-- Limpiar datos existentes (opcional - comentar si no se desea)
-- DELETE FROM estado_prestamo;

-- Insertar estados basados en el enum EstadoPrestamo
INSERT INTO estado_prestamo (id, codigo, nombre, descripcion, activo, orden, color, createdAt, updatedAt)
VALUES
(1, 'VIGENTE', 'Vigente', 'Préstamo activo con pagos al día o con atraso mínimo', 1, 1, '#28a745', NOW(), NOW()),
(2, 'MORA', 'En Mora', 'Préstamo con atraso en los pagos superior al plazo establecido', 1, 2, '#ffc107', NOW(), NOW()),
(3, 'CANCELADO', 'Cancelado', 'Préstamo pagado completamente', 1, 3, '#6c757d', NOW(), NOW()),
(4, 'CASTIGADO', 'Castigado', 'Préstamo considerado incobrable y registrado como pérdida', 1, 4, '#dc3545', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  descripcion = VALUES(descripcion),
  activo = VALUES(activo),
  orden = VALUES(orden),
  color = VALUES(color),
  updatedAt = NOW();

-- Verificar inserción
SELECT * FROM estado_prestamo ORDER BY orden;
