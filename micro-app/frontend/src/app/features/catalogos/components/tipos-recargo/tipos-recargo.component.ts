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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { TipoRecargoDialogComponent } from './tipo-recargo-dialog.component';

export interface TipoRecargo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipoCalculoDefault: 'FIJO' | 'PORCENTAJE';
  valorDefault: number;
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Component({
  selector: 'app-tipos-recargo',
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
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>add_shopping_cart</mat-icon>
            Tipos de Recargo
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <!-- Barra de herramientas -->
          <div class="toolbar">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar</mat-label>
              <input
                matInput
                [ngModel]="filtro()"
                (ngModelChange)="onFiltroChange($event)"
                placeholder="Buscar por código o nombre..."
              />
              @if (filtro()) {
                <button matSuffix mat-icon-button (click)="limpiarFiltro()">
                  <mat-icon>close</mat-icon>
                </button>
              }
            </mat-form-field>

            <button mat-raised-button color="primary" (click)="openDialog()">
              <mat-icon>add</mat-icon>
              Nuevo Tipo de Recargo
            </button>
          </div>

          @if (isLoading()) {
            <div class="loading">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else {
            <div class="table-responsive">
              <table
                mat-table
                [dataSource]="getDatosPaginados()"
                matSort
                (matSortChange)="onSortChange($event)"
                class="full-width"
              >
                <!-- Columna Código -->
                <ng-container matColumnDef="codigo">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Código</th>
                  <td mat-cell *matCellDef="let item">{{ item.codigo }}</td>
                </ng-container>

                <!-- Columna Nombre -->
                <ng-container matColumnDef="nombre">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
                  <td mat-cell *matCellDef="let item">{{ item.nombre }}</td>
                </ng-container>

                <!-- Columna Tipo de Cálculo -->
                <ng-container matColumnDef="tipoCalculoDefault">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Tipo Cálculo</th>
                  <td mat-cell *matCellDef="let item">
                    <mat-chip-set>
                      <mat-chip [ngClass]="item.tipoCalculoDefault === 'FIJO' ? 'chip-fijo' : 'chip-porcentaje'">
                        {{ item.tipoCalculoDefault }}
                      </mat-chip>
                    </mat-chip-set>
                  </td>
                </ng-container>

                <!-- Columna Valor Default -->
                <ng-container matColumnDef="valorDefault">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Valor Default</th>
                  <td mat-cell *matCellDef="let item">
                    @if (item.tipoCalculoDefault === 'PORCENTAJE') {
                      {{ item.valorDefault }}%
                    } @else {
                      $ {{ item.valorDefault | number:'1.2-2' }}
                    }
                  </td>
                </ng-container>

                <!-- Columna Estado -->
                <ng-container matColumnDef="activo">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Estado</th>
                  <td mat-cell *matCellDef="let item">
                    <mat-chip-set>
                      <mat-chip [ngClass]="item.activo ? 'chip-activo' : 'chip-inactivo'">
                        {{ item.activo ? 'Activo' : 'Inactivo' }}
                      </mat-chip>
                    </mat-chip-set>
                  </td>
                </ng-container>

                <!-- Columna Acciones -->
                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let item">
                    <button
                      mat-icon-button
                      color="primary"
                      matTooltip="Editar"
                      (click)="openDialog(item)"
                    >
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      [color]="item.activo ? 'warn' : 'accent'"
                      [matTooltip]="item.activo ? 'Desactivar' : 'Activar'"
                      (click)="toggleActivo(item)"
                    >
                      <mat-icon>{{ item.activo ? 'block' : 'check_circle' }}</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            </div>

            @if (tiposRecargoFiltrados().length === 0) {
              <div class="empty-state">
                <mat-icon>inbox</mat-icon>
                <p>No se encontraron tipos de recargo</p>
              </div>
            }

            <mat-paginator
              [length]="tiposRecargoFiltrados().length"
              [pageSize]="pageSize"
              [pageIndex]="pageIndex"
              [pageSizeOptions]="pageSizeOptions"
              (page)="onPageChange($event)"
              showFirstLastButtons
            ></mat-paginator>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 16px;
      }

      mat-card-header {
        margin-bottom: 16px;
      }

      mat-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        gap: 16px;
        flex-wrap: wrap;
      }

      .search-field {
        flex: 1;
        min-width: 250px;
        max-width: 400px;
      }

      .table-responsive {
        overflow-x: auto;
      }

      .full-width {
        width: 100%;
      }

      .loading {
        display: flex;
        justify-content: center;
        padding: 48px;
      }

      .empty-state {
        text-align: center;
        padding: 48px;
        color: #666;
      }

      .empty-state mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #ccc;
      }

      .chip-activo {
        background-color: #4caf50 !important;
        color: white !important;
      }

      .chip-inactivo {
        background-color: #9e9e9e !important;
        color: white !important;
      }

      .chip-fijo {
        background-color: #2196f3 !important;
        color: white !important;
      }

      .chip-porcentaje {
        background-color: #ff9800 !important;
        color: white !important;
      }
    `,
  ],
})
export class TiposRecargoComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  tiposRecargo = signal<TipoRecargo[]>([]);
  tiposRecargoFiltrados = signal<TipoRecargo[]>([]);
  isLoading = signal(true);
  filtro = signal('');

  displayedColumns = ['codigo', 'nombre', 'tipoCalculoDefault', 'valorDefault', 'activo', 'acciones'];

  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 50];

  sortColumn = 'nombre';
  sortDirection: 'asc' | 'desc' = 'asc';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.http.get<TipoRecargo[]>(`${environment.apiUrl}/tipos-recargo`).subscribe({
      next: (data) => {
        this.tiposRecargo.set(data);
        this.aplicarFiltros();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar tipos de recargo:', error);
        this.snackBar.open('Error al cargar tipos de recargo', 'Cerrar', {
          duration: 3000,
        });
        this.isLoading.set(false);
      },
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.tiposRecargo()];

    const filtroTexto = this.filtro().toLowerCase().trim();
    if (filtroTexto) {
      resultado = resultado.filter(
        (item) =>
          item.codigo.toLowerCase().includes(filtroTexto) ||
          item.nombre.toLowerCase().includes(filtroTexto)
      );
    }

    resultado.sort((a, b) => {
      const valorA = this.getValorOrdenamiento(a);
      const valorB = this.getValorOrdenamiento(b);
      const comparacion = valorA < valorB ? -1 : valorA > valorB ? 1 : 0;
      return this.sortDirection === 'asc' ? comparacion : -comparacion;
    });

    this.tiposRecargoFiltrados.set(resultado);
  }

  private getValorOrdenamiento(item: TipoRecargo): any {
    switch (this.sortColumn) {
      case 'codigo':
        return item.codigo.toLowerCase();
      case 'nombre':
        return item.nombre.toLowerCase();
      case 'tipoCalculoDefault':
        return item.tipoCalculoDefault;
      case 'valorDefault':
        return item.valorDefault;
      case 'activo':
        return item.activo ? 1 : 0;
      default:
        return item.nombre.toLowerCase();
    }
  }

  onFiltroChange(valor: string): void {
    this.filtro.set(valor);
    this.pageIndex = 0;
    this.aplicarFiltros();
  }

  onSortChange(sort: Sort): void {
    this.sortColumn = sort.active;
    this.sortDirection = sort.direction || 'asc';
    this.aplicarFiltros();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getDatosPaginados(): TipoRecargo[] {
    const inicio = this.pageIndex * this.pageSize;
    const fin = inicio + this.pageSize;
    return this.tiposRecargoFiltrados().slice(inicio, fin);
  }

  openDialog(tipoRecargo?: TipoRecargo): void {
    const dialogRef = this.dialog.open(TipoRecargoDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { tipoRecargo: tipoRecargo || null },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadData();
      }
    });
  }

  toggleActivo(tipoRecargo: TipoRecargo): void {
    const nuevoEstado = !tipoRecargo.activo;
    this.http
      .put<TipoRecargo>(`${environment.apiUrl}/tipos-recargo/${tipoRecargo.id}`, {
        activo: nuevoEstado,
      })
      .subscribe({
        next: () => {
          this.snackBar.open(
            `Tipo de recargo ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
            'Cerrar',
            { duration: 3000 }
          );
          this.loadData();
        },
        error: (error) => {
          console.error('Error al cambiar estado:', error);
          this.snackBar.open('Error al cambiar el estado', 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }

  limpiarFiltro(): void {
    this.filtro.set('');
    this.pageIndex = 0;
    this.aplicarFiltros();
  }
}
