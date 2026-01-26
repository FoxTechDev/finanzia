# Ejemplo: Migración de cliente-form.component para usar Catálogos

Este archivo muestra cómo migrar el formulario de clientes para usar el catálogo de Sexo/Género en lugar de valores hardcodeados.

## Cambios en cliente-form.component.ts

### ANTES (valores hardcodeados):

```typescript
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// ... otros imports

export class ClienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  // ... otros servicios

  form!: FormGroup;

  // Opciones hardcodeadas
  sexoOptions = ['Masculino', 'Femenino', 'Otro'];
  estadoCivilOptions = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión libre'];
  tipoActividadOptions = ['Empleado', 'Independiente', 'Empresario', 'Jubilado', 'Estudiante', 'Otro'];

  ngOnInit(): void {
    this.initForm();
    // ... resto del código
  }

  private initForm(): void {
    this.form = this.fb.group({
      // ... otros campos
      sexo: ['', Validators.required],
      // ... más campos
    });
  }
}
```

### DESPUÉS (usando catálogo):

```typescript
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
// ... otros imports

// Nuevos imports para catálogos
import { CatalogosService } from '@features/catalogos/services/catalogos.service';
import { CatalogoBase } from '@core/models/catalogo.model';

export class ClienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private catalogosService = inject(CatalogosService);
  // ... otros servicios

  form!: FormGroup;

  // Signals para catálogos
  sexoOptions = signal<CatalogoBase[]>([]);

  // Mantener los que aún no son catálogos
  estadoCivilOptions = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión libre'];
  tipoActividadOptions = ['Empleado', 'Independiente', 'Empresario', 'Jubilado', 'Estudiante', 'Otro'];

  // Estado de carga de catálogos
  catalogosLoaded = signal(false);

  ngOnInit(): void {
    this.initForm();
    this.loadCatalogos(); // Cargar catálogos después de inicializar el form
    // ... resto del código
  }

  private initForm(): void {
    this.form = this.fb.group({
      // ... otros campos
      sexo: ['', Validators.required],
      // ... más campos
    });
  }

  /**
   * Carga los catálogos necesarios para el formulario
   */
  private loadCatalogos(): void {
    // Si solo necesitas un catálogo
    this.catalogosService.getSexos().subscribe({
      next: (data) => {
        this.sexoOptions.set(data);
        this.catalogosLoaded.set(true);
      },
      error: (error) => {
        console.error('Error al cargar catálogo de sexo:', error);
        this.snackBar.open(
          'Error al cargar opciones. Algunas funciones pueden estar limitadas.',
          'Cerrar',
          { duration: 5000 }
        );
        // Usar valores por defecto en caso de error
        this.sexoOptions.set([
          { id: 1, codigo: 'M', nombre: 'Masculino', activo: true },
          { id: 2, codigo: 'F', nombre: 'Femenino', activo: true },
          { id: 3, codigo: 'O', nombre: 'Otro', activo: true }
        ]);
        this.catalogosLoaded.set(true);
      }
    });
  }

  /**
   * Si necesitas cargar múltiples catálogos en paralelo
   */
  private loadCatalogosMultiples(): void {
    forkJoin({
      sexos: this.catalogosService.getSexos(),
      // estadosSolicitud: this.catalogosService.getEstadosSolicitud(),
      // Agregar más catálogos según sea necesario
    }).subscribe({
      next: ({ sexos }) => {
        this.sexoOptions.set(sexos);
        this.catalogosLoaded.set(true);
      },
      error: (error) => {
        console.error('Error al cargar catálogos:', error);
        this.snackBar.open(
          'Error al cargar opciones. Por favor, recargue la página.',
          'Cerrar',
          { duration: 5000 }
        );
      }
    });
  }

  /**
   * Método helper para obtener el nombre del sexo por código
   * Útil en la vista de detalle
   */
  getNombreSexo(codigo: string): string {
    const sexo = this.sexoOptions().find(s => s.codigo === codigo);
    return sexo?.nombre || codigo;
  }
}
```

## Cambios en cliente-form.component.html

### ANTES (valores hardcodeados):

```html
<mat-form-field appearance="outline" class="full-width">
  <mat-label>Sexo</mat-label>
  <mat-select formControlName="sexo">
    @for (opcion of sexoOptions; track opcion) {
      <mat-option [value]="opcion">{{ opcion }}</mat-option>
    }
  </mat-select>
  @if (form.get('sexo')?.hasError('required') && form.get('sexo')?.touched) {
    <mat-error>El sexo es requerido</mat-error>
  }
</mat-form-field>
```

### DESPUÉS (usando catálogo):

