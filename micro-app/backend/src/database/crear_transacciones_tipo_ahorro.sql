CREATE TABLE transacciones_tipo_ahorro (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipoAhorroId INT NOT NULL,
  tipoTransaccionId INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tipoAhorroId) REFERENCES tipo_ahorro(id),
  FOREIGN KEY (tipoTransaccionId) REFERENCES tipo_transaccion_ahorro(id),
  UNIQUE KEY uq_tipo_ahorro_transaccion (tipoAhorroId, tipoTransaccionId)
);
