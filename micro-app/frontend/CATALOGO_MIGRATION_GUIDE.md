# Guía de Migración: Uso de Catálogos en Formularios

Este documento explica cómo actualizar formularios existentes para usar los nuevos catálogos dinámicos del sistema en lugar de valores hardcodeados.

## Índice
1. [Introducción](#introducción)
2. [Catálogos Disponibles](#catálogos-disponibles)
3. [Cómo Usar Catálogos en Formularios](#cómo-usar-catálogos-en-formularios)
4. [Ejemplos de Migración](#ejemplos-de-migración)
5. [Best Practices](#best-practices)

---

## Introducción

Los catálogos del sistema permiten gestionar valores de forma dinámica desde el backend, eliminando la necesidad de valores hardcodeados en el frontend. Esto facilita:

- Actualización de valores sin modificar código
- Gestión centralizada de opciones
- Mayor flexibilidad y mantenibilidad
- Activación/desactivación de opciones

---

## Catálogos Disponibles

### Servicio: `CatalogosService`

Ubicación: `src/app/features/catalogos/services/catalogos.service.ts`

### Métodos Disponibles:

| Método | Catálogo | Uso Típico |
|--------|----------|------------|
| `getSexos()` | Género/Sexo | Formulario de clientes |
| `getEstadosSolicitud()` | Estados de Solicitud | Gestión de solicitudes |
| `getRecomendacionesAsesor()` | Recomendaciones del Asesor | Evaluación de solicitudes |
| `getTiposDecisionComite()` | Decisiones del Comité | Comité de crédito |
| `getDestinosCredito()` | Destinos de Crédito | Solicitudes de crédito |
| `getTiposPago()` | Tipos de Pago | Registro de pagos |
| `getEstadosPago()` | Estados de Pago | Consulta de pagos |
| `getEstadosCuota()` | Estados de Cuota | Plan de pagos |
| `getPeriodicidadesPago()` | Periodicidad de Pago | Configuración de préstamos |
| `getTiposInteres()` | Tipos de Interés | Configuración de préstamos |
| `getTiposCalculo()` | Tipos de Cálculo | Configuración de préstamos |
| `getEstadosPrestamo()` | Estados de Préstamo | Gestión de préstamos |
| `getEstadosGarantia()` | Estados de Garantía | Gestión de garantías |
| `getCategoriasNCB022()` | Categorías NCB-022 | Clasificación de préstamos |

**Parámetros:**
- `soloActivos` (boolean, default: `true`): Si es `true`, devuelve solo registros activos

---

## Cómo Usar Catálogos en Formularios

### Paso 1: Importar el Servicio

```typescript
import { CatalogosService } from '@features/catalogos/services/catalogos.service';
import { CatalogoBase } from '@core/models/catalogo.model';
```

### Paso 2: Inyectar el Servicio

```typescript
export class MiFormularioComponent implements OnInit {
  private catalogosService = inject(CatalogosService);

  // Signal para almacenar las opciones
  sexoOptions = signal<CatalogoBase[]>([]);

  ngOnInit(): void {
    this.loadCatalogos();
  }
}
```

### Paso 3: Cargar los Catálogos

```typescript
private loadCatalogos(): void {
  // Cargar solo registros activos
  this.catalogosService.getSexos().subscribe({
    next: (data) => this.sexoOptions.set(data),
    error: (error) => console.error('Error al cargar catálogo:', error)
  });
}
```

### Paso 4: Usar en el Template

#### Opción A: mat-select

```html
<mat-form-field appearance="outline">
  <mat-label>Género</mat-label>
  <mat-select formControlName="sexo">
    @for (opcion of sexoOptions(); track opcion.id) {
      <mat-option [value]="opcion.codigo">
        {{ opcion.nombre }}
      </mat-option>
    }
  </mat-select>
</mat-form-field>
```

#### Opción B: mat-radio-group

```html
<mat-radio-group formControlName="sexo">
  @for (opcion of sexoOptions(); track opcion.id) {
    <mat-radio-button [value]="opcion.codigo">
      {{ opcion.nombre }}
    </mat-radio-button>
  }
</mat-radio-group>
```

---

## Ejemplos de Migración

### Ejemplo 1: Migrar Campo de Sexo en Cliente Form

**ANTES (valores hardcodeados):**

```typescript
// cliente-form.component.ts
export class ClienteFormComponent {
  sexoOptions = ['Masculino', 'Femenino', 'Otro'];
}
```

```html
<!-- cliente-form.component.html -->
<mat-select formControlName="sexo">
  @for (opcion of sexoOptions; track opcion) {
    <mat-option [value]="opcion">{{ opcion }}</mat-option>
  }
</mat-select>
```

**DESPUÉS (usando catálogo):**

```typescript
// cliente-form.component.ts
import { CatalogosService } from '@features/catalogos/services/catalogos.service';
import { CatalogoBase } from '@core/models/catalogo.model';

export class ClienteFormComponent implements OnInit {
  private catalogosService = inject(CatalogosService);

  sexoOptions = signal<CatalogoBase[]>([]);

  ngOnInit(): void {
    this.loadCatalogos();
    this.initForm();
  }

  private loadCatalogos(): void {
    this.catalogosService.getSexos().subscribe({
      next: (data) => this.sexoOptions.set(data),
      error: (error) => {
        console.error('Error al cargar sexos:', error);
        // Opcional: mostrar snackbar con el error
      }
    });
  }
}
```

```html
<!-- cliente-form.component.html -->
<mat-select formControlName="sexo">
  @for (opcion of sexoOptions(); track opcion.id) {
    <mat-option [value]="opcion.codigo">
      {{ opcion.nombre }}
      @if (opcion.descripcion) {
        <span class="option-hint">- {{ opcion.descripcion }}</span>
      }
    </mat-option>
  }
</mat-select>
```

### Ejemplo 2: Cargar Múltiples Catálogos

```typescript
export class SolicitudFormComponent implements OnInit {
  private catalogosService = inject(CatalogosService);

  estadosSolicitud = signal<CatalogoBase[]>([]);
  destinosCredito = signal<CatalogoBase[]>([]);
  periodicidades = signal<CatalogoBase[]>([]);

  ngOnInit(): void {
    this.loadCatalogos();
  }

  private loadCatalogos(): void {
    // Usar forkJoin para cargar múltiples catálogos en paralelo
    forkJoin({
      estados: this.catalogosService.getEstadosSolicitud(),
      destinos: this.catalogosService.getDestinosCredito(),
      periodicidades: this.catalogosService.getPeriodicidadesPago()
    }).subscribe({
      next: (data) => {
        this.estadosSolicitud.set(data.estados);
        this.destinosCredito.set(data.destinos);
        this.periodicidades.set(data.periodicidades);
      },
      error: (error) => {
        console.error('Error al cargar catálogos:', error);
      }
    });
  }
}
```

### Ejemplo 3: Mostrar Nombre de Catálogo en Vista de Detalle

```typescript
export class PrestamoDetailComponent implements OnInit {
  private catalogosService = inject(CatalogosService);

  estadosPrestamo = signal<CatalogoBase[]>([]);

  ngOnInit(): void {
    this.loadCatalogos();
  }

  /**
   * Obtiene el nombre legible de un estado por su código
   */
  getNombreEstado(codigo: string): string {
    const estado = this.estadosPrestamo().find(e => e.codigo === codigo);
    return estado?.nombre || codigo;
  }
}
```

```html
<div class="detail-field">
  <span class="label">Estado:</span>
  <span class="value">{{ getNombreEstado(prestamo.estado) }}</span>
</div>
```

---

## Best Practices

### 1. Usar Signals para Reactividad

```typescript
// ✅ BIEN - Usando signals
sexoOptions = signal<CatalogoBase[]>([]);

// ❌ EVITAR - Usar variables normales
sexoOptions: CatalogoBase[] = [];
```

### 2. Manejo de Errores

```typescript
private loadCatalogos(): void {
  this.catalogosService.getSexos().subscribe({
    next: (data) => this.sexoOptions.set(data),
    error: (error) => {
      console.error('Error al cargar catálogo:', error);
      // Mostrar mensaje al usuario
      this.snackBar.open(
        'Error al cargar opciones. Por favor, recargue la página.',
        'Cerrar',
        { duration: 5000 }
      );
    }
  });
}
```

### 3. Cargar Catálogos en Paralelo

Cuando necesites múltiples catálogos, usa `forkJoin`:

```typescript
import { forkJoin } from 'rxjs';

private loadCatalogos(): void {
  forkJoin({
    sexos: this.catalogosService.getSexos(),
    estados: this.catalogosService.getEstadosSolicitud(),
  }).subscribe({
    next: ({ sexos, estados }) => {
      this.sexoOptions.set(sexos);
      this.estadoOptions.set(estados);
    }
  });
}
```

### 4. Valores por Defecto

Si el catálogo está vacío o falla, considera tener valores por defecto:

```typescript
private loadCatalogos(): void {
  this.catalogosService.getSexos().subscribe({
    next: (data) => {
      if (data.length === 0) {
        console.warn('Catálogo de sexo vacío');
        // Opcional: usar valores por defecto
      }
      this.sexoOptions.set(data);
    },
    error: () => {
      // En caso de error, usar valores de respaldo
      this.sexoOptions.set([
        { id: 1, codigo: 'M', nombre: 'Masculino', activo: true },
        { id: 2, codigo: 'F', nombre: 'Femenino', activo: true }
      ]);
    }
  });
}
```

### 5. Ordenamiento

Los catálogos ya vienen ordenados por el campo `orden`, pero si necesitas ordenar de otra forma:

```typescript
private loadCatalogos(): void {
  this.catalogosService.getSexos().subscribe({
    next: (data) => {
      // Ordenar alfabéticamente por nombre
      const ordenados = [...data].sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      );
      this.sexoOptions.set(ordenados);
    }
  });
}
```

### 6. Cache de Catálogos (Opcional)

Si un catálogo se usa en múltiples componentes, considera crear un servicio wrapper con cache:

```typescript
@Injectable({ providedIn: 'root' })
export class CatalogosCacheService {
  private catalogosService = inject(CatalogosService);
  private cache = new Map<string, Observable<CatalogoBase[]>>();

  getSexos(): Observable<CatalogoBase[]> {
    if (!this.cache.has('sexos')) {
      this.cache.set('sexos',
        this.catalogosService.getSexos().pipe(shareReplay(1))
      );
    }
    return this.cache.get('sexos')!;
  }
}
```

---

## Migración Checklist

Al migrar un formulario para usar catálogos:

- [ ] Identificar campos que usan valores hardcodeados
- [ ] Importar `CatalogosService` y `CatalogoBase`
- [ ] Crear signals para almacenar las opciones
- [ ] Cargar catálogos en `ngOnInit`
- [ ] Actualizar el template para usar las opciones del catálogo
- [ ] Implementar manejo de errores
- [ ] Actualizar la validación del formulario si es necesario
- [ ] Probar el formulario con datos reales
- [ ] Actualizar vistas de detalle para mostrar nombres legibles

---

## Soporte

Para preguntas o problemas con los catálogos, contacta al equipo de desarrollo.

**Última actualización:** 2026-01-24
