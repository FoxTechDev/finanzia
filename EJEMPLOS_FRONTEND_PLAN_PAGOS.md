# Ejemplos de Integración Frontend: Nuevo Cálculo de Plan de Pagos

## 1. Etiquetas Dinámicas del Campo Plazo

### 1.1. TypeScript (Component)
```typescript
// En tu componente de solicitud/cálculo
getPlazolabel(periodicidad: string): string {
  return periodicidad === 'DIARIO'
    ? 'Plazo (días)'
    : 'Plazo (meses)';
}

getPlazoPaceholder(periodicidad: string): string {
  switch(periodicidad) {
    case 'DIARIO':
      return 'Ej: 30 días';
    case 'SEMANAL':
      return 'Ej: 3 meses = 12 cuotas semanales';
    case 'QUINCENAL':
      return 'Ej: 3 meses = 6 cuotas quincenales';
    case 'MENSUAL':
      return 'Ej: 3 meses = 3 cuotas mensuales';
    case 'TRIMESTRAL':
      return 'Ej: 3 meses = 1 cuota trimestral';
    case 'SEMESTRAL':
      return 'Ej: 6 meses = 1 cuota semestral';
    case 'ANUAL':
      return 'Ej: 12 meses = 1 cuota anual';
    default:
      return 'Ingrese el plazo';
  }
}
```

### 1.2. HTML (Template)
```html
<!-- Campo de Periodicidad -->
<mat-form-field appearance="outline" class="w-full">
  <mat-label>Periodicidad de Pago</mat-label>
  <mat-select formControlName="periodicidad" (selectionChange)="onPeriodicidadChange()">
    <mat-option value="DIARIO">Diario</mat-option>
    <mat-option value="SEMANAL">Semanal</mat-option>
    <mat-option value="QUINCENAL">Quincenal</mat-option>
    <mat-option value="MENSUAL">Mensual</mat-option>
    <mat-option value="TRIMESTRAL">Trimestral</mat-option>
    <mat-option value="SEMESTRAL">Semestral</mat-option>
    <mat-option value="ANUAL">Anual</mat-option>
  </mat-select>
</mat-form-field>

<!-- Campo de Plazo con etiqueta dinámica -->
<mat-form-field appearance="outline" class="w-full">
  <mat-label>{{ getPlazolabel(form.value.periodicidad) }}</mat-label>
  <input
    matInput
    type="number"
    formControlName="plazo"
    [placeholder]="getPlazoPaceholder(form.value.periodicidad)"
    min="1">
  <mat-hint>
    <span *ngIf="numeroCuotasCalculado > 0">
      Número de cuotas: {{ numeroCuotasCalculado }}
    </span>
  </mat-hint>
</mat-form-field>
```

---

## 2. Cálculo de Cuotas en Tiempo Real

### 2.1. TypeScript (Service Method)
```typescript
/**
 * Calcula el número de cuotas según la periodicidad y el plazo
 * @param plazo - En días para DIARIO, en meses para otros
 * @param periodicidad - Periodicidad de pago
 * @returns Número de cuotas
 */
calcularNumeroCuotas(plazo: number, periodicidad: string): number {
  if (!plazo || plazo <= 0) return 0;

  switch(periodicidad) {
    case 'DIARIO':
      return plazo; // El plazo ya es el número de días (cuotas)
    case 'SEMANAL':
      return plazo * 4; // 1 mes = 4 semanas
    case 'QUINCENAL':
      return plazo * 2; // 1 mes = 2 quincenas
    case 'MENSUAL':
      return plazo; // 1 mes = 1 cuota
    case 'TRIMESTRAL':
      return Math.round(plazo / 3); // 3 meses = 1 trimestre
    case 'SEMESTRAL':
      return Math.round(plazo / 6); // 6 meses = 1 semestre
    case 'ANUAL':
      return Math.round(plazo / 12); // 12 meses = 1 año
    default:
      return plazo;
  }
}
```

