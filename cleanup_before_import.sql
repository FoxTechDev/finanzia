-- Script para limpiar tablas antes de importar
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE pago;
TRUNCATE TABLE prestamo;
TRUNCATE TABLE direccion;
TRUNCATE TABLE persona;
SET FOREIGN_KEY_CHECKS=1;
SELECT 'Tablas limpiadas exitosamente' AS Resultado;
