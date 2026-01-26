# Guía de Paleta de Colores - Micro App

## Paleta de Colores Actualizada

La aplicación ahora utiliza una paleta de colores personalizada basada en tonos azules y verdes azulados:

### Colores Principales

| Color | Hex | Uso |
|-------|-----|-----|
| **Primary** | `#0511F2` | Azul intenso - Botones principales, acciones primarias, títulos importantes |
| **Secondary/Accent** | `#035AA6` | Azul medio - Botones secundarios, links, acentos |
| **Tertiary** | `#0F808C` | Turquesa/Teal - Hover states, elementos terciarios, destacados |
| **Success** | `#027368` | Verde azulado - Mensajes de éxito, estados positivos |

### Colores de Estado

| Color | Hex | Uso |
|-------|-----|-----|
| **Error/Warn** | `#f44336` | Mensajes de error, validaciones fallidas |
| **Warning** | `#ff9800` | Advertencias, acciones que requieren atención |
| **Info** | `#2196f3` | Información general, tooltips |

---

## Cómo Usar los Nuevos Colores

### 1. Angular Material Components

Los componentes de Angular Material ya están configurados para usar los nuevos colores automáticamente:

#### Botones

```html
<!-- Botón primario (azul intenso #0511F2) -->
<button mat-raised-button color="primary">Guardar</button>

<!-- Botón secundario/accent (azul medio #035AA6) -->
<button mat-raised-button color="accent">Cancelar</button>

<!-- Botón terciario (turquesa #0F808C) - usando clase personalizada -->
<button mat-raised-button class="mat-tertiary">Ver más</button>

<!-- Botón de éxito (verde azulado #027368) - usando clase personalizada -->
<button mat-raised-button class="mat-success">Confirmar</button>

<!-- Botón de error -->
<button mat-raised-button color="warn">Eliminar</button>
```

#### Form Fields

```html
<!-- Los form fields automáticamente usan el color primary para focus -->
<mat-form-field appearance="outline">
  <mat-label>Email</mat-label>
  <input matInput type="email" />
</mat-form-field>

<!-- Puedes especificar color accent -->
<mat-form-field appearance="outline" color="accent">
  <mat-label>Nombre</mat-label>
  <input matInput />
</mat-form-field>
```

#### Checkboxes, Radio Buttons, Toggles

```html
<!-- Checkbox primario -->
<mat-checkbox color="primary">Acepto términos</mat-checkbox>

<!-- Checkbox accent -->
<mat-checkbox color="accent">Recibir notificaciones</mat-checkbox>

<!-- Radio buttons -->
<mat-radio-group color="primary">
  <mat-radio-button value="1">Opción 1</mat-radio-button>
  <mat-radio-button value="2">Opción 2</mat-radio-button>
</mat-radio-group>

<!-- Slide toggle -->
<mat-slide-toggle color="primary">Activar</mat-slide-toggle>
```

#### Progress Indicators

```html
<!-- Spinner primario -->
<mat-spinner color="primary"></mat-spinner>

<!-- Progress bar accent -->
<mat-progress-bar mode="indeterminate" color="accent"></mat-progress-bar>
```

#### Chips

```html
<!-- Chip primario -->
<mat-chip-listbox>
  <mat-chip-option color="primary">Angular</mat-chip-option>
  <mat-chip-option color="accent">TypeScript</mat-chip-option>
  <mat-chip-option class="mat-tertiary">NestJS</mat-chip-option>
  <mat-chip-option class="mat-success">Activo</mat-chip-option>
</mat-chip-listbox>
```

---

### 2. Variables CSS Personalizadas

Puedes usar las variables CSS en tus componentes SCSS:

```scss
// En tu archivo .component.scss
.custom-element {
  background-color: var(--primary-color);
  color: var(--primary-contrast);

  &:hover {
    background-color: var(--primary-dark);
  }
}

.info-box {
  border: 2px solid var(--secondary-color);
  background-color: rgba(3, 90, 166, 0.1); // secondary con transparencia
}

.success-badge {
  background-color: var(--success-color);
  color: var(--success-contrast);
  padding: 4px 8px;
  border-radius: 4px;
}
```

### Variables Disponibles

```scss
// Colores principales
--primary-color: #0511F2
--secondary-color: #035AA6
--tertiary-color: #0F808C
--success-color: #027368

// Variaciones
--primary-light, --primary-dark, --primary-contrast
--secondary-light, --secondary-dark, --secondary-contrast
--tertiary-light, --tertiary-dark, --tertiary-contrast
--success-light, --success-dark, --success-contrast

// Estados
--error-color, --warning-color, --info-color

// Backgrounds y textos
--background-color, --surface-color
--text-primary, --text-secondary, --text-disabled
--divider-color
```

---

### 3. Clases de Utilidad

El archivo `styles.scss` incluye clases de utilidad listas para usar:

#### Colores de Texto

```html
<h1 class="text-primary">Título Principal</h1>
<p class="text-secondary">Texto secundario</p>
<span class="text-tertiary">Destacado</span>
<span class="text-success">Operación exitosa</span>
<span class="text-error">Error en validación</span>
<span class="text-warning">Atención requerida</span>
```

#### Backgrounds

```html
<div class="bg-primary">Fondo azul intenso con texto blanco</div>
<div class="bg-secondary">Fondo azul medio con texto blanco</div>
<div class="bg-tertiary">Fondo turquesa con texto blanco</div>
<div class="bg-success">Fondo verde azulado con texto blanco</div>
```

#### Bordes

```html
<mat-card class="border-primary" style="border: 2px solid;">Card con borde primario</mat-card>
<div class="border-secondary" style="border-left: 4px solid;">Borde izquierdo secundario</div>
```

