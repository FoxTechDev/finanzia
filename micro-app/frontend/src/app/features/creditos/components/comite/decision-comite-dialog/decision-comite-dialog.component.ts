import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { ComiteService } from '../../../services/comite.service';
import { GarantiaService } from '../../../services/garantia.service';
import { SolicitudService } from '../../../services/solicitud.service';
import { PersonaService } from '../../../../clientes/services/persona.service';
import {
  Solicitud,
  TipoDecisionComite,
  DESTINO_CREDITO_LABELS,
  PlanPagoCalculado,
  PERIODICIDAD_PAGO_LABELS,
} from '@core/models/credito.model';
import {
  Garantia,
  CoberturaGarantia,
  RECOMENDACION_ASESOR_LABELS,
} from '@core/models/garantia.model';
import { Persona } from '@core/models/cliente.model';

@Component({
  selector: 'app-decision-comite-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatExpansionModule,
    MatTableModule,
    CurrencyPipe,
    DatePipe,
  ],
  template: `
    <h2 mat-dialog-title>Decisión del Comité de Crédito</h2>

    <mat-dialog-content>
      <!-- Resumen de la solicitud -->
      <div class="section">
        <h3>Resumen de la Solicitud</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Número:</span>
            <span class="value">{{ solicitud.numeroSolicitud }}</span>
          </div>
          <div class="info-item">
            <span class="label">Cliente:</span>
            <span class="value">{{ solicitud.persona?.nombre }} {{ solicitud.persona?.apellido }}</span>
          </div>
          <div class="info-item">
            <span class="label">Tipo Crédito:</span>
            <span class="value">{{ solicitud.tipoCredito?.nombre }}</span>
          </div>
          <div class="info-item">
            <span class="label">Destino:</span>
            <span class="value">{{ getDestinoLabel(solicitud.destinoCredito) }}</span>
          </div>
        </div>

        <div class="amounts-row">
          <div class="amount-card">
            <div class="amount-label">Monto Solicitado</div>
            <div class="amount-value">{{ solicitud.montoSolicitado | currency:'USD':'symbol':'1.2-2' }}</div>
          </div>
          <div class="amount-card">
            <div class="amount-label">Plazo</div>
            <div class="amount-value">{{ solicitud.plazoSolicitado }} meses</div>
          </div>
          <div class="amount-card">
            <div class="amount-label">Tasa Propuesta</div>
            <div class="amount-value">{{ solicitud.tasaInteresPropuesta }}%</div>
          </div>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Análisis del Asesor -->
      <div class="section">
        <h3>Análisis del Asesor</h3>
        @if (solicitud.recomendacionAsesor) {
          <div class="recomendacion-row">
            <span class="label">Recomendación:</span>
            <mat-chip [ngClass]="getRecomendacionClass(solicitud.recomendacionAsesor)">
              {{ getRecomendacionLabel(solicitud.recomendacionAsesor) }}
            </mat-chip>
          </div>
        }
        @if (solicitud.analisisAsesor) {
          <div class="analisis-text">
            <span class="label">Análisis:</span>
            <p>{{ solicitud.analisisAsesor }}</p>
          </div>
        }
        @if (solicitud.capacidadPago) {
          <div class="info-item">
            <span class="label">Capacidad de Pago:</span>
            <span class="value">{{ solicitud.capacidadPago | currency:'USD':'symbol':'1.2-2' }}</span>
          </div>
        }
        @if (!solicitud.recomendacionAsesor && !solicitud.analisisAsesor) {
          <p class="no-data">Sin análisis del asesor</p>
        }
      </div>

      <mat-divider></mat-divider>

      <!-- Garantías -->
      <div class="section">
        <h3>Garantías</h3>
        @if (garantias().length > 0) {
          <div class="garantias-list">
            @for (garantia of garantias(); track garantia.id) {
              <div class="garantia-item">
                <span class="garantia-tipo">{{ garantia.tipoGarantiaCatalogo?.nombre }}</span>
                <span class="garantia-valor">{{ garantia.valorEstimado | currency:'USD':'symbol':'1.2-2' }}</span>
              </div>
            }
          </div>
          @if (cobertura()) {
            <div class="cobertura-row">
              <span class="label">Cobertura Total:</span>
              <span class="cobertura-value" [class.cobertura-ok]="cobertura()!.cobertura >= 100">
                {{ cobertura()!.cobertura | number:'1.2-2' }}%
              </span>
            </div>
          }
        } @else {
          <p class="no-data">Sin garantías registradas</p>
        }
      </div>

      <mat-divider></mat-divider>

      <!-- Información Financiera del Cliente -->
      <mat-expansion-panel [expanded]="true">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>account_balance_wallet</mat-icon>
            <span>Información Financiera del Cliente</span>
          </mat-panel-title>
        </mat-expansion-panel-header>

        @if (clienteData()) {
          <!-- Actividad Económica -->
          @if (clienteData()!.actividadEconomica) {
            <div class="subsection">
              <h4><mat-icon>work</mat-icon> Actividad Económica</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Tipo:</span>
                  <span class="value">{{ clienteData()!.actividadEconomica!.tipoActividad }}</span>
                </div>
                @if (clienteData()!.actividadEconomica!.nombreEmpresa) {
                  <div class="info-item">
                    <span class="label">Empresa:</span>
                    <span class="value">{{ clienteData()!.actividadEconomica!.nombreEmpresa }}</span>
                  </div>
                }
                @if (clienteData()!.actividadEconomica!.cargoOcupacion) {
                  <div class="info-item">
                    <span class="label">Cargo:</span>
                    <span class="value">{{ clienteData()!.actividadEconomica!.cargoOcupacion }}</span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Ingresos -->
          <div class="subsection">
            <h4><mat-icon>trending_up</mat-icon> Ingresos</h4>
            @if (clienteData()!.ingresos && clienteData()!.ingresos!.length > 0) {
              <div class="financial-table">
                @for (ingreso of clienteData()!.ingresos; track ingreso.id) {
                  <div class="financial-row">
                    <span class="financial-label">{{ ingreso.tipoIngreso?.nombre || 'Ingreso' }}</span>
                    <span class="financial-amount income">{{ ingreso.monto | currency:'USD':'symbol':'1.2-2' }}</span>
                  </div>
                  @if (ingreso.descripcion) {
                    <div class="financial-desc">{{ ingreso.descripcion }}</div>
                  }
                }
                <div class="financial-row total">
                  <span class="financial-label">Total Ingresos</span>
                  <span class="financial-amount income">{{ getTotalIngresos() | currency:'USD':'symbol':'1.2-2' }}</span>
                </div>
              </div>
            } @else {
              <p class="no-data">Sin información de ingresos</p>
            }
          </div>

          <!-- Gastos -->
          <div class="subsection">
            <h4><mat-icon>trending_down</mat-icon> Gastos</h4>
            @if (clienteData()!.gastos && clienteData()!.gastos!.length > 0) {
              <div class="financial-table">
                @for (gasto of clienteData()!.gastos; track gasto.id) {
                  <div class="financial-row">
                    <span class="financial-label">{{ gasto.tipoGasto?.nombre || 'Gasto' }}</span>
                    <span class="financial-amount expense">{{ gasto.monto | currency:'USD':'symbol':'1.2-2' }}</span>
                  </div>
                  @if (gasto.descripcion) {
                    <div class="financial-desc">{{ gasto.descripcion }}</div>
                  }
                }
                <div class="financial-row total">
                  <span class="financial-label">Total Gastos</span>
                  <span class="financial-amount expense">{{ getTotalGastos() | currency:'USD':'symbol':'1.2-2' }}</span>
                </div>
              </div>
            } @else {
              <p class="no-data">Sin información de gastos</p>
            }
          </div>

          <!-- Resumen Financiero -->
          <div class="financial-summary">
            <div class="summary-card income-card">
              <div class="summary-label">Total Ingresos</div>
              <div class="summary-value">{{ getTotalIngresos() | currency:'USD':'symbol':'1.2-2' }}</div>
            </div>
            <div class="summary-card expense-card">
              <div class="summary-label">Total Gastos</div>
              <div class="summary-value">{{ getTotalGastos() | currency:'USD':'symbol':'1.2-2' }}</div>
            </div>
            <div class="summary-card disponible-card">
              <div class="summary-label">Disponible</div>
              <div class="summary-value">{{ getDisponible() | currency:'USD':'symbol':'1.2-2' }}</div>
            </div>
          </div>
        } @else {
          <div class="loading-small">
            <mat-spinner diameter="30"></mat-spinner>
            <span>Cargando información...</span>
          </div>
        }
      </mat-expansion-panel>

      <mat-divider></mat-divider>

      <!-- Plan de Pago -->
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>calculate</mat-icon>
            <span>Plan de Pago Proyectado</span>
          </mat-panel-title>
        </mat-expansion-panel-header>

        @if (planPago()) {
          <div class="plan-section">
            <div class="plan-resumen-row">
              <div class="plan-item">
                <span class="label">Periodicidad:</span>
                <span class="value highlight">{{ getPeriodicidadLabel() }}</span>
              </div>
              <div class="plan-item">
                <span class="label">Cuotas:</span>
                <span class="value">{{ planPago()!.numeroCuotas }}</span>
              </div>
              <div class="plan-item">
                <span class="label">Cuota:</span>
                <span class="value amount">{{ planPago()!.cuotaNormal | currency:'USD':'symbol':'1.2-2' }}</span>
              </div>
              <div class="plan-item">
                <span class="label">Total Interés:</span>
                <span class="value amount">{{ planPago()!.totalInteres | currency:'USD':'symbol':'1.2-2' }}</span>
              </div>
              @if (tieneRecargos()) {
                <div class="plan-item">
                  <span class="label">Total Recargos:</span>
                  <span class="value amount">{{ getTotalRecargos() | currency:'USD':'symbol':'1.2-2' }}</span>
                </div>
              }
              <div class="plan-item">
                <span class="label">Total a Pagar:</span>
                <span class="value amount">{{ planPago()!.totalPagar | currency:'USD':'symbol':'1.2-2' }}</span>
              </div>
            </div>

            <div class="plan-table-wrapper">
              <table class="plan-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>Capital</th>
                    <th>Interés</th>
                    @if (tieneRecargos()) {
                      <th>Recargos</th>
                    }
                    <th>Cuota</th>
                    <th>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  @for (cuota of planPago()!.planPago; track cuota.numeroCuota) {
                    <tr>
                      <td>{{ cuota.numeroCuota }}</td>
                      <td>{{ cuota.fechaVencimiento | date:'dd/MM/yyyy' }}</td>
                      <td class="amount-cell">{{ cuota.capital | currency:'USD':'symbol':'1.2-2' }}</td>
                      <td class="amount-cell">{{ cuota.interes | currency:'USD':'symbol':'1.2-2' }}</td>
                      @if (tieneRecargos()) {
                        <td class="amount-cell">{{ cuota.recargos | currency:'USD':'symbol':'1.2-2' }}</td>
                      }
                      <td class="amount-cell highlight">{{ cuota.cuotaTotal | currency:'USD':'symbol':'1.2-2' }}</td>
                      <td class="amount-cell">{{ cuota.saldoCapital | currency:'USD':'symbol':'1.2-2' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        } @else if (isLoadingPlan()) {
          <div class="loading-small">
            <mat-spinner diameter="30"></mat-spinner>
            <span>Calculando plan de pago...</span>
          </div>
        } @else {
          <p class="no-data">No se pudo calcular el plan de pago</p>
        }
      </mat-expansion-panel>

      <mat-divider></mat-divider>

      <!-- Formulario de decisión -->
      <div class="section">
        <h3>Decisión del Comité</h3>
        <form [formGroup]="form">
          <mat-radio-group formControlName="tipoDecision" class="decision-radio-group">
            <mat-radio-button value="AUTORIZADA" color="primary">
              <mat-icon class="decision-icon autorizar">check_circle</mat-icon>
              Autorizar
            </mat-radio-button>
            <mat-radio-button value="DENEGADA" color="warn">
              <mat-icon class="decision-icon denegar">cancel</mat-icon>
              Denegar
            </mat-radio-button>
            <mat-radio-button value="OBSERVADA" color="accent">
              <mat-icon class="decision-icon observar">warning</mat-icon>
              Observar
            </mat-radio-button>
          </mat-radio-group>

          <!-- Campos para Autorizar -->
          @if (form.get('tipoDecision')?.value === 'AUTORIZADA') {
            <div class="autorizar-fields">
              <div class="fields-row">
                <mat-form-field appearance="outline">
                  <mat-label>Monto Autorizado</mat-label>
                  <input matInput type="number" formControlName="montoAutorizado">
                  <span matPrefix>$&nbsp;</span>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Plazo Autorizado (meses)</mat-label>
                  <input matInput type="number" formControlName="plazoAutorizado">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Tasa Autorizada (%)</mat-label>
                  <input matInput type="number" formControlName="tasaAutorizada" step="0.01">
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Condiciones Especiales</mat-label>
                <textarea matInput formControlName="condicionesEspeciales" rows="3"></textarea>
              </mat-form-field>
            </div>
          }

          <!-- Campos para Denegar -->
          @if (form.get('tipoDecision')?.value === 'DENEGADA') {
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Motivo del Rechazo</mat-label>
              <textarea matInput formControlName="observaciones" rows="3" required></textarea>
              <mat-error>El motivo del rechazo es requerido</mat-error>
            </mat-form-field>
          }

          <!-- Campos para Observar -->
          @if (form.get('tipoDecision')?.value === 'OBSERVADA') {
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Observaciones</mat-label>
              <textarea matInput formControlName="observaciones" rows="3" required></textarea>
              <mat-error>Las observaciones son requeridas</mat-error>
            </mat-form-field>
          }
        </form>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        (click)="confirmar()"
        [disabled]="!form.valid || isSubmitting()"
      >
        @if (isSubmitting()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          <mat-icon>gavel</mat-icon>
          Confirmar Decisión
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .section { margin: 16px 0; }
      .section h3 { margin: 0 0 12px 0; color: #333; font-size: 1.1em; }
      .subsection { margin: 16px 0; }
      .subsection h4 { margin: 0 0 8px 0; color: #555; font-size: 1em; display: flex; align-items: center; gap: 8px; }
      .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
      .info-item { display: flex; gap: 8px; flex-wrap: wrap; }
      .info-item .label { color: #666; min-width: 80px; }
      .info-item .value { font-weight: 500; }
      .amounts-row { display: flex; gap: 16px; margin-top: 12px; flex-wrap: wrap; }
      .amount-card { flex: 1; min-width: 150px; background: #f5f5f5; padding: 12px; border-radius: 8px; text-align: center; }
      .amount-label { font-size: 0.85em; color: #666; }
      .amount-value { font-size: 1.2em; font-weight: 600; color: #1976d2; }
      .recomendacion-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
      .analisis-text p { margin: 8px 0; background: #f9f9f9; padding: 12px; border-radius: 4px; }
      .no-data { color: #999; font-style: italic; margin: 8px 0; }
      .garantias-list { display: flex; flex-direction: column; gap: 8px; }
      .garantia-item { display: flex; justify-content: space-between; padding: 8px; background: #f5f5f5; border-radius: 4px; }
      .garantia-valor { font-weight: 600; color: #1976d2; }
      .cobertura-row { display: flex; justify-content: space-between; margin-top: 12px; padding: 8px; background: #e3f2fd; border-radius: 4px; }
      .cobertura-value { font-weight: 600; }
      .cobertura-ok { color: #4caf50; }
      .decision-radio-group { display: flex; gap: 24px; margin: 16px 0; flex-wrap: wrap; }
      .decision-icon { vertical-align: middle; margin-right: 4px; }
      .decision-icon.autorizar { color: #4caf50; }
      .decision-icon.denegar { color: #f44336; }
      .decision-icon.observar { color: #ff9800; }
      .autorizar-fields { margin-top: 16px; }
      .fields-row { display: flex; gap: 16px; flex-wrap: wrap; }
      .fields-row mat-form-field { flex: 1; min-width: 150px; }
      .full-width { width: 100%; }
      mat-dialog-content { max-height: 70vh; }
      mat-chip.recomendacion-aprobar { background-color: #4caf50 !important; color: white !important; }
      mat-chip.recomendacion-rechazar { background-color: #f44336 !important; color: white !important; }
      mat-chip.recomendacion-observar { background-color: #ff9800 !important; color: white !important; }

      /* Información Financiera */
      .financial-table { display: flex; flex-direction: column; gap: 4px; margin: 8px 0; }
      .financial-row { display: flex; justify-content: space-between; padding: 8px; background: #fafafa; border-radius: 4px; }
      .financial-row.total { background: #e3f2fd; font-weight: 600; margin-top: 4px; }
      .financial-label { color: #555; }
      .financial-amount { font-weight: 600; font-family: monospace; }
      .financial-amount.income { color: #4caf50; }
      .financial-amount.expense { color: #f44336; }
      .financial-desc { font-size: 0.85em; color: #666; padding: 0 8px 4px 8px; }

      .financial-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
        margin-top: 16px;
      }
      .summary-card {
        padding: 12px;
        border-radius: 8px;
        text-align: center;
      }
      .summary-card.income-card { background: #e8f5e9; }
      .summary-card.expense-card { background: #ffebee; }
      .summary-card.disponible-card { background: #e3f2fd; }
      .summary-label { font-size: 0.85em; color: #666; margin-bottom: 4px; }
      .summary-value { font-size: 1.2em; font-weight: 600; }
      .income-card .summary-value { color: #4caf50; }
      .expense-card .summary-value { color: #f44336; }
      .disponible-card .summary-value { color: #1976d2; }

      /* Plan de Pago */
      mat-expansion-panel { margin: 8px 0 !important; }
      mat-panel-title { display: flex; align-items: center; gap: 8px; }
      .plan-section { padding: 8px 0; }
      .plan-resumen-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      }
      .plan-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 8px;
        background: #f5f5f5;
        border-radius: 6px;
      }
      .plan-item .label { font-size: 0.8em; color: #666; }
      .plan-item .value { font-weight: 600; }
      .plan-item .highlight { color: #673ab7; }
      .plan-item .amount { color: #1976d2; }

      .plan-table-wrapper { overflow-x: auto; margin-top: 12px; }
      .plan-table {
        width: 100%;
        min-width: 600px;
        border-collapse: collapse;
        font-size: 0.9em;
      }
      .plan-table th {
        background: #f5f5f5;
        padding: 8px;
        text-align: left;
        font-weight: 600;
        border-bottom: 2px solid #ddd;
      }
      .plan-table td {
        padding: 6px 8px;
        border-bottom: 1px solid #eee;
      }
      .plan-table .amount-cell {
        text-align: right;
        font-family: monospace;
      }
      .plan-table .highlight { color: #1976d2; font-weight: 600; }

      .loading-small {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        justify-content: center;
      }

      /* Responsive */
      @media (max-width: 600px) {
        .info-grid { grid-template-columns: 1fr; }
        .amounts-row { flex-direction: column; }
        .amount-card { min-width: 100%; }
        .decision-radio-group { flex-direction: column; gap: 12px; }
        .fields-row { flex-direction: column; }
        .fields-row mat-form-field { min-width: 100%; }
        .financial-summary { grid-template-columns: 1fr; }
        .plan-resumen-row { grid-template-columns: repeat(2, 1fr); }
        mat-dialog-content { max-height: 80vh; }
      }

      @media (min-width: 601px) and (max-width: 960px) {
        .info-grid { grid-template-columns: 1fr; }
        .plan-resumen-row { grid-template-columns: repeat(2, 1fr); }
      }
    `,
  ],
})
export class DecisionComiteDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<DecisionComiteDialogComponent>);
  private data = inject<{ solicitud: Solicitud }>(MAT_DIALOG_DATA);
  private comiteService = inject(ComiteService);
  private garantiaService = inject(GarantiaService);
  private solicitudService = inject(SolicitudService);
  private personaService = inject(PersonaService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  solicitud = this.data.solicitud;
  garantias = signal<Garantia[]>([]);
  cobertura = signal<CoberturaGarantia | null>(null);
  clienteData = signal<Persona | null>(null);
  planPago = signal<PlanPagoCalculado | null>(null);
  isSubmitting = signal(false);
  isLoadingPlan = signal(false);

  form: FormGroup = this.fb.group({
    tipoDecision: ['AUTORIZADA', Validators.required],
    observaciones: [''],
    condicionesEspeciales: [''],
    montoAutorizado: [this.solicitud.montoSolicitado],
    plazoAutorizado: [this.solicitud.plazoSolicitado],
    tasaAutorizada: [this.solicitud.tasaInteresPropuesta],
  });

  ngOnInit(): void {
    this.loadGarantias();
    this.loadCobertura();
    this.loadClienteData();
    this.loadPlanPago();

    // Actualizar validaciones según el tipo de decisión
    this.form.get('tipoDecision')?.valueChanges.subscribe((value) => {
      const observacionesControl = this.form.get('observaciones');
      if (value === 'DENEGADA' || value === 'OBSERVADA') {
        observacionesControl?.setValidators([Validators.required]);
      } else {
        observacionesControl?.clearValidators();
      }
      observacionesControl?.updateValueAndValidity();
    });
  }

  loadGarantias(): void {
    this.garantiaService.getBySolicitud(this.solicitud.id).subscribe({
      next: (garantias) => this.garantias.set(garantias),
      error: () => console.error('Error al cargar garantías'),
    });
  }

  loadCobertura(): void {
    this.garantiaService.getCobertura(this.solicitud.id).subscribe({
      next: (cobertura) => this.cobertura.set(cobertura),
      error: () => console.error('Error al cargar cobertura'),
    });
  }

  loadClienteData(): void {
    this.personaService.getById(this.solicitud.personaId).subscribe({
      next: (persona) => this.clienteData.set(persona),
      error: () => console.error('Error al cargar datos del cliente'),
    });
  }

  loadPlanPago(): void {
    this.isLoadingPlan.set(true);

    // Primero intentar cargar el plan de pago guardado
    this.solicitudService.obtenerPlanPago(this.solicitud.id).subscribe({
      next: (planGuardado: any) => {
        if (planGuardado.planPago && planGuardado.planPago.length > 0) {
          // Usar los totales calculados por el backend
          const totales = planGuardado.totales || {};
          const numeroCuotas = planGuardado.planPago.length;

          const plan: PlanPagoCalculado = {
            cuotaNormal: totales.cuotaNormal || planGuardado.planPago[0]?.cuotaTotal || 0,
            numeroCuotas,
            totalInteres: totales.totalInteres || 0,
            totalPagar: totales.totalPagar || 0,
            planPago: planGuardado.planPago.map((cuota: any) => ({
              numeroCuota: cuota.numeroCuota,
              fechaVencimiento: cuota.fechaVencimiento,
              capital: Number(cuota.capital),
              interes: Number(cuota.interes),
              recargos: Number(cuota.recargos) || 0,
              cuotaTotal: Number(cuota.cuotaTotal),
              saldoCapital: Number(cuota.saldoCapital),
            })),
          };

          this.planPago.set(plan);
          this.isLoadingPlan.set(false);
        } else {
          // Si no hay plan guardado, calcularlo en tiempo real
          this.calcularPlanPagoEnTiempoReal();
        }
      },
      error: () => {
        // Si hay error al obtener el plan guardado, calcularlo en tiempo real
        this.calcularPlanPagoEnTiempoReal();
      },
    });
  }

  /**
   * Calcula el plan de pago en tiempo real cuando no hay un plan guardado
   */
  private calcularPlanPagoEnTiempoReal(): void {
    const monto = this.solicitud.montoSolicitado;
    const plazo = this.solicitud.plazoSolicitado;
    const tasa = this.solicitud.tasaInteresPropuesta;
    const periodicidad = this.solicitud.periodicidadPago?.codigo || this.solicitud.tipoCredito?.periodicidadPago || 'MENSUAL';
    const tipoInteres = this.solicitud.tipoCredito?.tipoCuota || 'FLAT';

    this.solicitudService.calcularPlanPago({
      monto,
      plazo,
      tasaInteres: tasa,
      periodicidad,
      tipoInteres,
      fechaPrimeraCuota: this.solicitud.fechaDesdePago || undefined,
    }).subscribe({
      next: (plan) => {
        this.planPago.set(plan);
        this.isLoadingPlan.set(false);
      },
      error: () => {
        this.isLoadingPlan.set(false);
        console.error('Error al calcular plan de pago');
      },
    });
  }

  getTotalIngresos(): number {
    const ingresos = this.clienteData()?.ingresos || [];
    return ingresos.reduce((sum, ing) => sum + ing.monto, 0);
  }

  getTotalGastos(): number {
    const gastos = this.clienteData()?.gastos || [];
    return gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
  }

  getDisponible(): number {
    return this.getTotalIngresos() - this.getTotalGastos();
  }

  getPeriodicidadLabel(): string {
    const codigo = this.solicitud.periodicidadPago?.nombre || this.solicitud.tipoCredito?.periodicidadPago;
    if (!codigo) return 'N/A';

    return this.solicitud.periodicidadPago?.nombre || PERIODICIDAD_PAGO_LABELS[codigo as keyof typeof PERIODICIDAD_PAGO_LABELS] || codigo;
  }

  /**
   * Verifica si el plan de pago tiene recargos aplicados
   */
  tieneRecargos(): boolean {
    const plan = this.planPago();
    if (!plan || !plan.planPago) return false;
    return plan.planPago.some(c => c.recargos && c.recargos > 0);
  }

  /**
   * Calcula el total de recargos del plan de pago
   */
  getTotalRecargos(): number {
    const plan = this.planPago();
    if (!plan || !plan.planPago) return 0;
    return plan.planPago.reduce((sum, c) => sum + (c.recargos || 0), 0);
  }

  getDestinoLabel(destino: string): string {
    return DESTINO_CREDITO_LABELS[destino as keyof typeof DESTINO_CREDITO_LABELS] || destino;
  }

  getRecomendacionLabel(recomendacion: string): string {
    return RECOMENDACION_ASESOR_LABELS[recomendacion as keyof typeof RECOMENDACION_ASESOR_LABELS] || recomendacion;
  }

  getRecomendacionClass(recomendacion: string): string {
    return 'recomendacion-' + recomendacion.toLowerCase();
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  confirmar(): void {
    if (!this.form.valid) {
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.form.value;

    const decision = {
      tipoDecision: formValue.tipoDecision as TipoDecisionComite,
      observaciones: formValue.observaciones || undefined,
      condicionesEspeciales: formValue.condicionesEspeciales || undefined,
      montoAutorizado: formValue.tipoDecision === 'AUTORIZADA' ? Number(formValue.montoAutorizado) : undefined,
      plazoAutorizado: formValue.tipoDecision === 'AUTORIZADA' ? Number(formValue.plazoAutorizado) : undefined,
      tasaAutorizada: formValue.tipoDecision === 'AUTORIZADA' ? Number(formValue.tasaAutorizada) : undefined,
    };

    this.comiteService.registrarDecision(this.solicitud.id, decision).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.snackBar.open(err.error?.message || 'Error al registrar decisión', 'Cerrar', { duration: 3000 });
      },
    });
  }
}
