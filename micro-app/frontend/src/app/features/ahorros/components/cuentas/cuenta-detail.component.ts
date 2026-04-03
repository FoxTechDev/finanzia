import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CuentaAhorroService } from '../../services/cuenta-ahorro.service';
import { TransaccionAhorroService } from '../../services/transaccion-ahorro.service';
import { BeneficiarioService } from '../../services/beneficiario.service';
import { CuentaAhorroDetalle, TransaccionAhorro, PlanCapitalizacion, BeneficiarioCuentaAhorro } from '@core/models/ahorro.model';
import { BeneficiarioDialogComponent } from './beneficiario-dialog.component';
import { HasRoleDirective } from '@core/directives/has-role.directive';
import { RoleCodes } from '@core/models/user.model';

@Component({
  selector: 'app-cuenta-detail',
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
    MatDialogModule,
    DecimalPipe,
    DatePipe,
    HasRoleDirective,
  ],
  template: `
    <div class="container">
      @if (isLoading()) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (cuenta()) {
        <div class="header">
          <div>
            <button mat-icon-button (click)="goBack()" matTooltip="Volver">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <h1>Cuenta {{ cuenta()!.noCuenta }}</h1>
          </div>
          <div class="header-actions">
            @if (lineaCodigo === 'DPF' || lineaCodigo === 'AP') {
              <button mat-stroked-button color="primary" (click)="descargarReporteIntereses()">
                <mat-icon>picture_as_pdf</mat-icon> Reporte Intereses
              </button>
            }
            @if (lineaCodigo === 'DPF') {
              <button mat-raised-button color="primary" (click)="descargarContrato()">
                <mat-icon>description</mat-icon> Contrato DPF
              </button>
            }
            @if (lineaCodigo === 'DPF' && cuenta()!.estado.toUpperCase() === 'ACTIVA') {
              <button
                *appHasRole="[RoleCodes.ADMIN, RoleCodes.COMITE]"
                mat-raised-button
                color="accent"
                (click)="renovarDpf()"
                [disabled]="renovando()"
              >
                @if (renovando()) {
                  <mat-spinner diameter="18" style="display: inline-block; margin-right: 8px;"></mat-spinner>
                } @else {
                  <mat-icon>autorenew</mat-icon>
                }
                Renovar DPF
              </button>
            }
          </div>
        </div>

        <mat-tab-group>
          <!-- Tab: Información General -->
          <mat-tab label="Información General">
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  <div class="info-grid">
                    <div class="info-item">
                      <label>No. Cuenta</label>
                      <span>{{ cuenta()!.noCuenta }}</span>
                    </div>
                    <div class="info-item">
                      <label>Cliente</label>
                      <span>{{ cuenta()!.nombreCliente }}</span>
                    </div>
                    <div class="info-item">
                      <label>DUI</label>
                      <span>{{ cuenta()!.numeroDui }}</span>
                    </div>
                    <div class="info-item">
                      <label>Tipo de Ahorro</label>
                      <span>{{ cuenta()!.tipoAhorro }}</span>
                    </div>
                    <div class="info-item">
                      <label>Línea</label>
                      <span>{{ cuenta()!.lineaAhorro }}</span>
                    </div>
                    <div class="info-item">
                      <label>Estado</label>
                      <mat-chip-set>
                        <mat-chip [ngClass]="'estado-' + cuenta()!.estado.toLowerCase()">
                          {{ cuenta()!.estado }}
                        </mat-chip>
                      </mat-chip-set>
                    </div>
                    <div class="info-item">
                      <label>Fecha Apertura</label>
                      <span>{{ cuenta()!.fechaApertura | date:'dd/MM/yyyy' }}</span>
                    </div>
                    <div class="info-item">
                      <label>Tasa Interés</label>
                      <span>{{ cuenta()!.tasaInteres }}%</span>
                    </div>
                    <div class="info-item">
                      <label>Monto Apertura</label>
                      <span>\${{ cuenta()!.monto | number:'1.2-2' }}</span>
                    </div>
                    <div class="info-item highlight">
                      <label>Saldo</label>
                      <span class="saldo">\${{ cuenta()!.saldo | number:'1.2-2' }}</span>
                    </div>
                    <div class="info-item">
                      <label>Saldo Disponible</label>
                      <span>\${{ cuenta()!.saldoDisponible | number:'1.2-2' }}</span>
                    </div>
                    <div class="info-item">
                      <label>Interés Acumulado</label>
                      <span>\${{ cuenta()!.saldoInteres | number:'1.2-2' }}</span>
                    </div>
                    @if (cuenta()!.fechaVencimiento) {
                      <div class="info-item">
                        <label>Plazo</label>
                        <span>{{ cuenta()!.plazo }} días</span>
                      </div>
                      <div class="info-item">
                        <label>Vencimiento</label>
                        <span>{{ cuenta()!.fechaVencimiento | date:'dd/MM/yyyy' }}</span>
                      </div>
                    }
                    @if (cuenta()!.tipoCapitalizacion) {
                      <div class="info-item">
                        <label>Capitalización</label>
                        <span>{{ cuenta()!.tipoCapitalizacion }}</span>
                      </div>
                    }
                    @if (cuenta()!.cuentaAhorroDestinoNoCuenta) {
                      <div class="info-item">
                        <label>Cuenta Destino Intereses</label>
                        <span>{{ cuenta()!.cuentaAhorroDestinoNoCuenta }}</span>
                      </div>
                    }
                    @if (cuenta()!.bancoNombre) {
                      <div class="info-item">
                        <label>Banco</label>
                        <span>{{ cuenta()!.bancoNombre }}</span>
                      </div>
                      <div class="info-item">
                        <label>Cuenta Banco</label>
                        <span>{{ cuenta()!.cuentaBancoNumero }}</span>
                      </div>
                      <div class="info-item">
                        <label>Propietario Cuenta</label>
                        <span>{{ cuenta()!.cuentaBancoPropietario }}</span>
                      </div>
                    }
                    @if (cuenta()!.pignorado) {
                      <div class="info-item">
                        <label>Pignorado</label>
                        <span>\${{ cuenta()!.montoPignorado | number:'1.2-2' }}</span>
                      </div>
                    }
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Tab: Transacciones -->
          <mat-tab label="Transacciones">
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  <div class="table-responsive">
                    <table mat-table [dataSource]="transacciones()" class="full-width">
                      <ng-container matColumnDef="fecha">
                        <th mat-header-cell *matHeaderCellDef>Fecha</th>
                        <td mat-cell *matCellDef="let t">{{ t.fecha | date:'dd/MM/yyyy' }}</td>
                      </ng-container>

                      <ng-container matColumnDef="tipo">
                        <th mat-header-cell *matHeaderCellDef>Tipo</th>
                        <td mat-cell *matCellDef="let t">{{ t.tipoTransaccion?.nombre }}</td>
                      </ng-container>

                      <ng-container matColumnDef="naturaleza">
                        <th mat-header-cell *matHeaderCellDef>Nat.</th>
                        <td mat-cell *matCellDef="let t">
                          <mat-chip-set>
                            <mat-chip [class.abono]="t.naturaleza?.codigo === 'ABONO'"
                                      [class.cargo]="t.naturaleza?.codigo === 'CARGO'">
                              {{ t.naturaleza?.codigo }}
                            </mat-chip>
                          </mat-chip-set>
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="monto">
                        <th mat-header-cell *matHeaderCellDef class="text-right">Monto</th>
                        <td mat-cell *matCellDef="let t" class="text-right">
                          \${{ t.monto | number:'1.2-2' }}
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="saldo">
                        <th mat-header-cell *matHeaderCellDef class="text-right">Saldo</th>
                        <td mat-cell *matCellDef="let t" class="text-right">
                          \${{ t.nuevoSaldo | number:'1.2-2' }}
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="observacion">
                        <th mat-header-cell *matHeaderCellDef>Observación</th>
                        <td mat-cell *matCellDef="let t">{{ t.observacion || '-' }}</td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="transColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: transColumns"></tr>
                    </table>
                  </div>
                  @if (transacciones().length === 0) {
                    <div class="empty">
                      <p>No hay transacciones registradas</p>
                    </div>
                  }
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Tab: Plan de Capitalización (no mostrar en AV) -->
          @if (lineaCodigo !== 'AV') {
          <mat-tab label="Plan Capitalización">
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  <div class="table-responsive">
                    <table mat-table [dataSource]="planCap()" class="full-width">
                      <ng-container matColumnDef="fecha">
                        <th mat-header-cell *matHeaderCellDef>Fecha</th>
                        <td mat-cell *matCellDef="let p">{{ p.fechaCapitalizacion | date:'dd/MM/yyyy' }}</td>
                      </ng-container>

                      <ng-container matColumnDef="monto">
                        <th mat-header-cell *matHeaderCellDef class="text-right">Monto</th>
                        <td mat-cell *matCellDef="let p" class="text-right">
                          \${{ p.monto | number:'1.2-2' }}
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="procesado">
                        <th mat-header-cell *matHeaderCellDef>Estado</th>
                        <td mat-cell *matCellDef="let p">
                          <mat-chip-set>
                            <mat-chip [class.activo]="p.procesado" [class.inactivo]="!p.procesado">
                              {{ p.procesado ? 'Procesado' : 'Pendiente' }}
                            </mat-chip>
                          </mat-chip-set>
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="fechaProcesado">
                        <th mat-header-cell *matHeaderCellDef>Fecha Procesado</th>
                        <td mat-cell *matCellDef="let p">
                          {{ p.fechaProcesado ? (p.fechaProcesado | date:'dd/MM/yyyy') : '-' }}
                        </td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="planColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: planColumns"></tr>
                    </table>
                  </div>
                  @if (planCap().length === 0) {
                    <div class="empty">
                      <p>No hay plan de capitalización</p>
                    </div>
                  }
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
          }

          <!-- Tab: Renovaciones (solo DPF) -->
          @if (lineaCodigo === 'DPF') {
          <mat-tab label="Renovaciones">
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  <div class="table-responsive">
                    <table mat-table [dataSource]="renovaciones()" class="full-width">
                      <ng-container matColumnDef="fechaRenovacion">
                        <th mat-header-cell *matHeaderCellDef>Fecha Renovación</th>
                        <td mat-cell *matCellDef="let r">{{ r.fechaRenovacion | date:'dd/MM/yyyy' }}</td>
                      </ng-container>

                      <ng-container matColumnDef="vencimientoAnterior">
                        <th mat-header-cell *matHeaderCellDef>Vencimiento Anterior</th>
                        <td mat-cell *matCellDef="let r">{{ r.vencimientoAnterior | date:'dd/MM/yyyy' }}</td>
                      </ng-container>

                      <ng-container matColumnDef="nuevoVencimiento">
                        <th mat-header-cell *matHeaderCellDef>Nuevo Vencimiento</th>
                        <td mat-cell *matCellDef="let r">{{ r.nuevoVencimiento | date:'dd/MM/yyyy' }}</td>
                      </ng-container>

                      <ng-container matColumnDef="nombreUsuario">
                        <th mat-header-cell *matHeaderCellDef>Usuario</th>
                        <td mat-cell *matCellDef="let r">{{ r.nombreUsuario || '-' }}</td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="renovColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: renovColumns"></tr>
                    </table>
                  </div>
                  @if (renovaciones().length === 0) {
                    <div class="empty">
                      <p>No se han realizado renovaciones</p>
                    </div>
                  }
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
          }

          <!-- Tab: Beneficiarios -->
          <mat-tab label="Beneficiarios">
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <strong>Total: {{ getTotalPorcentaje() }}%</strong>
                    @if (cuenta()!.estado === 'Activa') {
                      <button mat-raised-button color="primary" (click)="openBeneficiarioDialog()" [disabled]="getTotalPorcentaje() >= 100">
                        <mat-icon>person_add</mat-icon> Agregar
                      </button>
                    }
                  </div>

                  @if (getTotalPorcentaje() > 0 && getTotalPorcentaje() !== 100) {
                    <div style="background: #fff3e0; padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; color: #e65100;">
                      El porcentaje total debe ser exactamente 100%
                    </div>
                  }

                  <div class="table-responsive">
                    <table mat-table [dataSource]="beneficiarios()" class="full-width">
                      <ng-container matColumnDef="nombre">
                        <th mat-header-cell *matHeaderCellDef>Beneficiario</th>
                        <td mat-cell *matCellDef="let b">
                          <div>{{ b.nombre }} {{ b.apellidos }}</div>
                          <small class="text-muted">{{ b.telefono }}</small>
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="parentesco">
                        <th mat-header-cell *matHeaderCellDef>Parentesco</th>
                        <td mat-cell *matCellDef="let b">{{ b.parentesco }}</td>
                      </ng-container>

                      <ng-container matColumnDef="porcentaje">
                        <th mat-header-cell *matHeaderCellDef class="text-right">%</th>
                        <td mat-cell *matCellDef="let b" class="text-right">{{ b.porcentajeBeneficio }}%</td>
                      </ng-container>

                      <ng-container matColumnDef="acciones">
                        <th mat-header-cell *matHeaderCellDef>Acciones</th>
                        <td mat-cell *matCellDef="let b">
                          @if (cuenta()!.estado === 'Activa') {
                            <button mat-icon-button color="primary" (click)="openBeneficiarioDialog(b)" matTooltip="Editar">
                              <mat-icon>edit</mat-icon>
                            </button>
                            <button mat-icon-button color="warn" (click)="removeBeneficiario(b)" matTooltip="Eliminar">
                              <mat-icon>delete</mat-icon>
                            </button>
                          }
                        </td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="benefColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: benefColumns"></tr>
                    </table>
                  </div>

                  @if (beneficiarios().length === 0) {
                    <div class="empty">
                      <p>No hay beneficiarios registrados</p>
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
    .container { padding: 16px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
    .header > div { display: flex; align-items: center; gap: 8px; }
    .header h1 { margin: 0; }
    .header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .tab-content { padding: 16px 0; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
    .info-item { display: flex; flex-direction: column; gap: 4px; }
    .info-item label { font-size: 12px; color: #666; font-weight: 500; text-transform: uppercase; }
    .info-item span { font-size: 15px; }
    .info-item.highlight .saldo { font-size: 20px; font-weight: bold; color: #1976d2; }
    .full-width { width: 100%; }
    .table-responsive { overflow-x: auto; }
    .text-right { text-align: right; }
    .text-muted { color: #666; font-size: 12px; }
    .empty { text-align: center; padding: 32px; color: #666; }
    mat-chip.abono { background-color: #4caf50 !important; color: white !important; }
    mat-chip.cargo { background-color: #f44336 !important; color: white !important; }
    mat-chip.activo { background-color: #4caf50 !important; color: white !important; }
    mat-chip.inactivo { background-color: #ff9800 !important; color: white !important; }
    .estado-activa { background-color: #4caf50 !important; color: white !important; }
    .estado-cancelada { background-color: #9e9e9e !important; color: white !important; }
    .estado-bloqueada { background-color: #f44336 !important; color: white !important; }
    .estado-inactiva { background-color: #ff9800 !important; color: white !important; }
    .estado-vencida { background-color: #795548 !important; color: white !important; }
  `],
})
export class CuentaDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cuentaService = inject(CuentaAhorroService);
  private transService = inject(TransaccionAhorroService);
  private beneficiarioService = inject(BeneficiarioService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  RoleCodes = RoleCodes;

  cuenta = signal<CuentaAhorroDetalle | null>(null);
  transacciones = signal<TransaccionAhorro[]>([]);
  planCap = signal<PlanCapitalizacion[]>([]);
  beneficiarios = signal<BeneficiarioCuentaAhorro[]>([]);
  renovaciones = signal<any[]>([]);
  isLoading = signal(true);
  renovando = signal(false);

  transColumns = ['fecha', 'tipo', 'naturaleza', 'monto', 'saldo', 'observacion'];
  planColumns = ['fecha', 'monto', 'procesado', 'fechaProcesado'];
  benefColumns = ['nombre', 'parentesco', 'porcentaje', 'acciones'];
  renovColumns = ['fechaRenovacion', 'vencimientoAnterior', 'nuevoVencimiento', 'nombreUsuario'];

  lineaCodigo = '';

  private lineaSegmentoMap: Record<string, string> = {
    AV: 'vista',
    DPF: 'plazo',
    AP: 'programado',
  };

  ngOnInit(): void {
    this.lineaCodigo = this.route.snapshot.data['lineaCodigo'] || '';
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCuenta(id);
  }

  loadCuenta(id: number): void {
    this.isLoading.set(true);
    this.cuentaService.getById(id).subscribe({
      next: (data) => {
        this.cuenta.set(data);
        this.isLoading.set(false);
        this.loadTransacciones(id);
        this.loadPlan(id);
        this.loadBeneficiarios(id);
        if (this.lineaCodigo === 'DPF') {
          this.loadRenovaciones(id);
        }
      },
      error: () => {
        this.snackBar.open('Error al cargar cuenta', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  loadTransacciones(id: number): void {
    this.transService.getTransacciones(id).subscribe({
      next: (res) => this.transacciones.set(res.data),
    });
  }

  loadPlan(id: number): void {
    this.cuentaService.getPlanCapitalizacion(id).subscribe({
      next: (data) => this.planCap.set(data),
    });
  }

  loadRenovaciones(id: number): void {
    this.cuentaService.getRenovaciones(id).subscribe({
      next: (data) => this.renovaciones.set(data),
      error: () => this.renovaciones.set([]),
    });
  }

  loadBeneficiarios(id: number): void {
    this.beneficiarioService.getByCuenta(id).subscribe({
      next: (data) => this.beneficiarios.set(data),
      error: (err) => {
        console.error('Error al cargar beneficiarios:', err);
        this.beneficiarios.set([]);
      },
    });
  }

  getTotalPorcentaje(): number {
    return this.beneficiarios().reduce((sum, b) => sum + Number(b.porcentajeBeneficio), 0);
  }

  openBeneficiarioDialog(beneficiario?: BeneficiarioCuentaAhorro): void {
    const totalActual = this.getTotalPorcentaje();
    const maxPorcentaje = beneficiario
      ? 100 - totalActual + Number(beneficiario.porcentajeBeneficio)
      : 100 - totalActual;

    const dialogRef = this.dialog.open(BeneficiarioDialogComponent, {
      width: '550px',
      maxWidth: '95vw',
      data: { beneficiario, maxPorcentaje },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      const cuentaId = this.cuenta()!.id;

      if (beneficiario) {
        this.beneficiarioService.update(cuentaId, beneficiario.id, result).subscribe({
          next: () => this.loadBeneficiarios(cuentaId),
          error: (err) => this.snackBar.open(err.error?.message || 'Error al actualizar', 'Cerrar', { duration: 3000 }),
        });
      } else {
        this.beneficiarioService.create(cuentaId, result).subscribe({
          next: () => this.loadBeneficiarios(cuentaId),
          error: (err) => this.snackBar.open(err.error?.message || 'Error al crear', 'Cerrar', { duration: 3000 }),
        });
      }
    });
  }

  removeBeneficiario(b: BeneficiarioCuentaAhorro): void {
    if (!confirm(`¿Eliminar a ${b.nombre} ${b.apellidos}?`)) return;
    this.beneficiarioService.remove(this.cuenta()!.id, b.id).subscribe({
      next: () => this.loadBeneficiarios(this.cuenta()!.id),
      error: (err) => this.snackBar.open(err.error?.message || 'Error al eliminar', 'Cerrar', { duration: 3000 }),
    });
  }

  descargarContrato(): void {
    const id = this.cuenta()?.id;
    if (!id) return;
    this.cuentaService.descargarContratoDpf(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Contrato_DPF_${this.cuenta()!.noCuenta}.docx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.snackBar.open('Error al generar contrato', 'Cerrar', { duration: 3000 });
      },
    });
  }

  descargarReporteIntereses(): void {
    const id = this.cuenta()?.id;
    if (!id) return;
    this.cuentaService.descargarReporteIntereses(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_Intereses_${this.cuenta()!.noCuenta}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.snackBar.open('Error al generar reporte de intereses', 'Cerrar', { duration: 3000 });
      },
    });
  }

  renovarDpf(): void {
    const cuenta = this.cuenta();
    if (!cuenta) return;

    const plazo = cuenta.plazo || 0;
    const vencActual = cuenta.fechaVencimiento || '';
    const partes = vencActual.substring(0, 10).split('-');
    const vencStr = partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : vencActual;

    // Calcular nuevo vencimiento para mostrarlo en el confirm
    const fechaVenc = new Date(vencActual);
    fechaVenc.setDate(fechaVenc.getDate() + plazo);
    const nuevoStr = `${String(fechaVenc.getDate()).padStart(2, '0')}/${String(fechaVenc.getMonth() + 1).padStart(2, '0')}/${fechaVenc.getFullYear()}`;

    if (!confirm(
      `¿Renovar DPF ${cuenta.noCuenta}?\n\n` +
      `Vencimiento actual: ${vencStr}\n` +
      `Plazo: ${plazo} días\n` +
      `Nuevo vencimiento: ${nuevoStr}\n\n` +
      `Se generará un nuevo plan de capitalización.`
    )) return;

    this.renovando.set(true);
    this.cuentaService.renovar(cuenta.id).subscribe({
      next: () => {
        this.snackBar.open('DPF renovado exitosamente', 'Cerrar', { duration: 3000 });
        this.renovando.set(false);
        this.loadCuenta(cuenta.id);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al renovar', 'Cerrar', { duration: 4000 });
        this.renovando.set(false);
      },
    });
  }

  goBack(): void {
    const segmento = this.lineaSegmentoMap[this.lineaCodigo] || 'vista';
    this.router.navigate(['/ahorros', segmento]);
  }
}
