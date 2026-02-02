# Mejora en el Cálculo de Fechas del Plan de Pago

## Problema Identificado

Las fechas de las cuotas en el plan de pago iniciaban el **mismo día** que la fecha de solicitud, cuando deberían iniciar el **día POSTERIOR**.

### Ejemplo del problema:
- Fecha de solicitud: 2026-02-15
- Primera cuota (ANTES): 2026-02-15 ❌
- Primera cuota (AHORA): 2026-02-16 ✅

## Solución Implementada

### 1. Modificación en `solicitud.service.ts`

**Archivo**: `C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\micro-app\backend\src\creditos\solicitud\solicitud.service.ts`

**Método modificado**: `calcularPlanPago()`

**Cambio realizado** (líneas 589-599):
```typescript
// ANTES:
if (dto.fechaPrimeraCuota) {
  fechaPrimeraCuota = new Date(dto.fechaPrimeraCuota);
} else {
  fechaPrimeraCuota = new Date();
  fechaPrimeraCuota.setDate(fechaPrimeraCuota.getDate() + 30);
}

// AHORA:
if (dto.fechaPrimeraCuota) {
  fechaPrimeraCuota = new Date(dto.fechaPrimeraCuota);
  // Agregar 1 día para que la primera cuota sea el día posterior
  fechaPrimeraCuota.setDate(fechaPrimeraCuota.getDate() + 1);
} else {
  // Por defecto: hoy + 30 días (ya incluye el día posterior)
  fechaPrimeraCuota = new Date();
  fechaPrimeraCuota.setDate(fechaPrimeraCuota.getDate() + 30);
}
```

**Impacto**: Este cambio afecta a:
- Endpoint `POST /solicitudes/calcular-plan` (previsualización del plan de pago)
- Endpoint `GET /solicitudes/:id/detalle` (detalle de solicitud con plan de pago)

### 2. Actualización del DTO

**Archivo**: `C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\micro-app\backend\src\creditos\solicitud\dto\calcular-plan-pago.dto.ts`

**Cambio**: Mejorada la documentación del campo `fechaPrimeraCuota` para indicar claramente que representa la fecha de solicitud y que la primera cuota se calculará para el día posterior.

```typescript
@IsDateString()
@IsOptional()
fechaPrimeraCuota?: string; // Fecha de solicitud. La primera cuota se calculará para el día POSTERIOR. Por defecto: hoy + 30 días
```

### 3. Actualización de Documentación

**Archivo**: `C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\ENDPOINT_CALCULAR_PLAN_PAGO.md`

- Agregada nota importante sobre el cálculo de fechas
- Actualizados ejemplos de respuesta para mostrar fechas correctas
- Actualizada sección de "Notas Técnicas" para explicar el comportamiento

### 4. Archivo de Pruebas Mejorado

**Archivo**: `C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\micro-app\backend\test-calcular-plan-pago.http`

**Casos de prueba agregados**:

1. **Verificación de fecha inicial (caso 1)**:
   - Fecha solicitud: 2026-01-31
   - Primera cuota esperada: 2026-02-01

2. **Verificación de fecha inicial (caso 2)**:
   - Fecha solicitud: 2026-12-31
   - Primera cuota esperada: 2027-01-01 (siguiente año)

## Casos de Prueba

### Caso 1: Con fecha específica
```http
POST http://localhost:3000/solicitudes/calcular-plan
Content-Type: application/json

{
  "monto": 10000,
  "plazo": 3,
  "tasaInteres": 24,
  "periodicidad": "MENSUAL",
  "tipoInteres": "AMORTIZADO",
  "fechaPrimeraCuota": "2026-01-31"
}
```

**Resultado esperado**:
- Cuota 1: 2026-02-01
- Cuota 2: 2026-03-01
- Cuota 3: 2026-04-01

### Caso 2: Cambio de año
```http
POST http://localhost:3000/solicitudes/calcular-plan
Content-Type: application/json

{
  "monto": 5000,
  "plazo": 6,
  "tasaInteres": 20,
  "periodicidad": "MENSUAL",
  "tipoInteres": "FLAT",
  "fechaPrimeraCuota": "2026-12-31"
}
```

**Resultado esperado**:
- Cuota 1: 2027-01-01
- Cuota 2: 2027-02-01
- Cuota 3: 2027-03-01
- etc.

### Caso 3: Sin fecha (por defecto)
```http
POST http://localhost:3000/solicitudes/calcular-plan
Content-Type: application/json

{
  "monto": 10000,
  "plazo": 12,
  "tasaInteres": 24,
  "periodicidad": "MENSUAL",
  "tipoInteres": "FLAT"
}
```

**Resultado esperado**:
- Primera cuota: Hoy + 30 días

## Comportamiento por Periodicidad

La lógica de agregar 1 día aplica para todas las periodicidades:

- **DIARIO**: Fecha solicitud + 1 día, luego suma 1 día por cada cuota
- **SEMANAL**: Fecha solicitud + 1 día, luego suma 7 días por cada cuota
- **QUINCENAL**: Fecha solicitud + 1 día, luego suma 15 días por cada cuota
- **MENSUAL**: Fecha solicitud + 1 día, luego suma 1 mes por cada cuota
- **TRIMESTRAL**: Fecha solicitud + 1 día, luego suma 3 meses por cada cuota
- **SEMESTRAL**: Fecha solicitud + 1 día, luego suma 6 meses por cada cuota
- **ANUAL**: Fecha solicitud + 1 día, luego suma 1 año por cada cuota
- **AL_VENCIMIENTO**: Fecha solicitud + 1 día (cuota única)

## Verificación

Para verificar que el cambio funciona correctamente:

1. Iniciar el servidor backend:
   ```bash
   cd micro-app/backend
   npm run start:dev
   ```

2. Ejecutar las pruebas del archivo `test-calcular-plan-pago.http` usando REST Client en VS Code

3. Verificar que las fechas de las cuotas sean correctas:
   - Primera cuota debe ser 1 día después de `fechaPrimeraCuota`
   - Las cuotas subsiguientes deben calcularse correctamente según la periodicidad

## Archivos Modificados

1. `micro-app/backend/src/creditos/solicitud/solicitud.service.ts`
2. `micro-app/backend/src/creditos/solicitud/dto/calcular-plan-pago.dto.ts`
3. `micro-app/backend/test-calcular-plan-pago.http`
4. `ENDPOINT_CALCULAR_PLAN_PAGO.md`

## Compatibilidad

Esta mejora es **compatible hacia atrás** porque:
- Solo afecta el cálculo de fechas en la previsualización
- No modifica la estructura de la base de datos
- No cambia la firma de los endpoints
- Los préstamos ya creados no se ven afectados

## Próximos Pasos Recomendados

1. Verificar en el frontend que se esté enviando la fecha correcta al crear desembolsos
2. Asegurarse de que la interfaz muestre claramente al usuario que la primera cuota será el día siguiente a la fecha seleccionada
3. Considerar agregar validación para evitar que la fecha de primera cuota sea en el pasado
