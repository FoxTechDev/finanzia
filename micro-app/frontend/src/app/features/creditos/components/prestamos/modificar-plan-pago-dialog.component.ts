import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { PrestamoService } from '../../services/prestamo.service';
import {
  Prestamo,
  PlanPago,
  TipoInteres,
  TIPO_INTERES_LABELS,
  PeriodicidadPago,
  PERIODICIDAD_PAGO_LABELS,
  CuotaPlanPagoPreview,
  PreviewPlanPagoRequest,
} from '@core/models/credito.model';

@Component({
  selector: 'app-modificar-plan-pago-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    MatRadioModule,
    MatSelectModule,
    MatDatepickerModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>autorenew</mat-icon>
      Generar Nuevo Plan de Pagos
    </h2>

    <mat-dialog-content>
      <!-- Info del prestamo -->
      <div class="prestamo-info">
        <div class="info-row">
          <span class="label">Credito:</span>
          <span class="value">{{ data.prestamo.numeroCredito }}</span>
        </div>
        <div class="info-row">
          <span class="label">Cliente:</span>
          <span class="value">{{ getNombreCliente() }}</span>
        </div>
        <div class="info-row">
          <span class="label">Monto Otorgado:</span>
          <span class="value amount">{{ data.prestamo.montoDesembolsado | currency:'USD' }}</span>
        </div>
        <div class="info-row">
          <span class="label">Saldo Capital Actual:</span>
          <span class="value amount">{{ data.prestamo.saldoCapital | currency:'USD' }}</span>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Formulario de parametros -->
      <div class="params-section">
        <h3 class="section-title">Parametros del Nuevo Plan</h3>

        <!-- Monto base -->
        <div class="param-group">
          <label class="param-label">Monto base para el calculo:</label>
          <mat-radio-group [(ngModel)]="usarSaldoActual" class="radio-group">
            <mat-radio-button [value]="false">
              Monto otorgado ({{ data.prestamo.montoDesembolsado | currency:'USD' }})
            </mat-radio-button>
            <mat-radio-button [value]="true">
              Saldo actual ({{ data.prestamo.saldoCapital | currency:'USD' }})
            </mat-radio-button>
          </mat-radio-group>
        </div>

        <!-- Fila de campos -->
        <div class="params-grid">
          <mat-form-field appearance="outline">
            <mat-label>Tasa de interes anual (%)</mat-label>
            <input matInput type="number" [(ngModel)]="tasaInteres" min="0" step="0.01">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Tipo de interes</mat-label>
            <mat-select [(ngModel)]="tipoInteres">
              @for (tipo of tiposInteres; track tipo.value) {
                <mat-option [value]="tipo.value">{{ tipo.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Plazo (meses)</mat-label>
            <input matInput type="number" [(ngModel)]="plazo" min="1">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Periodicidad de pago</mat-label>
            <mat-select [(ngModel)]="periodicidadPago">
              @for (p of periodicidades; track p.value) {
                <mat-option [value]="p.value">{{ p.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Numero de cuotas (opcional)</mat-label>
            <input matInput type="number" [(ngModel)]="numeroCuotas" min="1"
              placeholder="Auto segun plazo">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fecha primera cuota</mat-label>
            <input matInput type="date" [(ngModel)]="fechaPrimeraCuota">
          </mat-form-field>
        </div>

        <!-- Boton generar -->
        <div class="generar-section">
          <button
            mat-raised-button
            color="accent"
            (click)="generarPreview()"
            [disabled]="generando() || !puedeGenerar()"
          >
            @if (generando()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              <mat-icon>calculate</mat-icon> Generar Plan
            }
          </button>
        </div>
      </div>

      <!-- Preview del plan -->
      @if (cuotasPreview().length > 0) {
        <mat-divider></mat-divider>

        <div class="preview-section">
          <h3 class="section-title">Plan de Pagos Generado</h3>

          <!-- Resumen -->
          <div class="resumen-preview">
            <div class="resumen-item">
              <span class="label">Monto Base:</span>
              <span class="value amount">{{ montoBase() | currency:'USD' }}</span>
            </div>
            <div class="resumen-item">
              <span class="label">Cuota Normal:</span>
              <span class="value amount">{{ cuotaNormalPreview() | currency:'USD' }}</span>
            </div>
            <div class="resumen-item">
              <span class="label">Total Interes:</span>
              <span class="value">{{ totalInteresPreview() | currency:'USD' }}</span>
            </div>
            <div class="resumen-item">
              <span class="label">Total a Pagar:</span>
              <span class="value amount-total">{{ totalPagarPreview() | currency:'USD' }}</span>
            </div>
            <div class="resumen-item">
              <span class="label">Cuotas:</span>
              <span class="value">{{ cuotasPreview().length }}</span>
            </div>
            <div class="resumen-item">
              <span class="label">Vencimiento:</span>
              <span class="value">{{ fechaVencimientoPreview() | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>

          <!-- Tabla de cuotas -->
          <div class="table-responsive">
            <table mat-table [dataSource]="cuotasPreview()" class="cuotas-table">
              <ng-container matColumnDef="numeroCuota">
                <th mat-header-cell *matHeaderCellDef>No.</th>
                <td mat-cell *matCellDef="let cuota">
                  <strong>{{ cuota.numeroCuota }}</strong>
                </td>
              </ng-container>

              <ng-container matColumnDef="fechaVencimiento">
                <th mat-header-cell *matHeaderCellDef>Fecha Venc.</th>
                <td mat-cell *matCellDef="let cuota">
                  {{ cuota.fechaVencimiento | date:'dd/MM/yyyy' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="capital">
                <th mat-header-cell *matHeaderCellDef>Capital</th>
                <td mat-cell *matCellDef="let cuota">
                  {{ cuota.capital | currency:'USD':'symbol':'1.2-2' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="interes">
                <th mat-header-cell *matHeaderCellDef>Interes</th>
                <td mat-cell *matCellDef="let cuota">
                  {{ cuota.interes | currency:'USD':'symbol':'1.2-2' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="cuotaTotal">
                <th mat-header-cell *matHeaderCellDef>Total Cuota</th>
                <td mat-cell *matCellDef="let cuota">
                  <strong>{{ cuota.cuotaTotal | currency:'USD':'symbol':'1.2-2' }}</strong>
                </td>
              </ng-container>

              <ng-container matColumnDef="saldoCapital">
                <th mat-header-cell *matHeaderCellDef>Saldo Capital</th>
                <td mat-cell *matCellDef="let cuota">
                  {{ cuota.saldoCapital | currency:'USD':'symbol':'1.2-2' }}
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columnasPreview"></tr>
              <tr mat-row *matRowDef="let row; columns: columnasPreview"></tr>
            </table>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Observacion -->
        <div class="observacion-section">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Razon de la modificacion (requerido)</mat-label>
            <textarea
              matInput
              [(ngModel)]="observacion"
              rows="2"
              placeholder="Describa el motivo de la regeneracion del plan de pagos"
            ></textarea>
          </mat-form-field>
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      @if (cuotasPreview().length > 0) {
        <button
          mat-raised-button
          color="primary"
          (click)="guardar()"
          [disabled]="!puedeGuardar() || guardando()"
        >
          @if (guardando()) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <mat-icon>save</mat-icon> Guardar Nuevo Plan
          }
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: [`
    .prestamo-info {
      padding: 16px 0;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }

    .info-row .label {
      color: #666;
      font-size: 13px;
    }

    .info-row .value {
      font-weight: 500;
    }

    .info-row .value.amount {
      color: #1976d2;
      font-weight: 600;
    }

    .section-title {
      margin: 16px 0 12px;
      font-size: 15px;
      font-weight: 500;
      color: #333;
    }

    .params-section {
      padding: 8px 0;
    }

    .param-group {
      margin-bottom: 16px;
    }

    .param-label {
      display: block;
      font-size: 13px;
      color: #666;
      margin-bottom: 8px;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .params-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 16px;
    }

    .generar-section {
      display: flex;
      justify-content: center;
      padding: 8px 0 16px;
    }

    .preview-section {
      padding: 8px 0;
    }

    .resumen-preview {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .resumen-item {
      display: flex;
      flex-direction: column;
    }

    .resumen-item .label {
      font-size: 11px;
      color: #888;
      text-transform: uppercase;
    }

    .resumen-item .value {
      font-weight: 500;
      font-size: 14px;
    }

    .resumen-item .value.amount {
      color: #1976d2;
      font-weight: 600;
    }

    .resumen-item .value.amount-total {
      color: #2e7d32;
      font-weight: 700;
      font-size: 16px;
    }

    .observacion-section {
      padding: 16px 0 0;
    }

    .full-width {
      width: 100%;
    }

    .table-responsive {
      overflow-x: auto;
      margin: 8px 0;
      max-height: 300px;
      overflow-y: auto;
    }

    .cuotas-table {
      width: 100%;
    }

    mat-dialog-content {
      max-height: 75vh;
      min-width: 700px;
    }

    @media (max-width: 768px) {
      mat-dialog-content {
        min-width: auto;
      }
      .params-grid {
        grid-template-columns: 1fr;
      }
      .resumen-preview {
        grid-template-columns: 1fr 1fr;
      }
    }
  `],
})
export class ModificarPlanPagoDialogComponent implements OnInit {
  private prestamoService = inject(PrestamoService);
  private snackBar = inject(MatSnackBar);
  dialogRef = inject(MatDialogRef<ModificarPlanPagoDialogComponent>);
  data = inject<{ prestamo: Prestamo; planPago: PlanPago[] }>(MAT_DIALOG_DATA);

  // Parametros del formulario
  usarSaldoActual = true;
  tasaInteres = 0;
  tipoInteres = TipoInteres.FLAT;
  plazo = 12;
  periodicidadPago = PeriodicidadPago.MENSUAL;
  numeroCuotas: number | null = null;
  fechaPrimeraCuota = '';
  observacion = '';

  // Opciones para selects
  tiposInteres = Object.entries(TIPO_INTERES_LABELS).map(([value, label]) => ({ value, label }));
  periodicidades = Object.entries(PERIODICIDAD_PAGO_LABELS).map(([value, label]) => ({ value, label }));

  // Signals
  cuotasPreview = signal<CuotaPlanPagoPreview[]>([]);
  montoBase = signal(0);
  cuotaNormalPreview = signal(0);
  totalInteresPreview = signal(0);
  totalPagarPreview = signal(0);
  fechaVencimientoPreview = signal('');
  generando = signal(false);
  guardando = signal(false);

  columnasPreview = ['numeroCuota', 'fechaVencimiento', 'capital', 'interes', 'cuotaTotal', 'saldoCapital'];

  ngOnInit(): void {
    this.precargarParametros();
  }

  private precargarParametros(): void {
    const p = this.data.prestamo;
    this.tasaInteres = Number(p.tasaInteres);
    this.tipoInteres = p.tipoInteres as TipoInteres;
    this.plazo = Number(p.plazoAutorizado);
    this.periodicidadPago = p.periodicidadPago as PeriodicidadPago;

    // Fecha primera cuota: mañana por defecto
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.fechaPrimeraCuota = tomorrow.toISOString().substring(0, 10);
  }

  getNombreCliente(): string {
    const c = this.data.prestamo.cliente;
    if (c?.nombreCompleto) return c.nombreCompleto;
    if (c) return `${c.nombre || ''} ${c.apellido || ''}`.trim();
    const p = this.data.prestamo.persona;
    if (!p) return 'N/A';
    return `${p.nombre || ''} ${p.apellido || ''}`.trim();
  }

  puedeGenerar(): boolean {
    return this.tasaInteres >= 0
      && this.plazo >= 1
      && !!this.fechaPrimeraCuota
      && !!this.periodicidadPago
      && !!this.tipoInteres;
  }

  generarPreview(): void {
    if (!this.puedeGenerar()) return;

    this.generando.set(true);

    const request: PreviewPlanPagoRequest = {
      usarSaldoActual: this.usarSaldoActual,
      tasaInteres: this.tasaInteres,
      plazo: this.plazo,
      periodicidadPago: this.periodicidadPago,
      tipoInteres: this.tipoInteres,
      fechaPrimeraCuota: this.fechaPrimeraCuota,
    };

    if (this.numeroCuotas && this.numeroCuotas > 0) {
      request.numeroCuotas = this.numeroCuotas;
    }

    this.prestamoService.previewPlanPago(this.data.prestamo.id, request).subscribe({
      next: (response) => {
        this.generando.set(false);
        this.cuotasPreview.set(response.cuotas);
        this.montoBase.set(response.montoBase);
        this.cuotaNormalPreview.set(response.cuotaNormal);
        this.totalInteresPreview.set(response.totalInteres);
        this.totalPagarPreview.set(response.totalPagar);
        this.fechaVencimientoPreview.set(response.fechaVencimiento);
      },
      error: (err) => {
        this.generando.set(false);
        this.snackBar.open(
          err.error?.message || 'Error al generar el preview del plan',
          'Cerrar',
          { duration: 5000 },
        );
      },
    });
  }

  puedeGuardar(): boolean {
    return this.cuotasPreview().length > 0 && !!this.observacion.trim();
  }

  guardar(): void {
    if (!this.puedeGuardar()) return;

    this.guardando.set(true);

    const request = {
      prestamoId: this.data.prestamo.id,
      observacion: this.observacion.trim(),
      usarSaldoActual: this.usarSaldoActual,
      tasaInteres: this.tasaInteres,
      plazo: this.plazo,
      periodicidadPago: this.periodicidadPago,
      tipoInteres: this.tipoInteres,
      fechaPrimeraCuota: this.fechaPrimeraCuota,
      numeroCuotas: (this.numeroCuotas && this.numeroCuotas > 0) ? this.numeroCuotas : undefined,
    };

    this.prestamoService.modificarPlanPago(this.data.prestamo.id, request).subscribe({
      next: (response) => {
        this.guardando.set(false);
        this.snackBar.open(response.mensaje, 'Cerrar', { duration: 4000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.guardando.set(false);
        this.snackBar.open(
          err.error?.message || 'Error al guardar el nuevo plan de pagos',
          'Cerrar',
          { duration: 5000 },
        );
      },
    });
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}
