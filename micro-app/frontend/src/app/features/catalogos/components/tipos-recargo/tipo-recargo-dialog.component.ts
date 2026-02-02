import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { TipoRecargo } from './tipos-recargo.component';

interface DialogData {
  tipoRecargo: TipoRecargo | null;
}

@Component({
  selector: 'app-tipo-recargo-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatIconModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ isEditMode ? 'edit' : 'add' }}</mat-icon>
      {{ isEditMode ? 'Editar' : 'Nuevo' }} Tipo de Recargo
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Código</mat-label>
            <input matInput formControlName="codigo" placeholder="Ej: MORA, SEGURO" />
            @if (hasError('codigo')) {
              <mat-error>{{ getErrorMessage('codigo') }}</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="nombre" placeholder="Nombre del tipo de recargo" />
            @if (hasError('nombre')) {
              <mat-error>{{ getErrorMessage('nombre') }}</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Descripción</mat-label>
            <textarea
              matInput
              formControlName="descripcion"
              rows="3"
              placeholder="Descripción opcional"
            ></textarea>
          </mat-form-field>
        </div>

        <div class="form-row two-columns">
          <mat-form-field appearance="outline">
            <mat-label>Tipo de Cálculo Default</mat-label>
            <mat-select formControlName="tipoCalculoDefault">
              <mat-option value="FIJO">Fijo (monto fijo)</mat-option>
              <mat-option value="PORCENTAJE">Porcentaje (%)</mat-option>
            </mat-select>
            @if (hasError('tipoCalculoDefault')) {
              <mat-error>{{ getErrorMessage('tipoCalculoDefault') }}</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>
              Valor Default {{ form.get('tipoCalculoDefault')?.value === 'PORCENTAJE' ? '(%)' : '($)' }}
            </mat-label>
            <input
              matInput
              type="number"
              formControlName="valorDefault"
              [placeholder]="form.get('tipoCalculoDefault')?.value === 'PORCENTAJE' ? 'Ej: 5' : 'Ej: 10.00'"
              step="0.01"
              min="0"
            />
            @if (hasError('valorDefault')) {
              <mat-error>{{ getErrorMessage('valorDefault') }}</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-slide-toggle formControlName="activo" color="primary">
            Activo
          </mat-slide-toggle>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()" [disabled]="isSaving()">Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        (click)="save()"
        [disabled]="isSaving() || form.invalid"
      >
        @if (isSaving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          <mat-icon>save</mat-icon>
          Guardar
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      h2[mat-dialog-title] {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .form-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 400px;
      }

      .form-row {
        display: flex;
        gap: 16px;
      }

      .form-row.two-columns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .full-width {
        width: 100%;
      }

      mat-form-field {
        width: 100%;
      }

      mat-dialog-actions button {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      @media (max-width: 600px) {
        .form-container {
          min-width: unset;
        }

        .form-row.two-columns {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class TipoRecargoDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<TipoRecargoDialogComponent>);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  form!: FormGroup;
  isSaving = signal(false);
  isEditMode = false;

  ngOnInit(): void {
    this.isEditMode = !!this.data.tipoRecargo;
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      codigo: [
        this.data.tipoRecargo?.codigo || '',
        [Validators.required, Validators.maxLength(20)],
      ],
      nombre: [
        this.data.tipoRecargo?.nombre || '',
        [Validators.required, Validators.maxLength(100)],
      ],
      descripcion: [this.data.tipoRecargo?.descripcion || ''],
      tipoCalculoDefault: [
        this.data.tipoRecargo?.tipoCalculoDefault || 'FIJO',
        [Validators.required],
      ],
      valorDefault: [
        this.data.tipoRecargo?.valorDefault || 0,
        [Validators.required, Validators.min(0)],
      ],
      activo: [this.data.tipoRecargo?.activo ?? true],
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const formData = this.form.value;

    const request$ = this.isEditMode
      ? this.http.put<TipoRecargo>(
          `${environment.apiUrl}/tipos-recargo/${this.data.tipoRecargo!.id}`,
          formData
        )
      : this.http.post<TipoRecargo>(`${environment.apiUrl}/tipos-recargo`, formData);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          `Tipo de recargo ${this.isEditMode ? 'actualizado' : 'creado'} correctamente`,
          'Cerrar',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error al guardar:', error);
        let mensaje = 'Error al guardar el tipo de recargo';

        if (error.error?.message) {
          mensaje = error.error.message;
        } else if (error.status === 409) {
          mensaje = 'Ya existe un tipo de recargo con ese código';
        }

        this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
        this.isSaving.set(false);
      },
    });
  }

  private markAllAsTouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.markAsTouched();
    });
  }

  cancel(): void {
    if (this.form.dirty) {
      if (confirm('¿Desea descartar los cambios?')) {
        this.dialogRef.close(false);
      }
    } else {
      this.dialogRef.close(false);
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es requerido';
    }
    if (control.errors['maxlength']) {
      const maxLength = control.errors['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }
    if (control.errors['min']) {
      return 'El valor debe ser mayor o igual a 0';
    }

    return 'Campo inválido';
  }

  hasError(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.errors && control.touched);
  }
}
