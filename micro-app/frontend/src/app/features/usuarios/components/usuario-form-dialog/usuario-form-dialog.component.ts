import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { UsuariosService, UsuarioExtendido } from '../../services/usuarios.service';
import { Rol } from '@core/models/user.model';

@Component({
  selector: 'app-usuario-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ isEditing ? 'edit' : 'person_add' }}</mat-icon>
      {{ isEditing ? 'Editar' : 'Nuevo' }} Usuario
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="usuario-form">
        <!-- Email -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Correo electrónico</mat-label>
          <input
            matInput
            type="email"
            formControlName="email"
            placeholder="usuario@ejemplo.com"
            [readonly]="isEditing"
          />
          <mat-icon matPrefix>email</mat-icon>
          @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
            <mat-error>El correo es requerido</mat-error>
          }
          @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
            <mat-error>Ingresa un correo válido</mat-error>
          }
          @if (isEditing) {
            <mat-hint>El correo no se puede modificar</mat-hint>
          }
        </mat-form-field>

        <!-- Password - Solo al crear -->
        @if (!isEditing) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Contraseña</mat-label>
            <input
              matInput
              [type]="hidePassword() ? 'password' : 'text'"
              formControlName="password"
            />
            <mat-icon matPrefix>lock</mat-icon>
            <button
              mat-icon-button
              matSuffix
              type="button"
              (click)="hidePassword.set(!hidePassword())"
            >
              <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
              <mat-error>La contraseña es requerida</mat-error>
            }
            @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
              <mat-error>La contraseña debe tener al menos 6 caracteres</mat-error>
            }
          </mat-form-field>
        }

        <!-- Nombre -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input
            matInput
            type="text"
            formControlName="firstName"
            placeholder="Juan"
          />
          <mat-icon matPrefix>person</mat-icon>
        </mat-form-field>

        <!-- Apellido -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Apellido</mat-label>
          <input
            matInput
            type="text"
            formControlName="lastName"
            placeholder="Pérez"
          />
          <mat-icon matPrefix>person_outline</mat-icon>
        </mat-form-field>

        <!-- Rol -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Rol</mat-label>
          <mat-select formControlName="rolId">
            <mat-option [value]="null">Sin rol asignado</mat-option>
            @if (isLoadingRoles()) {
              <mat-option disabled>
                <mat-spinner diameter="20"></mat-spinner>
                Cargando roles...
              </mat-option>
            } @else {
              @for (rol of roles(); track rol.id) {
                <mat-option [value]="rol.id">
                  {{ rol.nombre }} ({{ rol.codigo }})
                </mat-option>
              }
            }
          </mat-select>
          <mat-icon matPrefix>badge</mat-icon>
          <mat-hint>Selecciona el rol del usuario</mat-hint>
        </mat-form-field>

        <!-- Estado Activo - Solo al editar -->
        @if (isEditing) {
          <div class="checkbox-wrapper">
            <mat-checkbox formControlName="isActive" color="primary">
              Usuario activo
            </mat-checkbox>
            <mat-hint class="checkbox-hint">
              Los usuarios inactivos no pueden iniciar sesión
            </mat-hint>
          </div>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button
        mat-button
        (click)="onCancel()"
        [disabled]="isSaving()"
      >
        Cancelar
      </button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSubmit()"
        [disabled]="form.invalid || isSaving() || isLoadingRoles()"
      >
        @if (isSaving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          <mat-icon>save</mat-icon>
          {{ isEditing ? 'Actualizar' : 'Crear' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 400px;
      max-height: 70vh;
      overflow-y: auto;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    .usuario-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 8px;
    }

    .full-width {
      width: 100%;
    }

    .checkbox-wrapper {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px 0;
    }

    .checkbox-hint {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      margin-left: 32px;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      gap: 8px;
    }

    button[mat-raised-button] {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Responsive */
    @media (max-width: 600px) {
      mat-dialog-content {
        min-width: unset;
        width: 100%;
      }
    }
  `],
})
export class UsuarioFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<UsuarioFormDialogComponent>);
  private usuariosService = inject(UsuariosService);
  private snackBar = inject(MatSnackBar);
  public data = inject<UsuarioExtendido | null>(MAT_DIALOG_DATA);

  form!: FormGroup;
  isEditing = false;
  isSaving = signal(false);
  hidePassword = signal(true);
  roles = signal<Rol[]>([]);
  isLoadingRoles = signal(false);

  ngOnInit(): void {
    this.isEditing = !!this.data;
    this.initForm();
    this.loadRoles();
  }

  private initForm(): void {
    // Campos comunes
    const commonFields = {
      email: [
        this.data?.email || '',
        [Validators.required, Validators.email]
      ],
      firstName: [this.data?.firstName || ''],
      lastName: [this.data?.lastName || ''],
      rolId: [this.data?.rol?.id || null],
    };

    // Si es edición, agregar isActive
    if (this.isEditing) {
      this.form = this.fb.group({
        ...commonFields,
        isActive: [this.data?.isActive ?? true],
      });
    } else {
      // Si es creación, agregar password
      this.form = this.fb.group({
        ...commonFields,
        password: ['', [Validators.required, Validators.minLength(6)]],
      });
    }
  }

  private loadRoles(): void {
    this.isLoadingRoles.set(true);
    this.usuariosService.getRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.isLoadingRoles.set(false);
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.snackBar.open('Error al cargar roles', 'Cerrar', { duration: 3000 });
        this.isLoadingRoles.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.form.value;

    // Preparar datos según si es creación o edición
    const request$ = this.isEditing
      ? this.usuariosService.update(this.data!.id, formValue)
      : this.usuariosService.create(formValue);

    request$.subscribe({
      next: () => {
        const mensaje = this.isEditing
          ? 'Usuario actualizado exitosamente'
          : 'Usuario creado exitosamente';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error al guardar usuario:', error);
        const mensaje = error.error?.message || 'Error al guardar usuario';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
        this.isSaving.set(false);
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
