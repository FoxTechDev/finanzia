# Estructura de la Implementación del Sistema de Préstamos

## Diagrama de Entidades

```
┌─────────────────────────────────────────────────────────────────┐
│                       CLASIFICACION_PRESTAMO                     │
│  (Normativa NCB-022 - El Salvador)                              │
├─────────────────────────────────────────────────────────────────┤
│  id                    INT PRIMARY KEY                           │
│  codigo                VARCHAR(10) UNIQUE (A, B, C, D, E)       │
│  nombre                VARCHAR(100)                              │
│  descripcion           TEXT                                      │
│  diasMoraMinimo        INT                                       │
│  diasMoraMaximo        INT (nullable)                            │
│  porcentajeProvision   DECIMAL(5,2)                             │
│  activo                BOOLEAN                                   │
│  orden                 INT                                       │
│  createdAt             TIMESTAMP                                 │
│  updatedAt             TIMESTAMP                                 │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1
                                    │
                                    │ N
┌─────────────────────────────────────────────────────────────────┐
│                         ESTADO_PRESTAMO                          │
├─────────────────────────────────────────────────────────────────┤
│  id                    INT PRIMARY KEY                           │
│  codigo                VARCHAR(20) UNIQUE                        │
│  nombre                VARCHAR(100)                              │
│  descripcion           TEXT                                      │
│  activo                BOOLEAN                                   │
│  orden                 INT                                       │
│  color                 VARCHAR(7)                                │
│  createdAt             TIMESTAMP                                 │
│  updatedAt             TIMESTAMP                                 │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1
                                    │
                                    │ N
┌─────────────────────────────────────────────────────────────────┐
│                            PRESTAMO                              │
├─────────────────────────────────────────────────────────────────┤
│  id                          INT PRIMARY KEY                     │
│  numeroCredito               VARCHAR(20) UNIQUE                  │
│  solicitudId                 INT FK → solicitud                  │
│  personaId                   INT FK → persona                    │
│  tipoCreditoId               INT FK → tipo_credito               │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  NUEVAS RELACIONES                                       │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  clasificacionPrestamoId  INT FK → clasificacion_prestamo│   │
│  │  estadoPrestamoId         INT FK → estado_prestamo       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Montos y Términos:                                              │
│  ├─ montoAutorizado          DECIMAL(14,2)                      │
│  ├─ montoDesembolsado        DECIMAL(14,2)                      │
│  ├─ plazoAutorizado          INT                                 │
│  ├─ tasaInteres              DECIMAL(6,4)                       │
│  ├─ tasaInteresMoratorio     DECIMAL(6,4)                       │
│  ├─ tipoInteres              ENUM (FLAT, AMORTIZADO)            │
│  ├─ periodicidadPago         ENUM                                │
│  ├─ cuotaNormal              DECIMAL(14,2)                      │
│  ├─ cuotaTotal               DECIMAL(14,2)                      │
│  ├─ numeroCuotas             INT                                 │
│  ├─ totalInteres             DECIMAL(14,2)                      │
│  ├─ totalRecargos            DECIMAL(14,2)                      │
│  └─ totalPagar               DECIMAL(14,2)                      │
│                                                                   │
│  Saldos:                                                          │
│  ├─ saldoCapital             DECIMAL(14,2)                      │
│  ├─ saldoInteres             DECIMAL(14,2)                      │
│  ├─ capitalMora              DECIMAL(14,2)                      │
│  ├─ interesMora              DECIMAL(14,2)                      │
│  └─ diasMora                 INT                                 │
│                                                                   │
│  Fechas:                                                          │
│  ├─ fechaOtorgamiento        DATE                                │
│  ├─ fechaPrimeraCuota        DATE                                │
│  ├─ fechaVencimiento         DATE                                │
│  ├─ fechaUltimoPago          DATE (nullable)                     │
│  └─ fechaCancelacion         DATE (nullable)                     │
│                                                                   │
│  Legacy (mantener compatibilidad):                               │
│  ├─ categoriaNCB022          ENUM (A, B, C, D, E)               │
│  └─ estado                   ENUM (VIGENTE, MORA, ...)          │
│                                                                   │
│  Auditoría:                                                       │
│  ├─ usuarioDesembolsoId      INT                                 │
│  ├─ nombreUsuarioDesembolso  VARCHAR(150)                        │
│  ├─ createdAt                TIMESTAMP                            │
│  └─ updatedAt                TIMESTAMP                            │
└─────────────────────────────────────────────────────────────────┘
            │                     │                     │
            │ 1                   │ 1                   │ 1
            │                     │                     │
            │ N                   │ N                   │ N
    ┌───────┴────────┐    ┌──────┴──────┐    ┌────────┴─────────┐
    │   PLAN_PAGO    │    │  DEDUCCION  │    │    RECARGO       │
    │                │    │  _PRESTAMO  │    │    _PRESTAMO     │
    └────────────────┘    └─────────────┘    └──────────────────┘
```

## Arquitectura de Capas

