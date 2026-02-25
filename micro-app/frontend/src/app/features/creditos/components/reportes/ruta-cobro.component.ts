import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
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
  DatosRutaCobro,
  FiltrosRutaCobro,
} from '../../services/reporte.service';

@Component({
  selector: 'app-ruta-cobro',
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
    DecimalPipe,
  ],
  template: `
    <div class="container">
      <!-- Encabezado -->
      <div class="header">
        <div>
          <h1>
            <mat-icon>route</mat-icon>
            Ruta de Cobro
          </h1>
          <p class="subtitle">
            Consulta de cuotas pendientes por periodo de vencimiento
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
                    color="primary"
                    (click)="imprimirTermica()"
                    matTooltip="Imprimir en impresora térmica"
                  >
                    <mat-icon>print</mat-icon>
                    Imprimir
                  </button>
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
                  <span class="summary-label">Total de Cuotas</span>
                  <span class="summary-value">{{ datosReporte().length }}</span>
                </div>
              </div>
              <div class="summary-item primary">
                <mat-icon>attach_money</mat-icon>
                <div>
                  <span class="summary-label">Total Monto a Cobrar</span>
                  <span class="summary-value">
                    {{ calcularTotalMonto() | currency:'USD':'symbol':'1.2-2' }}
                  </span>
                </div>
              </div>
            </div>

            <mat-divider style="margin: 24px 0;"></mat-divider>

            <!-- Tabla -->
            <div class="table-responsive">
              <table mat-table [dataSource]="datosPaginados()">
                <!-- Fecha de Pago -->
                <ng-container matColumnDef="fechaVencimiento">
                  <th mat-header-cell *matHeaderCellDef>Fecha de Pago</th>
                  <td mat-cell *matCellDef="let item">
                    {{ formatearFechaStr(item.fechaVencimiento) }}
                  </td>
                </ng-container>

                <!-- Nombre del Cliente -->
                <ng-container matColumnDef="nombreCliente">
                  <th mat-header-cell *matHeaderCellDef>Nombre del Cliente</th>
                  <td mat-cell *matCellDef="let item">{{ item.nombreCliente }}</td>
                </ng-container>

                <!-- Número de Crédito -->
                <ng-container matColumnDef="numeroCredito">
                  <th mat-header-cell *matHeaderCellDef>No. Préstamo</th>
                  <td mat-cell *matCellDef="let item">
                    <strong>{{ item.numeroCredito }}</strong>
                  </td>
                </ng-container>

                <!-- Cuota Total -->
                <ng-container matColumnDef="cuotaTotal">
                  <th mat-header-cell *matHeaderCellDef>Cuota</th>
                  <td mat-cell *matCellDef="let item">
                    {{ +item.cuotaTotal | currency:'USD':'symbol':'1.2-2' }}
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
              <p>No se encontraron cuotas pendientes en el periodo seleccionado</p>
              <button mat-raised-button color="primary" (click)="limpiarFiltros()">
                <mat-icon>refresh</mat-icon>
                Cambiar Filtros
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }

      <!-- Vista térmica para impresión -->
      @if (datosReporte().length > 0) {
        <div class="recibo-termica print-only">
          <div class="recibo-header">
            <div class="empresa-nombre">FINANZIA</div>
            <div class="empresa-direccion">Sistema de Microcréditos</div>
          </div>
          <div class="separador-doble">================================</div>
          <div class="recibo-titulo">RUTA DE COBRO</div>
          <div class="recibo-fecha">Del {{ formatearFechaStr(formatearFecha(filtrosForm.value.fechaDesde)) }} al {{ formatearFechaStr(formatearFecha(filtrosForm.value.fechaHasta)) }}</div>
          <div class="separador">--------------------------------</div>

          @for (item of datosReporte(); track item.numeroCredito + item.numeroCuota) {
            <div class="cobro-item">
              <div class="datos-linea">
                <span class="label">Fecha:</span>
                <span class="valor">{{ formatearFechaStr(item.fechaVencimiento) }}</span>
              </div>
              <div class="datos-linea">
                <span class="label">Cliente:</span>
                <span class="valor">{{ item.nombreCliente }}</span>
              </div>
              <div class="datos-linea">
                <span class="label">Crédito:</span>
                <span class="valor">{{ item.numeroCredito }}</span>
              </div>
              <div class="datos-linea">
                <span class="label">Cuota #:</span>
                <span class="valor">{{ item.numeroCuota }}</span>
              </div>
              <div class="datos-linea">
                <span class="label">Monto:</span>
                <span class="valor valor-destacado">$ {{ (+item.cuotaTotal).toFixed(2) }}</span>
              </div>
              <div class="separador cobro-separador">- - - - - - - - - - - - - - - -</div>
            </div>
          }

          <div class="separador-doble">================================</div>
          <div class="datos-linea total-linea">
            <span class="label">TOTAL CUOTAS:</span>
            <span class="valor valor-destacado">{{ datosReporte().length }}</span>
          </div>
          <div class="datos-linea total-linea">
            <span class="label">TOTAL MONTO:</span>
            <span class="valor valor-destacado">$ {{ calcularTotalMonto().toFixed(2) }}</span>
          </div>
          <div class="separador-doble">================================</div>

          <div class="info-pie">
            <div>Generado: {{ obtenerFechaHoraActual() }}</div>
          </div>
        </div>
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

    /* Vista térmica - oculta en pantalla, visible al imprimir */
    .print-only {
      display: none;
    }

    .recibo-termica {
      width: 80mm;
      margin: 0 auto;
      padding: 5mm;
      font-family: 'Consolas', 'Liberation Mono', 'Menlo', 'DejaVu Sans Mono', monospace;
      font-size: 10pt;
      line-height: 1.3;
      color: #000;
      letter-spacing: 0.02em;
    }

    .recibo-header {
      text-align: center;
      margin-bottom: 3mm;
    }

    .empresa-nombre {
      font-weight: bold;
      font-size: 11pt;
      margin-bottom: 1mm;
    }

    .empresa-direccion {
      font-size: 8pt;
      margin: 0;
    }

    .separador-doble,
    .separador {
      text-align: center;
      letter-spacing: -0.5px;
      margin: 2mm 0;
    }

    .recibo-titulo {
      text-align: center;
      font-weight: bold;
      font-size: 11pt;
      margin: 3mm 0 2mm 0;
    }

    .recibo-fecha {
      text-align: center;
      margin: 1mm 0;
      font-size: 9pt;
    }

    .datos-linea {
      display: flex;
      justify-content: space-between;
      margin: 1mm 0;

      .label {
        flex: 0 0 auto;
      }

      .valor {
        flex: 1 1 auto;
        text-align: right;
        word-wrap: break-word;
      }
    }

    .valor-destacado {
      font-weight: bold;
    }

    .total-linea {
      font-weight: bold;
      font-size: 11pt;
    }

    .cobro-item {
      margin: 1mm 0;
    }

    .cobro-separador {
      margin: 1mm 0;
      font-size: 8pt;
    }

    .info-pie {
      margin-top: 4mm;
      font-size: 8pt;
      text-align: center;
    }

    @media print {
      /* Ocultar todo excepto la vista térmica */
      .header,
      .filters-card,
      .loading,
      .results-card,
      .empty-card {
        display: none !important;
      }

      .print-only {
        display: block !important;
      }

      @page {
        size: 80mm auto;
        margin: 0;
      }

      body {
        margin: 0;
        padding: 0;
      }

      :host {
        display: block;
        width: 80mm;
      }

      .recibo-termica {
        width: 80mm;
        margin: 0;
        padding: 3mm;
        border: none;
        box-shadow: none;
        font-size: 9pt;
        line-height: 1.2;
      }

      .empresa-nombre {
        font-size: 10pt;
      }

      .recibo-titulo {
        font-size: 10pt;
      }

      .total-linea {
        font-size: 10pt;
      }

      .info-pie {
        font-size: 7pt;
      }

      .empresa-direccion {
        font-size: 7pt;
      }

      * {
        color: #000 !important;
        background: white !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .recibo-termica {
        page-break-inside: avoid;
      }

      .cobro-item {
        page-break-inside: avoid;
      }

      .separador,
      .separador-doble {
        margin: 1mm 0;
      }
    }
  `],
})
export class RutaCobroComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reporteService = inject(ReporteService);
  private snackBar = inject(MatSnackBar);

  // Signals
  isLoading = signal(false);
  reporteGenerado = signal(false);
  datosReporte = signal<DatosRutaCobro[]>([]);
  datosPaginados = signal<DatosRutaCobro[]>([]);
  exportandoExcel = signal(false);
  exportandoPdf = signal(false);

  // Formulario
  filtrosForm!: FormGroup;

  // Paginación
  tamanioPagina = 10;
  indicePagina = 0;

  // Columnas de la tabla
  columnasVisibles = [
    'fechaVencimiento',
    'nombreCliente',
    'numeroCredito',
    'cuotaTotal',
  ];

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  /**
   * Inicializa el formulario de filtros con valores por defecto:
   * desde el primer día del mes actual hasta el último día del mes actual.
   */
  private inicializarFormulario(): void {
    const primerDiaMes = new Date();
    primerDiaMes.setDate(1);

    const ultimoDiaMes = new Date();
    ultimoDiaMes.setMonth(ultimoDiaMes.getMonth() + 1);
    ultimoDiaMes.setDate(0);

    this.filtrosForm = this.fb.group({
      fechaDesde: [primerDiaMes, Validators.required],
      fechaHasta: [ultimoDiaMes, Validators.required],
    });
  }

  /**
   * Genera el reporte consultando el endpoint de ruta de cobro
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
    const filtros: FiltrosRutaCobro = {
      fechaDesde: this.formatearFecha(valores.fechaDesde),
      fechaHasta: this.formatearFecha(valores.fechaHasta),
    };

    this.reporteService.getRutaCobro(filtros).subscribe({
      next: (respuesta) => {
        this.datosReporte.set(respuesta.cuotas);
        this.reporteGenerado.set(true);
        this.indicePagina = 0;
        this.actualizarDatosPaginados();
        this.isLoading.set(false);

        if (respuesta.cuotas.length > 0) {
          this.snackBar.open(
            `Reporte generado: ${respuesta.cuotas.length} cuota(s) encontrada(s)`,
            'Cerrar',
            { duration: 3000 }
          );
        }
      },
      error: (err) => {
        console.error('Error al generar reporte de ruta de cobro:', err);
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
   * Limpia los filtros y reinicia el formulario al rango del mes actual
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
   * Actualiza el slice de datos visible según la página actual
   */
  private actualizarDatosPaginados(): void {
    const inicio = this.indicePagina * this.tamanioPagina;
    const fin = inicio + this.tamanioPagina;
    this.datosPaginados.set(this.datosReporte().slice(inicio, fin));
  }

  /**
   * Calcula la suma de cuotaTotal de todos los registros del reporte
   */
  calcularTotalMonto(): number {
    return this.datosReporte().reduce(
      (sum, item) => sum + Number(item.cuotaTotal || 0),
      0
    );
  }

  /**
   * Exporta los datos actuales del reporte a un archivo Excel (.xlsx)
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
      const datosExcel = this.datosReporte().map((item) => ({
        'Fecha de Pago': this.formatearFechaStr(item.fechaVencimiento),
        'Nombre del Cliente': item.nombreCliente,
        'No. Préstamo': item.numeroCredito,
        'No. Cuota': item.numeroCuota,
        'Cuota': item.cuotaTotal,
        'Estado': item.estado,
      }));

      // Fila de totales al final
      datosExcel.push({
        'Fecha de Pago': '',
        'Nombre del Cliente': '',
        'No. Préstamo': 'TOTALES',
        'No. Cuota': this.datosReporte().length,
        'Cuota': this.calcularTotalMonto(),
        'Estado': '',
      } as any);

      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ruta de Cobro');

      const valores = this.filtrosForm.value;
      const fechaDesde = this.formatearFecha(valores.fechaDesde);
      const fechaHasta = this.formatearFecha(valores.fechaHasta);
      const nombreArchivo = `ruta-cobro-${fechaDesde}-${fechaHasta}.xlsx`;

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
   * Exporta los datos del reporte a un archivo PDF en orientación landscape
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

      // Encabezado del documento
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('FINANZIA', doc.internal.pageSize.width / 2, 20, {
        align: 'center',
      });

      doc.setFontSize(14);
      doc.text('Ruta de Cobro', doc.internal.pageSize.width / 2, 30, {
        align: 'center',
      });

      const valores = this.filtrosForm.value;
      const fechaDesdeStr = this.formatearFechaStr(
        this.formatearFecha(valores.fechaDesde)
      );
      const fechaHastaStr = this.formatearFechaStr(
        this.formatearFecha(valores.fechaHasta)
      );

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Cuotas con vencimiento del ${fechaDesdeStr} al ${fechaHastaStr}`,
        doc.internal.pageSize.width / 2,
        38,
        { align: 'center' }
      );

      doc.text(
        `Fecha de generación: ${this.formatearFechaStr(this.formatearFecha(new Date()))}`,
        doc.internal.pageSize.width / 2,
        44,
        { align: 'center' }
      );

      // Filas de datos para la tabla
      const tableData = this.datosReporte().map((item) => [
        this.formatearFechaStr(item.fechaVencimiento),
        item.nombreCliente,
        item.numeroCredito,
        item.numeroCuota,
        `$${Number(item.cuotaTotal || 0).toFixed(2)}`,
        item.estado,
      ]);

      // Fila de totales
      tableData.push([
        '',
        '',
        'TOTALES',
        this.datosReporte().length,
        `$${this.calcularTotalMonto().toFixed(2)}`,
        '',
      ]);

      autoTable(doc, {
        startY: 50,
        head: [
          [
            'Fecha de Pago',
            'Nombre del Cliente',
            'No. Préstamo',
            'No. Cuota',
            'Cuota',
            'Estado',
          ],
        ],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [25, 118, 210], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        didParseCell: (data) => {
          // Resaltar fila de totales con fondo diferenciado
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [255, 243, 224];
          }
        },
      });

      const nombreArchivo = `ruta-cobro-${this.formatearFecha(valores.fechaDesde)}-${this.formatearFecha(valores.fechaHasta)}.pdf`;
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
   * Convierte un objeto Date al formato YYYY-MM-DD requerido por el backend.
   * Usa los métodos del objeto Date directamente para evitar desfases de timezone.
   */
  formatearFecha(fecha: Date): string {
    if (!fecha) return '';
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Convierte un string YYYY-MM-DD al formato DD/MM/YYYY para mostrar en pantalla.
   * Opera sobre el string directamente para evitar desfases por timezone al usar new Date().
   */
  formatearFechaStr(fecha: string): string {
    if (!fecha) return '';
    const parts = fecha.substring(0, 10).split('-');
    if (parts.length !== 3) return fecha;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  /**
   * Imprime el reporte en formato térmico 80mm
   */
  imprimirTermica(): void {
    if (this.datosReporte().length === 0) {
      this.snackBar.open('No hay datos para imprimir', 'Cerrar', {
        duration: 3000,
      });
      return;
    }
    window.print();
  }

  /**
   * Retorna la fecha y hora actual formateada para el pie del recibo
   */
  obtenerFechaHoraActual(): string {
    const now = new Date();
    const fecha = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const hora = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return `${fecha} ${hora}`;
  }
}
