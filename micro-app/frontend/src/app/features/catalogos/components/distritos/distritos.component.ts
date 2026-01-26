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
import { Departamento, Municipio, Distrito } from '@core/models/cliente.model';
import { DistritoDialogComponent } from './distrito-dialog.component';

@Component({
  selector: 'app-distritos',
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
        <h1>Distritos</h1>
        <button mat-fab color="primary" (click)="openDialog()" [disabled]="municipios().length === 0">
          <mat-icon>add</mat-icon>
        </button>
      </div>

      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>Departamento</mat-label>
            <mat-select [(ngModel)]="selectedDepartamento" (selectionChange)="onDepartamentoChange($event.value)">
              <mat-option [value]="null">Todos</mat-option>
              @for (dep of departamentos(); track dep.id) {
                <mat-option [value]="dep.id">{{ dep.nombre }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Municipio</mat-label>
            <mat-select [(ngModel)]="selectedMunicipio" (selectionChange)="onMunicipioChange($event.value)">
              <mat-option [value]="null">Todos</mat-option>
              @for (mun of municipiosFiltrados(); track mun.id) {
                <mat-option [value]="mun.id">{{ mun.nombre }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      @if (isLoading()) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <mat-card-content>
            <table mat-table [dataSource]="distritos()" class="full-width">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let item">{{ item.id }}</td>
              </ng-container>

              <ng-container matColumnDef="nombre">
                <th mat-header-cell *matHeaderCellDef>Nombre</th>
                <td mat-cell *matCellDef="let item">{{ item.nombre }}</td>
              </ng-container>

              <ng-container matColumnDef="municipio">
                <th mat-header-cell *matHeaderCellDef>Municipio</th>
                <td mat-cell *matCellDef="let item">{{ item.municipio?.nombre || '-' }}</td>
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

            @if (distritos().length === 0) {
              <div class="empty">
                <mat-icon>folder_off</mat-icon>
                <p>No hay distritos registrados</p>
                @if (municipios().length > 0) {
                  <button mat-raised-button color="primary" (click)="openDialog()">
                    Agregar distrito
                  </button>
                } @else {
                  <p class="hint">Primero debe agregar municipios</p>
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
    .filters { display: flex; gap: 16px; flex-wrap: wrap; }
    .filters mat-form-field { flex: 1; min-width: 200px; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .full-width { width: 100%; }
    .empty { text-align: center; padding: 48px; }
    .empty mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; }
    .empty p { color: #666; margin: 16px 0; }
    .hint { font-size: 12px; color: #999; }
  `],
})
export class DistritosComponent implements OnInit {
  private ubicacionService = inject(UbicacionService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  departamentos = signal<Departamento[]>([]);
  municipios = signal<Municipio[]>([]);
  municipiosFiltrados = signal<Municipio[]>([]);
  distritos = signal<Distrito[]>([]);
  isLoading = signal(true);
  selectedDepartamento: number | null = null;
  selectedMunicipio: number | null = null;
  displayedColumns = ['id', 'nombre', 'municipio', 'acciones'];

  ngOnInit(): void {
    this.loadDepartamentos();
    this.loadMunicipios();
    this.loadDistritos();
  }

  loadDepartamentos(): void {
    this.ubicacionService.getDepartamentos().subscribe({
      next: (data) => this.departamentos.set(data),
    });
  }

  loadMunicipios(): void {
    this.ubicacionService.getMunicipios().subscribe({
      next: (data) => {
        this.municipios.set(data);
        this.municipiosFiltrados.set(data);
      },
    });
  }

  loadDistritos(municipioId?: number): void {
    this.isLoading.set(true);
    this.ubicacionService.getDistritos(municipioId).subscribe({
      next: (data) => {
        this.distritos.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar distritos', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  onDepartamentoChange(departamentoId: number | null): void {
    this.selectedMunicipio = null;
    if (departamentoId) {
      this.municipiosFiltrados.set(
        this.municipios().filter((m) => m.departamentoId === departamentoId)
      );
    } else {
      this.municipiosFiltrados.set(this.municipios());
    }
    this.loadDistritos();
  }

  onMunicipioChange(municipioId: number | null): void {
    this.loadDistritos(municipioId || undefined);
  }

  openDialog(distrito?: Distrito): void {
    const dialogRef = this.dialog.open(DistritoDialogComponent, {
      width: '400px',
      data: {
        distrito,
        departamentos: this.departamentos(),
        municipios: this.municipios(),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadDistritos(this.selectedMunicipio || undefined);
      }
    });
  }
}
