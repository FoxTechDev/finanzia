# Modificaciones al Formulario de Clientes

## Resumen de Cambios

Se han agregado tres nuevas secciones al formulario de registro/edición de clientes en Angular:

1. **Información adicional de vivienda** (en la sección de Dirección)
2. **Detalle de Ingresos y Gastos** (nuevo paso en el stepper)
3. **Dependencias Familiares** (tabla editable en el paso de Ingresos y Gastos)

---

## 1. Información de Vivienda (Paso 2: Dirección)

### Campos Agregados:

- **Tipo de Vivienda**: Select con opciones
  - PROPIA
  - ALQUILADA
  - FAMILIAR
  - PRESTADA
  - OTRA
  - Campo requerido

- **Monto de Alquiler**: Number (USD)
  - Se muestra solo si el tipo es "ALQUILADA"
  - Validación dinámica: se vuelve requerido cuando tipo = ALQUILADA
  - Validación: mínimo 0

- **Años de Residencia**: Number
  - Validación: mínimo 0

- **Meses de Residencia**: Number
  - Validación: mínimo 0, máximo 11
  - Hint: "0-11 meses"

### Características Implementadas:

- Validación dinámica: el campo "Monto de Alquiler" se muestra/oculta según el tipo de vivienda seleccionado
- Responsive: se adapta a móvil, tablet y desktop

---

## 2. Detalle de Ingresos y Gastos (Nuevo Paso 4)

### Sección: Ingresos Adicionales

- **Ingresos Adicionales**: Number (USD)
  - Hint: "Ingresos fuera del empleo principal"
  - Validación: mínimo 0

- **Descripción de Ingresos Adicionales**: Text
  - Hint: "Ej: Ventas por cuenta propia, alquileres, etc."
  - Máximo 200 caracteres

### Sección: Gastos Mensuales

Todos los campos son type="number" con prefijo "$" y validación mínimo 0:

- **Gastos de Vivienda**
  - Hint: "Alquiler, hipoteca, mantenimiento"

- **Gastos de Alimentación**

- **Gastos de Transporte**
  - Hint: "Combustible, pasajes, mantenimiento"

- **Gastos de Servicios Básicos**
  - Hint: "Agua, luz, teléfono, internet"

- **Gastos de Educación**
  - Hint: "Colegiaturas, útiles, uniformes"

- **Gastos Médicos**
  - Hint: "Medicinas, consultas, seguros"

- **Otros Gastos**

### Sección: Resumen Financiero

Se muestran dos tarjetas (cards) con cálculos automáticos:

#### Tarjeta 1: Total de Gastos
- Cálculo automático: suma de todos los gastos
- Color rojo
- Formato: $X,XXX.XX

#### Tarjeta 2: Ingreso Disponible
- Fórmula: Ingreso Mensual + Ingresos Adicionales - Total Gastos
- Color verde si es positivo, rojo si es negativo
- Muestra la fórmula debajo del monto
- Formato: $X,XXX.XX

### Características Implementadas:

- **Computed signals**: Los cálculos se actualizan en tiempo real al modificar cualquier valor
- **Validaciones**: Todos los campos numéricos validan mínimo 0
- **UX**: Hints contextuales para guiar al usuario
- **Responsive**: Grid adaptativo para móvil y desktop

---

## 3. Dependencias Familiares (Tabla Editable)

### Ubicación
Dentro del Paso 4 (Ingresos y Gastos), después del Resumen Financiero

### Campos por Dependiente:

- **Nombre**: Text
  - Requerido
  - Máximo 100 caracteres

- **Parentesco**: Select
  - Opciones: Hijo/a, Cónyuge, Padre/Madre, Hermano/a, Abuelo/a, Nieto/a, Otro
  - Requerido

- **Edad**: Number
  - Requerido
  - Validación: mínimo 0, máximo 120

- **¿Trabaja?**: Checkbox (boolean)

- **¿Estudia?**: Checkbox (boolean)

- **Observaciones**: Textarea
  - Máximo 200 caracteres
  - Solo visible en vista móvil (cards)

### Funcionalidad:

- **Agregar Dependiente**: Botón FAB (Floating Action Button) color accent con ícono "add"
- **Eliminar Dependiente**: Botón de ícono con trash icon por cada fila/card
- **FormArray**: Implementado usando Angular Reactive Forms FormArray
- **Validaciones**: Cada dependiente se valida individualmente

