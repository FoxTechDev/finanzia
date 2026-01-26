import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { UsuariosService, UsuarioExtendido } from '../../services/usuarios.service';

/**
 * Validador personalizado para verificar que las contraseñas coincidan
 */
function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');

  if (!newPassword || !confirmPassword) {
    return null;
  }

  return newPassword.value === confirmPassword.value ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-reset-password-dialog',
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
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>lock_reset</mat-icon>
      Restablecer Contraseña
    </h2>

    <mat-dialog-content>
      <div class="user-info">
        <mat-icon>person</mat-icon>
        <div class="user-details">
          <strong>{{ usuario.email }}</strong>
          @if (getNombreCompleto()) {
            <span class="user-name">{{ getNombreCompleto() }}</span>
          }
        </div>
      </div>

      <form [formGroup]="form" class="password-form">
        <!-- Nueva Contraseña -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nueva contraseña</mat-label>
          <input
            matInput
            [type]="hideNewPassword() ? 'password' : 'text'"
            formControlName="newPassword"
            autocomplete="new-password"
          />
          <mat-icon matPrefix>lock</mat-icon>
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="hideNewPassword.set(!hideNewPassword())"
            tabindex="-1"
          >
            <mat-icon>{{ hideNewPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.get('newPassword')?.hasError('required') && form.get('newPassword')?.touched) {
            <mat-error>La contraseña es requerida</mat-error>
          }
          @if (form.get('newPassword')?.hasError('minlength') && form.get('newPassword')?.touched) {
            <mat-error>La contraseña debe tener al menos 6 caracteres</mat-error>
          }
          <mat-hint>Mínimo 6 caracteres</mat-hint>
        </mat-form-field>

        <!-- Confirmar Contraseña -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Confirmar contraseña</mat-label>
          <input
            matInput
            [type]="hideConfirmPassword() ? 'password' : 'text'"
            formControlName="confirmPassword"
            autocomplete="new-password"
          />
          <mat-icon matPrefix>lock_outline</mat-icon>
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="hideConfirmPassword.set(!hideConfirmPassword())"
            tabindex="-1"
          >
            <mat-icon>{{ hideConfirmPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.get('confirmPassword')?.hasError('required') && form.get('confirmPassword')?.touched) {
            <mat-error>Debes confirmar la contraseña</mat-error>
          }
          @if (form.hasError('passwordsMismatch') && form.get('confirmPassword')?.touched) {
            <mat-error>Las contraseñas no coinciden</mat-error>
          }
        </mat-form-field>

        @if (form.valid && !form.hasError('passwordsMismatch')) {
          <div class="success-message">
            <mat-icon>check_circle</mat-icon>
            <span>Las contraseñas coinciden</span>
          </div>
        }
      </form>

      <div class="warning-message">
        <mat-icon>warning</mat-icon>
        <span>Esta acción restablecerá la contraseña del usuario. El usuario deberá usar la nueva contraseña para iniciar sesión.</span>
      </div>
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
        [disabled]="form.invalid || isSaving()"
      >
        @if (isSaving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          <mat-icon>lock_reset</mat-icon>
          Restablecer
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

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .user-info mat-icon {
      color: #666;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .user-details strong {
      font-size: 14px;
      color: #333;
    }

    .user-name {
      font-size: 12px;
      color: #666;
    }

    .password-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 8px;
    }

    .full-width {
      width: 100%;
    }

    .success-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background-color: #e8f5e9;
      color: #2e7d32;
      border-radius: 4px;
      font-size: 14px;
    }

    .success-message mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .warning-message {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 12px;
      background-color: #fff3e0;
      color: #e65100;
      border-radius: 4px;
      font-size: 13px;
      margin-top: 16px;
    }

    .warning-message mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
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

      .user-info {
        padding: 12px;
      }
    }
  `],
})
export class ResetPasswordDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ResetPasswordDialogComponent>);
  private usuariosService = inject(UsuariosService);
  private snackBar = inject(MatSnackBar);
  public usuario = inject<UsuarioExtendido>(MAT_DIALOG_DATA);

  form!: FormGroup;
  isSaving = signal(false);
  hideNewPassword = signal(true);
  hideConfirmPassword = signal(true);

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, {
      validators: passwordsMatchValidator
    });
  }

  getNombreCompleto(): string {
    const firstName = this.usuario.firstName?.trim() || '';
    const lastName = this.usuario.lastName?.trim() || '';

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }

    return firstName || lastName || '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const { newPassword } = this.form.value;

    this.usuariosService.resetPassword(this.usuario.id, newPassword).subscribe({
      next: () => {
        this.snackBar.open('Contraseña restablecida exitosamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error al restablecer contraseña:', error);
        const mensaje = error.error?.message || 'Error al restablecer contraseña';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
        this.isSaving.set(false);
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
