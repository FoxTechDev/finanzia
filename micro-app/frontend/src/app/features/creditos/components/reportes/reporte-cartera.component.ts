import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  ReporteService,
  DatosReporteCartera,
  RespuestaReporteCartera
} from '../../services/reporte.service';

@Component({
  selector: 'app-reporte-cartera',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatDividerModule,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
  ],
  template: `
    <div class="container">
      <!-- Encabezado -->
      <div class="header">
        <div>
          <h1>
            <mat-icon>account_balance_wallet</mat-icon>
            Detalle de Cartera de Préstamos
          </h1>
          <p class="subtitle">
            Consulta y exportación del detalle de la cartera de préstamos a fecha de corte
          </p>
        </div>
      </div>

      <!-- Formulario de Filtros -->
      <mat-card class="filters-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>filter_list</mat-icon>
            Filtros del Reporte
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="filtrosForm" class="filters-form">
            <div class="filters-row">
              <!-- Fecha de Corte -->
              <mat-form-field appearance="outline" class="fecha-corte-field">
                <mat-label>Fecha de corte</mat-label>
                <input
                  matInput
                  [matDatepicker]="pickerCorte"
                  formControlName="fechaCorte"
                  placeholder="Seleccione fecha de corte"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="pickerCorte"
                ></mat-datepicker-toggle>
                <mat-datepicker #pickerCorte></mat-datepicker>
                <mat-hint>Seleccione la fecha de corte para el reporte</mat-hint>
                @if (filtrosForm.get('fechaCorte')?.hasError('required') &&
                     filtrosForm.get('fechaCorte')?.touched) {
                  <mat-error>La fecha de corte es requerida</mat-error>
                }
              </mat-form-field>
            </div>

            <!-- Botones de Acción -->
            <div class="filter-actions">
              <button
                mat-raised-button
                color="primary"
                (click)="generarReporte()"
                [disabled]="filtrosForm.invalid || isLoading()"
              >
                <mat-icon>play_arrow</mat-icon>
                Generar Reporte
              </button>
              <button
                mat-stroked-button
                (click)="limpiarFiltros()"
                [disabled]="isLoading()"
              >
                <mat-icon>clear</mat-icon>
                Limpiar
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Loading -->
      @if (isLoading()) {
        <div class="loading">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Generando reporte...</p>
        </div>
      }

      <!-- Tabla de Resultados -->
      @if (!isLoading() && datosReporte().length > 0) {
        <mat-card class="results-card">
          <mat-card-header>
            <mat-card-title>
              <div class="results-header">
                <div>
                  <mat-icon>description</mat-icon>
                  Resultados del Reporte
                  @if (fechaCorteReporte()) {
                    <span class="fecha-corte-badge">
                      Corte: {{ fechaCorteReporte() | date:'dd/MM/yyyy' }}
                    </span>
                  }
                </div>
                <div class="export-buttons">
                  <button
                    mat-raised-button
                    color="accent"
                    (click)="exportarExcel()"
                    [disabled]="exportandoExcel()"
                  >
                    @if (exportandoExcel()) {
                      <mat-spinner diameter="18" style="display: inline-block; margin-right: 8px;"></mat-spinner>
                    } @else {
                      <mat-icon>table_chart</mat-icon>
                    }
                    Exportar a Excel
                  </button>
                  <button
                    mat-raised-button
                    color="warn"
                    (click)="exportarPDF()"
                    [disabled]="exportandoPdf()"
                  >
                    @if (exportandoPdf()) {
                      <mat-spinner diameter="18" style="display: inline-block; margin-right: 8px;"></mat-spinner>
                    } @else {
                      <mat-icon>picture_as_pdf</mat-icon>
                    }
                    Exportar a PDF
                  </button>
                </div>
              </div>
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <!-- Resumen de Totales -->
            <div class="summary">
              <div class="summary-item">
                <mat-icon>account_balance_wallet</mat-icon>
                <div>
                  <span class="summary-label">Total de Préstamos</span>
                  <span class="summary-value">{{ datosReporte().length }}</span>
                </div>
              </div>
              <div class="summary-item primary">
                <mat-icon>attach_money</mat-icon>
                <div>
                  <span class="summary-label">Total Monto</span>
                  <span class="summary-value">
                    {{ calcularTotalMonto() | currency:'USD':'symbol':'1.2-2' }}
                  </span>
                </div>
              </div>
              <div class="summary-item accent">
                <mat-icon>account_balance</mat-icon>
                <div>
                  <span class="summary-label">Total Saldo Capital</span>
                  <span class="summary-value">
                    {{ calcularTotalSaldoCapital() | currency:'USD':'symbol':'1.2-2' }}
                  </span>
                </div>
              </div>
              <div class="summary-item warn">
                <mat-icon>percent</mat-icon>
                <div>
                  <span class="summary-label">Total Saldo Interés</span>
                  <span class="summary-value">
                    {{ calcularTotalSaldoInteres() | currency:'USD':'symbol':'1.2-2' }}
                  </span>
                </div>
              </div>
              <div class="summary-item danger">
                <mat-icon>warning</mat-icon>
                <div>
                  <span class="summary-label">Total Capital Mora</span>
                  <span class="summary-value">
                    {{ calcularTotalCapitalMora() | currency:'USD':'symbol':'1.2-2' }}
                  </span>
                </div>
              </div>
              <div class="summary-item danger">
                <mat-icon>error</mat-icon>
                <div>
                  <span class="summary-label">Total Interés Mora</span>
                  <span class="summary-value">
                    {{ calcularTotalInteresMora() | currency:'USD':'symbol':'1.2-2' }}
                  </span>
                </div>
              </div>
            </div>

            <mat-divider style="margin: 24px 0;"></mat-divider>

            <!-- Tabla -->
            <div class="table-responsive">
              <table mat-table [dataSource]="datosPaginados()">
                <!-- Número de Crédito -->
                <ng-container matColumnDef="numeroCredito">
                  <th mat-header-cell *matHeaderCellDef>No. Préstamo</th>
                  <td mat-cell *matCellDef="let item">
                    <strong>{{ item.numeroCredito }}</strong>
                  </td>
                </ng-container>

                <!-- Cliente -->
                <ng-container matColumnDef="nombreCliente">
                  <th mat-header-cell *matHeaderCellDef>Cliente</th>
                  <td mat-cell *matCellDef="let item">{{ item.nombreCliente }}</td>
                </ng-container>

                <!-- Línea de Crédito -->
                <ng-container matColumnDef="lineaCredito">
                  <th mat-header-cell *matHeaderCellDef>Línea</th>
                  <td mat-cell *matCellDef="let item">{{ item.lineaCredito }}</td>
                </ng-container>

                <!-- Tipo de Crédito -->
                <ng-container matColumnDef="tipoCredito">
                  <th mat-header-cell *matHeaderCellDef>Tipo</th>
                  <td mat-cell *matCellDef="let item">{{ item.tipoCredito }}</td>
                </ng-container>

                <!-- Fecha Otorgamiento -->
                <ng-container matColumnDef="fechaOtorgamiento">
                  <th mat-header-cell *matHeaderCellDef>F. Otorg.</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.fechaOtorgamiento | date:'dd/MM/yyyy' }}
                  </td>
                </ng-container>

                <!-- Fecha Vencimiento -->
                <ng-container matColumnDef="fechaVencimiento">
                  <th mat-header-cell *matHeaderCellDef>F. Venc.</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.fechaVencimiento | date:'dd/MM/yyyy' }}
                  </td>
                </ng-container>

                <!-- Monto -->
                <ng-container matColumnDef="monto">
                  <th mat-header-cell *matHeaderCellDef>Monto</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.monto | currency:'USD':'symbol':'1.2-2' }}
                  </td>
                </ng-container>

                <!-- Plazo -->
                <ng-container matColumnDef="plazo">
                  <th mat-header-cell *matHeaderCellDef>Plazo</th>
                  <td mat-cell *matCellDef="let item">{{ item.plazo }} meses</td>
                </ng-container>

                <!-- Tasa de Interés -->
                <ng-container matColumnDef="tasaInteres">
                  <th mat-header-cell *matHeaderCellDef>Tasa %</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.tasaInteres | number:'1.2-2' }}%
                  </td>
                </ng-container>

                <!-- Cuota Total -->
                <ng-container matColumnDef="cuotaTotal">
                  <th mat-header-cell *matHeaderCellDef>Cuota</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.cuotaTotal | currency:'USD':'symbol':'1.2-2' }}
                  </td>
                </ng-container>

                <!-- Número de Cuotas -->
                <ng-container matColumnDef="numeroCuotas">
                  <th mat-header-cell *matHeaderCellDef>No. Cuotas</th>
                  <td mat-cell *matCellDef="let item">{{ item.numeroCuotas }}</td>
                </ng-container>

                <!-- Saldo Capital -->
                <ng-container matColumnDef="saldoCapital">
                  <th mat-header-cell *matHeaderCellDef>Saldo Capital</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.saldoCapital | currency:'USD':'symbol':'1.2-2' }}
                  </td>
                </ng-container>

                <!-- Saldo Interés -->
                <ng-container matColumnDef="saldoInteres">
                  <th mat-header-cell *matHeaderCellDef>Saldo Interés</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.saldoInteres | currency:'USD':'symbol':'1.2-2' }}
                  </td>
                </ng-container>

                <!-- Cuotas Atrasadas -->
                <ng-container matColumnDef="cuotasAtrasadas">
                  <th mat-header-cell *matHeaderCellDef>Cuotas Atr.</th>
                  <td mat-cell *matCellDef="let item">
                    <span [class.text-danger]="item.cuotasAtrasadas > 0">
                      {{ item.cuotasAtrasadas }}
                    </span>
                  </td>
                </ng-container>

                <!-- Capital en Mora -->
                <ng-container matColumnDef="capitalMora">
                  <th mat-header-cell *matHeaderCellDef>Capital Mora</th>
                  <td mat-cell *matCellDef="let item">
                    <span [class.text-danger]="item.capitalMora > 0">
                      {{ item.capitalMora | currency:'USD':'symbol':'1.2-2' }}
                    </span>
                  </td>
                </ng-container>

                <!-- Interés en Mora -->
                <ng-container matColumnDef="interesMora">
                  <th mat-header-cell *matHeaderCellDef>Interés Mora</th>
                  <td mat-cell *matCellDef="let item">
                    <span [class.text-danger]="item.interesMora > 0">
                      {{ item.interesMora | currency:'USD':'symbol':'1.2-2' }}
                    </span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="columnasVisibles"></tr>
                <tr mat-row *matRowDef="let row; columns: columnasVisibles"></tr>
              </table>
            </div>

            <!-- Paginador -->
            <mat-paginator
              [length]="datosReporte().length"
              [pageSize]="tamanioPagina"
              [pageSizeOptions]="[10, 25, 50, 100]"
              (page)="onPageChange($event)"
              showFirstLastButtons
            >
            </mat-paginator>
          </mat-card-content>
        </mat-card>
      }

      <!-- Estado Vacío -->
      @if (!isLoading() && reporteGenerado() && datosReporte().length === 0) {
        <mat-card class="empty-card">
          <mat-card-content>
            <div class="empty">
              <mat-icon>info</mat-icon>
              <p>No se encontraron préstamos en la cartera para la fecha seleccionada</p>
              <button mat-raised-button color="primary" (click)="limpiarFiltros()">
                <mat-icon>refresh</mat-icon>
                Cambiar Fecha
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .container {
      padding: 24px;
      max-width: 1900px;
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
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .fecha-corte-field {
      flex: 0 0 300px;
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

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      flex-wrap: wrap;
      gap: 16px;
    }

    .results-header > div:first-child {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .fecha-corte-badge {
      background: #1976d2;
      color: white;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .export-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 16px;
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

    .summary-item.accent {
      background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    }

    .summary-item.warn {
      background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%);
    }

    .summary-item.danger {
      background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
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

    .table-responsive {
      overflow-x: auto;
      margin-top: 16px;
    }

    table {
      width: 100%;
      background: white;
    }

    th {
      background-color: #f5f5f5;
      font-weight: 600;
      color: #333;
      white-space: nowrap;
    }

    td {
      color: #555;
    }

    tr:hover {
      background-color: #fafafa;
    }

    .text-danger {
      color: #d32f2f;
      font-weight: 600;
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
      margin: 16px 0 24px 0;
    }

    /* Responsive */
    @media (max-width: 960px) {
      .container {
        padding: 16px;
      }

      .header h1 {
        font-size: 24px;
      }

      .filters-row {
        flex-direction: column;
      }

      .fecha-corte-field {
        flex: 1 1 100%;
      }

      .results-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .export-buttons {
        width: 100%;
        flex-direction: column;
      }

      .export-buttons button {
        width: 100%;
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

      .summary-value {
        font-size: 20px;
      }
    }
  `],
})
export class ReporteCarteraComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reporteService = inject(ReporteService);
  private snackBar = inject(MatSnackBar);

  // Signals
  isLoading = signal(false);
  reporteGenerado = signal(false);
  datosReporte = signal<DatosReporteCartera[]>([]);
  datosPaginados = signal<DatosReporteCartera[]>([]);
  exportandoExcel = signal(false);
  exportandoPdf = signal(false);
  fechaCorteReporte = signal<string>('');

  // Totales recibidos del backend
  totalesBackend: RespuestaReporteCartera | null = null;

  // Formulario
  filtrosForm!: FormGroup;

  // Paginación
  tamanioPagina = 10;
  indicePagina = 0;

  // Columnas de la tabla (todas las 16 columnas solicitadas)
  columnasVisibles = [
    'numeroCredito',
    'nombreCliente',
    'lineaCredito',
    'tipoCredito',
    'fechaOtorgamiento',
    'fechaVencimiento',
    'monto',
    'plazo',
    'tasaInteres',
    'cuotaTotal',
    'numeroCuotas',
    'saldoCapital',
    'saldoInteres',
    'cuotasAtrasadas',
    'capitalMora',
    'interesMora',
  ];

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  /**
   * Inicializa el formulario de filtros con valores por defecto
   */
  private inicializarFormulario(): void {
    // Fecha de corte: día actual
    const hoy = new Date();

    this.filtrosForm = this.fb.group({
      fechaCorte: [hoy, Validators.required],
    });
  }

  /**
   * Genera el reporte con la fecha de corte seleccionada
   */
  generarReporte(): void {
    if (this.filtrosForm.invalid) {
      this.filtrosForm.markAllAsTouched();
      this.snackBar.open(
        'Por favor seleccione una fecha de corte',
        'Cerrar',
        { duration: 3000 }
      );
      return;
    }

    this.isLoading.set(true);
    this.reporteGenerado.set(false);

    const fechaCorte = this.formatearFecha(this.filtrosForm.value.fechaCorte);

    this.reporteService.getReporteCartera(fechaCorte).subscribe({
      next: (response) => {
        this.datosReporte.set(response.prestamos || []);
        this.totalesBackend = response;
        this.reporteGenerado.set(true);
        this.fechaCorteReporte.set(fechaCorte);
        this.indicePagina = 0;
        this.actualizarDatosPaginados();
        this.isLoading.set(false);

        if (response.prestamos && response.prestamos.length > 0) {
          this.snackBar.open(
            `Reporte generado: ${response.prestamos.length} préstamo(s) encontrado(s)`,
            'Cerrar',
            { duration: 3000 }
          );
        }
      },
      error: (err) => {
        console.error('Error al generar reporte:', err);
        this.datosReporte.set([]);
        this.reporteGenerado.set(true);
        this.isLoading.set(false);
        this.snackBar.open(
          err.error?.message || 'Error al generar el reporte',
          'Cerrar',
          { duration: 4000 }
        );
      },
    });
  }

  /**
   * Limpia los filtros y reinicia el formulario
   */
  limpiarFiltros(): void {
    this.inicializarFormulario();
    this.datosReporte.set([]);
    this.totalesBackend = null;
    this.reporteGenerado.set(false);
    this.fechaCorteReporte.set('');
  }

  /**
   * Maneja el cambio de página en el paginador
   */
  onPageChange(event: PageEvent): void {
    this.tamanioPagina = event.pageSize;
    this.indicePagina = event.pageIndex;
    this.actualizarDatosPaginados();
  }

  /**
   * Actualiza los datos visibles según la paginación
   */
  private actualizarDatosPaginados(): void {
    const inicio = this.indicePagina * this.tamanioPagina;
    const fin = inicio + this.tamanioPagina;
    this.datosPaginados.set(this.datosReporte().slice(inicio, fin));
  }

  /**
   * Calcula el total del monto
   */
  calcularTotalMonto(): number {
    return this.datosReporte().reduce(
      (sum, item) => sum + Number(item.monto || 0),
      0
    );
  }

  /**
   * Calcula el total del saldo de capital
   */
  calcularTotalSaldoCapital(): number {
    return this.datosReporte().reduce(
      (sum, item) => sum + Number(item.saldoCapital || 0),
      0
    );
  }

  /**
   * Calcula el total del saldo de interés
   */
  calcularTotalSaldoInteres(): number {
    return this.datosReporte().reduce(
      (sum, item) => sum + Number(item.saldoInteres || 0),
      0
    );
  }

  /**
   * Calcula el total del capital en mora
   */
  calcularTotalCapitalMora(): number {
    return this.datosReporte().reduce(
      (sum, item) => sum + Number(item.capitalMora || 0),
      0
    );
  }

  /**
   * Calcula el total del interés en mora
   */
  calcularTotalInteresMora(): number {
    return this.datosReporte().reduce(
      (sum, item) => sum + Number(item.interesMora || 0),
      0
    );
  }

  /**
   * Exporta los datos a Excel
   */
  exportarExcel(): void {
    if (this.datosReporte().length === 0) {
      this.snackBar.open('No hay datos para exportar', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.exportandoExcel.set(true);

    try {
      // Preparar datos para Excel con todas las columnas
      const datosExcel = this.datosReporte().map((item) => ({
        'No. Préstamo': item.numeroCredito,
        'Cliente': item.nombreCliente,
        'Línea de Crédito': item.lineaCredito,
        'Tipo de Crédito': item.tipoCredito,
        'Fecha Otorgamiento': new Date(item.fechaOtorgamiento).toLocaleDateString('es-SV'),
        'Fecha Vencimiento': new Date(item.fechaVencimiento).toLocaleDateString('es-SV'),
        'Monto': item.monto,
        'Plazo (Meses)': item.plazo,
        'Tasa Interés (%)': item.tasaInteres,
        'Cuota Total': item.cuotaTotal,
        'Número de Cuotas': item.numeroCuotas,
        'Saldo Capital': item.saldoCapital,
        'Saldo Interés': item.saldoInteres,
        'Cuotas Atrasadas': item.cuotasAtrasadas,
        'Capital en Mora': item.capitalMora,
        'Interés en Mora': item.interesMora,
      }));

      // Agregar fila de totales
      datosExcel.push({
        'No. Préstamo': '',
        'Cliente': '',
        'Línea de Crédito': '',
        'Tipo de Crédito': '',
        'Fecha Otorgamiento': '',
        'Fecha Vencimiento': 'TOTALES',
        'Monto': this.calcularTotalMonto(),
        'Plazo (Meses)': '',
        'Tasa Interés (%)': '',
        'Cuota Total': '',
        'Número de Cuotas': '',
        'Saldo Capital': this.calcularTotalSaldoCapital(),
        'Saldo Interés': this.calcularTotalSaldoInteres(),
        'Cuotas Atrasadas': '',
        'Capital en Mora': this.calcularTotalCapitalMora(),
        'Interés en Mora': this.calcularTotalInteresMora(),
      } as any);

      // Crear worksheet
      const worksheet = XLSX.utils.json_to_sheet(datosExcel);

      // Crear workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Detalle Cartera');

      // Generar nombre de archivo
      const fechaCorte = this.fechaCorteReporte();
      const nombreArchivo = `detalle-cartera-${fechaCorte}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(workbook, nombreArchivo);

      this.snackBar.open('Reporte exportado correctamente', 'Cerrar', {
        duration: 3000,
      });
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      this.snackBar.open('Error al exportar a Excel', 'Cerrar', {
        duration: 3000,
      });
    } finally {
      this.exportandoExcel.set(false);
    }
  }

  /**
   * Exporta los datos a PDF
   */
  exportarPDF(): void {
    if (this.datosReporte().length === 0) {
      this.snackBar.open('No hay datos para exportar', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.exportandoPdf.set(true);

    try {
      const doc = new jsPDF('landscape');

      // Título del reporte
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('FINANZIA', doc.internal.pageSize.width / 2, 20, {
        align: 'center',
      });

      doc.setFontSize(14);
      doc.text('Detalle de Cartera de Préstamos', doc.internal.pageSize.width / 2, 30, {
        align: 'center',
      });

      // Fecha de corte
      const fechaCorte = new Date(this.fechaCorteReporte()).toLocaleDateString('es-SV');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Fecha de corte: ${fechaCorte}`,
        doc.internal.pageSize.width / 2,
        38,
        { align: 'center' }
      );

      // Fecha de generación
      doc.text(
        `Fecha de generación: ${new Date().toLocaleDateString('es-SV')}`,
        doc.internal.pageSize.width / 2,
        44,
        { align: 'center' }
      );

      // Preparar datos para la tabla
      const tableData = this.datosReporte().map((item) => [
        item.numeroCredito,
        item.nombreCliente,
        item.lineaCredito,
        item.tipoCredito,
        new Date(item.fechaOtorgamiento).toLocaleDateString('es-SV'),
        new Date(item.fechaVencimiento).toLocaleDateString('es-SV'),
        `$${Number(item.monto || 0).toFixed(2)}`,
        item.plazo.toString(),
        `${Number(item.tasaInteres || 0).toFixed(2)}%`,
        `$${Number(item.cuotaTotal || 0).toFixed(2)}`,
        item.numeroCuotas.toString(),
        `$${Number(item.saldoCapital || 0).toFixed(2)}`,
        `$${Number(item.saldoInteres || 0).toFixed(2)}`,
        item.cuotasAtrasadas.toString(),
        `$${Number(item.capitalMora || 0).toFixed(2)}`,
        `$${Number(item.interesMora || 0).toFixed(2)}`,
      ]);

      // Agregar fila de totales
      tableData.push([
        '',
        '',
        '',
        '',
        '',
        'TOTALES',
        `$${this.calcularTotalMonto().toFixed(2)}`,
        '',
        '',
        '',
        '',
        `$${this.calcularTotalSaldoCapital().toFixed(2)}`,
        `$${this.calcularTotalSaldoInteres().toFixed(2)}`,
        '',
        `$${this.calcularTotalCapitalMora().toFixed(2)}`,
        `$${this.calcularTotalInteresMora().toFixed(2)}`,
      ]);

      // Generar tabla
      autoTable(doc, {
        startY: 50,
        head: [
          [
            'No. Préstamo',
            'Cliente',
            'Línea',
            'Tipo',
            'F. Otorg.',
            'F. Venc.',
            'Monto',
            'Plazo',
            'Tasa%',
            'Cuota',
            'Cuotas',
            'Saldo Cap.',
            'Saldo Int.',
            'Atr.',
            'Cap. Mora',
            'Int. Mora',
          ],
        ],
        body: tableData,
        styles: { fontSize: 6 },
        headStyles: { fillColor: [25, 118, 210], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        didParseCell: (data) => {
          // Resaltar fila de totales
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [255, 243, 224];
          }
        },
      });

      // Generar nombre de archivo
      const nombreArchivo = `detalle-cartera-${this.fechaCorteReporte()}.pdf`;

      // Descargar PDF
      doc.save(nombreArchivo);

      this.snackBar.open('PDF generado correctamente', 'Cerrar', {
        duration: 3000,
      });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.snackBar.open('Error al generar el PDF', 'Cerrar', {
        duration: 3000,
      });
    } finally {
      this.exportandoPdf.set(false);
    }
  }

  /**
   * Formatea una fecha al formato YYYY-MM-DD
   */
  private formatearFecha(fecha: Date): string {
    if (!fecha) return '';
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
