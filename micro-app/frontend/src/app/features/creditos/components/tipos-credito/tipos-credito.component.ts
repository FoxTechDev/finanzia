import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TipoCreditoService } from '../../services/tipo-credito.service';
import { LineaCreditoService } from '../../services/linea-credito.service';
import { TipoCredito, LineaCredito } from '@core/models/credito.model';
import { TipoCreditoDialogComponent } from './tipo-credito-dialog.component';

@Component({
  selector: 'app-tipos-credito',
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
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    CurrencyPipe,
    DecimalPipe,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Tipos de Crédito</h1>
        <div class="header-actions">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Filtrar por línea</mat-label>
            <mat-select [(ngModel)]="selectedLinea" (selectionChange)="loadData()">
              <mat-option [value]="null">Todas las líneas</mat-option>
              @for (linea of lineas(); track linea.id) {
                <mat-option [value]="linea.id">{{ linea.nombre }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <button mat-fab color="primary" (click)="openDialog()" matTooltip="Nuevo tipo">
            <mat-icon>add</mat-icon>
          </button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <mat-card-content>
            <div class="table-responsive">
              <table mat-table [dataSource]="tipos()" class="full-width">
                <ng-container matColumnDef="codigo">
                  <th mat-header-cell *matHeaderCellDef>Código</th>
                  <td mat-cell *matCellDef="let item">{{ item.codigo }}</td>
                </ng-container>

                <ng-container matColumnDef="nombre">
                  <th mat-header-cell *matHeaderCellDef>Nombre</th>
                  <td mat-cell *matCellDef="let item">{{ item.nombre }}</td>
                </ng-container>

                <ng-container matColumnDef="lineaCredito">
                  <th mat-header-cell *matHeaderCellDef>Línea</th>
                  <td mat-cell *matCellDef="let item">{{ item.lineaCredito?.nombre || '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="tasaInteres">
                  <th mat-header-cell *matHeaderCellDef>Tasa (%)</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.tasaInteresMinima | number:'1.2-2' }} - {{ item.tasaInteresMaxima | number:'1.2-2' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="montos">
                  <th mat-header-cell *matHeaderCellDef>Montos ($)</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.montoMinimo | currency:'USD':'symbol':'1.0-0' }} - {{ item.montoMaximo | currency:'USD':'symbol':'1.0-0' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="plazos">
                  <th mat-header-cell *matHeaderCellDef>Plazos</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.plazoMinimo }} - {{ item.plazoMaximo }} meses
                  </td>
                </ng-container>

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

                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let item">
                    <button mat-icon-button color="primary" (click)="openDialog(item)" matTooltip="Editar">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="confirmDelete(item)" matTooltip="Eliminar">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            </div>

            @if (tipos().length === 0) {
              <div class="empty">
                <mat-icon>credit_card</mat-icon>
                <p>No hay tipos de crédito registrados</p>
                <button mat-raised-button color="primary" (click)="openDialog()">
                  Agregar tipo de crédito
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
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        flex-wrap: wrap;
        gap: 16px;
      }
      .header h1 {
        margin: 0;
      }
      .header-actions {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .filter-field {
        width: 200px;
      }
      .loading {
        display: flex;
        justify-content: center;
        padding: 48px;
      }
      .full-width {
        width: 100%;
      }
      .table-responsive {
        overflow-x: auto;
      }
      .empty {
        text-align: center;
        padding: 48px;
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
      mat-chip.activo {
        background-color: #4caf50 !important;
        color: white !important;
      }
      mat-chip.inactivo {
        background-color: #9e9e9e !important;
        color: white !important;
      }
    `,
  ],
})
export class TiposCreditoComponent implements OnInit {
  private service = inject(TipoCreditoService);
  private lineaService = inject(LineaCreditoService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  tipos = signal<TipoCredito[]>([]);
  lineas = signal<LineaCredito[]>([]);
  isLoading = signal(true);
  selectedLinea: number | null = null;
  displayedColumns = ['codigo', 'nombre', 'lineaCredito', 'tasaInteres', 'montos', 'plazos', 'activo', 'acciones'];

  ngOnInit(): void {
    this.loadLineas();
    this.loadData();
  }

  loadLineas(): void {
    this.lineaService.getAll().subscribe({
      next: (data) => this.lineas.set(data),
      error: () => this.snackBar.open('Error al cargar líneas', 'Cerrar', { duration: 3000 }),
    });
  }

  loadData(): void {
    this.isLoading.set(true);
    this.service.getAll(this.selectedLinea ?? undefined).subscribe({
      next: (data) => {
        this.tipos.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar tipos de crédito', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  openDialog(tipo?: TipoCredito): void {
    const dialogRef = this.dialog.open(TipoCreditoDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: tipo || null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadData();
      }
    });
  }

  confirmDelete(tipo: TipoCredito): void {
    if (confirm(`¿Está seguro de eliminar el tipo "${tipo.nombre}"?`)) {
      this.service.delete(tipo.id).subscribe({
        next: () => {
          this.snackBar.open('Tipo eliminado exitosamente', 'Cerrar', { duration: 3000 });
          this.loadData();
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.message || 'Error al eliminar el tipo',
            'Cerrar',
            { duration: 3000 }
          );
        },
      });
    }
  }
}
