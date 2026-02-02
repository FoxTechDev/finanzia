# Ejemplo de Uso: Formulario de Solicitud de Crédito

## Escenario 1: Crédito con Periodicidad MENSUAL

### Datos de Entrada
- Cliente: Juan Pérez (DUI: 12345678-9)
- Tipo de Crédito: Microcrédito Personal
- Monto Solicitado: $1,000.00
- **Plazo: 6 meses**
- Tasa Propuesta: 12%
- Periodicidad: MENSUAL

### Comportamiento del Formulario

1. Usuario selecciona periodicidad "MENSUAL"
2. Campo "Número de Cuotas" se deshabilita automáticamente
3. Usuario ingresa plazo: 6 (meses)
4. Campo "Número de Cuotas" se calcula automáticamente: **6 cuotas**
5. Hint muestra: "Calculado automáticamente: 6 cuotas mensual"

### Request al Backend (Calcular Plan)
```json
{
  "monto": 1000,
  "plazo": 6,
  "tasaInteres": 12,
  "periodicidad": "MENSUAL",
  "tipoInteres": "FLAT",
  "fechaPrimeraCuota": "2026-02-15",
  "numeroCuotas": 6
}
```

### Resultado Esperado
- 6 cuotas mensuales
- Cuota aproximada: $176.67 (dependiendo del tipo de interés)

---

## Escenario 2: Crédito con Periodicidad DIARIA

### Datos de Entrada
- Cliente: María González (DUI: 98765432-1)
- Tipo de Crédito: Microcrédito Diario
- Monto Solicitado: $500.00
- **Plazo: 2 meses**
- Tasa Propuesta: 15%
- Periodicidad: DIARIA
- **Número de Cuotas (ingresado): 50**

### Comportamiento del Formulario

1. Usuario selecciona periodicidad "DIARIA"
2. Campo "Número de Cuotas" se **habilita** para edición
3. Usuario ingresa plazo: 2 (meses)
4. Hint en plazo muestra: "Plazo en meses (el número de cuotas se ingresa abajo)"
5. Usuario ingresa manualmente número de cuotas: **50**
6. Hint en número de cuotas muestra: "Ingrese el número de pagos diarios (excluye domingos)"

### Request al Backend (Calcular Plan)
```json
{
  "monto": 500,
  "plazo": 2,
  "tasaInteres": 15,
  "periodicidad": "DIARIA",
  "tipoInteres": "FLAT",
  "fechaPrimeraCuota": "2026-02-15",
  "numeroCuotas": 50
}
```

### Resultado Esperado
- 50 cuotas diarias (excluyendo domingos)
- El backend calculará las fechas de vencimiento excluyendo domingos
- Cuota aproximada: $11.25 por día (dependiendo del cálculo de interés)

---

## Escenario 3: Crédito con Periodicidad QUINCENAL

### Datos de Entrada
- Cliente: Carlos Martínez (DUI: 11223344-5)
- Tipo de Crédito: Crédito de Consumo
- Monto Solicitado: $3,000.00
- **Plazo: 12 meses**
- Tasa Propuesta: 10%
- Periodicidad: QUINCENAL

### Comportamiento del Formulario

1. Usuario selecciona periodicidad "QUINCENAL"
2. Campo "Número de Cuotas" se deshabilita automáticamente
3. Usuario ingresa plazo: 12 (meses)
4. Campo "Número de Cuotas" se calcula automáticamente: **24 cuotas**
   - Cálculo: 12 meses × 2 quincenas = 24 cuotas
5. Hint muestra: "Calculado automáticamente: 24 cuotas quincenal"

### Request al Backend (Calcular Plan)
```json
{
  "monto": 3000,
  "plazo": 12,
  "tasaInteres": 10,
  "periodicidad": "QUINCENAL",
  "tipoInteres": "AMORTIZADO",
  "fechaPrimeraCuota": "2026-03-01",
  "numeroCuotas": 24
}
```

### Resultado Esperado
- 24 cuotas quincenales
- Cuota aproximada: $137.50 (dependiendo del tipo de interés)

---

## Escenario 4: Crédito con Periodicidad TRIMESTRAL

### Datos de Entrada
- Cliente: Ana López (DUI: 55667788-9)
- Tipo de Crédito: Crédito Empresarial
- Monto Solicitado: $10,000.00
- **Plazo: 18 meses**
- Tasa Propuesta: 8%
- Periodicidad: TRIMESTRAL

### Comportamiento del Formulario

1. Usuario selecciona periodicidad "TRIMESTRAL"
2. Campo "Número de Cuotas" se deshabilita automáticamente
3. Usuario ingresa plazo: 18 (meses)
4. Campo "Número de Cuotas" se calcula automáticamente: **6 cuotas**
   - Cálculo: Math.ceil(18 / 3) = 6 cuotas
