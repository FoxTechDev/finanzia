# Modificación del Formulario de Solicitud de Crédito - Periodicidad DIARIA

## Objetivo
Modificar el formulario de solicitud de crédito para que cuando se seleccione la periodicidad de pago **DIARIA**, en lugar de mostrar campos de fecha (rango de fechas), se muestre un campo numérico de **"Número de Días de Pago"**.

## Cambios Realizados

### 1. Archivo Modificado
**Ruta:** `micro-app/frontend/src/app/features/creditos/components/solicitudes/solicitud-form.component.ts`

### 2. Modificaciones en el FormGroup

#### 2.1 Nuevo Campo en el Formulario
Se agregó el campo `numeroDiasPago` al `condicionesForm`:

```typescript
this.condicionesForm = this.fb.group({
  periodicidadPagoId: [''],
  fechaDesdePago: [''],
  fechaHastaPago: [''],
  numeroDiasPago: [''], // ✅ NUEVO: Campo para periodicidad DIARIA
  montoSolicitado: ['', [Validators.required, Validators.min(0)]],
  plazoSolicitado: ['', [Validators.required, Validators.min(1)]],
  tasaInteresPropuesta: ['', [Validators.required, Validators.min(0)]],
  tipoInteres: [TipoInteres.FLAT, Validators.required],
  fechaSolicitud: [today, Validators.required],
});
```

### 3. Lógica de Sincronización

#### 3.1 Suscripción a Cambios
Se implementó un listener que sincroniza automáticamente `numeroDiasPago` con `plazoSolicitado`:

```typescript
this.condicionesForm.get('numeroDiasPago')?.valueChanges.pipe(
  takeUntil(this.destroy$)
).subscribe(dias => {
  if (this.mostrarCamposFechaDiaria() && dias > 0) {
    this.condicionesForm.patchValue({ plazoSolicitado: dias }, { emitEvent: false });
  }
});
```

#### 3.2 Función `onPeriodicidadChange()` Actualizada
Se reescribió completamente para manejar el nuevo comportamiento:

**Antes:** Mostraba campos de fecha y calculaba días hábiles automáticamente.
**Ahora:** Muestra un campo numérico simple para ingresar el número de días directamente.

```typescript
onPeriodicidadChange(periodicidadId: number): void {
  const periodicidad = this.periodicidades().find(p => p.id === periodicidadId);
  const esDiario = periodicidad?.codigo === 'DIARIO';

  this.mostrarCamposFechaDiaria.set(esDiario);

  const numeroDiasControl = this.condicionesForm.get('numeroDiasPago');
  const plazoControl = this.condicionesForm.get('plazoSolicitado');

  if (esDiario) {
    // Hacer el campo de número de días requerido
    numeroDiasControl?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(365)
    ]);

    // Si ya hay un plazo definido, copiarlo al campo de días
    const plazoActual = plazoControl?.value;
    if (plazoActual) {
      numeroDiasControl?.setValue(plazoActual, { emitEvent: false });
    }
  } else {
    // Limpiar validadores y valores del campo de número de días
    numeroDiasControl?.clearValidators();
    numeroDiasControl?.setValue('');
  }

  numeroDiasControl?.updateValueAndValidity();
  this.actualizarValidadoresPlazo();
}
```

### 4. Cambios en el Template HTML

#### 4.1 Nuevo Campo de Número de Días
Se reemplazó el bloque de campos de fecha por un único campo numérico:

**ANTES:**
```html
@if (mostrarCamposFechaDiaria()) {
  <div class="row">
    <mat-form-field appearance="outline" class="half-width">
      <mat-label>Fecha Desde</mat-label>
      <input matInput [matDatepicker]="pickerDesde" formControlName="fechaDesdePago" />
      <!-- ... -->
    </mat-form-field>
    <mat-form-field appearance="outline" class="half-width">
      <mat-label>Fecha Hasta</mat-label>
      <input matInput [matDatepicker]="pickerHasta" formControlName="fechaHastaPago" />
      <!-- ... -->
    </mat-form-field>
  </div>
}
```

