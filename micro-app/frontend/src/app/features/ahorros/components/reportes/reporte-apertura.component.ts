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

import { CuentaAhorroService } from '../../services/cuenta-ahorro.service';
import { CatalogosAhorroService } from '../../services/catalogos-ahorro.service';
import { CuentaAhorroResumen, LineaAhorro } from '@core/models/ahorro.model';

@Component({
  selector: 'app-reporte-apertura',
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
            <mat-icon>summarize</mat-icon>
            Reporte de Apertura de Cuentas de Ahorro
          </h1>
          <p class="subtitle">
            Consulta y exportación de cuentas aperturadas por periodo
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

              <!-- Línea de Ahorro -->
              <mat-form-field appearance="outline">
                <mat-label>Línea de ahorro</mat-label>
                <mat-select formControlName="lineaCodigo">
                  <mat-option [value]="null">Todas las líneas</mat-option>
                  @for (linea of lineasAhorro(); track linea.id) {
                    <mat-option [value]="linea.codigo">{{ linea.nombre }}</mat-option>
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
                </div>
              </div>
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <!-- Resumen -->
            <div class="summary">
              <div class="summary-item">
                <mat-icon>savings</mat-icon>
                <div>
                  <span class="summary-label">Total Cuentas Aperturadas</span>
                  <span class="summary-value">{{ datosReporte().length }}</span>
                </div>
              </div>
              <div class="summary-item primary">
                <mat-icon>attach_money</mat-icon>
                <div>
                  <span class="summary-label">Total Monto Apertura</span>
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
                <!-- Fecha Apertura -->
                <ng-container matColumnDef="fechaApertura">
                  <th mat-header-cell *matHeaderCellDef>Fecha Apertura</th>
                  <td mat-cell *matCellDef="let item">
                    {{ formatearFechaStr(item.fechaApertura) }}
                  </td>
                </ng-container>

                <!-- No. Cuenta -->
                <ng-container matColumnDef="noCuenta">
                  <th mat-header-cell *matHeaderCellDef>No. Cuenta</th>
                  <td mat-cell *matCellDef="let item">
                    <strong>{{ item.noCuenta }}</strong>
                  </td>
                </ng-container>

                <!-- Propietario -->
                <ng-container matColumnDef="nombreCliente">
                  <th mat-header-cell *matHeaderCellDef>Propietario</th>
                  <td mat-cell *matCellDef="let item">{{ item.nombreCliente }}</td>
                </ng-container>

                <!-- Tipo Ahorro -->
                <ng-container matColumnDef="tipoAhorro">
                  <th mat-header-cell *matHeaderCellDef>Tipo Ahorro</th>
                  <td mat-cell *matCellDef="let item">{{ item.tipoAhorro }}</td>
                </ng-container>

                <!-- Tasa Interés -->
                <ng-container matColumnDef="tasaInteres">
                  <th mat-header-cell *matHeaderCellDef>Tasa Interés</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.tasaInteres | number:'1.2-2' }}%
                  </td>
                </ng-container>

                <!-- Monto Apertura -->
                <ng-container matColumnDef="monto">
                  <th mat-header-cell *matHeaderCellDef>Monto Apertura</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.monto | currency:'USD':'symbol':'1.2-2' }}
                  </td>
                </ng-container>

                <!-- Plazo -->
                <ng-container matColumnDef="plazo">
                  <th mat-header-cell *matHeaderCellDef>Plazo</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.plazo ? item.plazo + ' días' : '-' }}
                  </td>
                </ng-container>

                <!-- Fecha Vencimiento -->
                <ng-container matColumnDef="fechaVencimiento">
                  <th mat-header-cell *matHeaderCellDef>Fecha Vencimiento</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.fechaVencimiento ? formatearFechaStr(item.fechaVencimiento) : '-' }}
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
              <p>No se encontraron cuentas aperturadas en el periodo seleccionado</p>
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
  `],
})
export class ReporteAperturaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cuentaAhorroService = inject(CuentaAhorroService);
  private catalogosService = inject(CatalogosAhorroService);
  private snackBar = inject(MatSnackBar);

  // Signals
  isLoading = signal(false);
  reporteGenerado = signal(false);
  datosReporte = signal<CuentaAhorroResumen[]>([]);
  datosPaginados = signal<CuentaAhorroResumen[]>([]);
  lineasAhorro = signal<LineaAhorro[]>([]);
  exportandoExcel = signal(false);

  // Formulario
  filtrosForm!: FormGroup;

  // Paginación
  tamanioPagina = 10;
  indicePagina = 0;

  // Columnas de la tabla
  columnasVisibles = [
    'fechaApertura',
    'noCuenta',
    'nombreCliente',
    'tipoAhorro',
    'tasaInteres',
    'monto',
    'plazo',
    'fechaVencimiento',
  ];

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarLineasAhorro();
  }

  private inicializarFormulario(): void {
    const primerDiaMes = new Date();
    primerDiaMes.setDate(1);

    const ultimoDiaMes = new Date();
    ultimoDiaMes.setMonth(ultimoDiaMes.getMonth() + 1);
    ultimoDiaMes.setDate(0);

    this.filtrosForm = this.fb.group({
      fechaDesde: [primerDiaMes, Validators.required],
      fechaHasta: [ultimoDiaMes, Validators.required],
      lineaCodigo: [null],
    });
  }

  private cargarLineasAhorro(): void {
    this.catalogosService.getLineas(true).subscribe({
      next: (data) => {
        this.lineasAhorro.set(data);
      },
      error: (err) => {
        console.error('Error al cargar líneas de ahorro:', err);
        this.snackBar.open(
          'Error al cargar las líneas de ahorro',
          'Cerrar',
          { duration: 3000 }
        );
      },
    });
  }

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
    const params: Record<string, string> = {
      fechaDesde: this.formatearFecha(valores.fechaDesde),
      fechaHasta: this.formatearFecha(valores.fechaHasta),
      limit: '10000',
    };

    if (valores.lineaCodigo) {
      params['lineaCodigo'] = valores.lineaCodigo;
    }

    this.cuentaAhorroService.getAll(params).subscribe({
      next: (resp) => {
        this.datosReporte.set(resp.data);
        this.reporteGenerado.set(true);
        this.indicePagina = 0;
        this.actualizarDatosPaginados();
        this.isLoading.set(false);

        if (resp.data.length > 0) {
          this.snackBar.open(
            `Reporte generado: ${resp.data.length} cuenta(s) encontrada(s)`,
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

  calcularTotalMonto(): number {
    return this.datosReporte().reduce(
      (sum, item) => sum + (item.monto || 0),
      0
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
        'Fecha Apertura': this.formatearFechaStr(item.fechaApertura),
        'No. Cuenta': item.noCuenta,
        'Propietario': item.nombreCliente,
        'Tipo Ahorro': item.tipoAhorro,
        'Tasa Interés (%)': item.tasaInteres,
        'Monto Apertura': item.monto,
        'Plazo (días)': item.plazo || '',
        'Fecha Vencimiento': item.fechaVencimiento ? this.formatearFechaStr(item.fechaVencimiento) : '',
      }));

      datosExcel.push({
        'Fecha Apertura': '',
        'No. Cuenta': '',
        'Propietario': '',
        'Tipo Ahorro': 'TOTALES',
        'Tasa Interés (%)': '' as any,
        'Monto Apertura': this.calcularTotalMonto(),
        'Plazo (días)': '',
        'Fecha Vencimiento': '',
      });

      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Apertura Cuentas');

      const valores = this.filtrosForm.value;
      const fechaDesde = this.formatearFecha(valores.fechaDesde);
      const fechaHasta = this.formatearFecha(valores.fechaHasta);
      const nombreArchivo = `reporte-apertura-ahorros-${fechaDesde}-${fechaHasta}.xlsx`;

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