### 2.2. TypeScript (Component)
```typescript
export class SolicitudFormComponent implements OnInit {
  form: FormGroup;
  numeroCuotasCalculado = 0;

  ngOnInit() {
    this.form = this.fb.group({
      monto: [null, [Validators.required, Validators.min(1)]],
      plazo: [null, [Validators.required, Validators.min(1)]],
      periodicidad: ['MENSUAL', Validators.required],
      tasaInteres: [null, [Validators.required, Validators.min(0)]],
      tipoInteres: ['AMORTIZADO', Validators.required],
    });

    // Recalcular cuotas cuando cambien plazo o periodicidad
    this.form.get('plazo')?.valueChanges.subscribe(() => this.actualizarNumeroCuotas());
    this.form.get('periodicidad')?.valueChanges.subscribe(() => this.actualizarNumeroCuotas());
  }

  actualizarNumeroCuotas() {
    const plazo = this.form.get('plazo')?.value;
    const periodicidad = this.form.get('periodicidad')?.value;

    if (plazo && periodicidad) {
      this.numeroCuotasCalculado = this.calcularNumeroCuotas(plazo, periodicidad);
    } else {
      this.numeroCuotasCalculado = 0;
    }
  }

  onPeriodicidadChange() {
    // Limpiar el campo plazo cuando cambia la periodicidad
    this.form.patchValue({ plazo: null });
    this.numeroCuotasCalculado = 0;
  }

  // Método del servicio inline (o importar del service)
  calcularNumeroCuotas(plazo: number, periodicidad: string): number {
    // ... (código del método anterior)
  }
}
```

---

## 3. Tooltip Informativo con la Regla de Conversión

### 3.1. HTML con Angular Material Tooltip
```html
<mat-form-field appearance="outline" class="w-full">
  <mat-label>{{ getPlazolabel(form.value.periodicidad) }}</mat-label>
  <input
    matInput
    type="number"
    formControlName="plazo"
    [placeholder]="getPlazoPaceholder(form.value.periodicidad)"
    min="1">
  <mat-icon
    matSuffix
    [matTooltip]="getTooltipConversion(form.value.periodicidad)"
    matTooltipPosition="above"
    class="cursor-help">
    info
  </mat-icon>
  <mat-hint>
    <span *ngIf="numeroCuotasCalculado > 0" class="text-primary font-semibold">
      → Número de cuotas: {{ numeroCuotasCalculado }}
    </span>
  </mat-hint>
</mat-form-field>
```

### 3.2. TypeScript (Método para Tooltip)
```typescript
getTooltipConversion(periodicidad: string): string {
  const reglas = {
    'DIARIO': 'Ingrese el número de días directamente.\nEjemplo: 30 días = 30 cuotas diarias',
    'SEMANAL': 'Regla: 1 mes = 4 semanas\nEjemplo: 3 meses = 12 cuotas semanales (3 × 4)',
    'QUINCENAL': 'Regla: 1 mes = 2 quincenas\nEjemplo: 3 meses = 6 cuotas quincenales (3 × 2)',
    'MENSUAL': 'Regla: 1 mes = 1 cuota\nEjemplo: 3 meses = 3 cuotas mensuales',
    'TRIMESTRAL': 'Regla: 3 meses = 1 trimestre\nEjemplo: 3 meses = 1 cuota trimestral (3 / 3)',
    'SEMESTRAL': 'Regla: 6 meses = 1 semestre\nEjemplo: 6 meses = 1 cuota semestral (6 / 6)',
    'ANUAL': 'Regla: 12 meses = 1 año\nEjemplo: 12 meses = 1 cuota anual (12 / 12)',
  };

  return reglas[periodicidad] || 'Ingrese el plazo según la periodicidad seleccionada';
}
```

---

## 4. Validación del Campo Plazo según Periodicidad

