import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PrestamoService } from '../../../services/prestamo.service';
import { ReciboDesembolsoData } from '@core/models/credito.model';

@Component({
  selector: 'app-recibo-desembolso',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './recibo-desembolso.component.html',
  styleUrls: ['./recibo-desembolso.component.scss'],
})
export class ReciboDesembolsoComponent implements OnInit {
  private prestamoService = inject(PrestamoService);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  @Input() prestamoId?: number;

  recibo = signal<ReciboDesembolsoData | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    // Obtener el ID del préstamo desde la ruta o desde el Input
    const idFromRoute = this.route.snapshot.params['id'];
    const id = this.prestamoId || Number(idFromRoute);

    if (id) {
      this.cargarRecibo(id);
    } else {
      this.error.set('No se especificó un ID de préstamo válido');
      this.cargando.set(false);
    }
  }

  cargarRecibo(prestamoId: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.prestamoService.getReciboDesembolso(prestamoId).subscribe({
      next: (data) => {
        this.recibo.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar recibo de desembolso:', err);
        this.error.set(err.error?.message || 'Error al cargar el recibo de desembolso');
        this.cargando.set(false);
        this.snackBar.open('Error al cargar el recibo de desembolso', 'Cerrar', { duration: 5000 });
      },
    });
  }

  imprimir(): void {
    window.print();
  }

  abrirEnNuevaVentana(): void {
    const url = `/creditos/prestamos/${this.prestamoId || this.route.snapshot.params['id']}/recibo-desembolso`;
    window.open(url, '_blank', 'width=400,height=900');
  }
}
