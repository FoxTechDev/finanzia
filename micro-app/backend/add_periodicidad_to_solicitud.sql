-- Agregar columna periodicidadPagoId a la tabla solicitud
ALTER TABLE solicitud
ADD COLUMN periodicidadPagoId INT NULL AFTER tasaInteresPropuesta;

-- Agregar columnas para fecha de pago diario
ALTER TABLE solicitud
ADD COLUMN fechaDesdePago DATE NULL AFTER periodicidadPagoId,
ADD COLUMN fechaHastaPago DATE NULL AFTER fechaDesdePago,
ADD COLUMN diasCalculados INT NULL AFTER fechaHastaPago;

-- Agregar foreign key
ALTER TABLE solicitud
ADD CONSTRAINT FK_solicitud_periodicidad_pago
FOREIGN KEY (periodicidadPagoId) REFERENCES periodicidad_pago(id);
