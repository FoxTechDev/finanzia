import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ClasificacionPrestamoService } from '../../services/clasificacion-prestamo.service';
import { ClasificacionPrestamo } from '@core/models/credito.model';
import { ClasificacionPrestamoDialogComponent } from './clasificacion-prestamo-dialog.component';

@Component({
  selector: 'app-clasificacion-prestamo',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  template: `
    <div class="container">
      <div class="header">
        <div class="header-info">
          <h1>Clasificaciones de Préstamos</h1>
          <p class="subtitle">Configuración de categorías NCB-022 para calificación de cartera</p>
        </div>
        <div class="header-actions">
          <button
            mat-raised-button
            color="accent"
            (click)="inicializarNCB022()"
            [disabled]="isInitializing()"
            matTooltip="Cargar las clasificaciones NCB-022 estándar"
          >
            @if (isInitializing()) {
              <mat-spinner diameter="20" style="display: inline-block; margin-right: 8px;"></mat-spinner>
            } @else {
              <mat-icon>settings_backup_restore</mat-icon>
            }
            Inicializar NCB-022
          </button>
          <button mat-fab color="primary" (click)="openDialog()" matTooltip="Nueva clasificación">
            <mat-icon>add</mat-icon>
          </button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando clasificaciones...</p>
        </div>
      } @else {
        <mat-card>
          <mat-card-content>
            <div class="table-responsive">
              <table mat-table [dataSource]="clasificaciones()" class="full-width">

                <!-- Código -->
                <ng-container matColumnDef="codigo">
                  <th mat-header-cell *matHeaderCellDef>Código</th>
                  <td mat-cell *matCellDef="let item">
                    <span class="codigo-badge" [ngClass]="'codigo-' + item.codigo.toLowerCase()">
                      {{ item.codigo }}
                    </span>
                  </td>
                </ng-container>

                <!-- Nombre -->
                <ng-container matColumnDef="nombre">
                  <th mat-header-cell *matHeaderCellDef>Nombre</th>
                  <td mat-cell *matCellDef="let item">
                    <strong>{{ item.nombre }}</strong>
                  </td>
                </ng-container>

                <!-- Descripción -->
                <ng-container matColumnDef="descripcion">
                  <th mat-header-cell *matHeaderCellDef>Descripción</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.descripcion || '-' }}
                  </td>
                </ng-container>

                <!-- Rango de Mora -->
                <ng-container matColumnDef="rangoMora">
                  <th mat-header-cell *matHeaderCellDef>Rango de Mora (días)</th>
                  <td mat-cell *matCellDef="let item">
                    <span class="mora-range">
                      {{ item.diasMoraMinimo }} - {{ item.diasMoraMaximo !== null ? item.diasMoraMaximo : '∞' }}
                    </span>
                  </td>
                </ng-container>

                <!-- Provisión -->
                <ng-container matColumnDef="provision">
                  <th mat-header-cell *matHeaderCellDef>Provisión</th>
                  <td mat-cell *matCellDef="let item">
                    <span class="provision-badge" [ngClass]="getProvisionClass(item.porcentajeProvision)">
                      {{ item.porcentajeProvision }}%
                    </span>
                  </td>
                </ng-container>

                <!-- Orden -->
                <ng-container matColumnDef="orden">
                  <th mat-header-cell *matHeaderCellDef>Orden</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.orden }}
                  </td>
                </ng-container>

                <!-- Estado -->
                <ng-container matColumnDef="activo">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let item">
                    <mat-chip-set>
                      <mat-chip [class.activo]="item.activo" [class.inactivo]="!item.activo">
                        {{ item.activo ? 'Activo' : 'Inactivo' }}
                      </mat-chip>
                    </mat-chip-set>
                  </td>
                </ng-container>

                <!-- Acciones -->
                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let item">
                    <button
                      mat-icon-button
                      color="primary"
                      (click)="openDialog(item)"
                      matTooltip="Editar"
                    >
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      color="warn"
                      (click)="confirmDelete(item)"
                      matTooltip="Eliminar"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns" class="table-row"></tr>
              </table>
            </div>

            @if (clasificaciones().length === 0) {
              <div class="empty">
                <mat-icon>category</mat-icon>
                <p>No hay clasificaciones registradas</p>
                <p class="hint">Utiliza el botón "Inicializar NCB-022" para cargar las clasificaciones estándar</p>
                <div class="empty-actions">
                  <button mat-raised-button color="accent" (click)="inicializarNCB022()">
                    <mat-icon>settings_backup_restore</mat-icon>
                    Inicializar NCB-022
                  </button>
                  <button mat-raised-button color="primary" (click)="openDialog()">
                    <mat-icon>add</mat-icon>
                    Agregar clasificación manual
                  </button>
                </div>
              </div>
            }
          </mat-card-content>
        </mat-card>

        <!-- Tarjeta informativa -->
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>info</mat-icon>
              Información sobre NCB-022
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>
              La Norma de Clasificación de Cartera (NCB-022) establece las categorías de riesgo crediticio
              que deben aplicarse a los préstamos según su nivel de mora y probabilidad de recuperación.
            </p>
            <mat-divider></mat-divider>
            <div class="ncb-categories">
              <div class="category-info">
                <span class="codigo-badge codigo-a">A</span>
                <span>Normal (0-30 días): Provisión 1%</span>
              </div>
              <div class="category-info">
                <span class="codigo-badge codigo-b">B</span>
                <span>Subnormal (31-60 días): Provisión 5%</span>
              </div>
              <div class="category-info">
                <span class="codigo-badge codigo-c">C</span>
                <span>Deficiente (61-90 días): Provisión 20%</span>
              </div>
              <div class="category-info">
                <span class="codigo-badge codigo-d">D</span>
                <span>Difícil Recuperación (91-180 días): Provisión 50%</span>
              </div>
              <div class="category-info">
                <span class="codigo-badge codigo-e">E</span>
                <span>Irrecuperable (+180 días): Provisión 100%</span>
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
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      gap: 16px;
    }

    .header-info {
      flex: 1;
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

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
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

    .full-width {
      width: 100%;
    }

    .table-row {
      transition: background-color 0.2s;
    }

    .table-row:hover {
      background-color: #f5f5f5;
    }

    .codigo-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      font-weight: 700;
      font-size: 18px;
      color: white;
    }

    .codigo-badge.codigo-a {
      background-color: #4caf50;
    }

    .codigo-badge.codigo-b {
      background-color: #8bc34a;
    }

    .codigo-badge.codigo-c {
      background-color: #ff9800;
    }

    .codigo-badge.codigo-d {
      background-color: #ff5722;
    }

    .codigo-badge.codigo-e {
      background-color: #f44336;
    }

    .mora-range {
      font-weight: 500;
      color: #666;
    }

    .provision-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
    }

    .provision-badge.provision-low {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .provision-badge.provision-medium {
      background-color: #fff3e0;
      color: #e65100;
    }

    .provision-badge.provision-high {
      background-color: #ffebee;
      color: #c62828;
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
      margin: 8px 0;
      font-size: 16px;
    }

    .empty .hint {
      font-size: 14px;
      color: #999;
    }

    .empty-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-top: 24px;
    }

    mat-chip.activo {
      background-color: #4caf50 !important;
      color: white !important;
    }

    mat-chip.inactivo {
      background-color: #9e9e9e !important;
      color: white !important;
    }

    .info-card {
      margin-top: 16px;
      background-color: #e3f2fd;
    }

    .info-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1976d2;
    }

    .info-card mat-divider {
      margin: 16px 0;
    }

    .ncb-categories {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 16px;
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
    }

    .category-info .codigo-badge {
      width: 32px;
      height: 32px;
      font-size: 14px;
    }

    @media (max-width: 960px) {
      .header {
        flex-direction: column;
        align-items: stretch;
      }

      .header-actions {
        justify-content: space-between;
      }

      .empty-actions {
        flex-direction: column;
      }

      .empty-actions button {
        width: 100%;
      }
    }
  `],
})
export class ClasificacionPrestamoComponent implements OnInit {
  private service = inject(ClasificacionPrestamoService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  clasificaciones = signal<ClasificacionPrestamo[]>([]);
  isLoading = signal(true);
  isInitializing = signal(false);

  displayedColumns = [
    'codigo',
    'nombre',
    'descripcion',
    'rangoMora',
    'provision',
    'orden',
    'activo',
    'acciones',
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.service.getAll().subscribe({
      next: (data) => {
        this.clasificaciones.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.snackBar.open(
          err.error?.message || 'Error al cargar clasificaciones',
          'Cerrar',
          { duration: 3000 }
        );
        this.isLoading.set(false);
      },
    });
  }

  openDialog(clasificacion?: ClasificacionPrestamo): void {
    const dialogRef = this.dialog.open(ClasificacionPrestamoDialogComponent, {
      width: '600px',
      data: clasificacion || null,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadData();
      }
    });
  }

