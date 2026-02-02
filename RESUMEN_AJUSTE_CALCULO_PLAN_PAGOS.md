# Resumen: Ajuste del Cálculo del Plan de Pagos

## Cambios Implementados

Se ha ajustado la lógica del cálculo del plan de pagos para que cuando la periodicidad sea diferente a DIARIO, el usuario ingrese el plazo en MESES y el sistema lo convierta al número de cuotas correspondiente según la periodicidad.

---

## 1. Regla de Conversión (1 mes = 4 semanas base)

| Periodicidad | Fórmula | Ejemplo (3 meses) |
|--------------|---------|-------------------|
| DIARIO | plazo = número de días (sin cambio) | 30 días = 30 cuotas |
| SEMANAL | plazo_meses × 4 | 3 × 4 = 12 cuotas |
| QUINCENAL | plazo_meses × 2 | 3 × 2 = 6 cuotas |
| MENSUAL | plazo_meses × 1 | 3 × 1 = 3 cuotas |
| TRIMESTRAL | plazo_meses / 3 | 3 / 3 = 1 cuota |
| SEMESTRAL | plazo_meses / 6 | 6 / 6 = 1 cuota |
| ANUAL | plazo_meses / 12 | 12 / 12 = 1 cuota |

---

## 2. Archivos Modificados

### 2.1. TipoCreditoService
**Archivo:** `micro-app/backend/src/creditos/tipo-credito/tipo-credito.service.ts`

#### Método `validarParametros()` (línea 133-155)
**Cambio principal:**
```typescript
// ANTES (incorrecto)
case 'SEMANAL':
  factorConversion = 4.33; // ~4.33 semanas por mes
  unidad = 'semanas';
  break;

// DESPUÉS (correcto)
case 'SEMANAL':
  factorConversion = 4; // Exactamente 4 semanas por mes
  unidad = 'semanas';
  break;
```

**Propósito:**
- Este método valida que los parámetros de una solicitud estén dentro de los rangos permitidos del tipo de crédito
- Convierte los límites de plazo (que están en meses en la tabla) a la unidad correspondiente según la periodicidad
- Ejemplo: Si el tipo de crédito permite 1-12 meses y la periodicidad es SEMANAL:
  - Antes: plazo mínimo = 1 × 4.33 ≈ 5 semanas
  - Ahora: plazo mínimo = 1 × 4 = 4 semanas

---

### 2.2. CalculoInteresService
**Archivo:** `micro-app/backend/src/creditos/desembolso/services/calculo-interes.service.ts`

#### Método `calcularNumeroCuotas()` (línea 69-94)
**Cambio principal:**
```typescript
// ANTES (incorrecto)
case PeriodicidadPago.SEMANAL:
  return Math.round(plazoMeses * 4.33);

// DESPUÉS (correcto)
case PeriodicidadPago.SEMANAL:
  // Exactamente 4 semanas por mes (1 mes = 4 semanas)
  return plazoMeses * 4;
```

**Documentación actualizada:**
- Se agregó una tabla explicativa de la regla de conversión
- Se clarificó que DIARIO no usa esta función normalmente
- Se agregaron ejemplos de conversión

#### Método `convertirCuotasAMeses()` (línea 100-124)
**Cambio principal:**
```typescript
// ANTES (incorrecto)
case PeriodicidadPago.SEMANAL:
  return numeroCuotas / 4.33;

// DESPUÉS (correcto)
case PeriodicidadPago.SEMANAL:
  // Exactamente 4 semanas por mes (1 mes = 4 semanas)
  return numeroCuotas / 4;
```

---

### 2.2. SolicitudService
**Archivo:** `micro-app/backend/src/creditos/solicitud/solicitud.service.ts`

