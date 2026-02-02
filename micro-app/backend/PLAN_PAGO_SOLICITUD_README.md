# Plan de Pago de Solicitud - Documentación

## Descripción General

Este módulo implementa el almacenamiento del plan de pago calculado para una solicitud de crédito. Permite calcular, guardar y consultar el plan de pago antes de que se realice el desembolso.

## Tablas Creadas

### 1. `plan_pago_solicitud`

Almacena el detalle de cada cuota del plan de pago calculado para una solicitud.

**Campos:**
- `id` - PK autoincremental
- `solicitudId` - FK a solicitud.id (CASCADE on delete)
- `numeroCuota` - Número de la cuota (1, 2, 3, ...)
- `fechaVencimiento` - Fecha de vencimiento de la cuota
- `capital` - Monto de capital a pagar en la cuota
- `interes` - Monto de interés en la cuota
- `recargos` - Suma de recargos aplicados en la cuota
- `cuotaTotal` - Total de la cuota (capital + interes + recargos)
- `saldoCapital` - Saldo de capital después de pagar esta cuota
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de última actualización

**Índices:**
- `IDX_plan_pago_solicitud_solicitudId` - Para búsquedas por solicitud
- `IDX_plan_pago_solicitud_solicitudId_numeroCuota` - Para buscar cuotas específicas
- `IDX_plan_pago_solicitud_fechaVencimiento` - Para consultas por fecha

### 2. `recargo_solicitud`

Almacena los recargos aplicados a una solicitud (seguros, comisiones, etc.).

**Campos:**
- `id` - PK autoincremental
- `solicitudId` - FK a solicitud.id (CASCADE on delete)
- `nombre` - Nombre del recargo (ej: "Seguro de vida")
- `tipo` - Tipo de cálculo: FIJO o PORCENTAJE
- `valor` - Valor del recargo (monto fijo o % según tipo)
- `montoCalculado` - Monto calculado que se aplica por cuota
- `aplicaDesde` - Número de cuota desde (default: 1)
- `aplicaHasta` - Número de cuota hasta (NULL = hasta el final)
- `activo` - Indica si el recargo está activo
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de última actualización

**Índices:**
- `IDX_recargo_solicitud_solicitudId` - Para búsquedas por solicitud

## Nuevos Endpoints

### 1. POST `/solicitudes/calcular-plan`

**Descripción:** Calcula y previsualiza el plan de pago SIN guardarlo en la base de datos.

**Casos de uso:**
- Simular diferentes escenarios antes de aprobar
- Mostrar al cliente cómo quedaría su crédito
- Validar condiciones antes de guardar

**Request Body:**
```json
{
  "monto": 10000,
  "plazo": 12,
  "tasaInteres": 18,
  "periodicidad": "MENSUAL",
  "tipoInteres": "AMORTIZADO",
  "fechaPrimeraCuota": "2025-02-01",
  "numeroCuotas": 45,
  "recargos": [
    {
      "nombre": "Seguro de vida",
      "tipo": "PORCENTAJE",
      "valor": 1.5,
      "aplicaDesde": 1,
      "aplicaHasta": 12
    },
    {
      "nombre": "Comisión administrativa",
      "tipo": "FIJO",
      "valor": 100,
      "aplicaDesde": 1,
      "aplicaHasta": 1
    }
  ]
}
```

**Response:**
```json
{
  "cuotaNormal": 917.43,
  "totalInteres": 1009.16,
  "totalRecargos": 150.00,
  "totalPagar": 11159.16,
  "numeroCuotas": 12,
  "planPago": [
    {
      "numeroCuota": 1,
      "fechaVencimiento": "2025-03-01",
      "capital": 767.43,
      "interes": 150.00,
      "recargos": 112.50,
      "cuotaTotal": 1029.93,
      "saldoCapital": 9232.57
    },
    // ... más cuotas
  ]
}
```

### 2. POST `/solicitudes/:id/guardar-plan-pago`

**Descripción:** Calcula Y GUARDA el plan de pago en la base de datos.

