import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AccionService } from '../../services/accion.service';
import { Accion } from '@core/models/accion.model';
import { AccionAperturaComponent } from './accion-apertura.component';

@Component({
  selector: 'app-acciones-list',
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
    MatDialogModule,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>
          <mat-icon>show_chart</mat-icon>
          Acciones
        </h1>
        <button mat-raised-button color="primary" (click)="abrirAccion()">
          <mat-icon>add</mat-icon> Nueva Acción
        </button>
      </div>

      @if (isLoading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <mat-card>
          <mat-card-content>
            <div class="table-responsive">
              <table mat-table [dataSource]="items()" class="full-width">
                <ng-container matColumnDef="correlativo">
                  <th mat-header-cell *matHeaderCellDef>Correlativo</th>
                  <td mat-cell *matCellDef="let item">
                    <a (click)="verDetalle(item.id)" class="link">{{ item.correlativo }}</a>
                  </td>
                </ng-container>
                <ng-container matColumnDef="cliente">
                  <th mat-header-cell *matHeaderCellDef>Cliente</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.persona ? (item.persona.nombre + ' ' + item.persona.apellido) : '' }}
                  </td>
                </ng-container>
                <ng-container matColumnDef="tipo">
                  <th mat-header-cell *matHeaderCellDef>Tipo</th>
                  <td mat-cell *matCellDef="let item">{{ item.tipoAccion?.nombre }}</td>
                </ng-container>
                <ng-container matColumnDef="monto">
                  <th mat-header-cell *matHeaderCellDef>Monto</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.monto | currency:'USD':'symbol':'1.2-2' }}
                  </td>
                </ng-container>
                <ng-container matColumnDef="cantidad">
                  <th mat-header-cell *matHeaderCellDef>Cantidad</th>
                  <td mat-cell *matCellDef="let item">{{ item.cantidadAcciones | number:'1.0-4' }}</td>
                </ng-container>
                <ng-container matColumnDef="fechaApertura">
                  <th mat-header-cell *matHeaderCellDef>Apertura</th>
                  <td mat-cell *matCellDef="let item">{{ item.fechaApertura | date:'dd/MM/yyyy' }}</td>
                </ng-container>
                <ng-container matColumnDef="estado">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let item">
                    <mat-chip-set>
                      <mat-chip [class.activo]="item.activa" [class.inactivo]="!item.activa">
                        {{ item.activa ? 'Activa' : 'Inactiva' }}
                      </mat-chip>
                    </mat-chip-set>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            </div>

            @if (items().length === 0) {
              <div class="empty">
                <mat-icon>show_chart</mat-icon>
                <p>No hay acciones registradas</p>
                <button mat-raised-button color="primary" (click)="abrirAccion()">Abrir Acción</button>
              </div>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header h1 { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 28px; color: #1976d2; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .full-width { width: 100%; }
    .table-responsive { overflow-x: auto; }
    .link { color: #1976d2; cursor: pointer; text-decoration: underline; }
    .empty { text-align: center; padding: 48px; }
    .empty mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; }
    .empty p { color: #666; margin: 16px 0; }
    mat-chip.activo { background-color: #4caf50 !important; color: white !important; }
    mat-chip.inactivo { background-color: #9e9e9e !important; color: white !important; }
  `],
})
export class AccionesListComponent implements OnInit {
  private accionService = inject(AccionService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  items = signal<Accion[]>([]);
  isLoading = signal(true);
  displayedColumns = ['correlativo', 'cliente', 'tipo', 'monto', 'cantidad', 'fechaApertura', 'estado'];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.accionService.getAll().subscribe({
      next: (data) => { this.items.set(data); this.isLoading.set(false); },
      error: () => {
        this.snackBar.open('Error al cargar las acciones', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  abrirAccion(): void {
    const dialogRef = this.dialog.open(AccionAperturaComponent, {
      width: '600px',
      maxWidth: '95vw',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }

  verDetalle(id: number): void {
    this.router.navigate(['/acciones', id]);
  }
}