### Vistas Responsive:

#### Vista Desktop (>= 768px):
- Tabla Material con columnas: Nombre, Parentesco, Edad, Trabaja, Estudia, Acciones
- Campos editables inline dentro de la tabla
- Checkboxes para Trabaja/Estudia

#### Vista Mobile (< 768px):
- Cards individuales para cada dependiente
- Layout vertical
- Grid de campos en 1 columna
- Checkboxes en fila horizontal
- Campo de observaciones visible

---

## Archivos Modificados

### 1. `cliente-form.component.ts`

#### Importaciones agregadas:
```typescript
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormArray } from '@angular/forms';
import { computed } from '@angular/core';
```

#### Propiedades agregadas:
```typescript
// Nuevas opciones
tipoViviendaOptions = ['PROPIA', 'ALQUILADA', 'FAMILIAR', 'PRESTADA', 'OTRA'];
parentescoDependienteOptions = ['Hijo/a', 'Cónyuge', 'Padre/Madre', 'Hermano/a', 'Abuelo/a', 'Nieto/a', 'Otro'];

// Nuevo formulario
ingresosGastosForm!: FormGroup;

// Columnas para tabla
displayedColumnsDependientes = ['nombre', 'parentesco', 'edad', 'trabaja', 'estudia', 'acciones'];
```

#### Métodos agregados:
```typescript
// Getter para FormArray
get dependenciasFamiliares(): FormArray

// Cálculos automáticos con computed signals
totalGastos = computed(() => { ... })
ingresoDisponible = computed(() => { ... })

// Gestión de dependientes
createDependiente(): FormGroup
agregarDependiente(): void
eliminarDependiente(index: number): void
```

#### Modificaciones en initForms():
- Campos agregados a `direccionForm`: tipoVivienda, aniosResidencia, mesesResidencia, montoAlquiler
- Suscripción a cambios en tipoVivienda para validación dinámica
- Nuevo formulario `ingresosGastosForm` con todos los campos de ingresos/gastos y FormArray

#### Modificaciones en onSubmit():
- Validación del nuevo formulario `ingresosGastosForm`
- Preparación de datos de ingresos y gastos
- Preparación de dependientes del FormArray
- Inclusión en el objeto persona

---

### 2. `cliente-form.component.html`

#### Paso 2 (Dirección) - Modificado:
- Nueva sección "Información de Vivienda"
- Campos: Tipo de Vivienda, Monto de Alquiler (condicional), Años de Residencia, Meses de Residencia
- Uso de `@if` para mostrar campo de alquiler solo cuando aplica

#### Paso 4 (Nuevo) - Ingresos y Gastos:
- Sección de Ingresos Adicionales
- Sección de Gastos Mensuales (8 campos)
- Resumen Financiero con 2 cards
- Sección de Dependencias Familiares con tabla/cards responsive

#### Características del template:
- Uso de Angular Material 18+ con sintaxis de control flow (`@if`, `@for`)
- Grid responsive (1 columna en móvil, 2 columnas en desktop)
- Hints y prefijos para mejor UX
- Validaciones con mensajes de error específicos

---

### 3. `cliente-form.component.scss`

#### Estilos agregados:

##### Resumen Financiero:
```scss
.financial-summary {
  .summary-cards { ... }
  .amount {
    &.total-gastos { color: #f44336; }
    &.positive { color: #4caf50; }
    &.negative { color: #f44336; }
  }
  .formula { ... }
}
```

##### Dependencias Familiares:
```scss
.dependencias-section {
  .dependientes-table { ... }
  .dependiente-card-mobile { ... }
  .checkboxes-row { ... }
}
```

##### Responsive:
- Grid de resumen: 1 columna en móvil, 2 en tablet+
- Tabla visible solo en >= 768px
- Cards visibles solo en < 768px

---

## Validaciones Implementadas

### Campos Requeridos:
- Tipo de Vivienda
- Monto de Alquiler (solo si tipo = ALQUILADA)
- Nombre del Dependiente
- Parentesco del Dependiente
- Edad del Dependiente

### Validaciones Numéricas:
- Todos los campos de gastos e ingresos: mínimo 0
- Meses de Residencia: mínimo 0, máximo 11
- Años de Residencia: mínimo 0
- Edad de Dependiente: mínimo 0, máximo 120

