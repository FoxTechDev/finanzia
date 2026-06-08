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

import { CuentaAhorroService } from '../../services/cuenta-ahorro.service';
import { VencimientoDpf } from '@core/models/ahorro.model';

// Importación dinámica de jsPDF para exportación PDF
type JsPDF = import('jspdf').jsPDF;

@Component({
  selector: 'app-reporte-vencimiento-dpf',
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
            <mat-icon>event_busy</mat-icon>
            Reporte de Vencimiento DPF
          </h1>
          <p class="subtitle">
            Consulta de Depósitos a Plazo Fijo próximos a vencer o vencidos en el periodo seleccionado
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
              <!-- Fecha de vencimiento desde -->
              <mat-form-field appearance="outline">
                <mat-label>Fecha de vencimiento desde</mat-label>
                <input
                  matInput
                  [matDatepicker]="pickerInicio"
                  formControlName="fechaInicio"
                  placeholder="Seleccione fecha inicial"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="pickerInicio"
                ></mat-datepicker-toggle>
                <mat-datepicker #pickerInicio></mat-datepicker>
                @if (filtrosForm.get('fechaInicio')?.hasError('required') &&
                     filtrosForm.get('fechaInicio')?.touched) {
                  <mat-error>La fecha de inicio es requerida</mat-error>
                }
              </mat-form-field>

              <!-- Fecha de vencimiento hasta -->
              <mat-form-field appearance="outline">
                <mat-label>Fecha de vencimiento hasta</mat-label>
                <input
                  matInput
                  [matDatepicker]="pickerFin"
                  formControlName="fechaFin"
                  placeholder="Seleccione fecha final"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="pickerFin"
                ></mat-datepicker-toggle>
                <mat-datepicker #pickerFin></mat-datepicker>
                @if (filtrosForm.get('fechaFin')?.hasError('required') &&
                     filtrosForm.get('fechaFin')?.touched) {
                  <mat-error>La fecha de fin es requerida</mat-error>
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
                    style="background-color: #c62828; color: white;"
                    (click)="exportarPdf()"
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
              <div class="summary-item">
                <mat-icon>savings</mat-icon>
                <div>
                  <span class="summary-label">Total DPFs</span>
                  <span class="summary-value">{{ datosReporte().length }}</span>
                </div>
              </div>
              <div class="summary-item primary">
                <mat-icon>attach_money</mat-icon>
                <div>
                  <span class="summary-label">Total Saldo</span>
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
                <!-- Fecha Vencimiento -->
                <ng-container matColumnDef="fechaVencimiento">
                  <th mat-header-cell *matHeaderCellDef>Fecha Vencimiento</th>
                  <td mat-cell *matCellDef="let item">
                    <strong>{{ formatearFechaStr(item.fechaVencimiento) }}</strong>
                  </td>
                </ng-container>

                <!-- Nombre Cliente -->
                <ng-container matColumnDef="nombreCompleto">
                  <th mat-header-cell *matHeaderCellDef>Nombre Cliente</th>
                  <td mat-cell *matCellDef="let item">{{ item.nombreCompleto }}</td>
                </ng-container>

                <!-- No. de Cuenta -->
                <ng-container matColumnDef="noCuenta">
                  <th mat-header-cell *matHeaderCellDef>No. de Cuenta</th>
                  <td mat-cell *matCellDef="let item">
                    <strong>{{ item.noCuenta }}</strong>
                  </td>
                </ng-container>

                <!-- Saldo DPF -->
                <ng-container matColumnDef="saldo">
                  <th mat-header-cell *matHeaderCellDef>Saldo DPF</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.saldo | currency:'USD':'symbol':'1.2-2' }}
                  </td>
                </ng-container>

                <!-- Tasa Interés -->
                <ng-container matColumnDef="tasaInteres">
                  <th mat-header-cell *matHeaderCellDef>Tasa Interés</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.tasaInteres | number:'1.2-2' }}%
                  </td>
                </ng-container>

                <!-- Plazo -->
                <ng-container matColumnDef="plazo">
                  <th mat-header-cell *matHeaderCellDef>Plazo</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.plazo }} días
                  </td>
                </ng-container>

                <!-- Estado -->
                <ng-container matColumnDef="estado">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let item">
                    <span class="badge-estado" [class]="'estado-' + (item.estado | lowercase)">
                      {{ item.estado }}
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
              <p>No se encontraron DPFs con vencimiento en el periodo seleccionado</p>
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

    .badge-estado {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .estado-activa { background: #e8f5e9; color: #2e7d32; }
    .estado-cancelada { background: #ffebee; color: #c62828; }
    .estado-vencida { background: #fff3e0; color: #e65100; }
    .estado-renovada { background: #e3f2fd; color: #1565c0; }
  `],
})
export class ReporteVencimientoDpfComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cuentaAhorroService = inject(CuentaAhorroService);
  private snackBar = inject(MatSnackBar);

  // Signals
  isLoading = signal(false);
  reporteGenerado = signal(false);
  datosReporte = signal<VencimientoDpf[]>([]);
  datosPaginados = signal<VencimientoDpf[]>([]);
  exportandoExcel = signal(false);
  exportandoPdf = signal(false);

  // Formulario
  filtrosForm!: FormGroup;

  // Paginacion
  tamanioPagina = 10;
  indicePagina = 0;

  // Columnas de la tabla
  columnasVisibles = [
    'fechaVencimiento',
    'nombreCompleto',
    'noCuenta',
    'saldo',
    'tasaInteres',
    'plazo',
    'estado',
  ];

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  private inicializarFormulario(): void {
    const primerDiaMes = new Date();
    primerDiaMes.setDate(1);

    const ultimoDiaMes = new Date();
    ultimoDiaMes.setMonth(ultimoDiaMes.getMonth() + 1);
    ultimoDiaMes.setDate(0);

    this.filtrosForm = this.fb.group({
      fechaInicio: [primerDiaMes, Validators.required],
      fechaFin: [ultimoDiaMes, Validators.required],
    });
  }

  generarReporte(): void {
    if (this.filtrosForm.invalid) {
      this.filtrosForm.markAllAsTouched();
      this.snackBar.open(
        'Por favor complete todos los campos requeridos',
        'Cerrar',
        { duration: 3000 },
      );
      return;
    }

    this.isLoading.set(true);
    this.reporteGenerado.set(false);

    const valores = this.filtrosForm.value;
    const fechaInicio = this.formatearFecha(valores.fechaInicio);
    const fechaFin = this.formatearFecha(valores.fechaFin);

    this.cuentaAhorroService.getVencimientoDpf(fechaInicio, fechaFin).subscribe({
      next: (data) => {
        this.datosReporte.set(data);
        this.reporteGenerado.set(true);
        this.indicePagina = 0;
        this.actualizarDatosPaginados();
        this.isLoading.set(false);

        if (data.length > 0) {
          this.snackBar.open(
            `Reporte generado: ${data.length} DPF(s) encontrado(s)`,
            'Cerrar',
            { duration: 3000 },
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
          { duration: 4000 },
        );
      },
    });
  }

  limpiarFiltros(): void {
    this.inicializarFormulario();
    this.datosReporte.set([]);
    this.reporteGenerado.set(false);
  }

  onPageChange(event: PageEvent): void {
    this.tamanioPagina = event.pageSize;
    this.indicePagina = event.pageIndex;
    this.actualizarDatosPaginados();
  }

  private actualizarDatosPaginados(): void {
    const inicio = this.indicePagina * this.tamanioPagina;
    const fin = inicio + this.tamanioPagina;
    this.datosPaginados.set(this.datosReporte().slice(inicio, fin));
  }

  calcularTotalSaldo(): number {
    return this.datosReporte().reduce(
      (sum, item) => sum + (item.saldo || 0),
      0,
    );
  }

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
        'Fecha Vencimiento': this.formatearFechaStr(item.fechaVencimiento),
        'Nombre Cliente': item.nombreCompleto,
        'No. de Cuenta': item.noCuenta,
        'Saldo DPF': item.saldo,
        'Tasa Interés (%)': item.tasaInteres,
        'Plazo (días)': item.plazo,
        'Estado': item.estado,
      }));

      // Fila de totales al final
      datosExcel.push({
        'Fecha Vencimiento': '',
        'Nombre Cliente': '',
        'No. de Cuenta': 'TOTALES',
        'Saldo DPF': this.calcularTotalSaldo(),
        'Tasa Interés (%)': '' as any,
        'Plazo (días)': '' as any,
        'Estado': '',
      });

      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Vencimiento DPF');

      const valores = this.filtrosForm.value;
      const fechaInicio = this.formatearFecha(valores.fechaInicio);
      const fechaFin = this.formatearFecha(valores.fechaFin);
      const nombreArchivo = `reporte-vencimiento-dpf-${fechaInicio}-${fechaFin}.xlsx`;

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

  async exportarPdf(): Promise<void> {
    if (this.datosReporte().length === 0) {
      this.snackBar.open('No hay datos para exportar', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.exportandoPdf.set(true);

    try {
      // Importacion dinamica para no aumentar el bundle inicial
      const { default: jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc: JsPDF = new jsPDF({ orientation: 'landscape' });

      const valores = this.filtrosForm.value;
      const fechaInicio = this.formatearFecha(valores.fechaInicio);
      const fechaFin = this.formatearFecha(valores.fechaFin);

      // Titulo principal
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE VENCIMIENTO DPF', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

      // Subtitulo con rango de fechas
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Periodo: ${this.formatearFechaStr(fechaInicio)} al ${this.formatearFechaStr(fechaFin)}`,
        doc.internal.pageSize.getWidth() / 2,
        30,
        { align: 'center' },
      );

      // Datos de totales en el subtitulo
      doc.setFontSize(10);
      doc.text(
        `Total DPFs: ${this.datosReporte().length}   |   Total Saldo: $${this.calcularTotalSaldo().toFixed(2)}`,
        doc.internal.pageSize.getWidth() / 2,
        38,
        { align: 'center' },
      );

      // Tabla de datos
      const filas = this.datosReporte().map((item) => [
        this.formatearFechaStr(item.fechaVencimiento),
        item.nombreCompleto,
        item.noCuenta,
        `$${(item.saldo || 0).toFixed(2)}`,
        `${(item.tasaInteres || 0).toFixed(2)}%`,
        `${item.plazo} días`,
        item.estado,
      ]);

      autoTable(doc, {
        head: [['Fecha Vencimiento', 'Nombre Cliente', 'No. de Cuenta', 'Saldo DPF', 'Tasa Interés (%)', 'Plazo (días)', 'Estado']],
        body: filas,
        startY: 45,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [25, 118, 210], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        foot: [[
          '',
          '',
          'TOTALES',
          `$${this.calcularTotalSaldo().toFixed(2)}`,
          '',
          '',
          '',
        ]],
        footStyles: { fillColor: [224, 224, 224], fontStyle: 'bold', textColor: [50, 50, 50] },
      });

      const nombreArchivo = `reporte-vencimiento-dpf-${new Date().toISOString().substring(0, 10)}.pdf`;
      doc.save(nombreArchivo);

      this.snackBar.open('PDF exportado correctamente', 'Cerrar', {
        duration: 3000,
      });
    } catch (error) {
      console.error('Error al exportar a PDF:', error);
      this.snackBar.open('Error al exportar a PDF', 'Cerrar', {
        duration: 3000,
      });
    } finally {
      this.exportandoPdf.set(false);
    }
  }

  private formatearFecha(fecha: Date): string {
    if (!fecha) return '';
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatearFechaStr(fecha: string): string {
    if (!fecha) return '';
    const parts = fecha.substring(0, 10).split('-');
    if (parts.length !== 3) return fecha;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
}
