# Sistema de Catálogos

Este documento describe la implementación del sistema de catálogos genérico para la aplicación.

## Descripción General

El sistema de catálogos proporciona una solución reutilizable y escalable para gestionar catálogos de valores del sistema (estados, tipos, categorías, etc.) que anteriormente eran enums hardcodeados en el backend.

## Arquitectura

### Estructura de Archivos

```
src/app/
├── core/
│   └── models/
│       └── catalogo.model.ts          # Interfaces y tipos base
├── features/
│   └── catalogos/
│       ├── components/
│       │   ├── catalogo-lista/        # Componente genérico de lista
│       │   ├── catalogo-form-dialog/  # Componente genérico de formulario
│       │   ├── estado-garantia/       # Componentes específicos (14 catálogos)
│       │   ├── recomendacion-asesor/
│       │   ├── tipo-decision-comite/
│       │   ├── tipo-pago/
│       │   ├── estado-pago/
│       │   ├── sexo/
│       │   ├── estado-solicitud/
│       │   ├── destino-credito/
│       │   ├── estado-cuota/
│       │   ├── tipo-interes/
│       │   ├── periodicidad-pago/
│       │   ├── estado-prestamo/
│       │   ├── categoria-ncb022/
│       │   └── tipo-calculo/
│       ├── services/
│       │   ├── catalogo-base.service.ts    # Servicio genérico CRUD
│       │   └── catalogos.service.ts        # Servicio de conveniencia
│       └── catalogos.routes.ts             # Rutas del módulo
```

## Componentes

### 1. Modelo de Datos (`catalogo.model.ts`)

```typescript
interface CatalogoBase {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  orden?: number;
}

interface CatalogoConfig {
  titulo: string;
  tituloDiálogo: string;
  endpoint: string;
  icono: string;
}
```

### 2. Servicio Base (`catalogo-base.service.ts`)

Proporciona operaciones CRUD genéricas:

- `getAll(endpoint)` - Obtener todos los registros
- `getActivos(endpoint)` - Obtener solo registros activos
- `getById(endpoint, id)` - Obtener un registro por ID
- `create(endpoint, data)` - Crear nuevo registro
- `update(endpoint, id, data)` - Actualizar registro
- `delete(endpoint, id)` - Eliminar registro
- `toggleActivo(endpoint, id, activo)` - Cambiar estado activo/inactivo

### 3. Componente de Lista (`catalogo-lista.component.ts`)

Componente genérico reutilizable que proporciona:

**Funcionalidades:**
- Tabla con paginación (5, 10, 25, 50 registros por página)
- Ordenamiento por todas las columnas
- Búsqueda/filtrado en tiempo real
- Indicadores visuales de estado (activo/inactivo)
- Acciones: Crear, Editar, Activar/Desactivar, Eliminar

**Columnas:**
- Código
- Nombre
- Descripción
- Estado (chip visual)
- Orden
- Acciones

**Responsive:**
- Desktop: Todas las columnas visibles
- Tablet: Oculta columna de descripción
- Móvil: Muestra solo código, nombre, estado y acciones

### 4. Componente de Formulario (`catalogo-form-dialog.component.ts`)

Diálogo modal para crear/editar registros:

**Campos:**
- Código (requerido, max 50 caracteres)
- Nombre (requerido, max 100 caracteres)
- Descripción (opcional, max 500 caracteres)
- Orden (opcional, numérico 0-9999)
- Activo (toggle)

**Validaciones:**
- Campos requeridos
- Límites de caracteres
- Valores numéricos válidos
- Confirmación antes de cerrar con cambios sin guardar

**UX:**
- Indicadores de caracteres restantes
- Mensajes de error específicos
- Estado de carga durante guardado
- Responsive (adaptado a móviles)

## Catálogos Implementados

