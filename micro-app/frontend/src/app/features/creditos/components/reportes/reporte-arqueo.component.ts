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
import { MatTooltipModule } from '@angular/material/tooltip';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  ReporteService,
  ArqueoResponse,
  FiltrosReporteArqueo,
} from '../../services/reporte.service';

@Component({
  selector: 'app-reporte-arqueo',
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
    MatTooltipModule,
    CurrencyPipe,
    DatePipe,
  ],
  template: `
    <div class="container no-print">
      <div class="header">
        <h1><mat-icon>point_of_sale</mat-icon> Arqueo</h1>
        <p class="subtitle">Resumen de ingresos y egresos agrupados por día</p>
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
        <div class="loading"><mat-spinner diameter="50"></mat-spinner><p>Generando arqueo...</p></div>
      }

      @if (!isLoading() && datos()) {
        <mat-card class="results-card">
          <mat-card-header>
            <mat-card-title>
              <div class="results-header">
                <div><mat-icon>description</mat-icon> Resultado del Arqueo</div>
                <div class="export-buttons">
                  <button mat-raised-button color="primary" (click)="imprimir()"><mat-icon>print</mat-icon> Imprimir</button>
                  <button mat-raised-button color="accent" (click)="exportarPDF()"><mat-icon>picture_as_pdf</mat-icon> PDF</button>
                </div>
              </div>
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <!-- Resumen -->
            <div class="summary">
              <div class="summary-item ingreso">
                <mat-icon>arrow_downward</mat-icon>
                <div>
                  <span class="summary-label">Total Ingresos</span>
                  <span class="summary-value">{{ datos()!.totalIngresos | currency:'USD':'symbol':'1.2-2' }}</span>
                  <span class="summary-detail">{{ datos()!.totalPagos + datos()!.totalDesembolsos }} transacciones</span>
                </div>
              </div>
              <div class="summary-item retiro">
                <mat-icon>arrow_upward</mat-icon>
                <div>
                  <span class="summary-label">Total Retiros</span>
                  <span class="summary-value">{{ datos()!.totalRetiros | currency:'USD':'symbol':'1.2-2' }}</span>
                </div>
              </div>
              <div class="summary-item entregar">
                <mat-icon>account_balance_wallet</mat-icon>
                <div>
                  <span class="summary-label">Total a Entregar</span>
                  <span class="summary-value">{{ datos()!.totalEntregar | currency:'USD':'symbol':'1.2-2' }}</span>
                </div>
              </div>
            </div>

            <mat-divider style="margin: 24px 0;"></mat-divider>

            <!-- Pagos por Día -->
            <h3 class="section-title"><mat-icon>payments</mat-icon> Pagos Recibidos (Ingresos)</h3>
            <p class="section-summary">{{ datos()!.totalPagos }} pagos &mdash; {{ datos()!.montoTotalPagos | currency:'USD':'symbol':'1.2-2' }}</p>
            @if (datos()!.pagosPorDia.length > 0) {
              <div class="table-responsive">
                <table mat-table [dataSource]="datos()!.pagosPorDia">
                  <ng-container matColumnDef="fecha">
                    <th mat-header-cell *matHeaderCellDef>Fecha</th>
                    <td mat-cell *matCellDef="let r">{{ fmtFecha(r.fecha) }}</td>
                  </ng-container>
                  <ng-container matColumnDef="cantidad">
                    <th mat-header-cell *matHeaderCellDef>Transacciones</th>
                    <td mat-cell *matCellDef="let r" class="center-cell">{{ r.cantidad }}</td>
                  </ng-container>
                  <ng-container matColumnDef="monto">
                    <th mat-header-cell *matHeaderCellDef>Monto</th>
                    <td mat-cell *matCellDef="let r" class="amount-cell">{{ r.monto | currency:'USD':'symbol':'1.2-2' }}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="colPagos"></tr>
                  <tr mat-row *matRowDef="let row; columns: colPagos"></tr>
                </table>
              </div>
            } @else {
              <p class="empty-section">No hay pagos en el periodo</p>
            }

            <mat-divider style="margin: 24px 0;"></mat-divider>

            <!-- Desembolsos por Día -->
            <h3 class="section-title"><mat-icon>send</mat-icon> Desembolsos Realizados</h3>
            <p class="section-summary">{{ datos()!.totalDesembolsos }} desembolsos &mdash; {{ datos()!.montoTotalDesembolsos | currency:'USD':'symbol':'1.2-2' }}</p>
            @if (datos()!.desembolsosPorDia.length > 0) {
              <div class="table-responsive">
                <table mat-table [dataSource]="datos()!.desembolsosPorDia">
                  <ng-container matColumnDef="fecha">
                    <th mat-header-cell *matHeaderCellDef>Fecha</th>
                    <td mat-cell *matCellDef="let r">{{ fmtFecha(r.fecha) }}</td>
                  </ng-container>
                  <ng-container matColumnDef="cantidad">
                    <th mat-header-cell *matHeaderCellDef>Transacciones</th>
                    <td mat-cell *matCellDef="let r" class="center-cell">{{ r.cantidad }}</td>
                  </ng-container>
                  <ng-container matColumnDef="montoDesembolsado">
                    <th mat-header-cell *matHeaderCellDef>Monto</th>
                    <td mat-cell *matCellDef="let r" class="amount-cell">{{ r.montoDesembolsado | currency:'USD':'symbol':'1.2-2' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="fondosPropios">
                    <th mat-header-cell *matHeaderCellDef>Fondos Propios</th>
                    <td mat-cell *matCellDef="let r" class="amount-cell retiro-text">{{ r.fondosPropios | currency:'USD':'symbol':'1.2-2' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="transferenciaBancaria">
                    <th mat-header-cell *matHeaderCellDef>Transferencia</th>
                    <td mat-cell *matCellDef="let r" class="amount-cell ingreso-text">{{ r.transferenciaBancaria | currency:'USD':'symbol':'1.2-2' }}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="colDesembolsos"></tr>
                  <tr mat-row *matRowDef="let row; columns: colDesembolsos"></tr>
                </table>
              </div>
            } @else {
              <p class="empty-section">No hay desembolsos en el periodo</p>
            }

            <mat-divider style="margin: 24px 0;"></mat-divider>

            <!-- Cuadre -->
            <div class="cuadre">
              <div class="cuadre-row"><span>Pagos recibidos ({{ datos()!.totalPagos }})</span><span class="ingreso-text">+ {{ datos()!.montoTotalPagos | currency:'USD':'symbol':'1.2-2' }}</span></div>
              <div class="cuadre-row"><span>Transferencias bancarias en desembolsos</span><span class="ingreso-text">+ {{ datos()!.totalTransferenciaBancaria | currency:'USD':'symbol':'1.2-2' }}</span></div>
              <div class="cuadre-row total-ingresos"><span>TOTAL INGRESOS</span><span>{{ datos()!.totalIngresos | currency:'USD':'symbol':'1.2-2' }}</span></div>
              <div class="cuadre-row"><span>Fondos propios en desembolsos ({{ datos()!.totalDesembolsos }})</span><span class="retiro-text">- {{ datos()!.totalRetiros | currency:'USD':'symbol':'1.2-2' }}</span></div>
              <div class="cuadre-row total-entregar"><span>TOTAL A ENTREGAR</span><span>{{ datos()!.totalEntregar | currency:'USD':'symbol':'1.2-2' }}</span></div>
            </div>
          </mat-card-content>
        </mat-card>
      }

      @if (!isLoading() && reporteGenerado() && !datos()) {
        <mat-card><mat-card-content><div class="empty"><mat-icon>info</mat-icon><p>No se encontraron datos en el periodo</p></div></mat-card-content></mat-card>
      }
    </div>

    <!-- Térmica -->
    @if (datos()) {
      <div class="recibo-termica print-only">
        <div class="t-center"><strong>FINANZIA S.C. DE R.L. DE C.V.</strong><br>ARQUEO DE CAJA<br>Del {{ fmtFecha(datos()!.fechaDesde) }} al {{ fmtFecha(datos()!.fechaHasta) }}</div>
        <div class="t-sep">================================</div>
        <div class="t-center"><strong>PAGOS RECIBIDOS ({{ datos()!.totalPagos }})</strong></div>
        <div class="t-sep">--------------------------------</div>
        <div class="t-line"><span>FECHA</span><span>CANT</span><span>MONTO</span></div>
        <div class="t-sep">--------------------------------</div>
        @for (p of datos()!.pagosPorDia; track p.fecha) {
          <div class="t-line"><span>{{ fmtFecha(p.fecha) }}</span><span>{{ p.cantidad }}</span><span>\${{ p.monto.toFixed(2) }}</span></div>
        }
        <div class="t-sep">--------------------------------</div>
        <div class="t-line bold"><span>TOTAL</span><span>{{ datos()!.totalPagos }}</span><span>\${{ datos()!.montoTotalPagos.toFixed(2) }}</span></div>
        <div class="t-sep">================================</div>
        <div class="t-center"><strong>DESEMBOLSOS ({{ datos()!.totalDesembolsos }})</strong></div>
        <div class="t-sep">--------------------------------</div>
        <div class="t-line"><span>FECHA</span><span>CANT</span><span>MONTO</span></div>
        <div class="t-sep">--------------------------------</div>
        @for (d of datos()!.desembolsosPorDia; track d.fecha) {
          <div class="t-line"><span>{{ fmtFecha(d.fecha) }}</span><span>{{ d.cantidad }}</span><span>\${{ d.montoDesembolsado.toFixed(2) }}</span></div>
          <div class="t-detail">  F.Prop: \${{ d.fondosPropios.toFixed(2) }}  Trans: \${{ d.transferenciaBancaria.toFixed(2) }}</div>
        }
        <div class="t-sep">--------------------------------</div>
        <div class="t-line bold"><span>TOTAL</span><span>{{ datos()!.totalDesembolsos }}</span><span>\${{ datos()!.montoTotalDesembolsos.toFixed(2) }}</span></div>
        <div class="t-sep">================================</div>
        <div class="t-center"><strong>CUADRE</strong></div>
        <div class="t-sep">--------------------------------</div>
        <div class="t-line2"><span>Pagos recibidos</span><span>+\${{ datos()!.montoTotalPagos.toFixed(2) }}</span></div>
        <div class="t-line2"><span>Transferencias</span><span>+\${{ datos()!.totalTransferenciaBancaria.toFixed(2) }}</span></div>
        <div class="t-line2 bold"><span>TOTAL INGRESOS</span><span>\${{ datos()!.totalIngresos.toFixed(2) }}</span></div>
        <div class="t-line2"><span>Fondos propios</span><span>-\${{ datos()!.totalRetiros.toFixed(2) }}</span></div>
        <div class="t-sep">================================</div>
        <div class="t-line2 grande"><span>TOTAL A ENTREGAR</span><span>\${{ datos()!.totalEntregar.toFixed(2) }}</span></div>
        <div class="t-sep">================================</div>
        <div class="t-center t-footer"><br>Generado: {{ hoy | date:'dd/MM/yyyy HH:mm' }}<br>&nbsp;</div>
      </div>
    }
  `,
  styles: [`
    .container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    .export-buttons { display: flex; gap: 12px; flex-wrap: wrap; }

    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 16px; }
    .summary-item { display: flex; align-items: center; gap: 16px; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .summary-item mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .summary-item > div { display: flex; flex-direction: column; }
    .summary-label { font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500; }
    .summary-value { font-size: 24px; font-weight: 700; color: #333; margin-top: 4px; }
    .summary-detail { font-size: 12px; color: #888; margin-top: 2px; }
    .summary-item.ingreso { background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); }
    .summary-item.ingreso mat-icon { color: #2e7d32; }
    .summary-item.retiro { background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%); }
    .summary-item.retiro mat-icon { color: #c62828; }
    .summary-item.entregar { background: linear-gradient(135deg, #e1f3f5 0%, #b5e1e6 100%); }
    .summary-item.entregar mat-icon { color: #0F808C; }

    .section-title { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 500; color: #333; margin: 0 0 4px 0; }
    .section-summary { color: #666; font-size: 14px; margin: 0 0 12px 0; }
    .empty-section { color: #999; font-style: italic; text-align: center; padding: 16px; }
    .table-responsive { overflow-x: auto; }
    table { width: 100%; }
    .table-responsive table { min-width: 480px; }
    th { background-color: #f5f5f5; font-weight: 600; color: #333; white-space: nowrap; }
    .amount-cell { text-align: right; font-family: monospace; font-weight: 500; }
    .center-cell { text-align: center; }
    .ingreso-text { color: #2e7d32; }
    .retiro-text { color: #c62828; }

    .cuadre { background: #fafafa; border-radius: 12px; padding: 20px; }
    .cuadre-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 15px; gap: 12px; flex-wrap: wrap; }
    .cuadre-row > span:last-child { white-space: nowrap; }
    .cuadre-row.total-ingresos { border-top: 2px solid #2e7d32; font-weight: 700; font-size: 16px; color: #2e7d32; margin-top: 4px; padding-top: 12px; }
    .cuadre-row.total-entregar { border-top: 3px double #0F808C; font-weight: 700; font-size: 18px; color: #0F808C; margin-top: 8px; padding-top: 12px; }

    .empty { text-align: center; padding: 80px 20px; }
    .empty mat-icon { font-size: 80px; width: 80px; height: 80px; color: #bdbdbd; }
    .empty p { color: #666; font-size: 18px; margin: 16px 0; }

    .print-only { display: none; }

    @media (max-width: 960px) {
      .container { padding: 16px; }
      .header h1 { font-size: 24px; }
      .filters-row { grid-template-columns: 1fr; }
      .filter-actions, .export-buttons { flex-direction: column; }
      .filter-actions button, .export-buttons button { width: 100%; }
      .export-buttons { width: 100%; }
      .summary { grid-template-columns: 1fr; }
      .results-header { flex-direction: column; align-items: flex-start; }
    }

    @media (max-width: 480px) {
      .header h1 { font-size: 20px; }
      .header h1 mat-icon { font-size: 24px; width: 24px; height: 24px; }
      .subtitle { font-size: 13px; }
      .cuadre { padding: 12px; }
      .cuadre-row { font-size: 13px; }
      .cuadre-row.total-entregar { font-size: 15px; }
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
      .t-line { display: flex; justify-content: space-between; margin: 1mm 0; }
      .t-line2 { display: flex; justify-content: space-between; margin: 1mm 0; }
      .t-detail { font-size: 8pt; padding-left: 4px; }
      .bold { font-weight: bold; }
      .grande { font-size: 10pt; font-weight: bold; }
      .t-footer { font-size: 7pt; margin-top: 3mm; }

      * { color: #000 !important; background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  `],
})
export class ReporteArqueoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reporteService = inject(ReporteService);
  private snackBar = inject(MatSnackBar);

  isLoading = signal(false);
  reporteGenerado = signal(false);
  datos = signal<ArqueoResponse | null>(null);
  hoy = new Date();

  filtrosForm!: FormGroup;
  colPagos = ['fecha', 'cantidad', 'monto'];
  colDesembolsos = ['fecha', 'cantidad', 'montoDesembolsado', 'fondosPropios', 'transferenciaBancaria'];

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.filtrosForm = this.fb.group({
      fechaDesde: [primerDia, Validators.required],
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
    this.reporteService.getReporteArqueo(filtros).subscribe({
      next: (data) => { this.datos.set(data); this.reporteGenerado.set(true); this.isLoading.set(false); },
      error: (err) => { this.datos.set(null); this.reporteGenerado.set(true); this.isLoading.set(false); this.snackBar.open(err.error?.message || 'Error al generar el arqueo', 'Cerrar', { duration: 4000 }); },
    });
  }

  limpiarFiltros(): void { this.initForm(); this.datos.set(null); this.reporteGenerado.set(false); }
  imprimir(): void { window.print(); }

  exportarPDF(): void {
    const d = this.datos();
    if (!d) return;
    const doc = new jsPDF('portrait');
    const w = doc.internal.pageSize.width;

    doc.setFontSize(16); doc.setFont('helvetica', 'bold');
    doc.text('FINANZIA S.C. DE R.L. DE C.V.', w / 2, 18, { align: 'center' });
    doc.setFontSize(14);
    doc.text('ARQUEO DE CAJA', w / 2, 26, { align: 'center' });
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(`Del ${this.fmtFecha(d.fechaDesde)} al ${this.fmtFecha(d.fechaHasta)}`, w / 2, 33, { align: 'center' });
    doc.text(`Generado: ${new Date().toLocaleDateString('es-SV')}`, w / 2, 39, { align: 'center' });

    let y = 48;

    // Pagos
    doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.text(`PAGOS RECIBIDOS (${d.totalPagos})`, 14, y); y += 2;
    if (d.pagosPorDia.length > 0) {
      const rows = d.pagosPorDia.map(p => [this.fmtFecha(p.fecha), String(p.cantidad), `$${p.monto.toFixed(2)}`]);
      rows.push(['TOTAL', String(d.totalPagos), `$${d.montoTotalPagos.toFixed(2)}`]);
      autoTable(doc, { startY: y, head: [['Fecha', 'Transacciones', 'Monto']], body: rows, styles: { fontSize: 9 }, headStyles: { fillColor: [15, 128, 140] },
        didParseCell: (data) => { if (data.row.index === rows.length - 1) { data.cell.styles.fontStyle = 'bold'; data.cell.styles.fillColor = [232, 245, 233]; } },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    } else { doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.text('Sin pagos', 14, y + 6); y += 14; }

    // Desembolsos
    doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.text(`DESEMBOLSOS (${d.totalDesembolsos})`, 14, y); y += 2;
    if (d.desembolsosPorDia.length > 0) {
      const rows = d.desembolsosPorDia.map(dd => [this.fmtFecha(dd.fecha), String(dd.cantidad), `$${dd.montoDesembolsado.toFixed(2)}`, `$${dd.fondosPropios.toFixed(2)}`, `$${dd.transferenciaBancaria.toFixed(2)}`]);
      rows.push(['TOTAL', String(d.totalDesembolsos), `$${d.montoTotalDesembolsos.toFixed(2)}`, `$${d.totalFondosPropios.toFixed(2)}`, `$${d.totalTransferenciaBancaria.toFixed(2)}`]);
      autoTable(doc, { startY: y, head: [['Fecha', 'Trans.', 'Monto', 'F. Propios', 'Transferencia']], body: rows, styles: { fontSize: 9 }, headStyles: { fillColor: [15, 128, 140] },
        didParseCell: (data) => { if (data.row.index === rows.length - 1) { data.cell.styles.fontStyle = 'bold'; data.cell.styles.fillColor = [252, 228, 236]; } },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    } else { doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.text('Sin desembolsos', 14, y + 6); y += 14; }

    // Cuadre
    autoTable(doc, { startY: y, head: [['Concepto', 'Monto']], body: [
      ['Pagos recibidos', `+$${d.montoTotalPagos.toFixed(2)}`],
      ['Transferencias bancarias', `+$${d.totalTransferenciaBancaria.toFixed(2)}`],
      ['TOTAL INGRESOS', `$${d.totalIngresos.toFixed(2)}`],
      ['Fondos propios (retiros)', `-$${d.totalRetiros.toFixed(2)}`],
      ['TOTAL A ENTREGAR', `$${d.totalEntregar.toFixed(2)}`],
    ], styles: { fontSize: 9 }, headStyles: { fillColor: [15, 128, 140] }, columnStyles: { 1: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.row.index === 2) { data.cell.styles.fontStyle = 'bold'; data.cell.styles.fillColor = [232, 245, 233]; }
        if (data.row.index === 4) { data.cell.styles.fontStyle = 'bold'; data.cell.styles.fillColor = [225, 243, 245]; data.cell.styles.fontSize = 11; }
      },
    });

    const v2 = this.filtrosForm.value;
    doc.save(`arqueo-${this.fmtDate(v2.fechaDesde)}-${this.fmtDate(v2.fechaHasta)}.pdf`);
    this.snackBar.open('PDF generado', 'Cerrar', { duration: 3000 });
  }

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
