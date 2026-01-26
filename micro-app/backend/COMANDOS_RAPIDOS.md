# Comandos Rápidos - Sistema de Préstamos

Referencia rápida de comandos para trabajar con la implementación del sistema de préstamos.

---

## Instalación y Configuración

### 1. Instalar Dependencias (si es necesario)
```bash
cd C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\micro-app\backend
npm install
```

### 2. Compilar el Proyecto
```bash
npm run build
```

### 3. Ejecutar en Modo Desarrollo
```bash
npm run start:dev
```

---

## Base de Datos - Opción 1: SQL Manual

### Crear Tablas y Datos Iniciales
```sql
-- Conectar a la base de datos
mysql -u tu_usuario -p tu_database

-- Ejecutar el siguiente script:

-- 1. Crear tabla clasificacion_prestamo
CREATE TABLE clasificacion_prestamo (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(10) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  diasMoraMinimo INT NOT NULL DEFAULT 0,
  diasMoraMaximo INT,
  porcentajeProvision DECIMAL(5,2) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  orden INT NOT NULL DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Crear tabla estado_prestamo
CREATE TABLE estado_prestamo (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  orden INT NOT NULL DEFAULT 0,
  color VARCHAR(7),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Agregar columnas a prestamo
ALTER TABLE prestamo
  ADD COLUMN clasificacionPrestamoId INT NULL,
  ADD COLUMN estadoPrestamoId INT NULL,
  ADD CONSTRAINT FK_prestamo_clasificacion
    FOREIGN KEY (clasificacionPrestamoId)
    REFERENCES clasificacion_prestamo(id)
    ON DELETE SET NULL,
  ADD CONSTRAINT FK_prestamo_estado
    FOREIGN KEY (estadoPrestamoId)
    REFERENCES estado_prestamo(id)
    ON DELETE SET NULL;

-- 4. Insertar clasificaciones NCB-022
INSERT INTO clasificacion_prestamo
  (codigo, nombre, descripcion, diasMoraMinimo, diasMoraMaximo, porcentajeProvision, orden)
VALUES
  ('A', 'Normal', 'Créditos con bajo riesgo de incumplimiento', 0, 30, 1.00, 1),
  ('B', 'Subnormal', 'Créditos con debilidades que ameritan atención', 31, 60, 5.00, 2),
  ('C', 'Deficiente', 'Créditos con alto riesgo de incumplimiento', 61, 90, 20.00, 3),
  ('D', 'Difícil Recuperación', 'Créditos con muy alto riesgo de pérdida', 91, 180, 50.00, 4),
  ('E', 'Irrecuperable', 'Créditos con pérdida prácticamente cierta', 181, NULL, 100.00, 5);

-- 5. Insertar estados de préstamo
INSERT INTO estado_prestamo
  (codigo, nombre, descripcion, color, orden)
VALUES
  ('ACTIVO', 'Activo', 'Préstamo vigente con pagos al día o con atraso tolerable', '#28a745', 1),
  ('CANCELADO', 'Cancelado', 'Préstamo pagado completamente', '#6c757d', 2),
  ('ANULADO', 'Anulado', 'Préstamo anulado o reversado', '#dc3545', 3);
```

---

## Base de Datos - Opción 2: TypeORM Migrations

### Generar Migración
```bash
npm run migration:generate -- src/migrations/AddClasificacionYEstadoPrestamo
```

### Ejecutar Migración
```bash
npm run migration:run
```

### Revertir Migración (si es necesario)
```bash
npm run migration:revert
```

---

## Inicialización de Catálogos (Opción 3: vía API)

### Inicializar Clasificaciones NCB-022
```bash
curl -X POST http://localhost:3000/api/clasificacion-prestamo/inicializar
```

### Inicializar Estados
```bash
curl -X POST http://localhost:3000/api/estado-prestamo/inicializar
```

---

## Verificación de Instalación

### 1. Verificar Clasificaciones
```bash
curl http://localhost:3000/api/clasificacion-prestamo
```

**Respuesta esperada:**
```json
[
  {
    "id": 1,
    "codigo": "A",
    "nombre": "Normal",
    "diasMoraMinimo": 0,
    "diasMoraMaximo": 30,
    "porcentajeProvision": 1.00,
    "activo": true
  },
  // ... más clasificaciones
]
```

### 2. Verificar Estados
```bash
curl http://localhost:3000/api/estado-prestamo
```

### 3. Listar Préstamos
```bash
curl http://localhost:3000/api/prestamos?page=1&limit=10
```

---

## Consultas Comunes

### Listar Préstamos con Filtros

#### Por Estado
```bash
curl "http://localhost:3000/api/prestamos?estado=VIGENTE"
```

#### Por Clasificación
```bash
curl "http://localhost:3000/api/prestamos?clasificacion=A"
```

#### En Mora
```bash
curl "http://localhost:3000/api/prestamos?enMora=true"
```

#### Mora Mayor a 30 Días
```bash
curl "http://localhost:3000/api/prestamos?diasMoraMinimo=30"
```

#### Por Cliente (DUI)
```bash
curl "http://localhost:3000/api/prestamos?numeroDui=12345678-9"
```

#### Por Nombre de Cliente
```bash
curl "http://localhost:3000/api/prestamos?nombreCliente=Juan"
```

#### Rango de Fechas
```bash
curl "http://localhost:3000/api/prestamos?fechaDesde=2026-01-01&fechaHasta=2026-01-31"
```

#### Filtros Combinados
```bash
curl "http://localhost:3000/api/prestamos?estado=VIGENTE&enMora=true&page=1&limit=20"
```

### Obtener Préstamo Detallado
```bash
curl http://localhost:3000/api/prestamos/1
```

