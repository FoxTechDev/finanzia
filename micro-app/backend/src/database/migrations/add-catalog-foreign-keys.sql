-- =====================================================
-- MIGRACIÓN: Agregar columnas de relación con catálogos
-- Agrega las columnas FK para relacionar las entidades
-- existentes con las nuevas tablas de catálogo
-- =====================================================

-- 1. Tabla: garantia - Agregar relación con estado_garantia
ALTER TABLE `garantia`
ADD COLUMN `estadoGarantiaId` INT NULL AFTER `estado`;

-- 2. Tabla: solicitud - Agregar relación con recomendacion_asesor
ALTER TABLE `solicitud`
ADD COLUMN `recomendacionAsesorId` INT NULL AFTER `recomendacionAsesor`;

-- 3. Tabla: solicitud - Agregar relación con estado_solicitud
ALTER TABLE `solicitud`
ADD COLUMN `estadoSolicitudId` INT NULL AFTER `estado`;

-- 4. Tabla: solicitud - Agregar relación con destino_credito
ALTER TABLE `solicitud`
ADD COLUMN `destinoCreditoId` INT NULL AFTER `destinoCredito`;

-- 5. Tabla: decision_comite - Agregar relación con tipo_decision_comite
ALTER TABLE `decision_comite`
ADD COLUMN `tipoDecisionComiteId` INT NULL AFTER `tipoDecision`;

-- 6. Tabla: pago - Agregar relación con tipo_pago
ALTER TABLE `pago`
ADD COLUMN `tipoPagoId` INT NULL AFTER `tipoPago`;

-- 7. Tabla: pago - Agregar relación con estado_pago
ALTER TABLE `pago`
ADD COLUMN `estadoPagoId` INT NULL AFTER `estado`;

-- 8. Tabla: persona - Agregar relación con sexo
ALTER TABLE `persona`
ADD COLUMN `sexoId` INT NULL AFTER `sexo`;

-- 9. Tabla: plan_pago - Agregar relación con estado_cuota
ALTER TABLE `plan_pago`
ADD COLUMN `estadoCuotaId` INT NULL AFTER `estado`;

-- 10. Tabla: prestamo - Agregar relación con tipo_interes
ALTER TABLE `prestamo`
ADD COLUMN `tipoInteresId` INT NULL AFTER `tipoInteres`;

-- 11. Tabla: prestamo - Agregar relación con periodicidad_pago
ALTER TABLE `prestamo`
ADD COLUMN `periodicidadPagoId` INT NULL AFTER `periodicidadPago`;

-- 12. Tabla: prestamo - Agregar relación con categoria_ncb022
ALTER TABLE `prestamo`
ADD COLUMN `categoriaNcb022Id` INT NULL AFTER `categoriaNCB022`;

-- 13. Tabla: tipo_deduccion - Agregar relación con tipo_calculo
ALTER TABLE `tipo_deduccion`
ADD COLUMN `tipoCalculoId` INT NULL AFTER `tipoCalculoDefault`;

-- =====================================================
-- MIGRACIÓN DE DATOS: Poblar las nuevas columnas FK
-- Convierte los valores enum existentes a IDs de catálogo
-- =====================================================

-- 1. Migrar garantia.estadoGarantiaId
UPDATE `garantia` g
INNER JOIN `estado_garantia` eg ON g.estado = eg.codigo
SET g.estadoGarantiaId = eg.id;

-- 2. Migrar solicitud.recomendacionAsesorId
UPDATE `solicitud` s
INNER JOIN `recomendacion_asesor` ra ON s.recomendacionAsesor = ra.codigo
SET s.recomendacionAsesorId = ra.id
WHERE s.recomendacionAsesor IS NOT NULL;

-- 3. Migrar solicitud.estadoSolicitudId
UPDATE `solicitud` s
INNER JOIN `estado_solicitud` es ON s.estado = es.codigo
SET s.estadoSolicitudId = es.id;

