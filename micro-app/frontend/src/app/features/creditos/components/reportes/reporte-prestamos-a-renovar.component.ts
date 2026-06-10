import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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

import { environment } from '@env/environment';

/** DTO que devuelve el backend */
export interface PrestamoARenovar {
  fechaPago: string;        // 'YYYY-MM-DD'
  numeroCredito: string;
  nombreCliente: string;
  saldoPendiente: number;
  cuota: number;
  fechaVencimiento: string; // 'YYYY-MM-DD'
}

@Component({
  selector: 'app-reporte-prestamos-a-renovar',
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
  ],
  template: `
    <div class="container">
      <!-- Encabezado -->
      <div class="header">
        <div>
          <h1>
            <mat-icon>autorenew</mat-icon>
            Préstamos a Renovar
          </h1>
          <p class="subtitle">
            Préstamos con 1 o menos cuotas pendientes en el período seleccionado
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
                  formControlName="fechaIni"
                  placeholder="Seleccione fecha inicial"
                />
                <mat-datepicker-toggle matSuffix [for]="pickerDesde"></mat-datepicker-toggle>
                <mat-datepicker #pickerDesde></mat-datepicker>
                @if (filtrosForm.get('fechaIni')?.hasError('required') &&
                     filtrosForm.get('fechaIni')?.touched) {
                  <mat-error>La fecha desde es requerida</mat-error>
                }
              </mat-form-field>

              <!-- Fecha Hasta -->
              <mat-form-field appearance="outline">
                <mat-label>Fecha hasta</mat-label>
                <input
                  matInput
                  [matDatepicker]="pickerHasta"
                  formControlName="fechaFin"
                  placeholder="Seleccione fecha final"
                />
                <mat-datepicker-toggle matSuffix [for]="pickerHasta"></mat-datepicker-toggle>
                <mat-datepicker #pickerHasta></mat-datepicker>
                @if (filtrosForm.get('fechaFin')?.hasError('required') &&
                     filtrosForm.get('fechaFin')?.touched) {
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
            <!-- Tarjetas de Resumen -->
            <div class="summary">
              <div class="summary-item primary">
                <mat-icon>account_balance_wallet</mat-icon>
                <div>
                  <span class="summary-label">Total Préstamos a Renovar</span>
                  <span class="summary-value">{{ datosReporte().length }}</span>
                </div>
              </div>
              <div class="summary-item accent">
                <mat-icon>attach_money</mat-icon>
                <div>
                  <span class="summary-label">Total Saldo Pendiente (K+I)</span>
                  <span class="summary-value">
                    {{ calcularTotalSaldo() | currency:'USD':'symbol':'1.2-2' }}
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
                    {{ formatearFechaStr(item.fechaPago) }}
                  </td>
                </ng-container>

                <!-- No. Préstamo -->
                <ng-container matColumnDef="numeroCredito">
                  <th mat-header-cell *matHeaderCellDef>No. Préstamo</th>
                  <td mat-cell *matCellDef="let item">
                    <strong>{{ item.numeroCredito }}</strong>
                  </td>
                </ng-container>

                <!-- Nombre Cliente -->
                <ng-container matColumnDef="nombreCliente">
                  <th mat-header-cell *matHeaderCellDef>Nombre Cliente</th>
                  <td mat-cell *matCellDef="let item">{{ item.nombreCliente }}</td>
                </ng-container>

                <!-- Saldo Pendiente (K+I) -->
                <ng-container matColumnDef="saldoPendiente">
                  <th mat-header-cell *matHeaderCellDef>Saldo Pendiente (K+I)</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.saldoPendiente | currency:'USD':'symbol':'1.2-2' }}
                  </td>
                </ng-container>

                <!-- Cuota -->
                <ng-container matColumnDef="cuota">
                  <th mat-header-cell *matHeaderCellDef>Cuota</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.cuota | currency:'USD':'symbol':'1.2-2' }}
                  </td>
                </ng-container>

                <!-- Fecha Vencimiento -->
                <ng-container matColumnDef="fechaVencimiento">
                  <th mat-header-cell *matHeaderCellDef>Fecha Vencimiento</th>
                  <td mat-cell *matCellDef="let item">
                    {{ formatearFechaStr(item.fechaVencimiento) }}
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
              <mat-icon>autorenew</mat-icon>
              <p>No se encontraron préstamos a renovar en el período seleccionado</p>
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
      max-width: 1400px;
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
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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

    /* Responsive 960px */
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

    /* Responsive 600px */
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
export class ReportePrestamosARenovarComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  // Signals
  isLoading = signal(false);
  reporteGenerado = signal(false);
  datosReporte = signal<PrestamoARenovar[]>([]);
  datosPaginados = signal<PrestamoARenovar[]>([]);
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
    'saldoPendiente',
    'cuota',
    'fechaVencimiento',
  ];

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  /**
   * Inicializa el formulario con el mes actual completo por defecto
   */
  private inicializarFormulario(): void {
    // Primer día del mes actual
    const primerDiaMes = new Date();
    primerDiaMes.setDate(1);

    // Último día del mes actual
    const ultimoDiaMes = new Date();
    ultimoDiaMes.setMonth(ultimoDiaMes.getMonth() + 1);
    ultimoDiaMes.setDate(0);

    this.filtrosForm = this.fb.group({
      fechaIni: [primerDiaMes, Validators.required],
      fechaFin: [ultimoDiaMes, Validators.required],
    });
  }

  /**
   * Genera el reporte consultando el endpoint del backend
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
    const fechaIni = this.formatearFecha(valores.fechaIni);
    const fechaFin = this.formatearFecha(valores.fechaFin);
    const url = `${environment.apiUrl}/prestamos/reportes/prestamos-a-renovar?fechaIni=${fechaIni}&fechaFin=${fechaFin}`;

    this.http.get<PrestamoARenovar[]>(url).subscribe({
      next: (data) => {
        this.datosReporte.set(data);
        this.reporteGenerado.set(true);
        this.indicePagina = 0;
        this.actualizarDatosPaginados();
        this.isLoading.set(false);

        if (data.length > 0) {
          this.snackBar.open(
            `Reporte generado: ${data.length} préstamo(s) a renovar`,
            'Cerrar',
            { duration: 3000 }
          );
        }
      },
      error: (err) => {
        console.error('Error al generar reporte de préstamos a renovar:', err);
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
   * Actualiza la porción de datos visibles según la página actual
   */
  private actualizarDatosPaginados(): void {
    const inicio = this.indicePagina * this.tamanioPagina;
    const fin = inicio + this.tamanioPagina;
    this.datosPaginados.set(this.datosReporte().slice(inicio, fin));
  }

  /**
   * Suma total del saldo pendiente (capital + interés) de todos los registros
   */
  calcularTotalSaldo(): number {
    return this.datosReporte().reduce((sum, item) => sum + item.saldoPendiente, 0);
  }

  /**
   * Exporta los datos a un archivo Excel (.xlsx)
   * Incluye fila de totales al final
   * Nombre: prestamos-a-renovar-YYYY-MM-DD-YYYY-MM-DD.xlsx
   */
  exportarExcel(): void {
    if (this.datosReporte().length === 0) {
      this.snackBar.open('No hay datos para exportar', 'Cerrar', { duration: 3000 });
      return;
    }

    this.exportandoExcel.set(true);

    try {
      const datosExcel = this.datosReporte().map((item) => ({
        'Fecha de Pago': this.formatearFechaStr(item.fechaPago),
        'No. Préstamo': item.numeroCredito,
        'Nombre Cliente': item.nombreCliente,
        'Saldo Pendiente (K+I)': item.saldoPendiente,
        'Cuota': item.cuota,
        'Fecha Vencimiento': this.formatearFechaStr(item.fechaVencimiento),
      }));

      // Fila de totales
      datosExcel.push({
        'Fecha de Pago': '',
        'No. Préstamo': '',
        'Nombre Cliente': 'TOTALES',
        'Saldo Pendiente (K+I)': this.calcularTotalSaldo(),
        'Cuota': '',
        'Fecha Vencimiento': '',
      } as any);

      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Préstamos a Renovar');

      const valores = this.filtrosForm.value;
      const fechaIni = this.formatearFecha(valores.fechaIni);
      const fechaFin = this.formatearFecha(valores.fechaFin);
      const nombreArchivo = `prestamos-a-renovar-${fechaIni}-${fechaFin}.xlsx`;

      XLSX.writeFile(workbook, nombreArchivo);

      this.snackBar.open('Reporte exportado correctamente', 'Cerrar', { duration: 3000 });
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      this.snackBar.open('Error al exportar a Excel', 'Cerrar', { duration: 3000 });
    } finally {
      this.exportandoExcel.set(false);
    }
  }

  /**
   * Exporta los datos a un PDF en orientación landscape
   * Encabezado azul, filas alternadas, pie de página con totales
   */
  exportarPDF(): void {
    if (this.datosReporte().length === 0) {
      this.snackBar.open('No hay datos para exportar', 'Cerrar', { duration: 3000 });
      return;
    }

    this.exportandoPdf.set(true);

    try {
      const doc = new jsPDF('landscape');
      const pageWidth = doc.internal.pageSize.width;

      // Título
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('FINANZIA', pageWidth / 2, 18, { align: 'center' });

      doc.setFontSize(14);
      doc.text('PRÉSTAMOS A RENOVAR', pageWidth / 2, 27, { align: 'center' });

      // Subtítulo con el período
      const valores = this.filtrosForm.value;
      const fechaIniStr = this.formatearFechaLocalStr(valores.fechaIni);
      const fechaFinStr = this.formatearFechaLocalStr(valores.fechaFin);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Período: ${fechaIniStr} al ${fechaFinStr}`,
        pageWidth / 2,
        35,
        { align: 'center' }
      );

      doc.text(
        `Fecha de generación: ${new Date().toLocaleDateString('es-SV')}`,
        pageWidth / 2,
        41,
        { align: 'center' }
      );

      // Datos de la tabla
      const tableData = this.datosReporte().map((item) => [
        this.formatearFechaStr(item.fechaPago),
        item.numeroCredito,
        item.nombreCliente,
        `$${item.saldoPendiente.toFixed(2)}`,
        `$${item.cuota.toFixed(2)}`,
        this.formatearFechaStr(item.fechaVencimiento),
      ]);

      // Fila de totales al final
      tableData.push([
        '',
        '',
        'TOTALES',
        `$${this.calcularTotalSaldo().toFixed(2)}`,
        '',
        '',
      ]);

      autoTable(doc, {
        startY: 47,
        head: [
          [
            'Fecha de Pago',
            'No. Préstamo',
            'Nombre Cliente',
            'Saldo Pendiente (K+I)',
            'Cuota',
            'Fecha Vencimiento',
          ],
        ],
        body: tableData,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [25, 118, 210], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        didParseCell: (data) => {
          // Resaltar la fila de totales
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [255, 243, 224];
          }
        },
      });

      const fechaIni = this.formatearFecha(valores.fechaIni);
      const fechaFin = this.formatearFecha(valores.fechaFin);
      const nombreArchivo = `prestamos-a-renovar-${fechaIni}-${fechaFin}.pdf`;

      doc.save(nombreArchivo);

      this.snackBar.open('PDF generado correctamente', 'Cerrar', { duration: 3000 });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.snackBar.open('Error al generar el PDF', 'Cerrar', { duration: 3000 });
    } finally {
      this.exportandoPdf.set(false);
    }
  }

  /**
   * Formatea una fecha Date al formato YYYY-MM-DD para la API
   */
  private formatearFecha(fecha: Date): string {
    if (!fecha) return '';
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Convierte string 'YYYY-MM-DD' a 'DD/MM/YYYY' sin usar new Date()
   * para evitar desfase por timezone
   */
  formatearFechaStr(fecha: string): string {
    if (!fecha) return '';
    const parts = fecha.substring(0, 10).split('-');
    if (parts.length !== 3) return fecha;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  /**
   * Formatea un objeto Date al string DD/MM/YYYY para mostrar en el PDF
   */
  private formatearFechaLocalStr(fecha: Date): string {
    if (!fecha) return '';
    return fecha.toLocaleDateString('es-SV');
  }
}
