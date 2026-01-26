# Implementación del Sistema de Gestión de Préstamos

## Resumen de Cambios Implementados

Se ha implementado un sistema completo de gestión de préstamos con clasificación NCB-022 y catálogos de estados.

### Archivos Creados

#### 1. Entidades (entities/)
- `clasificacion-prestamo.entity.ts` - Clasificación NCB-022 (A, B, C, D, E)
- `estado-prestamo.entity.ts` - Estados del préstamo (ACTIVO, CANCELADO, ANULADO)
- `prestamo.entity.ts` - ACTUALIZADO con relaciones a nuevos catálogos

#### 2. DTOs (dto/)
- `filtros-prestamo.dto.ts` - Filtros avanzados para búsqueda de préstamos
- `prestamo-detalle.dto.ts` - DTOs para respuestas (detalle, resumen, paginado)
- `index.ts` - Exportaciones centralizadas

#### 3. Servicios (services/)
- `prestamo-consulta.service.ts` - Consultas y filtrado de préstamos
- `clasificacion-prestamo.service.ts` - CRUD de clasificaciones NCB-022
- `estado-prestamo.service.ts` - CRUD de estados de préstamo

#### 4. Controladores (controllers/)
- `prestamo.controller.ts` - Endpoints de consulta de préstamos
- `clasificacion-prestamo.controller.ts` - Endpoints de clasificaciones
- `estado-prestamo.controller.ts` - Endpoints de estados

#### 5. Módulo
- `desembolso.module.ts` - ACTUALIZADO con nuevas dependencias

#### 6. Documentación
- `README.md` - Documentación completa del módulo

## Endpoints Disponibles

### Gestión de Préstamos

```
GET /api/prestamos
  - Lista préstamos con filtros avanzados
  - Soporta paginación y ordenamiento
  - Filtros: estado, clasificación, cliente, fecha, mora, etc.

GET /api/prestamos/:id
  - Obtiene préstamo con información completa
  - Incluye: cliente, plan de pagos, saldos, deducciones, recargos

GET /api/prestamos/:id/plan-pago
  - Obtiene plan de pagos detallado del préstamo
  - Incluye estado de cada cuota y saldos

GET /api/prestamos/cliente/:personaId
  - Obtiene todos los préstamos de un cliente
```

### Clasificación NCB-022

```
GET  /api/clasificacion-prestamo          - Listar todas
GET  /api/clasificacion-prestamo/activas  - Listar activas
GET  /api/clasificacion-prestamo/:id      - Obtener por ID
POST /api/clasificacion-prestamo          - Crear
PUT  /api/clasificacion-prestamo/:id      - Actualizar
DELETE /api/clasificacion-prestamo/:id    - Eliminar
POST /api/clasificacion-prestamo/inicializar - Inicializar NCB-022
```

### Estados de Préstamo

```
GET  /api/estado-prestamo              - Listar todos
GET  /api/estado-prestamo/activos      - Listar activos
GET  /api/estado-prestamo/:id          - Obtener por ID
POST /api/estado-prestamo              - Crear
PUT  /api/estado-prestamo/:id          - Actualizar
DELETE /api/estado-prestamo/:id        - Eliminar
POST /api/estado-prestamo/inicializar  - Inicializar estados
```

## Pasos de Instalación

### 1. Instalar Dependencias (si no están instaladas)

```bash
cd C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\micro-app\backend
npm install class-validator class-transformer
npm install @nestjs/swagger
```

### 2. Crear y Ejecutar Migraciones

La entidad Prestamo fue actualizada con nuevas relaciones. Necesitas crear las tablas nuevas:

```bash
# Generar migración automática
npm run migration:generate -- src/migrations/AddClasificacionYEstadoPrestamo

# O crear migración manual
npm run migration:create -- src/migrations/AddClasificacionYEstadoPrestamo

# Ejecutar migración
npm run migration:run
```

### 3. SQL Manual de Migración (si no usas TypeORM migrations)

```sql
-- Crear tabla clasificacion_prestamo
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

-- Crear tabla estado_prestamo
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

-- Agregar columnas a la tabla prestamo
ALTER TABLE prestamo
  ADD COLUMN clasificacionPrestamoId INT NULL,
  ADD COLUMN estadoPrestamoId INT NULL,
  ADD CONSTRAINT FK_prestamo_clasificacion
    FOREIGN KEY (clasificacionPrestamoId)
    REFERENCES clasificacion_prestamo(id),
  ADD CONSTRAINT FK_prestamo_estado
    FOREIGN KEY (estadoPrestamoId)
    REFERENCES estado_prestamo(id);

-- Insertar clasificaciones NCB-022
INSERT INTO clasificacion_prestamo
  (codigo, nombre, descripcion, diasMoraMinimo, diasMoraMaximo, porcentajeProvision, orden)
VALUES
  ('A', 'Normal', 'Créditos con bajo riesgo de incumplimiento', 0, 30, 1.00, 1),
  ('B', 'Subnormal', 'Créditos con debilidades que ameritan atención', 31, 60, 5.00, 2),
  ('C', 'Deficiente', 'Créditos con alto riesgo de incumplimiento', 61, 90, 20.00, 3),
  ('D', 'Difícil Recuperación', 'Créditos con muy alto riesgo de pérdida', 91, 180, 50.00, 4),
  ('E', 'Irrecuperable', 'Créditos con pérdida prácticamente cierta', 181, NULL, 100.00, 5);

-- Insertar estados de préstamo
INSERT INTO estado_prestamo
  (codigo, nombre, descripcion, color, orden)
VALUES
  ('ACTIVO', 'Activo', 'Préstamo vigente con pagos al día o con atraso tolerable', '#28a745', 1),
  ('CANCELADO', 'Cancelado', 'Préstamo pagado completamente', '#6c757d', 2),
  ('ANULADO', 'Anulado', 'Préstamo anulado o reversado', '#dc3545', 3);
```

