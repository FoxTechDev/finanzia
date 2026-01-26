import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PagoService } from '../../../services/pago.service';
import { ReciboData } from '@core/models/credito.model';

@Component({
  selector: 'app-recibo-pago',
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
  templateUrl: './recibo-pago.component.html',
  styleUrls: ['./recibo-pago.component.scss'],
})
export class ReciboPagoComponent implements OnInit {
  private pagoService = inject(PagoService);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  @Input() pagoId?: number;

  recibo = signal<ReciboData | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    // Obtener el ID del pago desde la ruta o desde el Input
    const idFromRoute = this.route.snapshot.params['id'];
    const id = this.pagoId || Number(idFromRoute);

    if (id) {
      this.cargarRecibo(id);
    } else {
      this.error.set('No se especificó un ID de pago válido');
      this.cargando.set(false);
    }
  }

  cargarRecibo(pagoId: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.pagoService.getRecibo(pagoId).subscribe({
      next: (data) => {
        this.recibo.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar recibo:', err);
        this.error.set(err.error?.message || 'Error al cargar el recibo');
        this.cargando.set(false);
        this.snackBar.open('Error al cargar el recibo', 'Cerrar', { duration: 5000 });
      },
    });
  }

  imprimir(): void {
    window.print();
  }

  abrirEnNuevaVentana(): void {
    const url = `/creditos/pagos/${this.pagoId || this.route.snapshot.params['id']}/recibo`;
    window.open(url, '_blank', 'width=400,height=800');
  }
}
