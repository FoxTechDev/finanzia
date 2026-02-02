# Checklist de Implementación: Campo Número de Cuotas

## Estado: ✅ COMPLETADO

### Fecha: 2026-02-01

---

## Cambios Realizados

### ✅ 1. Modelo de Datos (Frontend)

**Archivo**: `micro-app/frontend/src/app/core/models/credito.model.ts`

- [x] Agregado campo `numeroCuotas?: number` a la interfaz `CalcularPlanPagoRequest`
- [x] Campo es opcional (`?`) ya que solo es requerido para periodicidad DIARIA

```typescript
export interface CalcularPlanPagoRequest {
  monto: number;
  plazo: number;
  tasaInteres: number;
  periodicidad: string;
  tipoInteres: string;
  fechaPrimeraCuota?: string;
  numeroCuotas?: number; // ← NUEVO CAMPO
}
```

---

### ✅ 2. Componente de Formulario

**Archivo**: `micro-app/frontend/src/app/features/creditos/components/solicitudes/solicitud-form.component.ts`

#### 2.1 FormGroup
- [x] Reemplazado campo `numeroDiasPago` por `numeroCuotas` en `condicionesForm`
- [x] Campo inicializado como string vacío

```typescript
this.condicionesForm = this.fb.group({
  periodicidadPagoId: [''],
  fechaDesdePago: [''],
  fechaHastaPago: [''],
  numeroCuotas: [''], // ← NUEVO CAMPO
  montoSolicitado: ['', [Validators.required, Validators.min(0)]],
  plazoSolicitado: ['', [Validators.required, Validators.min(1)]],
  tasaInteresPropuesta: ['', [Validators.required, Validators.min(0)]],
  tipoInteres: [TipoInteres.FLAT, Validators.required],
  fechaSolicitud: [today, Validators.required],
});
```

#### 2.2 Importaciones
- [x] Agregada importación de `CalcularPlanPagoRequest`

```typescript
import {
  // ... otras importaciones
  CalcularPlanPagoRequest,
} from '@core/models/credito.model';
```

#### 2.3 Métodos Modificados

##### `onPeriodicidadChange()`
- [x] Habilita el campo `numeroCuotas` cuando periodicidad es DIARIA
- [x] Deshabilita el campo para otras periodicidades
- [x] Establece validadores apropiados

```typescript
if (esDiario) {
  numeroCuotasControl?.setValidators([
    Validators.required,
    Validators.min(1),
    Validators.max(365)
  ]);
  numeroCuotasControl?.enable();
} else {
  numeroCuotasControl?.clearValidators();
  numeroCuotasControl?.disable();
}
```

##### `actualizarValidadoresPlazo()`
- [x] Eliminada lógica de conversión de plazo a días para DIARIA
- [x] Plazo SIEMPRE se valida en meses según tipo de crédito

```typescript
// SIEMPRE usar límites en meses del tipo de crédito
this.plazoMinimoConvertido.set(tipo.plazoMinimo);
this.plazoMaximoConvertido.set(tipo.plazoMaximo);
this.unidadPlazo.set('meses');
```

##### `actualizarHintPlazo()`
- [x] Actualizado hint para DIARIA: "Plazo en meses (el número de cuotas se ingresa abajo)"
- [x] Agregados hints para SEMESTRAL y ANUAL

```typescript
const hints: { [key: string]: string } = {
  DIARIO: 'Plazo en meses (el número de cuotas se ingresa abajo)',
  SEMANAL: 'Ejemplo: 3 meses = 12 cuotas semanales',
  QUINCENAL: 'Ejemplo: 3 meses = 6 cuotas quincenales',
  MENSUAL: 'Ejemplo: 3 meses = 3 cuotas mensuales',
  TRIMESTRAL: 'Ejemplo: 6 meses = 2 cuotas trimestrales',
  SEMESTRAL: 'Ejemplo: 12 meses = 2 cuotas semestrales',
  ANUAL: 'Ejemplo: 12 meses = 1 cuota anual',
};
```

##### `actualizarNumeroCuotas()`
- [x] Para DIARIA: lee el valor ingresado por el usuario
- [x] Para otras: calcula automáticamente y actualiza el campo
- [x] Agregadas fórmulas para SEMESTRAL y ANUAL

