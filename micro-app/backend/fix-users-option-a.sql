-- ============================================================================
-- OPCIÓN A: Migrar users.id de VARCHAR(36) a INT AUTO_INCREMENT
-- ============================================================================
-- ADVERTENCIA: Este script eliminará los UUIDs existentes y creará nuevos IDs
-- Hacer BACKUP antes de ejecutar

USE micro_app;

-- Paso 1: Crear tabla temporal para migración
CREATE TABLE users_new LIKE users;

ALTER TABLE users_new
MODIFY COLUMN id INT AUTO_INCREMENT;

-- Paso 2: Migrar datos (se asignarán nuevos IDs secuenciales)
INSERT INTO users_new (email, password, firstName, lastName, isActive, createdAt, updatedAt)
SELECT email, password, firstName, lastName, isActive, createdAt, updatedAt
FROM users;

-- Paso 3: Eliminar tabla antigua y renombrar
DROP TABLE users;
RENAME TABLE users_new TO users;

-- Paso 4: Ahora podemos crear las FK pendientes
ALTER TABLE solicitud
ADD CONSTRAINT FK_solicitud_analista
FOREIGN KEY (analistaId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE solicitud
ADD CONSTRAINT FK_solicitud_aprobador
FOREIGN KEY (aprobadorId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE prestamo
ADD CONSTRAINT FK_prestamo_usuario_desembolso
FOREIGN KEY (usuarioDesembolsoId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE pago
ADD CONSTRAINT FK_pago_usuario
FOREIGN KEY (usuarioId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE pago
ADD CONSTRAINT FK_pago_usuario_anulacion
FOREIGN KEY (usuarioAnulacionId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE decision_comite
ADD CONSTRAINT FK_decision_comite_usuario
FOREIGN KEY (usuarioId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE solicitud_historial
ADD CONSTRAINT FK_solicitud_historial_usuario
FOREIGN KEY (usuarioId) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;
