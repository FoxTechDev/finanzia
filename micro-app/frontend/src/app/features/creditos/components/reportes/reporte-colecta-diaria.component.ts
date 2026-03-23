import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';

import {
  ReporteService,
  ColectaDiariaResponse,
  FiltrosReporteArqueo,
} from '../../services/reporte.service';

@Component({
  selector: 'app-reporte-colecta-diaria',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    CurrencyPipe,
    DatePipe,
  ],
  template: `
    <div class="container no-print">
      <div class="header">
        <h1><mat-icon>receipt_long</mat-icon> Colecta Diaria</h1>
        <p class="subtitle">Detalle de pagos realizados en un periodo</p>
      </div>

      <!-- Filtros -->
      <mat-card class="filters-card">
        <mat-card-header>
          <mat-card-title><mat-icon>filter_list</mat-icon> Periodo</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="filtrosForm" class="filters-form">
            <div class="filters-row">
              <mat-form-field appearance="outline">
                <mat-label>Fecha desde</mat-label>
                <input matInput [matDatepicker]="pickerDesde" formControlName="fechaDesde">
                <mat-datepicker-toggle matSuffix [for]="pickerDesde"></mat-datepicker-toggle>
                <mat-datepicker #pickerDesde></mat-datepicker>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Fecha hasta</mat-label>
                <input matInput [matDatepicker]="pickerHasta" formControlName="fechaHasta">
                <mat-datepicker-toggle matSuffix [for]="pickerHasta"></mat-datepicker-toggle>
                <mat-datepicker #pickerHasta></mat-datepicker>
              </mat-form-field>
            </div>
            <div class="filter-actions">
              <button mat-raised-button color="primary" (click)="generarReporte()" [disabled]="filtrosForm.invalid || isLoading()">
                <mat-icon>play_arrow</mat-icon> Generar
              </button>
              <button mat-stroked-button (click)="limpiarFiltros()" [disabled]="isLoading()">
                <mat-icon>clear</mat-icon> Limpiar
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      @if (isLoading()) {
        <div class="loading"><mat-spinner diameter="50"></mat-spinner><p>Generando colecta...</p></div>
      }

      @if (!isLoading() && datos()) {
        <mat-card class="results-card">
          <mat-card-header>
            <mat-card-title>
              <div class="results-header">
                <div><mat-icon>description</mat-icon> Colecta Diaria</div>
                <button mat-raised-button color="primary" (click)="imprimir()">
                  <mat-icon>print</mat-icon> Imprimir
                </button>
              </div>
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="summary">
              <div class="summary-item">
                <mat-icon>receipt</mat-icon>
                <div>
                  <span class="summary-label">Total Pagos</span>
                  <span class="summary-value">{{ datos()!.totalPagos }}</span>
                </div>
              </div>
              <div class="summary-item primary">
                <mat-icon>attach_money</mat-icon>
                <div>
                  <span class="summary-label">Monto Total</span>
                  <span class="summary-value">{{ datos()!.montoTotal | currency:'USD':'symbol':'1.2-2' }}</span>
                </div>
              </div>
            </div>

            <mat-divider style="margin: 24px 0;"></mat-divider>

            @if (datos()!.pagos.length > 0) {
              <div class="table-responsive">
                <table mat-table [dataSource]="datos()!.pagos">
                  <ng-container matColumnDef="numeroPago">
                    <th mat-header-cell *matHeaderCellDef>No. Recibo</th>
                    <td mat-cell *matCellDef="let r"><strong>{{ r.numeroPago }}</strong></td>
                  </ng-container>
                  <ng-container matColumnDef="nombreCliente">
                    <th mat-header-cell *matHeaderCellDef>Cliente</th>
                    <td mat-cell *matCellDef="let r">{{ r.nombreCliente }}</td>
                  </ng-container>
                  <ng-container matColumnDef="montoPagado">
                    <th mat-header-cell *matHeaderCellDef>Monto</th>
                    <td mat-cell *matCellDef="let r" class="amount-cell">{{ r.montoPagado | currency:'USD':'symbol':'1.2-2' }}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="columnas"></tr>
                  <tr mat-row *matRowDef="let row; columns: columnas"></tr>
                </table>
              </div>
            } @else {
              <div class="empty"><mat-icon>info</mat-icon><p>No hay pagos en el periodo</p></div>
            }
          </mat-card-content>
        </mat-card>
      }

      @if (!isLoading() && reporteGenerado() && !datos()) {
        <mat-card><mat-card-content><div class="empty"><mat-icon>info</mat-icon><p>No se encontraron datos</p></div></mat-card-content></mat-card>
      }
    </div>

    <!-- Térmica -->
    @if (datos()) {
      <div class="recibo-termica print-only">
        <div class="t-center"><strong>FINANZIA S.C. DE R.L. DE C.V.</strong><br>COLECTA DIARIA<br>Del {{ fmtFecha(datos()!.fechaDesde) }} al {{ fmtFecha(datos()!.fechaHasta) }}</div>
        <div class="t-sep">================================</div>
        <div class="t-line-3">
          <span class="col-recibo">RECIBO</span>
          <span class="col-nombre">CLIENTE</span>
          <span class="col-monto">MONTO</span>
        </div>
        <div class="t-sep">--------------------------------</div>
        @for (p of datos()!.pagos; track p.numeroPago) {
          <div class="t-line-3">
            <span class="col-recibo">{{ p.numeroPago }}</span>
            <span class="col-nombre">{{ p.nombreCliente }}</span>
            <span class="col-monto">\${{ p.montoPagado.toFixed(2) }}</span>
          </div>
        }
        <div class="t-sep">================================</div>
        <div class="t-total">
          <span>TOTAL ({{ datos()!.totalPagos }})</span>
          <span>\${{ datos()!.montoTotal.toFixed(2) }}</span>
        </div>
        <div class="t-sep">================================</div>
        <div class="t-center t-footer"><br>Generado: {{ hoy | date:'dd/MM/yyyy HH:mm' }}<br>&nbsp;</div>
      </div>
    }
  `,
  styles: [`
    .container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { margin-bottom: 24px; }
    .header h1 { display: flex; align-items: center; gap: 12px; margin: 0; font-size: 32px; font-weight: 500; color: #0F808C; }
    .header h1 mat-icon { font-size: 36px; width: 36px; height: 36px; }
    .subtitle { color: #666; margin: 8px 0 0 0; font-size: 16px; }
    .filters-card { margin-bottom: 24px; }
    .filters-form { padding-top: 16px; }
    .filters-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .filter-actions { display: flex; gap: 12px; justify-content: flex-end; }
    .loading { display: flex; flex-direction: column; align-items: center; padding: 80px 20px; gap: 20px; }
    .loading p { color: #666; }
    .results-card { margin-bottom: 24px; }
    .results-header { display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px; }
    .results-header > div:first-child { display: flex; align-items: center; gap: 8px; }

    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 16px; }
    .summary-item { display: flex; align-items: center; gap: 16px; padding: 20px; border-radius: 12px; background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .summary-item.primary { background: linear-gradient(135deg, #e1f3f5 0%, #b5e1e6 100%); }
    .summary-item mat-icon { font-size: 48px; width: 48px; height: 48px; color: #0F808C; }
    .summary-item > div { display: flex; flex-direction: column; }
    .summary-label { font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500; }
    .summary-value { font-size: 24px; font-weight: 700; color: #333; margin-top: 4px; }

    .table-responsive { overflow-x: auto; }
    table { width: 100%; }
    th { background-color: #f5f5f5; font-weight: 600; color: #333; white-space: nowrap; }
    .amount-cell { text-align: right; font-family: monospace; font-weight: 500; }

    .empty { text-align: center; padding: 48px 20px; }
    .empty mat-icon { font-size: 64px; width: 64px; height: 64px; color: #bdbdbd; }
    .empty p { color: #666; font-size: 16px; margin: 12px 0; }

    .print-only { display: none; }

    @media (max-width: 960px) {
      .container { padding: 16px; }
      .header h1 { font-size: 24px; }
      .filters-row { grid-template-columns: 1fr; }
      .filter-actions { flex-direction: column; }
      .filter-actions button { width: 100%; }
      .summary { grid-template-columns: 1fr; }
      .results-header { flex-direction: column; align-items: flex-start; }
      .results-header button { width: 100%; }
    }

    @media (max-width: 480px) {
      .header h1 { font-size: 20px; }
      .header h1 mat-icon { font-size: 24px; width: 24px; height: 24px; }
    }

    @media print {
      .no-print { display: none !important; }
      .print-only { display: block !important; }

      @page { size: 80mm auto; margin: 0; }
      :host { display: block; width: 80mm; }

      .recibo-termica {
        width: 80mm;
        margin: 0;
        padding: 3mm;
        background: white;
        border: none;
        box-shadow: none;
        font-family: 'Consolas', 'Liberation Mono', 'Menlo', 'DejaVu Sans Mono', monospace;
        font-size: 9pt;
        line-height: 1.2;
        letter-spacing: 0.02em;
        color: #000;
        page-break-inside: avoid;
      }

      .t-center { text-align: center; }
      .t-sep { text-align: center; letter-spacing: -0.5px; margin: 1mm 0; }
      .t-line-3 { display: flex; margin: 0.5mm 0; font-size: 8pt; }
      .col-recibo { flex: 0 0 30%; overflow: hidden; text-overflow: ellipsis; }
      .col-nombre { flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .col-monto { flex: 0 0 22%; text-align: right; }
      .t-total { display: flex; justify-content: space-between; font-weight: bold; font-size: 10pt; }
      .t-footer { font-size: 7pt; margin-top: 3mm; }

      * { color: #000 !important; background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  `],
})
export class ReporteColectaDiariaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reporteService = inject(ReporteService);
  private snackBar = inject(MatSnackBar);

  isLoading = signal(false);
  reporteGenerado = signal(false);
  datos = signal<ColectaDiariaResponse | null>(null);
  hoy = new Date();

  filtrosForm!: FormGroup;
  columnas = ['numeroPago', 'nombreCliente', 'montoPagado'];

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const hoy = new Date();
    this.filtrosForm = this.fb.group({
      fechaDesde: [hoy, Validators.required],
      fechaHasta: [hoy, Validators.required],
    });
  }

  generarReporte(): void {
    if (this.filtrosForm.invalid) return;
    this.isLoading.set(true);
    this.reporteGenerado.set(false);
    const v = this.filtrosForm.value;
    const filtros: FiltrosReporteArqueo = {
      fechaDesde: this.fmtDate(v.fechaDesde),
      fechaHasta: this.fmtDate(v.fechaHasta),
    };
    this.reporteService.getColectaDiaria(filtros).subscribe({
      next: (data) => { this.datos.set(data); this.reporteGenerado.set(true); this.isLoading.set(false); },
      error: (err) => { this.datos.set(null); this.reporteGenerado.set(true); this.isLoading.set(false); this.snackBar.open(err.error?.message || 'Error al generar colecta', 'Cerrar', { duration: 4000 }); },
    });
  }

  limpiarFiltros(): void { this.initForm(); this.datos.set(null); this.reporteGenerado.set(false); }
  imprimir(): void { window.print(); }

  fmtDate(fecha: Date): string {
    if (!fecha) return '';
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  }

  fmtFecha(fecha: string): string {
    if (!fecha) return '';
    const p = fecha.substring(0, 10).split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : fecha;
  }
}