```typescript
switch (codigo) {
  case 'SEMANAL': cuotas = plazo * 4; break;
  case 'QUINCENAL': cuotas = plazo * 2; break;
  case 'MENSUAL': cuotas = plazo * 1; break;
  case 'TRIMESTRAL': cuotas = Math.ceil(plazo / 3); break;
  case 'SEMESTRAL': cuotas = Math.ceil(plazo / 6); break;
  case 'ANUAL': cuotas = Math.ceil(plazo / 12); break;
}

this.condicionesForm.get('numeroCuotas')?.setValue(cuotas, { emitEvent: false });
```

##### `calcularPlanPago()`
- [x] Incluye el campo `numeroCuotas` en el request al backend
- [x] Maneja conversión de `null` a `undefined` para TypeScript

```typescript
const numeroCuotasValue = this.condicionesForm.value.numeroCuotas
  ? Number(this.condicionesForm.value.numeroCuotas)
  : this.numeroCuotasEstimado();

const request: CalcularPlanPagoRequest = {
  monto: Number(this.condicionesForm.value.montoSolicitado),
  plazo: Number(this.condicionesForm.value.plazoSolicitado),
  tasaInteres: Number(this.condicionesForm.value.tasaInteresPropuesta),
  periodicidad: periodicidad.codigo,
  tipoInteres: this.condicionesForm.value.tipoInteres,
  fechaPrimeraCuota,
  numeroCuotas: numeroCuotasValue ?? undefined,
};
```

---

### ✅ 3. Template HTML

**Archivo**: `solicitud-form.component.ts` (template inline)

#### 3.1 Estructura Unificada
- [x] Eliminada la lógica condicional `@if (!mostrarCamposFechaDiaria())`
- [x] Todos los campos principales ahora se muestran siempre
- [x] Layout consistente para todas las periodicidades

#### 3.2 Campo Número de Cuotas
- [x] Ubicado después de la tasa de interés
- [x] Icono: `calculate`
- [x] Validaciones:
  - [x] Required (solo para DIARIA)
  - [x] Min: 1
  - [x] Max: 365 (para DIARIA), 999 (para otras)
- [x] Hints dinámicos:
  - [x] DIARIA: "Ingrese el número de pagos diarios (excluye domingos)"
  - [x] Otras: "Calculado automáticamente: X cuotas [periodicidad]"

```html
<mat-form-field appearance="outline" class="full-width">
  <mat-label>Número de Cuotas</mat-label>
  <input
    matInput
    type="number"
    formControlName="numeroCuotas"
    min="1"
    [max]="mostrarCamposFechaDiaria() ? 365 : 999"
    placeholder="Número de pagos"
  />
  <mat-icon matPrefix>calculate</mat-icon>
  @if (mostrarCamposFechaDiaria()) {
    <mat-hint>Ingrese el número de pagos diarios (excluye domingos)</mat-hint>
  } @else if (numeroCuotasEstimado() !== null) {
    <mat-hint>Calculado automáticamente: {{ numeroCuotasEstimado() }} cuotas {{ getPeriodicidadLabel() }}</mat-hint>
  }
</mat-form-field>
```

#### 3.3 Campo Plazo
- [x] Label fijo: "Plazo (meses)"
- [x] Siempre se muestra
- [x] Validaciones según tipo de crédito

```html
<mat-form-field appearance="outline" class="third-width">
  <mat-label>Plazo (meses)</mat-label>
  <input
    matInput
    type="number"
    formControlName="plazoSolicitado"
    placeholder="Ej: 3, 6, 12"
  />
  <mat-icon matPrefix>calendar_month</mat-icon>
  <mat-hint>{{ hintPlazo() }}</mat-hint>
</mat-form-field>
```

---

### ✅ 4. Eliminaciones

- [x] Campo `numeroDiasPago` eliminado del FormGroup
- [x] Lógica de sincronización entre `numeroDiasPago` y `plazoSolicitado` eliminada
- [x] Bloque condicional `@if (mostrarCamposFechaDiaria())` con campos especiales eliminado
- [x] Lógica de cambio dinámico de unidades de plazo eliminada

