import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { UbicacionService } from '../../../clientes/services/ubicacion.service';
import { Departamento } from '@core/models/cliente.model';
import { DepartamentoDialogComponent } from './departamento-dialog.component';

@Component({
  selector: 'app-departamentos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Departamentos</h1>
        <button mat-fab color="primary" (click)="openDialog()">
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
            <table mat-table [dataSource]="departamentos()" class="full-width">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let item">{{ item.id }}</td>
              </ng-container>

              <ng-container matColumnDef="nombre">
                <th mat-header-cell *matHeaderCellDef>Nombre</th>
                <td mat-cell *matCellDef="let item">{{ item.nombre }}</td>
              </ng-container>

              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let item">
                  <button mat-icon-button color="primary" (click)="openDialog(item)">
                    <mat-icon>edit</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>

            @if (departamentos().length === 0) {
              <div class="empty">
                <mat-icon>folder_off</mat-icon>
                <p>No hay departamentos registrados</p>
                <button mat-raised-button color="primary" (click)="openDialog()">
                  Agregar departamento
                </button>
              </div>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .container { padding: 16px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .header h1 { margin: 0; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .full-width { width: 100%; }
    .empty { text-align: center; padding: 48px; }
    .empty mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; }
    .empty p { color: #666; margin: 16px 0; }
  `],
})
export class DepartamentosComponent implements OnInit {
  private ubicacionService = inject(UbicacionService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  departamentos = signal<Departamento[]>([]);
  isLoading = signal(true);
  displayedColumns = ['id', 'nombre', 'acciones'];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.ubicacionService.getDepartamentos().subscribe({
      next: (data) => {
        this.departamentos.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar departamentos', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  openDialog(departamento?: Departamento): void {
    const dialogRef = this.dialog.open(DepartamentoDialogComponent, {
      width: '400px',
      data: departamento || null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadData();
      }
    });
  }
}
