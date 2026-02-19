import { Component, computed, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import {
  Prestamo,
  EstadoPrestamo,
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
              <mat-label>Buscar por nombre de cliente</mat-label>
              <input
                matInput
                [(ngModel)]="filters.nombreCliente"
                (keyup.enter)="loadData()"
                placeholder="Ej: Juan Pérez"
              />
              <mat-icon matSuffix>person_search</mat-icon>
            </mat-form-field>

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
              <mat-select [(ngModel)]="filters.estado">
                <mat-option [value]="undefined">Todos</mat-option>
                @for (estado of estados(); track estado.id) {
                  <mat-option [value]="estado.codigo">{{ estado.nombre }}</mat-option>
                }
              </mat-select>
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
      } @else if (!hasSearched()) {
        <mat-card>
          <mat-card-content>
            <div class="initial-state">
              <mat-icon>search</mat-icon>
              <h3>Buscar Préstamos</h3>
              <p>Utilice los filtros de arriba para buscar préstamos.</p>
              <p class="hint">Puede buscar por nombre de cliente, número de crédito o estado.</p>
            </div>
          </mat-card-content>
        </mat-card>
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
                        {{ item.cliente?.nombreCompleto || (item.persona?.nombre + ' ' + item.persona?.apellido) || 'N/A' }}
                      </span>
                      <span class="client-dui">DUI: {{ item.cliente?.numeroDui || item.persona?.numeroDui || 'N/A' }}</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Monto -->
                <ng-container matColumnDef="monto">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Monto de Crédito</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.montoAutorizado | currency:'USD':'symbol':'1.2-2' }}
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

                <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
                <tr
                  mat-row
                  *matRowDef="let row; columns: displayedColumns()"
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

      <!-- Resumen de cartera (solo visible después de buscar) -->
      @if (hasSearched() && prestamos().length > 0) {
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
      }
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

    .empty, .initial-state {
      text-align: center;
      padding: 64px 16px;
    }

    .empty mat-icon, .initial-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .initial-state mat-icon {
      color: #1976d2;
    }

    .initial-state h3 {
      margin: 16px 0 8px 0;
      color: #333;
      font-size: 20px;
    }

    .empty p, .initial-state p {
      color: #666;
      margin: 8px 0;
      font-size: 16px;
    }

    .initial-state .hint {
      font-size: 14px;
      color: #999;
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

    @media (max-width: 600px) {
      .container {
        padding: 8px;
      }

      .header h1 {
        font-size: 20px;
      }

      .subtitle {
        font-size: 12px;
      }

      .filters {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .filter-actions {
        width: 100%;
        flex-direction: column;
        gap: 8px;
      }

      .filter-actions button {
        width: 100%;
      }

      .quick-filters button {
        font-size: 12px;
        padding: 0 8px;
      }

      .quick-filters mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .table-responsive {
        margin: 0 -8px;
      }

      table {
        font-size: 13px;
      }

      .mat-mdc-header-cell,
      .mat-mdc-cell {
        padding: 6px 4px !important;
      }

      .client-info .client-name {
        font-size: 13px;
      }

      .client-info .client-dui {
        font-size: 11px;
      }

      .mat-mdc-icon-button {
        width: 36px;
        height: 36px;
        padding: 6px;
      }

      .mat-mdc-icon-button .mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .summary-item {
        padding: 12px;
        gap: 12px;
      }

      .summary-item mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .summary-value {
        font-size: 18px;
      }

      .summary-label {
        font-size: 11px;
      }

      .loading p {
        font-size: 14px;
      }

      .empty p, .initial-state p {
        font-size: 14px;
      }

      .initial-state mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }

      mat-chip {
        font-size: 11px;
        min-height: 24px;
      }

      .mat-mdc-paginator-container {
        flex-wrap: wrap;
        justify-content: center;
        padding: 8px !important;
      }
    }
  `],
})
export class PrestamosListComponent implements OnInit {
  private service = inject(PrestamoService);
  private pagoService = inject(PagoService);
  private catalogosService = inject(CatalogosService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private breakpointObserver = inject(BreakpointObserver);
  private destroyRef = inject(DestroyRef);

  prestamos = signal<Prestamo[]>([]);
  sortedData = signal<Prestamo[]>([]);
  paginatedData = signal<Prestamo[]>([]);
  isLoading = signal(false);
  hasSearched = signal(false);
  downloadingPdfId = signal<number | null>(null);

  filters: PrestamoFilters = {};
  estados = signal<EstadoPrestamoModel[]>([]);

  isMobile = signal(false);

  displayedColumns = computed(() =>
    this.isMobile()
      ? ['numeroCredito', 'cliente', 'estado', 'acciones']
      : ['numeroCredito', 'cliente', 'monto', 'saldoCapital', 'estado', 'diasMora', 'fechaOtorgamiento', 'acciones']
  );

  // Paginación
  pageSize = 10;
  pageIndex = 0;

  ngOnInit(): void {
    this.loadEstados();
    this.breakpointObserver
      .observe('(max-width: 768px)')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => this.isMobile.set(result.matches));
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

  loadData(): void {
    this.isLoading.set(true);
    this.hasSearched.set(true);

    const cleanFilters: PrestamoFilters = {};
    if (this.filters.estado) cleanFilters.estado = this.filters.estado;
    if (this.filters.numeroCredito) cleanFilters.numeroCredito = this.filters.numeroCredito;
    if (this.filters.nombreCliente) cleanFilters.nombreCliente = this.filters.nombreCliente;
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
          return this.compare(a.montoAutorizado, b.montoAutorizado, isAsc);
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

  /**
   * Detecta si el dispositivo es móvil
   */
  private isMobileDevice(): boolean {
    return window.innerWidth <= 768;
  }

  imprimirEstadoCuenta(id: number): void {
    // Buscar el préstamo para obtener el número de crédito
    const prestamo = this.prestamos().find(p => p.id === id);
    if (!prestamo) {
      this.snackBar.open('Préstamo no encontrado', 'Cerrar', { duration: 3000 });
      return;
    }

    // Si es móvil, navegar a la vista móvil del estado de cuenta
    if (this.isMobileDevice()) {
      this.router.navigate(['/creditos/prestamos', id, 'estado-cuenta-movil']);
      return;
    }

    // En escritorio, descargar el PDF
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
