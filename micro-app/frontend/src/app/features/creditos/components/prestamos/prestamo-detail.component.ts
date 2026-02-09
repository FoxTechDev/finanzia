import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PrestamoService } from '../../services/prestamo.service';
import { RegistrarPagoDialogComponent } from '../pagos/registrar-pago-dialog/registrar-pago-dialog.component';
import { PagoService } from '../../services/pago.service';
import { CatalogosService } from '@features/catalogos/services/catalogos.service';
import { EstadoPrestamoModel } from '@core/models/catalogo.model';
import {
  Prestamo,
  PlanPago,
  Pago,
  EstadoPrestamo,
  EstadoCuota,
  ESTADO_PRESTAMO_LABELS,
  CATEGORIA_NCB022_LABELS,
  ESTADO_CUOTA_LABELS,
  PERIODICIDAD_PAGO_LABELS,
  TIPO_INTERES_LABELS,
  TIPO_CALCULO_LABELS,
} from '@core/models/credito.model';

@Component({
  selector: 'app-prestamo-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    MatListModule,
    MatDialogModule,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
  ],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="header">
        <button mat-icon-button (click)="volver()" matTooltip="Volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-info">
          <h1>Detalle de Préstamo</h1>
          @if (prestamo()) {
            <p class="subtitle">{{ prestamo()!.numeroCredito }}</p>
          }
        </div>
        <div class="header-actions">
          @if (prestamo() && (prestamo()!.estado === 'VIGENTE' || prestamo()!.estado === 'MORA')) {
            <button mat-raised-button color="primary" (click)="registrarPago()">
              <mat-icon>payment</mat-icon>
              Registrar Pago
            </button>
          }
          <button
            mat-raised-button
            color="accent"
            (click)="descargarEstadoCuentaPdf()"
            [disabled]="isDownloadingPdf()"
            matTooltip="Ver o descargar estado de cuenta">
            @if (isDownloadingPdf()) {
              <mat-spinner diameter="20" style="display: inline-block; margin-right: 8px;"></mat-spinner>
            } @else {
              <mat-icon>receipt_long</mat-icon>
            }
            Estado de Cuenta
          </button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando información del préstamo...</p>
        </div>
      } @else if (prestamo()) {
        <!-- Tabs -->
        <mat-tab-group [selectedIndex]="selectedTabIndex()" (selectedIndexChange)="onTabChange($event)">

          <!-- Tab 1: Información General -->
          <mat-tab label="Información General">
            <div class="tab-content">
              <div class="grid-2">
                <!-- Datos del Cliente -->
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>person</mat-icon> Datos del Cliente
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <mat-list>
                      <mat-list-item>
                        <span matListItemTitle>Nombre</span>
                        <span matListItemLine>
                          {{ getNombreCompleto() }}
                        </span>
                      </mat-list-item>
                      <mat-divider></mat-divider>
                      <mat-list-item>
                        <span matListItemTitle>DUI</span>
                        <span matListItemLine>{{ prestamo()!.cliente?.numeroDui || prestamo()!.persona?.numeroDui || 'No registrado' }}</span>
                      </mat-list-item>
                      <mat-divider></mat-divider>
                      <mat-list-item>
                        <span matListItemTitle>Cliente ID</span>
                        <span matListItemLine>{{ prestamo()!.personaId }}</span>
                      </mat-list-item>
                    </mat-list>
                  </mat-card-content>
                </mat-card>

                <!-- Datos del Préstamo -->
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>account_balance</mat-icon> Datos del Préstamo
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <mat-list>
                      <mat-list-item>
                        <span matListItemTitle>Número de Crédito</span>
                        <span matListItemLine><strong>{{ prestamo()!.numeroCredito }}</strong></span>
                      </mat-list-item>
                      <mat-divider></mat-divider>
                      <mat-list-item>
                        <span matListItemTitle>Tipo de Crédito</span>
                        <span matListItemLine>{{ prestamo()!.tipoCredito?.nombre || 'N/A' }}</span>
                      </mat-list-item>
                      <mat-divider></mat-divider>
                      <mat-list-item>
                        <span matListItemTitle>Monto Autorizado</span>
                        <span matListItemLine>{{ prestamo()!.montoAutorizado | currency:'USD':'symbol':'1.2-2' }}</span>
                      </mat-list-item>
                      <mat-divider></mat-divider>
                      <mat-list-item>
                        <span matListItemTitle>Monto Desembolsado</span>
                        <span matListItemLine class="highlight">{{ prestamo()!.montoDesembolsado | currency:'USD':'symbol':'1.2-2' }}</span>
                      </mat-list-item>
                    </mat-list>
                  </mat-card-content>
                </mat-card>

                <!-- Fechas -->
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>event</mat-icon> Fechas
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <mat-list>
                      <mat-list-item>
                        <span matListItemTitle>Fecha de Otorgamiento</span>
                        <span matListItemLine>{{ prestamo()!.fechaOtorgamiento | date:'dd/MM/yyyy' }}</span>
                      </mat-list-item>
                      <mat-divider></mat-divider>
                      <mat-list-item>
                        <span matListItemTitle>Primera Cuota</span>
                        <span matListItemLine>{{ prestamo()!.fechaPrimeraCuota | date:'dd/MM/yyyy' }}</span>
                      </mat-list-item>
                      <mat-divider></mat-divider>
                      <mat-list-item>
                        <span matListItemTitle>Fecha de Vencimiento</span>
                        <span matListItemLine>{{ prestamo()!.fechaVencimiento | date:'dd/MM/yyyy' }}</span>
                      </mat-list-item>
                      <mat-divider></mat-divider>
                      @if (prestamo()!.fechaUltimoPago) {
                        <mat-list-item>
                          <span matListItemTitle>Último Pago</span>
                          <span matListItemLine>{{ prestamo()!.fechaUltimoPago | date:'dd/MM/yyyy' }}</span>
                        </mat-list-item>
                      }
                    </mat-list>
                  </mat-card-content>
                </mat-card>

                <!-- Tasas y Condiciones -->
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>percent</mat-icon> Tasas y Condiciones
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <mat-list>
                      <mat-list-item>
                        <span matListItemTitle>Tasa de Interés</span>
                        <span matListItemLine>{{ prestamo()!.tasaInteres }}%</span>
                      </mat-list-item>
                      <mat-divider></mat-divider>
                      <mat-list-item>
                        <span matListItemTitle>Tasa Moratoria</span>
                        <span matListItemLine>{{ prestamo()!.tasaInteresMoratorio }}%</span>
                      </mat-list-item>
                      <mat-divider></mat-divider>
                      <mat-list-item>
                        <span matListItemTitle>Tipo de Interés</span>
                        <span matListItemLine>{{ getTipoInteresLabel() }}</span>
                      </mat-list-item>
                      <mat-divider></mat-divider>
                      <mat-list-item>
                        <span matListItemTitle>Periodicidad de Pago</span>
                        <span matListItemLine>{{ getPeriodicidadPagoLabel() }}</span>
                      </mat-list-item>
                      <mat-divider></mat-divider>
                      <mat-list-item>
                        <span matListItemTitle>Plazo</span>
                        <span matListItemLine>{{ prestamo()!.plazoAutorizado }} meses ({{ prestamo()!.numeroCuotas }} cuotas)</span>
                      </mat-list-item>
                      <mat-divider></mat-divider>
                      <mat-list-item>
                        <span matListItemTitle>Cuota Normal</span>
                        <span matListItemLine>{{ prestamo()!.cuotaNormal | currency:'USD':'symbol':'1.2-2' }}</span>
                      </mat-list-item>
                      <mat-divider></mat-divider>
                      <mat-list-item>
                        <span matListItemTitle>Cuota Total (con recargos)</span>
                        <span matListItemLine class="highlight">{{ prestamo()!.cuotaTotal | currency:'USD':'symbol':'1.2-2' }}</span>
                      </mat-list-item>
                    </mat-list>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 2: Saldos y Estado -->
          <mat-tab label="Saldos y Estado">
            <div class="tab-content">
              <div class="grid-2">
                <!-- Estado Actual -->
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>info</mat-icon> Estado Actual
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="status-badges">
                      <div class="status-item">
                        <span class="label">Estado del Préstamo</span>
                        <mat-chip-set>
                          <mat-chip [style.background-color]="getEstadoColor(prestamo()!.estado)" [style.color]="'white'">
                            {{ getEstadoLabel(prestamo()!.estado) }}
                          </mat-chip>
                        </mat-chip-set>
                      </div>
                      <div class="status-item">
                        <span class="label">Categoría</span>
                        <mat-chip-set>
                          <mat-chip [ngClass]="getCategoriaClass(prestamo()!.categoriaNCB022)">
                            {{ getCategoriaLabel(prestamo()!.categoriaNCB022) }}
                          </mat-chip>
                        </mat-chip-set>
                      </div>
                      @if (prestamo()!.diasMora > 0) {
                        <div class="status-item warn">
                          <mat-icon>error_outline</mat-icon>
                          <span class="label">Días de Mora</span>
                          <span class="value-large">{{ prestamo()!.diasMora }}</span>
                        </div>
                      }
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Saldos Principales -->
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>account_balance_wallet</mat-icon> Saldos Principales
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="balance-grid">
                      <div class="balance-item">
                        <span class="label">Saldo de Capital</span>
                        <span class="value">{{ prestamo()!.saldoCapital | currency:'USD':'symbol':'1.2-2' }}</span>
                      </div>
                      <div class="balance-item">
                        <span class="label">Saldo de Intereses</span>
                        <span class="value">{{ prestamo()!.saldoInteres | currency:'USD':'symbol':'1.2-2' }}</span>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Mora -->
                @if (prestamo()!.diasMora > 0) {
                  <mat-card class="mora-card">
                    <mat-card-header>
                      <mat-card-title>
                        <mat-icon>error</mat-icon> Saldos en Mora
                      </mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="balance-grid">
                        <div class="balance-item warn">
                          <span class="label">Capital en Mora</span>
                          <span class="value">{{ prestamo()!.capitalMora | currency:'USD':'symbol':'1.2-2' }}</span>
                        </div>
                        <div class="balance-item warn">
                          <span class="label">Interés en Mora</span>
                          <span class="value">{{ prestamo()!.interesMora | currency:'USD':'symbol':'1.2-2' }}</span>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }

                <!-- Totales -->
                <mat-card class="totales-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>calculate</mat-icon> Totales
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="balance-grid">
                      <div class="balance-item">
                        <span class="label">Total Interés</span>
                        <span class="value">{{ prestamo()!.totalInteres | currency:'USD':'symbol':'1.2-2' }}</span>
                      </div>
                      <div class="balance-item">
                        <span class="label">Total Recargos</span>
                        <span class="value">{{ prestamo()!.totalRecargos | currency:'USD':'symbol':'1.2-2' }}</span>
                      </div>
                      <div class="balance-item total">
                        <span class="label">Total a Pagar</span>
                        <span class="value-large">{{ prestamo()!.totalPagar | currency:'USD':'symbol':'1.2-2' }}</span>
                      </div>
                      <div class="balance-item total">
                        <span class="label">Total Adeudado Actual</span>
                        <span class="value-large highlight">{{ getTotalAdeudado() | currency:'USD':'symbol':'1.2-2' }}</span>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 3: Plan de Pagos -->
          <mat-tab label="Plan de Pagos">
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  @if (isLoadingPlanPago()) {
                    <div class="loading">
                      <mat-spinner diameter="30"></mat-spinner>
                      <p>Cargando plan de pagos...</p>
                    </div>
                  } @else {
                    <div class="table-responsive">
                      <table mat-table [dataSource]="planPago()" class="plan-pago-table">

                        <!-- Número de Cuota -->
                        <ng-container matColumnDef="numeroCuota">
                          <th mat-header-cell *matHeaderCellDef>No. Cuota</th>
                          <td mat-cell *matCellDef="let cuota">
                            <strong>{{ cuota.numeroCuota }}</strong>
                          </td>
                        </ng-container>

                        <!-- Fecha Vencimiento -->
                        <ng-container matColumnDef="fechaVencimiento">
                          <th mat-header-cell *matHeaderCellDef>Fecha Vencimiento</th>
                          <td mat-cell *matCellDef="let cuota">
                            {{ cuota.fechaVencimiento | date:'dd/MM/yyyy' }}
                          </td>
                        </ng-container>

                        <!-- Capital -->
                        <ng-container matColumnDef="capital">
                          <th mat-header-cell *matHeaderCellDef>Capital</th>
                          <td mat-cell *matCellDef="let cuota">
                            {{ cuota.capital | currency:'USD':'symbol':'1.2-2' }}
                          </td>
                        </ng-container>

                        <!-- Interés -->
                        <ng-container matColumnDef="interes">
                          <th mat-header-cell *matHeaderCellDef>Interés</th>
                          <td mat-cell *matCellDef="let cuota">
                            {{ cuota.interes | currency:'USD':'symbol':'1.2-2' }}
                          </td>
                        </ng-container>

                        <!-- Recargos -->
                        <ng-container matColumnDef="recargos">
                          <th mat-header-cell *matHeaderCellDef>Recargos</th>
                          <td mat-cell *matCellDef="let cuota">
                            {{ cuota.recargos | currency:'USD':'symbol':'1.2-2' }}
                          </td>
                        </ng-container>

                        <!-- Interés Moratorio -->
                        <ng-container matColumnDef="interesMoratorio">
                          <th mat-header-cell *matHeaderCellDef>Interés Mora</th>
                          <td mat-cell *matCellDef="let cuota">
                            @if (cuota.interesMoratorio > 0) {
                              <span class="text-warn">{{ cuota.interesMoratorio | currency:'USD':'symbol':'1.2-2' }}</span>
                            } @else {
                              <span class="text-muted">-</span>
                            }
                          </td>
                        </ng-container>

                        <!-- Total Cuota -->
                        <ng-container matColumnDef="cuotaTotal">
                          <th mat-header-cell *matHeaderCellDef>Total Cuota</th>
                          <td mat-cell *matCellDef="let cuota">
                            <strong>{{ cuota.cuotaTotal | currency:'USD':'symbol':'1.2-2' }}</strong>
                          </td>
                        </ng-container>

                        <!-- Estado -->
                        <ng-container matColumnDef="estado">
                          <th mat-header-cell *matHeaderCellDef>Estado</th>
                          <td mat-cell *matCellDef="let cuota">
                            <mat-chip-set>
                              <mat-chip [ngClass]="getEstadoCuotaClass(cuota.estado)">
                                {{ getEstadoCuotaLabel(cuota.estado) }}
                              </mat-chip>
                            </mat-chip-set>
                          </td>
                        </ng-container>

                        <!-- Saldo Capital -->
                        <ng-container matColumnDef="saldoCapital">
                          <th mat-header-cell *matHeaderCellDef>Saldo Capital</th>
                          <td mat-cell *matCellDef="let cuota">
                            {{ cuota.saldoCapital | currency:'USD':'symbol':'1.2-2' }}
                          </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="planPagoColumns"></tr>
                        <tr
                          mat-row
                          *matRowDef="let row; columns: planPagoColumns"
                          [ngClass]="getRowClass(row)"
                        ></tr>
                      </table>
                    </div>
                  }
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Tab 4: Deducciones y Recargos -->
          <mat-tab label="Deducciones y Recargos">
            <div class="tab-content">
              <div class="grid-2">
                <!-- Deducciones -->
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>remove_circle_outline</mat-icon> Deducciones Aplicadas
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    @if (prestamo()!.deducciones && prestamo()!.deducciones!.length > 0) {
                      <div class="deductions-list">
                        @for (deduccion of prestamo()!.deducciones; track deduccion.id) {
                          <div class="deduction-item">
                            <div class="deduction-header">
                              <span class="deduction-name">{{ deduccion.nombre }}</span>
                              <span class="deduction-amount">{{ deduccion.montoCalculado | currency:'USD':'symbol':'1.2-2' }}</span>
                            </div>
                            <div class="deduction-details">
                              <span class="detail-label">{{ getTipoCalculoLabel(deduccion.tipoCalculo) }}:</span>
                              <span class="detail-value">
                                @if (deduccion.tipoCalculo === 'PORCENTAJE') {
                                  {{ deduccion.valor }}%
                                } @else {
                                  {{ deduccion.valor | currency:'USD':'symbol':'1.2-2' }}
                                }
                              </span>
                            </div>
                          </div>
                          <mat-divider></mat-divider>
                        }
                        <div class="total-deductions">
                          <span>Total Deducciones:</span>
                          <span class="total-amount">{{ getTotalDeducciones() | currency:'USD':'symbol':'1.2-2' }}</span>
                        </div>
                      </div>
                    } @else {
                      <div class="empty-state">
                        <mat-icon>info</mat-icon>
                        <p>No se aplicaron deducciones a este préstamo</p>
                      </div>
                    }
                  </mat-card-content>
                </mat-card>

                <!-- Recargos -->
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>add_circle_outline</mat-icon> Recargos Aplicados
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    @if (prestamo()!.recargos && prestamo()!.recargos!.length > 0) {
                      <div class="deductions-list">
                        @for (recargo of prestamo()!.recargos; track recargo.id) {
                          <div class="deduction-item">
                            <div class="deduction-header">
                              <span class="deduction-name">{{ recargo.nombre }}</span>
                              <span class="deduction-amount">{{ recargo.montoCalculado | currency:'USD':'symbol':'1.2-2' }}</span>
                            </div>
                            <div class="deduction-details">
                              <span class="detail-label">{{ getTipoCalculoLabel(recargo.tipoCalculo) }}:</span>
                              <span class="detail-value">
                                @if (recargo.tipoCalculo === 'PORCENTAJE') {
                                  {{ recargo.valor }}%
                                } @else {
                                  {{ recargo.valor | currency:'USD':'symbol':'1.2-2' }}
                                }
                              </span>
                              <span class="detail-label">Aplica en cuotas:</span>
                              <span class="detail-value">{{ recargo.aplicaDesde }} - {{ recargo.aplicaHasta }}</span>
                            </div>
                          </div>
                          <mat-divider></mat-divider>
                        }
                        <div class="total-deductions">
                          <span>Total Recargos por Cuota:</span>
                          <span class="total-amount">{{ getTotalRecargosPorCuota() | currency:'USD':'symbol':'1.2-2' }}</span>
                        </div>
                      </div>
                    } @else {
                      <div class="empty-state">
                        <mat-icon>info</mat-icon>
                        <p>No se aplicaron recargos a este préstamo</p>
                      </div>
                    }
                  </mat-card-content>
                </mat-card>
              </div>

              <!-- Resumen de desembolso -->
              <mat-card class="summary-desembolso">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>receipt</mat-icon> Resumen de Desembolso
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="summary-grid">
                    <div class="summary-row">
                      <span class="label">Monto Autorizado:</span>
                      <span class="value">{{ prestamo()!.montoAutorizado | currency:'USD':'symbol':'1.2-2' }}</span>
                    </div>
                    <div class="summary-row">
                      <span class="label">(-) Total Deducciones:</span>
                      <span class="value negative">{{ getTotalDeducciones() | currency:'USD':'symbol':'1.2-2' }}</span>
                    </div>
                    <mat-divider></mat-divider>
                    <div class="summary-row total">
                      <span class="label"><strong>Monto Desembolsado:</strong></span>
                      <span class="value"><strong>{{ prestamo()!.montoDesembolsado | currency:'USD':'symbol':'1.2-2' }}</strong></span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Tab 5: Pagos Realizados -->
          <mat-tab label="Pagos Realizados">
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  @if (isLoadingPagos()) {
                    <div class="loading">
                      <mat-spinner diameter="30"></mat-spinner>
                      <p>Cargando pagos...</p>
                    </div>
                  } @else if (pagos().length === 0) {
                    <div class="empty-state">
                      <mat-icon>payments</mat-icon>
                      <p>No se han registrado pagos para este préstamo</p>
                    </div>
                  } @else {
                    <div class="table-responsive">
                      <table mat-table [dataSource]="pagos()" class="pagos-table">

                        <!-- Número de Pago -->
                        <ng-container matColumnDef="numeroPago">
                          <th mat-header-cell *matHeaderCellDef>No. Recibo</th>
                          <td mat-cell *matCellDef="let pago">
                            <strong>{{ pago.numeroPago }}</strong>
                          </td>
                        </ng-container>

                        <!-- Fecha de Pago -->
                        <ng-container matColumnDef="fechaPago">
                          <th mat-header-cell *matHeaderCellDef>Fecha</th>
                          <td mat-cell *matCellDef="let pago">
                            {{ pago.fechaPago | date:'dd/MM/yyyy' }}
                          </td>
                        </ng-container>

                        <!-- Monto Pagado -->
                        <ng-container matColumnDef="montoPagado">
                          <th mat-header-cell *matHeaderCellDef>Monto Total</th>
                          <td mat-cell *matCellDef="let pago">
                            <strong>{{ pago.montoPagado | currency:'USD':'symbol':'1.2-2' }}</strong>
                          </td>
                        </ng-container>

                        <!-- Capital Aplicado -->
                        <ng-container matColumnDef="capitalAplicado">
                          <th mat-header-cell *matHeaderCellDef>Capital</th>
                          <td mat-cell *matCellDef="let pago">
                            {{ pago.capitalAplicado | currency:'USD':'symbol':'1.2-2' }}
                          </td>
                        </ng-container>

                        <!-- Interés Aplicado -->
                        <ng-container matColumnDef="interesAplicado">
                          <th mat-header-cell *matHeaderCellDef>Interés</th>
                          <td mat-cell *matCellDef="let pago">
                            {{ pago.interesAplicado | currency:'USD':'symbol':'1.2-2' }}
                          </td>
                        </ng-container>

                        <!-- Recargos Aplicados -->
                        <ng-container matColumnDef="recargosAplicado">
                          <th mat-header-cell *matHeaderCellDef>Recargos</th>
                          <td mat-cell *matCellDef="let pago">
                            @if (pago.recargosAplicado > 0) {
                              {{ pago.recargosAplicado | currency:'USD':'symbol':'1.2-2' }}
                            } @else {
                              <span class="text-muted">-</span>
                            }
                          </td>
                        </ng-container>

                        <!-- Interés Moratorio Aplicado -->
                        <ng-container matColumnDef="interesMoratorioAplicado">
                          <th mat-header-cell *matHeaderCellDef>Int. Mora</th>
                          <td mat-cell *matCellDef="let pago">
                            @if (pago.interesMoratorioAplicado > 0) {
                              <span class="text-warn">{{ pago.interesMoratorioAplicado | currency:'USD':'symbol':'1.2-2' }}</span>
                            } @else {
                              <span class="text-muted">-</span>
                            }
                          </td>
                        </ng-container>

                        <!-- Recargo Manual Aplicado -->
                        <ng-container matColumnDef="recargoManualAplicado">
                          <th mat-header-cell *matHeaderCellDef>Rec. Manual</th>
                          <td mat-cell *matCellDef="let pago">
                            @if (pago.recargoManualAplicado > 0) {
                              <span class="text-warn">{{ pago.recargoManualAplicado | currency:'USD':'symbol':'1.2-2' }}</span>
                            } @else {
                              <span class="text-muted">-</span>
                            }
                          </td>
                        </ng-container>

                        <!-- Estado -->
                        <ng-container matColumnDef="estado">
                          <th mat-header-cell *matHeaderCellDef>Estado</th>
                          <td mat-cell *matCellDef="let pago">
                            <mat-chip-set>
                              <mat-chip [ngClass]="getEstadoPagoClass(pago.estado)">
                                {{ pago.estado }}
                              </mat-chip>
                            </mat-chip-set>
                          </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="pagosColumns"></tr>
                        <tr
                          mat-row
                          *matRowDef="let row; columns: pagosColumns"
                          [ngClass]="{ 'row-anulado': row.estado === 'ANULADO' }"
                        ></tr>
                      </table>
                    </div>

                    <!-- Resumen de pagos -->
                    <div class="pagos-resumen">
                      <div class="resumen-item">
                        <span class="label">Total Pagado:</span>
                        <span class="value">{{ getTotalPagado() | currency:'USD':'symbol':'1.2-2' }}</span>
                      </div>
                      <div class="resumen-item">
                        <span class="label">Capital Pagado:</span>
                        <span class="value">{{ getTotalCapitalPagado() | currency:'USD':'symbol':'1.2-2' }}</span>
                      </div>
                      <div class="resumen-item">
                        <span class="label">Interés Pagado:</span>
                        <span class="value">{{ getTotalInteresPagado() | currency:'USD':'symbol':'1.2-2' }}</span>
                      </div>
                      @if (getTotalRecargoManualPagado() > 0) {
                        <div class="resumen-item">
                          <span class="label">Recargo Manual Pagado:</span>
                          <span class="value text-warn">{{ getTotalRecargoManualPagado() | currency:'USD':'symbol':'1.2-2' }}</span>
                        </div>
                      }
                    </div>
                  }
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .container {
      padding: 16px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .header-info {
      flex: 1;
    }

    .header-info h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 500;
    }

    .subtitle {
      color: #666;
      margin: 4px 0 0 0;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .header-actions button {
      white-space: nowrap;
    }

    .header-actions button mat-icon {
      margin-right: 4px;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px;
      gap: 16px;
    }

    .loading p {
      color: #666;
      margin: 0;
    }

    .tab-content {
      padding: 24px 16px;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 16px;
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px !important;
    }

    mat-list-item {
      height: auto !important;
      min-height: 48px;
      padding: 8px 0;
    }

    .highlight {
      color: #1976d2;
      font-weight: 600;
    }

    /* Status badges */
    .status-badges {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .status-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .status-item.warn {
      background-color: #fff3e0;
    }

    .status-item .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-item .value-large {
      font-size: 32px;
      font-weight: 700;
      color: #f57c00;
    }

    /* Balance grid */
    .balance-grid {
      display: grid;
      gap: 16px;
    }

    .balance-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .balance-item.warn {
      background-color: #fff3e0;
    }

    .balance-item.total {
      background-color: #e3f2fd;
    }

    .balance-item .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .balance-item .value {
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .balance-item .value-large {
      font-size: 24px;
      font-weight: 700;
      color: #1976d2;
    }

    .mora-card {
      border-left: 4px solid #ff9800;
    }

    .totales-card {
      border-left: 4px solid #2196f3;
    }

    /* Plan de pagos table */
    .table-responsive {
      overflow-x: auto;
    }

    .plan-pago-table {
      width: 100%;
    }

    .plan-pago-table tr.row-pagada {
      background-color: #e8f5e9;
    }

    .plan-pago-table tr.row-mora {
      background-color: #fff3e0;
    }

    .plan-pago-table tr.row-pendiente {
      background-color: #f5f5f5;
    }

    .text-warn {
      color: #f57c00;
      font-weight: 500;
    }

    .text-muted {
      color: #999;
    }

    /* Deducciones y recargos */
    .deductions-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .deduction-item {
      padding: 12px 0;
    }

    .deduction-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .deduction-name {
      font-weight: 500;
      font-size: 14px;
    }

    .deduction-amount {
      font-weight: 600;
      font-size: 16px;
      color: #1976d2;
    }

    .deduction-details {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      font-size: 12px;
      color: #666;
    }

    .detail-label {
      font-weight: 500;
    }

    .detail-value {
      color: #333;
    }

    .total-deductions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0 8px;
      font-size: 16px;
      font-weight: 600;
    }

    .total-amount {
      font-size: 18px;
      color: #1976d2;
    }

    .empty-state {
      text-align: center;
      padding: 32px;
      color: #999;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
    }

    .summary-desembolso {
      margin-top: 16px;
    }

    .summary-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .summary-row.total {
      padding-top: 16px;
      font-size: 18px;
    }

    .summary-row .value.negative {
      color: #f44336;
    }

    /* Estados del préstamo */
    mat-chip.estado-vigente {
      background-color: #4caf50 !important;
      color: white !important;
    }

    mat-chip.estado-mora {
      background-color: #ff9800 !important;
      color: white !important;
    }

    mat-chip.estado-cancelado {
      background-color: #2196f3 !important;
      color: white !important;
    }

    mat-chip.estado-castigado {
      background-color: #f44336 !important;
      color: white !important;
    }

    /* Categorías NCB-022 */
    mat-chip.categoria-a {
      background-color: #4caf50 !important;
      color: white !important;
    }

    mat-chip.categoria-b {
      background-color: #8bc34a !important;
      color: white !important;
    }

    mat-chip.categoria-c {
      background-color: #ff9800 !important;
      color: white !important;
    }

    mat-chip.categoria-d {
      background-color: #ff5722 !important;
      color: white !important;
    }

    mat-chip.categoria-e {
      background-color: #f44336 !important;
      color: white !important;
    }

    /* Estados de cuota */
    mat-chip.cuota-pagada {
      background-color: #4caf50 !important;
      color: white !important;
    }

    mat-chip.cuota-pendiente {
      background-color: #9e9e9e !important;
      color: white !important;
    }

    mat-chip.cuota-mora {
      background-color: #ff9800 !important;
      color: white !important;
    }

    mat-chip.cuota-parcial {
      background-color: #2196f3 !important;
      color: white !important;
    }

    /* Responsive */
    @media (max-width: 960px) {
      .grid-2 {
        grid-template-columns: 1fr;
      }

      .header {
        flex-wrap: wrap;
      }

      .header-actions {
        width: 100%;
        flex-direction: column;
      }

      .header-actions button {
        width: 100%;
      }
    }

    @media (min-width: 961px) and (max-width: 1200px) {
      .header-actions button {
        font-size: 13px;
        padding: 0 12px;
      }
    }

    /* Tabla de pagos */
    .pagos-table {
      width: 100%;
    }

    .pagos-table tr.row-anulado {
      background-color: #ffebee;
      opacity: 0.7;
    }

    mat-chip.pago-aplicado {
      background-color: #4caf50 !important;
      color: white !important;
    }

    mat-chip.pago-anulado {
      background-color: #f44336 !important;
      color: white !important;
    }

    /* Resumen de pagos */
    .pagos-resumen {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      margin-top: 24px;
      padding: 16px;
      background-color: #e3f2fd;
      border-radius: 8px;
    }

    .pagos-resumen .resumen-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .pagos-resumen .resumen-item .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .pagos-resumen .resumen-item .value {
      font-size: 18px;
      font-weight: 600;
      color: #1976d2;
    }

    .pagos-resumen .resumen-item .value.text-warn {
      color: #f57c00;
    }
  `],
})
export class PrestamoDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(PrestamoService);
  private pagoService = inject(PagoService);
  private catalogosService = inject(CatalogosService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  prestamo = signal<Prestamo | null>(null);
  planPago = signal<PlanPago[]>([]);
  pagos = signal<Pago[]>([]);
  isLoading = signal(true);
  isLoadingPlanPago = signal(false);
  isLoadingPagos = signal(false);
  isDownloadingPdf = signal(false);
  selectedTabIndex = signal(0);
  estadosPrestamo = signal<EstadoPrestamoModel[]>([]);

  planPagoColumns = [
    'numeroCuota',
    'fechaVencimiento',
    'capital',
    'interes',
    'recargos',
    'interesMoratorio',
    'cuotaTotal',
    'estado',
    'saldoCapital',
  ];

  pagosColumns = [
    'numeroPago',
    'fechaPago',
    'montoPagado',
    'capitalAplicado',
    'interesAplicado',
    'recargosAplicado',
    'interesMoratorioAplicado',
    'recargoManualAplicado',
    'estado',
  ];

  ngOnInit(): void {
    this.loadEstadosPrestamo();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadPrestamo(id);
    }

    // Manejar navegación a tabs específicos por fragment
    this.route.fragment.subscribe(fragment => {
      if (fragment === 'plan-pagos') {
        this.selectedTabIndex.set(2);
      } else if (fragment === 'historial-pagos' || fragment === 'pagos') {
        this.selectedTabIndex.set(4);
        // Cargar pagos si no están cargados
        if (this.pagos().length === 0 && this.prestamo()) {
          this.loadPagos();
        }
      }
    });
  }

  loadEstadosPrestamo(): void {
    this.catalogosService.getEstadosPrestamo(true).subscribe({
      next: (data) => {
        this.estadosPrestamo.set(data as EstadoPrestamoModel[]);
      },
      error: (err) => {
        console.error('Error al cargar estados de préstamo:', err);
      },
    });
  }

  loadPrestamo(id: number): void {
    this.isLoading.set(true);
    this.service.getById(id).subscribe({
      next: (data) => {
        this.prestamo.set(data);
        this.isLoading.set(false);
        // Cargar plan de pago si tiene
        if (data.planPago && data.planPago.length > 0) {
          this.planPago.set(data.planPago);
        }
      },
      error: (err) => {
        this.snackBar.open(
          err.error?.message || 'Error al cargar el préstamo',
          'Cerrar',
          { duration: 3000 }
        );
        this.isLoading.set(false);
        this.volver();
      },
    });
  }

  onTabChange(index: number): void {
    this.selectedTabIndex.set(index);

    // Cargar plan de pago cuando se selecciona el tab
    if (index === 2 && this.planPago().length === 0 && this.prestamo()) {
      this.loadPlanPago();
    }

    // Cargar pagos cuando se selecciona el tab de pagos
    if (index === 4 && this.pagos().length === 0 && this.prestamo()) {
      this.loadPagos();
    }
  }

  loadPlanPago(): void {
    const prestamoId = this.prestamo()?.id;
    if (!prestamoId) return;

    this.isLoadingPlanPago.set(true);
    this.service.getPlanPago(prestamoId).subscribe({
      next: (data) => {
        this.planPago.set(data);
        this.isLoadingPlanPago.set(false);
      },
      error: (err) => {
        this.snackBar.open(
          err.error?.message || 'Error al cargar el plan de pagos',
          'Cerrar',
          { duration: 3000 }
        );
        this.isLoadingPlanPago.set(false);
      },
    });
  }

  loadPagos(): void {
    const prestamoId = this.prestamo()?.id;
    if (!prestamoId) return;

    this.isLoadingPagos.set(true);
    this.pagoService.getByPrestamo(prestamoId).subscribe({
      next: (data) => {
        this.pagos.set(data);
        this.isLoadingPagos.set(false);
      },
      error: (err) => {
        this.snackBar.open(
          err.error?.message || 'Error al cargar los pagos',
          'Cerrar',
          { duration: 3000 }
        );
        this.isLoadingPagos.set(false);
      },
    });
  }

  getNombreCompleto(): string {
    const c = this.prestamo()?.cliente;
    if (c?.nombreCompleto) return c.nombreCompleto;
    if (c) return `${c.nombre || ''} ${c.apellido || ''}`.trim();
    // Fallback a persona si cliente no está disponible
    const p = this.prestamo()?.persona;
    if (!p) return 'N/A';
    return `${p.nombre || ''} ${p.apellido || ''}`.trim();
  }

  getTipoInteresLabel(): string {
    const tipo = this.prestamo()?.tipoInteres;
    return tipo ? TIPO_INTERES_LABELS[tipo] : 'N/A';
  }

  getPeriodicidadPagoLabel(): string {
    const periodicidad = this.prestamo()?.periodicidadPago;
    return periodicidad ? PERIODICIDAD_PAGO_LABELS[periodicidad] : 'N/A';
  }

  getEstadoLabel(estado: EstadoPrestamo): string {
    const estadoCatalogo = this.estadosPrestamo().find(e => e.codigo === estado);
    return estadoCatalogo?.nombre || ESTADO_PRESTAMO_LABELS[estado] || estado;
  }

  getEstadoClass(estado: EstadoPrestamo): string {
    return 'estado-' + estado.toLowerCase();
  }

  getEstadoColor(estado: EstadoPrestamo): string {
    const estadoCatalogo = this.estadosPrestamo().find(e => e.codigo === estado);
    return estadoCatalogo?.color || '#666666';
  }

  getCategoriaLabel(categoria: string): string {
    const cat = categoria as keyof typeof CATEGORIA_NCB022_LABELS;
    return CATEGORIA_NCB022_LABELS[cat] ?? categoria;
  }

  getCategoriaClass(categoria: string): string {
    return 'categoria-' + categoria.toLowerCase();
  }

  getEstadoCuotaLabel(estado: EstadoCuota): string {
    return ESTADO_CUOTA_LABELS[estado] || estado;
  }

  getEstadoCuotaClass(estado: EstadoCuota): string {
    return 'cuota-' + estado.toLowerCase();
  }

  getRowClass(cuota: PlanPago): string {
    switch (cuota.estado) {
      case 'PAGADA':
        return 'row-pagada';
      case 'MORA':
        return 'row-mora';
      default:
        return 'row-pendiente';
    }
  }

  getTipoCalculoLabel(tipo: string): string {
    const tc = tipo as keyof typeof TIPO_CALCULO_LABELS;
    return TIPO_CALCULO_LABELS[tc] ?? tipo;
  }

  getTotalAdeudado(): number {
    const p = this.prestamo();
    if (!p) return 0;
    return p.saldoCapital + p.saldoInteres + p.interesMora;
  }

  getTotalDeducciones(): number {
    return this.prestamo()?.deducciones?.reduce((sum, d) => sum + d.montoCalculado, 0) || 0;
  }

  getTotalRecargosPorCuota(): number {
    return this.prestamo()?.recargos?.reduce((sum, r) => sum + r.montoCalculado, 0) || 0;
  }

  getTotalPagado(): number {
    return this.pagos()
      .filter(p => p.estado === 'APLICADO')
      .reduce((sum, p) => sum + Number(p.montoPagado), 0);
  }

  getTotalCapitalPagado(): number {
    return this.pagos()
      .filter(p => p.estado === 'APLICADO')
      .reduce((sum, p) => sum + Number(p.capitalAplicado), 0);
  }

  getTotalInteresPagado(): number {
    return this.pagos()
      .filter(p => p.estado === 'APLICADO')
      .reduce((sum, p) => sum + Number(p.interesAplicado), 0);
  }

  getTotalRecargoManualPagado(): number {
    return this.pagos()
      .filter(p => p.estado === 'APLICADO')
      .reduce((sum, p) => sum + Number(p.recargoManualAplicado || 0), 0);
  }

  getEstadoPagoClass(estado: string): string {
    return estado === 'APLICADO' ? 'pago-aplicado' : 'pago-anulado';
  }

  volver(): void {
    this.router.navigate(['/creditos/prestamos']);
  }

  registrarPago(): void {
    const prestamo = this.prestamo();
    if (!prestamo) {
      this.snackBar.open('No se pudo cargar la información del préstamo', 'Cerrar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(RegistrarPagoDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      disableClose: true,
      data: { prestamo },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Recargar el préstamo para mostrar los nuevos saldos
        this.loadPrestamo(prestamo.id);
        // Recargar el plan de pago si estaba cargado
        if (this.planPago().length > 0) {
          this.loadPlanPago();
        }
        // Recargar los pagos si estaban cargados
        if (this.pagos().length > 0) {
          this.loadPagos();
        }
        this.snackBar.open('Pago registrado exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  imprimirEstadoCuenta(): void {
    this.snackBar.open('Generando estado de cuenta...', 'Cerrar', { duration: 2000 });
  }

  /**
   * Detecta si el dispositivo es móvil
   */
  private isMobileDevice(): boolean {
    return window.innerWidth <= 768;
  }

  /**
   * Muestra el estado de cuenta - móvil o PDF según el dispositivo
   */
  descargarEstadoCuentaPdf(): void {
    const prestamoId = this.prestamo()?.id;
    const numeroCredito = this.prestamo()?.numeroCredito;

    if (!prestamoId || !numeroCredito) {
      this.snackBar.open('No se pudo identificar el préstamo', 'Cerrar', { duration: 3000 });
      return;
    }

    // Si es móvil, navegar a la vista móvil del estado de cuenta
    if (this.isMobileDevice()) {
      this.router.navigate(['/creditos/prestamos', prestamoId, 'estado-cuenta-movil']);
      return;
    }

    // En escritorio, descargar el PDF
    this.isDownloadingPdf.set(true);

    this.pagoService.descargarEstadoCuentaPdf(prestamoId).subscribe({
      next: (blob) => {
        // Crear un enlace temporal para descargar el archivo
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `estado-cuenta-${numeroCredito}.pdf`;

        // Simular click en el enlace
        document.body.appendChild(link);
        link.click();

        // Limpiar recursos
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.isDownloadingPdf.set(false);
        this.snackBar.open('Estado de cuenta descargado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.isDownloadingPdf.set(false);
        this.snackBar.open(
          err.error?.message || 'Error al descargar el estado de cuenta. Por favor, intente nuevamente.',
          'Cerrar',
          { duration: 5000 }
        );
      }
    });
  }
}