**AHORA:**
```html
@if (mostrarCamposFechaDiaria()) {
  <mat-form-field appearance="outline" class="half-width">
    <mat-label>Número de Días de Pago</mat-label>
    <input
      matInput
      type="number"
      formControlName="numeroDiasPago"
      min="1"
      max="365"
      placeholder="Ej: 30, 60, 90"
    />
    <mat-icon matPrefix>event_available</mat-icon>
    @if (condicionesForm.get('numeroDiasPago')?.hasError('required')) {
      <mat-error>Ingrese el número de días</mat-error>
    }
    @if (condicionesForm.get('numeroDiasPago')?.hasError('min')) {
      <mat-error>Mínimo 1 día</mat-error>
    }
    @if (condicionesForm.get('numeroDiasPago')?.hasError('max')) {
      <mat-error>Máximo 365 días</mat-error>
    }
    <mat-hint>Cantidad total de días de pago (1-365)</mat-hint>
  </mat-form-field>
}
```

#### 4.2 Campo Plazo (Solo Lectura para DIARIO)
Se actualizó el hint del campo `plazoSolicitado`:

```html
@if (mostrarCamposFechaDiaria()) {
  <mat-hint>Calculado automáticamente del campo "Número de Días"</mat-hint>
} @else {
  <mat-hint>Ingrese el plazo en {{ unidadPlazo() }}</mat-hint>
}
```

### 5. Limpieza de Código

Se eliminaron las siguientes funciones y propiedades que ya no son necesarias:

- ❌ `calcularDiasHabiles()`: Función que calculaba días hábiles excluyendo domingos
- ❌ `calcularYActualizarDias()`: Función que calculaba y actualizaba días en el formulario
- ❌ `diasCalculados` (signal): Ya no se necesita mostrar días calculados
- ❌ Estilos CSS `.dias-calculados`: Estilos para el mensaje de días calculados

## Comportamiento Actual

### Cuando se selecciona periodicidad DIARIA:

1. ✅ Se muestra el campo **"Número de Días de Pago"**
2. ✅ El usuario ingresa directamente el número de días (ej: 30, 60, 90)
3. ✅ El campo tiene validación:
   - Requerido
   - Mínimo: 1 día
   - Máximo: 365 días
4. ✅ El valor ingresado se sincroniza automáticamente con el campo `plazoSolicitado`
5. ✅ El campo `plazoSolicitado` queda en **solo lectura** (readonly)
6. ✅ El label del plazo muestra "(días)" en lugar de "(meses)"

### Cuando se selecciona otra periodicidad:

1. ✅ El campo "Número de Días de Pago" se **oculta**
2. ✅ El campo `plazoSolicitado` vuelve a ser **editable**
3. ✅ El label del plazo muestra la unidad correcta (meses, semanas, etc.)

## Validaciones Implementadas

### Campo "Número de Días de Pago"
- **Required:** Obligatorio cuando periodicidad es DIARIA
- **Min:** 1 día
- **Max:** 365 días
- **Type:** number (solo acepta números enteros)

### Mensajes de Error
- "Ingrese el número de días" (cuando está vacío)
- "Mínimo 1 día" (cuando es menor a 1)
- "Máximo 365 días" (cuando excede 365)

## Integración con Backend

El campo `numeroDiasPago` **NO se envía al backend**. En su lugar:

- El valor ingresado se sincroniza con `plazoSolicitado`
- El backend recibe `plazoSolicitado` como siempre
- Para periodicidad DIARIA, `plazoSolicitado` representa el número de días
- El cálculo del plan de pago se realiza correctamente con esta información

## UI/UX Mejoras

### ✅ Labels Claros
- "Número de Días de Pago" es descriptivo y específico

### ✅ Placeholder Útil
- "Ej: 30, 60, 90" guía al usuario con ejemplos comunes

### ✅ Hint Text Explicativo
- "Cantidad total de días de pago (1-365)" clarifica el propósito

### ✅ Icono Apropiado
- `event_available` representa visualmente la disponibilidad de días

### ✅ Sin Etiquetas Superpuestas
- Se eliminó el componente de "Días calculados" que causaba problemas visuales

### ✅ Transición Suave
- El cambio entre periodicidades actualiza el formulario reactivamente sin parpadeos

### ✅ Responsive
- El campo usa la clase `half-width` que se adapta automáticamente a móviles

## Flujo de Usuario

### Caso de Uso: Crédito Diario de 30 días

1. Usuario selecciona cliente ✅
2. Usuario selecciona tipo de crédito ✅
3. Usuario selecciona **Periodicidad: DIARIO**
   - 👁️ Aparece campo "Número de Días de Pago"
   - 🔒 Campo "Plazo" queda readonly
