import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog';
import { PrestamoService, PrestamoFilters } from '../../services/prestamo.service';
import { PagoService } from '../../services/pago.service';
import { RegistrarPagoDialogComponent } from '../pagos/registrar-pago-dialog/registrar-pago-dialog.component';
import { CatalogosService } from '@features/catalogos/services/catalogos.service';
import { EstadoPrestamoModel } from '@core/models/catalogo.model';
import { ClasificacionPrestamoService } from '../../services/clasificacion-prestamo.service';
import {
  Prestamo,
  EstadoPrestamo,
  ClasificacionPrestamo,
  ESTADO_PRESTAMO_LABELS,
} from '@core/models/credito.model';

@Component({
  selector: 'app-prestamos-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatBadgeModule,
    CurrencyPipe,
    DatePipe,
  ],
  template: `
    <div class="container">
      <div class="header">
        <div>
          <h1>Préstamos</h1>
          <p class="subtitle">Gestión y consulta de préstamos desembolsados</p>
        </div>
      </div>

      <!-- Filtros -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Buscar por número de crédito</mat-label>
              <input
                matInput
                [(ngModel)]="filters.numeroCredito"
                (keyup.enter)="loadData()"
                placeholder="Ej: CRE-2024-00001"
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
              <mat-select [(ngModel)]="filters.estado" (selectionChange)="loadData()">
                <mat-option [value]="undefined">Todos</mat-option>
                @for (estado of estados(); track estado.id) {
                  <mat-option [value]="estado.codigo">{{ estado.nombre }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Categoría NCB-022</mat-label>
              <mat-select [(ngModel)]="filters.clasificacionPrestamoId" (selectionChange)="loadData()">
                <mat-option [value]="undefined">Todas</mat-option>
                @for (categoria of clasificaciones(); track categoria.id) {
                  <mat-option [value]="categoria.id">{{ categoria.codigo }} - {{ categoria.nombre }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Desde</mat-label>
              <input matInput type="date" [(ngModel)]="filters.fechaDesde" (change)="loadData()" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Hasta</mat-label>
              <input matInput type="date" [(ngModel)]="filters.fechaHasta" (change)="loadData()" />
            </mat-form-field>

            <div class="filter-actions">
              <button mat-button (click)="clearFilters()">
                <mat-icon>clear</mat-icon> Limpiar
              </button>
              <button mat-raised-button color="primary" (click)="loadData()">
                <mat-icon>search</mat-icon> Buscar
              </button>
            </div>
          </div>

          <!-- Filtros rápidos -->
          <div class="quick-filters">
            <button
              mat-stroked-button
              [color]="filters.conMora === true ? 'warn' : ''"
              (click)="toggleMoraFilter()"
            >
              <mat-icon>error_outline</mat-icon>
              Solo con mora
            </button>
            <button
              mat-stroked-button
              [color]="filters.estado === 'VIGENTE' ? 'primary' : ''"
              (click)="filterByEstado('VIGENTE')"
            >
              <mat-icon>check_circle</mat-icon>
              Vigentes
            </button>
            <button
              mat-stroked-button
              [color]="filters.estado === 'CANCELADO' ? 'accent' : ''"
              (click)="filterByEstado('CANCELADO')"
            >
              <mat-icon>done_all</mat-icon>
              Cancelados
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Tabla de préstamos -->
      @if (isLoading()) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando préstamos...</p>
        </div>
      } @else {
        <mat-card>
          <mat-card-content>
            <div class="table-responsive">
              <table mat-table [dataSource]="paginatedData()" matSort (matSortChange)="sortData($event)">

                <!-- Número de Crédito -->
                <ng-container matColumnDef="numeroCredito">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>No. Crédito</th>
                  <td mat-cell *matCellDef="let item">
                    <strong>{{ item.numeroCredito }}</strong>
                  </td>
                </ng-container>

                <!-- Cliente -->
                <ng-container matColumnDef="cliente">
                  <th mat-header-cell *matHeaderCellDef>Cliente</th>
                  <td mat-cell *matCellDef="let item">
                    <div class="client-info">
                      <span class="client-name">
                        {{ item.persona?.nombre }} {{ item.persona?.apellido }}
                      </span>
                      <span class="client-dui">DUI: {{ item.persona?.numeroDui || 'N/A' }}</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Monto -->
                <ng-container matColumnDef="monto">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Monto Desembolsado</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.montoDesembolsado | currency:'USD':'symbol':'1.2-2' }}
                  </td>
                </ng-container>

                <!-- Saldo Capital -->
                <ng-container matColumnDef="saldoCapital">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Saldo Capital</th>
                  <td mat-cell *matCellDef="let item">
                    <span [class.text-danger]="item.saldoCapital > 0 && item.estado === 'MORA'">
                      {{ item.saldoCapital | currency:'USD':'symbol':'1.2-2' }}
                    </span>
                  </td>
                </ng-container>

                <!-- Estado -->
                <ng-container matColumnDef="estado">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let item">
                    <mat-chip-set>
                      <mat-chip [style.background-color]="getEstadoColor(item.estado)" [style.color]="'white'">
                        {{ getEstadoLabel(item.estado) }}
                      </mat-chip>
                    </mat-chip-set>
                  </td>
                </ng-container>

                <!-- Categoría NCB-022 -->
                <ng-container matColumnDef="categoria">
                  <th mat-header-cell *matHeaderCellDef>Categoría</th>
                  <td mat-cell *matCellDef="let item">
                    <mat-chip-set>
                      <mat-chip [ngClass]="getCategoriaClass(item.categoriaNCB022)">
                        {{ item.categoriaNCB022 }}
                      </mat-chip>
                    </mat-chip-set>
                  </td>
                </ng-container>

                <!-- Días de Mora -->
                <ng-container matColumnDef="diasMora">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Días Mora</th>
                  <td mat-cell *matCellDef="let item">
                    @if (item.diasMora > 0) {
                      <span class="badge-mora" [matBadge]="item.diasMora" matBadgeColor="warn">
                        <mat-icon color="warn">error</mat-icon>
                      </span>
                    } @else {
                      <span class="text-muted">-</span>
                    }
                  </td>
                </ng-container>

                <!-- Fecha Otorgamiento -->
                <ng-container matColumnDef="fechaOtorgamiento">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha Otorgamiento</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.fechaOtorgamiento | date:'dd/MM/yyyy' }}
                  </td>
                </ng-container>

                <!-- Acciones -->
                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let item">
                    <button
                      mat-icon-button
                      color="primary"
                      (click)="verDetalle(item.id)"
                      matTooltip="Ver detalle"
                    >
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      [matMenuTriggerFor]="menu"
                      matTooltip="Más opciones"
                    >
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="verDetalle(item.id)">
                        <mat-icon>visibility</mat-icon>
                        <span>Ver detalle completo</span>
                      </button>
                      <button mat-menu-item (click)="verPlanPagos(item.id)">
                        <mat-icon>event_note</mat-icon>
                        <span>Ver plan de pagos</span>
                      </button>
                      @if (item.estado === 'VIGENTE' || item.estado === 'MORA') {
                        <button mat-menu-item (click)="registrarPago(item.id)">
                          <mat-icon>payment</mat-icon>
                          <span>Registrar pago</span>
                        </button>
                      }
                      <button
                        mat-menu-item
                        (click)="imprimirEstadoCuenta(item.id)"
                        [disabled]="downloadingPdfId() === item.id">
                        @if (downloadingPdfId() === item.id) {
                          <mat-spinner diameter="18" style="display: inline-block; margin-right: 8px;"></mat-spinner>
                        } @else {
                          <mat-icon>print</mat-icon>
                        }
                        <span>{{ downloadingPdfId() === item.id ? 'Descargando...' : 'Estado de cuenta' }}</span>
                      </button>
                      <button mat-menu-item (click)="verHistorialPagos(item.id)">
                        <mat-icon>history</mat-icon>
                        <span>Historial de pagos</span>
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr
                  mat-row
                  *matRowDef="let row; columns: displayedColumns"
                  class="table-row"
                  [class.row-mora]="row.diasMora > 0"
                ></tr>
              </table>
            </div>

            <!-- Paginador -->
            <mat-paginator
              [length]="sortedData().length"
              [pageSize]="pageSize"
              [pageSizeOptions]="[10, 25, 50, 100]"
              (page)="onPageChange($event)"
              showFirstLastButtons
            >
            </mat-paginator>

            <!-- Estado vacío -->
            @if (prestamos().length === 0) {
              <div class="empty">
                <mat-icon>account_balance</mat-icon>
                <p>No se encontraron préstamos con los criterios seleccionados</p>
                <button mat-raised-button (click)="clearFilters()">
                  Limpiar filtros
                </button>
              </div>
            }
          </mat-card-content>
        </mat-card>
      }

      <!-- Resumen de cartera -->
      <mat-card class="summary-card">
        <mat-card-content>
          <div class="summary">
            <div class="summary-item">
              <mat-icon>account_balance_wallet</mat-icon>
              <div>
                <span class="summary-label">Total Préstamos</span>
                <span class="summary-value">{{ prestamos().length }}</span>
              </div>
            </div>
            <div class="summary-item">
              <mat-icon>attach_money</mat-icon>
              <div>
                <span class="summary-label">Cartera Total</span>
                <span class="summary-value">{{ getTotalCartera() | currency:'USD':'symbol':'1.2-2' }}</span>
              </div>
            </div>
            <div class="summary-item warn">
              <mat-icon>error_outline</mat-icon>
              <div>
                <span class="summary-label">Préstamos en Mora</span>
                <span class="summary-value">{{ getPrestamosEnMora() }}</span>
              </div>
            </div>
            <div class="summary-item warn">
              <mat-icon>money_off</mat-icon>
              <div>
                <span class="summary-label">Capital en Mora</span>
                <span class="summary-value">{{ getCapitalEnMora() | currency:'USD':'symbol':'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      padding: 16px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 500;
    }

    .subtitle {
      color: #666;
      margin: 4px 0 0 0;
      font-size: 14px;
    }

    .filters-card {
      margin-bottom: 16px;
    }

    .filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      align-items: start;
      margin-bottom: 16px;
    }

    .filter-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .quick-filters {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      padding-top: 8px;
      border-top: 1px solid #e0e0e0;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px;
      gap: 16px;
    }

    .loading p {
      color: #666;
      margin: 0;
    }

    .table-responsive {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .table-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .table-row:hover {
      background-color: #f5f5f5;
    }

    .row-mora {
      background-color: #fff3e0;
    }

    .row-mora:hover {
      background-color: #ffe0b2;
    }

    .client-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .client-name {
      font-weight: 500;
    }

    .client-dui {
      font-size: 12px;
      color: #666;
    }

    .text-danger {
      color: #f44336;
      font-weight: 500;
    }

    .text-muted {
      color: #999;
    }

    .badge-mora {
      display: inline-flex;
      align-items: center;
    }

    .empty {
      text-align: center;
      padding: 64px 16px;
    }

    .empty mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty p {
      color: #666;
      margin: 16px 0;
      font-size: 16px;
    }

    .summary-card {
      margin-top: 16px;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-radius: 8px;
      background-color: #f5f5f5;
    }

    .summary-item.warn {
      background-color: #fff3e0;
    }

    .summary-item mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #1976d2;
    }

    .summary-item.warn mat-icon {
      color: #f57c00;
    }

    .summary-item > div {
      display: flex;
      flex-direction: column;
    }

    .summary-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .summary-value {
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    /* Estados del préstamo */
    mat-chip.estado-vigente {
      background-color: #4caf50 !important;
      color: white !important;
    }

    mat-chip.estado-mora {
      background-color: #ff9800 !important;
      color: white !important;
    }

    mat-chip.estado-cancelado {
      background-color: #2196f3 !important;
      color: white !important;
    }

    mat-chip.estado-castigado {
      background-color: #f44336 !important;
      color: white !important;
    }

    /* Categorías NCB-022 */
    mat-chip.categoria-a {
      background-color: #4caf50 !important;
      color: white !important;
    }

    mat-chip.categoria-b {
      background-color: #8bc34a !important;
      color: white !important;
    }

    mat-chip.categoria-c {
      background-color: #ff9800 !important;
      color: white !important;
    }

    mat-chip.categoria-d {
      background-color: #ff5722 !important;
      color: white !important;
    }

    mat-chip.categoria-e {
      background-color: #f44336 !important;
      color: white !important;
    }

    /* Responsive */
    @media (max-width: 960px) {
      .filters {
        grid-template-columns: 1fr;
      }

      .summary {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class PrestamosListComponent implements OnInit {
  private service = inject(PrestamoService);
  private pagoService = inject(PagoService);
  private catalogosService = inject(CatalogosService);
  private clasificacionService = inject(ClasificacionPrestamoService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  prestamos = signal<Prestamo[]>([]);
  sortedData = signal<Prestamo[]>([]);
  paginatedData = signal<Prestamo[]>([]);
  isLoading = signal(true);
  downloadingPdfId = signal<number | null>(null);

  filters: PrestamoFilters = {};
  estados = signal<EstadoPrestamoModel[]>([]);
  clasificaciones = signal<ClasificacionPrestamo[]>([]);

  displayedColumns = [
    'numeroCredito',
    'cliente',
    'monto',
    'saldoCapital',
    'estado',
    'categoria',
    'diasMora',
    'fechaOtorgamiento',
    'acciones',
  ];

  // Paginación
  pageSize = 10;
  pageIndex = 0;

  ngOnInit(): void {
    this.loadEstados();
    this.loadClasificaciones();
    this.loadData();
  }

  loadEstados(): void {
    this.catalogosService.getEstadosPrestamo(true).subscribe({
      next: (data) => {
        this.estados.set(data as EstadoPrestamoModel[]);
      },
      error: (err) => {
        console.error('Error al cargar estados de préstamo:', err);
        this.snackBar.open(
          'Error al cargar los estados de préstamo',
          'Cerrar',
          { duration: 3000 }
        );
      },
    });
  }

  loadClasificaciones(): void {
    this.clasificacionService.getActivas().subscribe({
      next: (data) => {
        this.clasificaciones.set(data);
      },
      error: (err) => {
        console.error('Error al cargar clasificaciones de préstamo:', err);
        this.snackBar.open(
          'Error al cargar las clasificaciones NCB-022',
          'Cerrar',
          { duration: 3000 }
        );
      },
    });
  }

  loadData(): void {
    this.isLoading.set(true);

    const cleanFilters: PrestamoFilters = {};
    if (this.filters.estado) cleanFilters.estado = this.filters.estado;
    if (this.filters.numeroCredito) cleanFilters.numeroCredito = this.filters.numeroCredito;
    if (this.filters.clasificacionPrestamoId) cleanFilters.clasificacionPrestamoId = this.filters.clasificacionPrestamoId;
    if (this.filters.fechaDesde) cleanFilters.fechaDesde = this.filters.fechaDesde;
    if (this.filters.fechaHasta) cleanFilters.fechaHasta = this.filters.fechaHasta;
    if (this.filters.conMora !== undefined) cleanFilters.conMora = this.filters.conMora;

    this.service.getAll(cleanFilters).subscribe({
      next: (data) => {
        // Asegurar que siempre sea un array válido
        const validData = Array.isArray(data) ? data : [];
        this.prestamos.set(validData);
        this.sortedData.set([...validData]);
        this.updatePaginatedData();
        this.isLoading.set(false);
      },
      error: (err) => {
        // En caso de error, inicializar con array vacío
        this.prestamos.set([]);
        this.sortedData.set([]);
        this.updatePaginatedData();
        this.snackBar.open(
          err.error?.message || 'Error al cargar préstamos',
          'Cerrar',
          { duration: 3000 }
        );
        this.isLoading.set(false);
      },
    });
  }

  clearFilters(): void {
    this.filters = {};
    this.loadData();
  }

  toggleMoraFilter(): void {
    this.filters.conMora = this.filters.conMora === true ? undefined : true;
    this.loadData();
  }

  filterByEstado(estadoCodigo: string): void {
    const estadoEnum = estadoCodigo as EstadoPrestamo;
    if (this.filters.estado === estadoEnum) {
      this.filters.estado = undefined;
    } else {
      this.filters.estado = estadoEnum;
    }
    this.loadData();
  }

  sortData(sort: Sort): void {
    const data = this.prestamos().slice();

    if (!sort.active || sort.direction === '') {
      this.sortedData.set(data);
      this.updatePaginatedData();
      return;
    }

    const sorted = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'numeroCredito':
          return this.compare(a.numeroCredito, b.numeroCredito, isAsc);
        case 'monto':
          return this.compare(a.montoDesembolsado, b.montoDesembolsado, isAsc);
        case 'saldoCapital':
          return this.compare(a.saldoCapital, b.saldoCapital, isAsc);
        case 'diasMora':
          return this.compare(a.diasMora, b.diasMora, isAsc);
        case 'fechaOtorgamiento':
          return this.compare(a.fechaOtorgamiento, b.fechaOtorgamiento, isAsc);
        default:
          return 0;
      }
    });

    this.sortedData.set(sorted);
    this.updatePaginatedData();
  }

  private compare(a: string | number, b: string | number, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedData();
  }

  private updatePaginatedData(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData.set(this.sortedData().slice(startIndex, endIndex));
  }

  getEstadoLabel(estado: EstadoPrestamo): string {
    const estadoCatalogo = this.estados().find(e => e.codigo === estado);
    return estadoCatalogo?.nombre || ESTADO_PRESTAMO_LABELS[estado] || estado;
  }

  getEstadoClass(estado: EstadoPrestamo): string {
    return 'estado-' + estado.toLowerCase();
  }

  getEstadoColor(estado: EstadoPrestamo): string {
    const estadoCatalogo = this.estados().find(e => e.codigo === estado);
    return estadoCatalogo?.color || '#666666';
  }

  getCategoriaLabel(categoria: string): string {
    // Si hay un código de clasificación, buscar en las clasificaciones cargadas
    const clasificacion = this.clasificaciones().find(c => c.codigo === categoria);
    return clasificacion ? `${clasificacion.codigo} - ${clasificacion.nombre}` : categoria;
  }

  getCategoriaClass(categoria: string): string {
    // Extraer la primera letra para la clase CSS (A, B, C, D, E)
    const letra = categoria.charAt(0).toLowerCase();
    return 'categoria-' + letra;
  }

  getTotalCartera(): number {
    const prestamos = this.prestamos();
    if (!Array.isArray(prestamos) || prestamos.length === 0) {
      return 0;
    }
    return prestamos.reduce((sum, p) => sum + (p.saldoCapital || 0), 0);
  }

  getPrestamosEnMora(): number {
    const prestamos = this.prestamos();
    if (!Array.isArray(prestamos)) {
      return 0;
    }
    return prestamos.filter(p => (p.diasMora || 0) > 0).length;
  }

  getCapitalEnMora(): number {
    const prestamos = this.prestamos();
    if (!Array.isArray(prestamos) || prestamos.length === 0) {
      return 0;
    }
    return prestamos.reduce((sum, p) => sum + (p.capitalMora || 0), 0);
  }

  verDetalle(id: number): void {
    this.router.navigate(['/creditos/prestamos', id]);
  }

  verPlanPagos(id: number): void {
    this.router.navigate(['/creditos/prestamos', id], { fragment: 'plan-pagos' });
  }

  registrarPago(id: number): void {
    // Buscar el préstamo
    const prestamo = this.prestamos().find(p => p.id === id);
    if (!prestamo) {
      this.snackBar.open('Préstamo no encontrado', 'Cerrar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(RegistrarPagoDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { prestamo },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Recargar la lista después de registrar pago
        this.loadData();
      }
    });
  }

  imprimirEstadoCuenta(id: number): void {
    // Buscar el préstamo para obtener el número de crédito
    const prestamo = this.prestamos().find(p => p.id === id);
    if (!prestamo) {
      this.snackBar.open('Préstamo no encontrado', 'Cerrar', { duration: 3000 });
      return;
    }

    // Marcar que estamos descargando este préstamo
    this.downloadingPdfId.set(id);
    this.snackBar.open('Generando estado de cuenta...', 'Cerrar', { duration: 2000 });

    this.pagoService.descargarEstadoCuentaPdf(id).subscribe({
      next: (blob) => {
        // Crear un enlace temporal para descargar el archivo
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `estado-cuenta-${prestamo.numeroCredito}.pdf`;

        // Simular click en el enlace
        document.body.appendChild(link);
        link.click();

        // Limpiar recursos
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.downloadingPdfId.set(null);
        this.snackBar.open('Estado de cuenta descargado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.downloadingPdfId.set(null);
        this.snackBar.open(
          err.error?.message || 'Error al descargar el estado de cuenta. Por favor, intente nuevamente.',
          'Cerrar',
          { duration: 5000 }
        );
      }
    });
  }

  verHistorialPagos(id: number): void {
    this.router.navigate(['/creditos/prestamos', id, 'pagos']);
  }
}
