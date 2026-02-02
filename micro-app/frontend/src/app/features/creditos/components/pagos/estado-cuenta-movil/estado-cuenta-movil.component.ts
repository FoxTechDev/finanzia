import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PagoService } from '../../../services/pago.service';
import { EstadoCuentaDatos } from '@core/models/credito.model';

@Component({
  selector: 'app-estado-cuenta-movil',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    PercentPipe,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './estado-cuenta-movil.component.html',
  styleUrls: ['./estado-cuenta-movil.component.scss'],
})
export class EstadoCuentaMovilComponent implements OnInit {
  private pagoService = inject(PagoService);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  @Input() prestamoId?: number;

  estadoCuenta = signal<EstadoCuentaDatos | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.params['prestamoId'];
    const id = this.prestamoId || Number(idFromRoute);

    if (id) {
      this.cargarEstadoCuenta(id);
    } else {
      this.error.set('No se especificó un ID de préstamo válido');
      this.cargando.set(false);
    }
  }

  cargarEstadoCuenta(prestamoId: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.pagoService.getEstadoCuentaDatos(prestamoId).subscribe({
      next: (data) => {
        this.estadoCuenta.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar estado de cuenta:', err);
        this.error.set(err.error?.message || 'Error al cargar el estado de cuenta');
        this.cargando.set(false);
        this.snackBar.open('Error al cargar el estado de cuenta', 'Cerrar', { duration: 5000 });
      },
    });
  }

  imprimir(): void {
    window.print();
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatearPorcentaje(valor: number): string {
    // La tasa ya viene como porcentaje (ej: 12 = 12%), no como decimal
    return `${Number(valor).toFixed(2)}%`;
  }
}