```
┌──────────────────────────────────────────────────────────────┐
│                         CONTROLLERS                           │
│  (Capa de Presentación - HTTP Endpoints)                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PrestamoController                                   │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  GET    /prestamos                                    │   │
│  │  GET    /prestamos/:id                                │   │
│  │  GET    /prestamos/:id/plan-pago                      │   │
│  │  GET    /prestamos/cliente/:personaId                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ClasificacionPrestamoController                      │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  GET    /clasificacion-prestamo                       │   │
│  │  GET    /clasificacion-prestamo/activas               │   │
│  │  GET    /clasificacion-prestamo/:id                   │   │
│  │  POST   /clasificacion-prestamo                       │   │
│  │  PUT    /clasificacion-prestamo/:id                   │   │
│  │  DELETE /clasificacion-prestamo/:id                   │   │
│  │  POST   /clasificacion-prestamo/inicializar           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  EstadoPrestamoController                             │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  GET    /estado-prestamo                              │   │
│  │  GET    /estado-prestamo/activos                      │   │
│  │  GET    /estado-prestamo/:id                          │   │
│  │  POST   /estado-prestamo                              │   │
│  │  PUT    /estado-prestamo/:id                          │   │
│  │  DELETE /estado-prestamo/:id                          │   │
│  │  POST   /estado-prestamo/inicializar                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  DesembolsoController (existente)                     │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  GET    /desembolso/pendientes                        │   │
│  │  POST   /desembolso/preview                           │   │
│  │  POST   /desembolso                                   │   │
│  │  GET    /desembolso/:id                               │   │
│  │  GET    /desembolso/:id/plan-pago                     │   │
│  │  GET    /desembolso                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                            │
                            │ Dependency Injection
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                          SERVICES                             │
│  (Capa de Lógica de Negocio)                                 │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PrestamoConsultaService                              │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  + listarPrestamos(filtros)                           │   │
│  │  + obtenerPrestamoDetallado(id)                       │   │
│  │  + obtenerPlanPago(prestamoId)                        │   │
│  │  + obtenerPrestamosPorCliente(personaId)              │   │
│  │  - construirFiltros(filtros)                          │   │
│  │  - transformarAResumen(prestamo)                      │   │
│  │  - transformarADetalle(prestamo)                      │   │
│  │  - transformarCuotaADetalle(cuota)                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ClasificacionPrestamoService                         │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  + findAll()                                          │   │
│  │  + findActivas()                                      │   │
│  │  + findOne(id)                                        │   │
│  │  + findByCodigo(codigo)                               │   │
│  │  + determinarClasificacionPorMora(diasMora)           │   │
│  │  + create(dto)                                        │   │
│  │  + update(id, dto)                                    │   │
│  │  + remove(id)                                         │   │
│  │  + inicializarClasificacionesNCB022()                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  EstadoPrestamoService                                │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  + findAll()                                          │   │
│  │  + findActivos()                                      │   │
│  │  + findOne(id)                                        │   │
│  │  + findByCodigo(codigo)                               │   │
│  │  + create(dto)                                        │   │
│  │  + update(id, dto)                                    │   │
│  │  + remove(id)                                         │   │
│  │  + inicializarEstadosPorDefecto()                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  DesembolsoService (existente)                        │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  + getPendientes()                                    │   │
│  │  + preview(dto)                                       │   │
│  │  + crear(dto)                                         │   │
│  │  + findOne(id)                                        │   │
│  │  + getPlanPago(prestamoId)                            │   │
│  │  + findAll(estado)                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                            │
                            │ TypeORM Repositories
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                        │
│  (Repositories - TypeORM)                                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Repository<Prestamo>                                 │   │
│  │  Repository<PlanPago>                                 │   │
│  │  Repository<ClasificacionPrestamo>                    │   │
│  │  Repository<EstadoPrestamo>                           │   │
│  │  Repository<DeduccionPrestamo>                        │   │
│  │  Repository<RecargoPrestamo>                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   DATABASE    │
                    │   (MySQL)     │
                    └───────────────┘
```

## Flujo de Datos - Consulta de Préstamos

```
┌──────────┐
│  Client  │
│ (Angular)│
└────┬─────┘
     │
     │ HTTP GET /api/prestamos?estado=VIGENTE&page=1&limit=10
     │
     ▼
┌──────────────────────────────────────┐
│  PrestamoController                  │
│  @Get()                              │
│  listarPrestamos(@Query() filtros)   │
└────┬─────────────────────────────────┘
     │
     │ filtros: FiltrosPrestamoDto
     │
     ▼
┌──────────────────────────────────────┐
│  PrestamoConsultaService             │
│  listarPrestamos(filtros)            │
└────┬─────────────────────────────────┘
     │
     │ 1. Construir QueryBuilder
     │ 2. Aplicar filtros
     │ 3. Aplicar joins (persona, tipoCredito)
     │ 4. Contar total
     │ 5. Aplicar paginación
     │
     ▼
┌──────────────────────────────────────┐
│  Repository<Prestamo>                │
│  createQueryBuilder()                │
│  .leftJoinAndSelect()                │
│  .where()                            │
│  .orderBy()                          │
│  .skip().take()                      │
│  .getMany()                          │
└────┬─────────────────────────────────┘
     │
     │ Prestamo[] entities
     │
     ▼
┌──────────────────────────────────────┐
│  PrestamoConsultaService             │
│  transformarAResumen()               │
│  - Buscar próxima cuota              │
│  - Formatear datos                   │
└────┬─────────────────────────────────┘
     │
     │ PrestamoResumenDto[]
     │
     ▼
┌──────────────────────────────────────┐
│  PrestamoController                  │
│  return PrestamoPaginadoDto          │
└────┬─────────────────────────────────┘
     │
     │ JSON Response
     │
     ▼
┌──────────┐
│  Client  │
│ {        │
│   data,  │
│   total, │
│   page   │
│ }        │
└──────────┘
```

