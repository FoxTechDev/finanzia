# Implementación de Recargos en Formulario de Solicitud de Crédito

## Resumen de la Implementación

Se ha agregado la funcionalidad completa para gestionar **recargos** en el formulario de solicitud de crédito, siguiendo el mismo patrón implementado en el módulo de desembolso.

---

## Archivos Modificados

### 1. **Modelo de Datos** (`credito.model.ts`)
**Ruta:** `micro-app/frontend/src/app/core/models/credito.model.ts`

#### Cambios:
- **Nueva Interface `RecargoSolicitudDto`:**
  ```typescript
  export interface RecargoSolicitudDto {
    nombre: string;
    tipo: 'FIJO' | 'PORCENTAJE';
    valor: number;
    aplicaDesde?: number;
    aplicaHasta?: number;
  }
  ```

- **Actualización de `CalcularPlanPagoRequest`:**
  ```typescript
  export interface CalcularPlanPagoRequest {
    monto: number;
    plazo: number;
    tasaInteres: number;
    periodicidad: string;
    tipoInteres: string;
    fechaPrimeraCuota?: string;
    numeroCuotas?: number;
    recargos?: RecargoSolicitudDto[]; // ← NUEVO
  }
  ```

---

### 2. **Componente Principal** (`solicitud-form.component.ts`)
**Ruta:** `micro-app/frontend/src/app/features/creditos/components/solicitudes/solicitud-form.component.ts`

#### Imports Agregados:
```typescript
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RecargoSolicitudDto } from '@core/models/credito.model';
import { AgregarRecargoDialogComponent } from './agregar-recargo-dialog/agregar-recargo-dialog.component';
```

#### Nuevas Propiedades:
```typescript
recargos = signal<RecargoSolicitudDto[]>([]);
```

#### Métodos Agregados:

1. **`agregarRecargo()`**
   - Abre el diálogo de Angular Material para agregar un nuevo recargo
   - Actualiza el signal `recargos` con el nuevo recargo
   - Limpia el plan de pago calculado para forzar recálculo

2. **`eliminarRecargo(index: number)`**
   - Elimina un recargo por índice
   - Limpia el plan de pago calculado

3. **`tieneRecargos(): boolean`**
   - Verifica si hay recargos agregados

4. **`obtenerColumnasPlanPago(): string[]`**
   - Devuelve las columnas dinámicamente
   - Incluye la columna "recargos" solo si hay recargos agregados

#### Actualización del Método `calcularPlanPago()`:
Se agregó el envío de recargos al backend:
```typescript
const request: CalcularPlanPagoRequest = {
  // ... otros campos ...
  recargos: this.recargos().length > 0 ? this.recargos() : undefined,
};
```

---

### 3. **Template del Formulario**

#### Sección de Recargos Agregada:
Se agregó una nueva sección antes del botón "Calcular Plan de Pago" con:

- **Header con botón "Agregar Recargo"**
- **Lista de chips mostrando recargos agregados:**
  - Nombre del recargo
  - Tipo (Fijo o Porcentaje) y valor
  - Rango de aplicación (opcional)
  - Botón para eliminar
- **Mensaje cuando no hay recargos**

#### Actualización de la Tabla del Plan de Pago:
- **Nueva columna "Recargos"** que se muestra condicionalmente
- Usa `obtenerColumnasPlanPago()` en lugar de un array estático
- Muestra el monto de recargos por cuota

---

### 4. **Componente Dialog** (NUEVO)
**Ruta:** `micro-app/frontend/src/app/features/creditos/components/solicitudes/agregar-recargo-dialog/agregar-recargo-dialog.component.ts`

#### Características:
- **Formulario Reactivo con validaciones:**
  - Nombre (requerido)
  - Tipo de cálculo: Fijo o Porcentaje (requerido)
  - Valor (requerido, min: 0, max: 100 para porcentajes)
  - Desde cuota (opcional, min: 1)
  - Hasta cuota (opcional, min: 1)

- **Validación personalizada:** Valida que "Hasta Cuota" sea mayor o igual a "Desde Cuota"

- **UI/UX:**
  - Material Design con apariencia "outline"
  - Hints contextuales según el tipo de cálculo
  - Info box dinámico mostrando el rango de aplicación
  - Responsive (se adapta a móviles)
  - Prefijos con íconos en cada campo

---

## Estilos CSS Agregados

### Sección de Recargos:
```css
.recargos-section {
  margin: 24px 0;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #9c27b0;
}

.recargos-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.recargos-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recargo-chip {
  max-width: 100%;
}

.recargo-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.no-recargos-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  padding: 12px;
  background: white;
  border-radius: 4px;
}
```

---

## Flujo de Uso

### 1. Agregar Recargo
1. Usuario hace clic en "Agregar Recargo"
2. Se abre el diálogo con formulario
3. Usuario completa:
   - Nombre (ej: "Seguro de Vida")
   - Tipo: Fijo o Porcentaje
   - Valor (ej: 5.00 o 2%)
   - Opcionalmente: rango de cuotas