#### Método `calcularPlanPago()` (línea 602-610)
**Cambio principal:**
```typescript
// ANTES (incorrecto - trataba SEMANAL y QUINCENAL como cuotas)
const periodicidadesEnCuotas = [
  PeriodicidadPago.DIARIO,
  PeriodicidadPago.SEMANAL,
  PeriodicidadPago.QUINCENAL,
];
const plazoEnCuotas = periodicidadesEnCuotas.includes(dto.periodicidad as PeriodicidadPago);

// DESPUÉS (correcto - solo DIARIO usa cuotas directas)
// Determinar si el plazo ya está en cuotas según la periodicidad
// DIARIO: el usuario ingresa número de días (cuotas) directamente
// SEMANAL, QUINCENAL, MENSUAL, TRIMESTRAL, etc: el usuario ingresa meses, se convierten a cuotas
const plazoEnCuotas = dto.periodicidad === PeriodicidadPago.DIARIO;
```

**Lógica actualizada:**
- Solo DIARIO interpreta el plazo como número de días (cuotas directas)
- Todas las demás periodicidades interpretan el plazo como meses
- El sistema convierte automáticamente meses a cuotas usando `calcularNumeroCuotas()`

---

### 2.3. CalcularPlanPagoDto
**Archivo:** `micro-app/backend/src/creditos/solicitud/dto/calcular-plan-pago.dto.ts`

#### Documentación actualizada (línea 1-52)
**Cambios:**
- Se actualizó el JSDoc con la tabla completa de reglas de conversión
- Se agregaron ejemplos específicos para DIARIO y SEMANAL
- Se clarificó la interpretación del campo `plazo`:
  - DIARIO: número de días
  - SEMANAL/QUINCENAL/MENSUAL/etc: número de meses

---

## 3. Archivo de Pruebas

**Archivo:** `micro-app/backend/test-nuevo-calculo-plan-pago.http`

Se creó un archivo completo de pruebas HTTP que incluye:

### 3.1. Pruebas básicas (1-7)
- DIARIO: 30 días → 30 cuotas
- SEMANAL: 3 meses → 12 cuotas
- QUINCENAL: 3 meses → 6 cuotas
- MENSUAL: 3 meses → 3 cuotas
- TRIMESTRAL: 3 meses → 1 cuota
- SEMESTRAL: 6 meses → 1 cuota
- ANUAL: 12 meses → 1 cuota

### 3.2. Pruebas de borde (8-10)
- SEMANAL: 1 mes → 4 cuotas
- SEMANAL: 6 meses → 24 cuotas
- QUINCENAL: 6 meses → 12 cuotas

### 3.3. Pruebas con interés FLAT (11)
- SEMANAL FLAT: 3 meses → 12 cuotas con interés distribuido uniformemente

---

## 4. Ejemplo Completo de Uso

### Entrada del Usuario:
```json
{
  "monto": 1000,
  "plazo": 3,              // 3 MESES
  "tasaInteres": 24,
  "periodicidad": "SEMANAL",
  "tipoInteres": "AMORTIZADO",
  "fechaPrimeraCuota": "2026-02-01"
}
```

### Procesamiento Interno:
1. El sistema identifica que periodicidad = SEMANAL
2. Determina que `plazoEnCuotas = false` (porque no es DIARIO)
3. Llama a `calcularNumeroCuotas(3, SEMANAL)`
4. Calcula: 3 meses × 4 semanas = **12 cuotas**
5. Genera plan de pago con 12 fechas semanales consecutivas

### Salida Esperada:
```json
{
  "cuotaNormal": 87.50,
  "totalInteres": 50.00,
  "totalPagar": 1050.00,
  "numeroCuotas": 12,
  "planPago": [
    {
      "numeroCuota": 1,
      "fechaVencimiento": "2026-02-02",
      "capital": 83.33,
      "interes": 4.17,
      "cuotaTotal": 87.50,
      "saldoCapital": 916.67
    },
    // ... 11 cuotas más con fechas semanales
  ]
}
```

---

## 5. Beneficios de los Cambios

### 5.1. Consistencia
- Todas las periodicidades (excepto DIARIO) usan meses como entrada
- El usuario no tiene que calcular manualmente el número de cuotas

### 5.2. Simplicidad
- SEMANAL usa exactamente 4 semanas por mes (no 4.33)
- QUINCENAL usa exactamente 2 quincenas por mes
- Cálculos más predecibles y fáciles de entender

