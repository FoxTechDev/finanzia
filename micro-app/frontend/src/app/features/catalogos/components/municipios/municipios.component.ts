import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { UbicacionService } from '../../../clientes/services/ubicacion.service';
import { Departamento, Municipio } from '@core/models/cliente.model';
import { MunicipioDialogComponent } from './municipio-dialog.component';

@Component({
  selector: 'app-municipios',
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
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Municipios</h1>
        <button mat-fab color="primary" (click)="openDialog()" [disabled]="departamentos().length === 0">
          <mat-icon>add</mat-icon>
        </button>
      </div>

      <mat-card class="filter-card">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Filtrar por Departamento</mat-label>
          <mat-select [(ngModel)]="selectedDepartamento" (selectionChange)="onDepartamentoChange($event.value)">
            <mat-option [value]="null">Todos los departamentos</mat-option>
            @for (dep of departamentos(); track dep.id) {
              <mat-option [value]="dep.id">{{ dep.nombre }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </mat-card>

      @if (isLoading()) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <mat-card-content>
            <table mat-table [dataSource]="municipios()" class="full-width">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let item">{{ item.id }}</td>
              </ng-container>

              <ng-container matColumnDef="nombre">
                <th mat-header-cell *matHeaderCellDef>Nombre</th>
                <td mat-cell *matCellDef="let item">{{ item.nombre }}</td>
              </ng-container>

              <ng-container matColumnDef="departamento">
                <th mat-header-cell *matHeaderCellDef>Departamento</th>
                <td mat-cell *matCellDef="let item">{{ item.departamento?.nombre || '-' }}</td>
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

            @if (municipios().length === 0) {
              <div class="empty">
                <mat-icon>folder_off</mat-icon>
                <p>No hay municipios registrados</p>
                @if (departamentos().length > 0) {
                  <button mat-raised-button color="primary" (click)="openDialog()">
                    Agregar municipio
                  </button>
                } @else {
                  <p class="hint">Primero debe agregar departamentos</p>
                }
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
    .filter-card { margin-bottom: 16px; padding: 16px; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .full-width { width: 100%; }
    .empty { text-align: center; padding: 48px; }
    .empty mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; }
    .empty p { color: #666; margin: 16px 0; }
    .hint { font-size: 12px; color: #999; }
  `],
})
export class MunicipiosComponent implements OnInit {
  private ubicacionService = inject(UbicacionService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  departamentos = signal<Departamento[]>([]);
  municipios = signal<Municipio[]>([]);
  isLoading = signal(true);
  selectedDepartamento: number | null = null;
  displayedColumns = ['id', 'nombre', 'departamento', 'acciones'];

  ngOnInit(): void {
    this.loadDepartamentos();
    this.loadMunicipios();
  }

  loadDepartamentos(): void {
    this.ubicacionService.getDepartamentos().subscribe({
      next: (data) => this.departamentos.set(data),
    });
  }

  loadMunicipios(departamentoId?: number): void {
    this.isLoading.set(true);
    this.ubicacionService.getMunicipios(departamentoId).subscribe({
      next: (data) => {
        this.municipios.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar municipios', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  onDepartamentoChange(departamentoId: number | null): void {
    this.loadMunicipios(departamentoId || undefined);
  }

  openDialog(municipio?: Municipio): void {
    const dialogRef = this.dialog.open(MunicipioDialogComponent, {
      width: '400px',
      data: { municipio, departamentos: this.departamentos() },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadMunicipios(this.selectedDepartamento || undefined);
      }
    });
  }
}