### Validaciones Dinámicas:
- Monto de Alquiler se vuelve requerido cuando Tipo de Vivienda = "ALQUILADA"
- Se limpia el valor cuando cambia a otro tipo

---

## Características de UX Implementadas

1. **Feedback Visual Inmediato**
   - Los cálculos se actualizan en tiempo real
   - Colores semánticos (verde para positivo, rojo para negativo)

2. **Hints Contextuales**
   - Todos los campos tienen hints explicativos
   - Ayudan al usuario a entender qué ingresar

3. **Validación en Tiempo Real**
   - Errores se muestran al tocar/modificar campos
   - Mensajes específicos según el tipo de error

4. **Responsive Design**
   - Mobile-first approach
   - Tablas se convierten en cards en móvil
   - Grid adaptativo

5. **Accesibilidad**
   - Labels claros
   - Iconos descriptivos
   - Estructura semántica

---

## Integración con Backend

Los nuevos datos se envían al backend en el objeto `persona` dentro del método `onSubmit()`:

```typescript
const persona = {
  ...datosPersonalesExistentes,
  direccion: {
    ...camposExistentes,
    tipoVivienda,
    aniosResidencia,
    mesesResidencia,
    montoAlquiler
  },
  ingresosGastos: {
    ingresosAdicionales,
    descripcionIngresosAdicionales,
    gastosVivienda,
    gastosAlimentacion,
    gastosTransporte,
    gastosServiciosBasicos,
    gastosEducacion,
    gastosMedicos,
    otrosGastos
  },
  dependenciasFamiliares: [
    {
      nombre,
      parentesco,
      edad,
      trabaja,
      estudia,
      observaciones
    },
    ...
  ]
}
```

### Notas para el Backend:

1. Los campos numéricos se envían como números (parseados)
2. Los campos vacíos se omiten (función `cleanEmptyValues`)
3. El array `dependenciasFamiliares` puede estar vacío si no se agregaron dependientes
4. El campo `montoAlquiler` puede ser null si el tipo de vivienda no es "ALQUILADA"

---

## Pruebas Recomendadas

1. **Validación de Tipo de Vivienda**
   - Verificar que el campo de alquiler aparece/desaparece correctamente
   - Validar que se vuelve requerido cuando tipo = ALQUILADA

2. **Cálculos Automáticos**
   - Verificar que Total de Gastos suma correctamente
   - Verificar que Ingreso Disponible calcula correctamente
   - Probar con valores negativos

3. **Dependientes**
   - Agregar múltiples dependientes
   - Validar campos requeridos
   - Eliminar dependientes
   - Verificar responsive (tabla en desktop, cards en móvil)

4. **Responsive**
   - Probar en móvil (< 600px)
   - Probar en tablet (600-959px)
   - Probar en desktop (>= 960px)

5. **Integración**
   - Crear un cliente nuevo con todos los datos
   - Editar un cliente existente
   - Verificar que los datos se persisten correctamente

---

## Estado de Compilación

✅ **Compilación exitosa**

La aplicación compila sin errores. Solo hay warnings de optimización relacionados con dependencias de terceros (canvg, core-js) que no afectan la funcionalidad.

---

## Próximos Pasos Sugeridos

1. **Backend**: Actualizar el DTO de Persona para incluir los nuevos campos
2. **Base de Datos**: Crear/modificar tablas para almacenar:
   - Campos adicionales de dirección (tipo_vivienda, anios_residencia, meses_residencia, monto_alquiler)
   - Tabla de ingresos_gastos
   - Tabla de dependencias_familiares
3. **Validaciones Backend**: Implementar validaciones del lado del servidor
4. **Pruebas**: Realizar pruebas de integración completas
5. **Documentación API**: Actualizar la documentación de la API con los nuevos endpoints/campos

---

## Contacto y Soporte

Para cualquier duda o problema con las modificaciones realizadas, revisar los archivos:

- `micro-app/frontend/src/app/features/clientes/components/cliente-form/cliente-form.component.ts`
- `micro-app/frontend/src/app/features/clientes/components/cliente-form/cliente-form.component.html`
- `micro-app/frontend/src/app/features/clientes/components/cliente-form/cliente-form.component.scss`