### 4.1. Custom Validator
```typescript
import { AbstractControl, ValidatorFn } from '@angular/forms';

/**
 * Validador personalizado para el campo plazo según la periodicidad
 */
export function plazoValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const form = control.parent;
    if (!form) return null;

    const plazo = control.value;
    const periodicidad = form.get('periodicidad')?.value;

    if (!plazo || !periodicidad) return null;

    // Validaciones específicas por periodicidad
    switch(periodicidad) {
      case 'TRIMESTRAL':
        // El plazo debe ser múltiplo de 3 para periodicidad trimestral
        if (plazo < 3) {
          return { plazoMinimo: { value: plazo, minimo: 3, mensaje: 'Para periodicidad trimestral, el plazo mínimo es 3 meses' } };
        }
        break;

      case 'SEMESTRAL':
        // El plazo debe ser múltiplo de 6 para periodicidad semestral
        if (plazo < 6) {
          return { plazoMinimo: { value: plazo, minimo: 6, mensaje: 'Para periodicidad semestral, el plazo mínimo es 6 meses' } };
        }
        break;

      case 'ANUAL':
        // El plazo debe ser múltiplo de 12 para periodicidad anual
        if (plazo < 12) {
          return { plazoMinimo: { value: plazo, minimo: 12, mensaje: 'Para periodicidad anual, el plazo mínimo es 12 meses' } };
        }
        break;
    }

    return null;
  };
}
```

### 4.2. Uso del Validator en el FormGroup
```typescript
ngOnInit() {
  this.form = this.fb.group({
    monto: [null, [Validators.required, Validators.min(1)]],
    plazo: [null, [Validators.required, Validators.min(1), plazoValidator()]], // ← Validator personalizado
    periodicidad: ['MENSUAL', Validators.required],
    tasaInteres: [null, [Validators.required, Validators.min(0)]],
    tipoInteres: ['AMORTIZADO', Validators.required],
  });

  // Re-validar plazo cuando cambie la periodicidad
  this.form.get('periodicidad')?.valueChanges.subscribe(() => {
    this.form.get('plazo')?.updateValueAndValidity();
  });
}
```

### 4.3. Mostrar Errores de Validación
```html
<mat-form-field appearance="outline" class="w-full">
  <mat-label>{{ getPlazolabel(form.value.periodicidad) }}</mat-label>
  <input
    matInput
    type="number"
    formControlName="plazo"
    [placeholder]="getPlazoPaceholder(form.value.periodicidad)"
    min="1">

  <mat-error *ngIf="form.get('plazo')?.hasError('required')">
    El plazo es requerido
  </mat-error>
  <mat-error *ngIf="form.get('plazo')?.hasError('min')">
    El plazo debe ser mayor a 0
  </mat-error>
  <mat-error *ngIf="form.get('plazo')?.hasError('plazoMinimo')">
    {{ form.get('plazo')?.errors?.['plazoMinimo']?.mensaje }}
  </mat-error>
</mat-form-field>
```

---

## 5. Tabla de Conversión Visual (Card Informativa)

