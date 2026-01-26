import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GarantiaService } from '../../services/garantia.service';

export type CatalogoType = 'tipo-garantia' | 'tipo-inmueble' | 'tipo-documento';

export interface CatalogoDialogData {
  type: CatalogoType;
  item?: any;
}

@Component({
  selector: 'app-catalogo-garantia-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit() ? 'Editar' : 'Nuevo' }} {{ getTitle() }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Código</mat-label>
          <input matInput formControlName="codigo" [readonly]="isEdit()" />
          @if (form.get('codigo')?.hasError('required')) {
            <mat-error>El código es requerido</mat-error>
          }
          @if (form.get('codigo')?.hasError('maxlength')) {
            <mat-error>Máximo 20 caracteres</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" />
          @if (form.get('nombre')?.hasError('required')) {
            <mat-error>El nombre es requerido</mat-error>
          }
          @if (form.get('nombre')?.hasError('maxlength')) {
            <mat-error>Máximo 100 caracteres</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="descripcion" rows="3"></textarea>
        </mat-form-field>

        @if (isEdit()) {
          <mat-slide-toggle formControlName="activo" color="primary">
            {{ form.get('activo')?.value ? 'Activo' : 'Inactivo' }}
          </mat-slide-toggle>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="isSaving()">Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        (click)="save()"
        [disabled]="form.invalid || isSaving()"
      >
        @if (isSaving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ isEdit() ? 'Actualizar' : 'Guardar' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .form-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 280px;
        padding-top: 8px;
      }
      .full-width {
        width: 100%;
      }
      mat-dialog-content {
        max-height: 70vh;
        overflow-y: auto;
      }
      mat-slide-toggle {
        margin-top: 8px;
      }
      mat-dialog-actions button mat-spinner {
        display: inline-block;
      }
    `,
  ],
})
export class CatalogoGarantiaDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CatalogoGarantiaDialogComponent>);
  private data: CatalogoDialogData = inject(MAT_DIALOG_DATA);
  private service = inject(GarantiaService);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;
  isSaving = signal(false);

  isEdit(): boolean {
    return !!this.data.item;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      codigo: [
        this.data.item?.codigo || '',
        [Validators.required, Validators.maxLength(20)],
      ],
      nombre: [
        this.data.item?.nombre || '',
        [Validators.required, Validators.maxLength(100)],
      ],
      descripcion: [this.data.item?.descripcion || ''],
      activo: [this.data.item?.activo ?? true],
    });
  }

  getTitle(): string {
    switch (this.data.type) {
      case 'tipo-garantia':
        return 'Tipo de Garantía';
      case 'tipo-inmueble':
        return 'Tipo de Inmueble';
      case 'tipo-documento':
        return 'Tipo de Documento';
    }
  }

  save(): void {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    const formData = this.form.value;

    let observable;
    if (this.isEdit()) {
      // Para edición, no enviar código si es readonly
      const updateData = { ...formData };
      delete updateData.codigo;

      switch (this.data.type) {
        case 'tipo-garantia':
          observable = this.service.updateTipoGarantia(this.data.item.id, updateData);
          break;
        case 'tipo-inmueble':
          observable = this.service.updateTipoInmueble(this.data.item.id, updateData);
          break;
        case 'tipo-documento':
          observable = this.service.updateTipoDocumento(this.data.item.id, updateData);
          break;
      }
    } else {
      switch (this.data.type) {
        case 'tipo-garantia':
          observable = this.service.createTipoGarantia(formData);
          break;
        case 'tipo-inmueble':
          observable = this.service.createTipoInmueble(formData);
          break;
        case 'tipo-documento':
          observable = this.service.createTipoDocumento(formData);
          break;
      }
    }

    observable.subscribe({
      next: () => {
        this.snackBar.open(
          `${this.getTitle()} ${this.isEdit() ? 'actualizado' : 'creado'} exitosamente`,
          'Cerrar',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBar.open(
          err.error?.message || `Error al ${this.isEdit() ? 'actualizar' : 'crear'} ${this.getTitle()}`,
          'Cerrar',
          { duration: 3000 }
        );
        this.isSaving.set(false);
      },
    });
  }
}