**Casos de uso:**
- Guardar el plan de pago al aprobar la solicitud
- Persistir el plan para consulta posterior
- Actualizar el plan si cambian las condiciones

**Request Body:** (Mismo formato que calcular-plan)

**Response:**
```json
{
  "cuotaNormal": 917.43,
  "totalInteres": 1009.16,
  "totalRecargos": 150.00,
  "totalPagar": 11159.16,
  "numeroCuotas": 12,
  "planPagoGuardado": [
    {
      "id": 1,
      "solicitudId": 1,
      "numeroCuota": 1,
      "fechaVencimiento": "2025-03-01",
      "capital": 767.43,
      "interes": 150.00,
      "recargos": 112.50,
      "cuotaTotal": 1029.93,
      "saldoCapital": 9232.57,
      "createdAt": "2025-02-01T12:00:00.000Z",
      "updatedAt": "2025-02-01T12:00:00.000Z"
    },
    // ... más cuotas
  ],
  "recargosGuardados": [
    {
      "id": 1,
      "solicitudId": 1,
      "nombre": "Seguro de vida",
      "tipo": "PORCENTAJE",
      "valor": 1.5,
      "montoCalculado": 12.50,
      "aplicaDesde": 1,
      "aplicaHasta": 12,
      "activo": true,
      "createdAt": "2025-02-01T12:00:00.000Z",
      "updatedAt": "2025-02-01T12:00:00.000Z"
    },
    // ... más recargos
  ]
}
```

**Notas importantes:**
- Si ya existe un plan de pago guardado, se elimina y se crea uno nuevo
- Las eliminaciones son en cascada (se borran los recargos también)
- La operación es transaccional (si falla algo, no se guarda nada)

### 3. GET `/solicitudes/:id/plan-pago`

**Descripción:** Obtiene el plan de pago guardado de una solicitud.

**Response:**
```json
{
  "solicitud": {
    "id": 1,
    "numeroSolicitud": "SOL-2025-000001",
    "montoSolicitado": 10000,
    // ... otros campos
  },
  "planPago": [
    {
      "id": 1,
      "solicitudId": 1,
      "numeroCuota": 1,
      "fechaVencimiento": "2025-03-01",
      "capital": 767.43,
      "interes": 150.00,
      "recargos": 112.50,
      "cuotaTotal": 1029.93,
      "saldoCapital": 9232.57,
      "createdAt": "2025-02-01T12:00:00.000Z",
      "updatedAt": "2025-02-01T12:00:00.000Z"
    },
    // ... más cuotas
  ],
  "recargos": [
    {
      "id": 1,
      "solicitudId": 1,
      "nombre": "Seguro de vida",
      "tipo": "PORCENTAJE",
      "valor": 1.5,
      "montoCalculado": 12.50,
      "aplicaDesde": 1,
      "aplicaHasta": 12,
      "activo": true
    }
  ],
  "totales": {
    "cuotaNormal": 917.43,
    "totalCapital": 10000.00,
    "totalInteres": 1009.16,
    "totalRecargos": 150.00,
    "totalPagar": 11159.16
  }
}
```

**Error:** Si no existe plan guardado, retorna 404 Not Found.

## Recargos

### Tipos de Recargo

#### 1. FIJO
Monto fijo que se suma a cada cuota en el rango especificado.

**Ejemplo:**
```json
{
  "nombre": "Comisión administrativa",
  "tipo": "FIJO",
  "valor": 100,
  "aplicaDesde": 1,
  "aplicaHasta": 1
}
```
- Se suma $100 solo a la primera cuota

#### 2. PORCENTAJE
Porcentaje de la cuota normal que se suma a cada cuota en el rango.

**Ejemplo:**
```json
{
  "nombre": "Seguro de vida",
  "tipo": "PORCENTAJE",
  "valor": 1.5,
  "aplicaDesde": 1,
  "aplicaHasta": 12
}
```
- Si la cuota normal es $917.43
- El recargo por cuota sería: $917.43 × 1.5% = $13.76
- Se suma a todas las cuotas (1 a 12)