---

### ✅ 5. Compilación

- [x] Proyecto compila sin errores TypeScript
- [x] No hay warnings relacionados con los cambios
- [x] Build exitoso

```bash
Application bundle generation complete. [23.158 seconds]
```

---

## Documentación Generada

### ✅ Archivos de Documentación

1. [x] `RESUMEN_CAMBIOS_FORMULARIO_SOLICITUD.md`
   - Detalle completo de los cambios
   - Comparación antes/después
   - Fórmulas de cálculo
   - Beneficios

2. [x] `EJEMPLO_USO_FORMULARIO_SOLICITUD.md`
   - Escenarios de uso completos
   - Flujos de usuario
   - Validaciones en acción
   - Comparación visual

3. [x] `CHECKLIST_IMPLEMENTACION_NUMERO_CUOTAS.md` (este archivo)
   - Verificación de todos los cambios
   - Estado de implementación

---

## Pruebas Recomendadas

### 🔲 Pruebas Pendientes (Backend)

#### Backend - Endpoint `/solicitudes/calcular-plan-pago`

- [ ] Verificar que el DTO acepte el campo `numeroCuotas?: number`
- [ ] Para periodicidad DIARIA:
  - [ ] Si `numeroCuotas` está presente, usarlo directamente
  - [ ] Generar plan de pago con exactamente ese número de cuotas
  - [ ] Excluir domingos en las fechas de vencimiento
- [ ] Para otras periodicidades:
  - [ ] Si `numeroCuotas` está presente, validar que coincida con el cálculo esperado
  - [ ] Calcular número de cuotas basado en `plazo` y `periodicidad`

#### Backend - Validaciones

- [ ] Validar que `plazo` siempre está en meses
- [ ] Para DIARIA: validar que `numeroCuotas` sea entre 1 y 365
- [ ] Para otras: calcular `numeroCuotas` si no se provee

---

### 🔲 Pruebas Pendientes (Frontend)

#### Funcionalidad Básica

- [ ] **Prueba 1**: Seleccionar periodicidad MENSUAL
  - [ ] Ingresar plazo de 6 meses
  - [ ] Verificar que numeroCuotas = 6 (readonly)
  - [ ] Intentar editar el campo (debe estar deshabilitado)

- [ ] **Prueba 2**: Seleccionar periodicidad DIARIA
  - [ ] Ingresar plazo de 2 meses
  - [ ] Verificar que numeroCuotas es editable
  - [ ] Ingresar 50 cuotas
  - [ ] Calcular plan de pago
  - [ ] Verificar que el request incluye `numeroCuotas: 50`

- [ ] **Prueba 3**: Cambiar entre periodicidades
  - [ ] Iniciar con MENSUAL (6 meses, 6 cuotas calculadas)
  - [ ] Cambiar a SEMANAL
  - [ ] Verificar recalculo automático (24 cuotas)
  - [ ] Cambiar a DIARIA
  - [ ] Verificar que el campo se habilita
  - [ ] Volver a MENSUAL
  - [ ] Verificar que se deshabilita y recalcula

#### Validaciones

- [ ] **Prueba 4**: Validación de numeroCuotas en DIARIA
  - [ ] Intentar ingresar 0 cuotas → debe mostrar error "Mínimo 1 cuota"
  - [ ] Intentar ingresar 500 cuotas → debe mostrar error "Máximo 365 cuotas"
  - [ ] Dejar el campo vacío → debe mostrar error "Ingrese el número de cuotas"

- [ ] **Prueba 5**: Validación de plazo
  - [ ] Con tipo de crédito que permite 1-12 meses
  - [ ] Intentar ingresar 0 → debe mostrar error "Mínimo: 1 meses"
  - [ ] Intentar ingresar 24 → debe mostrar error "Máximo: 12 meses"

#### Cálculos

- [ ] **Prueba 6**: Verificar cálculos automáticos
  - [ ] SEMANAL: 3 meses → 12 cuotas
  - [ ] QUINCENAL: 6 meses → 12 cuotas
  - [ ] MENSUAL: 12 meses → 12 cuotas
  - [ ] TRIMESTRAL: 9 meses → 3 cuotas
  - [ ] SEMESTRAL: 12 meses → 2 cuotas
  - [ ] ANUAL: 24 meses → 2 cuotas

