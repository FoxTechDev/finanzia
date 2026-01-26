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
import { CatalogoBase, CatalogoConfig } from '@core/models/catalogo.model';
import { CatalogoBaseService } from '../../services/catalogo-base.service';

interface DialogData {
  catalogo: CatalogoBase | null;
  config: CatalogoConfig;
}

@Component({
  selector: 'app-catalogo-form-dialog',
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
  ],
  templateUrl: './catalogo-form-dialog.component.html',
  styleUrl: './catalogo-form-dialog.component.scss',
})
export class CatalogoFormDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<CatalogoFormDialogComponent>);
  private fb = inject(FormBuilder);
  private catalogoService = inject(CatalogoBaseService);
  private snackBar = inject(MatSnackBar);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  form!: FormGroup;
  isSaving = signal(false);
  isEditMode = false;

  ngOnInit(): void {
    this.isEditMode = !!this.data.catalogo;
    this.initForm();
  }

  /**
   * Inicializa el formulario con validaciones
   */
  private initForm(): void {
    this.form = this.fb.group({
      codigo: [
        this.data.catalogo?.codigo || '',
        [Validators.required, Validators.maxLength(50)],
      ],
      nombre: [
        this.data.catalogo?.nombre || '',
        [Validators.required, Validators.maxLength(100)],
      ],
      descripcion: [
        this.data.catalogo?.descripcion || '',
        [Validators.maxLength(500)],
      ],
      activo: [this.data.catalogo?.activo ?? true],
      orden: [
        this.data.catalogo?.orden || null,
        [Validators.min(0), Validators.max(9999)],
      ],
    });
  }

  /**
   * Guarda el formulario (crear o actualizar)
   */
  save(): void {
    if (this.form.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const formData = this.form.value;

    const request$ = this.isEditMode
      ? this.catalogoService.update(
          this.data.config.endpoint,
          this.data.catalogo!.id,
          formData
        )
      : this.catalogoService.create(this.data.config.endpoint, formData);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          `Registro ${this.isEditMode ? 'actualizado' : 'creado'} correctamente`,
          'Cerrar',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error al guardar:', error);
        let mensaje = 'Error al guardar el registro';

        if (error.error?.message) {
          mensaje = error.error.message;
        } else if (error.status === 409) {
          mensaje = 'Ya existe un registro con ese código';
        }

        this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
        this.isSaving.set(false);
      },
    });
  }

  /**
   * Marca todos los campos como tocados para mostrar errores
   */
  private markAllAsTouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.markAsTouched();
    });
  }

  /**
   * Cierra el diálogo
   */
  cancel(): void {
    if (this.form.dirty) {
      if (confirm('¿Desea descartar los cambios?')) {
        this.dialogRef.close(false);
      }
    } else {
      this.dialogRef.close(false);
    }
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
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
      const min = control.errors['min'].min;
      return `El valor mínimo es ${min}`;
    }
    if (control.errors['max']) {
      const max = control.errors['max'].max;
      return `El valor máximo es ${max}`;
    }

    return 'Campo inválido';
  }

  /**
   * Verifica si un campo tiene errores
   */
  hasError(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.errors && control.touched);
  }
}
