import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { PersonaService, PersonaPaginatedResponse } from '../../services/persona.service';
import { Persona } from '@core/models/cliente.model';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
  ],
  templateUrl: './cliente-list.component.html',
  styleUrl: './cliente-list.component.scss',
})
export class ClienteListComponent {
  private personaService = inject(PersonaService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  clientes = signal<Persona[]>([]);
  isLoading = signal(false);
  buscado = signal(false);
  totalRegistros = signal(0);

  // Filtros
  filtroNombre = '';
  filtroDui = '';

  // Paginación
  pageSize = 20;
  pageIndex = 0;

  displayedColumns = ['nombre', 'dui', 'telefono', 'acciones'];

  buscarClientes(): void {
    if (!this.filtroNombre.trim() && !this.filtroDui.trim()) {
      this.snackBar.open('Ingrese al menos un criterio de búsqueda', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.isLoading.set(true);
    this.buscado.set(true);
    this.pageIndex = 0;
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.isLoading.set(true);
    this.personaService
      .getPaginated({
        nombre: this.filtroNombre.trim() || undefined,
        dui: this.filtroDui.trim() || undefined,
        page: this.pageIndex + 1,
        limit: this.pageSize,
      })
      .subscribe({
        next: (response: PersonaPaginatedResponse) => {
          this.clientes.set(response.data);
          this.totalRegistros.set(response.total);
          this.isLoading.set(false);
        },
        error: () => {
          this.snackBar.open('Error al cargar clientes', 'Cerrar', {
            duration: 3000,
          });
          this.isLoading.set(false);
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.cargarClientes();
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroDui = '';
    this.clientes.set([]);
    this.totalRegistros.set(0);
    this.buscado.set(false);
    this.pageIndex = 0;
  }

  verDetalle(id: number): void {
    this.router.navigate(['/clientes', id]);
  }

  editar(id: number): void {
    this.router.navigate(['/clientes/editar', id]);
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      this.personaService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Cliente eliminado', 'Cerrar', { duration: 3000 });
          this.cargarClientes();
        },
        error: () => {
          this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
        },
      });
    }
  }
}
