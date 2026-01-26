import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';

import {
  Pago,
  TIPO_PAGO_LABELS,
  ESTADO_PAGO_LABELS,
  ESTADO_CUOTA_LABELS,
  EstadoPago,
  EstadoCuota,
  TipoPago,
} from '@core/models/credito.model';

@Component({
  selector: 'app-detalle-pago-dialog',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatTableModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>receipt</mat-icon>
      Detalle del Pago
    </h2>

    <mat-dialog-content>
      <!-- Estado del Pago -->
      <div class="estado-banner" [class.anulado]="data.pago.estado === 'ANULADO'">
        <mat-chip [color]="data.pago.estado === 'APLICADO' ? 'primary' : 'warn'" highlighted>
          {{ estadoPagoLabel(data.pago.estado) }}
        </mat-chip>
        <span class="numero-pago">{{ data.pago.numeroPago }}</span>
      </div>

      <!-- Información General -->
      <div class="info-section">
        <h3>Información General</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Fecha de Pago</span>
            <span class="value">{{ data.pago.fechaPago | date:'dd/MM/yyyy' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Fecha de Registro</span>
            <span class="value">{{ data.pago.fechaRegistro | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Tipo de Pago</span>
            <mat-chip>{{ tipoPagoLabel(data.pago.tipoPago) }}</mat-chip>
          </div>
          <div class="info-item">
            <span class="label">Monto Pagado</span>
            <span class="value amount">{{ data.pago.montoPagado | currency:'USD' }}</span>
          </div>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Distribución del Pago -->
      <div class="info-section">
        <h3>Distribución del Pago</h3>
        <div class="distribucion-grid">
          <div class="dist-item">
            <span class="label">Interés Moratorio</span>
            <span class="value">{{ data.pago.interesMoratorioAplicado | currency:'USD' }}</span>
          </div>
          <div class="dist-item">
            <span class="label">Intereses</span>
            <span class="value">{{ data.pago.interesAplicado | currency:'USD' }}</span>
          </div>
          <div class="dist-item">
            <span class="label">Recargos</span>
            <span class="value">{{ data.pago.recargosAplicado | currency:'USD' }}</span>
          </div>
          <div class="dist-item">
            <span class="label">Capital</span>
            <span class="value">{{ data.pago.capitalAplicado | currency:'USD' }}</span>
          </div>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Saldos -->
      <div class="info-section">
        <h3>Saldos</h3>
        <div class="saldos-comparacion">
          <div class="saldo-columna">
            <h4>Antes del Pago</h4>
            <div class="saldo-item">
              <span class="label">Capital:</span>
              <span class="value">{{ data.pago.saldoCapitalAnterior | currency:'USD' }}</span>
            </div>
            <div class="saldo-item">
              <span class="label">Interés:</span>
              <span class="value">{{ data.pago.saldoInteresAnterior | currency:'USD' }}</span>
            </div>
            <div class="saldo-item">
              <span class="label">Días Mora:</span>
              <span class="value">{{ data.pago.diasMoraAnterior }}</span>
            </div>
          </div>
          <div class="saldo-flecha">
            <mat-icon>arrow_forward</mat-icon>
          </div>
          <div class="saldo-columna despues">
            <h4>Después del Pago</h4>
            <div class="saldo-item">
              <span class="label">Capital:</span>
              <span class="value">{{ data.pago.saldoCapitalPosterior | currency:'USD' }}</span>
            </div>
            <div class="saldo-item">
              <span class="label">Interés:</span>
              <span class="value">{{ data.pago.saldoInteresPosterior | currency:'USD' }}</span>
            </div>
          </div>
        </div>
      </div>

      @if (data.pago.detallesCuota && data.pago.detallesCuota.length > 0) {
        <mat-divider></mat-divider>

        <!-- Cuotas Afectadas -->
        <div class="info-section">
          <h3>Cuotas Afectadas</h3>
          <table mat-table [dataSource]="data.pago.detallesCuota" class="cuotas-table">
            <ng-container matColumnDef="numeroCuota">
              <th mat-header-cell *matHeaderCellDef>Cuota</th>
              <td mat-cell *matCellDef="let row">{{ row.numeroCuota }}</td>
            </ng-container>

            <ng-container matColumnDef="capitalAplicado">
              <th mat-header-cell *matHeaderCellDef>Capital</th>
              <td mat-cell *matCellDef="let row">{{ row.capitalAplicado | currency:'USD' }}</td>
            </ng-container>

            <ng-container matColumnDef="interesAplicado">
              <th mat-header-cell *matHeaderCellDef>Interés</th>
              <td mat-cell *matCellDef="let row">{{ row.interesAplicado | currency:'USD' }}</td>
            </ng-container>

            <ng-container matColumnDef="estadoPosterior">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [color]="row.estadoCuotaPosterior === 'PAGADA' ? 'primary' : 'accent'" highlighted>
                  {{ estadoCuotaLabel(row.estadoCuotaPosterior) }}
                </mat-chip>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="cuotasColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: cuotasColumns;"></tr>
          </table>
        </div>
      }

      @if (data.pago.estado === 'ANULADO') {
        <mat-divider></mat-divider>

        <!-- Información de Anulación -->
        <div class="info-section anulacion">
          <h3>
            <mat-icon>cancel</mat-icon>
            Información de Anulación
          </h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Fecha de Anulación</span>
              <span class="value">{{ data.pago.fechaAnulacion | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Anulado por</span>
              <span class="value">{{ data.pago.nombreUsuarioAnulacion || 'N/A' }}</span>
            </div>
            <div class="info-item full-width">
              <span class="label">Motivo</span>
              <span class="value">{{ data.pago.motivoAnulacion }}</span>
            </div>
          </div>
        </div>
      }

      @if (data.pago.observaciones) {
        <mat-divider></mat-divider>

        <div class="info-section">
          <h3>Observaciones</h3>
          <p class="observaciones">{{ data.pago.observaciones }}</p>
        </div>
      }

      <!-- Auditoría -->
      <mat-divider></mat-divider>
      <div class="auditoria">
        <span>Registrado por: {{ data.pago.nombreUsuario || 'N/A' }}</span>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      @if (data.pago.estado === 'APLICADO') {
        <button mat-stroked-button color="primary" (click)="imprimirRecibo()">
          <mat-icon>print</mat-icon>
          Imprimir Recibo
        </button>
      }
      <button mat-button (click)="cerrar()">Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .estado-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #e3f2fd;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .estado-banner.anulado {
      background: #ffebee;
    }

    .numero-pago {
      font-size: 18px;
      font-weight: 600;
      color: #1565c0;
    }

    .estado-banner.anulado .numero-pago {
      color: #c62828;
    }

    .info-section {
      margin: 16px 0;
    }

    .info-section h3 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item.full-width {
      grid-column: 1 / -1;
    }

    .info-item .label {
      font-size: 12px;
      color: #666;
    }

    .info-item .value {
      font-size: 16px;
      font-weight: 500;
    }

    .info-item .value.amount {
      color: #2e7d32;
      font-size: 20px;
    }

    .distribucion-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }

    .dist-item {
      display: flex;
      flex-direction: column;
      padding: 12px;
      background: #fafafa;
      border-radius: 8px;
      text-align: center;
    }

    .dist-item .label {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .dist-item .value {
      font-size: 16px;
      font-weight: 600;
      color: #1565c0;
    }

    .saldos-comparacion {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .saldo-columna {
      flex: 1;
      padding: 16px;
      background: #fafafa;
      border-radius: 8px;
    }

    .saldo-columna.despues {
      background: #e8f5e9;
    }

    .saldo-columna h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #666;
    }

    .saldo-item {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }

    .saldo-flecha {
      color: #1565c0;
    }

    .cuotas-table {
      width: 100%;
    }

    .info-section.anulacion {
      background: #ffebee;
      padding: 16px;
      border-radius: 8px;
    }

    .info-section.anulacion h3 {
      color: #c62828;
    }

    .observaciones {
      background: #fafafa;
      padding: 12px;
      border-radius: 4px;
      margin: 0;
    }

    .auditoria {
      padding: 8px 0;
      font-size: 12px;
      color: #666;
    }

    mat-dialog-actions {
      padding: 16px 24px;
    }
  `],
})
export class DetallePagoDialogComponent {
  private router = inject(Router);
  dialogRef = inject(MatDialogRef<DetallePagoDialogComponent>);
  data = inject<{ pago: Pago }>(MAT_DIALOG_DATA);

  cuotasColumns = ['numeroCuota', 'capitalAplicado', 'interesAplicado', 'estadoPosterior'];

  tipoPagoLabel(tipo: string): string {
    return TIPO_PAGO_LABELS[tipo as TipoPago] || tipo;
  }

  estadoPagoLabel(estado: string): string {
    return ESTADO_PAGO_LABELS[estado as EstadoPago] || estado;
  }

  estadoCuotaLabel(estado: string): string {
    return ESTADO_CUOTA_LABELS[estado as EstadoCuota] || estado;
  }

  imprimirRecibo(): void {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/creditos/pagos', this.data.pago.id, 'recibo'])
    );
    window.open(url, '_blank', 'width=400,height=800');
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