  confirmDelete(clasificacion: ClasificacionPrestamo): void {
    const mensaje = `¿Está seguro de eliminar la clasificación "${clasificacion.codigo} - ${clasificacion.nombre}"?\n\nEsta acción no se puede deshacer.`;

    if (confirm(mensaje)) {
      this.service.delete(clasificacion.id).subscribe({
        next: () => {
          this.snackBar.open('Clasificación eliminada exitosamente', 'Cerrar', { duration: 3000 });
          this.loadData();
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.message || 'Error al eliminar la clasificación',
            'Cerrar',
            { duration: 3000 }
          );
        },
      });
    }
  }

  inicializarNCB022(): void {
    const mensaje = 'Esta acción cargará las clasificaciones NCB-022 estándar. Las clasificaciones existentes no se verán afectadas.\n\n¿Desea continuar?';

    if (confirm(mensaje)) {
      this.isInitializing.set(true);
      this.service.inicializarNCB022().subscribe({
        next: (response) => {
          this.snackBar.open(response.message, 'Cerrar', { duration: 3000 });
          this.isInitializing.set(false);
          this.loadData();
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.message || 'Error al inicializar clasificaciones',
            'Cerrar',
            { duration: 3000 }
          );
          this.isInitializing.set(false);
        },
      });
    }
  }

  getProvisionClass(porcentaje: number): string {
    if (porcentaje < 10) return 'provision-low';
    if (porcentaje < 50) return 'provision-medium';
    return 'provision-high';
  }
}
