import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { DesembolsoService } from '../../../services/desembolso.service';
import { Solicitud } from '@core/models/credito.model';
import { CrearDesembolsoDialogComponent } from '../crear-desembolso-dialog/crear-desembolso-dialog.component';

@Component({
  selector: 'app-bandeja-desembolso',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDividerModule,
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="header-icon">payments</mat-icon>
            Desembolso de Créditos
          </mat-card-title>
          <mat-card-subtitle>
            Solicitudes autorizadas pendientes de desembolso
          </mat-card-subtitle>
        </mat-card-header>

        <mat-divider></mat-divider>

        <mat-card-content>
          <!-- Estadísticas -->
          <div class="stats-container">
            <div class="stat-card">
              <div class="stat-value">{{ solicitudes().length }}</div>
              <div class="stat-label">Pendientes</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ montoTotal() | currency:'USD':'symbol':'1.2-2' }}</div>
              <div class="stat-label">Monto Total</div>
            </div>
          </div>

          @if (loading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Cargando solicitudes...</p>
            </div>
          } @else if (solicitudes().length === 0) {
            <div class="empty-state">
              <mat-icon>check_circle</mat-icon>
              <p>No hay solicitudes pendientes de desembolso</p>
            </div>
          } @else {
            <table mat-table [dataSource]="solicitudes()" class="full-width">
              <!-- Número Solicitud -->
              <ng-container matColumnDef="numeroSolicitud">
                <th mat-header-cell *matHeaderCellDef>N° Solicitud</th>
                <td mat-cell *matCellDef="let row">
                  <strong>{{ row.numeroSolicitud }}</strong>
                </td>
              </ng-container>

              <!-- Cliente -->
              <ng-container matColumnDef="cliente">
                <th mat-header-cell *matHeaderCellDef>Cliente</th>
                <td mat-cell *matCellDef="let row">
                  @if (row.persona) {
                    {{ row.persona.nombre }} {{ row.persona.apellido }}
                    <br>
                    <small class="text-muted">{{ row.persona.numeroDui }}</small>
                  } @else {
                    <span class="text-muted">Sin datos</span>
                  }
                </td>
              </ng-container>

              <!-- Tipo Crédito -->
              <ng-container matColumnDef="tipoCredito">
                <th mat-header-cell *matHeaderCellDef>Tipo Crédito</th>
                <td mat-cell *matCellDef="let row">
                  {{ row.tipoCredito?.nombre || 'N/A' }}
                </td>
              </ng-container>

              <!-- Monto -->
              <ng-container matColumnDef="monto">
                <th mat-header-cell *matHeaderCellDef>Monto Autorizado</th>
                <td mat-cell *matCellDef="let row">
                  <strong class="amount">
                    {{ (row.montoAprobado || row.montoSolicitado) | currency:'USD':'symbol':'1.2-2' }}
                  </strong>
                </td>
              </ng-container>

              <!-- Plazo -->
              <ng-container matColumnDef="plazo">
                <th mat-header-cell *matHeaderCellDef>Plazo</th>
                <td mat-cell *matCellDef="let row">
                  {{ row.plazoAprobado || row.plazoSolicitado }} meses
                </td>
              </ng-container>

              <!-- Tasa -->
              <ng-container matColumnDef="tasa">
                <th mat-header-cell *matHeaderCellDef>Tasa</th>
                <td mat-cell *matCellDef="let row">
                  {{ (row.tasaInteresAprobada || row.tasaInteresPropuesta) }}%
                </td>
              </ng-container>

              <!-- Fecha Autorización -->
              <ng-container matColumnDef="fechaAutorizacion">
                <th mat-header-cell *matHeaderCellDef>Fecha Autorización</th>
                <td mat-cell *matCellDef="let row">
                  {{ row.fechaDecisionComite | date:'dd/MM/yyyy' }}
                </td>
              </ng-container>

              <!-- Acciones -->
              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let row">
                  <button
                    mat-raised-button
                    color="primary"
                    (click)="abrirDialogDesembolso(row)"
                    matTooltip="Desembolsar crédito"
                  >
                    <mat-icon>payment</mat-icon>
                    Desembolsar
                  </button>
                  <button
                    mat-icon-button
                    color="accent"
                    (click)="verDetalle(row)"
                    matTooltip="Ver detalle de solicitud"
                  >
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      padding: 24px;
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    .header-icon {
      margin-right: 8px;
      vertical-align: middle;
    }

    .stats-container {
      display: flex;
      gap: 24px;
      margin: 24px 0;
    }

    .stat-card {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 16px 24px;
      text-align: center;
      min-width: 150px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #1976d2;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      gap: 16px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #4caf50;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .text-muted {
      color: #888;
      font-size: 12px;
    }

    .amount {
      color: #2e7d32;
    }

    table {
      margin-top: 16px;
    }

    td.mat-mdc-cell {
      padding: 12px 8px;
    }

    th.mat-mdc-header-cell {
      background: #fafafa;
      font-weight: 600;
    }
  `],
})
export class BandejaDesembolsoComponent implements OnInit {
  private desembolsoService = inject(DesembolsoService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  solicitudes = signal<Solicitud[]>([]);
  loading = signal(true);

  displayedColumns = [
    'numeroSolicitud',
    'cliente',
    'tipoCredito',
    'monto',
    'plazo',
    'tasa',
    'fechaAutorizacion',
    'acciones',
  ];

  montoTotal = computed(() => {
    return this.solicitudes().reduce((sum, s) => {
      return sum + (s.montoAprobado || s.montoSolicitado);
    }, 0);
  });

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.loading.set(true);
    this.desembolsoService.getPendientes().subscribe({
      next: (data) => {
        this.solicitudes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando solicitudes:', err);
        this.snackBar.open('Error al cargar solicitudes', 'Cerrar', { duration: 3000 });
        this.loading.set(false);
      },
    });
  }

  abrirDialogDesembolso(solicitud: Solicitud): void {
    const dialogRef = this.dialog.open(CrearDesembolsoDialogComponent, {
      width: '900px',
      maxHeight: '90vh',
      data: { solicitud },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Desembolso realizado exitosamente', 'Cerrar', {
          duration: 5000,
          panelClass: ['success-snackbar'],
        });
        this.cargarSolicitudes();
      }
    });
  }

  verDetalle(solicitud: Solicitud): void {
    this.router.navigate(['/creditos/solicitudes', solicitud.id]);
  }
}