### 5.1. HTML
```html
<!-- Mostrar solo cuando periodicidad NO sea DIARIO -->
<mat-card
  *ngIf="form.value.periodicidad && form.value.periodicidad !== 'DIARIO'"
  class="mt-4 bg-blue-50 border-l-4 border-blue-500">
  <mat-card-content>
    <div class="flex items-start gap-3">
      <mat-icon class="text-blue-600">info</mat-icon>
      <div>
        <h4 class="font-semibold text-gray-800 mb-2">Regla de Conversión</h4>
        <p class="text-sm text-gray-600 mb-3">
          El plazo ingresado en meses se convertirá automáticamente al número de cuotas según la periodicidad:
        </p>

        <table class="min-w-full text-sm">
          <thead class="bg-blue-100">
            <tr>
              <th class="px-3 py-2 text-left">Periodicidad</th>
              <th class="px-3 py-2 text-left">Fórmula</th>
              <th class="px-3 py-2 text-left">Ejemplo (3 meses)</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr [class.bg-blue-50]="form.value.periodicidad === 'SEMANAL'">
              <td class="px-3 py-2">Semanal</td>
              <td class="px-3 py-2 font-mono">meses × 4</td>
              <td class="px-3 py-2">3 × 4 = <strong>12 cuotas</strong></td>
            </tr>
            <tr [class.bg-blue-50]="form.value.periodicidad === 'QUINCENAL'">
              <td class="px-3 py-2">Quincenal</td>
              <td class="px-3 py-2 font-mono">meses × 2</td>
              <td class="px-3 py-2">3 × 2 = <strong>6 cuotas</strong></td>
            </tr>
            <tr [class.bg-blue-50]="form.value.periodicidad === 'MENSUAL'">
              <td class="px-3 py-2">Mensual</td>
              <td class="px-3 py-2 font-mono">meses × 1</td>
              <td class="px-3 py-2">3 × 1 = <strong>3 cuotas</strong></td>
            </tr>
            <tr [class.bg-blue-50]="form.value.periodicidad === 'TRIMESTRAL'">
              <td class="px-3 py-2">Trimestral</td>
              <td class="px-3 py-2 font-mono">meses / 3</td>
              <td class="px-3 py-2">3 / 3 = <strong>1 cuota</strong></td>
            </tr>
            <tr [class.bg-blue-50]="form.value.periodicidad === 'SEMESTRAL'">
              <td class="px-3 py-2">Semestral</td>
              <td class="px-3 py-2 font-mono">meses / 6</td>
              <td class="px-3 py-2">6 / 6 = <strong>1 cuota</strong></td>
            </tr>
            <tr [class.bg-blue-50]="form.value.periodicidad === 'ANUAL'">
              <td class="px-3 py-2">Anual</td>
              <td class="px-3 py-2 font-mono">meses / 12</td>
              <td class="px-3 py-2">12 / 12 = <strong>1 cuota</strong></td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="form.value.plazo && numeroCuotasCalculado > 0"
             class="mt-3 p-3 bg-green-50 border border-green-200 rounded">
          <p class="text-sm font-semibold text-green-800">
            <mat-icon class="text-green-600 text-base align-middle">check_circle</mat-icon>
            Tu crédito: {{ form.value.plazo }} meses =
            <span class="text-lg">{{ numeroCuotasCalculado }} cuotas {{ form.value.periodicidad.toLowerCase() }}es</span>
          </p>
        </div>
      </div>
    </div>
  </mat-card-content>
</mat-card>
```

---

## 6. Preview del Plan de Pagos (Botón Calcular)

### 6.1. TypeScript (Component)
```typescript
export class SolicitudFormComponent {
  planPagoPreview: any = null;
  cargandoPlanPago = false;

  previsualizarPlanPago() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargandoPlanPago = true;
    this.planPagoPreview = null;

    const dto: CalcularPlanPagoDto = {
      monto: this.form.value.monto,
      plazo: this.form.value.plazo,
      tasaInteres: this.form.value.tasaInteres,
      periodicidad: this.form.value.periodicidad,
      tipoInteres: this.form.value.tipoInteres,
      fechaPrimeraCuota: this.form.value.fechaPrimeraCuota || null,
    };

    this.solicitudService.calcularPlanPago(dto).subscribe({
      next: (resultado) => {
        this.planPagoPreview = resultado;
        this.cargandoPlanPago = false;
      },
      error: (error) => {
        console.error('Error al calcular plan de pago:', error);
        // Mostrar mensaje de error al usuario
        this.cargandoPlanPago = false;
      }
    });
  }
}
```

