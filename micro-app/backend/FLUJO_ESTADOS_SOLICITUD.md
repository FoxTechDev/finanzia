# Flujo de Estados de Solicitud de Crédito

## Descripción General

Este documento describe el nuevo flujo de estados para las solicitudes de crédito en el sistema. Los estados se gestionan mediante una **tabla de base de datos** (`estado_solicitud`) en lugar de enums, lo que proporciona mayor flexibilidad y mantenibilidad.

## Estados del Flujo

### 1. REGISTRADA
- **Descripción**: Estado inicial al crear la solicitud
- **Color**: `#6C757D` (gris)
- **Orden**: 1
- **Acción**: Se asigna automáticamente al crear una nueva solicitud

### 2. ANALIZADA
- **Descripción**: Se asigna automáticamente cuando el asesor ingresa su análisis
- **Color**: `#17A2B8` (cyan)
- **Orden**: 2
- **Transición**: `REGISTRADA → ANALIZADA` (automática al guardar análisis del asesor)

### 3. EN_COMITE
- **Descripción**: Cuando el asesor traslada a comité
- **Color**: `#FD7E14` (naranja)
- **Orden**: 3
- **Transición**: `ANALIZADA → EN_COMITE` (única acción del asesor después del análisis)

### 4. OBSERVADA
- **Descripción**: Cuando el comité observa la solicitud
- **Color**: `#FFC107` (amarillo)
- **Orden**: 4
- **Permite**: Al asesor modificar y reenviar a comité
- **Transiciones**:
  - `EN_COMITE → OBSERVADA` (decisión del comité)
  - `OBSERVADA → EN_COMITE` (asesor modifica y reenvía)

### 5. DENEGADA
- **Descripción**: Cuando el comité deniega la solicitud
- **Color**: `#DC3545` (rojo)
- **Orden**: 5
- **Estado Final**: No se pueden hacer más modificaciones
- **Transición**: `EN_COMITE → DENEGADA` (decisión del comité)

### 6. APROBADA
- **Descripción**: Cuando el comité aprueba la solicitud
- **Color**: `#28A745` (verde)
- **Orden**: 6
- **Transición**: `EN_COMITE → APROBADA` (decisión del comité)

### 7. DESEMBOLSADA
- **Descripción**: Estado final después del desembolso
- **Color**: `#007BFF` (azul)
- **Orden**: 7
- **Estado Final**: No se pueden hacer más modificaciones
- **Transición**: `APROBADA → DESEMBOLSADA` (al realizar el desembolso)

## Diagrama de Flujo

```
REGISTRADA
    ↓ (automático al ingresar análisis)
ANALIZADA
    ↓ (asesor traslada a comité)
EN_COMITE
    ├→ OBSERVADA ──┐
    │              ↓ (asesor modifica y reenvía)
    │         EN_COMITE
    ├→ DENEGADA (estado final)
    └→ APROBADA
           ↓ (al realizar desembolso)
       DESEMBOLSADA (estado final)
```

## Reglas del Flujo

### Creación de Solicitud
- Al crear una solicitud → estado `REGISTRADA`

### Análisis del Asesor
- Al ingresar análisis → cambio automático a `ANALIZADA`
- El asesor puede modificar el análisis mientras está en `REGISTRADA`, `ANALIZADA` u `OBSERVADA`

### Traslado a Comité
- Única acción del asesor después del análisis: `ANALIZADA → EN_COMITE`
- No puede trasladar desde otros estados

### Decisiones del Comité
El comité puede tomar tres decisiones:

1. **OBSERVAR**: `EN_COMITE → OBSERVADA`
   - Permite al asesor modificar y reenviar

2. **DENEGAR**: `EN_COMITE → DENEGADA`
   - Estado final, no se puede modificar

3. **APROBAR**: `EN_COMITE → APROBADA`
   - Lista para desembolso

### Desembolso
- Al realizar desembolso → `APROBADA → DESEMBOLSADA`
- Estado final del flujo exitoso

## Validación de Transiciones

El sistema valida automáticamente las transiciones de estado permitidas:

```typescript
const transicionesPermitidas: Record<string, string[]> = {
  'REGISTRADA': ['ANALIZADA'],
  'ANALIZADA': ['EN_COMITE'],
  'EN_COMITE': ['OBSERVADA', 'DENEGADA', 'APROBADA'],
  'OBSERVADA': ['EN_COMITE'],
  'APROBADA': ['DESEMBOLSADA'],
  'DENEGADA': [], // Estado final
  'DESEMBOLSADA': [], // Estado final
};
```

## Modificaciones Permitidas

### Por Estado

| Estado | Modificar Solicitud | Modificar Análisis | Trasladar a Comité | Decisión Comité | Desembolsar |
|--------|--------------------|--------------------|--------------------|--------------------|-------------|
| REGISTRADA | ✅ | ✅ | ❌ | ❌ | ❌ |
| ANALIZADA | ❌ | ✅ | ✅ | ❌ | ❌ |
| EN_COMITE | ❌ | ❌ | ❌ | ✅ | ❌ |
| OBSERVADA | ✅ | ✅ | ❌ | ❌ | ❌ |
| DENEGADA | ❌ | ❌ | ❌ | ❌ | ❌ |
| APROBADA | ❌ | ❌ | ❌ | ❌ | ✅ |
| DESEMBOLSADA | ❌ | ❌ | ❌ | ❌ | ❌ |

## Implementación Técnica

### Estructura de Base de Datos

