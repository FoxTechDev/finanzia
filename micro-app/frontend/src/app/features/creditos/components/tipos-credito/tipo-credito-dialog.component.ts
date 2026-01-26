import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { TipoCreditoService } from '../../services/tipo-credito.service';
import { LineaCreditoService } from '../../services/linea-credito.service';
import { TipoCredito, LineaCredito } from '@core/models/credito.model';

@Component({
  selector: 'app-tipo-credito-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTabsModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar' : 'Nuevo' }} Tipo de Crédito</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-tab-group>
          <mat-tab label="Información General">
            <div class="tab-content">
              <!-- Código: solo se muestra en modo edición (solo lectura) -->
              @if (data) {
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Código</mat-label>
                  <input matInput [value]="data.codigo" readonly />
                  <mat-hint>El código se genera automáticamente</mat-hint>
                </mat-form-field>
              }

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Línea de Crédito</mat-label>
                <mat-select formControlName="lineaCreditoId">
                  @for (linea of lineas; track linea.id) {
                    <mat-option [value]="linea.id">{{ linea.nombre }}</mat-option>
                  }
                </mat-select>
                @if (form.get('lineaCreditoId')?.hasError('required')) {
                  <mat-error>La línea es requerida</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="nombre" maxlength="150" />
                @if (form.get('nombre')?.hasError('required')) {
                  <mat-error>El nombre es requerido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Descripción</mat-label>
                <textarea matInput formControlName="descripcion" rows="2"></textarea>
              </mat-form-field>

              <div class="row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Vigencia Desde</mat-label>
                  <input matInput type="date" formControlName="fechaVigenciaDesde" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Vigencia Hasta</mat-label>
                  <input matInput type="date" formControlName="fechaVigenciaHasta" />
                </mat-form-field>
              </div>

              <mat-checkbox formControlName="activo">Activo</mat-checkbox>
            </div>
          </mat-tab>

          <mat-tab label="Tasas de Interés">
            <div class="tab-content">
              <div class="row">
                <mat-form-field appearance="outline" class="third-width">
                  <mat-label>Tasa Mínima (%)</mat-label>
                  <input matInput type="number" formControlName="tasaInteresMinima" step="0.01" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="third-width">
                  <mat-label>Tasa Estándar (%)</mat-label>
                  <input matInput type="number" formControlName="tasaInteres" step="0.01" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="third-width">
                  <mat-label>Tasa Máxima (%)</mat-label>
                  <input matInput type="number" formControlName="tasaInteresMaxima" step="0.01" />
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tasa Moratoria (%)</mat-label>
                <input matInput type="number" formControlName="tasaInteresMoratorio" step="0.01" />
              </mat-form-field>
            </div>
          </mat-tab>

          <mat-tab label="Montos y Plazos">
            <div class="tab-content">
              <div class="row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Monto Mínimo ($)</mat-label>
                  <input matInput type="number" formControlName="montoMinimo" step="0.01" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Monto Máximo ($)</mat-label>
                  <input matInput type="number" formControlName="montoMaximo" step="0.01" />
                </mat-form-field>
              </div>

              <div class="row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Plazo Mínimo (meses)</mat-label>
                  <input matInput type="number" formControlName="plazoMinimo" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Plazo Máximo (meses)</mat-label>
                  <input matInput type="number" formControlName="plazoMaximo" />
                </mat-form-field>
              </div>
            </div>
          </mat-tab>

          <mat-tab label="Condiciones">
            <div class="tab-content">
              <div class="row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Periodicidad de Pago</mat-label>
                  <mat-select formControlName="periodicidadPago">
                    <mat-option value="semanal">Semanal</mat-option>
                    <mat-option value="quincenal">Quincenal</mat-option>
                    <mat-option value="mensual">Mensual</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Tipo de Cuota</mat-label>
                  <mat-select formControlName="tipoCuota">
                    <mat-option value="fija">Fija</mat-option>
                    <mat-option value="variable">Variable</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Días de Gracia</mat-label>
                <input matInput type="number" formControlName="diasGracia" />
                <mat-hint>Número de días de gracia antes del primer pago</mat-hint>
              </mat-form-field>

              <mat-checkbox formControlName="requiereGarantia">Requiere Garantía</mat-checkbox>
            </div>
          </mat-tab>
        </mat-tab-group>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="form.invalid || isLoading"
        (click)="save()"
      >
        {{ isLoading ? 'Guardando...' : 'Guardar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .full-width { width: 100%; margin-bottom: 8px; }
      .half-width { width: 48%; margin-bottom: 8px; }
      .third-width { width: 31%; margin-bottom: 8px; }
      .row { display: flex; gap: 16px; flex-wrap: wrap; }
      .tab-content { padding: 16px 0; }
      mat-dialog-content { min-width: 500px; max-height: 60vh; }
    `,
  ],
})
export class TipoCreditoDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TipoCreditoDialogComponent>);
  private service = inject(TipoCreditoService);
  private lineaService = inject(LineaCreditoService);
  private snackBar = inject(MatSnackBar);
  data: TipoCredito | null = inject(MAT_DIALOG_DATA);

  isLoading = false;
  lineas: LineaCredito[] = [];
  form: FormGroup;

  constructor() {
    const today = new Date().toISOString().split('T')[0];
    // El código se genera automáticamente en el backend, no se incluye en el formulario
    this.form = this.fb.group({
      nombre: [this.data?.nombre || '', Validators.required],
      descripcion: [this.data?.descripcion || ''],
      lineaCreditoId: [this.data?.lineaCreditoId || '', Validators.required],
      tasaInteres: [this.data?.tasaInteres || 0, [Validators.required, Validators.min(0)]],
      tasaInteresMinima: [this.data?.tasaInteresMinima || 0, [Validators.required, Validators.min(0)]],
      tasaInteresMaxima: [this.data?.tasaInteresMaxima || 0, [Validators.required, Validators.min(0)]],
      tasaInteresMoratorio: [this.data?.tasaInteresMoratorio || 0, [Validators.required, Validators.min(0)]],
      montoMinimo: [this.data?.montoMinimo || 0, [Validators.required, Validators.min(0)]],
      montoMaximo: [this.data?.montoMaximo || 0, [Validators.required, Validators.min(0)]],
      plazoMinimo: [this.data?.plazoMinimo || 1, [Validators.required, Validators.min(1)]],
      plazoMaximo: [this.data?.plazoMaximo || 12, [Validators.required, Validators.min(1)]],
      periodicidadPago: [this.data?.periodicidadPago || 'mensual'],
      tipoCuota: [this.data?.tipoCuota || 'fija'],
      diasGracia: [this.data?.diasGracia || 0, Validators.min(0)],
      requiereGarantia: [this.data?.requiereGarantia || false],
      fechaVigenciaDesde: [this.data?.fechaVigenciaDesde || today, Validators.required],
      fechaVigenciaHasta: [this.data?.fechaVigenciaHasta || ''],
      activo: [this.data?.activo ?? true],
    });
  }

  ngOnInit(): void {
    this.lineaService.getAll(true).subscribe({
      next: (data) => (this.lineas = data),
      error: () => this.snackBar.open('Error al cargar líneas de crédito', 'Cerrar', { duration: 3000 }),
    });
  }

  save(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    const formData = { ...this.form.value };

    // Limpiar campos opcionales vacíos
    if (!formData.fechaVigenciaHasta) delete formData.fechaVigenciaHasta;
    if (!formData.descripcion) delete formData.descripcion;

    const request$ = this.data
      ? this.service.update(this.data.id, formData)
      : this.service.create(formData);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          `Tipo de crédito ${this.data ? 'actualizado' : 'creado'} exitosamente`,
          'Cerrar',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBar.open(
          err.error?.message || 'Error al guardar',
          'Cerrar',
          { duration: 3000 }
        );
        this.isLoading = false;
      },
    });
  }
}
