-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS micro_app
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE micro_app;

-- Las tablas se crearán automáticamente con TypeORM (synchronize: true)
