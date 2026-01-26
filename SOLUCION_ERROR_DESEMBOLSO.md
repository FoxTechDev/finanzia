# Solución: Error al Generar Preview en Módulo de Desembolso

## Problema Identificado

El botón "Generar Preview" en el módulo de desembolso estaba fallando debido a que el componente Angular enviaba datos mal formateados al backend.

### Causa Raíz

En el archivo `crear-desembolso-dialog.component.ts`, las líneas 809-810 enviaban directamente los valores del formulario sin validar ni transformar:

```typescript
deducciones: this.deduccionesArray.value,
recargos: this.recargosArray.value,
```

**Problemas específicos:**
1. **Campos opcionales con valores inválidos**: Los campos `nombre` y `tipoDeduccionId`/`tipoRecargoId` no se validaban correctamente
2. **Falta de validación de lógica de negocio**: No se validaban porcentajes > 100%, valores negativos, o rangos de cuotas inválidos
3. **Datos no transformados**: El backend esperaba un formato específico pero el frontend enviaba datos crudos del formulario

## Solución Implementada

### 1. Métodos de Validación

Se agregaron dos métodos privados para validar deducciones y recargos:

- `validarDeducciones()`: Valida que cada deducción tenga o un tipo seleccionado o un nombre personalizado, y que los valores sean válidos
- `validarRecargos()`: Similar a deducciones, pero también valida rangos de cuotas (aplicaDesde/aplicaHasta)

**Validaciones implementadas:**
- Si no hay `tipoDeduccionId`, el campo `nombre` es obligatorio
- Valores deben ser >= 0
- Porcentajes no pueden ser > 100%
- Campo "Desde Cuota" debe ser >= 1
- Campo "Hasta Cuota" debe ser >= "Desde Cuota" (si no es 0)

### 2. Métodos de Transformación

Se agregaron dos métodos para transformar los datos del formulario al formato esperado por el backend:

- `transformarDeducciones()`: Convierte los datos del formulario a `DeduccionDesembolsoDto[]`
- `transformarRecargos()`: Convierte los datos del formulario a `RecargoDesembolsoDto[]`

**Transformaciones aplicadas:**
- Solo incluye `tipoDeduccionId`/`tipoRecargoId` si tienen valor
- Incluye `nombre` solo cuando no hay tipo seleccionado
- Convierte valores a `Number` explícitamente
- Aplica valores por defecto para campos opcionales (aplicaDesde: 1, aplicaHasta: 0)

### 3. Actualización del Método `generarPreview()`

El método ahora:
1. Valida la configuración básica
2. Valida las deducciones
3. Valida los recargos
4. Transforma los datos antes de enviarlos

```typescript
const request: PreviewDesembolsoRequest = {
  solicitudId: this.data.solicitud.id,
  periodicidadPago: this.configForm.get('periodicidadPago')?.value,
  tipoInteres: this.configForm.get('tipoInteres')?.value,
  fechaPrimeraCuota: fechaStr,
  deducciones: this.transformarDeducciones(), // <- Transformado
  recargos: this.transformarRecargos(),       // <- Transformado
};
```

### 4. Actualización del Método `confirmarDesembolso()`

Se aplicó el mismo patrón de transformación para mantener consistencia.

### 5. Mejoras en Validaciones del Formulario

Se actualizaron los métodos `addDeduccion()` y `addRecargo()`:

**Deducciones:**
- Agregado validador `Validators.max(100)` para el campo valor
- Validador condicional: si no hay `tipoDeduccionId`, `nombre` es requerido

**Recargos:**
- Agregado validador `Validators.min(1)` para `aplicaDesde`
- Validador condicional: si no hay `tipoRecargoId`, `nombre` es requerido

### 6. Mejoras en el Template

Se agregaron mensajes de error visuales en los campos del formulario:

**Para Deducciones:**
```html
@if (deduccion.get('nombre')?.invalid && deduccion.get('nombre')?.touched) {
  <mat-error>El nombre es requerido</mat-error>
}

@if (deduccion.get('valor')?.invalid && deduccion.get('valor')?.touched) {
  <mat-error>
    @if (deduccion.get('valor')?.hasError('required')) {
      El valor es requerido
    }
    @if (deduccion.get('valor')?.hasError('min')) {
      El valor debe ser mayor o igual a 0
    }
    @if (deduccion.get('valor')?.hasError('max')) {
      El porcentaje no puede ser mayor a 100%
    }
  </mat-error>
}
```

**Para Recargos:**
- Mensajes similares adaptados a los campos de recargo
- Validación visual del campo "Desde Cuota"

### 7. Importaciones Actualizadas

Se agregaron las interfaces necesarias:
```typescript
import {
  // ... otras importaciones
  DeduccionDesembolsoDto,
  RecargoDesembolsoDto,
} from '@core/models/credito.model';
```

## Archivos Modificados

- `micro-app/frontend/src/app/features/creditos/components/desembolso/crear-desembolso-dialog/crear-desembolso-dialog.component.ts`

## Beneficios de la Solución

1. **Prevención de errores**: Las validaciones impiden enviar datos inválidos al backend
2. **Feedback claro al usuario**: Mensajes de error específicos indican qué está mal
3. **Código más robusto**: Separación de responsabilidades (validación, transformación, envío)
4. **Mejor experiencia de usuario**: Los errores se detectan antes de enviar al servidor
5. **Mantenibilidad**: El código es más fácil de entender y modificar

## Pruebas Recomendadas

1. Crear una deducción sin seleccionar tipo y sin ingresar nombre → debe mostrar error
2. Crear una deducción con porcentaje > 100% → debe mostrar error
3. Crear un recargo con "Hasta Cuota" < "Desde Cuota" → debe mostrar error
4. Generar preview con deducciones/recargos válidos → debe funcionar correctamente
5. Confirmar desembolso después de preview exitoso → debe crear el préstamo

## Estado

✅ **Solución implementada y compilación exitosa**

El componente compila sin errores y está listo para pruebas en el navegador.

---

**Fecha de resolución**: 2026-01-23
**Archivo de componente**: `crear-desembolso-dialog.component.ts`
**Líneas modificadas**: ~200 líneas (agregadas validaciones y transformaciones)