```sql
-- Tabla de catálogo de estados
CREATE TABLE estado_solicitud (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  orden INT,
  color VARCHAR(7),
  activo BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Relación en la tabla solicitud
ALTER TABLE solicitud
ADD COLUMN estadoId INT NOT NULL,
ADD CONSTRAINT FK_solicitud_estado
FOREIGN KEY (estadoId) REFERENCES estado_solicitud(id);
```

### Servicios Principales

#### SolicitudService

**Crear Solicitud**
```typescript
async create(createDto: CreateSolicitudDto): Promise<Solicitud>
```
- Asigna automáticamente el estado `REGISTRADA`

**Actualizar Análisis del Asesor**
```typescript
async actualizarAnalisisAsesor(id: number, updateDto: UpdateAnalisisAsesorDto): Promise<Solicitud>
```
- Si está en `REGISTRADA`, cambia automáticamente a `ANALIZADA`
- Puede modificarse en estados: `REGISTRADA`, `ANALIZADA`, `OBSERVADA`

**Trasladar a Comité**
```typescript
async trasladarAComite(id: number, trasladarDto: TrasladarComiteDto): Promise<Solicitud>
```
- Solo desde estado `ANALIZADA`
- Cambia a `EN_COMITE`

#### ComiteService

**Registrar Decisión del Comité**
```typescript
async registrarDecision(solicitudId: number, decisionDto: DecisionComiteDto): Promise<DecisionComite>
```
- Solo en estado `EN_COMITE`
- Puede cambiar a: `OBSERVADA`, `DENEGADA`, `APROBADA`

#### DesembolsoService

**Crear Desembolso**
```typescript
async crear(dto: CrearDesembolsoDto): Promise<Prestamo>
```
- Solo desde estado `APROBADA`
- Cambia a `DESEMBOLSADA`

## Migración

### Ejecutar Migración

```bash
# Ejecutar todas las migraciones pendientes
npm run migration:run

# O ejecutar específicamente esta migración
npm run typeorm migration:run -- -t 1769600000000
```

### Revertir Migración

```bash
npm run migration:revert
```

### Seed Manual

Si necesitas insertar/actualizar los estados manualmente:

```bash
# Ejecutar el seed de estados
npm run seed:estado-solicitud
```

## Estados Obsoletos

Los siguientes estados del sistema antiguo han sido marcados como obsoletos (activo = false):

- `CREADA` → migrado a `REGISTRADA`
- `EN_ANALISIS` → migrado a `ANALIZADA`
- `PENDIENTE_COMITE` → migrado a `EN_COMITE`
- `OBSERVADA_COMITE` → migrado a `OBSERVADA`
- `DENEGADA_COMITE` → migrado a `DENEGADA`
- `AUTORIZADA` → migrado a `APROBADA`
- `CANCELADA` → migrado a `DENEGADA`

## API Endpoints

### Cambiar Estado (Manual)
```http
POST /api/solicitudes/:id/estado
Content-Type: application/json

{
  "nuevoEstadoCodigo": "APROBADA",
  "observacion": "Aprobado por el comité",
  "montoAprobado": 10000,
  "plazoAprobado": 12,
  "tasaInteresAprobada": 15.5,
  "usuarioId": 1,
  "nombreUsuario": "Juan Pérez"
}
```

### Actualizar Análisis del Asesor
```http
PATCH /api/solicitudes/:id/analisis-asesor
Content-Type: application/json

{
  "analisisAsesor": "Cliente con buen historial crediticio...",
  "recomendacionAsesor": "APROBAR",
  "capacidadPago": 5000,
  "comentariosRiesgo": "Riesgo bajo"
}
```

### Trasladar a Comité
```http
POST /api/solicitudes/:id/trasladar-comite
Content-Type: application/json

{
  "observacionAsesor": "Solicitud lista para revisión del comité",
  "usuarioId": 1,
  "nombreUsuario": "Juan Pérez"
}
```

### Registrar Decisión del Comité
```http
POST /api/comite/:solicitudId/decision
Content-Type: application/json

{
  "tipoDecision": "AUTORIZADA",
  "observaciones": "Aprobado según análisis presentado",
  "montoAutorizado": 9500,
  "plazoAutorizado": 12,
  "tasaAutorizada": 15.0,
  "usuarioId": 2,
  "nombreUsuario": "María González"
}
```

### Obtener Solicitudes por Estado
```http
GET /api/solicitudes?estado=EN_COMITE
```

## Historial de Cambios

Todos los cambios de estado se registran automáticamente en la tabla `solicitud_historial`:

```typescript
{
  solicitudId: number,
  estadoAnterior: string,  // Código del estado anterior
  estadoNuevo: string,     // Código del nuevo estado
  observacion: string,
  usuarioId: number,
  nombreUsuario: string,
  fechaCambio: Date
}
```

## Beneficios de Usar Tabla de Estados

1. **Flexibilidad**: Agregar, modificar o eliminar estados sin cambios en el código
2. **Mantenibilidad**: Estados gestionables desde la base de datos
3. **Internacionalización**: Posibilidad de tener nombres de estados en múltiples idiomas
4. **Auditoría**: Registro completo de cambios en los estados
5. **Configuración**: Colores, orden y descripción personalizables
6. **Escalabilidad**: Fácil agregado de nuevos flujos o estados especiales

## Notas Importantes

- **Estados Finales**: `DENEGADA` y `DESEMBOLSADA` no permiten más modificaciones
- **Cambio Automático**: El cambio de `REGISTRADA` a `ANALIZADA` es automático al guardar análisis
- **Validación Estricta**: El sistema valida todas las transiciones de estado
- **Historial Completo**: Todos los cambios quedan registrados para auditoría
- **Relación Eager**: El estado se carga automáticamente con la solicitud
