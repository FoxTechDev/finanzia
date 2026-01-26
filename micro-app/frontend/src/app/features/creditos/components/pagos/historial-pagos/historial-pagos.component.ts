import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PagoService } from '../../../services/pago.service';
import { PrestamoService } from '../../../services/prestamo.service';
import { CatalogosService } from '@features/catalogos/services/catalogos.service';
import { EstadoPrestamoModel } from '@core/models/catalogo.model';
import { RegistrarPagoDialogComponent } from '../registrar-pago-dialog/registrar-pago-dialog.component';
import { DetallePagoDialogComponent } from '../detalle-pago-dialog/detalle-pago-dialog.component';
import { AnularPagoDialogComponent } from '../anular-pago-dialog/anular-pago-dialog.component';
import {
  Pago,
  Prestamo,
  EstadoPago,
  ESTADO_PAGO_LABELS,
  TIPO_PAGO_LABELS,
  ESTADO_PRESTAMO_LABELS,
  EstadoPrestamo,
} from '@core/models/credito.model';

@Component({
  selector: 'app-historial-pagos',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="title-section">
          <button mat-icon-button routerLink="/creditos/prestamos">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>Historial de Pagos</h1>
        </div>
        @if (prestamo()) {
          <button
            mat-raised-button
            color="primary"
            (click)="abrirRegistrarPago()"
            [disabled]="prestamo()!.estado === 'CANCELADO'"
          >
            <mat-icon>add</mat-icon>
            Registrar Pago
          </button>
        }
      </div>

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Cargando información...</p>
        </div>
      } @else if (prestamo()) {
        <!-- Información del Préstamo -->
        <mat-card class="prestamo-card">
          <mat-card-content>
            <div class="prestamo-info">
              <div class="info-item">
                <span class="label">Crédito</span>
                <span class="value">{{ prestamo()!.numeroCredito }}</span>
              </div>
              <div class="info-item">
                <span class="label">Cliente</span>
                <span class="value">
                  @if (prestamo()!.persona) {
                    {{ prestamo()!.persona?.nombre }} {{ prestamo()!.persona?.apellido }}
                  }
                </span>
              </div>
              <div class="info-item">
                <span class="label">Monto Desembolsado</span>
                <span class="value">{{ prestamo()!.montoDesembolsado | currency:'USD' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Saldo Capital</span>
                <span class="value highlight">{{ prestamo()!.saldoCapital | currency:'USD' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Días Mora</span>
                <span class="value" [class.mora]="prestamo()!.diasMora > 0">
                  {{ prestamo()!.diasMora }} días
                </span>
              </div>
              <div class="info-item">
                <span class="label">Estado</span>
                <mat-chip [style.background-color]="getEstadoColorHex(prestamo()!.estado)" [style.color]="'white'" highlighted>
                  {{ estadoPrestamoLabel(prestamo()!.estado) }}
                </mat-chip>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Resumen de Pagos -->
        <div class="resumen-cards">
          <mat-card class="resumen-card">
            <mat-card-content>
              <div class="resumen-item">
                <mat-icon>payments</mat-icon>
                <div class="resumen-data">
                  <span class="resumen-valor">{{ totalPagado() | currency:'USD' }}</span>
                  <span class="resumen-label">Total Pagado</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="resumen-card">
            <mat-card-content>
              <div class="resumen-item">
                <mat-icon>receipt_long</mat-icon>
                <div class="resumen-data">
                  <span class="resumen-valor">{{ pagosAplicados().length }}</span>
                  <span class="resumen-label">Pagos Aplicados</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="resumen-card">
            <mat-card-content>
              <div class="resumen-item">
                <mat-icon>account_balance</mat-icon>
                <div class="resumen-data">
                  <span class="resumen-valor">{{ capitalPagado() | currency:'USD' }}</span>
                  <span class="resumen-label">Capital Pagado</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="resumen-card">
            <mat-card-content>
              <div class="resumen-item">
                <mat-icon>percent</mat-icon>
                <div class="resumen-data">
                  <span class="resumen-valor">{{ interesPagado() | currency:'USD' }}</span>
                  <span class="resumen-label">Interés Pagado</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Tabla de Pagos -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Listado de Pagos</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (pagos().length === 0) {
              <div class="empty-state">
                <mat-icon>payments</mat-icon>
                <p>No hay pagos registrados para este préstamo</p>
                <button mat-raised-button color="primary" (click)="abrirRegistrarPago()">
                  <mat-icon>add</mat-icon>
                  Registrar Primer Pago
                </button>
              </div>
            } @else {
              <table mat-table [dataSource]="pagos()" class="pagos-table">
                <ng-container matColumnDef="numeroPago">
                  <th mat-header-cell *matHeaderCellDef>N° Pago</th>
                  <td mat-cell *matCellDef="let row">{{ row.numeroPago }}</td>
                </ng-container>

                <ng-container matColumnDef="fechaPago">
                  <th mat-header-cell *matHeaderCellDef>Fecha Pago</th>
                  <td mat-cell *matCellDef="let row">{{ row.fechaPago | date:'dd/MM/yyyy' }}</td>
                </ng-container>

                <ng-container matColumnDef="montoPagado">
                  <th mat-header-cell *matHeaderCellDef>Monto</th>
                  <td mat-cell *matCellDef="let row">
                    <strong>{{ row.montoPagado | currency:'USD' }}</strong>
                  </td>
                </ng-container>

                <ng-container matColumnDef="capitalAplicado">
                  <th mat-header-cell *matHeaderCellDef>Capital</th>
                  <td mat-cell *matCellDef="let row">{{ row.capitalAplicado | currency:'USD' }}</td>
                </ng-container>

                <ng-container matColumnDef="interesAplicado">
                  <th mat-header-cell *matHeaderCellDef>Interés</th>
                  <td mat-cell *matCellDef="let row">{{ row.interesAplicado | currency:'USD' }}</td>
                </ng-container>

                <ng-container matColumnDef="tipoPago">
                  <th mat-header-cell *matHeaderCellDef>Tipo</th>
                  <td mat-cell *matCellDef="let row">
                    <mat-chip>{{ tipoPagoLabel(row.tipoPago) }}</mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="estado">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let row">
                    <mat-chip [color]="row.estado === 'APLICADO' ? 'primary' : 'warn'" highlighted>
                      {{ estadoPagoLabel(row.estado) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let row">
                    <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="Opciones">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="verDetalle(row)">
                        <mat-icon>visibility</mat-icon>
                        <span>Ver Detalle</span>
                      </button>
                      @if (row.estado === 'APLICADO' && puedeAnular(row)) {
                        <button mat-menu-item (click)="abrirAnularPago(row)">
                          <mat-icon>cancel</mat-icon>
                          <span>Anular Pago</span>
                        </button>
                      }
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                    [class.anulado]="row.estado === 'ANULADO'"></tr>
              </table>
            }
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    h1 {
      margin: 0;
      font-size: 24px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 16px;
    }

    .prestamo-card {
      margin-bottom: 24px;
    }

    .prestamo-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 24px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }

    .info-item .value {
      font-size: 16px;
      font-weight: 500;
    }

    .info-item .value.highlight {
      color: #2e7d32;
      font-size: 18px;
    }

    .info-item .value.mora {
      color: #d32f2f;
    }

    .resumen-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .resumen-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .resumen-card:nth-child(2) {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }

    .resumen-card:nth-child(3) {
      background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%);
    }

    .resumen-card:nth-child(4) {
      background: linear-gradient(135deg, #4776E6 0%, #8E54E9 100%);
    }

    .resumen-item {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .resumen-item mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      opacity: 0.8;
    }

    .resumen-data {
      display: flex;
      flex-direction: column;
    }

    .resumen-valor {
      font-size: 24px;
      font-weight: 600;
    }

    .resumen-label {
      font-size: 12px;
      opacity: 0.9;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      gap: 16px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      opacity: 0.5;
    }

    .pagos-table {
      width: 100%;
    }

    .pagos-table tr.anulado {
      opacity: 0.6;
      background: #fff3e0;
    }
  `],
})
export class HistorialPagosComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private pagoService = inject(PagoService);
  private prestamoService = inject(PrestamoService);
  private catalogosService = inject(CatalogosService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  prestamo = signal<Prestamo | null>(null);
  pagos = signal<Pago[]>([]);
  loading = signal(true);
  estadosPrestamo = signal<EstadoPrestamoModel[]>([]);

  displayedColumns = ['numeroPago', 'fechaPago', 'montoPagado', 'capitalAplicado', 'interesAplicado', 'tipoPago', 'estado', 'acciones'];

  pagosAplicados = computed(() =>
    this.pagos().filter(p => p.estado === EstadoPago.APLICADO)
  );

  totalPagado = computed(() =>
    this.pagosAplicados().reduce((sum, p) => sum + Number(p.montoPagado), 0)
  );

  capitalPagado = computed(() =>
    this.pagosAplicados().reduce((sum, p) => sum + Number(p.capitalAplicado), 0)
  );

  interesPagado = computed(() =>
    this.pagosAplicados().reduce((sum, p) => sum + Number(p.interesAplicado), 0)
  );

  ngOnInit(): void {
    this.loadEstadosPrestamo();
    const prestamoId = Number(this.route.snapshot.params['id']);
    this.cargarDatos(prestamoId);
  }

  loadEstadosPrestamo(): void {
    this.catalogosService.getEstadosPrestamo(true).subscribe({
      next: (data) => {
        this.estadosPrestamo.set(data as EstadoPrestamoModel[]);
      },
      error: (err) => {
        console.error('Error al cargar estados de préstamo:', err);
      },
    });
  }

  cargarDatos(prestamoId: number): void {
    this.loading.set(true);

    // Cargar préstamo
    this.prestamoService.getById(prestamoId).subscribe({
      next: (prestamo) => {
        this.prestamo.set(prestamo);
      },
      error: (err) => {
        console.error('Error cargando préstamo:', err);
        this.snackBar.open('Error al cargar préstamo', 'Cerrar', { duration: 5000 });
      },
    });

    // Cargar pagos
    this.pagoService.getByPrestamo(prestamoId).subscribe({
      next: (pagos) => {
        this.pagos.set(pagos);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando pagos:', err);
        this.loading.set(false);
      },
    });
  }

  abrirRegistrarPago(): void {
    if (!this.prestamo()) return;

    const dialogRef = this.dialog.open(RegistrarPagoDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { prestamo: this.prestamo() },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarDatos(this.prestamo()!.id);
      }
    });
  }

  verDetalle(pago: Pago): void {
    this.dialog.open(DetallePagoDialogComponent, {
      width: '600px',
      data: { pago },
    });
  }

  abrirAnularPago(pago: Pago): void {
    const dialogRef = this.dialog.open(AnularPagoDialogComponent, {
      width: '500px',
      data: { pago },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarDatos(this.prestamo()!.id);
      }
    });
  }

  puedeAnular(pago: Pago): boolean {
    // Solo se puede anular el último pago aplicado
    const pagosAplicados = this.pagosAplicados();
    if (pagosAplicados.length === 0) return false;

    const ultimoPago = pagosAplicados.reduce((a, b) =>
      new Date(a.fechaRegistro) > new Date(b.fechaRegistro) ? a : b
    );

    return pago.id === ultimoPago.id;
  }

  tipoPagoLabel(tipo: string): string {
    return TIPO_PAGO_LABELS[tipo as keyof typeof TIPO_PAGO_LABELS] || tipo;
  }

  estadoPagoLabel(estado: string): string {
    return ESTADO_PAGO_LABELS[estado as EstadoPago] || estado;
  }

  estadoPrestamoLabel(estado: string): string {
    const estadoCatalogo = this.estadosPrestamo().find(e => e.codigo === estado);
    return estadoCatalogo?.nombre || ESTADO_PRESTAMO_LABELS[estado as EstadoPrestamo] || estado;
  }

  getEstadoColorHex(estado: string): string {
    const estadoCatalogo = this.estadosPrestamo().find(e => e.codigo === estado);
    return estadoCatalogo?.color || '#666666';
  }

  getEstadoColor(estado: string): 'primary' | 'accent' | 'warn' {
    switch (estado) {
      case EstadoPrestamo.VIGENTE:
        return 'primary';
      case EstadoPrestamo.CANCELADO:
        return 'accent';
      case EstadoPrestamo.MORA:
      case EstadoPrestamo.CASTIGADO:
        return 'warn';
      default:
        return 'primary';
    }
  }
}