### 5.3. Flexibilidad
- DIARIO mantiene su comportamiento especial (entrada en días)
- El sistema maneja automáticamente la conversión para otras periodicidades

---

## 6. Validación

### Checklist de Pruebas:

- [ ] **DIARIO**: Plazo en días genera el número correcto de cuotas diarias
- [ ] **SEMANAL**: 3 meses generan exactamente 12 cuotas semanales (3 × 4)
- [ ] **QUINCENAL**: 3 meses generan exactamente 6 cuotas quincenales (3 × 2)
- [ ] **MENSUAL**: 3 meses generan exactamente 3 cuotas mensuales
- [ ] **TRIMESTRAL**: 3 meses generan 1 cuota trimestral (3 / 3)
- [ ] **SEMESTRAL**: 6 meses generan 1 cuota semestral (6 / 6)
- [ ] **ANUAL**: 12 meses generan 1 cuota anual (12 / 12)
- [ ] Interés FLAT distribuye correctamente en todas las cuotas
- [ ] Interés AMORTIZADO calcula correctamente sobre saldo insoluto
- [ ] Las fechas del plan de pago respetan la periodicidad seleccionada

---

## 7. Notas Técnicas

### 7.1. DIARIO (comportamiento especial)
- El plazo representa directamente el número de días
- El sistema excluye automáticamente los domingos en PlanPagoService
- Ejemplo: plazo=5 en viernes genera: viernes, sábado, lunes, martes, miércoles

### 7.2. SEMANAL (cambio de 4.33 a 4)
- **Antes**: Se usaba 4.33 semanas por mes (52 semanas / 12 meses)
- **Ahora**: Se usa exactamente 4 semanas por mes
- **Razón**: Simplifica los cálculos y es más predecible para los usuarios
- **Impacto**: Pequeña diferencia en plazos largos, pero más consistente

### 7.3. Conversión bidireccional
- `calcularNumeroCuotas()`: meses → cuotas
- `convertirCuotasAMeses()`: cuotas → meses (inversa)
- Ambos métodos usan las mismas constantes de conversión

---

## 8. Compatibilidad con Código Existente

### 8.1. Endpoints afectados:
- `POST /api/solicitudes/calcular-plan-pago` - Cálculo de previsualización
- `POST /api/solicitudes` - Creación de solicitud (validación de parámetros)
- `GET /api/solicitudes/:id/con-plan-pago` - Consulta con plan de pago

### 8.2. Sin cambios en:
- Entidades de base de datos
- DTOs de creación/actualización de solicitudes
- Flujo de aprobación de solicitudes
- Generación de préstamos y desembolsos

---

## 9. Próximos Pasos (Recomendaciones)

### 9.1. Testing
1. Ejecutar las pruebas del archivo `test-nuevo-calculo-plan-pago.http`
2. Verificar que los resultados coincidan con lo esperado
3. Probar casos de borde (plazos muy cortos y muy largos)

### 9.2. Frontend
1. Actualizar las etiquetas de los formularios:
   - DIARIO: "Plazo (días)"
   - Otros: "Plazo (meses)"
2. Agregar tooltips explicativos con la regla de conversión
3. Mostrar el número de cuotas calculado en tiempo real

### 9.3. Documentación de usuario
1. Actualizar el manual de usuario con la nueva lógica
2. Agregar ejemplos visuales de conversión
3. Explicar el caso especial de DIARIO

---

## 10. Contacto

Para cualquier duda o problema con los cambios implementados:
- Revisar primero el archivo `test-nuevo-calculo-plan-pago.http`
- Consultar la documentación actualizada en los DTOs
- Verificar los logs de consola en CalculoInteresService (tiene logs detallados)

---

**Fecha de implementación:** 2026-01-31
**Archivos modificados:** 4
- `calculo-interes.service.ts` (2 métodos)
- `solicitud.service.ts` (1 método)
- `calcular-plan-pago.dto.ts` (documentación)
- `tipo-credito.service.ts` (1 método)

**Archivos creados:** 2
- `RESUMEN_AJUSTE_CALCULO_PLAN_PAGOS.md` (este documento)
- `test-nuevo-calculo-plan-pago.http` (pruebas HTTP)
