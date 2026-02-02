import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ComiteService, ComitePendientesFilters } from '../../../services/comite.service';
import { LineaCreditoService } from '../../../services/linea-credito.service';
import {
  Solicitud,
  LineaCredito,
  ComiteEstadisticas,
  CODIGO_ESTADO_SOLICITUD,
} from '@core/models/credito.model';
import { RECOMENDACION_ASESOR_LABELS } from '@core/models/garantia.model';
import { DecisionComiteDialogComponent } from '../decision-comite-dialog/decision-comite-dialog.component';

@Component({
  selector: 'app-bandeja-comite',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    CurrencyPipe,
    DatePipe,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Comité de Crédito</h1>
      </div>

      <!-- Estadísticas -->
      @if (estadisticas()) {
        <div class="stats-cards">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-value">{{ estadisticas()!.totalPendientes }}</div>
              <div class="stat-label">Solicitudes Pendientes</div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-value">{{ estadisticas()!.montoTotal | currency:'USD':'symbol':'1.2-2' }}</div>
              <div class="stat-label">Monto Total Pendiente</div>
            </mat-card-content>
          </mat-card>
        </div>
      }

      <!-- Filtros -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline">
              <mat-label>Línea de Crédito</mat-label>
              <mat-select [(ngModel)]="filtros.lineaCreditoId" (selectionChange)="loadPendientes()">
                <mat-option [value]="undefined">Todas</mat-option>
                @for (linea of lineas(); track linea.id) {
                  <mat-option [value]="linea.id">{{ linea.nombre }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Fecha Desde</mat-label>
              <input matInput [matDatepicker]="pickerDesde" [(ngModel)]="filtros.fechaDesde" (dateChange)="loadPendientes()">
              <mat-datepicker-toggle matIconSuffix [for]="pickerDesde"></mat-datepicker-toggle>
              <mat-datepicker #pickerDesde></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Fecha Hasta</mat-label>
              <input matInput [matDatepicker]="pickerHasta" [(ngModel)]="filtros.fechaHasta" (dateChange)="loadPendientes()">
              <mat-datepicker-toggle matIconSuffix [for]="pickerHasta"></mat-datepicker-toggle>
              <mat-datepicker #pickerHasta></mat-datepicker>
            </mat-form-field>

            <button mat-stroked-button (click)="limpiarFiltros()">
              <mat-icon>clear</mat-icon> Limpiar
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Tabla de solicitudes pendientes -->
      @if (isLoading()) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <mat-card-content>
            <div class="table-responsive">
              <table mat-table [dataSource]="solicitudes()" class="full-width">
              <ng-container matColumnDef="numeroSolicitud">
                <th mat-header-cell *matHeaderCellDef>Número</th>
                <td mat-cell *matCellDef="let item">{{ item.numeroSolicitud }}</td>
              </ng-container>

              <ng-container matColumnDef="cliente">
                <th mat-header-cell *matHeaderCellDef>Cliente</th>
                <td mat-cell *matCellDef="let item">
                  {{ item.persona?.nombre }} {{ item.persona?.apellido }}
                </td>
              </ng-container>

              <ng-container matColumnDef="tipoCredito">
                <th mat-header-cell *matHeaderCellDef>Tipo Crédito</th>
                <td mat-cell *matCellDef="let item">
                  {{ item.tipoCredito?.nombre }}
                </td>
              </ng-container>

              <ng-container matColumnDef="montoSolicitado">
                <th mat-header-cell *matHeaderCellDef>Monto</th>
                <td mat-cell *matCellDef="let item" class="amount">
                  {{ item.montoSolicitado | currency:'USD':'symbol':'1.2-2' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="plazoSolicitado">
                <th mat-header-cell *matHeaderCellDef>Plazo</th>
                <td mat-cell *matCellDef="let item">{{ item.plazoSolicitado }} meses</td>
              </ng-container>

              <ng-container matColumnDef="recomendacionAsesor">
                <th mat-header-cell *matHeaderCellDef>Recomendación</th>
                <td mat-cell *matCellDef="let item">
                  @if (item.recomendacionAsesor) {
                    <mat-chip [ngClass]="getRecomendacionClass(item.recomendacionAsesor)">
                      {{ getRecomendacionLabel(item.recomendacionAsesor) }}
                    </mat-chip>
                  } @else {
                    <span class="no-data">Sin recomendación</span>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="fechaTrasladoComite">
                <th mat-header-cell *matHeaderCellDef>Fecha Traslado</th>
                <td mat-cell *matCellDef="let item">
                  {{ item.fechaTrasladoComite | date:'dd/MM/yyyy HH:mm' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let item">
                  <button mat-icon-button color="primary" (click)="verDetalle(item)" matTooltip="Ver detalle">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-raised-button color="primary" (click)="abrirDecision(item)">
                    <mat-icon>gavel</mat-icon> Decidir
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            </div>

            @if (solicitudes().length === 0) {
              <div class="empty">
                <mat-icon>inbox</mat-icon>
                <p>No hay solicitudes pendientes de decisión</p>
              </div>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [
    `
      .container {
        padding: 16px;
        max-width: 1400px;
        margin: 0 auto;
      }

      @media (max-width: 600px) {
        .container { padding: 8px; }
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .header h1 {
        margin: 0;
        font-size: 24px;
      }

      @media (max-width: 600px) {
        .header h1 { font-size: 20px; }
      }

      .stats-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 16px;
      }

      @media (max-width: 600px) {
        .stats-cards {
          grid-template-columns: 1fr;
          gap: 12px;
        }
      }

      .stat-card {
        text-align: center;
      }

      .stat-value {
        font-size: 2em;
        font-weight: bold;
        color: #1976d2;
      }

      .stat-label {
        color: #666;
        font-size: 14px;
      }

      @media (max-width: 600px) {
        .stat-value { font-size: 1.5em; }
        .stat-label { font-size: 12px; }
      }

      .filters-card {
        margin-bottom: 16px;
      }

      .filters-row {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: flex-start;
      }

      .filters-row mat-form-field {
        flex: 1;
        min-width: 180px;
      }

      @media (max-width: 600px) {
        .filters-row {
          gap: 8px;
        }

        .filters-row mat-form-field {
          flex: 1 1 100%;
          min-width: 100%;
        }

        .filters-row button {
          width: 100%;
        }
      }

      .loading {
        display: flex;
        justify-content: center;
        padding: 48px;
      }

      @media (max-width: 600px) {
        .loading { padding: 32px 16px; }
      }

      .full-width {
        width: 100%;
      }

      table {
        width: 100%;
      }

      @media (max-width: 600px) {
        .table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        table {
          min-width: 800px;
          font-size: 13px;
        }

        th, td {
          padding: 6px 4px !important;
          white-space: nowrap;
        }

        .mat-mdc-icon-button {
          width: 36px;
          height: 36px;
          padding: 6px;
        }

        button[mat-raised-button] {
          font-size: 12px;
          padding: 0 12px;
        }

        button[mat-raised-button] mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .amount {
        font-weight: 600;
        color: #1976d2;
      }

      .no-data {
        color: #999;
        font-style: italic;
      }

      .empty {
        text-align: center;
        padding: 48px 16px;
        color: #666;
      }

      .empty mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
      }

      @media (max-width: 600px) {
        .empty {
          padding: 32px 16px;
        }

        .empty mat-icon {
          font-size: 36px;
          width: 36px;
          height: 36px;
        }
      }

      mat-chip.recomendacion-aprobar {
        background-color: #4caf50 !important;
        color: white !important;
      }

      mat-chip.recomendacion-rechazar {
        background-color: #f44336 !important;
        color: white !important;
      }

      mat-chip.recomendacion-observar {
        background-color: #ff9800 !important;
        color: white !important;
      }

      @media (max-width: 600px) {
        mat-chip {
          font-size: 11px;
          min-height: 24px;
        }
      }
    `,
  ],
})
export class BandejaComiteComponent implements OnInit {
  private router = inject(Router);
  private comiteService = inject(ComiteService);
  private lineaCreditoService = inject(LineaCreditoService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  isLoading = signal(true);
  solicitudes = signal<Solicitud[]>([]);
  lineas = signal<LineaCredito[]>([]);
  estadisticas = signal<ComiteEstadisticas | null>(null);

  filtros: ComitePendientesFilters = {};

  displayedColumns = [
    'numeroSolicitud',
    'cliente',
    'tipoCredito',
    'montoSolicitado',
    'plazoSolicitado',
    'recomendacionAsesor',
    'fechaTrasladoComite',
    'acciones',
  ];

  ngOnInit(): void {
    this.loadLineas();
    this.loadEstadisticas();
    this.loadPendientes();
  }

  loadLineas(): void {
    this.lineaCreditoService.getAll(true).subscribe({
      next: (lineas) => this.lineas.set(lineas),
      error: () => this.snackBar.open('Error al cargar líneas de crédito', 'Cerrar', { duration: 3000 }),
    });
  }

  loadEstadisticas(): void {
    this.comiteService.getEstadisticas().subscribe({
      next: (stats) => this.estadisticas.set(stats),
      error: () => console.error('Error al cargar estadísticas'),
    });
  }

  loadPendientes(): void {
    this.isLoading.set(true);
    const filters: ComitePendientesFilters = {};

    if (this.filtros.lineaCreditoId) {
      filters.lineaCreditoId = this.filtros.lineaCreditoId;
    }
    if (this.filtros.fechaDesde) {
      filters.fechaDesde = this.formatDate(this.filtros.fechaDesde);
    }
    if (this.filtros.fechaHasta) {
      filters.fechaHasta = this.formatDate(this.filtros.fechaHasta);
    }

    this.comiteService.getPendientes(filters).subscribe({
      next: (solicitudes) => {
        this.solicitudes.set(solicitudes);
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar solicitudes pendientes', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  formatDate(date: any): string {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  }

  limpiarFiltros(): void {
    this.filtros = {};
    this.loadPendientes();
  }

  getRecomendacionLabel(recomendacion: string): string {
    return RECOMENDACION_ASESOR_LABELS[recomendacion as keyof typeof RECOMENDACION_ASESOR_LABELS] || recomendacion;
  }

  getRecomendacionClass(recomendacion: string): string {
    return 'recomendacion-' + recomendacion.toLowerCase();
  }

  verDetalle(solicitud: Solicitud): void {
    this.router.navigate(['/creditos/solicitudes', solicitud.id]);
  }

  abrirDecision(solicitud: Solicitud): void {
    const dialogRef = this.dialog.open(DecisionComiteDialogComponent, {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: { solicitud },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPendientes();
        this.loadEstadisticas();
        this.snackBar.open('Decisión registrada exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