### 6.2. HTML (Botón y Resultado)
```html
<!-- Botón para previsualizar -->
<button
  mat-raised-button
  color="accent"
  type="button"
  (click)="previsualizarPlanPago()"
  [disabled]="form.invalid || cargandoPlanPago">
  <mat-icon *ngIf="!cargandoPlanPago">calculate</mat-icon>
  <mat-spinner *ngIf="cargandoPlanPago" diameter="20"></mat-spinner>
  {{ cargandoPlanPago ? 'Calculando...' : 'Previsualizar Plan de Pagos' }}
</button>

<!-- Resumen del Plan de Pagos -->
<mat-card *ngIf="planPagoPreview" class="mt-4">
  <mat-card-header>
    <mat-card-title>Plan de Pagos</mat-card-title>
    <mat-card-subtitle>
      {{ planPagoPreview.numeroCuotas }} cuotas {{ form.value.periodicidad.toLowerCase() }}es
    </mat-card-subtitle>
  </mat-card-header>

  <mat-card-content>
    <!-- Resumen financiero -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div class="p-3 bg-gray-50 rounded">
        <p class="text-xs text-gray-600 mb-1">Cuota Normal</p>
        <p class="text-lg font-bold">{{ planPagoPreview.cuotaNormal | currency }}</p>
      </div>
      <div class="p-3 bg-gray-50 rounded">
        <p class="text-xs text-gray-600 mb-1">Total Interés</p>
        <p class="text-lg font-bold">{{ planPagoPreview.totalInteres | currency }}</p>
      </div>
      <div class="p-3 bg-gray-50 rounded">
        <p class="text-xs text-gray-600 mb-1">Total a Pagar</p>
        <p class="text-lg font-bold">{{ planPagoPreview.totalPagar | currency }}</p>
      </div>
      <div class="p-3 bg-blue-50 rounded">
        <p class="text-xs text-blue-600 mb-1">Número de Cuotas</p>
        <p class="text-lg font-bold text-blue-700">{{ planPagoPreview.numeroCuotas }}</p>
      </div>
    </div>

    <!-- Tabla con primeras cuotas -->
    <div class="overflow-x-auto">
      <table mat-table [dataSource]="planPagoPreview.planPago.slice(0, 5)" class="w-full">
        <!-- Columnas de la tabla -->
        <ng-container matColumnDef="numeroCuota">
          <th mat-header-cell *matHeaderCellDef>Cuota</th>
          <td mat-cell *matCellDef="let cuota">{{ cuota.numeroCuota }}</td>
        </ng-container>

        <ng-container matColumnDef="fechaVencimiento">
          <th mat-header-cell *matHeaderCellDef>Fecha</th>
          <td mat-cell *matCellDef="let cuota">{{ cuota.fechaVencimiento | date:'dd/MM/yyyy' }}</td>
        </ng-container>

        <ng-container matColumnDef="capital">
          <th mat-header-cell *matHeaderCellDef>Capital</th>
          <td mat-cell *matCellDef="let cuota">{{ cuota.capital | currency }}</td>
        </ng-container>

        <ng-container matColumnDef="interes">
          <th mat-header-cell *matHeaderCellDef>Interés</th>
          <td mat-cell *matCellDef="let cuota">{{ cuota.interes | currency }}</td>
        </ng-container>

        <ng-container matColumnDef="cuotaTotal">
          <th mat-header-cell *matHeaderCellDef>Total</th>
          <td mat-cell *matCellDef="let cuota" class="font-semibold">{{ cuota.cuotaTotal | currency }}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="['numeroCuota', 'fechaVencimiento', 'capital', 'interes', 'cuotaTotal']"></tr>
        <tr mat-row *matRowDef="let row; columns: ['numeroCuota', 'fechaVencimiento', 'capital', 'interes', 'cuotaTotal'];"></tr>
      </table>
    </div>

    <p *ngIf="planPagoPreview.planPago.length > 5" class="text-sm text-gray-500 mt-2 text-center">
      Mostrando las primeras 5 cuotas de {{ planPagoPreview.numeroCuotas }}
    </p>
  </mat-card-content>
</mat-card>
```

---

## 7. Service Method para Llamar al Endpoint

### 7.1. TypeScript (Service)
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface CalcularPlanPagoDto {
  monto: number;
  plazo: number; // Para DIARIO: días. Para SEMANAL/QUINCENAL/MENSUAL/etc: meses
  tasaInteres: number;
  periodicidad: string;
  tipoInteres: string;
  fechaPrimeraCuota?: string;
}