5. Hint muestra: "Calculado automáticamente: 6 cuotas trimestral"

### Request al Backend (Calcular Plan)
```json
{
  "monto": 10000,
  "plazo": 18,
  "tasaInteres": 8,
  "periodicidad": "TRIMESTRAL",
  "tipoInteres": "AMORTIZADO",
  "fechaPrimeraCuota": "2026-03-31",
  "numeroCuotas": 6
}
```

### Resultado Esperado
- 6 cuotas trimestrales
- Cuota aproximada: $1,750.00 (dependiendo del tipo de interés)

---

## Escenario 5: Cambio de Periodicidad

### Flujo de Usuario

**Paso 1**: Usuario ingresa datos iniciales
- Periodicidad: MENSUAL
- Plazo: 6 meses
- Número de Cuotas: 6 (calculado automáticamente, campo disabled)

**Paso 2**: Usuario cambia a periodicidad SEMANAL
- El campo "Número de Cuotas" se recalcula automáticamente: 24 cuotas
- Cálculo: 6 meses × 4 semanas = 24 cuotas
- Hint actualizado: "Calculado automáticamente: 24 cuotas semanal"

**Paso 3**: Usuario cambia a periodicidad DIARIA
- El campo "Número de Cuotas" se **habilita**
- El valor anterior (24) se mantiene como sugerencia
- Usuario puede editar: ingresa 60 cuotas
- Hint actualizado: "Ingrese el número de pagos diarios (excluye domingos)"

**Paso 4**: Usuario regresa a periodicidad MENSUAL
- El campo "Número de Cuotas" se **deshabilita** nuevamente
- Se recalcula automáticamente: 6 cuotas
- Hint actualizado: "Calculado automáticamente: 6 cuotas mensual"

---

## Validaciones en Acción

### Validación 1: Plazo fuera de rango
```
Tipo de Crédito: Microcrédito Personal
  - Plazo mínimo: 1 mes
  - Plazo máximo: 12 meses

Usuario intenta ingresar: 18 meses
Error mostrado: "Máximo: 12 meses"
```

### Validación 2: Número de cuotas DIARIA fuera de rango
```
Periodicidad: DIARIA

Usuario intenta ingresar: 400 cuotas
Error mostrado: "Máximo 365 cuotas"
```

### Validación 3: Campos requeridos
```
Usuario intenta calcular plan de pago sin completar todos los campos:
- Periodicidad: (no seleccionada)
- Botón "Calcular Plan de Pago": DESHABILITADO

Mensaje en snackbar: "Complete todos los campos requeridos para calcular el plan"
```

---

## Interfaz de Usuario - Estados Visuales

### Estado 1: Periodicidad NO seleccionada
```
┌─────────────────────────────────────────────┐
│ Periodicidad de Pago         [▼ Seleccione] │
├─────────────────────────────────────────────┤
│ Monto Solicitado ($)         [          ]   │
│ Plazo (meses)                [          ]   │
│ Tasa Propuesta (%)           [          ]   │
├─────────────────────────────────────────────┤
│ Número de Cuotas             [          ]   │ (DISABLED)
│ Hint: Se calculará automáticamente          │
└─────────────────────────────────────────────┘
```

### Estado 2: Periodicidad MENSUAL seleccionada
```
┌─────────────────────────────────────────────┐
│ Periodicidad de Pago         [▼ MENSUAL  ]  │
├─────────────────────────────────────────────┤
│ Monto Solicitado ($)         [ 1000.00   ]  │
│ Plazo (meses)                [    6      ]  │
│ Tasa Propuesta (%)           [   12      ]  │
├─────────────────────────────────────────────┤
│ Número de Cuotas             [    6      ]  │ (READONLY, gris)
│ Hint: Calculado automáticamente: 6 cuotas   │
│       mensual                                │
└─────────────────────────────────────────────┘
```

### Estado 3: Periodicidad DIARIA seleccionada
```
┌─────────────────────────────────────────────┐
│ Periodicidad de Pago         [▼ DIARIA   ]  │
├─────────────────────────────────────────────┤
│ Monto Solicitado ($)         [ 500.00    ]  │
│ Plazo (meses)                [    2      ]  │
│ Tasa Propuesta (%)           [   15      ]  │
├─────────────────────────────────────────────┤
│ Número de Cuotas             [   50      ]  │ (EDITABLE, blanco)
│ Hint: Ingrese el número de pagos diarios    │
│       (excluye domingos)                     │
└─────────────────────────────────────────────┘
```

---

## Flujo Completo de Solicitud

