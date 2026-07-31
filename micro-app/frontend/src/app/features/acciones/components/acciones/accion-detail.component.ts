import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { AccionService } from '../../services/accion.service';
import { Accion, AccionDividendo } from '@core/models/accion.model';

@Component({
  selector: 'app-accion-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
  ],
  template: `
    <div class="container">
      <div class="header">
        <button mat-icon-button (click)="volver()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Acción {{ accion()?.correlativo }}</h1>
      </div>

      @if (isLoading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (accion()) {
        <mat-card class="info-card">
          <mat-card-content>
            <div class="grid">
              <div class="field">
                <span class="label">Cliente</span>
                <span class="value">
                  {{ accion()!.persona ? (accion()!.persona!.nombre + ' ' + accion()!.persona!.apellido) : '' }}
                </span>
              </div>
              <div class="field">
                <span class="label">Tipo de Acción</span>
                <span class="value">{{ accion()!.tipoAccion?.nombre }}</span>
              </div>
              <div class="field">
                <span class="label">Monto Invertido</span>
                <span class="value">{{ accion()!.monto | currency:'USD':'symbol':'1.2-2' }}</span>
              </div>
              <div class="field">
                <span class="label">Cantidad de Acciones</span>
                <span class="value">{{ accion()!.cantidadAcciones | number:'1.0-4' }}</span>
              </div>
              <div class="field">
                <span class="label">Tasa de Interés</span>
                <span class="value">{{ accion()!.tasaInteres }}%</span>
              </div>
              <div class="field">
                <span class="label">Fecha de Apertura</span>
                <span class="value">{{ accion()!.fechaApertura | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="field">
                <span class="label">Destino del pago de intereses</span>
                <span class="value">
                  @if (accion()!.cuentaAhorroDestino) {
                    Cuenta AV {{ accion()!.cuentaAhorroDestino!.noCuenta }}
                  } @else if (accion()!.banco) {
                    Transferencia - {{ accion()!.banco!.nombre }}
                    @if (accion()!.cuentaBancoNumero) {
                      (cta. {{ accion()!.cuentaBancoNumero }})
                    }
                  } @else {
                    N/A
                  }
                </span>
              </div>
              <div class="field">
                <span class="label">Último pago de intereses</span>
                <span class="value">
                  {{ accion()!.fechaUltimoPagoIntereses ? (accion()!.fechaUltimoPagoIntereses | date:'dd/MM/yyyy') : 'Sin pagos aún' }}
                </span>
              </div>
              <div class="field">
                <span class="label">Estado</span>
                <span class="value">
                  <mat-chip-set>
                    <mat-chip [class.activo]="accion()!.activa" [class.inactivo]="!accion()!.activa">
                      {{ accion()!.activa ? 'Activa' : 'Inactiva' }}
                    </mat-chip>
                  </mat-chip-set>
                </span>
              </div>
            </div>
            @if (accion()!.observacion) {
              <mat-divider style="margin: 16px 0;"></mat-divider>
              <div class="field">
                <span class="label">Observación</span>
                <span class="value">{{ accion()!.observacion }}</span>
              </div>
            }
          </mat-card-content>
        </mat-card>

        <mat-card class="dividendos-card">
          <mat-card-header>
            <mat-card-title>Historial de Dividendos</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (dividendos().length > 0) {
              <table mat-table [dataSource]="dividendos()" class="full-width">
                <ng-container matColumnDef="fecha">
                  <th mat-header-cell *matHeaderCellDef>Fecha</th>
                  <td mat-cell *matCellDef="let d">{{ d.fecha | date:'dd/MM/yyyy' }}</td>
                </ng-container>
                <ng-container matColumnDef="monto">
                  <th mat-header-cell *matHeaderCellDef>Monto</th>
                  <td mat-cell *matCellDef="let d">{{ d.monto | currency:'USD':'symbol':'1.2-2' }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="dividendoColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: dividendoColumns"></tr>
              </table>
            } @else {
              <p class="empty-text">Todavía no se ha pagado ningún dividendo para esta acción.</p>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .container { padding: 24px; max-width: 1000px; margin: 0 auto; }
    .header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
    .header h1 { margin: 0; font-size: 24px; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .info-card { margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { font-size: 16px; font-weight: 500; color: #333; }
    .full-width { width: 100%; }
    .empty-text { color: #666; text-align: center; padding: 24px; }
    mat-chip.activo { background-color: #4caf50 !important; color: white !important; }
    mat-chip.inactivo { background-color: #9e9e9e !important; color: white !important; }
  `],
})
export class AccionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accionService = inject(AccionService);
  private snackBar = inject(MatSnackBar);

  accion = signal<Accion | null>(null);
  dividendos = signal<AccionDividendo[]>([]);
  isLoading = signal(true);
  dividendoColumns = ['fecha', 'monto'];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.loadAccion(id);
  }

  private loadAccion(id: number): void {
    this.isLoading.set(true);
    this.accionService.getOne(id).subscribe({
      next: (data) => {
        this.accion.set(data);
        this.isLoading.set(false);
        this.accionService.getDividendos(id).subscribe((dividendos) => this.dividendos.set(dividendos));
      },
      error: () => {
        this.snackBar.open('Error al cargar la acción', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  volver(): void {
    this.router.navigate(['/acciones']);
  }
}