## Archivos de la Implementación

```
backend/src/creditos/desembolso/
│
├── entities/
│   ├── prestamo.entity.ts                    (ACTUALIZADO)
│   ├── plan-pago.entity.ts                   (existente)
│   ├── clasificacion-prestamo.entity.ts      (NUEVO)
│   ├── estado-prestamo.entity.ts             (NUEVO)
│   ├── deduccion-prestamo.entity.ts          (existente)
│   ├── recargo-prestamo.entity.ts            (existente)
│   ├── tipo-deduccion.entity.ts              (existente)
│   └── tipo-recargo.entity.ts                (existente)
│
├── dto/
│   ├── filtros-prestamo.dto.ts               (NUEVO)
│   ├── prestamo-detalle.dto.ts               (NUEVO)
│   ├── preview-desembolso.dto.ts             (existente)
│   ├── crear-desembolso.dto.ts               (existente)
│   ├── create-tipo-deduccion.dto.ts          (existente)
│   ├── create-tipo-recargo.dto.ts            (existente)
│   └── index.ts                              (NUEVO)
│
├── services/
│   ├── prestamo-consulta.service.ts          (NUEVO)
│   ├── clasificacion-prestamo.service.ts     (NUEVO)
│   ├── estado-prestamo.service.ts            (NUEVO)
│   ├── desembolso.service.ts                 (existente)
│   ├── calculo-interes.service.ts            (existente)
│   └── plan-pago.service.ts                  (existente)
│
├── controllers/
│   ├── prestamo.controller.ts                (NUEVO)
│   ├── clasificacion-prestamo.controller.ts  (NUEVO)
│   ├── estado-prestamo.controller.ts         (NUEVO)
│   ├── desembolso.controller.ts              (existente)
│   ├── tipo-deduccion.controller.ts          (existente)
│   └── tipo-recargo.controller.ts            (existente)
│
├── migrations/
│   └── ejemplo-migracion.ts                  (NUEVO - ejemplo)
│
├── desembolso.module.ts                      (ACTUALIZADO)
└── README.md                                 (NUEVO)
```

## Nuevas Funcionalidades

### 1. Filtrado Avanzado
- Por estado, clasificación, cliente, tipo de crédito
- Por rango de fechas
- Por mora (días mínimos, en mora true/false)
- Por número de crédito o DUI
- Búsqueda por nombre de cliente

### 2. Paginación
- Configurable (page, limit)
- Incluye total de páginas y registros
- Ordenamiento personalizable

### 3. DTOs Estructurados
- **PrestamoResumenDto**: Vista simplificada para listados
- **PrestamoDetalleDto**: Información completa del préstamo
- **PlanPagoDetalleDto**: Detalle de cada cuota
- **PrestamoPaginadoDto**: Respuesta paginada

### 4. Clasificación Automática
- Método para determinar clasificación según días de mora
- Basado en normativa NCB-022 de El Salvador
- Rangos configurables por catálogo

### 5. Catálogos Dinámicos
- Clasificaciones NCB-022 configurables
- Estados de préstamo configurables
- Endpoints CRUD completos
- Inicialización automática de valores por defecto

## Relaciones Implementadas

```
Prestamo
├── Many-to-One → Persona (cliente)
├── One-to-One  → Solicitud
├── Many-to-One → TipoCredito
├── Many-to-One → ClasificacionPrestamo (NUEVA)
├── Many-to-One → EstadoPrestamo (NUEVA)
├── One-to-Many → PlanPago[]
├── One-to-Many → DeduccionPrestamo[]
└── One-to-Many → RecargoPrestamo[]
```

## Compatibilidad

✅ Mantiene compatibilidad con código existente
✅ Los enums legacy siguen funcionando
✅ Nuevas columnas son opcionales (nullable)
✅ Endpoints de desembolso siguen funcionando
✅ No requiere cambios en código existente

## Próximos Pasos Recomendados

1. **Ejecutar migraciones** para crear las nuevas tablas
2. **Inicializar catálogos** con datos por defecto
3. **Probar endpoints** con Postman/Swagger
4. **Implementar en frontend** Angular
5. **Crear job automático** para actualizar clasificaciones por mora
6. **Implementar módulo de pagos** para actualizar saldos
7. **Agregar índices** en base de datos para mejor rendimiento
8. **Implementar auditoría** de cambios de clasificación y estado