| Catálogo | Endpoint | Icono | Uso Principal |
|----------|----------|-------|---------------|
| Estados de Garantía | `catalogos/estado-garantia` | shield | Gestión de garantías |
| Recomendaciones Asesor | `catalogos/recomendacion-asesor` | recommend | Evaluación de solicitudes |
| Tipos Decisión Comité | `catalogos/tipo-decision-comite` | gavel | Comité de crédito |
| Tipos de Pago | `catalogos/tipo-pago` | payment | Registro de pagos |
| Estados de Pago | `catalogos/estado-pago` | receipt | Consulta de pagos |
| Género/Sexo | `catalogos/sexo` | wc | Datos de clientes |
| Estados de Solicitud | `catalogos/estado-solicitud` | assignment | Solicitudes de crédito |
| Destinos de Crédito | `catalogos/destino-credito` | trending_up | Solicitudes de crédito |
| Estados de Cuota | `catalogos/estado-cuota` | event_note | Plan de pagos |
| Tipos de Interés | `catalogos/tipo-interes` | percent | Configuración préstamos |
| Periodicidad de Pago | `catalogos/periodicidad-pago` | calendar_month | Configuración préstamos |
| Estados de Préstamo | `catalogos/estado-prestamo` | account_balance_wallet | Gestión de préstamos |
| Categorías NCB-022 | `catalogos/categoria-ncb022` | category | Clasificación préstamos |
| Tipos de Cálculo | `catalogos/tipo-calculo` | calculate | Configuración préstamos |

## Menú de Navegación

Los catálogos están organizados en el menú lateral en grupos:

**Catálogos**
- **Ubicaciones**
  - Departamentos
  - Municipios
  - Distritos

- **Créditos y Préstamos**
  - Estados de Solicitud
  - Recomendaciones Asesor
  - Decisiones Comité
  - Destinos de Crédito
  - Estados de Préstamo
  - Tipos de Interés
  - Tipos de Cálculo

- **Pagos y Cuotas**
  - Tipos de Pago
  - Estados de Pago
  - Estados de Cuota
  - Periodicidad de Pago

- **Generales**
  - Estados de Garantía
  - Categorías NCB-022
  - Género/Sexo

## Uso en Formularios

### Importación

```typescript
import { CatalogosService } from '@features/catalogos/services/catalogos.service';
import { CatalogoBase } from '@core/models/catalogo.model';
```

### En el Componente

```typescript
export class MiFormularioComponent implements OnInit {
  private catalogosService = inject(CatalogosService);

  tiposPago = signal<CatalogoBase[]>([]);

  ngOnInit(): void {
    this.loadCatalogos();
  }

  private loadCatalogos(): void {
    this.catalogosService.getTiposPago().subscribe({
      next: (data) => this.tiposPago.set(data),
      error: (error) => console.error('Error:', error)
    });
  }
}
```

### En el Template

```html
<mat-select formControlName="tipoPago">
  @for (tipo of tiposPago(); track tipo.id) {
    <mat-option [value]="tipo.codigo">
      {{ tipo.nombre }}
    </mat-option>
  }
</mat-select>
```

## Características Técnicas

### Performance
- Lazy loading de módulos
- Paginación en cliente (optimizado para catálogos pequeños-medianos)
- Signals de Angular para reactividad eficiente
- Componentes standalone para mejor tree-shaking

### Accesibilidad
- Navegación completa por teclado
- ARIA labels apropiados
- Indicadores visuales claros
- Tooltips descriptivos

### Responsive Design
- Mobile-first approach
- Breakpoints: xs (< 600px), sm (600-959px), md (960-1279px), lg (1280-1919px), xl (>= 1920px)
- FAB flotante en móviles
- Tablas con scroll horizontal en pantallas pequeñas
- Columnas que se ocultan progresivamente según tamaño de pantalla

### UX
- Búsqueda instantánea sin necesidad de botón
- Estados vacíos informativos
- Mensajes de error claros
- Confirmaciones antes de acciones destructivas
- Indicadores de carga
- Feedback visual inmediato

## Extensión del Sistema

### Agregar un Nuevo Catálogo

1. **Crear el componente específico:**

```typescript
// nuevo-catalogo.component.ts
import { Component } from '@angular/core';
import { CatalogoListaComponent } from '../catalogo-lista/catalogo-lista.component';
import { CatalogoConfig } from '@core/models/catalogo.model';

@Component({
  selector: 'app-nuevo-catalogo',
  standalone: true,
  imports: [CatalogoListaComponent],
  template: `<app-catalogo-lista [config]="config"></app-catalogo-lista>`,
})
export class NuevoCatalogoComponent {
  config: CatalogoConfig = {
    titulo: 'Mi Nuevo Catálogo',
    tituloDiálogo: 'Registro del Catálogo',
    endpoint: 'catalogos/nuevo-catalogo',
    icono: 'star',
  };
}
```

