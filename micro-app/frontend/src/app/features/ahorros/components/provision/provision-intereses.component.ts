import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { TransaccionAhorroService } from '../../services/transaccion-ahorro.service';

@Component({
  selector: 'app-provision-intereses',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DatePipe,
  ],
  template: `
    <div class="container">
      <!-- Encabezado -->
      <div class="header">
        <div>
          <h1>
            <mat-icon>calculate</mat-icon>
            Provisión de Intereses
          </h1>
          <p class="subtitle">
            Cálculo y registro de intereses diarios sobre cuentas de ahorro activas
          </p>
        </div>
      </div>

      <!-- Formulario -->
      <mat-card class="filters-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>event</mat-icon>
            Fecha de Provisión
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" class="filters-form">
            <div class="filters-row">
              <mat-form-field appearance="outline">
                <mat-label>Fecha</mat-label>
                <input
                  matInput
                  [matDatepicker]="picker"
                  formControlName="fecha"
                  placeholder="Seleccione fecha"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="picker"
                ></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                @if (form.get('fecha')?.hasError('required') &&
                     form.get('fecha')?.touched) {
                  <mat-error>La fecha es requerida</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="filter-actions">
              <button
                mat-raised-button
                color="primary"
                (click)="ejecutarProvision()"
                [disabled]="form.invalid || isLoading()"
              >
                @if (isLoading()) {
                  <mat-spinner diameter="20" style="display: inline-block; margin-right: 8px;"></mat-spinner>
                } @else {
                  <mat-icon>play_arrow</mat-icon>
                }
                Ejecutar Provisión
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Loading -->
      @if (isLoading()) {
        <div class="loading">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Calculando provisión de intereses...</p>
        </div>
      }

      <!-- Resultado exitoso -->
      @if (!isLoading() && resultado() && resultado()!.procesados > 0) {
        <mat-card class="results-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>check_circle</mat-icon>
              Provisión Ejecutada Correctamente
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="summary">
              <div class="summary-item primary">
                <mat-icon>savings</mat-icon>
                <div>
                  <span class="summary-label">Cuentas Procesadas</span>
                  <span class="summary-value">{{ resultado()!.procesados }}</span>
                </div>
              </div>
              <div class="summary-item">
                <mat-icon>event</mat-icon>
                <div>
                  <span class="summary-label">Fecha Procesada</span>
                  <span class="summary-value">{{ fechaProcesada() }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }

      <!-- Estado vacío (0 procesados) -->
      @if (!isLoading() && resultado() && resultado()!.procesados === 0) {
        <mat-card class="empty-card">
          <mat-card-content>
            <div class="empty">
              <mat-icon>info</mat-icon>
              <p>No se encontraron cuentas activas para provisionar en la fecha seleccionada</p>
              <p class="empty-hint">Puede que la provisión ya haya sido ejecutada para esta fecha o no existan cuentas activas.</p>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 24px;
    }

    .header h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 32px;
      font-weight: 500;
      color: #1976d2;
    }

    .header h1 mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
    }

    .subtitle {
      color: #666;
      margin: 8px 0 0 0;
      font-size: 16px;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    mat-card-header mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      margin-bottom: 16px;
    }

    .filters-form {
      padding-top: 16px;
    }

    .filters-row {
      margin-bottom: 24px;
    }

    .filters-row mat-form-field {
      width: 100%;
      max-width: 350px;
    }

    .filter-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      gap: 20px;
    }

    .loading p {
      color: #666;
      font-size: 16px;
      margin: 0;
    }

    .results-card {
      margin-bottom: 24px;
    }

    .results-card mat-card-title {
      color: #2e7d32;
    }

    .results-card mat-card-title mat-icon {
      color: #2e7d32;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      border-radius: 12px;
      background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .summary-item.primary {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    }

    .summary-item mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1976d2;
    }

    .summary-item > div {
      display: flex;
      flex-direction: column;
    }

    .summary-label {
      font-size: 13px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }

    .summary-value {
      font-size: 24px;
      font-weight: 700;
      color: #333;
      margin-top: 4px;
    }

    .empty-card {
      margin-top: 24px;
    }

    .empty {
      text-align: center;
      padding: 80px 20px;
    }

    .empty mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #bdbdbd;
      margin-bottom: 20px;
    }

    .empty p {
      color: #666;
      font-size: 18px;
      margin: 16px 0 0 0;
    }

    .empty-hint {
      font-size: 14px !important;
      color: #999 !important;
    }

    /* Responsive */
    @media (max-width: 960px) {
      .container {
        padding: 16px;
      }

      .header h1 {
        font-size: 24px;
      }

      .summary {
        grid-template-columns: 1fr;
      }

      .filter-actions {
        flex-direction: column;
      }

      .filter-actions button {
        width: 100%;
      }
    }

    @media (max-width: 600px) {
      .header h1 {
        font-size: 20px;
      }

      .header h1 mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      .subtitle {
        font-size: 14px;
      }

      .filters-row mat-form-field {
        max-width: 100%;
      }
    }
  `],
})
export class ProvisionInteresesComponent {
  private fb = inject(FormBuilder);
  private transaccionService = inject(TransaccionAhorroService);
  private snackBar = inject(MatSnackBar);

  isLoading = signal(false);
  resultado = signal<{ procesados: number } | null>(null);
  fechaProcesada = signal('');

  form: FormGroup = this.fb.group({
    fecha: [new Date(), Validators.required],
  });

  ejecutarProvision(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.resultado.set(null);

    const fecha = this.formatearFecha(this.form.value.fecha);

    this.transaccionService.calcularProvision(fecha).subscribe({
      next: (res) => {
        this.resultado.set(res);
        this.fechaProcesada.set(this.formatearFechaDisplay(fecha));
        this.isLoading.set(false);

        if (res.procesados > 0) {
          this.snackBar.open(
            `Provisión ejecutada: ${res.procesados} cuenta(s) procesada(s)`,
            'Cerrar',
            { duration: 4000 },
          );
        }
      },
      error: (err) => {
        console.error('Error al ejecutar provisión:', err);
        this.isLoading.set(false);
        this.snackBar.open(
          err.error?.message || 'Error al ejecutar la provisión de intereses',
          'Cerrar',
          { duration: 4000 },
        );
      },
    });
  }

  private formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatearFechaDisplay(fecha: string): string {
    const parts = fecha.split('-');
    if (parts.length !== 3) return fecha;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
}