#### Integración con Backend

- [ ] **Prueba 7**: Calcular plan de pago DIARIA
  - [ ] Monto: $500
  - [ ] Plazo: 2 meses
  - [ ] Número de cuotas: 50
  - [ ] Tasa: 15%
  - [ ] Verificar que el plan generado tenga 50 cuotas
  - [ ] Verificar que las fechas excluyan domingos

- [ ] **Prueba 8**: Calcular plan de pago MENSUAL
  - [ ] Monto: $1000
  - [ ] Plazo: 6 meses
  - [ ] Número de cuotas: 6 (calculado)
  - [ ] Tasa: 12%
  - [ ] Verificar que el plan generado tenga 6 cuotas

#### Responsive

- [ ] **Prueba 9**: Vista móvil (< 600px)
  - [ ] Verificar que todos los campos se muestran correctamente
  - [ ] Verificar que el campo numeroCuotas ocupa 100% del ancho
  - [ ] Verificar que los hints se muestran correctamente

- [ ] **Prueba 10**: Vista tablet (600-959px)
  - [ ] Verificar layout de campos en fila
  - [ ] Verificar que los hints no se corten

#### Accesibilidad

- [ ] **Prueba 11**: Navegación por teclado
  - [ ] Tabular a través de todos los campos
  - [ ] Verificar que el campo numeroCuotas es accesible
  - [ ] Para DIARIA: verificar que se puede editar
  - [ ] Para otras: verificar que se salta (disabled)

- [ ] **Prueba 12**: Lectores de pantalla
  - [ ] Verificar que el label "Número de Cuotas" se lee correctamente
  - [ ] Verificar que los hints se anuncian
  - [ ] Verificar que los errores se anuncian

---

## Próximos Pasos

### Inmediatos
1. [ ] Verificar que el backend soporte el campo `numeroCuotas` en el DTO
2. [ ] Ejecutar pruebas funcionales del formulario
3. [ ] Realizar pruebas de integración con el backend

### Corto Plazo
4. [ ] Actualizar pruebas unitarias del componente
5. [ ] Actualizar documentación de usuario
6. [ ] Capacitar al equipo sobre los cambios

### Largo Plazo
7. [ ] Recopilar feedback de usuarios
8. [ ] Considerar mejoras adicionales basadas en uso real

---

## Notas Adicionales

### Decisiones de Diseño

1. **¿Por qué plazo siempre en meses?**
   - Consistencia: los usuarios siempre piensan en términos de "quiero un crédito a 6 meses"
   - Claridad: separar el concepto de "duración del crédito" del "número de pagos"
   - Flexibilidad: para créditos diarios, el usuario puede ajustar exactamente cuántos pagos hará

2. **¿Por qué numeroCuotas editable solo para DIARIA?**
   - Para otras periodicidades, el número de cuotas es una consecuencia matemática del plazo
   - Para DIARIA, el número de pagos puede variar (días hábiles, festivos, etc.)
   - Evita errores: el usuario no puede ingresar un valor incorrecto para periodicidades estándar

3. **¿Por qué usar Math.ceil() para TRIMESTRAL/SEMESTRAL/ANUAL?**
   - Ejemplo: 5 meses con periodicidad TRIMESTRAL
   - Sin ceil: 5 / 3 = 1.666... cuotas (no tiene sentido)
   - Con ceil: Math.ceil(5 / 3) = 2 cuotas (correcto)

### Posibles Mejoras Futuras

1. **Mostrar calendario visual** para créditos DIARIA mostrando los días de pago
2. **Permitir exclusiones personalizadas** (festivos locales, días específicos)
3. **Agregar preset de numeroCuotas comunes** para DIARIA (30, 60, 90 días)
4. **Validación adicional**: advertir si numeroCuotas es muy alto para el plazo ingresado

---

## Firma

**Implementado por**: Claude Code (Anthropic)
**Fecha**: 2026-02-01
**Versión**: 1.0
**Estado**: ✅ COMPLETADO - Pendiente de pruebas
