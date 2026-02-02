import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ClasificacionPrestamoService } from '../../services/clasificacion-prestamo.service';
import { ClasificacionPrestamo } from '@core/models/credito.model';

@Component({
  selector: 'app-clasificacion-prestamo-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSlideToggleModule,
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>{{ isEditMode ? 'Editar Clasificación' : 'Nueva Clasificación' }}</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div mat-dialog-content class="dialog-content">
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Código</mat-label>
              <input matInput formControlName="codigo" [readonly]="isEditMode" maxlength="10" />
              <mat-hint>Código único de la clasificación (ej: A, B, C)</mat-hint>
              @if (form.get('codigo')?.hasError('required') && form.get('codigo')?.touched) {
                <mat-error>El código es requerido</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="nombre" maxlength="100" />
              <mat-hint>Nombre de la categoría (ej: Normal, Subnormal)</mat-hint>
              @if (form.get('nombre')?.hasError('required') && form.get('nombre')?.touched) {
                <mat-error>El nombre es requerido</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción</mat-label>
              <textarea matInput formControlName="descripcion" rows="3" maxlength="500"></textarea>
              <mat-hint>Descripción detallada de la clasificación</mat-hint>
            </mat-form-field>
          </div>

          <div class="form-row-2">
            <mat-form-field appearance="outline">
              <mat-label>Días Mora Mínimo</mat-label>
              <input matInput type="number" formControlName="diasMoraMinimo" min="0" />
              <mat-icon matPrefix>calendar_today</mat-icon>
              @if (form.get('diasMoraMinimo')?.hasError('required') && form.get('diasMoraMinimo')?.touched) {
                <mat-error>Campo requerido</mat-error>
              }
              @if (form.get('diasMoraMinimo')?.hasError('min')) {
                <mat-error>Debe ser mayor o igual a 0</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Días Mora Máximo</mat-label>
              <input matInput type="number" formControlName="diasMoraMaximo" min="0" />
              <mat-icon matPrefix>calendar_today</mat-icon>
              <mat-hint>Dejar vacío si no tiene límite superior</mat-hint>
              @if (form.get('diasMoraMaximo')?.hasError('min')) {
                <mat-error>Debe ser mayor o igual a 0</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="form-row-2">
            <mat-form-field appearance="outline">
              <mat-label>Porcentaje de Provisión (%)</mat-label>
              <input matInput type="number" formControlName="porcentajeProvision" min="0" max="100" step="0.01" />
              <mat-icon matPrefix>percent</mat-icon>
              @if (form.get('porcentajeProvision')?.hasError('required') && form.get('porcentajeProvision')?.touched) {
                <mat-error>Campo requerido</mat-error>
              }
              @if (form.get('porcentajeProvision')?.hasError('min') || form.get('porcentajeProvision')?.hasError('max')) {
                <mat-error>Debe estar entre 0 y 100</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Orden de Visualización</mat-label>
              <input matInput type="number" formControlName="orden" min="0" />
              <mat-icon matPrefix>sort</mat-icon>
              <mat-hint>Número de orden para mostrar la clasificación</mat-hint>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-slide-toggle formControlName="activo" color="primary">
              Clasificación Activa
            </mat-slide-toggle>
          </div>
        </div>

        <div mat-dialog-actions class="dialog-actions">
          <button mat-button type="button" (click)="close()">
            Cancelar
          </button>
          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || isSaving()"
          >
            @if (isSaving()) {
              <mat-spinner diameter="20" style="display: inline-block; margin-right: 8px;"></mat-spinner>
            }
            {{ isEditMode ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
      min-width: 500px;
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }

    .dialog-content {
      padding: 24px !important;
      max-height: 70vh;
      overflow-y: auto;
    }

    .dialog-actions {
      padding: 16px 24px !important;
      border-top: 1px solid #e0e0e0;
      justify-content: flex-end !important;
      gap: 8px;
    }

    .form-row {
      margin-bottom: 16px;
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      width: 100%;
    }

    mat-slide-toggle {
      margin-bottom: 16px;
    }

    @media (max-width: 600px) {
      .dialog-container {
        min-width: auto;
        width: 100%;
      }

      .form-row-2 {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class ClasificacionPrestamoDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ClasificacionPrestamoDialogComponent>);
  private service = inject(ClasificacionPrestamoService);
  private snackBar = inject(MatSnackBar);
  data = inject<ClasificacionPrestamo | null>(MAT_DIALOG_DATA);

  form!: FormGroup;
  isSaving = signal(false);
  isEditMode = false;

  ngOnInit(): void {
    this.isEditMode = !!this.data;
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      codigo: [
        { value: this.data?.codigo || '', disabled: this.isEditMode },
        [Validators.required, Validators.maxLength(10)]
      ],
      nombre: [this.data?.nombre || '', [Validators.required, Validators.maxLength(100)]],
      descripcion: [this.data?.descripcion || '', [Validators.maxLength(500)]],
      diasMoraMinimo: [this.data?.diasMoraMinimo ?? 0, [Validators.required, Validators.min(0)]],
      diasMoraMaximo: [this.data?.diasMoraMaximo ?? '', [Validators.min(0)]],
      porcentajeProvision: [
        this.data?.porcentajeProvision ?? 0,
        [Validators.required, Validators.min(0), Validators.max(100)]
      ],
      orden: [this.data?.orden ?? 0, [Validators.min(0)]],
      activo: [this.data?.activo ?? true],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Por favor, corrija los errores en el formulario', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isSaving.set(true);

    const formValue = this.form.getRawValue();

    // Normalizar y validar valores antes de enviar
    // Asegurar que los números sean realmente números
    formValue.diasMoraMinimo = Number(formValue.diasMoraMinimo) || 0;
    formValue.porcentajeProvision = Number(formValue.porcentajeProvision) || 0;
    formValue.orden = Number(formValue.orden) || 0;

    // Normalizar diasMoraMaximo
    if (formValue.diasMoraMaximo === '' || formValue.diasMoraMaximo === null || formValue.diasMoraMaximo === undefined) {
      formValue.diasMoraMaximo = null;
    } else {
      formValue.diasMoraMaximo = Number(formValue.diasMoraMaximo);
    }

    // Normalizar descripción
    if (formValue.descripcion && typeof formValue.descripcion === 'string') {
      formValue.descripcion = formValue.descripcion.trim() || null;
    } else {
      formValue.descripcion = null;
    }

    // Asegurar que activo sea booleano
    formValue.activo = Boolean(formValue.activo);

    // Preparar el request según el modo
    let request;
    if (this.isEditMode) {
      // En modo edición, excluir el código ya que no debe actualizarse
      const { codigo, ...updateData } = formValue;
      request = this.service.update(this.data!.id, updateData);
    } else {
      // En modo creación, incluir todos los campos
      request = this.service.create(formValue);
    }

    request.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode ? 'Clasificación actualizada exitosamente' : 'Clasificación creada exitosamente',
          'Cerrar',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error al guardar clasificación:', err);
        const errorMessage = err.error?.message || err.message || 'Error al guardar la clasificación';
        this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
        this.isSaving.set(false);
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
