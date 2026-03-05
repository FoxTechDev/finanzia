import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { CatalogosAhorroService } from '../../../services/catalogos-ahorro.service';
import { TipoAhorro, TipoTransaccionAhorro } from '@core/models/ahorro.model';

@Component({
  selector: 'app-transacciones-tipo-ahorro',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Transacciones por Tipo de Ahorro</h1>
      </div>

      <p class="descripcion">
        Configure qué tipos de transacción están permitidos para cada tipo de ahorro.
        Estas asignaciones determinan las opciones disponibles al registrar movimientos.
      </p>

      @if (isLoading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <!-- Selector de tipo de ahorro -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tipo de Ahorro</mat-label>
          <mat-select (selectionChange)="onTipoAhorroSelected($event.value)">
            @for (tipo of tiposAhorro(); track tipo.id) {
              <mat-option [value]="tipo.id">
                {{ tipo.nombre }}
                @if (tipo.lineaAhorro) {
                  <span class="linea-hint"> ({{ tipo.lineaAhorro.nombre }})</span>
                }
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        @if (tipoAhorroSeleccionadoId()) {
          <mat-card>
            <mat-card-content>
              <div class="section-header">
                <h3>Transacciones asignadas</h3>
              </div>

              @if (cargandoAsignaciones()) {
                <div class="loading"><mat-spinner diameter="30"></mat-spinner></div>
              } @else {
                @if (asignadas().length > 0) {
                  <table mat-table [dataSource]="asignadas()" class="full-width">
                    <ng-container matColumnDef="codigo">
                      <th mat-header-cell *matHeaderCellDef>Código</th>
                      <td mat-cell *matCellDef="let item">{{ item.codigo }}</td>
                    </ng-container>
                    <ng-container matColumnDef="nombre">
                      <th mat-header-cell *matHeaderCellDef>Nombre</th>
                      <td mat-cell *matCellDef="let item">{{ item.nombre }}</td>
                    </ng-container>
                    <ng-container matColumnDef="naturaleza">
                      <th mat-header-cell *matHeaderCellDef>Naturaleza</th>
                      <td mat-cell *matCellDef="let item">
                        @if (item.naturaleza) {
                          <mat-chip-set>
                            <mat-chip [class.abono]="item.naturaleza.codigo === 'ABONO'"
                                      [class.cargo]="item.naturaleza.codigo === 'CARGO'">
                              {{ item.naturaleza.nombre }}
                            </mat-chip>
                          </mat-chip-set>
                        }
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="acciones">
                      <th mat-header-cell *matHeaderCellDef>Acciones</th>
                      <td mat-cell *matCellDef="let item">
                        <button mat-icon-button color="warn" (click)="desasignar(item)" matTooltip="Quitar">
                          <mat-icon>remove_circle</mat-icon>
                        </button>
                      </td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
                  </table>
                } @else {
                  <div class="empty-small">
                    <mat-icon>info</mat-icon>
                    <span>No hay transacciones asignadas a este tipo de ahorro.</span>
                  </div>
                }

                <mat-divider class="separador"></mat-divider>

                <!-- Agregar transacción -->
                <div class="section-header">
                  <h3>Agregar transacción</h3>
                </div>

                @if (disponibles().length > 0) {
                  <div class="agregar-row">
                    <mat-form-field appearance="outline" class="select-transaccion">
                      <mat-label>Seleccione tipo de transacción</mat-label>
                      <mat-select #selectTrans>
                        @for (tipo of disponibles(); track tipo.id) {
                          <mat-option [value]="tipo.id">
                            {{ tipo.nombre }}
                            @if (tipo.naturaleza) {
                              ({{ tipo.naturaleza.nombre }})
                            }
                          </mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                    <button mat-raised-button color="primary" (click)="asignar(selectTrans.value); selectTrans.value = ''"
                      [disabled]="!selectTrans.value">
                      <mat-icon>add</mat-icon> Asignar
                    </button>
                  </div>
                } @else {
                  <div class="empty-small">
                    <mat-icon>check_circle</mat-icon>
                    <span>Todas las transacciones disponibles ya están asignadas.</span>
                  </div>
                }
              }
            </mat-card-content>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    .container { padding: 16px; max-width: 800px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .header h1 { margin: 0; }
    .descripcion { color: #666; font-size: 14px; margin-bottom: 16px; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .full-width { width: 100%; }
    .linea-hint { color: #888; font-size: 12px; }
    .section-header { margin-bottom: 12px; }
    .section-header h3 { margin: 0; font-size: 16px; color: #333; }
    .empty-small {
      display: flex; align-items: center; gap: 8px;
      padding: 16px; color: #666; font-size: 14px;
    }
    .empty-small mat-icon { color: #aaa; }
    .separador { margin: 20px 0; }
    .agregar-row { display: flex; gap: 12px; align-items: flex-start; }
    .select-transaccion { flex: 1; }
    mat-chip.abono { background-color: #4caf50 !important; color: white !important; }
    mat-chip.cargo { background-color: #f44336 !important; color: white !important; }
  `],
})
export class TransaccionesTipoAhorroComponent implements OnInit {
  private service = inject(CatalogosAhorroService);
  private snackBar = inject(MatSnackBar);

  tiposAhorro = signal<TipoAhorro[]>([]);
  todasTransacciones = signal<TipoTransaccionAhorro[]>([]);
  asignadas = signal<TipoTransaccionAhorro[]>([]);
  disponibles = signal<TipoTransaccionAhorro[]>([]);
  tipoAhorroSeleccionadoId = signal<number | null>(null);
  isLoading = signal(true);
  cargandoAsignaciones = signal(false);

  displayedColumns = ['codigo', 'nombre', 'naturaleza', 'acciones'];

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  private cargarDatosIniciales(): void {
    this.isLoading.set(true);
    let loaded = 0;
    const check = () => { if (++loaded === 2) this.isLoading.set(false); };

    this.service.getTipos().subscribe({
      next: (data) => { this.tiposAhorro.set(data); check(); },
      error: () => {
        this.snackBar.open('Error al cargar tipos de ahorro', 'Cerrar', { duration: 3000 });
        check();
      },
    });

    this.service.getTiposTransaccion().subscribe({
      next: (data) => { this.todasTransacciones.set(data); check(); },
      error: () => {
        this.snackBar.open('Error al cargar tipos de transacción', 'Cerrar', { duration: 3000 });
        check();
      },
    });
  }

  onTipoAhorroSelected(tipoAhorroId: number): void {
    this.tipoAhorroSeleccionadoId.set(tipoAhorroId);
    this.cargarAsignaciones(tipoAhorroId);
  }

  private cargarAsignaciones(tipoAhorroId: number): void {
    this.cargandoAsignaciones.set(true);
    this.service.getTransaccionesByTipoAhorro(tipoAhorroId).subscribe({
      next: (data) => {
        this.asignadas.set(data);
        this.calcularDisponibles(data);
        this.cargandoAsignaciones.set(false);
      },
      error: () => {
        this.asignadas.set([]);
        this.disponibles.set([...this.todasTransacciones()]);
        this.cargandoAsignaciones.set(false);
        this.snackBar.open('Error al cargar asignaciones', 'Cerrar', { duration: 3000 });
      },
    });
  }

  private calcularDisponibles(asignadas: TipoTransaccionAhorro[]): void {
    const idsAsignados = new Set(asignadas.map((a) => a.id));
    const disponibles = this.todasTransacciones().filter((t) => !idsAsignados.has(t.id));
    this.disponibles.set(disponibles);
  }

  asignar(tipoTransaccionId: number): void {
    const tipoAhorroId = this.tipoAhorroSeleccionadoId();
    if (!tipoAhorroId || !tipoTransaccionId) return;

    this.service.asignarTransaccion(tipoAhorroId, tipoTransaccionId).subscribe({
      next: () => {
        this.snackBar.open('Transacción asignada', 'Cerrar', { duration: 2000 });
        this.cargarAsignaciones(tipoAhorroId);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al asignar', 'Cerrar', { duration: 3000 });
      },
    });
  }

  desasignar(item: TipoTransaccionAhorro): void {
    const tipoAhorroId = this.tipoAhorroSeleccionadoId();
    if (!tipoAhorroId) return;

    this.service.desasignarTransaccion(tipoAhorroId, item.id).subscribe({
      next: () => {
        this.snackBar.open('Transacción removida', 'Cerrar', { duration: 2000 });
        this.cargarAsignaciones(tipoAhorroId);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al remover', 'Cerrar', { duration: 3000 });
      },
    });
  }
}