-- 4. Migrar solicitud.destinoCreditoId
UPDATE `solicitud` s
INNER JOIN `destino_credito` dc ON s.destinoCredito = dc.codigo
SET s.destinoCreditoId = dc.id;

-- 5. Migrar decision_comite.tipoDecisionComiteId
UPDATE `decision_comite` dc
INNER JOIN `tipo_decision_comite` tdc ON dc.tipoDecision = tdc.codigo
SET dc.tipoDecisionComiteId = tdc.id;

-- 6. Migrar pago.tipoPagoId
UPDATE `pago` p
INNER JOIN `tipo_pago` tp ON p.tipoPago = tp.codigo
SET p.tipoPagoId = tp.id;

-- 7. Migrar pago.estadoPagoId
UPDATE `pago` p
INNER JOIN `estado_pago` ep ON p.estado = ep.codigo
SET p.estadoPagoId = ep.id;

-- 8. Migrar persona.sexoId
UPDATE `persona` p
INNER JOIN `sexo` s ON UPPER(p.sexo) = s.codigo
SET p.sexoId = s.id
WHERE p.sexo IS NOT NULL;

-- 9. Migrar plan_pago.estadoCuotaId
UPDATE `plan_pago` pp
INNER JOIN `estado_cuota` ec ON pp.estado = ec.codigo
SET pp.estadoCuotaId = ec.id;

-- 10. Migrar prestamo.tipoInteresId
UPDATE `prestamo` p
INNER JOIN `tipo_interes` ti ON p.tipoInteres = ti.codigo
SET p.tipoInteresId = ti.id;

-- 11. Migrar prestamo.periodicidadPagoId
UPDATE `prestamo` p
INNER JOIN `periodicidad_pago` pp ON p.periodicidadPago = pp.codigo
SET p.periodicidadPagoId = pp.id;

-- 12. Migrar prestamo.categoriaNcb022Id
UPDATE `prestamo` p
INNER JOIN `categoria_ncb022` cn ON p.categoriaNCB022 = cn.codigo
SET p.categoriaNcb022Id = cn.id;

-- 13. Migrar tipo_deduccion.tipoCalculoId
UPDATE `tipo_deduccion` td
INNER JOIN `tipo_calculo` tc ON td.tipoCalculoDefault = tc.codigo
SET td.tipoCalculoId = tc.id;

-- =====================================================
-- AGREGAR CONSTRAINTS DE FOREIGN KEYS
-- =====================================================

-- 1. garantia -> estado_garantia
ALTER TABLE `garantia`
ADD CONSTRAINT `FK_garantia_estadoGarantia`
FOREIGN KEY (`estadoGarantiaId`) REFERENCES `estado_garantia`(`id`);

-- 2. solicitud -> recomendacion_asesor
ALTER TABLE `solicitud`
ADD CONSTRAINT `FK_solicitud_recomendacionAsesor`
FOREIGN KEY (`recomendacionAsesorId`) REFERENCES `recomendacion_asesor`(`id`);

-- 3. solicitud -> estado_solicitud
ALTER TABLE `solicitud`
ADD CONSTRAINT `FK_solicitud_estadoSolicitud`
FOREIGN KEY (`estadoSolicitudId`) REFERENCES `estado_solicitud`(`id`);

-- 4. solicitud -> destino_credito
ALTER TABLE `solicitud`
ADD CONSTRAINT `FK_solicitud_destinoCredito`
FOREIGN KEY (`destinoCreditoId`) REFERENCES `destino_credito`(`id`);

-- 5. decision_comite -> tipo_decision_comite
ALTER TABLE `decision_comite`
ADD CONSTRAINT `FK_decisionComite_tipoDecision`
FOREIGN KEY (`tipoDecisionComiteId`) REFERENCES `tipo_decision_comite`(`id`);

