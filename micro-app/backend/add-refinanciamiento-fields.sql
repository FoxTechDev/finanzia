-- Migración para agregar campos de refinanciamiento de préstamos
-- Ejecutar en la base de datos MySQL

-- 1. Agregar cancelacionPrestamo a tipo_deduccion
ALTER TABLE `tipo_deduccion`
ADD COLUMN `cancelacionPrestamo` tinyint NOT NULL DEFAULT 0;

-- 2. Agregar prestamoACancelarId a deduccion_prestamo
ALTER TABLE `deduccion_prestamo`
ADD COLUMN `prestamoACancelarId` int NULL;

ALTER TABLE `deduccion_prestamo`
ADD CONSTRAINT `FK_deduccion_prestamo_cancelar`
FOREIGN KEY (`prestamoACancelarId`) REFERENCES `prestamo`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- 3. Agregar refinanciamiento a prestamo
ALTER TABLE `prestamo`
ADD COLUMN `refinanciamiento` tinyint NOT NULL DEFAULT 0;

-- 4. Insertar tipo de deducción para cancelación de préstamo
INSERT INTO `tipo_deduccion` (`codigo`, `nombre`, `descripcion`, `tipoCalculoDefault`, `valorDefault`, `activo`, `cancelacionPrestamo`)
VALUES ('CANCEL_PREST', 'Cancelación de Préstamo Anterior', 'Deducción para cancelar saldo de préstamo existente por refinanciamiento', 'FIJO', 0, 1, 1);

-- Verificación
SELECT 'Campos agregados correctamente' AS resultado;
SELECT * FROM tipo_deduccion WHERE codigo = 'CANCEL_PREST';