2. **Agregar la ruta en `catalogos.routes.ts`:**

```typescript
{
  path: 'nuevo-catalogo',
  loadComponent: () =>
    import('./components/nuevo-catalogo/nuevo-catalogo.component').then(
      (m) => m.NuevoCatalogoComponent
    ),
}
```

3. **Agregar al menú en `main-layout.component.html`:**

```html
<a mat-list-item routerLink="/catalogos/nuevo-catalogo" routerLinkActive="active">
  <mat-icon matListItemIcon>star</mat-icon>
  <span matListItemTitle>Mi Nuevo Catálogo</span>
</a>
```

4. **Agregar método en `catalogos.service.ts` (opcional):**

```typescript
getNuevoCatalogo(soloActivos = true): Observable<CatalogoBase[]> {
  return soloActivos
    ? this.catalogoService.getActivos('catalogos/nuevo-catalogo')
    : this.catalogoService.getAll('catalogos/nuevo-catalogo');
}
```

## Consideraciones de Backend

### Endpoints Esperados

Cada catálogo debe implementar los siguientes endpoints:

```
GET    /api/catalogos/{nombre-catalogo}           # Obtener todos
GET    /api/catalogos/{nombre-catalogo}?activo=true  # Obtener activos
GET    /api/catalogos/{nombre-catalogo}/:id       # Obtener por ID
POST   /api/catalogos/{nombre-catalogo}           # Crear
PATCH  /api/catalogos/{nombre-catalogo}/:id       # Actualizar
DELETE /api/catalogos/{nombre-catalogo}/:id       # Eliminar
```

### Estructura de Datos

```json
{
  "id": 1,
  "codigo": "EST001",
  "nombre": "Activo",
  "descripcion": "Estado activo del registro",
  "activo": true,
  "orden": 1
}
```

### Validaciones Backend Recomendadas

- Código único por catálogo
- Nombres no duplicados
- Orden numérico válido
- Descripción opcional
- No permitir eliminar registros en uso (referential integrity)

## Mantenimiento

### Actualizar Componentes Genéricos

Los componentes `catalogo-lista` y `catalogo-form-dialog` son compartidos por todos los catálogos. Cualquier mejora en estos componentes beneficia automáticamente a todos los catálogos.

### Testing

Para probar un catálogo:

1. Verificar que el endpoint del backend esté funcionando
2. Navegar a la vista del catálogo en el menú
3. Probar búsqueda y filtrado
4. Crear un nuevo registro
5. Editar un registro existente
6. Activar/desactivar un registro
7. Verificar ordenamiento
8. Probar paginación
9. Verificar responsive en diferentes tamaños de pantalla

## Troubleshooting

### Problema: Catálogo no carga datos

**Solución:**
1. Verificar que el endpoint del backend esté disponible
2. Revisar la consola del navegador para errores HTTP
3. Verificar que la URL del API en `environment.ts` sea correcta

### Problema: No se pueden guardar cambios

**Solución:**
1. Verificar validaciones del formulario
2. Revisar errores en la respuesta del backend
3. Verificar que el usuario tenga permisos

### Problema: El menú no muestra el catálogo

**Solución:**
1. Verificar que la ruta esté agregada en `catalogos.routes.ts`
2. Verificar que el link esté en `main-layout.component.html`
3. Limpiar caché del navegador

## Próximas Mejoras

- [ ] Implementar exportación a Excel/PDF
- [ ] Agregar importación masiva desde CSV
- [ ] Historial de cambios (audit log)
- [ ] Permisos granulares por catálogo
- [ ] Caché de catálogos en el frontend
- [ ] Sincronización offline
- [ ] Búsqueda avanzada con filtros múltiples
- [ ] Vistas personalizadas por usuario

---

**Fecha de creación:** 2026-01-24
**Última actualización:** 2026-01-24
**Versión:** 1.0.0
