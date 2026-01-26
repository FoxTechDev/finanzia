import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { SolicitudService } from '../../services/solicitud.service';
import { DecisionComiteDialogComponent } from '../comite/decision-comite-dialog/decision-comite-dialog.component';
import {
  Solicitud,
  SolicitudHistorial,
  DESTINO_CREDITO_LABELS,
  CODIGO_ESTADO_SOLICITUD,
} from '@core/models/credito.model';

@Component({
  selector: 'app-solicitud-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTableModule,
    MatDividerModule,
    MatMenuModule,
    CurrencyPipe,
    DatePipe,
  ],
  template: `
    <div class="container">
      <div class="header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Solicitud {{ solicitud()?.numeroSolicitud }}</h1>
        <span class="spacer"></span>
        @if (solicitud()?.estado) {
          <mat-chip-set>
            <mat-chip [ngClass]="getEstadoClass(solicitud()!.estado!.codigo)">
              {{ solicitud()!.estado!.nombre }}
            </mat-chip>
          </mat-chip-set>
        }
      </div>

      @if (isLoading()) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (solicitud()) {
        <div class="actions-bar">
          @if (puedeEditar()) {
            <button mat-raised-button (click)="editar()">
              <mat-icon>edit</mat-icon> Editar
            </button>
          }
          @if (puedeTrasladarComite()) {
            <button mat-raised-button color="primary" (click)="trasladarAComite()">
              <mat-icon>groups</mat-icon> Trasladar a Comité
            </button>
          }
          @if (puedeDecidirComite()) {
            <button mat-raised-button color="accent" (click)="abrirDecisionComite()">
              <mat-icon>gavel</mat-icon> Decisión de Comité
            </button>
          }
        </div>

        <mat-tab-group>
          <mat-tab label="Información General">
            <div class="tab-content">
              <div class="info-grid">
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Datos del Cliente</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-row">
                      <span class="label">Nombre:</span>
                      <span>{{ solicitud()?.persona?.nombre }} {{ solicitud()?.persona?.apellido }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">DUI:</span>
                      <span>{{ solicitud()?.persona?.numeroDui }}</span>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Tipo de Crédito</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-row">
                      <span class="label">Línea:</span>
                      <span>{{ solicitud()?.lineaCredito?.nombre }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Tipo:</span>
                      <span>{{ solicitud()?.tipoCredito?.nombre }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Destino:</span>
                      <span>{{ getDestinoLabel(solicitud()!.destinoCredito) }}</span>
                    </div>
                    @if (solicitud()?.descripcionDestino) {
                      <div class="info-row">
                        <span class="label">Descripción:</span>
                        <span>{{ solicitud()?.descripcionDestino }}</span>
                      </div>
                    }
                  </mat-card-content>
                </mat-card>
              </div>

              <mat-divider></mat-divider>

              <div class="info-grid">
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Condiciones Solicitadas</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-row">
                      <span class="label">Monto:</span>
                      <span class="amount">{{ solicitud()?.montoSolicitado | currency:'USD':'symbol':'1.2-2' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Plazo:</span>
                      <span>{{ solicitud()?.plazoSolicitado }} meses</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Tasa Propuesta:</span>
                      <span>{{ solicitud()?.tasaInteresPropuesta }}%</span>
                    </div>
                  </mat-card-content>
                </mat-card>

                @if (solicitud()?.montoAprobado) {
                  <mat-card class="aprobado-card">
                    <mat-card-header>
                      <mat-card-title>Condiciones Aprobadas</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="info-row">
                        <span class="label">Monto:</span>
                        <span class="amount">{{ solicitud()?.montoAprobado | currency:'USD':'symbol':'1.2-2' }}</span>
                      </div>
                      <div class="info-row">
                        <span class="label">Plazo:</span>
                        <span>{{ solicitud()?.plazoAprobado }} meses</span>
                      </div>
                      <div class="info-row">
                        <span class="label">Tasa Aprobada:</span>
                        <span>{{ solicitud()?.tasaInteresAprobada }}%</span>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>

              <mat-divider></mat-divider>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>Fechas</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="dates-grid">
                    <div class="info-row">
                      <span class="label">Solicitud:</span>
                      <span>{{ solicitud()?.fechaSolicitud | date:'dd/MM/yyyy' }}</span>
                    </div>
                    @if (solicitud()?.fechaAnalisis) {
                      <div class="info-row">
                        <span class="label">Análisis:</span>
                        <span>{{ solicitud()?.fechaAnalisis | date:'dd/MM/yyyy' }}</span>
                      </div>
                    }
                    @if (solicitud()?.fechaAprobacion) {
                      <div class="info-row">
                        <span class="label">Aprobación:</span>
                        <span>{{ solicitud()?.fechaAprobacion | date:'dd/MM/yyyy' }}</span>
                      </div>
                    }
                    @if (solicitud()?.fechaDenegacion) {
                      <div class="info-row">
                        <span class="label">Denegación:</span>
                        <span>{{ solicitud()?.fechaDenegacion | date:'dd/MM/yyyy' }}</span>
                      </div>
                    }
                    @if (solicitud()?.fechaTrasladoComite) {
                      <div class="info-row">
                        <span class="label">Traslado Comité:</span>
                        <span>{{ solicitud()?.fechaTrasladoComite | date:'dd/MM/yyyy HH:mm' }}</span>
                      </div>
                    }
                    @if (solicitud()?.fechaDecisionComite) {
                      <div class="info-row">
                        <span class="label">Decisión Comité:</span>
                        <span>{{ solicitud()?.fechaDecisionComite | date:'dd/MM/yyyy HH:mm' }}</span>
                      </div>
                    }
                  </div>
                </mat-card-content>
              </mat-card>

              @if (solicitud()?.observaciones || solicitud()?.motivoRechazo || solicitud()?.observacionesComite) {
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Observaciones</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    @if (solicitud()?.observaciones) {
                      <p><strong>Observaciones generales:</strong> {{ solicitud()?.observaciones }}</p>
                    }
                    @if (solicitud()?.motivoRechazo) {
                      <p class="rechazo"><strong>Motivo de rechazo:</strong> {{ solicitud()?.motivoRechazo }}</p>
                    }
                    @if (solicitud()?.observacionesComite) {
                      <p class="comite"><strong>Observaciones del Comité:</strong> {{ solicitud()?.observacionesComite }}</p>
                    }
                  </mat-card-content>
                </mat-card>
              }

              @if (solicitud()?.analisisAsesor) {
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Análisis del Asesor</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <p>{{ solicitud()?.analisisAsesor }}</p>
                    @if (solicitud()?.capacidadPago) {
                      <div class="info-row">
                        <span class="label">Capacidad de Pago:</span>
                        <span class="amount">{{ solicitud()?.capacidadPago | currency:'USD':'symbol':'1.2-2' }}</span>
                      </div>
                    }
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </mat-tab>

          <mat-tab label="Historial">
            <div class="tab-content">
              <table mat-table [dataSource]="historial()" class="full-width">
                <ng-container matColumnDef="fecha">
                  <th mat-header-cell *matHeaderCellDef>Fecha</th>
                  <td mat-cell *matCellDef="let item">{{ item.fechaCambio | date:'dd/MM/yyyy HH:mm' }}</td>
                </ng-container>

                <ng-container matColumnDef="estadoAnterior">
                  <th mat-header-cell *matHeaderCellDef>Estado Anterior</th>
                  <td mat-cell *matCellDef="let item">{{ item.estadoAnterior?.nombre || '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="estadoNuevo">
                  <th mat-header-cell *matHeaderCellDef>Estado Nuevo</th>
                  <td mat-cell *matCellDef="let item">
                    <mat-chip [ngClass]="getEstadoClass(item.estadoNuevo?.codigo)">
                      {{ item.estadoNuevo?.nombre }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="usuario">
                  <th mat-header-cell *matHeaderCellDef>Usuario</th>
                  <td mat-cell *matCellDef="let item">{{ item.nombreUsuario || '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="observacion">
                  <th mat-header-cell *matHeaderCellDef>Observación</th>
                  <td mat-cell *matCellDef="let item">{{ item.observacion || '-' }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="historialColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: historialColumns"></tr>
              </table>

              @if (historial().length === 0) {
                <div class="empty">
                  <p>No hay historial de cambios</p>
                </div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [
    `
      .container { padding: 16px; max-width: 1200px; margin: 0 auto; }
      .header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
      .header h1 { margin: 0; }
      .spacer { flex: 1; }
      .loading { display: flex; justify-content: center; padding: 48px; }
      .actions-bar { display: flex; gap: 8px; margin-bottom: 16px; }
      .tab-content { padding: 16px; }
      .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin: 16px 0; }
      .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
      .info-row .label { font-weight: 500; color: #666; }
      .amount { font-size: 1.2em; font-weight: 600; color: #1976d2; }
      .dates-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; }
      .full-width { width: 100%; }
      .empty { text-align: center; padding: 32px; color: #666; }
      .rechazo { color: #f44336; }
      .comite { color: #ff9800; }
      .aprobado-card { background: #e8f5e9; }
      mat-divider { margin: 16px 0; }

      /* Clases de estado basadas en códigos */
      mat-chip.estado-registrada { background-color: #2196f3 !important; color: white !important; }
      mat-chip.estado-analizada { background-color: #ff9800 !important; color: white !important; }
      mat-chip.estado-en_comite { background-color: #673ab7 !important; color: white !important; }
      mat-chip.estado-observada { background-color: #ff5722 !important; color: white !important; }
      mat-chip.estado-denegada { background-color: #f44336 !important; color: white !important; }
      mat-chip.estado-aprobada { background-color: #4caf50 !important; color: white !important; }
      mat-chip.estado-desembolsada { background-color: #00bcd4 !important; color: white !important; }
    `,
  ],
})
export class SolicitudDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private solicitudService = inject(SolicitudService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  isLoading = signal(true);
  solicitud = signal<Solicitud | null>(null);
  historial = signal<SolicitudHistorial[]>([]);

  historialColumns = ['fecha', 'estadoAnterior', 'estadoNuevo', 'usuario', 'observacion'];

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadSolicitud(+id);
    }
  }

  loadSolicitud(id: number): void {
    this.isLoading.set(true);
    this.solicitudService.getById(id).subscribe({
      next: (solicitud) => {
        this.solicitud.set(solicitud);
        this.historial.set(solicitud.historial || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar solicitud', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/creditos/solicitudes']);
      },
    });
  }

  getEstadoClass(codigoEstado?: string): string {
    if (!codigoEstado) return '';
    return 'estado-' + codigoEstado.toLowerCase();
  }

  getDestinoLabel(destino: string): string {
    return DESTINO_CREDITO_LABELS[destino as keyof typeof DESTINO_CREDITO_LABELS] || destino;
  }

  /**
   * Puede editar si está en REGISTRADA o OBSERVADA
   */
  puedeEditar(): boolean {
    const codigo = this.solicitud()?.estado?.codigo;
    return codigo === CODIGO_ESTADO_SOLICITUD.REGISTRADA ||
           codigo === CODIGO_ESTADO_SOLICITUD.OBSERVADA;
  }

  /**
   * Puede trasladar a comité si está en ANALIZADA
   */
  puedeTrasladarComite(): boolean {
    return this.solicitud()?.estado?.codigo === CODIGO_ESTADO_SOLICITUD.ANALIZADA;
  }

  /**
   * Puede decidir en comité si está EN_COMITE
   */
  puedeDecidirComite(): boolean {
    return this.solicitud()?.estado?.codigo === CODIGO_ESTADO_SOLICITUD.EN_COMITE;
  }

  editar(): void {
    this.router.navigate(['/creditos/solicitudes', this.solicitud()?.id, 'editar']);
  }

  trasladarAComite(): void {
    const observacion = prompt('Ingrese una observación para el comité (opcional):');
    this.solicitudService
      .trasladarAComite(this.solicitud()!.id, {
        observacionAsesor: observacion || undefined,
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Solicitud trasladada al comité exitosamente', 'Cerrar', { duration: 3000 });
          this.loadSolicitud(this.solicitud()!.id);
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Error al trasladar a comité', 'Cerrar', { duration: 3000 });
        },
      });
  }

  abrirDecisionComite(): void {
    const dialogRef = this.dialog.open(DecisionComiteDialogComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: { solicitud: this.solicitud() },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Decisión registrada exitosamente', 'Cerrar', { duration: 3000 });
        this.loadSolicitud(this.solicitud()!.id);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/creditos/solicitudes']);
  }
}