-- 6. pago -> tipo_pago
ALTER TABLE `pago`
ADD CONSTRAINT `FK_pago_tipoPago`
FOREIGN KEY (`tipoPagoId`) REFERENCES `tipo_pago`(`id`);

-- 7. pago -> estado_pago
ALTER TABLE `pago`
ADD CONSTRAINT `FK_pago_estadoPago`
FOREIGN KEY (`estadoPagoId`) REFERENCES `estado_pago`(`id`);

-- 8. persona -> sexo
ALTER TABLE `persona`
ADD CONSTRAINT `FK_persona_sexo`
FOREIGN KEY (`sexoId`) REFERENCES `sexo`(`id`);

-- 9. plan_pago -> estado_cuota
ALTER TABLE `plan_pago`
ADD CONSTRAINT `FK_planPago_estadoCuota`
FOREIGN KEY (`estadoCuotaId`) REFERENCES `estado_cuota`(`id`);

-- 10. prestamo -> tipo_interes
ALTER TABLE `prestamo`
ADD CONSTRAINT `FK_prestamo_tipoInteres`
FOREIGN KEY (`tipoInteresId`) REFERENCES `tipo_interes`(`id`);

-- 11. prestamo -> periodicidad_pago
ALTER TABLE `prestamo`
ADD CONSTRAINT `FK_prestamo_periodicidadPago`
FOREIGN KEY (`periodicidadPagoId`) REFERENCES `periodicidad_pago`(`id`);

-- 12. prestamo -> categoria_ncb022
ALTER TABLE `prestamo`
ADD CONSTRAINT `FK_prestamo_categoriaNcb022`
FOREIGN KEY (`categoriaNcb022Id`) REFERENCES `categoria_ncb022`(`id`);

-- 13. tipo_deduccion -> tipo_calculo
ALTER TABLE `tipo_deduccion`
ADD CONSTRAINT `FK_tipoDeduccion_tipoCalculo`
FOREIGN KEY (`tipoCalculoId`) REFERENCES `tipo_calculo`(`id`);

-- =====================================================
-- ÍNDICES para mejorar performance
-- =====================================================

CREATE INDEX `IDX_garantia_estadoGarantiaId` ON `garantia`(`estadoGarantiaId`);
CREATE INDEX `IDX_solicitud_recomendacionAsesorId` ON `solicitud`(`recomendacionAsesorId`);
CREATE INDEX `IDX_solicitud_estadoSolicitudId` ON `solicitud`(`estadoSolicitudId`);
CREATE INDEX `IDX_solicitud_destinoCreditoId` ON `solicitud`(`destinoCreditoId`);
CREATE INDEX `IDX_decisionComite_tipoDecisionComiteId` ON `decision_comite`(`tipoDecisionComiteId`);
CREATE INDEX `IDX_pago_tipoPagoId` ON `pago`(`tipoPagoId`);
CREATE INDEX `IDX_pago_estadoPagoId` ON `pago`(`estadoPagoId`);
CREATE INDEX `IDX_persona_sexoId` ON `persona`(`sexoId`);
CREATE INDEX `IDX_planPago_estadoCuotaId` ON `plan_pago`(`estadoCuotaId`);
CREATE INDEX `IDX_prestamo_tipoInteresId` ON `prestamo`(`tipoInteresId`);
CREATE INDEX `IDX_prestamo_periodicidadPagoId` ON `prestamo`(`periodicidadPagoId`);
CREATE INDEX `IDX_prestamo_categoriaNcb022Id` ON `prestamo`(`categoriaNcb022Id`);
CREATE INDEX `IDX_tipoDeduccion_tipoCalculoId` ON `tipo_deduccion`(`tipoCalculoId`);

-- =====================================================
-- NOTA IMPORTANTE:
-- Las columnas enum antiguas NO se eliminan en esta migración
-- para mantener compatibilidad durante la transición.
-- Una vez verificado que todo funciona correctamente,
-- ejecutar el script drop-enum-columns.sql
-- =====================================================