### 4. Inicializar Datos (Método Alternativo)

Si prefieres usar los endpoints de inicialización:

```bash
# Inicializar clasificaciones NCB-022
curl -X POST http://localhost:3000/api/clasificacion-prestamo/inicializar

# Inicializar estados
curl -X POST http://localhost:3000/api/estado-prestamo/inicializar
```

### 5. Verificar Instalación

```bash
# Listar clasificaciones
curl http://localhost:3000/api/clasificacion-prestamo

# Listar estados
curl http://localhost:3000/api/estado-prestamo

# Listar préstamos
curl http://localhost:3000/api/prestamos?page=1&limit=10
```

## Ejemplos de Uso

### 1. Listar préstamos con filtros

```bash
GET /api/prestamos?estado=VIGENTE&enMora=true&page=1&limit=10
```

### 2. Buscar préstamos por cliente

```bash
GET /api/prestamos?nombreCliente=Juan&numeroDui=12345678-9
```

### 3. Préstamos por rango de fechas

```bash
GET /api/prestamos?fechaDesde=2026-01-01&fechaHasta=2026-01-31
```

### 4. Préstamos en mora

```bash
GET /api/prestamos?enMora=true&diasMoraMinimo=30
```

### 5. Obtener préstamo completo

```bash
GET /api/prestamos/1
```

Respuesta:
```json
{
  "id": 1,
  "numeroCredito": "CR2026000001",
  "estado": "VIGENTE",
  "categoriaNCB022": "A",
  "cliente": {
    "id": 1,
    "nombreCompleto": "Juan Pérez",
    "numeroDui": "12345678-9"
  },
  "montoAutorizado": 5000.00,
  "saldoCapital": 4500.00,
  "diasMora": 0,
  "resumenPlanPago": {
    "totalCuotas": 12,
    "cuotasPendientes": 10,
    "cuotasPagadas": 2,
    "cuotasEnMora": 0,
    "proximaCuota": {
      "numeroCuota": 3,
      "fechaVencimiento": "2026-04-15",
      "cuotaTotal": 458.33
    }
  }
}
```

### 6. Plan de pagos detallado

```bash
GET /api/prestamos/1/plan-pago
```

### 7. Préstamos de un cliente

```bash
GET /api/prestamos/cliente/5
```

## Características Implementadas

### Filtros Avanzados
- Estado del préstamo
- Clasificación NCB-022
- Cliente (por ID, DUI o nombre)
- Tipo de crédito
- Número de crédito
- Rango de fechas
- Préstamos en mora
- Días de mora mínimos

### Paginación
- page: número de página
- limit: registros por página
- totalPages: total de páginas
- total: total de registros

### Ordenamiento
- orderBy: campo de ordenamiento
- orderDirection: ASC o DESC

### Información Completa
- Datos del cliente
- Información del crédito
- Saldos y mora
- Plan de pagos completo
- Deducciones y recargos
- Historial de pagos

## Compatibilidad

La implementación mantiene compatibilidad hacia atrás:
- Los enums existentes (`estado`, `categoriaNCB022`) se mantienen
- Las nuevas relaciones son opcionales (`clasificacionPrestamoId`, `estadoPrestamoId`)
- Los endpoints existentes de desembolso siguen funcionando
- No se rompe código existente

## Próximos Pasos

1. Ejecutar migraciones de base de datos
2. Inicializar catálogos (clasificaciones y estados)
3. Probar endpoints con Swagger/Postman
4. Actualizar frontend para usar nuevos endpoints
5. Implementar lógica de actualización automática de clasificación según mora
6. Implementar módulo de pagos que actualice saldos y estados

## Swagger/OpenAPI

Todos los endpoints están documentados con decoradores de Swagger. Accede a:

```
http://localhost:3000/api
```

Para ver la documentación interactiva completa.

## Notas Importantes

1. **Clasificación Automática**: El servicio `ClasificacionPrestamoService` incluye el método `determinarClasificacionPorMora()` que puede usarse para actualizar automáticamente la clasificación según los días de mora.

2. **Migraciones**: Recuerda ejecutar las migraciones antes de usar el sistema.

3. **Índices**: Considera agregar índices en la base de datos para mejorar el rendimiento:
   - `prestamo.numeroCredito`
   - `prestamo.personaId`
   - `prestamo.estado`
   - `prestamo.fechaOtorgamiento`

4. **Validaciones**: Todos los DTOs incluyen decoradores de validación con `class-validator`.

5. **Tipos seguros**: Todo el código usa TypeScript estricto sin uso de `any`.

## Soporte

Para más información, consulta:
- `README.md` en el directorio del módulo
- Documentación Swagger en `/api`
- Código fuente con comentarios JSDoc
