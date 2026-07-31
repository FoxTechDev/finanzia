-- ============================================================
-- Migración: Módulo de Acciones
-- Fecha: 2026-07-30
-- Descripción: Crea las tablas del nuevo módulo de acciones
--              (tipo_accion, accion, accion_dividendo) y agrega
--              el tipo de transacción DIVIDENDO_ACCION al catálogo
--              tipo_transaccion_ahorro existente.
-- ============================================================

-- 1. tipo_accion
CREATE TABLE IF NOT EXISTS `tipo_accion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `tasaInteres` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `valorUnitario` decimal(14,2) NOT NULL DEFAULT '0.00' COMMENT 'Valor en dólares de cada acción',
  `activo` tinyint NOT NULL DEFAULT 1,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 2. accion
CREATE TABLE IF NOT EXISTS `accion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `correlativo` varchar(20) NOT NULL,
  `personaId` int NOT NULL,
  `tipoAccionId` int NOT NULL,
  `fechaApertura` date NOT NULL,
  `monto` decimal(14,2) NOT NULL DEFAULT '0.00',
  `cantidadAcciones` decimal(14,4) NOT NULL DEFAULT '0.0000',
  `tasaInteres` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `cuentaAhorroDestinoId` int NOT NULL,
  `activa` tinyint NOT NULL DEFAULT 1,
  `fechaUltimoPagoIntereses` date NULL DEFAULT NULL,
  `observacion` varchar(200) NULL DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE INDEX `IDX_accion_correlativo` (`correlativo`),
  INDEX `IDX_accion_personaId` (`personaId`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

ALTER TABLE `accion`
  ADD CONSTRAINT `FK_accion_persona`
  FOREIGN KEY (`personaId`) REFERENCES `persona`(`idPersona`)
  ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE `accion`
  ADD CONSTRAINT `FK_accion_tipoAccion`
  FOREIGN KEY (`tipoAccionId`) REFERENCES `tipo_accion`(`id`)
  ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE `accion`
  ADD CONSTRAINT `FK_accion_cuentaAhorroDestino`
  FOREIGN KEY (`cuentaAhorroDestinoId`) REFERENCES `cuenta_ahorro`(`id`)
  ON DELETE RESTRICT ON UPDATE NO ACTION;

-- 3. accion_dividendo
CREATE TABLE IF NOT EXISTS `accion_dividendo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `accionId` int NOT NULL,
  `fecha` date NOT NULL,
  `monto` decimal(14,2) NOT NULL DEFAULT '0.00',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX `IDX_accion_dividendo_accionId` (`accionId`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

ALTER TABLE `accion_dividendo`
  ADD CONSTRAINT `FK_accion_dividendo_accion`
  FOREIGN KEY (`accionId`) REFERENCES `accion`(`id`)
  ON DELETE CASCADE ON UPDATE NO ACTION;

-- 4. Nuevo tipo de transacción para el abono del dividendo en la cuenta destino
INSERT INTO `tipo_transaccion_ahorro` (`codigo`, `nombre`, `naturalezaId`)
SELECT 'DIVIDENDO_ACCION', 'Dividendo de Acción',
  (SELECT id FROM `naturaleza_movimiento_ahorro` WHERE codigo = 'ABONO')
WHERE NOT EXISTS (
  SELECT 1 FROM `tipo_transaccion_ahorro` WHERE codigo = 'DIVIDENDO_ACCION'
);

-- Verificar resultado
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('tipo_accion', 'accion', 'accion_dividendo')
ORDER BY TABLE_NAME, ORDINAL_POSITION;
