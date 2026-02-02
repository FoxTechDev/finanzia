-- Migración: Agregar campo tipoInteres a la tabla solicitud
-- Fecha: 2026-02-01
-- Descripción: Permite guardar el tipo de interés (FLAT o AMORTIZADO) directamente en la solicitud

-- Agregar columna tipoInteres a la tabla solicitud
ALTER TABLE solicitud
ADD COLUMN tipoInteres ENUM('FLAT', 'AMORTIZADO') NULL AFTER periodicidadPagoId;

-- Actualizar solicitudes existentes con el valor del tipo de crédito
UPDATE solicitud s
INNER JOIN tipo_credito tc ON s.tipoCreditoId = tc.id
SET s.tipoInteres = tc.tipoCuota
WHERE s.tipoInteres IS NULL;

-- Verificar la migración
SELECT
    COUNT(*) as total_solicitudes,
    SUM(CASE WHEN tipoInteres IS NOT NULL THEN 1 ELSE 0 END) as con_tipo_interes,
    SUM(CASE WHEN tipoInteres = 'FLAT' THEN 1 ELSE 0 END) as tipo_flat,
    SUM(CASE WHEN tipoInteres = 'AMORTIZADO' THEN 1 ELSE 0 END) as tipo_amortizado
FROM solicitud;
