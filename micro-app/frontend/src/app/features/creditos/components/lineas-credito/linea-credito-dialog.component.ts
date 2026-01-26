import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LineaCreditoService } from '../../services/linea-credito.service';
import { LineaCredito } from '@core/models/credito.model';

@Component({
  selector: 'app-linea-credito-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar' : 'Nueva' }} Línea de Crédito</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Código</mat-label>
          <input matInput formControlName="codigo" maxlength="10" />
          @if (form.get('codigo')?.hasError('required')) {
            <mat-error>El código es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" maxlength="100" />
          @if (form.get('nombre')?.hasError('required')) {
            <mat-error>El nombre es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="descripcion" rows="3" maxlength="255"></textarea>
        </mat-form-field>

        <mat-checkbox formControlName="activo">Activo</mat-checkbox>
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
      .full-width {
        width: 100%;
        margin-bottom: 8px;
      }
      mat-dialog-content {
        min-width: 350px;
      }
    `,
  ],
})
export class LineaCreditoDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<LineaCreditoDialogComponent>);
  private service = inject(LineaCreditoService);
  private snackBar = inject(MatSnackBar);
  data: LineaCredito | null = inject(MAT_DIALOG_DATA);

  isLoading = false;
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      codigo: [this.data?.codigo || '', Validators.required],
      nombre: [this.data?.nombre || '', Validators.required],
      descripcion: [this.data?.descripcion || ''],
      activo: [this.data?.activo ?? true],
    });
  }

  save(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    const formData = this.form.value;

    const request$ = this.data
      ? this.service.update(this.data.id, formData)
      : this.service.create(formData);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          `Línea de crédito ${this.data ? 'actualizada' : 'creada'} exitosamente`,
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
