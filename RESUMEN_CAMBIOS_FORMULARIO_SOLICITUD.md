# Resumen de Cambios: Formulario de Solicitud de Crédito

## Fecha de Implementación
2026-02-01

## Objetivo
Modificar el formulario de solicitud de crédito en Angular para estandarizar el ingreso del plazo siempre en meses y añadir un campo específico para el número de cuotas.

---

## Cambios Implementados

### 1. Campo Plazo (meses)
**Archivo**: `solicitud-form.component.ts`

#### Antes:
- Para periodicidad DIARIA: el plazo se ingresaba en días
- Para otras periodicidades: el plazo se ingresaba en meses
- El label cambiaba dinámicamente según la periodicidad

#### Después:
- **El plazo SIEMPRE se ingresa en MESES** para todas las periodicidades
- Label fijo: "Plazo (meses)"
- Validaciones: mínimo y máximo según el tipo de crédito seleccionado
- Se eliminó la lógica de conversión de unidades

### 2. Nuevo Campo: Número de Cuotas
**Ubicación**: Después del campo "Tasa Propuesta (%)" en la sección de Condiciones

#### Comportamiento:
**Para periodicidad DIARIA:**
- Campo EDITABLE por el usuario
- Validaciones:
  - Requerido
  - Mínimo: 1
  - Máximo: 365
- Hint: "Ingrese el número de pagos diarios (excluye domingos)"

**Para otras periodicidades (SEMANAL, QUINCENAL, MENSUAL, TRIMESTRAL, SEMESTRAL, ANUAL):**
- Campo READONLY (solo lectura)
- Se calcula automáticamente según la fórmula:
  - SEMANAL: plazo × 4
  - QUINCENAL: plazo × 2
  - MENSUAL: plazo × 1
  - TRIMESTRAL: Math.ceil(plazo / 3)
  - SEMESTRAL: Math.ceil(plazo / 6)
  - ANUAL: Math.ceil(plazo / 12)
- Hint dinámico: "Calculado automáticamente: X cuotas [periodicidad]"

### 3. Eliminaciones
Se eliminaron los siguientes elementos:
- Campo `numeroDiasPago` (reemplazado por `numeroCuotas`)
- Lógica de cambio dinámico del label de plazo
- Validadores específicos para plazo en días
- Secciones condicionales del template HTML que mostraban diferentes layouts según periodicidad

### 4. Template HTML
**Estructura anterior**: Layout condicional con campos diferentes según periodicidad

**Estructura actual**: Layout unificado con campos consistentes:
```html
1. Periodicidad de Pago (select)
2. Monto Solicitado ($)
3. Plazo (meses)
4. Tasa Propuesta (%)
5. Número de Cuotas (editable/readonly según periodicidad)
6. Tipo de Interés (select)
7. Fecha de Solicitud (date)
```

### 5. Integración con Backend
Se actualizó la interfaz `CalcularPlanPagoRequest` en `credito.model.ts`:

```typescript
export interface CalcularPlanPagoRequest {
  monto: number;
  plazo: number;
  tasaInteres: number;
  periodicidad: string;
  tipoInteres: string;
  fechaPrimeraCuota?: string;
  numeroCuotas?: number; // NUEVO CAMPO
}
```

Al calcular el plan de pago, se incluye el campo `numeroCuotas`:
- Para DIARIA: valor ingresado por el usuario
- Para otras periodicidades: valor calculado automáticamente

---

## Funciones Modificadas

### `onPeriodicidadChange(periodicidadId: number)`
**Antes**: Configuraba validadores de plazo en días para DIARIA

**Después**:
- Configura el campo `numeroCuotas` como editable (DIARIA) o readonly (otras)
- Establece validadores apropiados
- Mantiene el plazo siempre en meses

### `actualizarValidadoresPlazo()`
**Antes**: Convertía límites de plazo según periodicidad

**Después**:
- Siempre usa límites en meses del tipo de crédito
- Elimina lógica de conversión de unidades

### `actualizarNumeroCuotas()`
**Antes**: Calculaba cuotas estimadas para mostrar información

**Después**:
- Para DIARIA: lee el valor ingresado por el usuario
- Para otras: calcula automáticamente y actualiza el campo `numeroCuotas`
- Actualiza el signal `numeroCuotasEstimado()` para el hint

### `calcularPlanPago()`
**Modificación**: Incluye el campo `numeroCuotas` en el request al backend

```typescript
const numeroCuotas = this.condicionesForm.value.numeroCuotas
  ? Number(this.condicionesForm.value.numeroCuotas)
  : this.numeroCuotasEstimado();

const request = {
  // ... otros campos
  numeroCuotas,
};
```

---

## Fórmulas de Cálculo

