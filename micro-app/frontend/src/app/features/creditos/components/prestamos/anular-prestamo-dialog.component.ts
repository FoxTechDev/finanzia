import { Component, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PrestamoService } from '../../services/prestamo.service';
import { AuthService } from '@core/services/auth.service';
import { Prestamo } from '@core/models/credito.model';

@Component({
  selector: 'app-anular-prestamo-dialog',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="warn">block</mat-icon>
      Anular Préstamo
    </h2>

    <mat-dialog-content>
      <div class="warning-banner">
        <mat-icon>warning</mat-icon>
        <div class="warning-text">
          <strong>Atención:</strong> Esta acción anulará el préstamo de forma permanente.
          Solo puede realizarse cuando no existen pagos registrados.
          Esta operación es irreversible.
        </div>
      </div>

      <div class="prestamo-info">
        <div class="info-row">
          <span class="label">N° Crédito:</span>
          <span class="value">{{ data.prestamo.numeroCredito }}</span>
        </div>
        <div class="info-row">
          <span class="label">Cliente:</span>
          <span class="value">{{ getNombreCliente() }}</span>
        </div>
        <div class="info-row">
          <span class="label">Monto:</span>
          <span class="value amount">{{ data.prestamo.montoAutorizado | currency:'USD' }}</span>
        </div>
        <div class="info-row">
          <span class="label">Estado:</span>
          <span class="value">{{ data.prestamo.estado }}</span>
        </div>
      </div>

      <form [formGroup]="anularForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Motivo de Anulación</mat-label>
          <textarea
            matInput
            formControlName="motivoAnulacion"
            rows="4"
            placeholder="Ingrese el motivo de la anulación (mínimo 10 caracteres)"
          ></textarea>
          @if (anularForm.get('motivoAnulacion')?.invalid && anularForm.get('motivoAnulacion')?.touched) {
            <mat-error>
              @if (anularForm.get('motivoAnulacion')?.hasError('required')) {
                El motivo es requerido
              } @else if (anularForm.get('motivoAnulacion')?.hasError('minlength')) {
                El motivo debe tener al menos 10 caracteres
              }
            </mat-error>
          }
          <mat-hint>{{ anularForm.get('motivoAnulacion')?.value?.length || 0 }} caracteres</mat-hint>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button
        mat-raised-button
        color="warn"
        (click)="confirmarAnulacion()"
        [disabled]="anularForm.invalid || procesando()"
      >
        @if (procesando()) {
          <mat-spinner diameter="20" style="display:inline-block;margin-right:8px;"></mat-spinner>
        } @else {
          <mat-icon>block</mat-icon>
        }
        Confirmar Anulación
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host { display: block; }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .warning-banner {
      display: flex;
      gap: 12px;
      padding: 16px;
      background: #fff3e0;
      border: 1px solid #ff9800;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .warning-banner mat-icon { color: #f57c00; }

    .warning-text {
      flex: 1;
      color: #e65100;
      font-size: 14px;
    }

    .prestamo-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .info-row {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .info-row .label {
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-row .value {
      font-size: 15px;
      font-weight: 500;
    }

    .info-row .value.amount { color: #1976d2; }

    .full-width { width: 100%; }

    mat-dialog-actions { padding: 16px 24px; }
  `],
})
export class AnularPrestamoDialogComponent {
  private fb = inject(FormBuilder);
  private prestamoService = inject(PrestamoService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  dialogRef = inject(MatDialogRef<AnularPrestamoDialogComponent>);
  data = inject<{ prestamo: Prestamo }>(MAT_DIALOG_DATA);

  procesando = signal(false);
  anularForm: FormGroup;

  constructor() {
    this.anularForm = this.fb.group({
      motivoAnulacion: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  getNombreCliente(): string {
    const c = this.data.prestamo.cliente;
    if (!c) return `Cliente ID: ${this.data.prestamo.personaId}`;
    if (c.nombreCompleto) return c.nombreCompleto;
    return `${c.nombre || ''} ${c.apellido || ''}`.trim();
  }

  confirmarAnulacion(): void {
    if (this.anularForm.invalid) return;

    this.procesando.set(true);
    const user = this.authService.currentUser();

    this.prestamoService.anular(this.data.prestamo.id, {
      motivoAnulacion: this.anularForm.get('motivoAnulacion')!.value,
      nombreUsuarioAnulacion: user
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
        : undefined,
    }).subscribe({
      next: (prestamo) => {
        this.procesando.set(false);
        this.snackBar.open('Préstamo anulado exitosamente', 'Cerrar', { duration: 5000 });
        this.dialogRef.close(prestamo);
      },
      error: (err) => {
        this.procesando.set(false);
        this.snackBar.open(err.error?.message || 'Error al anular el préstamo', 'Cerrar', { duration: 6000 });
      },
    });
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}