### Obtener Plan de Pagos
```bash
curl http://localhost:3000/api/prestamos/1/plan-pago
```

### Préstamos de un Cliente
```bash
curl http://localhost:3000/api/prestamos/cliente/5
```

---

## CRUD de Clasificaciones

### Crear Nueva Clasificación
```bash
curl -X POST http://localhost:3000/api/clasificacion-prestamo \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "F",
    "nombre": "Castigo",
    "descripcion": "Préstamos castigados",
    "diasMoraMinimo": 365,
    "diasMoraMaximo": null,
    "porcentajeProvision": 100,
    "activo": true,
    "orden": 6
  }'
```

### Actualizar Clasificación
```bash
curl -X PUT http://localhost:3000/api/clasificacion-prestamo/1 \
  -H "Content-Type: application/json" \
  -d '{
    "descripcion": "Créditos con riesgo muy bajo"
  }'
```

### Eliminar Clasificación
```bash
curl -X DELETE http://localhost:3000/api/clasificacion-prestamo/6
```

---

## CRUD de Estados

### Crear Nuevo Estado
```bash
curl -X POST http://localhost:3000/api/estado-prestamo \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "REESTRUCTURADO",
    "nombre": "Reestructurado",
    "descripcion": "Préstamo con plan de pagos reestructurado",
    "activo": true,
    "color": "#ffc107",
    "orden": 4
  }'
```

### Actualizar Estado
```bash
curl -X PUT http://localhost:3000/api/estado-prestamo/1 \
  -H "Content-Type: application/json" \
  -d '{
    "descripcion": "Préstamo vigente y al corriente"
  }'
```

### Eliminar Estado
```bash
curl -X DELETE http://localhost:3000/api/estado-prestamo/4
```

---

## Acceso a Documentación

### Swagger UI
```
http://localhost:3000/api
```

### Swagger JSON
```
http://localhost:3000/api-json
```

---

## Testing

### Ejecutar Tests Unitarios
```bash
npm run test
```

### Ejecutar Tests E2E
```bash
npm run test:e2e
```

### Ejecutar Tests con Coverage
```bash
npm run test:cov
```

---

## Desarrollo

### Modo Watch (Auto-reload)
```bash
npm run start:dev
```

### Modo Debug
```bash
npm run start:debug
```

### Compilar
```bash
npm run build
```

### Linter
```bash
npm run lint
```

### Formatear Código
```bash
npm run format
```

---

## Base de Datos - Comandos Útiles

### Verificar Tablas
```sql
SHOW TABLES LIKE '%prestamo%';
SHOW TABLES LIKE '%clasificacion%';
SHOW TABLES LIKE '%estado%';
```

### Verificar Estructura
```sql
DESCRIBE clasificacion_prestamo;
DESCRIBE estado_prestamo;
DESCRIBE prestamo;
```

### Verificar Foreign Keys
```sql
SELECT
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM
  INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE
  TABLE_NAME = 'prestamo'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### Verificar Datos
```sql
SELECT * FROM clasificacion_prestamo;
SELECT * FROM estado_prestamo;
SELECT COUNT(*) FROM prestamo;
```

---

## Windows PowerShell

### Si curl no funciona en PowerShell, usar Invoke-WebRequest

#### GET Request
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/prestamos?page=1&limit=10" -Method GET
```

#### POST Request
```powershell
$body = @{
    codigo = "F"
    nombre = "Castigo"
    porcentajeProvision = 100
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/clasificacion-prestamo" -Method POST -Body $body -ContentType "application/json"
```

---

## Solución de Problemas

### El servidor no inicia
```bash
# Verificar puerto en uso
netstat -ano | findstr :3000

# Matar proceso en puerto 3000 (Windows)
taskkill /PID [PID] /F

# Reiniciar servidor
npm run start:dev
```

### Error de compilación
```bash
# Limpiar y reinstalar
rm -rf node_modules dist
npm install
npm run build
```

### Error de base de datos
```bash
# Verificar conexión
mysql -u usuario -p -e "SELECT 1"

# Verificar variables de entorno
echo %DATABASE_HOST%
echo %DATABASE_PORT%
echo %DATABASE_NAME%
```

---

## Scripts Rápidos para Testing

### Crear archivo test.ps1 (PowerShell)
```powershell
# test.ps1
$baseUrl = "http://localhost:3000/api"

Write-Host "1. Probando clasificaciones..." -ForegroundColor Green
Invoke-WebRequest -Uri "$baseUrl/clasificacion-prestamo" -Method GET

Write-Host "`n2. Probando estados..." -ForegroundColor Green
Invoke-WebRequest -Uri "$baseUrl/estado-prestamo" -Method GET

Write-Host "`n3. Probando préstamos..." -ForegroundColor Green
Invoke-WebRequest -Uri "$baseUrl/prestamos?page=1&limit=5" -Method GET

Write-Host "`nPruebas completadas!" -ForegroundColor Cyan
```

### Ejecutar
```powershell
.\test.ps1
```

---

## Comandos de Producción

### Build para Producción
```bash
npm run build
```

### Ejecutar en Producción
```bash
npm run start:prod
```

### Ejecutar Migraciones en Producción
```bash
NODE_ENV=production npm run migration:run
```

---

## Referencias Rápidas

- **Documentación Completa:** `IMPLEMENTACION_PRESTAMOS.md`
- **Arquitectura:** `ESTRUCTURA_IMPLEMENTADA.md`
- **Checklist:** `CHECKLIST_IMPLEMENTACION.md`
- **Pruebas REST:** `PRUEBAS_ENDPOINTS.http`
- **Resumen:** `RESUMEN_IMPLEMENTACION.md`

---

*Guía de comandos rápidos actualizada: 2026-01-23*