### Número de Cuotas Automático

| Periodicidad | Fórmula | Ejemplo (6 meses) |
|--------------|---------|-------------------|
| SEMANAL | plazo × 4 | 6 × 4 = 24 cuotas |
| QUINCENAL | plazo × 2 | 6 × 2 = 12 cuotas |
| MENSUAL | plazo × 1 | 6 × 1 = 6 cuotas |
| TRIMESTRAL | Math.ceil(plazo / 3) | Math.ceil(6 / 3) = 2 cuotas |
| SEMESTRAL | Math.ceil(plazo / 6) | Math.ceil(6 / 6) = 1 cuota |
| ANUAL | Math.ceil(plazo / 12) | Math.ceil(6 / 12) = 1 cuota |
| DIARIA | Ingresado por usuario | Usuario decide |

---

## Hints Dinámicos

### Campo Plazo (meses)
- DIARIA: "Plazo en meses (el número de cuotas se ingresa abajo)"
- SEMANAL: "Ejemplo: 3 meses = 12 cuotas semanales"
- QUINCENAL: "Ejemplo: 3 meses = 6 cuotas quincenales"
- MENSUAL: "Ejemplo: 3 meses = 3 cuotas mensuales"
- TRIMESTRAL: "Ejemplo: 6 meses = 2 cuotas trimestrales"
- SEMESTRAL: "Ejemplo: 12 meses = 2 cuotas semestrales"
- ANUAL: "Ejemplo: 12 meses = 1 cuota anual"

### Campo Número de Cuotas
- DIARIA: "Ingrese el número de pagos diarios (excluye domingos)"
- Otras: "Calculado automáticamente: [N] cuotas [periodicidad]"

---

## Beneficios de los Cambios

1. **Consistencia**: El plazo siempre se ingresa en la misma unidad (meses)
2. **Claridad**: El usuario entiende claramente que el plazo es el tiempo total del crédito
3. **Flexibilidad**: Para créditos diarios, el usuario puede especificar exactamente cuántos pagos habrá
4. **Precisión**: El cálculo automático de cuotas elimina errores de conversión
5. **UX mejorada**: Hints dinámicos guían al usuario en cada campo
6. **Mantenibilidad**: Código más simple sin lógica condicional compleja

---

## Testing Recomendado

### Casos de Prueba

1. **Periodicidad DIARIA**
   - Verificar que el campo "Número de Cuotas" sea editable
   - Ingresar plazo en meses (ej: 3)
   - Ingresar número de cuotas (ej: 60 días)
   - Calcular plan de pago
   - Verificar que el backend reciba `numeroCuotas: 60`

2. **Periodicidad SEMANAL**
   - Verificar que el campo "Número de Cuotas" sea readonly
   - Ingresar plazo de 3 meses
   - Verificar que se calcule automáticamente: 12 cuotas
   - Calcular plan de pago
   - Verificar que el backend reciba `numeroCuotas: 12`

3. **Periodicidad MENSUAL**
   - Ingresar plazo de 6 meses
   - Verificar cálculo automático: 6 cuotas
   - Calcular plan de pago

4. **Cambio de Periodicidad**
   - Ingresar datos con periodicidad MENSUAL
   - Cambiar a DIARIA
   - Verificar que el campo numeroCuotas se habilite
   - Cambiar a QUINCENAL
   - Verificar que el campo se deshabilite y se recalcule

5. **Validaciones**
   - DIARIA: Intentar ingresar numeroCuotas > 365 (debe mostrar error)
   - Todas: Intentar ingresar plazo fuera de los límites del tipo de crédito

---

## Archivos Modificados

1. `micro-app/frontend/src/app/features/creditos/components/solicitudes/solicitud-form.component.ts`
   - Template HTML (inline)
   - Lógica TypeScript
   - FormGroup condicionesForm
   - Métodos de cálculo y validación

2. `micro-app/frontend/src/app/core/models/credito.model.ts`
   - Interface `CalcularPlanPagoRequest`

---

## Compatibilidad con Backend

El backend debe estar preparado para recibir:
- `plazo`: SIEMPRE en meses
- `numeroCuotas`: Número específico de cuotas
  - Para DIARIA: lo usa directamente
  - Para otras: puede recalcularlo o usar el valor enviado

**Nota**: Verificar que el endpoint `/solicitudes/calcular-plan-pago` del backend soporte el campo `numeroCuotas` en el DTO.

---

## Próximos Pasos

1. Verificar que el backend procese correctamente el campo `numeroCuotas`
2. Probar la integración completa con diferentes tipos de crédito
3. Validar el cálculo de plan de pago para periodicidad DIARIA
4. Actualizar documentación de usuario si es necesario
5. Realizar pruebas de regresión en flujos existentes
