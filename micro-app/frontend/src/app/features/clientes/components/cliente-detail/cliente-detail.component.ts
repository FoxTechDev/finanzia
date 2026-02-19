import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PersonaService } from '../../services/persona.service';
import { Persona } from '@core/models/cliente.model';

@Component({
  selector: 'app-cliente-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './cliente-detail.component.html',
  styleUrl: './cliente-detail.component.scss',
})
export class ClienteDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private personaService = inject(PersonaService);
  private snackBar = inject(MatSnackBar);

  cliente = signal<Persona | null>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCliente(+id);
    }
  }

  private loadCliente(id: number): void {
    this.personaService.getById(id).subscribe({
      next: (data) => {
        this.cliente.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar cliente', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/clientes']);
      },
    });
  }

  editar(): void {
    this.router.navigate(['/clientes/editar', this.cliente()?.id]);
  }

  volver(): void {
    this.router.navigate(['/clientes']);
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    const parts = date.substring(0, 10).split('-');
    if (parts.length !== 3) return date;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  formatCurrency(value: number | undefined): string {
    if (!value) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }
}
