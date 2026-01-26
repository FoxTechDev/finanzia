import { Component, OnInit, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { DesembolsoService } from '../../../services/desembolso.service';
import {
  Solicitud,
  TipoDeduccion,
  TipoRecargo,
  TipoInteres,
  PeriodicidadPago,
  TipoCalculo,
  TIPO_INTERES_LABELS,
  PERIODICIDAD_PAGO_LABELS,
  TIPO_CALCULO_LABELS,
  PreviewDesembolsoRequest,
  PreviewDesembolsoResponse,
  CrearDesembolsoRequest,
  DeduccionDesembolsoDto,
  RecargoDesembolsoDto,
} from '@core/models/credito.model';

@Component({
  selector: 'app-crear-desembolso-dialog',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    MatDialogModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>payment</mat-icon>
      Desembolso de Crédito
    </h2>

    <mat-dialog-content>
      <!-- Información de la Solicitud -->
      <div class="solicitud-info">
        <div class="info-row">
          <span class="label">Solicitud:</span>
          <span class="value">{{ data.solicitud.numeroSolicitud }}</span>
        </div>
        <div class="info-row">
          <span class="label">Cliente:</span>
          <span class="value">
            @if (data.solicitud.persona) {
              {{ data.solicitud.persona.nombre }} {{ data.solicitud.persona.apellido }}
            }
          </span>
        </div>
        <div class="info-row">
          <span class="label">Monto Autorizado:</span>
          <span class="value amount">
            {{ (data.solicitud.montoAprobado || data.solicitud.montoSolicitado) | currency:'USD' }}
          </span>
        </div>
        <div class="info-row">
          <span class="label">Plazo:</span>
          <span class="value">{{ data.solicitud.plazoAprobado || data.solicitud.plazoSolicitado }} meses</span>
        </div>
        <div class="info-row">
          <span class="label">Tasa:</span>
          <span class="value">{{ data.solicitud.tasaInteresAprobada || data.solicitud.tasaInteresPropuesta }}% anual</span>
        </div>
      </div>

      <mat-divider></mat-divider>

      <mat-stepper [linear]="true" #stepper>
        <!-- Paso 1: Configuración -->
        <mat-step [stepControl]="configForm">
          <ng-template matStepLabel>Configuración</ng-template>

          <form [formGroup]="configForm" class="step-content">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Periodicidad de Pago</mat-label>
                <mat-select formControlName="periodicidadPago">
                  @for (option of periodicidadOptions; track option.value) {
                    <mat-option [value]="option.value">{{ option.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tipo de Interés</mat-label>
                <mat-select formControlName="tipoInteres">
                  @for (option of tipoInteresOptions; track option.value) {
                    <mat-option [value]="option.value">{{ option.label }}</mat-option>
                  }
                </mat-select>
                <mat-hint>
                  @if (configForm.get('tipoInteres')?.value === 'FLAT') {
                    Interés calculado sobre el monto original (microcréditos)
                  } @else {
                    Interés calculado sobre saldo insoluto (sistema francés)
                  }
                </mat-hint>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Fecha Primera Cuota</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="fechaPrimeraCuota">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
          </form>

          <div class="step-actions">
            <button mat-button matStepperNext>
              Siguiente
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>
        </mat-step>

        <!-- Paso 2: Deducciones -->
        <mat-step [stepControl]="deduccionesForm">
          <ng-template matStepLabel>Deducciones</ng-template>

          <form [formGroup]="deduccionesForm" class="step-content">
            <p class="step-description">
              Agregue las deducciones que se aplicarán al monto autorizado.
              El monto desembolsado será el monto autorizado menos el total de deducciones.
            </p>

            <div formArrayName="deducciones">
              @for (deduccion of deduccionesArray.controls; track deduccion; let i = $index) {
                <div [formGroupName]="i" class="deduccion-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Tipo de Deducción</mat-label>
                    <mat-select formControlName="tipoDeduccionId" (selectionChange)="onTipoDeduccionChange(i)">
                      <mat-option [value]="null">Otro (personalizado)</mat-option>
                      @for (tipo of tiposDeduccion(); track tipo.id) {
                        <mat-option [value]="tipo.id">{{ tipo.nombre }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  @if (!deduccion.get('tipoDeduccionId')?.value) {
                    <mat-form-field appearance="outline">
                      <mat-label>Nombre</mat-label>
                      <input matInput formControlName="nombre">
                      @if (deduccion.get('nombre')?.invalid && deduccion.get('nombre')?.touched) {
                        <mat-error>El nombre es requerido</mat-error>
                      }
                    </mat-form-field>
                  }

                  <mat-form-field appearance="outline">
                    <mat-label>Tipo Cálculo</mat-label>
                    <mat-select formControlName="tipoCalculo">
                      <mat-option value="FIJO">Monto Fijo</mat-option>
                      <mat-option value="PORCENTAJE">Porcentaje</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>
                      {{ deduccion.get('tipoCalculo')?.value === 'PORCENTAJE' ? 'Porcentaje (%)' : 'Monto ($)' }}
                    </mat-label>
                    <input matInput type="number" formControlName="valor" step="0.01" min="0" [max]="deduccion.get('tipoCalculo')?.value === 'PORCENTAJE' ? 100 : null">
                    @if (deduccion.get('valor')?.invalid && deduccion.get('valor')?.touched) {
                      <mat-error>
                        @if (deduccion.get('valor')?.hasError('required')) {
                          El valor es requerido
                        }
                        @if (deduccion.get('valor')?.hasError('min')) {
                          El valor debe ser mayor o igual a 0
                        }
                        @if (deduccion.get('valor')?.hasError('max')) {
                          El porcentaje no puede ser mayor a 100%
                        }
                      </mat-error>
                    }
                  </mat-form-field>

                  <button mat-icon-button color="warn" (click)="removeDeduccion(i)" matTooltip="Eliminar">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              }
            </div>

            <button mat-stroked-button color="primary" (click)="addDeduccion()" type="button">
              <mat-icon>add</mat-icon>
              Agregar Deducción
            </button>
          </form>

          <div class="step-actions">
            <button mat-button matStepperPrevious>
              <mat-icon>arrow_back</mat-icon>
              Anterior
            </button>
            <button mat-button matStepperNext>
              Siguiente
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>
        </mat-step>

        <!-- Paso 3: Recargos -->
        <mat-step [stepControl]="recargosForm">
          <ng-template matStepLabel>Recargos</ng-template>

          <form [formGroup]="recargosForm" class="step-content">
            <p class="step-description">
              Agregue los recargos que se aplicarán a cada cuota del préstamo
              (ej: seguro, ahorro, GPS).
            </p>

            <div formArrayName="recargos">
              @for (recargo of recargosArray.controls; track recargo; let i = $index) {
                <div [formGroupName]="i" class="recargo-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Tipo de Recargo</mat-label>
                    <mat-select formControlName="tipoRecargoId" (selectionChange)="onTipoRecargoChange(i)">
                      <mat-option [value]="null">Otro (personalizado)</mat-option>
                      @for (tipo of tiposRecargo(); track tipo.id) {
                        <mat-option [value]="tipo.id">{{ tipo.nombre }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  @if (!recargo.get('tipoRecargoId')?.value) {
                    <mat-form-field appearance="outline">
                      <mat-label>Nombre</mat-label>
                      <input matInput formControlName="nombre">
                      @if (recargo.get('nombre')?.invalid && recargo.get('nombre')?.touched) {
                        <mat-error>El nombre es requerido</mat-error>
                      }
                    </mat-form-field>
                  }

                  <mat-form-field appearance="outline">
                    <mat-label>Tipo Cálculo</mat-label>
                    <mat-select formControlName="tipoCalculo">
                      <mat-option value="FIJO">Monto Fijo</mat-option>
                      <mat-option value="PORCENTAJE">Porcentaje</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>
                      {{ recargo.get('tipoCalculo')?.value === 'PORCENTAJE' ? 'Porcentaje (%)' : 'Monto ($)' }}
                    </mat-label>
                    <input matInput type="number" formControlName="valor" step="0.01" min="0" [max]="recargo.get('tipoCalculo')?.value === 'PORCENTAJE' ? 100 : null">
                    @if (recargo.get('valor')?.invalid && recargo.get('valor')?.touched) {
                      <mat-error>
                        @if (recargo.get('valor')?.hasError('required')) {
                          El valor es requerido
                        }
                        @if (recargo.get('valor')?.hasError('min')) {
                          El valor debe ser mayor o igual a 0
                        }
                      </mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="small-field">
                    <mat-label>Desde Cuota</mat-label>
                    <input matInput type="number" formControlName="aplicaDesde" min="1">
                    @if (recargo.get('aplicaDesde')?.invalid && recargo.get('aplicaDesde')?.touched) {
                      <mat-error>Debe ser mayor o igual a 1</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="small-field">
                    <mat-label>Hasta Cuota</mat-label>
                    <input matInput type="number" formControlName="aplicaHasta" min="0">
                    <mat-hint>0 = hasta el final</mat-hint>
                  </mat-form-field>

                  <button mat-icon-button color="warn" (click)="removeRecargo(i)" matTooltip="Eliminar">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              }
            </div>

            <button mat-stroked-button color="primary" (click)="addRecargo()" type="button">
              <mat-icon>add</mat-icon>
              Agregar Recargo
            </button>
          </form>

          <div class="step-actions">
            <button mat-button matStepperPrevious>
              <mat-icon>arrow_back</mat-icon>
              Anterior
            </button>
            <button mat-raised-button color="primary" (click)="generarPreview()">
              Generar Preview
              <mat-icon>preview</mat-icon>
            </button>
          </div>
        </mat-step>

        <!-- Paso 4: Preview y Confirmación -->
        <mat-step>
          <ng-template matStepLabel>Confirmación</ng-template>

          @if (loadingPreview()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Generando preview...</p>
            </div>
          } @else if (preview()) {
            <div class="step-content preview-content">
              <!-- Resumen de Montos -->
              <div class="preview-section">
                <h3>Resumen de Montos</h3>
                <div class="summary-grid">
                  <div class="summary-item">
                    <span class="label">Monto Autorizado:</span>
                    <span class="value">{{ preview()!.montoAutorizado | currency:'USD' }}</span>
                  </div>

                  @if (preview()!.deducciones.length > 0) {
                    <div class="summary-item deducciones-list">
                      <span class="label">Deducciones:</span>
                      <div class="deductions-detail">
                        @for (d of preview()!.deducciones; track d.nombre) {
                          <div class="deduction-line">
                            <span>{{ d.nombre }}:</span>
                            <span class="negative">-{{ d.monto | currency:'USD' }}</span>
                          </div>
                        }
                        <div class="deduction-total">
                          <span>Total Deducciones:</span>
                          <span class="negative">-{{ preview()!.totalDeducciones | currency:'USD' }}</span>
                        </div>
                      </div>
                    </div>
                  }

                  <div class="summary-item highlight">
                    <span class="label">Monto a Desembolsar:</span>
                    <span class="value amount">{{ preview()!.montoDesembolsado | currency:'USD' }}</span>
                  </div>
                </div>
              </div>

              <mat-divider></mat-divider>

              <!-- Información de Cuotas -->
              <div class="preview-section">
                <h3>Información de Cuotas</h3>
                <div class="summary-grid">
                  <div class="summary-item">
                    <span class="label">Número de Cuotas:</span>
                    <span class="value">{{ preview()!.numeroCuotas }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Cuota Normal:</span>
                    <span class="value">{{ preview()!.cuotaNormal | currency:'USD' }}</span>
                  </div>

                  @if (preview()!.recargos.length > 0) {
                    <div class="summary-item">
                      <span class="label">Recargos por Cuota:</span>
                      <span class="value">{{ preview()!.totalRecargosPorCuota | currency:'USD' }}</span>
                    </div>
                  }

                  <div class="summary-item highlight">
                    <span class="label">Cuota Total:</span>
                    <span class="value amount">{{ preview()!.cuotaTotal | currency:'USD' }}</span>
                  </div>
                </div>
              </div>

              <mat-divider></mat-divider>

              <!-- Totales -->
              <div class="preview-section">
                <h3>Totales a Pagar</h3>
                <div class="summary-grid totals">
                  <div class="summary-item">
                    <span class="label">Capital:</span>
                    <span class="value">{{ preview()!.montoAutorizado | currency:'USD' }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Total Intereses:</span>
                    <span class="value">{{ preview()!.totalInteres | currency:'USD' }}</span>
                  </div>
                  @if (preview()!.totalRecargos > 0) {
                    <div class="summary-item">
                      <span class="label">Total Recargos:</span>
                      <span class="value">{{ preview()!.totalRecargos | currency:'USD' }}</span>
                    </div>
                  }
                  <div class="summary-item grand-total">
                    <span class="label">TOTAL A PAGAR:</span>
                    <span class="value">{{ preview()!.totalAPagar | currency:'USD' }}</span>
                  </div>
                </div>
              </div>

              <mat-divider></mat-divider>

              <!-- Plan de Pago -->
              <div class="preview-section">
                <h3>Plan de Pago</h3>
                <div class="table-container">
                  <table mat-table [dataSource]="preview()!.planPago" class="plan-pago-table">
                    <ng-container matColumnDef="numeroCuota">
                      <th mat-header-cell *matHeaderCellDef>N°</th>
                      <td mat-cell *matCellDef="let row">{{ row.numeroCuota }}</td>
                    </ng-container>

                    <ng-container matColumnDef="fechaVencimiento">
                      <th mat-header-cell *matHeaderCellDef>Vencimiento</th>
                      <td mat-cell *matCellDef="let row">{{ row.fechaVencimiento | date:'dd/MM/yyyy' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="capital">
                      <th mat-header-cell *matHeaderCellDef>Capital</th>
                      <td mat-cell *matCellDef="let row">{{ row.capital | currency:'USD' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="interes">
                      <th mat-header-cell *matHeaderCellDef>Interés</th>
                      <td mat-cell *matCellDef="let row">{{ row.interes | currency:'USD' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="recargos">
                      <th mat-header-cell *matHeaderCellDef>Recargos</th>
                      <td mat-cell *matCellDef="let row">{{ row.recargos | currency:'USD' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="cuotaTotal">
                      <th mat-header-cell *matHeaderCellDef>Total</th>
                      <td mat-cell *matCellDef="let row"><strong>{{ row.cuotaTotal | currency:'USD' }}</strong></td>
                    </ng-container>

                    <ng-container matColumnDef="saldoCapital">
                      <th mat-header-cell *matHeaderCellDef>Saldo</th>
                      <td mat-cell *matCellDef="let row">{{ row.saldoCapital | currency:'USD' }}</td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="planPagoColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: planPagoColumns;"></tr>
                  </table>
                </div>
              </div>
            </div>
          }

          <div class="step-actions">
            <button mat-button matStepperPrevious>
              <mat-icon>arrow_back</mat-icon>
              Anterior
            </button>
            <button
              mat-raised-button
              color="primary"
              (click)="confirmarDesembolso()"
              [disabled]="!preview() || procesando()"
            >
              @if (procesando()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <mat-icon>check_circle</mat-icon>
                Confirmar Desembolso
              }
            </button>
          </div>
        </mat-step>
      </mat-stepper>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
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

    .solicitud-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

    .step-content {
      padding: 24px 0;
    }

    .step-description {
      color: #666;
      margin-bottom: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .deduccion-row,
    .recargo-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 16px;
      padding: 12px;
      background: #fafafa;
      border-radius: 8px;
    }

    .deduccion-row mat-form-field,
    .recargo-row mat-form-field {
      flex: 1;
    }

    .small-field {
      max-width: 100px;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      gap: 16px;
    }

    .preview-content {
      max-height: 60vh;
      overflow-y: auto;
    }

    .preview-section {
      margin: 16px 0;
    }

    .preview-section h3 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 16px;
    }

    .summary-grid {
      display: grid;
      gap: 12px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      background: #fafafa;
      border-radius: 4px;
    }

    .summary-item.highlight {
      background: #e3f2fd;
      font-weight: 500;
    }

    .summary-item.grand-total {
      background: #1976d2;
      color: white;
      font-size: 18px;
      font-weight: 600;
    }

    .summary-item .label {
      color: #666;
    }

    .summary-item .value.amount {
      color: #2e7d32;
      font-weight: 600;
    }

    .deducciones-list {
      flex-direction: column;
    }

    .deductions-detail {
      margin-top: 8px;
    }

    .deduction-line {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 14px;
    }

    .deduction-total {
      display: flex;
      justify-content: space-between;
      padding-top: 8px;
      border-top: 1px solid #ddd;
      font-weight: 500;
    }

    .negative {
      color: #d32f2f;
    }

    .table-container {
      max-height: 300px;
      overflow-y: auto;
    }

    .plan-pago-table {
      width: 100%;
    }

    .plan-pago-table th {
      background: #fafafa;
      font-weight: 600;
    }

    mat-dialog-actions {
      padding: 16px 24px;
    }
  `],
})
export class CrearDesembolsoDialogComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  private fb = inject(FormBuilder);
  private desembolsoService = inject(DesembolsoService);
  private snackBar = inject(MatSnackBar);
  dialogRef = inject(MatDialogRef<CrearDesembolsoDialogComponent>);
  data = inject<{ solicitud: Solicitud }>(MAT_DIALOG_DATA);

  tiposDeduccion = signal<TipoDeduccion[]>([]);
  tiposRecargo = signal<TipoRecargo[]>([]);
  preview = signal<PreviewDesembolsoResponse | null>(null);
  loadingPreview = signal(false);
  procesando = signal(false);

  planPagoColumns = ['numeroCuota', 'fechaVencimiento', 'capital', 'interes', 'recargos', 'cuotaTotal', 'saldoCapital'];

  tipoInteresOptions = Object.entries(TIPO_INTERES_LABELS).map(([value, label]) => ({ value, label }));
  periodicidadOptions = Object.entries(PERIODICIDAD_PAGO_LABELS).map(([value, label]) => ({ value, label }));

  configForm: FormGroup;
  deduccionesForm: FormGroup;
  recargosForm: FormGroup;

  constructor() {
    // Calcular fecha por defecto (un mes después de hoy)
    const fechaDefault = new Date();
    fechaDefault.setMonth(fechaDefault.getMonth() + 1);

    this.configForm = this.fb.group({
      periodicidadPago: [PeriodicidadPago.MENSUAL, Validators.required],
      tipoInteres: [TipoInteres.FLAT, Validators.required],
      fechaPrimeraCuota: [fechaDefault, Validators.required],
    });

    this.deduccionesForm = this.fb.group({
      deducciones: this.fb.array([]),
    });

    this.recargosForm = this.fb.group({
      recargos: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  get deduccionesArray(): FormArray {
    return this.deduccionesForm.get('deducciones') as FormArray;
  }

  get recargosArray(): FormArray {
    return this.recargosForm.get('recargos') as FormArray;
  }

  cargarCatalogos(): void {
    this.desembolsoService.getTiposDeduccion(true).subscribe({
      next: (data) => this.tiposDeduccion.set(data),
    });
    this.desembolsoService.getTiposRecargo(true).subscribe({
      next: (data) => this.tiposRecargo.set(data),
    });
  }

  addDeduccion(): void {
    const deduccionGroup = this.fb.group({
      tipoDeduccionId: [null],
      nombre: [''],
      tipoCalculo: [TipoCalculo.PORCENTAJE, Validators.required],
      valor: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    });

    // Agregar validador condicional: si no tiene tipoDeduccionId, nombre es requerido
    deduccionGroup.get('tipoDeduccionId')?.valueChanges.subscribe(value => {
      const nombreControl = deduccionGroup.get('nombre');
      if (!value) {
        nombreControl?.setValidators([Validators.required]);
      } else {
        nombreControl?.clearValidators();
      }
      nombreControl?.updateValueAndValidity();
    });

    this.deduccionesArray.push(deduccionGroup);
  }

  removeDeduccion(index: number): void {
    this.deduccionesArray.removeAt(index);
  }

  onTipoDeduccionChange(index: number): void {
    const control = this.deduccionesArray.at(index);
    const tipoId = control.get('tipoDeduccionId')?.value;

    if (tipoId) {
      const tipo = this.tiposDeduccion().find(t => t.id === tipoId);
      if (tipo) {
        control.patchValue({
          tipoCalculo: tipo.tipoCalculoDefault,
          valor: tipo.valorDefault,
        });
      }
    }
  }

  addRecargo(): void {
    const recargoGroup = this.fb.group({
      tipoRecargoId: [null],
      nombre: [''],
      tipoCalculo: [TipoCalculo.FIJO, Validators.required],
      valor: [0, [Validators.required, Validators.min(0)]],
      aplicaDesde: [1, [Validators.min(1)]],
      aplicaHasta: [0],
    });

    // Agregar validador condicional: si no tiene tipoRecargoId, nombre es requerido
    recargoGroup.get('tipoRecargoId')?.valueChanges.subscribe(value => {
      const nombreControl = recargoGroup.get('nombre');
      if (!value) {
        nombreControl?.setValidators([Validators.required]);
      } else {
        nombreControl?.clearValidators();
      }
      nombreControl?.updateValueAndValidity();
    });

    this.recargosArray.push(recargoGroup);
  }

  removeRecargo(index: number): void {
    this.recargosArray.removeAt(index);
  }

  onTipoRecargoChange(index: number): void {
    const control = this.recargosArray.at(index);
    const tipoId = control.get('tipoRecargoId')?.value;

    if (tipoId) {
      const tipo = this.tiposRecargo().find(t => t.id === tipoId);
      if (tipo) {
        control.patchValue({
          tipoCalculo: tipo.tipoCalculoDefault,
          valor: tipo.valorDefault,
        });
      }
    }
  }

  generarPreview(): void {
    if (!this.configForm.valid) {
      this.snackBar.open('Complete la configuración básica', 'Cerrar', { duration: 3000 });
      return;
    }

    // Validar deducciones
    const deduccionesValidas = this.validarDeducciones();
    if (!deduccionesValidas) {
      return;
    }

    // Validar recargos
    const recargosValidos = this.validarRecargos();
    if (!recargosValidos) {
      return;
    }

    this.loadingPreview.set(true);

    const fechaPrimeraCuota = this.configForm.get('fechaPrimeraCuota')?.value;
    const fechaStr = fechaPrimeraCuota instanceof Date
      ? fechaPrimeraCuota.toISOString().split('T')[0]
      : fechaPrimeraCuota;

    const request: PreviewDesembolsoRequest = {
      solicitudId: this.data.solicitud.id,
      periodicidadPago: this.configForm.get('periodicidadPago')?.value,
      tipoInteres: this.configForm.get('tipoInteres')?.value,
      fechaPrimeraCuota: fechaStr,
      deducciones: this.transformarDeducciones(),
      recargos: this.transformarRecargos(),
    };

    this.desembolsoService.preview(request).subscribe({
      next: (data) => {
        this.preview.set(data);
        this.loadingPreview.set(false);
        // Avanzar al siguiente paso del stepper (paso de confirmación)
        if (this.stepper) {
          this.stepper.next();
        }
      },
      error: (err) => {
        console.error('Error generando preview:', err);
        this.snackBar.open(err.error?.message || 'Error al generar preview', 'Cerrar', { duration: 5000 });
        this.loadingPreview.set(false);
      },
    });
  }

  confirmarDesembolso(): void {
    if (!this.preview()) {
      this.snackBar.open('Genere el preview primero', 'Cerrar', { duration: 3000 });
      return;
    }

    this.procesando.set(true);

    const fechaPrimeraCuota = this.configForm.get('fechaPrimeraCuota')?.value;
    const fechaStr = fechaPrimeraCuota instanceof Date
      ? fechaPrimeraCuota.toISOString().split('T')[0]
      : fechaPrimeraCuota;

    const request: CrearDesembolsoRequest = {
      solicitudId: this.data.solicitud.id,
      periodicidadPago: this.configForm.get('periodicidadPago')?.value,
      tipoInteres: this.configForm.get('tipoInteres')?.value,
      fechaPrimeraCuota: fechaStr,
      deducciones: this.transformarDeducciones(),
      recargos: this.transformarRecargos(),
    };

    this.desembolsoService.crear(request).subscribe({
      next: (prestamo) => {
        this.procesando.set(false);
        this.dialogRef.close(prestamo);
      },
      error: (err) => {
        console.error('Error creando desembolso:', err);
        this.snackBar.open(err.error?.message || 'Error al crear desembolso', 'Cerrar', { duration: 5000 });
        this.procesando.set(false);
      },
    });
  }

  /**
   * Valida que las deducciones tengan los campos requeridos
   */
  private validarDeducciones(): boolean {
    for (let i = 0; i < this.deduccionesArray.length; i++) {
      const deduccion = this.deduccionesArray.at(i).value;

      // Si no tiene tipoDeduccionId, debe tener nombre
      if (!deduccion.tipoDeduccionId && (!deduccion.nombre || deduccion.nombre.trim() === '')) {
        this.snackBar.open(
          `Deducción ${i + 1}: debe seleccionar un tipo o ingresar un nombre`,
          'Cerrar',
          { duration: 4000 }
        );
        return false;
      }

      // Validar valor
      if (deduccion.valor === null || deduccion.valor === undefined || deduccion.valor < 0) {
        this.snackBar.open(
          `Deducción ${i + 1}: el valor debe ser mayor o igual a 0`,
          'Cerrar',
          { duration: 4000 }
        );
        return false;
      }

      // Validar porcentaje
      if (deduccion.tipoCalculo === 'PORCENTAJE' && deduccion.valor > 100) {
        this.snackBar.open(
          `Deducción ${i + 1}: el porcentaje no puede ser mayor a 100%`,
          'Cerrar',
          { duration: 4000 }
        );
        return false;
      }
    }
    return true;
  }

  /**
   * Valida que los recargos tengan los campos requeridos
   */
  private validarRecargos(): boolean {
    for (let i = 0; i < this.recargosArray.length; i++) {
      const recargo = this.recargosArray.at(i).value;

      // Si no tiene tipoRecargoId, debe tener nombre
      if (!recargo.tipoRecargoId && (!recargo.nombre || recargo.nombre.trim() === '')) {
        this.snackBar.open(
          `Recargo ${i + 1}: debe seleccionar un tipo o ingresar un nombre`,
          'Cerrar',
          { duration: 4000 }
        );
        return false;
      }

      // Validar valor
      if (recargo.valor === null || recargo.valor === undefined || recargo.valor < 0) {
        this.snackBar.open(
          `Recargo ${i + 1}: el valor debe ser mayor o igual a 0`,
          'Cerrar',
          { duration: 4000 }
        );
        return false;
      }

      // Validar porcentaje
      if (recargo.tipoCalculo === 'PORCENTAJE' && recargo.valor > 100) {
        this.snackBar.open(
          `Recargo ${i + 1}: el porcentaje no puede ser mayor a 100%`,
          'Cerrar',
          { duration: 4000 }
        );
        return false;
      }

      // Validar rango de cuotas
      const aplicaDesde = recargo.aplicaDesde || 1;
      const aplicaHasta = recargo.aplicaHasta || 0;

      if (aplicaDesde < 1) {
        this.snackBar.open(
          `Recargo ${i + 1}: "Desde Cuota" debe ser mayor o igual a 1`,
          'Cerrar',
          { duration: 4000 }
        );
        return false;
      }

      if (aplicaHasta > 0 && aplicaHasta < aplicaDesde) {
        this.snackBar.open(
          `Recargo ${i + 1}: "Hasta Cuota" debe ser mayor o igual a "Desde Cuota"`,
          'Cerrar',
          { duration: 4000 }
        );
        return false;
      }
    }
    return true;
  }

  /**
   * Transforma las deducciones del formulario al formato esperado por el backend
   */
  private transformarDeducciones(): DeduccionDesembolsoDto[] {
    return this.deduccionesArray.value.map((deduccion: any) => {
      const dto: DeduccionDesembolsoDto = {
        tipoCalculo: deduccion.tipoCalculo,
        valor: Number(deduccion.valor),
      };

      // Solo incluir tipoDeduccionId si tiene valor
      if (deduccion.tipoDeduccionId) {
        dto.tipoDeduccionId = deduccion.tipoDeduccionId;
      } else {
        // Si no tiene tipo, debe tener nombre
        dto.nombre = deduccion.nombre.trim();
      }

      return dto;
    });
  }

  /**
   * Transforma los recargos del formulario al formato esperado por el backend
   */
  private transformarRecargos(): RecargoDesembolsoDto[] {
    return this.recargosArray.value.map((recargo: any) => {
      const dto: RecargoDesembolsoDto = {
        tipoCalculo: recargo.tipoCalculo,
        valor: Number(recargo.valor),
        aplicaDesde: recargo.aplicaDesde || 1,
        aplicaHasta: recargo.aplicaHasta || 0,
      };

      // Solo incluir tipoRecargoId si tiene valor
      if (recargo.tipoRecargoId) {
        dto.tipoRecargoId = recargo.tipoRecargoId;
      } else {
        // Si no tiene tipo, debe tener nombre
        dto.nombre = recargo.nombre.trim();
      }

      return dto;
    });
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}