4. Usuario ingresa **30** en "Número de Días de Pago"
   - ⚡ Automáticamente `plazoSolicitado` = 30
5. Usuario ingresa monto y tasa ✅
6. Usuario hace clic en **"Calcular Cuota y Plan de Pago"** ✅
7. Backend recibe:
   ```json
   {
     "monto": 1000,
     "plazo": 30,
     "tasaInteres": 15,
     "periodicidad": "DIARIO",
     "tipoInteres": "FLAT"
   }
   ```
8. Se muestra el plan de pago con 30 cuotas diarias ✅

## Testing Manual

### ✅ Verificar Cambio de Periodicidad
1. Abrir formulario de nueva solicitud
2. Seleccionar periodicidad **MENSUAL** → No debe aparecer campo de días
3. Seleccionar periodicidad **DIARIO** → Debe aparecer campo "Número de Días de Pago"
4. Volver a **MENSUAL** → Campo debe ocultarse

### ✅ Verificar Validaciones
1. Seleccionar periodicidad **DIARIO**
2. Dejar campo vacío → Error: "Ingrese el número de días"
3. Ingresar 0 → Error: "Mínimo 1 día"
4. Ingresar 400 → Error: "Máximo 365 días"
5. Ingresar 30 → ✅ Sin errores

### ✅ Verificar Sincronización
1. Seleccionar periodicidad **DIARIO**
2. Ingresar 45 en "Número de Días de Pago"
3. Verificar que campo "Plazo (días)" muestre **45** automáticamente
4. Intentar editar campo "Plazo" → Debe estar bloqueado (readonly)

### ✅ Verificar Cálculo de Plan de Pago
1. Completar formulario con periodicidad **DIARIO** y 30 días
2. Hacer clic en "Calcular Cuota y Plan de Pago"
3. Verificar que se generen **30 cuotas** en la tabla
4. Verificar que las fechas sean consecutivas (día a día)

### ✅ Verificar Edición de Solicitud Existente
1. Abrir una solicitud existente con periodicidad DIARIA
2. Campo "Número de Días de Pago" debe mostrar el valor correcto
3. Modificar el valor → Debe actualizarse el plazo
4. Guardar → Debe persistir correctamente

## Compatibilidad con Versiones Anteriores

✅ **Sin Breaking Changes:**
- Las solicitudes existentes con periodicidad DIARIA seguirán funcionando
- El backend no requiere modificaciones
- Los campos `fechaDesdePago` y `fechaHastaPago` se mantienen en el modelo pero no se usan en la UI para DIARIO
- Otras periodicidades (MENSUAL, SEMANAL, etc.) funcionan exactamente igual que antes

## Archivos NO Modificados

- ✅ `solicitud.service.ts` - No requiere cambios
- ✅ DTOs del backend - No requieren cambios
- ✅ Entidades del backend - No requieren cambios
- ✅ `credito.model.ts` - No requiere cambios

## Resumen Técnico

| Aspecto | Implementación |
|---------|---------------|
| **Campo nuevo** | `numeroDiasPago: FormControl` |
| **Validadores** | Required, Min(1), Max(365) |
| **Sincronización** | `numeroDiasPago` → `plazoSolicitado` |
| **Condición de visibilidad** | `mostrarCamposFechaDiaria()` signal |
| **Tipo de input** | `type="number"` con min/max HTML5 |
| **Responsiveness** | Clase `half-width` con media queries |
| **Accesibilidad** | Labels, hints, y errores claros |
| **Performance** | Signals y reactive forms (OnPush) |

## Conclusión

La modificación cumple con todos los requerimientos solicitados:

1. ✅ Campo de "Número de Días" para periodicidad DIARIA
2. ✅ Input numérico con validación (1-365)
3. ✅ Oculta campos de fecha cuando es DIARIO
4. ✅ Mantiene comportamiento actual para otras periodicidades
5. ✅ Transición suave al cambiar periodicidades
6. ✅ Labels claros y hint text explicativo
7. ✅ No hay etiquetas superpuestas
8. ✅ Diseño responsive
9. ✅ Código optimizado sin duplicación
10. ✅ Compatible con Angular Material y el diseño existente

---

**Fecha de Implementación:** 2026-01-31
**Versión:** 1.0.0
**Estado:** ✅ Completado
