-- ============================================================
-- Migración: Pago de intereses de acciones por transferencia bancaria
-- Fecha: 2026-07-30
-- Descripción: Permite que el dividendo de una acción se pague a una
--              cuenta de ahorro (ya existente) O a un banco externo,
--              igual que ya funciona para DPF. cuentaAhorroDestinoId
--              pasa a ser opcional.
-- ============================================================

ALTER TABLE `accion`
  MODIFY COLUMN `cuentaAhorroDestinoId` int NULL DEFAULT NULL;

ALTER TABLE `accion`
  ADD COLUMN `bancoId` int NULL DEFAULT NULL AFTER `cuentaAhorroDestinoId`,
  ADD COLUMN `cuentaBancoNumero` varchar(30) NULL DEFAULT NULL AFTER `bancoId`,
  ADD COLUMN `cuentaBancoPropietario` varchar(100) NULL DEFAULT NULL AFTER `cuentaBancoNumero`;

ALTER TABLE `accion`
  ADD CONSTRAINT `FK_accion_banco`
  FOREIGN KEY (`bancoId`) REFERENCES `banco`(`id`)
  ON DELETE RESTRICT ON UPDATE NO ACTION;

-- Verificar resultado
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'accion'
  AND COLUMN_NAME IN ('cuentaAhorroDestinoId', 'bancoId', 'cuentaBancoNumero', 'cuentaBancoPropietario')
ORDER BY ORDINAL_POSITION;
