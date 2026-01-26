# Módulo de Desembolso y Gestión de Préstamos

Este módulo maneja todo el proceso de desembolso de créditos y la gestión completa de préstamos en el sistema.

## Características

### 1. Clasificación de Préstamos (NCB-022 El Salvador)

El sistema implementa la normativa NCB-022 de El Salvador para clasificación de riesgo crediticio:

- **Categoría A - Normal**: 0-30 días de mora, 1% provisión
- **Categoría B - Subnormal**: 31-60 días de mora, 5% provisión
- **Categoría C - Deficiente**: 61-90 días de mora, 20% provisión
- **Categoría D - Difícil Recuperación**: 91-180 días de mora, 50% provisión
- **Categoría E - Irrecuperable**: 181+ días de mora, 100% provisión

### 2. Estados del Préstamo

- **ACTIVO**: Préstamo vigente con pagos al día
- **CANCELADO**: Préstamo pagado completamente
- **ANULADO**: Préstamo anulado o reversado

### 3. Endpoints Disponibles

#### Gestión de Préstamos

```
GET    /api/prestamos                    - Listar préstamos con filtros
GET    /api/prestamos/:id                - Obtener préstamo detallado
GET    /api/prestamos/:id/plan-pago      - Obtener plan de pagos
GET    /api/prestamos/cliente/:personaId - Préstamos de un cliente
```

#### Clasificación de Préstamos

```
GET    /api/clasificacion-prestamo           - Listar clasificaciones
GET    /api/clasificacion-prestamo/activas   - Listar activas
GET    /api/clasificacion-prestamo/:id       - Obtener por ID
POST   /api/clasificacion-prestamo           - Crear clasificación
PUT    /api/clasificacion-prestamo/:id       - Actualizar
DELETE /api/clasificacion-prestamo/:id       - Eliminar
POST   /api/clasificacion-prestamo/inicializar - Inicializar NCB-022
```

#### Estados de Préstamo

```
GET    /api/estado-prestamo             - Listar estados
GET    /api/estado-prestamo/activos     - Listar activos
GET    /api/estado-prestamo/:id         - Obtener por ID
POST   /api/estado-prestamo             - Crear estado
PUT    /api/estado-prestamo/:id         - Actualizar
DELETE /api/estado-prestamo/:id         - Eliminar
POST   /api/estado-prestamo/inicializar - Inicializar estados
```

#### Desembolso

```
GET    /api/desembolso/pendientes       - Solicitudes pendientes
POST   /api/desembolso/preview          - Preview de desembolso
POST   /api/desembolso                  - Crear desembolso
GET    /api/desembolso/:id              - Obtener préstamo
GET    /api/desembolso/:id/plan-pago    - Plan de pagos
GET    /api/desembolso                  - Listar préstamos
```

## Filtros de Búsqueda

### Ejemplo: Listar préstamos con filtros

```typescript
GET /api/prestamos?estado=VIGENTE&enMora=true&page=1&limit=10

Query Params:
- estado: VIGENTE | MORA | CANCELADO | CASTIGADO
- clasificacion: A | B | C | D | E
- clasificacionPrestamoId: number
- estadoPrestamoId: number
- personaId: number
- tipoCreditoId: number
- numeroCredito: string
- numeroDui: string
- nombreCliente: string
- fechaDesde: YYYY-MM-DD
- fechaHasta: YYYY-MM-DD
- enMora: boolean
- diasMoraMinimo: number
- page: number (default: 1)
- limit: number (default: 10)
- orderBy: string (default: fechaOtorgamiento)
- orderDirection: ASC | DESC (default: DESC)
```

### Respuesta Paginada

```json
{
  "data": [
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
      "tipoCredito": {
        "id": 1,
        "nombre": "Crédito Personal"
      },
      "montoAutorizado": 5000.00,
      "saldoCapital": 4500.00,
      "diasMora": 0,
      "fechaOtorgamiento": "2026-01-15",
      "fechaVencimiento": "2027-01-15",
      "proximaCuota": {
        "numeroCuota": 2,
        "fechaVencimiento": "2026-03-15",
        "cuotaTotal": 458.33
      }
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

## Estructura de Datos

### PrestamoDetalleDto

Información completa del préstamo incluyendo:
- Información básica del préstamo
- Datos del cliente
- Tipo de crédito
- Montos y saldos
- Términos del préstamo
- Deducciones y recargos aplicados
- Resumen del plan de pagos
- Información de auditoría

### PlanPagoDetalleDto

Detalles de cada cuota:
- Número de cuota y fecha de vencimiento
- Componentes: capital, interés, recargos
- Montos pagados
- Mora y saldo pendiente
- Estado de la cuota

## Inicialización

### Inicializar Clasificaciones NCB-022

```bash
POST /api/clasificacion-prestamo/inicializar
```

Esto creará las 5 categorías de clasificación según normativa salvadoreña.

### Inicializar Estados

```bash
POST /api/estado-prestamo/inicializar
```

Esto creará los estados: ACTIVO, CANCELADO, ANULADO.

## Servicios

### PrestamoConsultaService

Servicio especializado para consultas de préstamos con métodos optimizados para:
- Listar con filtros avanzados
- Obtener información detallada
- Consultar plan de pagos
- Obtener préstamos por cliente

### ClasificacionPrestamoService

Gestiona las clasificaciones NCB-022:
- CRUD completo
- Determinación automática por días de mora
- Inicialización de categorías por defecto

### EstadoPrestamoService

Gestiona los estados de préstamos:
- CRUD completo
- Inicialización de estados por defecto

## Relaciones de Base de Datos

```
Prestamo
├── persona (ManyToOne)
├── solicitud (OneToOne)
├── tipoCredito (ManyToOne)
├── clasificacionPrestamo (ManyToOne) [NUEVA]
├── estadoPrestamoRelacion (ManyToOne) [NUEVA]
├── planPago (OneToMany)
├── deducciones (OneToMany)
└── recargos (OneToMany)
```

## Migraciones Necesarias

Para aplicar los cambios, necesitarás crear y ejecutar migraciones de TypeORM:

```bash
# Generar migración
npm run migration:generate -- src/migrations/AddClasificacionYEstado

# Ejecutar migración
npm run migration:run
```

## Notas de Implementación

1. La entidad Prestamo mantiene compatibilidad con enums legacy (`estado` y `categoriaNCB022`)
2. Las nuevas relaciones (`clasificacionPrestamoId`, `estadoPrestamoId`) son opcionales
3. Los servicios incluyen métodos de inicialización para datos por defecto
4. Todos los endpoints incluyen documentación Swagger
5. Los filtros soportan paginación y ordenamiento personalizado
