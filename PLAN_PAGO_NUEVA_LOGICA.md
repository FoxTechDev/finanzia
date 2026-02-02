# Nueva Lógica de Cálculo de Plan de Pagos

## Resumen de Cambios

Se modificó la lógica del cálculo del plan de pagos en el backend NestJS para unificar la interpretación del campo `plazo` y agregar soporte para número de cuotas personalizado en periodicidad DIARIA.

## Cambios Principales

### 1. Campo `plazo` - SIEMPRE en MESES

**Antes:**
- DIARIO: plazo en días
- SEMANAL, QUINCENAL, MENSUAL, etc.: plazo en meses

**Ahora:**
- **TODAS las periodicidades**: plazo en MESES
- Mínimo: 1 mes para cualquier periodicidad

### 2. Nuevo Campo `numeroCuotas`

Se agregó el campo opcional `numeroCuotas` al DTO `CalcularPlanPagoDto`:

- **OBLIGATORIO para periodicidad DIARIA**: el usuario define manualmente cuántas cuotas diarias generar
- **IGNORADO para otras periodicidades**: se calcula automáticamente según el plazo

### 3. Reglas de Conversión (Plazo → Número de Cuotas)

| Periodicidad | Fórmula           | Ejemplo (2 meses) |
|--------------|-------------------|-------------------|
| DIARIA       | numeroCuotas (manual) | numeroCuotas: 45 (usuario define) |
| SEMANAL      | plazo_meses × 4   | 2 × 4 = 8 cuotas  |
| QUINCENAL    | plazo_meses × 2   | 2 × 2 = 4 cuotas  |
| MENSUAL      | plazo_meses × 1   | 2 × 1 = 2 cuotas  |
| TRIMESTRAL   | plazo_meses / 3   | 6 / 3 = 2 cuotas  |
| SEMESTRAL    | plazo_meses / 6   | 6 / 6 = 1 cuota   |
| ANUAL        | plazo_meses / 12  | 12 / 12 = 1 cuota |

## Archivos Modificados

### 1. `calcular-plan-pago.dto.ts`

**Cambios:**
- Actualizada documentación del campo `plazo` (siempre en meses)
- Agregado campo opcional `numeroCuotas?: number`
- Agregada validación condicional: obligatorio si periodicidad = DIARIA

```typescript
@IsNumber()
@Min(1)
@Type(() => Number)
@IsOptional()
@ValidateIf((dto) => dto.periodicidad === PeriodicidadPago.DIARIO)
numeroCuotas?: number;
```

### 2. `solicitud.service.ts`

**Método modificado:** `calcularPlanPago()`

**Cambios:**
- Validación de plazo mínimo: `dto.plazo < 1`
- Validación específica para periodicidad DIARIA: `numeroCuotas` obligatorio
- Nueva lógica para determinar número de cuotas:
  - **DIARIA**: usa `dto.numeroCuotas` del usuario
  - **Otras**: calcula automáticamente con `calcularNumeroCuotas()`
- Para DIARIA: llama a `calcularConCuotasPersonalizadas()` con plazo en meses + número de cuotas

### 3. `calculo-interes.service.ts`

**Nuevos métodos públicos:**
- `calcularConCuotasPersonalizadas()`: Cálculo con cuotas personalizadas para periodicidad DIARIA

**Nuevos métodos privados:**
- `calcularFlatConCuotasPersonalizadas()`: FLAT con cuotas personalizadas
- `calcularAmortizadoConCuotasPersonalizadas()`: AMORTIZADO con cuotas personalizadas

**Lógica especial para DIARIA:**
- El interés se calcula sobre el plazo en meses
- Las cuotas se generan según el número definido por el usuario
- Las fechas excluyen domingos (manejado en `PlanPagoService`)

### 4. `tipo-credito.service.ts`

**Método modificado:** `validarParametros()`

**Cambios:**
- Simplificada la validación de plazo
- El plazo SIEMPRE se valida en meses, sin importar la periodicidad
- Plazo mínimo: `Math.max(1, tipoCredito.plazoMinimo)`

## Ejemplos de Uso

### Ejemplo 1: Periodicidad DIARIA

```http
POST /solicitudes/calcular-plan-pago
Content-Type: application/json

{
  "monto": 1000,
  "plazo": 2,                    // 2 meses
  "numeroCuotas": 45,            // 45 cuotas diarias (OBLIGATORIO)
  "tasaInteres": 24,
  "periodicidad": "DIARIO",
  "tipoInteres": "FLAT",
  "fechaPrimeraCuota": "2024-02-01"
}
```

**Resultado:**
- Interés calculado sobre 2 meses (24% anual)
- Plan de pago con 45 cuotas diarias
- Fechas excluyen domingos (saltan al lunes)

### Ejemplo 2: Periodicidad SEMANAL

```http
POST /solicitudes/calcular-plan-pago
Content-Type: application/json

{
  "monto": 5000,
  "plazo": 3,                    // 3 meses
  "tasaInteres": 18,
  "periodicidad": "SEMANAL",
  "tipoInteres": "AMORTIZADO",
  "fechaPrimeraCuota": "2024-02-01"
}
```

**Resultado:**
- Número de cuotas calculado automáticamente: 3 × 4 = 12 cuotas
- Plan de pago con 12 cuotas semanales
- Interés amortizado sobre saldo insoluto

