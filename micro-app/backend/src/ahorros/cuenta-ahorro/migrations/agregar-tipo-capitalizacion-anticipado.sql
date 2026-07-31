-- ============================================================
-- Migración: Tipo de Capitalización "Pago Anticipado"
-- Fecha: 2026-07-30
-- Descripción: Agrega al catálogo tipo_capitalizacion la opción
--              de pago de intereses el mismo día de apertura del DPF.
--              dias = -1 es un valor centinela (distinto de dias = 0,
--              que ya significa "al vencimiento").
-- ============================================================

INSERT INTO tipo_capitalizacion (codigo, nombre, dias, activo)
SELECT 'ANTICIPADO', 'Pago Anticipado', -1, 1
WHERE NOT EXISTS (
  SELECT 1 FROM tipo_capitalizacion WHERE codigo = 'ANTICIPADO'
);

-- Verificar resultado
SELECT id, codigo, nombre, dias, activo
FROM tipo_capitalizacion
ORDER BY id;
