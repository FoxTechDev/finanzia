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
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  ReporteService,
  DatosReportePagos,
  FiltrosReportePagos
} from '../../services/reporte.service';
import { CatalogosService } from '@features/catalogos/services/catalogos.service';
import { CatalogoBase } from '@core/models/catalogo.model';
import { ESTADO_PAGO_LABELS, EstadoPago } from '@core/models/credito.model';

@Component({
  selector: 'app-reporte-pagos',
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
    MatSelectModule,
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
            <mat-icon>receipt_long</mat-icon>
            Reporte de Pagos
          </h1>
          <p class="subtitle">
            Consulta y exportación de pagos registrados por periodo
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
              <!-- Fecha Desde -->
              <mat-form-field appearance="outline">
                <mat-label>Fecha desde</mat-label>
                <input
                  matInput
                  [matDatepicker]="pickerDesde"
                  formControlName="fechaDesde"
                  placeholder="Seleccione fecha inicial"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="pickerDesde"
                ></mat-datepicker-toggle>
                <mat-datepicker #pickerDesde></mat-datepicker>
                @if (filtrosForm.get('fechaDesde')?.hasError('required') &&
                     filtrosForm.get('fechaDesde')?.touched) {
                  <mat-error>La fecha desde es requerida</mat-error>
                }
              </mat-form-field>

              <!-- Fecha Hasta -->
              <mat-form-field appearance="outline">
                <mat-label>Fecha hasta</mat-label>
                <input
                  matInput
                  [matDatepicker]="pickerHasta"
                  formControlName="fechaHasta"
                  placeholder="Seleccione fecha final"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="pickerHasta"
                ></mat-datepicker-toggle>
                <mat-datepicker #pickerHasta></mat-datepicker>
                @if (filtrosForm.get('fechaHasta')?.hasError('required') &&
                     filtrosForm.get('fechaHasta')?.touched) {
                  <mat-error>La fecha hasta es requerida</mat-error>
                }
              </mat-form-field>

              <!-- Estado de Pago -->
              <mat-form-field appearance="outline">
                <mat-label>Estado de pago</mat-label>
                <mat-select formControlName="estado">
                  <mat-option [value]="null">Todos los estados</mat-option>
                  @for (estado of estadosPago(); track estado.codigo) {
                    <mat-option [value]="estado.codigo">{{ estado.nombre }}</mat-option>
                  }
                </mat-select>
                <mat-hint>Opcional</mat-hint>
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
                Limpiar Filtros
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
            <!-- Resumen -->
            <div class="summary">
              <div class="summary-item">
                <mat-icon>receipt</mat-icon>
                <div>
                  <span class="summary-label">Total de Pagos</span>
                  <span class="summary-value">{{ datosReporte().length }}</span>
                </div>
              </div>
              <div class="summary-item primary">
                <mat-icon>attach_money</mat-icon>
                <div>
                  <span class="summary-label">Total Monto Pagado</span>
                  <span class="summary-value">
                    {{ calcularTotalMontoPagado() | currency:'USD':'symbol':'1.2-2' }}
                  </span>
                </div>
              </div>
              <div class="summary-item accent">
                <mat-icon>account_balance</mat-icon>
                <div>
                  <span class="summary-label">Total Capital Aplicado</span>
                  <span class="summary-value">
                    {{ calcularTotalCapital() | currency:'USD':'symbol':'1.2-2' }}
                  </span>
                </div>
              </div>
              <div class="summary-item warn">
                <mat-icon>percent</mat-icon>
                <div>
                  <span class="summary-label">Total Interés Aplicado</span>
                  <span class="summary-value">
                    {{ calcularTotalInteres() | currency:'USD':'symbol':'1.2-2' }}
                  </span>
                </div>
              </div>
            </div>

            <mat-divider style="margin: 24px 0;"></mat-divider>

            <!-- Tabla -->
            <div class="table-responsive">
              <table mat-table [dataSource]="datosPaginados()">
                <!-- Fecha de Pago -->
                <ng-container matColumnDef="fechaPago">
                  <th mat-header-cell *matHeaderCellDef>Fecha de Pago</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.fechaPago | date:'dd/MM/yyyy' }}
                  </td>
                </ng-container>

                <!-- Número de Crédito -->
                <ng-container matColumnDef="numeroCredito">
                  <th mat-header-cell *matHeaderCellDef>No. Préstamo</th>
                  <td mat-cell *matCellDef="let item">
                    <strong>{{ item.numeroCredito }}</strong>
                  </td>
                </ng-container>

                <!-- Cliente -->
                <ng-container matColumnDef="nombreCliente">
                  <th mat-header-cell *matHeaderCellDef>Nombre del Cliente</th>
                  <td mat-cell *matCellDef="let item">{{ item.nombreCliente }}</td>
                </ng-container>

                <!-- Línea de Crédito -->
                <ng-container matColumnDef="lineaCredito">
                  <th mat-header-cell *matHeaderCellDef>Línea de Crédito</th>
                  <td mat-cell *matCellDef="let item">{{ item.lineaCredito }}</td>
                </ng-container>

                <!-- Tipo de Crédito -->
                <ng-container matColumnDef="tipoCredito">
                  <th mat-header-cell *matHeaderCellDef>Tipo de Crédito</th>
                  <td mat-cell *matCellDef="let item">{{ item.tipoCredito }}</td>
                </ng-container>

                <!-- Monto Pagado -->
                <ng-container matColumnDef="montoPagado">
                  <th mat-header-cell *matHeaderCellDef>Monto Pagado</th>
                  <td mat-cell *matCellDef="let item">
                    {{ +item.montoPagado | currency:'USD':'symbol':'1.2-2' }}
                  </td>
                </ng-container>

                <!-- Distribución del Pago -->
                <ng-container matColumnDef="distribucion">
                  <th mat-header-cell *matHeaderCellDef>Distribución del Pago</th>
                  <td mat-cell *matCellDef="let item">
                    <div class="distribucion">
                      <span class="distribucion-item">
                        <strong>Cap:</strong> {{ +item.capitalAplicado | currency:'USD':'symbol':'1.2-2' }}
                      </span>
                      <span class="distribucion-item">
                        <strong>Int:</strong> {{ +item.interesAplicado | currency:'USD':'symbol':'1.2-2' }}
                      </span>
                      @if (+item.recargosAplicado > 0) {
                        <span class="distribucion-item">
                          <strong>Rec:</strong> {{ +item.recargosAplicado | currency:'USD':'symbol':'1.2-2' }}
                        </span>
                      }
                      @if (+item.interesMoratorioAplicado > 0) {
                        <span class="distribucion-item warn">
                          <strong>Mora:</strong> {{ +item.interesMoratorioAplicado | currency:'USD':'symbol':'1.2-2' }}
                        </span>
                      }
                    </div>
                  </td>
                </ng-container>

                <!-- Saldo Anterior -->
                <ng-container matColumnDef="saldoAnterior">
                  <th mat-header-cell *matHeaderCellDef>Saldo Anterior</th>
                  <td mat-cell *matCellDef="let item">
                    {{ +item.saldoAnterior | currency:'USD':'symbol':'1.2-2' }}
                  </td>
                </ng-container>

                <!-- Nuevo Saldo -->
                <ng-container matColumnDef="saldoNuevo">
                  <th mat-header-cell *matHeaderCellDef>Nuevo Saldo</th>
                  <td mat-cell *matCellDef="let item">
                    {{ +item.saldoNuevo | currency:'USD':'symbol':'1.2-2' }}
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
              <p>No se encontraron pagos registrados en el periodo seleccionado</p>
              <button mat-raised-button color="primary" (click)="limpiarFiltros()">
                <mat-icon>refresh</mat-icon>
                Cambiar Filtros
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
      max-width: 1800px;
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
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
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
      gap: 8px;
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

    .distribucion {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
    }

    .distribucion-item {
      white-space: nowrap;
    }

    .distribucion-item.warn {
      color: #c62828;
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
        grid-template-columns: 1fr;
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
    }
  `],
})
export class ReportePagosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reporteService = inject(ReporteService);
  private catalogosService = inject(CatalogosService);
  private snackBar = inject(MatSnackBar);

  // Signals
  isLoading = signal(false);
  reporteGenerado = signal(false);
  datosReporte = signal<DatosReportePagos[]>([]);
  datosPaginados = signal<DatosReportePagos[]>([]);
  estadosPago = signal<CatalogoBase[]>([]);
  exportandoExcel = signal(false);
  exportandoPdf = signal(false);

  // Formulario
  filtrosForm!: FormGroup;

  // Paginación
  tamanioPagina = 10;
  indicePagina = 0;

  // Columnas de la tabla
  columnasVisibles = [
    'fechaPago',
    'numeroCredito',
    'nombreCliente',
    'lineaCredito',
    'tipoCredito',
    'montoPagado',
    'distribucion',
    'saldoAnterior',
    'saldoNuevo',
  ];

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarEstadosPago();
  }

  /**
   * Inicializa el formulario de filtros con valores por defecto
   */
  private inicializarFormulario(): void {
    // Fecha desde: primer día del mes actual
    const primerDiaMes = new Date();
    primerDiaMes.setDate(1);

    // Fecha hasta: último día del mes actual
    const ultimoDiaMes = new Date();
    ultimoDiaMes.setMonth(ultimoDiaMes.getMonth() + 1);
    ultimoDiaMes.setDate(0);

    this.filtrosForm = this.fb.group({
      fechaDesde: [primerDiaMes, Validators.required],
      fechaHasta: [ultimoDiaMes, Validators.required],
      estado: [null],
    });
  }

  /**
   * Carga los estados de pago del catálogo
   */
  private cargarEstadosPago(): void {
    this.catalogosService.getEstadosPago(true).subscribe({
      next: (data) => {
        this.estadosPago.set(data);
      },
      error: (err) => {
        console.error('Error al cargar estados de pago:', err);
        this.snackBar.open(
          'Error al cargar los estados de pago',
          'Cerrar',
          { duration: 3000 }
        );
      },
    });
  }

  /**
   * Genera el reporte con los filtros seleccionados
   */
  generarReporte(): void {
    if (this.filtrosForm.invalid) {
      this.filtrosForm.markAllAsTouched();
      this.snackBar.open(
        'Por favor complete todos los campos requeridos',
        'Cerrar',
        { duration: 3000 }
      );
      return;
    }

    this.isLoading.set(true);
    this.reporteGenerado.set(false);

    const valores = this.filtrosForm.value;
    const filtros: FiltrosReportePagos = {
      fechaDesde: this.formatearFecha(valores.fechaDesde),
      fechaHasta: this.formatearFecha(valores.fechaHasta),
      estado: valores.estado,
    };

    this.reporteService.getReportePagos(filtros).subscribe({
      next: (data) => {
        this.datosReporte.set(data);
        this.reporteGenerado.set(true);
        this.indicePagina = 0;
        this.actualizarDatosPaginados();
        this.isLoading.set(false);

        if (data.length > 0) {
          this.snackBar.open(
            `Reporte generado: ${data.length} pago(s) encontrado(s)`,
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
    this.reporteGenerado.set(false);
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
   * Calcula el total del monto pagado
   */
  calcularTotalMontoPagado(): number {
    return this.datosReporte().reduce(
      (sum, item) => sum + Number(item.montoPagado || 0),
      0
    );
  }

  /**
   * Calcula el total del capital aplicado
   */
  calcularTotalCapital(): number {
    return this.datosReporte().reduce(
      (sum, item) => sum + Number(item.capitalAplicado || 0),
      0
    );
  }

  /**
   * Calcula el total del interés aplicado
   */
  calcularTotalInteres(): number {
    return this.datosReporte().reduce(
      (sum, item) => sum + Number(item.interesAplicado || 0),
      0
    );
  }

  /**
   * Calcula el total de mora aplicada
   */
  calcularTotalMora(): number {
    return this.datosReporte().reduce(
      (sum, item) => sum + Number(item.interesMoratorioAplicado || 0),
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
      // Preparar datos para Excel
      const datosExcel = this.datosReporte().map((item) => ({
        'Fecha de Pago': new Date(item.fechaPago).toLocaleDateString('es-SV'),
        'No. Préstamo': item.numeroCredito,
        'Nombre del Cliente': item.nombreCliente,
        'Línea de Crédito': item.lineaCredito,
        'Tipo de Crédito': item.tipoCredito,
        'Monto Pagado': item.montoPagado,
        'Capital Aplicado': item.capitalAplicado,
        'Interés Aplicado': item.interesAplicado,
        'Recargos Aplicados': item.recargosAplicado,
        'Mora Aplicada': item.interesMoratorioAplicado,
        'Saldo Anterior': item.saldoAnterior,
        'Nuevo Saldo': item.saldoNuevo,
      }));

      // Agregar fila de totales
      datosExcel.push({
        'Fecha de Pago': '',
        'No. Préstamo': '',
        'Nombre del Cliente': '',
        'Línea de Crédito': '',
        'Tipo de Crédito': 'TOTALES',
        'Monto Pagado': this.calcularTotalMontoPagado(),
        'Capital Aplicado': this.calcularTotalCapital(),
        'Interés Aplicado': this.calcularTotalInteres(),
        'Recargos Aplicados': 0,
        'Mora Aplicada': this.calcularTotalMora(),
        'Saldo Anterior': '',
        'Nuevo Saldo': '',
      } as any);

      // Crear worksheet
      const worksheet = XLSX.utils.json_to_sheet(datosExcel);

      // Crear workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Pagos');

      // Generar nombre de archivo
      const valores = this.filtrosForm.value;
      const fechaDesde = this.formatearFecha(valores.fechaDesde);
      const fechaHasta = this.formatearFecha(valores.fechaHasta);
      const nombreArchivo = `reporte-pagos-${fechaDesde}-${fechaHasta}.xlsx`;

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
      doc.text('Reporte de Pagos', doc.internal.pageSize.width / 2, 30, {
        align: 'center',
      });

      // Periodo
      const valores = this.filtrosForm.value;
      const fechaDesde = new Date(valores.fechaDesde).toLocaleDateString('es-SV');
      const fechaHasta = new Date(valores.fechaHasta).toLocaleDateString('es-SV');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Correspondiente al periodo del ${fechaDesde} al ${fechaHasta}`,
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
        new Date(item.fechaPago).toLocaleDateString('es-SV'),
        item.numeroCredito,
        item.nombreCliente,
        item.lineaCredito,
        item.tipoCredito,
        `$${Number(item.montoPagado || 0).toFixed(2)}`,
        `$${Number(item.capitalAplicado || 0).toFixed(2)}`,
        `$${Number(item.interesAplicado || 0).toFixed(2)}`,
        Number(item.interesMoratorioAplicado || 0) > 0 ? `$${Number(item.interesMoratorioAplicado).toFixed(2)}` : '-',
        `$${Number(item.saldoAnterior || 0).toFixed(2)}`,
        `$${Number(item.saldoNuevo || 0).toFixed(2)}`,
      ]);

      // Agregar fila de totales
      tableData.push([
        '',
        '',
        '',
        '',
        'TOTALES',
        `$${this.calcularTotalMontoPagado().toFixed(2)}`,
        `$${this.calcularTotalCapital().toFixed(2)}`,
        `$${this.calcularTotalInteres().toFixed(2)}`,
        `$${this.calcularTotalMora().toFixed(2)}`,
        '',
        '',
      ]);

      // Generar tabla
      autoTable(doc, {
        startY: 50,
        head: [
          [
            'Fecha',
            'No. Préstamo',
            'Cliente',
            'Línea',
            'Tipo',
            'Monto',
            'Capital',
            'Interés',
            'Mora',
            'Saldo Ant.',
            'Saldo Nuevo',
          ],
        ],
        body: tableData,
        styles: { fontSize: 7 },
        headStyles: { fillColor: [25, 118, 210], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        footStyles: { fillColor: [25, 118, 210], textColor: 255, fontStyle: 'bold' },
        didParseCell: (data) => {
          // Resaltar fila de totales
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [255, 243, 224];
          }
        },
      });

      // Generar nombre de archivo
      const nombreArchivo = `reporte-pagos-${this.formatearFecha(valores.fechaDesde)}-${this.formatearFecha(valores.fechaHasta)}.pdf`;

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