### Ejemplo 3: Periodicidad MENSUAL

```http
POST /solicitudes/calcular-plan-pago
Content-Type: application/json

{
  "monto": 10000,
  "plazo": 6,                    // 6 meses
  "tasaInteres": 15,
  "periodicidad": "MENSUAL",
  "tipoInteres": "AMORTIZADO",
  "fechaPrimeraCuota": "2024-02-01"
}
```

**Resultado:**
- Número de cuotas: 6 × 1 = 6 cuotas mensuales
- Interés calculado sobre 6 meses

## Validaciones Implementadas

### 1. Validaciones de DTO (class-validator)

```typescript
// plazo mínimo 1 mes
@Min(1)
plazo: number;

// numeroCuotas obligatorio solo para DIARIA
@ValidateIf((dto) => dto.periodicidad === PeriodicidadPago.DIARIO)
numeroCuotas?: number;
```

### 2. Validaciones de Negocio (en service)

```typescript
// Plazo mínimo 1 mes
if (dto.plazo < 1) {
  throw new BadRequestException('El plazo debe ser mínimo 1 mes');
}

// Para DIARIA: numeroCuotas obligatorio
if (dto.periodicidad === PeriodicidadPago.DIARIO) {
  if (!dto.numeroCuotas || dto.numeroCuotas < 1) {
    throw new BadRequestException(
      'Para periodicidad DIARIA, el campo numeroCuotas es obligatorio y debe ser mayor a 0'
    );
  }
}
```

## Manejo de Fechas para Periodicidad DIARIA

El `PlanPagoService` maneja automáticamente la exclusión de domingos:

1. Si la primera cuota cae en domingo, se mueve al lunes
2. Al agregar días, si una fecha cae en domingo, se salta al lunes siguiente
3. Esto asegura que ninguna cuota tenga fecha de vencimiento en domingo

## Comportamiento del Interés en Periodicidad DIARIA

### Caso: Plazo 2 meses, 45 cuotas diarias

**Cálculo del interés:**
- Se usa el plazo en meses: 2 meses = 2/12 = 0.167 años
- Interés total = Capital × Tasa Anual × 0.167
- Ejemplo: $1,000 × 24% × 0.167 = $40

**Distribución:**
- El interés total ($40) se distribuye entre las 45 cuotas
- Interés por cuota = $40 / 45 = $0.89
- Capital por cuota = $1,000 / 45 = $22.22
- Cuota total = $22.22 + $0.89 = $23.11

## Compatibilidad con Código Existente

### Método `findOneConPlanPago()`

El método existente que calcula el plan de pago al consultar una solicitud sigue funcionando correctamente, pero ahora interpreta el plazo siempre como meses.

**Importante:** Si tienes solicitudes existentes con periodicidad DIARIA donde el plazo estaba en días, necesitarás:
1. Migrar los datos para convertir plazo de días a meses
2. Agregar el campo `numeroCuotas` en la tabla de solicitudes si deseas persistir este valor

## Pruebas Recomendadas

### 1. Test de Periodicidad DIARIA

```typescript
// Test: Validar que numeroCuotas es obligatorio para DIARIA
const dto = {
  monto: 1000,
  plazo: 2,
  // numeroCuotas no enviado - debe fallar
  tasaInteres: 24,
  periodicidad: 'DIARIO',
  tipoInteres: 'FLAT'
};

// Esperado: BadRequestException
```

### 2. Test de Cálculo Correcto

```typescript
// Test: Verificar cálculo con 2 meses, 45 cuotas
const dto = {
  monto: 1000,
  plazo: 2,
  numeroCuotas: 45,
  tasaInteres: 24,
  periodicidad: 'DIARIO',
  tipoInteres: 'FLAT'
};

// Esperado:
// - numeroCuotas: 45
// - Interés calculado sobre 2 meses
// - 45 fechas de vencimiento excluyendo domingos
```

### 3. Test de Exclusión de Domingos

```typescript
// Test: Primera cuota cae en domingo
const dto = {
  monto: 1000,
  plazo: 1,
  numeroCuotas: 7,
  tasaInteres: 24,
  periodicidad: 'DIARIO',
  tipoInteres: 'FLAT',
  fechaPrimeraCuota: '2024-02-10' // Sábado
};

// Esperado:
// - Primera cuota: 2024-02-11 (domingo → lunes)
// - Segunda cuota: 2024-02-12 (martes)
// - ...
```

## Migración de Datos

Si tienes datos existentes en producción con periodicidad DIARIA:

```sql
-- Identificar solicitudes con periodicidad DIARIA
SELECT s.id, s.plazo, pp.codigo
FROM solicitud s
JOIN periodicidad_pago pp ON s.periodicidad_pago_id = pp.id
WHERE pp.codigo = 'DIARIO';

-- NOTA: Necesitarás analizar cada caso para:
-- 1. Convertir el plazo de días a meses
-- 2. Determinar el numeroCuotas apropiado
```

## Resumen

Los cambios implementados unifican la lógica de interpretación del campo `plazo` y proporcionan mayor flexibilidad para la periodicidad DIARIA, permitiendo que el usuario defina el número exacto de cuotas mientras el interés se calcula sobre el plazo en meses.

Esta nueva estructura es más intuitiva y consistente, ya que el plazo siempre representa la duración total del crédito en meses, independientemente de cómo se distribuyan los pagos.
