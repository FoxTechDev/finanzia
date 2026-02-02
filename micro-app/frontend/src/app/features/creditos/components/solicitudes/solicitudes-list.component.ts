import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { SolicitudService, SolicitudFilters } from '../../services/solicitud.service';
import { LineaCreditoService } from '../../services/linea-credito.service';
import {
  Solicitud,
  LineaCredito,
  EstadoSolicitud,
  CODIGO_ESTADO_SOLICITUD,
} from '@core/models/credito.model';

@Component({
  selector: 'app-solicitudes-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    CurrencyPipe,
    DatePipe,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Solicitudes de Crédito</h1>
        <button mat-fab color="primary" (click)="nuevaSolicitud()" matTooltip="Nueva solicitud">
          <mat-icon>add</mat-icon>
        </button>
      </div>

      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
              <mat-select [(ngModel)]="filters.estadoId" (selectionChange)="loadData()">
                <mat-option [value]="null">Todos</mat-option>
                @for (estado of estados(); track estado.id) {
                  <mat-option [value]="estado.id">{{ estado.nombre }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Línea de Crédito</mat-label>
              <mat-select [(ngModel)]="filters.lineaCreditoId" (selectionChange)="loadData()">
                <mat-option [value]="null">Todas</mat-option>
                @for (linea of lineas(); track linea.id) {
                  <mat-option [value]="linea.id">{{ linea.nombre }}</mat-option>
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

            <button mat-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon> Limpiar
            </button>
          </div>
        </mat-card-content>
      </mat-card>

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
                  <th mat-header-cell *matHeaderCellDef>No. Solicitud</th>
                  <td mat-cell *matCellDef="let item">{{ item.numeroSolicitud }}</td>
                </ng-container>

                <ng-container matColumnDef="fechaSolicitud">
                  <th mat-header-cell *matHeaderCellDef>Fecha</th>
                  <td mat-cell *matCellDef="let item">{{ item.fechaSolicitud | date:'dd/MM/yyyy' }}</td>
                </ng-container>

                <ng-container matColumnDef="cliente">
                  <th mat-header-cell *matHeaderCellDef>Cliente</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.persona?.nombre }} {{ item.persona?.apellido }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="tipoCredito">
                  <th mat-header-cell *matHeaderCellDef>Tipo</th>
                  <td mat-cell *matCellDef="let item">{{ item.tipoCredito?.nombre || '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="montoSolicitado">
                  <th mat-header-cell *matHeaderCellDef>Monto</th>
                  <td mat-cell *matCellDef="let item">{{ item.montoSolicitado | currency:'USD':'symbol':'1.2-2' }}</td>
                </ng-container>

                <ng-container matColumnDef="plazoSolicitado">
                  <th mat-header-cell *matHeaderCellDef>Plazo</th>
                  <td mat-cell *matCellDef="let item">{{ item.plazoSolicitado }} meses</td>
                </ng-container>

                <ng-container matColumnDef="estado">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let item">
                    <mat-chip-set>
                      <mat-chip [ngClass]="getEstadoClass(item.estado?.codigo)">
                        {{ item.estado?.nombre }}
                      </mat-chip>
                    </mat-chip-set>
                  </td>
                </ng-container>

                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let item">
                    <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="Opciones">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="verDetalle(item.id)">
                        <mat-icon>visibility</mat-icon>
                        <span>Ver detalle</span>
                      </button>
                      @if (puedeEditar(item.estado?.codigo)) {
                        <button mat-menu-item (click)="editarSolicitud(item.id)">
                          <mat-icon>edit</mat-icon>
                          <span>Editar</span>
                        </button>
                      }
                      @if (puedeTrasladarComite(item.estado?.codigo)) {
                        <button mat-menu-item (click)="trasladarAComite(item.id)">
                          <mat-icon>groups</mat-icon>
                          <span>Trasladar a Comité</span>
                        </button>
                      }
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            </div>

            @if (solicitudes().length === 0) {
              <div class="empty">
                <mat-icon>description</mat-icon>
                <p>No hay solicitudes de crédito</p>
                <button mat-raised-button color="primary" (click)="nuevaSolicitud()">
                  Nueva solicitud
                </button>
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
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        flex-wrap: wrap;
        gap: 12px;
      }

      .header h1 {
        margin: 0;
        font-size: 24px;
      }

      @media (max-width: 600px) {
        .header h1 { font-size: 20px; }
        .header button[mat-fab] {
          width: 48px;
          height: 48px;
        }
      }

      .filters-card { margin-bottom: 16px; }

      .filters {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: flex-start;
      }

      .filters mat-form-field {
        flex: 1;
        min-width: 150px;
      }

      @media (max-width: 600px) {
        .filters { gap: 8px; }
        .filters mat-form-field {
          flex: 1 1 100%;
          min-width: 100%;
        }
        .filters button {
          width: 100%;
          margin-top: 8px;
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

      .full-width { width: 100%; }

      .table-responsive {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      .table-responsive table {
        min-width: 800px;
      }

      @media (max-width: 600px) {
        .table-responsive table {
          font-size: 13px;
        }
        .table-responsive th,
        .table-responsive td {
          padding: 8px 4px !important;
          white-space: nowrap;
        }
      }

      .empty {
        text-align: center;
        padding: 48px 16px;
      }

      .empty mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #ccc;
      }

      .empty p {
        color: #666;
        margin: 16px 0;
      }

      @media (max-width: 600px) {
        .empty { padding: 32px 16px; }
        .empty mat-icon {
          font-size: 36px;
          width: 36px;
          height: 36px;
        }
        .empty p { font-size: 14px; }
      }

      /* Clases de estado basadas en códigos */
      mat-chip.estado-registrada { background-color: #2196f3 !important; color: white !important; }
      mat-chip.estado-analizada { background-color: #ff9800 !important; color: white !important; }
      mat-chip.estado-en_comite { background-color: #673ab7 !important; color: white !important; }
      mat-chip.estado-observada { background-color: #ff5722 !important; color: white !important; }
      mat-chip.estado-denegada { background-color: #f44336 !important; color: white !important; }
      mat-chip.estado-aprobada { background-color: #4caf50 !important; color: white !important; }
      mat-chip.estado-desembolsada { background-color: #00bcd4 !important; color: white !important; }

      @media (max-width: 600px) {
        mat-chip {
          font-size: 11px;
          min-height: 24px;
          padding: 2px 8px;
        }
      }
    `,
  ],
})
export class SolicitudesListComponent implements OnInit {
  private service = inject(SolicitudService);
  private lineaService = inject(LineaCreditoService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  solicitudes = signal<Solicitud[]>([]);
  lineas = signal<LineaCredito[]>([]);
  estados = signal<EstadoSolicitud[]>([]);
  isLoading = signal(true);

  filters: SolicitudFilters = {};
  displayedColumns = [
    'numeroSolicitud',
    'fechaSolicitud',
    'cliente',
    'tipoCredito',
    'montoSolicitado',
    'plazoSolicitado',
    'estado',
    'acciones',
  ];

  ngOnInit(): void {
    this.loadEstados();
    this.loadLineas();
    this.loadData();
  }

  loadEstados(): void {
    this.service.getEstados().subscribe({
      next: (data) => this.estados.set(data),
      error: () => this.snackBar.open('Error al cargar estados', 'Cerrar', { duration: 3000 }),
    });
  }

  loadLineas(): void {
    this.lineaService.getAll().subscribe({
      next: (data) => this.lineas.set(data),
      error: () => this.snackBar.open('Error al cargar líneas', 'Cerrar', { duration: 3000 }),
    });
  }

  loadData(): void {
    this.isLoading.set(true);
    const cleanFilters: SolicitudFilters = {};
    if (this.filters.estadoId) cleanFilters.estadoId = this.filters.estadoId;
    if (this.filters.lineaCreditoId) cleanFilters.lineaCreditoId = this.filters.lineaCreditoId;
    if (this.filters.fechaDesde) cleanFilters.fechaDesde = this.filters.fechaDesde;
    if (this.filters.fechaHasta) cleanFilters.fechaHasta = this.filters.fechaHasta;

    this.service.getAll(cleanFilters).subscribe({
      next: (data) => {
        this.solicitudes.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar solicitudes', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  clearFilters(): void {
    this.filters = {};
    this.loadData();
  }

  getEstadoClass(codigoEstado?: string): string {
    if (!codigoEstado) return '';
    return 'estado-' + codigoEstado.toLowerCase();
  }

  puedeEditar(codigoEstado?: string): boolean {
    return codigoEstado === CODIGO_ESTADO_SOLICITUD.REGISTRADA ||
           codigoEstado === CODIGO_ESTADO_SOLICITUD.OBSERVADA;
  }

  puedeTrasladarComite(codigoEstado?: string): boolean {
    // Permite trasladar desde ANALIZADA u OBSERVADA (re-envío después de correcciones)
    return codigoEstado === CODIGO_ESTADO_SOLICITUD.ANALIZADA ||
           codigoEstado === CODIGO_ESTADO_SOLICITUD.OBSERVADA;
  }

  nuevaSolicitud(): void {
    this.router.navigate(['/creditos/solicitudes/nueva']);
  }

  verDetalle(id: number): void {
    this.router.navigate(['/creditos/solicitudes', id]);
  }

  editarSolicitud(id: number): void {
    this.router.navigate(['/creditos/solicitudes', id, 'editar']);
  }

  trasladarAComite(id: number): void {
    const observacion = prompt('Ingrese una observación para el comité (opcional):');
    this.service
      .trasladarAComite(id, {
        observacionAsesor: observacion || undefined,
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Solicitud trasladada al comité exitosamente', 'Cerrar', { duration: 3000 });
          this.loadData();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Error al trasladar a comité', 'Cerrar', { duration: 3000 });
        },
      });
  }
}
