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
import { LineaCreditoService } from '../../services/linea-credito.service';
import { LineaCredito } from '@core/models/credito.model';
import { LineaCreditoDialogComponent } from './linea-credito-dialog.component';

@Component({
  selector: 'app-lineas-credito',
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
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Líneas de Crédito</h1>
        <button mat-fab color="primary" (click)="openDialog()" matTooltip="Nueva línea">
          <mat-icon>add</mat-icon>
        </button>
      </div>

      @if (isLoading()) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <mat-card-content>
            <table mat-table [dataSource]="lineas()" class="full-width">
              <ng-container matColumnDef="codigo">
                <th mat-header-cell *matHeaderCellDef>Código</th>
                <td mat-cell *matCellDef="let item">{{ item.codigo }}</td>
              </ng-container>

              <ng-container matColumnDef="nombre">
                <th mat-header-cell *matHeaderCellDef>Nombre</th>
                <td mat-cell *matCellDef="let item">{{ item.nombre }}</td>
              </ng-container>

              <ng-container matColumnDef="descripcion">
                <th mat-header-cell *matHeaderCellDef>Descripción</th>
                <td mat-cell *matCellDef="let item">{{ item.descripcion || '-' }}</td>
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

            @if (lineas().length === 0) {
              <div class="empty">
                <mat-icon>account_balance</mat-icon>
                <p>No hay líneas de crédito registradas</p>
                <button mat-raised-button color="primary" (click)="openDialog()">
                  Agregar línea de crédito
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
      }
      .header h1 {
        margin: 0;
      }
      .loading {
        display: flex;
        justify-content: center;
        padding: 48px;
      }
      .full-width {
        width: 100%;
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
export class LineasCreditoComponent implements OnInit {
  private service = inject(LineaCreditoService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  lineas = signal<LineaCredito[]>([]);
  isLoading = signal(true);
  displayedColumns = ['codigo', 'nombre', 'descripcion', 'activo', 'acciones'];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.service.getAll().subscribe({
      next: (data) => {
        this.lineas.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar líneas de crédito', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  openDialog(linea?: LineaCredito): void {
    const dialogRef = this.dialog.open(LineaCreditoDialogComponent, {
      width: '450px',
      data: linea || null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadData();
      }
    });
  }

  confirmDelete(linea: LineaCredito): void {
    if (confirm(`¿Está seguro de eliminar la línea "${linea.nombre}"?`)) {
      this.service.delete(linea.id).subscribe({
        next: () => {
          this.snackBar.open('Línea eliminada exitosamente', 'Cerrar', { duration: 3000 });
          this.loadData();
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.message || 'Error al eliminar la línea',
            'Cerrar',
            { duration: 3000 }
          );
        },
      });
    }
  }
}