### Rangos de Aplicación

Los recargos se pueden aplicar a rangos específicos de cuotas:

- `aplicaDesde`: Primera cuota donde se aplica (default: 1)
- `aplicaHasta`: Última cuota donde se aplica (null o 0 = hasta el final)

**Ejemplo - Recargo solo en primeras 6 cuotas:**
```json
{
  "nombre": "Seguro primeros 6 meses",
  "tipo": "PORCENTAJE",
  "valor": 2,
  "aplicaDesde": 1,
  "aplicaHasta": 6
}
```

**Ejemplo - Diferentes recargos por periodo:**
```json
{
  "recargos": [
    {
      "nombre": "Seguro básico (1-6)",
      "tipo": "PORCENTAJE",
      "valor": 2,
      "aplicaDesde": 1,
      "aplicaHasta": 6
    },
    {
      "nombre": "Seguro premium (7-12)",
      "tipo": "PORCENTAJE",
      "valor": 1.5,
      "aplicaDesde": 7,
      "aplicaHasta": 12
    }
  ]
}
```

## Periodicidades Soportadas

### Periodicidad DIARIA (especial)

Para periodicidad DIARIA, el campo `numeroCuotas` es **OBLIGATORIO**:

```json
{
  "monto": 5000,
  "plazo": 2,
  "tasaInteres": 15,
  "periodicidad": "DIARIO",
  "tipoInteres": "FLAT",
  "numeroCuotas": 45,
  "fechaPrimeraCuota": "2025-02-01"
}
```

- `plazo`: 2 meses (para cálculo de interés)
- `numeroCuotas`: 45 cuotas diarias
- Las fechas excluyen domingos automáticamente

### Otras Periodicidades

Para el resto de periodicidades, `numeroCuotas` se calcula automáticamente:

| Periodicidad | Fórmula | Ejemplo (6 meses) |
|--------------|---------|-------------------|
| SEMANAL | plazo × 4 | 6 × 4 = 24 cuotas |
| QUINCENAL | plazo × 2 | 6 × 2 = 12 cuotas |
| MENSUAL | plazo × 1 | 6 × 1 = 6 cuotas |
| TRIMESTRAL | plazo / 3 | 6 / 3 = 2 cuotas |
| SEMESTRAL | plazo / 6 | 6 / 6 = 1 cuota |
| ANUAL | plazo / 12 | 12 / 12 = 1 cuota |

## Tipos de Interés

### AMORTIZADO (Cuota Fija)
- Cada cuota tiene el mismo monto total
- El capital aumenta y el interés disminuye con cada cuota
- Recomendado para créditos de consumo

### FLAT (Cuota Variable)
- El capital es el mismo en cada cuota
- El interés se calcula sobre el saldo
- Total de la cuota varía
- Recomendado para créditos comerciales

## Archivos Modificados/Creados

### Entidades
- ✅ `src/creditos/solicitud/entities/plan-pago-solicitud.entity.ts`
- ✅ `src/creditos/solicitud/entities/recargo-solicitud.entity.ts`
- ✅ `src/creditos/solicitud/entities/solicitud.entity.ts` (relaciones agregadas)

### DTOs
- ✅ `src/creditos/solicitud/dto/calcular-plan-pago.dto.ts` (recargos agregados)
- ✅ `src/creditos/solicitud/dto/guardar-plan-pago.dto.ts` (nuevo)

### Servicios
- ✅ `src/creditos/solicitud/solicitud.service.ts` (métodos agregados)

### Controladores
- ✅ `src/creditos/solicitud/solicitud.controller.ts` (endpoints agregados)

### Módulos
- ✅ `src/creditos/solicitud/solicitud.module.ts` (entidades registradas)

### Migraciones
- ✅ `src/database/migrations/1770200000000-AddPlanPagoSolicitudTables.ts`

### Archivos de Prueba
- ✅ `test-plan-pago-solicitud.http`

