# Endpoint de Cálculo y Previsualización del Plan de Pago

## Resumen

Se ha implementado exitosamente un endpoint para calcular y previsualizar el plan de pago de una solicitud de crédito **sin guardar nada en la base de datos**. Este endpoint es útil para que los usuarios puedan ver cómo quedaría el crédito antes de aprobarlo.

## Archivos Creados/Modificados

### 1. Archivos Creados

#### `src/creditos/solicitud/dto/calcular-plan-pago.dto.ts`
DTO que define los parámetros para el cálculo del plan de pago:
- `monto`: Monto del crédito
- `plazo`: Plazo en meses
- `tasaInteres`: Tasa de interés anual
- `periodicidad`: DIARIO, SEMANAL, QUINCENAL, MENSUAL, TRIMESTRAL, SEMESTRAL, ANUAL, AL_VENCIMIENTO
- `tipoInteres`: FLAT o AMORTIZADO
- `fechaPrimeraCuota` (opcional): Si no se proporciona, se calcula como hoy + 30 días

#### `test-calcular-plan-pago.http`
Archivo con ejemplos de uso del endpoint para pruebas con REST Client.

### 2. Archivos Modificados

#### `src/creditos/solicitud/solicitud.service.ts`
- Agregado método `calcularPlanPago()` que:
  - Valida los parámetros de entrada
  - Calcula la fecha de primera cuota si no viene
  - Usa `CalculoInteresService` para calcular las cuotas
  - Usa `PlanPagoService` para generar las fechas de vencimiento
  - Retorna el plan de pago completo sin guardar nada

#### `src/creditos/solicitud/solicitud.controller.ts`
- Agregado endpoint `POST /solicitudes/calcular-plan`
- Recibe el DTO y retorna el cálculo del plan de pago

#### `src/creditos/solicitud/solicitud.module.ts`
- Importado `DesembolsoModule` para tener acceso a los servicios de cálculo

## Endpoint

### POST `/solicitudes/calcular-plan`

**Descripción**: Calcula y previsualiza el plan de pago sin guardar nada en la base de datos.

**Request Body**:
```json
{
  "monto": 10000,
  "plazo": 12,
  "tasaInteres": 24,
  "periodicidad": "MENSUAL",
  "tipoInteres": "FLAT",
  "fechaPrimeraCuota": "2026-02-15"  // Opcional - Fecha de solicitud
}
```

**Nota Importante**: La `fechaPrimeraCuota` representa la fecha de la solicitud. El sistema automáticamente calcula la primera cuota para el **día POSTERIOR** a esta fecha. Por ejemplo, si la fecha es "2026-02-15", la primera cuota vencerá el "2026-02-16".

**Response**:
```json
{
  "cuotaNormal": 1200.00,
  "totalInteres": 2400.00,
  "totalPagar": 12400.00,
  "numeroCuotas": 12,
  "planPago": [
    {
      "numeroCuota": 1,
      "fechaVencimiento": "2026-02-16T00:00:00.000Z",
      "capital": 833.33,
      "interes": 200.00,
      "cuotaTotal": 1033.33,
      "saldoCapital": 9166.67
    },
    {
      "numeroCuota": 2,
      "fechaVencimiento": "2026-03-16T00:00:00.000Z",
      "capital": 833.33,
      "interes": 200.00,
      "cuotaTotal": 1033.33,
      "saldoCapital": 8333.34
    }
    // ... resto de cuotas
  ]
}
```

## Validaciones

El endpoint valida:
- Monto debe ser mayor a 0
- Plazo debe ser mayor a 0
- Tasa de interés no puede ser negativa
- Periodicidad debe ser uno de los valores del enum `PeriodicidadPago`
- Tipo de interés debe ser FLAT o AMORTIZADO

## Tipos de Interés Soportados

### FLAT (Microcréditos)
- El interés se calcula sobre el monto original durante todo el plazo
- Cuotas uniformes con interés fijo
- Fórmula: `Interés Total = Capital × Tasa Anual × (Plazo en años)`

### AMORTIZADO (Sistema Francés)
- El interés se calcula sobre el saldo insoluto
- Cuotas uniformes con interés decreciente y capital creciente
- Fórmula: `Cuota = P × [r(1+r)^n] / [(1+r)^n - 1]`

## Periodicidades Soportadas

- **DIARIO**: 365 períodos por año
- **SEMANAL**: 52 períodos por año (7 días)
- **QUINCENAL**: 24 períodos por año (15 días)
- **MENSUAL**: 12 períodos por año
- **TRIMESTRAL**: 4 períodos por año (3 meses)
- **SEMESTRAL**: 2 períodos por año (6 meses)
- **ANUAL**: 1 período por año
- **AL_VENCIMIENTO**: 1 cuota única al final

## Ejemplos de Uso

### Ejemplo 1: Crédito Mensual FLAT
```bash
curl -X POST http://localhost:3000/solicitudes/calcular-plan \
  -H "Content-Type: application/json" \
  -d '{
    "monto": 10000,
    "plazo": 12,
    "tasaInteres": 24,
    "periodicidad": "MENSUAL",
    "tipoInteres": "FLAT"
  }'
```

### Ejemplo 2: Crédito Quincenal AMORTIZADO con Fecha Específica
```bash
curl -X POST http://localhost:3000/solicitudes/calcular-plan \
  -H "Content-Type: application/json" \
  -d '{
    "monto": 5000,
    "plazo": 6,
    "tasaInteres": 18,
    "periodicidad": "QUINCENAL",
    "tipoInteres": "AMORTIZADO",
    "fechaPrimeraCuota": "2026-02-15"
  }'
```

### Ejemplo 3: Microcrédito Semanal
```bash
curl -X POST http://localhost:3000/solicitudes/calcular-plan \
  -H "Content-Type: application/json" \
  -d '{
    "monto": 2000,
    "plazo": 3,
    "tasaInteres": 30,
    "periodicidad": "SEMANAL",
    "tipoInteres": "FLAT"
  }'
```

## Casos de Uso

1. **Simulador de Créditos**: Permite al usuario ver diferentes escenarios antes de solicitar el crédito
2. **Análisis de Solicitud**: El asesor puede calcular diferentes opciones para mostrar al cliente
3. **Validación de Parámetros**: Verificar que los valores de monto, plazo y tasa sean correctos antes de crear la solicitud
4. **Comparación de Opciones**: Comparar entre FLAT y AMORTIZADO, o entre diferentes periodicidades

## Notas Técnicas

- El endpoint **NO guarda nada** en la base de datos
- Usa los mismos servicios de cálculo que el desembolso real, garantizando consistencia
- **Cálculo de fechas**:
  - Si se proporciona `fechaPrimeraCuota`, el sistema suma 1 día para que la primera cuota venza el día POSTERIOR
  - Si no se proporciona, por defecto es hoy + 30 días
- Los valores se redondean a 2 decimales
- Las validaciones se hacen con `class-validator` en el DTO
- Los cálculos son realizados por `CalculoInteresService` y `PlanPagoService`

## Testing

Para probar el endpoint, puedes usar el archivo `test-calcular-plan-pago.http` con la extensión REST Client de VS Code, o usar herramientas como Postman, Insomnia o curl.

## Próximos Pasos Sugeridos

1. Agregar cálculo de recargos opcionales en la previsualización
2. Agregar cálculo de deducciones opcionales
3. Crear un endpoint similar para recalcular un crédito ya existente con nuevos parámetros
4. Agregar exportación del plan de pago a PDF o Excel
