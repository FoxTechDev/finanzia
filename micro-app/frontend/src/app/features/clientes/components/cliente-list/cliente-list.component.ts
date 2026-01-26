import { Component, inject, OnInit, signal } from '@angular/core';
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
import { FormsModule } from '@angular/forms';
import { PersonaService } from '../../services/persona.service';
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
  ],
  templateUrl: './cliente-list.component.html',
  styleUrl: './cliente-list.component.scss',
})
export class ClienteListComponent implements OnInit {
  private personaService = inject(PersonaService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  clientes = signal<Persona[]>([]);
  filteredClientes = signal<Persona[]>([]);
  isLoading = signal(true);
  searchTerm = '';

  displayedColumns = ['nombre', 'dui', 'telefono', 'acciones'];

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    this.isLoading.set(true);
    this.personaService.getAll().subscribe({
      next: (data) => {
        this.clientes.set(data);
        this.filteredClientes.set(data);
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

  filterClientes(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredClientes.set(
      this.clientes().filter(
        (c) =>
          c.nombre.toLowerCase().includes(term) ||
          c.apellido.toLowerCase().includes(term) ||
          c.numeroDui.includes(term)
      )
    );
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
          this.loadClientes();
        },
        error: () => {
          this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
        },
      });
    }
  }
}