## Cómo Ejecutar la Migración

```bash
# Ejecutar migración
npm run migration:run

# O si usas TypeORM CLI directamente
npx typeorm migration:run -d src/database/data-source.ts
```

## Flujo de Uso Típico

### 1. Cliente solicita un crédito
```http
POST /api/solicitudes
```

### 2. Asesor analiza y previsualiza diferentes planes
```http
# Probar con diferentes plazos/tasas
POST /api/solicitudes/calcular-plan
{
  "monto": 10000,
  "plazo": 12,
  "tasaInteres": 18,
  "periodicidad": "MENSUAL",
  "tipoInteres": "AMORTIZADO"
}
```

### 3. Comité aprueba la solicitud
```http
POST /api/solicitudes/{id}/estado
{
  "nuevoEstadoCodigo": "APROBADA",
  "montoAprobado": 10000,
  "plazoAprobado": 12,
  "tasaInteresAprobada": 18
}
```

### 4. Sistema guarda el plan de pago aprobado
```http
POST /api/solicitudes/{id}/guardar-plan-pago
{
  "monto": 10000,
  "plazo": 12,
  "tasaInteres": 18,
  "periodicidad": "MENSUAL",
  "tipoInteres": "AMORTIZADO",
  "recargos": [...]
}
```

### 5. Consultar plan guardado
```http
GET /api/solicitudes/{id}/plan-pago
```

### 6. Al desembolsar, se crea el plan de pago real
```http
POST /api/desembolsos
# El plan de pago de la solicitud sirve como referencia
# Se crea un nuevo plan de pago en la tabla plan_pago
```

## Notas Importantes

1. **Transacciones**: Todas las operaciones de guardado usan transacciones para garantizar integridad
2. **Cascade Delete**: Al eliminar una solicitud, se borran automáticamente su plan de pago y recargos
3. **Sobrescritura**: Guardar un nuevo plan sobrescribe el anterior (útil si cambian las condiciones)
4. **Validaciones**: Los DTOs validan que los datos sean correctos antes de guardar
5. **Redondeo**: Todos los montos se redondean a 2 decimales para evitar problemas de precisión

## Ejemplos de Casos de Uso

### Caso 1: Crédito simple sin recargos
```json
{
  "monto": 5000,
  "plazo": 6,
  "tasaInteres": 15,
  "periodicidad": "MENSUAL",
  "tipoInteres": "AMORTIZADO"
}
```

### Caso 2: Crédito con seguro
```json
{
  "monto": 10000,
  "plazo": 12,
  "tasaInteres": 18,
  "periodicidad": "MENSUAL",
  "tipoInteres": "AMORTIZADO",
  "recargos": [
    {
      "nombre": "Seguro de vida",
      "tipo": "PORCENTAJE",
      "valor": 1.5
    }
  ]
}
```

### Caso 3: Crédito con comisión única + seguro mensual
```json
{
  "monto": 15000,
  "plazo": 24,
  "tasaInteres": 20,
  "periodicidad": "QUINCENAL",
  "tipoInteres": "AMORTIZADO",
  "recargos": [
    {
      "nombre": "Comisión apertura",
      "tipo": "FIJO",
      "valor": 500,
      "aplicaDesde": 1,
      "aplicaHasta": 1
    },
    {
      "nombre": "Seguro mensual",
      "tipo": "PORCENTAJE",
      "valor": 2
    }
  ]
}
```

## Troubleshooting

### Error: "numeroCuotas is required for DIARIO"
- **Causa**: Falta el campo numeroCuotas para periodicidad DIARIA
- **Solución**: Agregar numeroCuotas al request

### Error: "No existe plan de pago guardado"
- **Causa**: Se intenta obtener un plan que no ha sido guardado
- **Solución**: Primero usar POST /guardar-plan-pago

### Error: "No se puede modificar una solicitud en estado..."
- **Causa**: Se intenta guardar plan en una solicitud con estado no permitido
- **Solución**: Verificar que la solicitud esté en estado adecuado (APROBADA)
