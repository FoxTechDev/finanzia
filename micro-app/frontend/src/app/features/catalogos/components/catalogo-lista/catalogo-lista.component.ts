import { Component, inject, OnInit, signal, Input } from '@angular/core';
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
import { CatalogoBase, CatalogoConfig } from '@core/models/catalogo.model';
import { CatalogoBaseService } from '../../services/catalogo-base.service';
import { CatalogoFormDialogComponent } from '../catalogo-form-dialog/catalogo-form-dialog.component';

@Component({
  selector: 'app-catalogo-lista',
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
  templateUrl: './catalogo-lista.component.html',
  styleUrl: './catalogo-lista.component.scss',
})
export class CatalogoListaComponent implements OnInit {
  @Input({ required: true }) config!: CatalogoConfig;

  private catalogoService = inject(CatalogoBaseService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Signals para el estado del componente
  catalogos = signal<CatalogoBase[]>([]);
  catalogosFiltrados = signal<CatalogoBase[]>([]);
  isLoading = signal(true);
  filtro = signal('');

  // Configuración de la tabla
  displayedColumns = ['codigo', 'nombre', 'descripcion', 'activo', 'orden', 'acciones'];

  // Paginación
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 50];

  // Ordenamiento
  sortColumn = 'orden';
  sortDirection: 'asc' | 'desc' = 'asc';

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Carga los datos del catálogo desde el API
   */
  loadData(): void {
    this.isLoading.set(true);
    this.catalogoService.getAll(this.config.endpoint).subscribe({
      next: (data) => {
        this.catalogos.set(data);
        this.aplicarFiltros();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar catálogo:', error);
        this.snackBar.open(`Error al cargar ${this.config.titulo}`, 'Cerrar', {
          duration: 3000,
        });
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Aplica filtros de búsqueda y ordenamiento
   */
  aplicarFiltros(): void {
    let resultado = [...this.catalogos()];

    // Aplicar filtro de búsqueda
    const filtroTexto = this.filtro().toLowerCase().trim();
    if (filtroTexto) {
      resultado = resultado.filter(
        (item) =>
          item.codigo.toLowerCase().includes(filtroTexto) ||
          item.nombre.toLowerCase().includes(filtroTexto) ||
          item.descripcion?.toLowerCase().includes(filtroTexto)
      );
    }

    // Aplicar ordenamiento
    resultado.sort((a, b) => {
      const valorA = this.getValorOrdenamiento(a);
      const valorB = this.getValorOrdenamiento(b);

      const comparacion = valorA < valorB ? -1 : valorA > valorB ? 1 : 0;
      return this.sortDirection === 'asc' ? comparacion : -comparacion;
    });

    this.catalogosFiltrados.set(resultado);
  }

  /**
   * Obtiene el valor para ordenamiento según la columna activa
   */
  private getValorOrdenamiento(item: CatalogoBase): any {
    switch (this.sortColumn) {
      case 'codigo':
        return item.codigo.toLowerCase();
      case 'nombre':
        return item.nombre.toLowerCase();
      case 'descripcion':
        return item.descripcion?.toLowerCase() || '';
      case 'activo':
        return item.activo ? 1 : 0;
      case 'orden':
        return item.orden ?? 999999;
      default:
        return item.orden ?? 999999;
    }
  }

  /**
   * Maneja el cambio de filtro de búsqueda
   */
  onFiltroChange(valor: string): void {
    this.filtro.set(valor);
    this.pageIndex = 0; // Resetear a la primera página
    this.aplicarFiltros();
  }

  /**
   * Maneja el cambio de ordenamiento
   */
  onSortChange(sort: Sort): void {
    this.sortColumn = sort.active;
    this.sortDirection = sort.direction || 'asc';
    this.aplicarFiltros();
  }

  /**
   * Maneja el cambio de página
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  /**
   * Obtiene los datos paginados para mostrar en la tabla
   */
  getDatosPaginados(): CatalogoBase[] {
    const inicio = this.pageIndex * this.pageSize;
    const fin = inicio + this.pageSize;
    return this.catalogosFiltrados().slice(inicio, fin);
  }

  /**
   * Abre el diálogo para crear o editar un registro
   */
  openDialog(catalogo?: CatalogoBase): void {
    const dialogRef = this.dialog.open(CatalogoFormDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        catalogo: catalogo || null,
        config: this.config,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadData();
      }
    });
  }

  /**
   * Cambia el estado activo/inactivo de un registro
   */
  toggleActivo(catalogo: CatalogoBase): void {
    const nuevoEstado = !catalogo.activo;
    this.catalogoService
      .toggleActivo(this.config.endpoint, catalogo.id, nuevoEstado)
      .subscribe({
        next: () => {
          this.snackBar.open(
            `Registro ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
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

  /**
   * Elimina un registro
   */
  eliminar(catalogo: CatalogoBase): void {
    if (confirm(`¿Está seguro de eliminar "${catalogo.nombre}"?`)) {
      this.catalogoService.delete(this.config.endpoint, catalogo.id).subscribe({
        next: () => {
          this.snackBar.open('Registro eliminado correctamente', 'Cerrar', {
            duration: 3000,
          });
          this.loadData();
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          this.snackBar.open('Error al eliminar el registro', 'Cerrar', {
            duration: 3000,
          });
        },
      });
    }
  }

  /**
   * Limpia el filtro de búsqueda
   */
  limpiarFiltro(): void {
    this.filtro.set('');
    this.pageIndex = 0;
    this.aplicarFiltros();
  }
}
