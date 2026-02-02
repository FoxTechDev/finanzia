import { Component, OnInit, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PagoService } from '../../../services/pago.service';
import { AnularPagoDialogComponent } from '../anular-pago-dialog/anular-pago-dialog.component';
import { DetallePagoDialogComponent } from '../detalle-pago-dialog/detalle-pago-dialog.component';
import {
  Pago,
  EstadoPago,
  ESTADO_PAGO_LABELS,
  TIPO_PAGO_LABELS,
  FiltrosPago,
} from '@core/models/credito.model';

@Component({
  selector: 'app-pagos-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="title-section">
          <mat-icon class="header-icon">payments</mat-icon>
          <h1>Consulta de Pagos</h1>
        </div>
      </div>

      <!-- Filtros -->
      <mat-card class="filtros-card">
        <mat-card-content>
          <form [formGroup]="filtrosForm" class="filtros-form">
            <div class="filtros-grid">
              <!-- Búsqueda por Cliente -->
              <mat-form-field appearance="outline">
                <mat-label>Cliente</mat-label>
                <input
                  matInput
                  formControlName="cliente"
                  placeholder="Buscar por nombre o DUI"
                >
                <mat-icon matPrefix>search</mat-icon>
                <mat-hint>Nombre o número de documento</mat-hint>
              </mat-form-field>

              <!-- Fecha Desde -->
              <mat-form-field appearance="outline">
                <mat-label>Fecha Desde</mat-label>
                <input
                  matInput
                  [matDatepicker]="pickerDesde"
                  formControlName="fechaDesde"
                >
                <mat-datepicker-toggle matSuffix [for]="pickerDesde"></mat-datepicker-toggle>
                <mat-datepicker #pickerDesde></mat-datepicker>
              </mat-form-field>

              <!-- Fecha Hasta -->
              <mat-form-field appearance="outline">
                <mat-label>Fecha Hasta</mat-label>
                <input
                  matInput
                  [matDatepicker]="pickerHasta"
                  formControlName="fechaHasta"
                >
                <mat-datepicker-toggle matSuffix [for]="pickerHasta"></mat-datepicker-toggle>
                <mat-datepicker #pickerHasta></mat-datepicker>
              </mat-form-field>

              <!-- Estado -->
              <mat-form-field appearance="outline">
                <mat-label>Estado</mat-label>
                <mat-select formControlName="estado">
                  <mat-option [value]="null">Todos</mat-option>
                  <mat-option value="APLICADO">Aplicado</mat-option>
                  <mat-option value="ANULADO">Anulado</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Botones de Acción -->
            <div class="filtros-actions">
              <button
                mat-raised-button
                color="primary"
                (click)="aplicarFiltros()"
                [disabled]="loading()"
              >
                <mat-icon>filter_list</mat-icon>
                Aplicar Filtros
              </button>
              <button
                mat-button
                (click)="limpiarFiltros()"
                [disabled]="loading()"
              >
                <mat-icon>clear</mat-icon>
                Limpiar
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Estadísticas -->
      @if (!loading() && pagos().length > 0) {
        <div class="estadisticas-cards">
          <mat-card class="stat-card stat-card-1">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon>receipt_long</mat-icon>
                <div class="stat-data">
                  <span class="stat-valor">{{ totalPagos() }}</span>
                  <span class="stat-label">Total Pagos</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card stat-card-2">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon>check_circle</mat-icon>
                <div class="stat-data">
                  <span class="stat-valor">{{ pagosAplicados() }}</span>
                  <span class="stat-label">Pagos Aplicados</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card stat-card-3">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon>cancel</mat-icon>
                <div class="stat-data">
                  <span class="stat-valor">{{ pagosAnulados() }}</span>
                  <span class="stat-label">Pagos Anulados</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card stat-card-4">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon>attach_money</mat-icon>
                <div class="stat-data">
                  <span class="stat-valor">{{ totalMontoAplicado() | currency:'USD':'symbol':'1.2-2' }}</span>
                  <span class="stat-label">Monto Aplicado</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }

      <!-- Tabla de Pagos -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            Listado de Pagos
            @if (!loading()) {
              <span class="results-count">({{ totalRegistros }} registros)</span>
            }
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner diameter="50"></mat-spinner>
              <p>Cargando pagos...</p>
            </div>
          } @else if (pagos().length === 0) {
            <div class="empty-state">
              <mat-icon>payments</mat-icon>
              <p>No se encontraron pagos</p>
              <p class="empty-subtitle">Intente ajustar los filtros de búsqueda</p>
            </div>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="dataSource" matSort class="pagos-table">
                <!-- Número de Pago -->
                <ng-container matColumnDef="numeroPago">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>N° Pago</th>
                  <td mat-cell *matCellDef="let row">
                    <strong>{{ row.numeroPago }}</strong>
                  </td>
                </ng-container>

                <!-- Fecha -->
                <ng-container matColumnDef="fechaPago">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha</th>
                  <td mat-cell *matCellDef="let row">{{ row.fechaPago | date:'dd/MM/yyyy' }}</td>
                </ng-container>

                <!-- Cliente -->
                <ng-container matColumnDef="cliente">
                  <th mat-header-cell *matHeaderCellDef>Cliente</th>
                  <td mat-cell *matCellDef="let row">
                    @if (row.prestamo?.persona) {
                      <div class="cliente-info">
                        <span class="cliente-nombre">
                          {{ row.prestamo.persona.nombre }} {{ row.prestamo.persona.apellido }}
                        </span>
                        <span class="cliente-dui">DUI: {{ row.prestamo.persona.numeroDui }}</span>
                      </div>
                    }
                  </td>
                </ng-container>

                <!-- Préstamo -->
                <ng-container matColumnDef="prestamo">
                  <th mat-header-cell *matHeaderCellDef>Crédito</th>
                  <td mat-cell *matCellDef="let row">
                    @if (row.prestamo) {
                      <a [routerLink]="['/creditos/prestamos', row.prestamo.id]" class="prestamo-link">
                        {{ row.prestamo.numeroCredito }}
                      </a>
                    }
                  </td>
                </ng-container>

                <!-- Monto -->
                <ng-container matColumnDef="montoPagado">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Monto</th>
                  <td mat-cell *matCellDef="let row">
                    <strong class="monto">{{ row.montoPagado | currency:'USD' }}</strong>
                  </td>
                </ng-container>

                <!-- Tipo de Pago -->
                <ng-container matColumnDef="tipoPago">
                  <th mat-header-cell *matHeaderCellDef>Tipo</th>
                  <td mat-cell *matCellDef="let row">
                    <mat-chip class="tipo-chip">{{ tipoPagoLabel(row.tipoPago) }}</mat-chip>
                  </td>
                </ng-container>

                <!-- Estado -->
                <ng-container matColumnDef="estado">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Estado</th>
                  <td mat-cell *matCellDef="let row">
                    <mat-chip
                      [highlighted]="true"
                      [class.estado-aplicado]="row.estado === 'APLICADO'"
                      [class.estado-anulado]="row.estado === 'ANULADO'"
                    >
                      {{ estadoPagoLabel(row.estado) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Acciones -->
                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let row">
                    <div class="acciones-buttons">
                      <button
                        mat-icon-button
                        color="primary"
                        (click)="verDetalle(row)"
                        matTooltip="Ver detalle"
                      >
                        <mat-icon>visibility</mat-icon>
                      </button>
                      @if (row.estado === 'APLICADO') {
                        <button
                          mat-icon-button
                          color="warn"
                          (click)="abrirAnularPago(row)"
                          matTooltip="Anular pago"
                        >
                          <mat-icon>cancel</mat-icon>
                        </button>
                      }
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr
                  mat-row
                  *matRowDef="let row; columns: displayedColumns;"
                  [class.row-anulado]="row.estado === 'ANULADO'"
                ></tr>
              </table>
            </div>

            <!-- Paginador -->
            <mat-paginator
              [length]="totalRegistros"
              [pageSize]="pageSize"
              [pageSizeOptions]="[10, 25, 50, 100]"
              [pageIndex]="currentPage"
              (page)="onPageChange($event)"
              showFirstLastButtons
            >
            </mat-paginator>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      padding: 24px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #1976d2;
    }

    h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 500;
    }

    .filtros-card {
      margin-bottom: 24px;
    }

    .filtros-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .filtros-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .filtros-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding-top: 8px;
    }

    .estadisticas-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      color: white;
    }

    .stat-card-1 {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .stat-card-2 {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }

    .stat-card-3 {
      background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%);
    }

    .stat-card-4 {
      background: linear-gradient(135deg, #4776E6 0%, #8E54E9 100%);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-content mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      opacity: 0.9;
    }

    .stat-data {
      display: flex;
      flex-direction: column;
    }

    .stat-valor {
      font-size: 24px;
      font-weight: 600;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 13px;
      opacity: 0.9;
      margin-top: 4px;
    }

    .results-count {
      font-size: 14px;
      font-weight: 400;
      color: #666;
      margin-left: 8px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px;
      gap: 16px;
      color: #666;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px;
      gap: 12px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0;
      font-size: 16px;
    }

    .empty-subtitle {
      font-size: 14px;
      color: #999;
    }

    .table-container {
      overflow-x: auto;
    }

    .pagos-table {
      width: 100%;
      min-width: 1000px;
    }

    .pagos-table th {
      font-weight: 600;
      background-color: #f5f5f5;
    }

    .pagos-table .row-anulado {
      background-color: #ffebee;
      opacity: 0.7;
    }

    .cliente-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cliente-nombre {
      font-weight: 500;
    }

    .cliente-dui {
      font-size: 12px;
      color: #666;
    }

    .prestamo-link {
      color: #1976d2;
      text-decoration: none;
      font-weight: 500;
    }

    .prestamo-link:hover {
      text-decoration: underline;
    }

    .monto {
      color: #2e7d32;
      font-size: 15px;
    }

    .tipo-chip {
      font-size: 12px;
    }

    .estado-aplicado {
      background-color: #4caf50 !important;
      color: white !important;
    }

    .estado-anulado {
      background-color: #f44336 !important;
      color: white !important;
    }

    .acciones-buttons {
      display: flex;
      gap: 4px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .container {
        padding: 16px;
      }

      h1 {
        font-size: 20px;
      }

      .filtros-grid {
        grid-template-columns: 1fr;
      }

      .estadisticas-cards {
        grid-template-columns: 1fr;
      }

      .filtros-actions {
        flex-direction: column;
      }

      .filtros-actions button {
        width: 100%;
      }
    }
  `],
})
export class PagosListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pagoService = inject(PagoService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading = signal(false);
  pagos = signal<Pago[]>([]);
  todosPagos = signal<Pago[]>([]); // Todos los pagos para estadísticas
  dataSource = new MatTableDataSource<Pago>([]);

  totalRegistros = 0;
  currentPage = 0;
  pageSize = 10;

  filtrosForm: FormGroup;

  displayedColumns = [
    'numeroPago',
    'fechaPago',
    'cliente',
    'prestamo',
    'montoPagado',
    'tipoPago',
    'estado',
    'acciones',
  ];

  // Computed signals para estadísticas (basados en TODOS los pagos)
  totalPagos = computed(() => this.totalRegistros);

  pagosAplicados = computed(() =>
    this.todosPagos().filter(p => p.estado === EstadoPago.APLICADO).length
  );

  pagosAnulados = computed(() =>
    this.todosPagos().filter(p => p.estado === EstadoPago.ANULADO).length
  );

  totalMontoAplicado = computed(() =>
    this.todosPagos()
      .filter(p => p.estado === EstadoPago.APLICADO)
      .reduce((sum, p) => sum + Number(p.montoPagado || 0), 0)
  );

  constructor() {
    this.filtrosForm = this.fb.group({
      cliente: [''],
      fechaDesde: [null],
      fechaHasta: [null],
      estado: [null],
    });
  }

  ngOnInit(): void {
    this.cargarPagos();
  }

  /**
   * Carga los pagos aplicando filtros y paginación
   */
  cargarPagos(): void {
    this.loading.set(true);

    const filtros = this.construirFiltros();
    const filtrosEstadisticas = this.construirFiltrosEstadisticas();

    // Cargar datos paginados para la tabla
    this.pagoService.getAll(filtros).subscribe({
      next: (response) => {
        this.pagos.set(response.data);
        this.dataSource.data = response.data;
        this.totalRegistros = response.total;
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando pagos:', err);
        this.snackBar.open('Error al cargar pagos', 'Cerrar', { duration: 5000 });
        this.loading.set(false);
      },
    });

    // Cargar todos los pagos para estadísticas (sin paginación)
    this.pagoService.getAll(filtrosEstadisticas).subscribe({
      next: (response) => {
        this.todosPagos.set(response.data);
      },
      error: (err) => {
        console.error('Error cargando estadísticas:', err);
      },
    });
  }

  /**
   * Construye el objeto de filtros desde el formulario
   */
  private construirFiltros(): FiltrosPago {
    const formValues = this.filtrosForm.value;
    const filtros: FiltrosPago = {
      page: this.currentPage + 1, // El backend espera páginas desde 1
      limit: this.pageSize,
    };

    if (formValues.estado) {
      filtros.estado = formValues.estado;
    }

    if (formValues.fechaDesde) {
      filtros.fechaDesde = this.formatearFecha(formValues.fechaDesde);
    }

    if (formValues.fechaHasta) {
      filtros.fechaHasta = this.formatearFecha(formValues.fechaHasta);
    }

    // Nota: El filtro de cliente requeriría un endpoint específico en el backend
    // Por ahora lo dejamos comentado, pero se puede implementar del lado del servidor
    // if (formValues.cliente) {
    //   filtros.cliente = formValues.cliente;
    // }

    return filtros;
  }

  /**
   * Construye filtros para obtener todos los registros (para estadísticas)
   */
  private construirFiltrosEstadisticas(): FiltrosPago {
    const formValues = this.filtrosForm.value;
    const filtros: FiltrosPago = {
      page: 1,
      limit: 10000, // Obtener todos para estadísticas
    };

    if (formValues.estado) {
      filtros.estado = formValues.estado;
    }

    if (formValues.fechaDesde) {
      filtros.fechaDesde = this.formatearFecha(formValues.fechaDesde);
    }

    if (formValues.fechaHasta) {
      filtros.fechaHasta = this.formatearFecha(formValues.fechaHasta);
    }

    return filtros;
  }

  /**
   * Formatea una fecha al formato YYYY-MM-DD
   */
  private formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Aplica los filtros y recarga los datos
   */
  aplicarFiltros(): void {
    this.currentPage = 0; // Reset a la primera página
    this.cargarPagos();
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros(): void {
    this.filtrosForm.reset({
      cliente: '',
      fechaDesde: null,
      fechaHasta: null,
      estado: null,
    });
    this.currentPage = 0;
    this.cargarPagos();
  }

  /**
   * Maneja el cambio de página
   */
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarPagos();
  }

  /**
   * Abre el diálogo de detalle de pago
   */
  verDetalle(pago: Pago): void {
    this.dialog.open(DetallePagoDialogComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: { pago },
    });
  }

  /**
   * Abre el diálogo de anulación de pago
   */
  abrirAnularPago(pago: Pago): void {
    const dialogRef = this.dialog.open(AnularPagoDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: { pago },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Recargar la lista después de anular
        this.cargarPagos();
        this.snackBar.open('Pago anulado exitosamente', 'Cerrar', {
          duration: 5000,
          panelClass: ['success-snackbar'],
        });
      }
    });
  }

  /**
   * Retorna la etiqueta del tipo de pago
   */
  tipoPagoLabel(tipo: string): string {
    return TIPO_PAGO_LABELS[tipo as keyof typeof TIPO_PAGO_LABELS] || tipo;
  }

  /**
   * Retorna la etiqueta del estado de pago
   */
  estadoPagoLabel(estado: string): string {
    return ESTADO_PAGO_LABELS[estado as EstadoPago] || estado;
  }
}