```html
<mat-form-field appearance="outline" class="full-width">
  <mat-label>Sexo</mat-label>
  <mat-select formControlName="sexo">
    <!-- Mostrar skeleton/loading mientras carga -->
    @if (!catalogosLoaded()) {
      <mat-option disabled>Cargando opciones...</mat-option>
    }

    <!-- Mostrar opciones del catálogo -->
    @for (opcion of sexoOptions(); track opcion.id) {
      <mat-option [value]="opcion.codigo">
        {{ opcion.nombre }}
        @if (opcion.descripcion) {
          <span class="option-description">- {{ opcion.descripcion }}</span>
        }
      </mat-option>
    }

    <!-- Estado vacío -->
    @if (catalogosLoaded() && sexoOptions().length === 0) {
      <mat-option disabled>No hay opciones disponibles</mat-option>
    }
  </mat-select>
  <mat-icon matPrefix>wc</mat-icon>
  @if (form.get('sexo')?.hasError('required') && form.get('sexo')?.touched) {
    <mat-error>El sexo es requerido</mat-error>
  }
</mat-form-field>
```

## Cambios en cliente-detail.component.ts (Vista de Detalle)

### ANTES:

```typescript
export class ClienteDetailComponent implements OnInit {
  cliente = signal<Cliente | null>(null);

  ngOnInit(): void {
    this.loadCliente();
  }
}
```

### DESPUÉS:

```typescript
import { CatalogosService } from '@features/catalogos/services/catalogos.service';
import { CatalogoBase } from '@core/models/catalogo.model';

export class ClienteDetailComponent implements OnInit {
  private catalogosService = inject(CatalogosService);

  cliente = signal<Cliente | null>(null);
  sexoOptions = signal<CatalogoBase[]>([]);

  ngOnInit(): void {
    this.loadCliente();
    this.loadCatalogos();
  }

  private loadCatalogos(): void {
    this.catalogosService.getSexos().subscribe({
      next: (data) => this.sexoOptions.set(data),
      error: (error) => console.error('Error al cargar catálogo:', error)
    });
  }

  /**
   * Obtiene el nombre legible del sexo por código
   */
  getNombreSexo(codigo: string): string {
    const sexo = this.sexoOptions().find(s => s.codigo === codigo);
    return sexo?.nombre || codigo;
  }
}
```

## Cambios en cliente-detail.component.html

### ANTES:

```html
<div class="detail-field">
  <span class="label">Sexo:</span>
  <span class="value">{{ cliente()?.sexo }}</span>
</div>
```

### DESPUÉS:

```html
<div class="detail-field">
  <span class="label">Sexo:</span>
  <span class="value">{{ getNombreSexo(cliente()?.sexo || '') }}</span>
</div>
```

## Estilos Opcionales (cliente-form.component.scss)

```scss
// Estilo para la descripción en las opciones del select
.option-description {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  font-style: italic;
  margin-left: 4px;
}

// Indicador de carga
mat-select {
  mat-option[disabled] {
    opacity: 0.6;
  }
}
```

## Beneficios de la Migración

1. **Flexibilidad:** Los valores pueden cambiarse sin modificar código
2. **Centralización:** Un solo lugar para gestionar los valores
3. **Consistencia:** Los mismos valores en todo el sistema
4. **Escalabilidad:** Fácil agregar o modificar opciones
5. **Mantenibilidad:** Menos código hardcodeado
6. **Administración:** Los usuarios pueden gestionar los catálogos

## Validación y Testing

Después de la migración, verifica:

1. **Formulario de creación:**
   - [ ] El select muestra las opciones correctamente
   - [ ] Se puede seleccionar un valor
   - [ ] La validación funciona
   - [ ] Los datos se guardan con el código correcto

2. **Vista de detalle:**
   - [ ] Se muestra el nombre legible en lugar del código
   - [ ] No hay errores en consola

3. **Casos edge:**
   - [ ] Qué pasa si el catálogo está vacío
   - [ ] Qué pasa si falla la carga del catálogo
   - [ ] Qué pasa si el código no existe en el catálogo (datos antiguos)

4. **Performance:**
   - [ ] La carga no es muy lenta
   - [ ] No hay múltiples llamadas innecesarias al API

## Migración de Datos

Si estabas guardando strings como "Masculino" y ahora guardas códigos como "M":

### Opción 1: Migración en Backend

```sql
-- Ejemplo de migración SQL
UPDATE clientes
SET sexo = CASE
  WHEN sexo = 'Masculino' THEN 'M'
  WHEN sexo = 'Femenino' THEN 'F'
  WHEN sexo = 'Otro' THEN 'O'
  ELSE sexo
END;
```

### Opción 2: Compatibilidad en Frontend

```typescript
// Mapear valores antiguos a códigos nuevos
private mapearSexoLegacy(sexo: string): string {
  const mapa: Record<string, string> = {
    'Masculino': 'M',
    'Femenino': 'F',
    'Otro': 'O'
  };
  return mapa[sexo] || sexo;
}

// Usar al cargar el formulario
this.form.patchValue({
  sexo: this.mapearSexoLegacy(cliente.sexo)
});
```

---

Este ejemplo sirve como guía para migrar otros campos del formulario que actualmente usan valores hardcodeados.