#### Hover States

```html
<button class="hover-tertiary">Hover turquesa</button>
<button class="hover-success">Hover éxito</button>
```

#### Cards con Borde de Color

```html
<mat-card class="card-primary">
  <mat-card-header>
    <mat-card-title>Card Principal</mat-card-title>
  </mat-card-header>
  <mat-card-content>
    Contenido con borde izquierdo azul intenso
  </mat-card-content>
</mat-card>

<mat-card class="card-secondary">Card Secundario</mat-card>
<mat-card class="card-tertiary">Card Terciario</mat-card>
<mat-card class="card-success">Card de Éxito</mat-card>
```

---

## Ejemplos de Uso Comunes

### Formulario Completo

```html
<form [formGroup]="myForm" (ngSubmit)="onSubmit()">
  <mat-card class="card-primary">
    <mat-card-header>
      <mat-card-title class="text-primary">Registro de Usuario</mat-card-title>
    </mat-card-header>

    <mat-card-content>
      <mat-form-field appearance="outline" color="primary" class="full-width">
        <mat-label>Nombre completo</mat-label>
        <input matInput formControlName="name" />
        <mat-icon matPrefix>person</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline" color="primary" class="full-width">
        <mat-label>Email</mat-label>
        <input matInput type="email" formControlName="email" />
        <mat-icon matPrefix>email</mat-icon>
        <mat-error *ngIf="myForm.get('email')?.hasError('email')">
          Email inválido
        </mat-error>
      </mat-form-field>

      <mat-checkbox color="primary" formControlName="acceptTerms">
        Acepto los términos y condiciones
      </mat-checkbox>
    </mat-card-content>

    <mat-card-actions align="end">
      <button mat-button type="button" color="accent">Cancelar</button>
      <button mat-raised-button type="submit" color="primary">
        Guardar
      </button>
    </mat-card-actions>
  </mat-card>
</form>
```

### Tabla con Estados

```html
<table mat-table [dataSource]="dataSource">
  <ng-container matColumnDef="status">
    <th mat-header-cell *matHeaderCellDef>Estado</th>
    <td mat-cell *matCellDef="let element">
      <mat-chip-listbox>
        <mat-chip-option
          [class]="getStatusClass(element.status)"
          [disabled]="true">
          {{ element.status }}
        </mat-chip-option>
      </mat-chip-listbox>
    </td>
  </ng-container>
</table>

<!-- En el componente TypeScript -->
getStatusClass(status: string): string {
  switch(status) {
    case 'active': return 'mat-success';
    case 'pending': return 'mat-tertiary';
    case 'inactive': return '';
    default: return '';
  }
}
```

### Header/Navbar

```html
<mat-toolbar class="bg-primary">
  <button mat-icon-button (click)="toggleSidebar()">
    <mat-icon>menu</mat-icon>
  </button>
  <span>Micro App</span>
  <span class="spacer"></span>
  <button mat-icon-button>
    <mat-icon>notifications</mat-icon>
  </button>
  <button mat-icon-button [matMenuTriggerFor]="menu">
    <mat-icon>account_circle</mat-icon>
  </button>
</mat-toolbar>

<!-- En tu component.scss -->
.spacer {
  flex: 1 1 auto;
}
```

### Mensajes de Feedback

```typescript
// En tu componente TypeScript
import { MatSnackBar } from '@angular/material/snack-bar';

export class MyComponent {
  constructor(private snackBar: MatSnackBar) {}

  showSuccess(): void {
    this.snackBar.open('Operación exitosa', 'Cerrar', {
      duration: 3000,
      panelClass: ['bg-success'], // Usa la clase de utilidad
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  showError(): void {
    this.snackBar.open('Error en la operación', 'Cerrar', {
      duration: 5000,
      panelClass: ['mat-error'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
```

### Links y Navegación

```html
<!-- Los links ya tienen estilos automáticos -->
<a routerLink="/home">Inicio</a> <!-- Color secundario #035AA6 -->
<a routerLink="/about">Acerca de</a> <!-- Hover: turquesa #0F808C -->

<!-- Para deshabilitar los estilos automáticos -->
<a routerLink="/special" class="custom-link" style="color: inherit;">Link personalizado</a>
```

---

## Accesibilidad

Todos los colores han sido configurados con contraste adecuado para cumplir con WCAG 2.1 AA:

- **Texto blanco sobre colores oscuros**: Primary, Secondary, Tertiary, Success
- **Texto oscuro sobre colores claros**: Backgrounds, tonos 50-200 de las paletas

Si necesitas verificar contraste para combinaciones personalizadas, usa:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Ratio mínimo: 4.5:1 para texto normal, 3:1 para texto grande

---

## Migración de Código Existente

### Buscar y Reemplazar Colores Antiguos

Si tenías colores codificados en tus componentes:

```scss
// ANTES
.my-element {
  background-color: #667eea; // Indigo antiguo
  color: white;
}

// DESPUÉS
.my-element {
  background-color: var(--primary-color); // #0511F2
  color: var(--primary-contrast);
}
```

### Actualizar Gradientes

```scss
// ANTES
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// DESPUÉS
background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 50%, var(--tertiary-color) 100%);
```

---

## Personalización Futura

Si necesitas ajustar los colores en el futuro, edita el archivo:
- **Archivo**: `src/styles.scss`
- **Líneas 7-106**: Paletas personalizadas de Angular Material
- **Líneas 127-166**: Variables CSS :root

Recuerda que al cambiar las paletas de Material, debes generar tonos del 50 al 900 para mantener la coherencia del tema.

---

## Soporte

Para preguntas o sugerencias sobre la paleta de colores, contacta al equipo de desarrollo.

**Última actualización**: 2026-01-24