### 1. Selección de Cliente
```
┌──────────────────────────────────────────┐
│ Buscar cliente (DUI, Nombre o Apellido) │
│ [Juan Pérez                          ] │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ ✓ Cliente seleccionado               │ │
│ │ Nombre: Juan Pérez                   │ │
│ │ DUI: 12345678-9                      │ │
│ │ Teléfono: 2222-2222                  │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ [< Siguiente >]                          │
└──────────────────────────────────────────┘
```

### 2. Tipo de Crédito
```
┌──────────────────────────────────────────┐
│ Línea de Crédito    [▼ Microcrédito    ] │
│ Tipo de Crédito     [▼ Personal        ] │
│                                          │
│ ℹ Parámetros del producto               │
│ Monto:    $100.00 - $5,000.00           │
│ Plazo:    1 - 12 meses                  │
│ Tasa:     10% - 18%                     │
│ Garantía: No requerida                  │
│                                          │
│ [< Anterior] [Siguiente >]              │
└──────────────────────────────────────────┘
```

### 3. Condiciones (NUEVA ESTRUCTURA)
```
┌──────────────────────────────────────────┐
│ Periodicidad de Pago [▼ MENSUAL       ] │
│                                          │
│ Monto Solicitado ($) [ 1000.00         ] │
│ Plazo (meses)        [    6            ] │
│ Tasa Propuesta (%)   [   12            ] │
│                                          │
│ Número de Cuotas     [    6            ] │
│ Hint: Calculado automáticamente: 6      │
│       cuotas mensual                     │
│                                          │
│ Tipo de Interés      [▼ FLAT          ] │
│ Fecha de Solicitud   [ 2026-02-01      ] │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │  [🧮 Calcular Cuota y Plan de Pago]│  │
│ └────────────────────────────────────┘  │
│                                          │
│ [< Anterior] [Guardar y Continuar >]    │
└──────────────────────────────────────────┘
```

---

## Comparación: Antes vs Después

### ANTES (Periodicidad DIARIA)
```
Campo: "Número de Días de Pago"
Valor ingresado: 60 días
Plazo calculado internamente: 60 días
Problema: Confusión entre plazo y número de pagos
```

### DESPUÉS (Periodicidad DIARIA)
```
Campo 1: "Plazo (meses)"
Valor: 2 meses

Campo 2: "Número de Cuotas"
Valor: 50 cuotas (ingresado por usuario)

Claridad: El usuario sabe que el crédito dura 2 meses
          y se pagará en 50 cuotas diarias
```

---

## Beneficios para el Usuario Final

1. **Consistencia**: Siempre ingresa el plazo en la misma unidad
2. **Claridad**: Entiende la diferencia entre duración del crédito y número de pagos
3. **Flexibilidad**: Para créditos diarios, puede ajustar exactamente cuántos pagos hará
4. **Feedback inmediato**: Los hints le muestran el resultado del cálculo
5. **Prevención de errores**: Validaciones claras en cada campo

---

## Notas Técnicas

### Lógica de Habilitación del Campo numeroCuotas
```typescript
if (periodicidad.codigo === 'DIARIO') {
  numeroCuotasControl?.enable();
  numeroCuotasControl?.setValidators([
    Validators.required,
    Validators.min(1),
    Validators.max(365)
  ]);
} else {
  numeroCuotasControl?.disable();
  numeroCuotasControl?.clearValidators();
  // Se calcula automáticamente
}
```

### Cálculo Automático de Cuotas
```typescript
switch (codigo) {
  case 'SEMANAL':
    cuotas = plazo * 4;
    break;
  case 'QUINCENAL':
    cuotas = plazo * 2;
    break;
  case 'MENSUAL':
    cuotas = plazo * 1;
    break;
  case 'TRIMESTRAL':
    cuotas = Math.ceil(plazo / 3);
    break;
  case 'SEMESTRAL':
    cuotas = Math.ceil(plazo / 6);
    break;
  case 'ANUAL':
    cuotas = Math.ceil(plazo / 12);
    break;
}
```

### Inclusión en Request al Backend
```typescript
const numeroCuotas = this.condicionesForm.value.numeroCuotas
  ? Number(this.condicionesForm.value.numeroCuotas)
  : this.numeroCuotasEstimado();

const request = {
  monto: Number(this.condicionesForm.value.montoSolicitado),
  plazo: Number(this.condicionesForm.value.plazoSolicitado),
  tasaInteres: Number(this.condicionesForm.value.tasaInteresPropuesta),
  periodicidad: periodicidad.codigo,
  tipoInteres: this.condicionesForm.value.tipoInteres,
  fechaPrimeraCuota,
  numeroCuotas, // ← NUEVO CAMPO
};
```
