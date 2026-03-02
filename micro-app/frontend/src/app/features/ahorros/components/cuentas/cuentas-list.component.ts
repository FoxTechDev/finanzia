import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CuentaAhorroService } from '../../services/cuenta-ahorro.service';
import { CatalogosAhorroService } from '../../services/catalogos-ahorro.service';
import { CuentaAhorroResumen, TipoAhorro, EstadoCuentaAhorro } from '@core/models/ahorro.model';
import { CuentaAperturaComponent } from './cuenta-apertura.component';
import { DpfAperturaComponent } from './dpf-apertura.component';

@Component({
  selector: 'app-cuentas-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatChipsModule,
    MatTooltipModule,
    DecimalPipe,
    DatePipe,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>{{ lineaNombre }}</h1>
        <button mat-fab color="primary" (click)="openApertura()" matTooltip="Nueva cuenta">
          <mat-icon>add</mat-icon>
        </button>
      </div>

      <!-- Filtros -->
      <mat-card class="filtros-card">
        <mat-card-content>
          <div class="filtros">
            <mat-form-field appearance="outline" class="filtro-buscar">
              <mat-label>Buscar</mat-label>
              <input matInput [(ngModel)]="buscar" (keyup.enter)="loadData()" placeholder="Nombre, DUI, No. Cuenta" />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tipo</mat-label>
              <mat-select [(ngModel)]="tipoAhorroId" (selectionChange)="loadData()">
                <mat-option [value]="null">Todos</mat-option>
                @for (tipo of tiposAhorro(); track tipo.id) {
                  <mat-option [value]="tipo.id">{{ tipo.nombre }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
              <mat-select [(ngModel)]="estadoId" (selectionChange)="loadData()">
                <mat-option [value]="null">Todos</mat-option>
                @for (estado of estados(); track estado.id) {
                  <mat-option [value]="estado.id">{{ estado.nombre }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      @if (isLoading()) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <mat-card-content>
            <div class="table-responsive">
              <table mat-table [dataSource]="cuentas()" class="full-width">
                <ng-container matColumnDef="noCuenta">
                  <th mat-header-cell *matHeaderCellDef>No. Cuenta</th>
                  <td mat-cell *matCellDef="let item">{{ item.noCuenta }}</td>
                </ng-container>

                <ng-container matColumnDef="cliente">
                  <th mat-header-cell *matHeaderCellDef>Cliente</th>
                  <td mat-cell *matCellDef="let item">
                    <div>{{ item.nombreCliente }}</div>
                    <small class="text-muted">{{ item.numeroDui }}</small>
                  </td>
                </ng-container>

                <ng-container matColumnDef="tipo">
                  <th mat-header-cell *matHeaderCellDef>Tipo</th>
                  <td mat-cell *matCellDef="let item">
                    <div>{{ item.tipoAhorro }}</div>
                    <small class="text-muted">{{ item.lineaAhorro }}</small>
                  </td>
                </ng-container>

                <ng-container matColumnDef="saldo">
                  <th mat-header-cell *matHeaderCellDef class="text-right">Saldo</th>
                  <td mat-cell *matCellDef="let item" class="text-right">
                    \${{ item.saldo | number:'1.2-2' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="estado">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let item">
                    <mat-chip-set>
                      <mat-chip [ngClass]="getEstadoClass(item.estado)">
                        {{ item.estado }}
                      </mat-chip>
                    </mat-chip-set>
                  </td>
                </ng-container>

                <ng-container matColumnDef="fechaApertura">
                  <th mat-header-cell *matHeaderCellDef>Apertura</th>
                  <td mat-cell *matCellDef="let item">{{ item.fechaApertura | date:'dd/MM/yyyy' }}</td>
                </ng-container>

                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let item">
                    <button mat-icon-button color="primary" (click)="verDetalle(item.id)" matTooltip="Ver detalle">
                      <mat-icon>visibility</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            </div>

            @if (cuentas().length === 0) {
              <div class="empty">
                <mat-icon>savings</mat-icon>
                <p>No se encontraron cuentas de ahorro</p>
              </div>
            }

            <mat-paginator
              [length]="total()"
              [pageSize]="pageSize"
              [pageSizeOptions]="[10, 20, 50]"
              (page)="onPage($event)"
              showFirstLastButtons
            ></mat-paginator>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .container { padding: 16px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .header h1 { margin: 0; }
    .filtros-card { margin-bottom: 16px; }
    .filtros { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
    .filtro-buscar { flex: 1; min-width: 200px; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .full-width { width: 100%; }
    .table-responsive { overflow-x: auto; }
    .text-right { text-align: right; }
    .text-muted { color: #666; font-size: 12px; }
    .empty { text-align: center; padding: 48px; }
    .empty mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; }
    .empty p { color: #666; margin: 16px 0; }
    .estado-activa { background-color: #4caf50 !important; color: white !important; }
    .estado-inactiva { background-color: #ff9800 !important; color: white !important; }
    .estado-bloqueada { background-color: #f44336 !important; color: white !important; }
    .estado-cancelada { background-color: #9e9e9e !important; color: white !important; }
    .estado-vencida { background-color: #795548 !important; color: white !important; }
  `],
})
export class CuentasListComponent implements OnInit {
  private service = inject(CuentaAhorroService);
  private catalogos = inject(CatalogosAhorroService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  lineaCodigo = '';
  lineaNombre = 'Cuentas de Ahorro';

  private lineaSegmentoMap: Record<string, string> = {
    AV: 'vista',
    DPF: 'plazo',
    AP: 'programado',
  };

  cuentas = signal<CuentaAhorroResumen[]>([]);
  tiposAhorro = signal<TipoAhorro[]>([]);
  estados = signal<EstadoCuentaAhorro[]>([]);
  total = signal(0);
  isLoading = signal(true);

  buscar = '';
  tipoAhorroId: number | null = null;
  estadoId: number | null = null;
  page = 1;
  pageSize = 20;

  displayedColumns = ['noCuenta', 'cliente', 'tipo', 'saldo', 'estado', 'fechaApertura', 'acciones'];

  ngOnInit(): void {
    this.lineaCodigo = this.route.snapshot.data['lineaCodigo'] || '';
    this.lineaNombre = this.route.snapshot.data['lineaNombre'] || 'Cuentas de Ahorro';

    if (this.lineaCodigo) {
      this.catalogos.getTiposByLinea(this.lineaCodigo).subscribe((data) => this.tiposAhorro.set(data));
    } else {
      this.catalogos.getTipos(true).subscribe((data) => this.tiposAhorro.set(data));
    }
    this.catalogos.getEstados().subscribe((data) => this.estados.set(data));
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    const params: Record<string, string> = {
      page: this.page.toString(),
      limit: this.pageSize.toString(),
    };
    if (this.lineaCodigo) params['lineaCodigo'] = this.lineaCodigo;
    if (this.buscar) params['buscar'] = this.buscar;
    if (this.tipoAhorroId) params['tipoAhorroId'] = this.tipoAhorroId.toString();
    if (this.estadoId) params['estadoId'] = this.estadoId.toString();

    this.service.getAll(params).subscribe({
      next: (res) => {
        this.cuentas.set(res.data);
        this.total.set(res.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar cuentas', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  onPage(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  openApertura(): void {
    let dialogRef;
    if (this.lineaCodigo === 'DPF') {
      dialogRef = this.dialog.open(DpfAperturaComponent, {
        width: '600px',
      });
    } else {
      dialogRef = this.dialog.open(CuentaAperturaComponent, {
        width: '600px',
        data: { lineaCodigo: this.lineaCodigo },
      });
    }
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }

  verDetalle(id: number): void {
    const segmento = this.lineaSegmentoMap[this.lineaCodigo] || 'vista';
    this.router.navigate(['/ahorros', segmento, id]);
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      'Activa': 'estado-activa',
      'Inactiva': 'estado-inactiva',
      'Bloqueada': 'estado-bloqueada',
      'Cancelada': 'estado-cancelada',
      'Vencida': 'estado-vencida',
    };
    return map[estado] || '';
  }
}
