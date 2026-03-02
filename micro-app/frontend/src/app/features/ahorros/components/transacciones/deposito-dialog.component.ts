import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TransaccionAhorroService } from '../../services/transaccion-ahorro.service';

@Component({
  selector: 'app-deposito-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>Registrar Depósito</h2>
    <mat-dialog-content>
      <p class="saldo-info">Saldo actual: <strong>\${{ data.saldo | number:'1.2-2' }}</strong></p>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Monto ($)</mat-label>
          <input matInput type="number" formControlName="monto" step="0.01" />
          @if (form.get('monto')?.hasError('required')) {
            <mat-error>El monto es requerido</mat-error>
          }
          @if (form.get('monto')?.hasError('min')) {
            <mat-error>El monto debe ser mayor a 0</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fecha</mat-label>
          <input matInput type="date" formControlName="fecha" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observación</mat-label>
          <textarea matInput formControlName="observacion" rows="2" maxlength="200"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid || isLoading" (click)="save()">
        {{ isLoading ? 'Procesando...' : 'Depositar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 8px; }
    mat-dialog-content { min-width: 320px; }
    .saldo-info { margin-bottom: 16px; color: #666; }
    .saldo-info strong { color: #1976d2; font-size: 18px; }
  `],
})
export class DepositoDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<DepositoDialogComponent>);
  private service = inject(TransaccionAhorroService);
  private snackBar = inject(MatSnackBar);
  data: { cuentaId: number; saldo: number } = inject(MAT_DIALOG_DATA);

  isLoading = false;
  form: FormGroup;

  constructor() {
    const hoy = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      monto: [null, [Validators.required, Validators.min(0.01)]],
      fecha: [hoy],
      observacion: [''],
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.isLoading = true;

    this.service.depositar(this.data.cuentaId, this.form.value).subscribe({
      next: () => {
        this.snackBar.open('Depósito registrado exitosamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al depositar', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      },
    });
  }
}
