import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router } from '@angular/router';

import { PagoService } from '../../../services/pago.service';
import {
  Prestamo,
  PreviewPagoResponse,
  ESTADO_CUOTA_LABELS,
  TIPO_PAGO_LABELS,
  EstadoCuota,
  Pago,
} from '@core/models/credito.model';

@Component({
  selector: 'app-registrar-pago-dialog',
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
    MatTableModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatExpansionModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>payments</mat-icon>
      Registrar Pago
    </h2>

    <mat-dialog-content>
      <!-- Información del Préstamo -->
      <div class="prestamo-info">
        <div class="info-row">
          <span class="label">Crédito:</span>
          <span class="value">{{ data.prestamo.numeroCredito }}</span>
        </div>
        <div class="info-row">
          <span class="label">Cliente:</span>
          <span class="value">
            @if (data.prestamo.persona) {
              {{ data.prestamo.persona.nombre }} {{ data.prestamo.persona.apellido }}
            }
          </span>
        </div>
        <div class="info-row">
          <span class="label">Saldo Capital:</span>
          <span class="value amount">{{ data.prestamo.saldoCapital | currency:'USD' }}</span>
        </div>
        <div class="info-row">
          <span class="label">Días Mora:</span>
          <span class="value" [class.mora]="data.prestamo.diasMora > 0">
            {{ data.prestamo.diasMora }} días
          </span>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Formulario de Pago -->
      <form [formGroup]="pagoForm" class="pago-form">
        <div class="form-row">
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Fecha de Pago</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="fechaPago">
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Monto a Pagar ($)</mat-label>
            <input matInput type="number" formControlName="montoPagar" step="0.01" min="0.01">
            @if (pagoForm.get('montoPagar')?.invalid && pagoForm.get('montoPagar')?.touched) {
              <mat-error>Ingrese un monto válido mayor a 0</mat-error>
            }
          </mat-form-field>
        </div>

        <!-- Campo de Recargo Manual (solo visible cuando aplica y hay atraso) -->
        @if (mostrarRecargoManual()) {
          <div class="recargo-manual-section">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Recargo por Atraso ($)</mat-label>
              <input matInput type="number" formControlName="recargoManual" step="0.01" min="0">
              <mat-hint>Este tipo de crédito usa recargo manual en lugar de interés moratorio</mat-hint>
              @if (pagoForm.get('recargoManual')?.invalid && pagoForm.get('recargoManual')?.touched) {
                <mat-error>El recargo no puede ser negativo</mat-error>
              }
            </mat-form-field>
          </div>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observaciones (opcional)</mat-label>
          <textarea matInput formControlName="observaciones" rows="2"></textarea>
        </mat-form-field>

        <div class="action-row">
          <button
            mat-stroked-button
            color="primary"
            type="button"
            (click)="generarPreview()"
            [disabled]="pagoForm.invalid || loadingPreview()"
          >
            @if (loadingPreview()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              <mat-icon>preview</mat-icon>
              Ver Distribución
            }
          </button>

          @if (preview()?.resumenAdeudo?.totales) {
            <div class="totales-rapido">
              <span class="total-label">Total Adeudado:</span>
              <span class="total-valor">{{ preview()!.resumenAdeudo.totales.totalAdeudado | currency:'USD' }}</span>
            </div>
          }
        </div>
      </form>

      <!-- Preview del Pago -->
      @if (preview()) {
        <mat-divider></mat-divider>

        <div class="preview-section">
          <!-- Resumen de Adeudo -->
          <mat-expansion-panel [expanded]="true">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>account_balance_wallet</mat-icon>
                Resumen de Adeudo
              </mat-panel-title>
            </mat-expansion-panel-header>

            <div class="adeudo-grid">
              <div class="adeudo-item">
                <span class="label">Capital Pendiente:</span>
                <span class="valor">{{ preview()!.resumenAdeudo.totales.capitalPendiente | currency:'USD' }}</span>
              </div>
              <div class="adeudo-item">
                <span class="label">Interés Pendiente:</span>
                <span class="valor">{{ preview()!.resumenAdeudo.totales.interesPendiente | currency:'USD' }}</span>
              </div>
              <div class="adeudo-item">
                <span class="label">Recargos:</span>
                <span class="valor">{{ preview()!.resumenAdeudo.totales.recargosPendiente | currency:'USD' }}</span>
              </div>
              <div class="adeudo-item">
                <span class="label">Interés Moratorio:</span>
                <span class="valor mora">{{ preview()!.resumenAdeudo.totales.interesMoratorioPendiente | currency:'USD' }}</span>
              </div>
              <div class="adeudo-item total">
                <span class="label">TOTAL ADEUDADO:</span>
                <span class="valor">{{ preview()!.resumenAdeudo.totales.totalAdeudado | currency:'USD' }}</span>
              </div>
            </div>

            <div class="cuotas-info">
              <mat-chip-set>
                <mat-chip color="warn" highlighted>
                  {{ preview()!.resumenAdeudo.cuotasVencidas }} cuotas vencidas
                </mat-chip>
                @if (preview()!.resumenAdeudo.cuotasParciales > 0) {
                  <mat-chip color="accent" highlighted>
                    {{ preview()!.resumenAdeudo.cuotasParciales }} con pago parcial
                  </mat-chip>
                }
              </mat-chip-set>
            </div>
          </mat-expansion-panel>

          <!-- Distribución del Pago -->
          <mat-expansion-panel [expanded]="true">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>pie_chart</mat-icon>
                Distribución del Pago
              </mat-panel-title>
              <mat-panel-description>
                {{ tipoPagoLabel(preview()!.distribucion.tipoPago) }}
              </mat-panel-description>
            </mat-expansion-panel-header>

            <div class="distribucion-grid">
              @if (preview()!.distribucion.recargoManualAplicado > 0) {
                <div class="dist-item recargo-manual">
                  <span class="label">Recargo Manual:</span>
                  <span class="valor">{{ preview()!.distribucion.recargoManualAplicado | currency:'USD' }}</span>
                </div>
              }
              <div class="dist-item">
                <span class="label">Interés Moratorio:</span>
                <span class="valor">{{ preview()!.distribucion.interesMoratorioAplicado | currency:'USD' }}</span>
              </div>
              <div class="dist-item">
                <span class="label">Intereses:</span>
                <span class="valor">{{ preview()!.distribucion.interesAplicado | currency:'USD' }}</span>
              </div>
              <div class="dist-item">
                <span class="label">Recargos:</span>
                <span class="valor">{{ preview()!.distribucion.recargosAplicado | currency:'USD' }}</span>
              </div>
              <div class="dist-item">
                <span class="label">Capital:</span>
                <span class="valor">{{ preview()!.distribucion.capitalAplicado | currency:'USD' }}</span>
              </div>
              @if (preview()!.distribucion.excedente > 0) {
                <div class="dist-item excedente">
                  <span class="label">Excedente:</span>
                  <span class="valor">{{ preview()!.distribucion.excedente | currency:'USD' }}</span>
                </div>
              }
            </div>

            <mat-divider></mat-divider>

            <h4>Saldos Después del Pago</h4>
            <div class="saldos-grid">
              <div class="saldo-item">
                <span class="label">Saldo Capital:</span>
                <span class="valor">{{ preview()!.saldosPosterior.saldoCapital | currency:'USD' }}</span>
              </div>
              <div class="saldo-item">
                <span class="label">Saldo Interés:</span>
                <span class="valor">{{ preview()!.saldosPosterior.saldoInteres | currency:'USD' }}</span>
              </div>
            </div>
          </mat-expansion-panel>

          <!-- Cuotas Afectadas -->
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>list_alt</mat-icon>
                Cuotas Afectadas ({{ preview()!.distribucion.cuotasAfectadas.length }})
              </mat-panel-title>
            </mat-expansion-panel-header>

            <table mat-table [dataSource]="preview()!.distribucion.cuotasAfectadas" class="cuotas-table">
              <ng-container matColumnDef="numeroCuota">
                <th mat-header-cell *matHeaderCellDef>Cuota</th>
                <td mat-cell *matCellDef="let row">{{ row.numeroCuota }}</td>
              </ng-container>

              <ng-container matColumnDef="capitalAplicado">
                <th mat-header-cell *matHeaderCellDef>Capital</th>
                <td mat-cell *matCellDef="let row">{{ row.capitalAplicado | currency:'USD' }}</td>
              </ng-container>

              <ng-container matColumnDef="interesAplicado">
                <th mat-header-cell *matHeaderCellDef>Interés</th>
                <td mat-cell *matCellDef="let row">{{ row.interesAplicado | currency:'USD' }}</td>
              </ng-container>

              <ng-container matColumnDef="interesMoratorioAplicado">
                <th mat-header-cell *matHeaderCellDef>Moratorio</th>
                <td mat-cell *matCellDef="let row">{{ row.interesMoratorioAplicado | currency:'USD' }}</td>
              </ng-container>

              <ng-container matColumnDef="estadoPosterior">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let row">
                  <mat-chip [color]="row.estadoPosterior === 'PAGADA' ? 'primary' : 'accent'" highlighted>
                    {{ estadoCuotaLabel(row.estadoPosterior) }}
                  </mat-chip>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="cuotasColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: cuotasColumns;"></tr>
            </table>
          </mat-expansion-panel>
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>

      @if (pagoCreado()) {
        <button mat-raised-button color="accent" (click)="imprimirRecibo()">
          <mat-icon>print</mat-icon>
          Imprimir Recibo
        </button>
        <button mat-raised-button color="primary" (click)="cerrarConPago()">
          <mat-icon>check</mat-icon>
          Finalizar
        </button>
      } @else {
        <button
          mat-raised-button
          color="primary"
          (click)="confirmarPago()"
          [disabled]="!preview() || procesando()"
        >
          @if (procesando()) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <mat-icon>check_circle</mat-icon>
            Confirmar Pago
          }
        </button>
      }
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

    .prestamo-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
      text-transform: uppercase;
    }

    .info-row .value {
      font-size: 16px;
      font-weight: 500;
    }

    .info-row .value.amount {
      color: #2e7d32;
      font-size: 18px;
    }

    .info-row .value.mora {
      color: #d32f2f;
    }

    .pago-form {
      padding: 16px 0;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .action-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
    }

    .totales-rapido {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #e3f2fd;
      border-radius: 4px;
    }

    .total-label {
      font-weight: 500;
      color: #1565c0;
    }

    .total-valor {
      font-size: 18px;
      font-weight: 600;
      color: #1565c0;
    }

    .preview-section {
      margin-top: 16px;
    }

    mat-expansion-panel {
      margin-bottom: 8px;
    }

    mat-panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .adeudo-grid,
    .distribucion-grid,
    .saldos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      padding: 8px 0;
    }

    .adeudo-item,
    .dist-item,
    .saldo-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      background: #fafafa;
      border-radius: 4px;
    }

    .adeudo-item.total,
    .dist-item.total {
      background: #1976d2;
      color: white;
      font-weight: 600;
      grid-column: 1 / -1;
    }

    .dist-item.excedente {
      background: #fff3e0;
      color: #e65100;
    }

    .dist-item.recargo-manual {
      background: #fce4ec;
      color: #c2185b;
      border-left: 3px solid #c2185b;
    }

    .recargo-manual-section {
      margin-top: 8px;
      padding: 12px;
      background: #fce4ec;
      border-radius: 8px;
      border-left: 4px solid #c2185b;
    }

    .valor.mora {
      color: #d32f2f;
    }

    .cuotas-info {
      margin-top: 16px;
    }

    h4 {
      margin: 16px 0 8px;
      color: #666;
      font-size: 14px;
    }

    .cuotas-table {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 16px 24px;
    }
  `],
})
export class RegistrarPagoDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pagoService = inject(PagoService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  dialogRef = inject(MatDialogRef<RegistrarPagoDialogComponent>);
  data = inject<{ prestamo: Prestamo }>(MAT_DIALOG_DATA);

  preview = signal<PreviewPagoResponse | null>(null);
  loadingPreview = signal(false);
  procesando = signal(false);
  pagoCreado = signal<Pago | null>(null);

  cuotasColumns = ['numeroCuota', 'capitalAplicado', 'interesAplicado', 'interesMoratorioAplicado', 'estadoPosterior'];

  pagoForm: FormGroup;

  // Computed signal para determinar si mostrar el campo de recargo manual
  mostrarRecargoManual = computed(() => {
    const prev = this.preview();
    if (!prev) return false;
    return prev.resumenAdeudo.recargoManual?.aplica && prev.resumenAdeudo.recargoManual?.tieneAtraso;
  });

  constructor() {
    this.pagoForm = this.fb.group({
      fechaPago: [new Date(), Validators.required],
      montoPagar: [null, [Validators.required, Validators.min(0.01)]],
      observaciones: [''],
      recargoManual: [0, [Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    // Cargar resumen inicial
    this.cargarResumenInicial();
  }

  cargarResumenInicial(): void {
    // Establecer la cuota del préstamo como monto inicial sugerido
    const cuotaSugerida = this.data.prestamo.cuotaTotal || this.data.prestamo.cuotaNormal || 0;
    this.pagoForm.patchValue({
      montoPagar: cuotaSugerida,
    });
  }

  generarPreview(): void {
    if (this.pagoForm.invalid) {
      return;
    }

    this.loadingPreview.set(true);
    const fechaPago = this.pagoForm.get('fechaPago')?.value;
    const fechaStr = this.formatDate(fechaPago);
    const recargoManualValue = this.pagoForm.get('recargoManual')?.value;

    this.pagoService.preview({
      prestamoId: this.data.prestamo.id,
      montoPagar: Number(this.pagoForm.get('montoPagar')?.value),
      fechaPago: fechaStr,
      recargoManual: recargoManualValue !== null && recargoManualValue !== undefined
        ? Number(recargoManualValue)
        : undefined,
    }).subscribe({
      next: (data) => {
        this.preview.set(data);
        this.loadingPreview.set(false);
      },
      error: (err) => {
        console.error('Error generando preview:', err);
        this.snackBar.open(err.error?.message || 'Error al generar preview', 'Cerrar', { duration: 5000 });
        this.loadingPreview.set(false);
      },
    });
  }

  confirmarPago(): void {
    if (!this.preview() || this.pagoForm.invalid) {
      return;
    }

    this.procesando.set(true);
    const fechaPago = this.pagoForm.get('fechaPago')?.value;
    const fechaStr = this.formatDate(fechaPago);
    const recargoManualValue = this.pagoForm.get('recargoManual')?.value;

    this.pagoService.crear({
      prestamoId: this.data.prestamo.id,
      montoPagar: Number(this.pagoForm.get('montoPagar')?.value),
      fechaPago: fechaStr,
      observaciones: this.pagoForm.get('observaciones')?.value || undefined,
      recargoManual: recargoManualValue !== null && recargoManualValue !== undefined
        ? Number(recargoManualValue)
        : undefined,
    }).subscribe({
      next: (pago) => {
        this.procesando.set(false);
        this.pagoCreado.set(pago);
        this.snackBar.open(`Pago ${pago.numeroPago} registrado exitosamente`, 'Cerrar', { duration: 5000 });
      },
      error: (err) => {
        console.error('Error creando pago:', err);
        this.snackBar.open(err.error?.message || 'Error al registrar pago', 'Cerrar', { duration: 5000 });
        this.procesando.set(false);
      },
    });
  }

  imprimirRecibo(): void {
    if (this.pagoCreado()) {
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/creditos/pagos', this.pagoCreado()!.id, 'recibo'])
      );
      window.open(url, '_blank', 'width=400,height=800');
    }
  }

  cerrarConPago(): void {
    this.dialogRef.close(this.pagoCreado());
  }

  tipoPagoLabel(tipo: string): string {
    return TIPO_PAGO_LABELS[tipo as keyof typeof TIPO_PAGO_LABELS] || tipo;
  }

  estadoCuotaLabel(estado: string): string {
    return ESTADO_CUOTA_LABELS[estado as EstadoCuota] || estado;
  }

  private formatDate(date: Date): string {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}