export interface PlanPagoResult {
  cuotaNormal: number;
  totalInteres: number;
  totalPagar: number;
  numeroCuotas: number;
  planPago: Array<{
    numeroCuota: number;
    fechaVencimiento: Date;
    capital: number;
    interes: number;
    cuotaTotal: number;
    saldoCapital: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private apiUrl = `${environment.apiUrl}/solicitudes`;

  constructor(private http: HttpClient) {}

  /**
   * Calcula el plan de pago sin guardarlo
   * @param dto - Datos para el cálculo
   * @returns Observable con el resultado del cálculo
   */
  calcularPlanPago(dto: CalcularPlanPagoDto): Observable<PlanPagoResult> {
    return this.http.post<PlanPagoResult>(
      `${this.apiUrl}/calcular-plan-pago`,
      dto
    );
  }
}
```

---

## 8. Ejemplo Completo: Componente Integrado

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SolicitudService, CalcularPlanPagoDto, PlanPagoResult } from './solicitud.service';

@Component({
  selector: 'app-solicitud-form',
  templateUrl: './solicitud-form.component.html',
  styleUrls: ['./solicitud-form.component.scss']
})
export class SolicitudFormComponent implements OnInit {
  form: FormGroup;
  numeroCuotasCalculado = 0;
  planPagoPreview: PlanPagoResult | null = null;
  cargandoPlanPago = false;

  constructor(
    private fb: FormBuilder,
    private solicitudService: SolicitudService
  ) {}

  ngOnInit() {
    this.inicializarFormulario();
    this.escucharCambios();
  }

  private inicializarFormulario() {
    this.form = this.fb.group({
      monto: [1000, [Validators.required, Validators.min(1)]],
      plazo: [3, [Validators.required, Validators.min(1)]],
      periodicidad: ['SEMANAL', Validators.required],
      tasaInteres: [24, [Validators.required, Validators.min(0)]],
      tipoInteres: ['AMORTIZADO', Validators.required],
      fechaPrimeraCuota: [null],
    });
  }

  private escucharCambios() {
    // Actualizar número de cuotas cuando cambie plazo o periodicidad
    this.form.get('plazo')?.valueChanges.subscribe(() => this.actualizarNumeroCuotas());
    this.form.get('periodicidad')?.valueChanges.subscribe(() => {
      this.actualizarNumeroCuotas();
      this.planPagoPreview = null; // Limpiar preview al cambiar periodicidad
    });
  }

  actualizarNumeroCuotas() {
    const plazo = this.form.get('plazo')?.value;
    const periodicidad = this.form.get('periodicidad')?.value;

    if (plazo && periodicidad) {
      this.numeroCuotasCalculado = this.calcularNumeroCuotas(plazo, periodicidad);
    } else {
      this.numeroCuotasCalculado = 0;
    }
  }

  calcularNumeroCuotas(plazo: number, periodicidad: string): number {
    switch(periodicidad) {
      case 'DIARIO': return plazo;
      case 'SEMANAL': return plazo * 4;
      case 'QUINCENAL': return plazo * 2;
      case 'MENSUAL': return plazo;
      case 'TRIMESTRAL': return Math.round(plazo / 3);
      case 'SEMESTRAL': return Math.round(plazo / 6);
      case 'ANUAL': return Math.round(plazo / 12);
      default: return plazo;
    }
  }

  getPlazolabel(periodicidad: string): string {
    return periodicidad === 'DIARIO' ? 'Plazo (días)' : 'Plazo (meses)';
  }

  previsualizarPlanPago() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargandoPlanPago = true;

    const dto: CalcularPlanPagoDto = this.form.value;

    this.solicitudService.calcularPlanPago(dto).subscribe({
      next: (resultado) => {
        this.planPagoPreview = resultado;
        this.cargandoPlanPago = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.cargandoPlanPago = false;
      }
    });
  }
}
```

---

## Resumen de Cambios en el Frontend

### Cambios Mínimos Requeridos:
1. Cambiar etiqueta del campo "Plazo" según periodicidad (DIARIO vs otros)
2. Actualizar validaciones si es necesario

### Cambios Recomendados:
1. Mostrar el número de cuotas calculado en tiempo real
2. Agregar tooltips informativos con la regla de conversión
3. Implementar vista previa del plan de pagos
4. Agregar tabla de conversión visual

### No Requiere Cambios:
- El endpoint `/api/solicitudes/calcular-plan-pago` ya maneja correctamente la lógica
- Los DTOs de solicitud no cambian
- El flujo de creación/aprobación de solicitudes no cambia

---

**Nota:** Todos los ejemplos son compatibles con Angular Material y Tailwind CSS.