4. Al confirmar, el recargo se agrega como chip

### 2. Visualizar Recargos
- Los recargos se muestran como chips removibles
- Cada chip muestra: nombre, valor, y rango (si aplica)

### 3. Eliminar Recargo
- Usuario hace clic en el ícono "X" del chip
- El recargo se elimina y se limpia el plan calculado

### 4. Calcular Plan con Recargos
- Usuario hace clic en "Calcular Cuota y Plan de Pago"
- El backend recibe los recargos en el request
- El plan de pago muestra la columna "Recargos"
- Cada cuota muestra el monto de recargos aplicados

---

## Validaciones Implementadas

### En el Diálogo:
- ✅ Nombre es requerido
- ✅ Valor es requerido y debe ser >= 0
- ✅ Porcentaje no puede ser mayor a 100%
- ✅ "Desde Cuota" debe ser >= 1
- ✅ "Hasta Cuota" debe ser >= 1
- ✅ "Hasta Cuota" debe ser >= "Desde Cuota"

### En el Componente:
- ✅ No se puede calcular plan sin campos requeridos
- ✅ Al agregar/eliminar recargos, se limpia el plan calculado

---

## Ejemplo de Request al Backend

```json
{
  "monto": 1000,
  "plazo": 6,
  "tasaInteres": 12,
  "periodicidad": "MENSUAL",
  "tipoInteres": "FLAT",
  "fechaPrimeraCuota": "2026-03-01",
  "numeroCuotas": 6,
  "recargos": [
    {
      "nombre": "Seguro de Vida",
      "tipo": "PORCENTAJE",
      "valor": 2,
      "aplicaDesde": 1,
      "aplicaHasta": 6
    },
    {
      "nombre": "GPS",
      "tipo": "FIJO",
      "valor": 5.00,
      "aplicaDesde": 1
    }
  ]
}
```

---

## Ejemplo de Visualización

### Chips de Recargos:
```
┌─────────────────────────────────────────────┐
│ Seguro de Vida                          [X] │
│ 2% (Cuotas: 1 - 6)                          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ GPS                                     [X] │
│ $5.00 (Cuotas: 1 - fin)                     │
└─────────────────────────────────────────────┘
```

### Tabla del Plan de Pago:
```
┌──┬────────────┬─────────┬─────────┬──────────┬────────┬─────────┐
│# │ Fecha      │ Capital │ Interés │ Recargos │ Total  │ Saldo   │
├──┼────────────┼─────────┼─────────┼──────────┼────────┼─────────┤
│1 │ 01/03/2026 │ $166.67 │ $10.00  │ $25.33   │ $202.00│ $833.33 │
│2 │ 01/04/2026 │ $166.67 │ $10.00  │ $25.33   │ $202.00│ $666.66 │
└──┴────────────┴─────────┴─────────┴──────────┴────────┴─────────┘
```

---

## Beneficios de la Implementación

### 1. **Consistencia con Desembolso**
- Usa el mismo patrón implementado en el módulo de desembolso
- Facilita el mantenimiento y comprensión del código

### 2. **UX Mejorada**
- Diálogo Material Design en lugar de prompts nativos
- Validaciones en tiempo real
- Feedback visual inmediato
- Hints contextuales

### 3. **Responsive**
- Se adapta a móviles, tablets y desktop
- Chips que ajustan su tamaño automáticamente

### 4. **Flexibilidad**
- Recargos fijos o porcentuales
- Aplicación en rangos de cuotas personalizables
- Cantidad ilimitada de recargos

### 5. **Mantenibilidad**
- Componente separado para el diálogo
- Signals para gestión de estado reactiva
- Validaciones centralizadas

---

## Posibles Mejoras Futuras

1. **Persistencia de Recargos:**
   - Guardar recargos en la base de datos junto con la solicitud
   - Cargar recargos al editar una solicitud

2. **Catálogo de Recargos:**
   - Similar a deducciones en desembolso
   - Permitir seleccionar de recargos predefinidos

3. **Edición de Recargos:**
   - Botón para editar un recargo existente
   - Reutilizar el diálogo para edición

4. **Exportación:**
   - Incluir recargos en reportes de solicitudes
   - Mostrar en vista de detalle de solicitud

---

## Archivos Creados/Modificados

### Creados:
- ✅ `agregar-recargo-dialog.component.ts`

### Modificados:
- ✅ `credito.model.ts`
- ✅ `solicitud-form.component.ts`

### Total de Líneas Agregadas:
- **Modelo:** ~15 líneas
- **Componente Principal:** ~180 líneas
- **Diálogo:** ~280 líneas
- **Total:** ~475 líneas de código

---

## Conclusión

La implementación está completa y lista para usar. Los recargos se integran perfectamente con el flujo existente de cálculo del plan de pago, manteniendo la consistencia con el módulo de desembolso y proporcionando una excelente experiencia de usuario.
