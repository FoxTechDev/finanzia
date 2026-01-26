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

import { PagoService } from '../../../services/pago.service';
import { Pago } from '@core/models/credito.model';

@Component({
  selector: 'app-anular-pago-dialog',
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
      <mat-icon color="warn">cancel</mat-icon>
      Anular Pago
    </h2>

    <mat-dialog-content>
      <div class="warning-banner">
        <mat-icon>warning</mat-icon>
        <div class="warning-text">
          <strong>Atención:</strong> Esta acción revertirá todos los cambios realizados por este pago,
          incluyendo los saldos del préstamo y el estado de las cuotas afectadas.
        </div>
      </div>

      <div class="pago-info">
        <div class="info-row">
          <span class="label">N° Pago:</span>
          <span class="value">{{ data.pago.numeroPago }}</span>
        </div>
        <div class="info-row">
          <span class="label">Fecha:</span>
          <span class="value">{{ data.pago.fechaPago | date:'dd/MM/yyyy' }}</span>
        </div>
        <div class="info-row">
          <span class="label">Monto:</span>
          <span class="value amount">{{ data.pago.montoPagado | currency:'USD' }}</span>
        </div>
      </div>

      <form [formGroup]="anularForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Motivo de Anulación</mat-label>
          <textarea
            matInput
            formControlName="motivoAnulacion"
            rows="3"
            placeholder="Ingrese el motivo de la anulación (mínimo 10 caracteres)"
          ></textarea>
          @if (anularForm.get('motivoAnulacion')?.invalid && anularForm.get('motivoAnulacion')?.touched) {
            <mat-error>
              @if (anularForm.get('motivoAnulacion')?.hasError('required')) {
                El motivo es requerido
              }
              @if (anularForm.get('motivoAnulacion')?.hasError('minlength')) {
                El motivo debe tener al menos 10 caracteres
              }
            </mat-error>
          }
          <mat-hint>{{ anularForm.get('motivoAnulacion')?.value?.length || 0 }} / 10 caracteres mínimo</mat-hint>
        </mat-form-field>
      </form>

      <div class="impacto-section">
        <h4>Impacto de la Anulación</h4>
        <div class="impacto-grid">
          <div class="impacto-item">
            <span class="label">Saldo Capital se restaurará a:</span>
            <span class="value">{{ data.pago.saldoCapitalAnterior | currency:'USD' }}</span>
          </div>
          <div class="impacto-item">
            <span class="label">Saldo Interés se restaurará a:</span>
            <span class="value">{{ data.pago.saldoInteresAnterior | currency:'USD' }}</span>
          </div>
          @if (data.pago.detallesCuota && data.pago.detallesCuota.length > 0) {
            <div class="impacto-item">
              <span class="label">Cuotas afectadas:</span>
              <span class="value">{{ data.pago.detallesCuota.length }} cuota(s)</span>
            </div>
          }
        </div>
      </div>
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
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          <mat-icon>cancel</mat-icon>
          Confirmar Anulación
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
    }

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

    .warning-banner mat-icon {
      color: #f57c00;
    }

    .warning-text {
      flex: 1;
      color: #e65100;
    }

    .pago-info {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .info-row {
      display: flex;
      flex-direction: column;
    }

    .info-row .label {
      font-size: 12px;
      color: #666;
    }

    .info-row .value {
      font-size: 16px;
      font-weight: 500;
    }

    .info-row .value.amount {
      color: #2e7d32;
    }

    .full-width {
      width: 100%;
    }

    .impacto-section {
      margin-top: 16px;
      padding: 16px;
      background: #ffebee;
      border-radius: 8px;
    }

    .impacto-section h4 {
      margin: 0 0 12px 0;
      color: #c62828;
      font-size: 14px;
    }

    .impacto-grid {
      display: grid;
      gap: 8px;
    }

    .impacto-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #ffcdd2;
    }

    .impacto-item:last-child {
      border-bottom: none;
    }

    .impacto-item .label {
      color: #666;
    }

    .impacto-item .value {
      font-weight: 500;
      color: #c62828;
    }

    mat-dialog-actions {
      padding: 16px 24px;
    }
  `],
})
export class AnularPagoDialogComponent {
  private fb = inject(FormBuilder);
  private pagoService = inject(PagoService);
  private snackBar = inject(MatSnackBar);
  dialogRef = inject(MatDialogRef<AnularPagoDialogComponent>);
  data = inject<{ pago: Pago }>(MAT_DIALOG_DATA);

  procesando = signal(false);

  anularForm: FormGroup;

  constructor() {
    this.anularForm = this.fb.group({
      motivoAnulacion: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  confirmarAnulacion(): void {
    if (this.anularForm.invalid) {
      return;
    }

    this.procesando.set(true);

    this.pagoService.anular(this.data.pago.id, {
      motivoAnulacion: this.anularForm.get('motivoAnulacion')?.value,
    }).subscribe({
      next: (pago) => {
        this.procesando.set(false);
        this.snackBar.open(`Pago ${pago.numeroPago} anulado exitosamente`, 'Cerrar', { duration: 5000 });
        this.dialogRef.close(pago);
      },
      error: (err) => {
        console.error('Error anulando pago:', err);
        this.snackBar.open(err.error?.message || 'Error al anular pago', 'Cerrar', { duration: 5000 });
        this.procesando.set(false);
      },
    });
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}
