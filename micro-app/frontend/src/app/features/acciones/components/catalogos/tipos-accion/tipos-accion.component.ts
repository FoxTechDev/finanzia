import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TipoAccionService } from '../../../services/tipo-accion.service';
import { TipoAccion } from '@core/models/accion.model';

@Component({
  selector: 'app-tipos-accion',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    CurrencyPipe,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Tipos de Acción</h1>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon> Nuevo tipo
        </button>
      </div>

      @if (isLoading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <mat-card>
          <mat-card-content>
            <div class="table-responsive">
              <table mat-table [dataSource]="items()" class="full-width">
                <ng-container matColumnDef="nombre">
                  <th mat-header-cell *matHeaderCellDef>Nombre</th>
                  <td mat-cell *matCellDef="let item">{{ item.nombre }}</td>
                </ng-container>
                <ng-container matColumnDef="tasaInteres">
                  <th mat-header-cell *matHeaderCellDef>Tasa Interés</th>
                  <td mat-cell *matCellDef="let item">{{ item.tasaInteres }}%</td>
                </ng-container>
                <ng-container matColumnDef="valorUnitario">
                  <th mat-header-cell *matHeaderCellDef>Valor por Acción</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.valorUnitario | currency:'USD':'symbol':'1.2-2' }}
                  </td>
                </ng-container>
                <ng-container matColumnDef="activo">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let item">
                    <mat-chip-set>
                      <mat-chip [class.activo]="item.activo" [class.inactivo]="!item.activo">
                        {{ item.activo ? 'Activo' : 'Inactivo' }}
                      </mat-chip>
                    </mat-chip-set>
                  </td>
                </ng-container>
                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let item">
                    <button mat-icon-button color="primary" (click)="openDialog(item)" matTooltip="Editar">
                      <mat-icon>edit</mat-icon>
                    </button>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            </div>

            @if (items().length === 0) {
              <div class="empty">
                <mat-icon>show_chart</mat-icon>
                <p>No hay tipos de acción registrados</p>
                <button mat-raised-button color="primary" (click)="openDialog()">Agregar tipo</button>
              </div>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .container { padding: 16px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .header h1 { margin: 0; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .full-width { width: 100%; }
    .empty { text-align: center; padding: 48px; }
    .empty mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; }
    .empty p { color: #666; margin: 16px 0; }
    mat-chip.activo { background-color: #4caf50 !important; color: white !important; }
    mat-chip.inactivo { background-color: #9e9e9e !important; color: white !important; }
  `],
})
export class TiposAccionComponent implements OnInit {
  private service = inject(TipoAccionService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  items = signal<TipoAccion[]>([]);
  isLoading = signal(true);
  displayedColumns = ['nombre', 'tasaInteres', 'valorUnitario', 'activo', 'acciones'];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.service.getAll().subscribe({
      next: (data) => { this.items.set(data); this.isLoading.set(false); },
      error: () => {
        this.snackBar.open('Error al cargar tipos de acción', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  openDialog(item?: TipoAccion): void {
    const dialogRef = this.dialog.open(TipoAccionDialogComponent, {
      width: '450px',
      maxWidth: '95vw',
      data: item || null,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }
}

// ===== Dialog Component =====
@Component({
  selector: 'app-tipo-accion-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar' : 'Nuevo' }} Tipo de Acción</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" maxlength="50" />
          @if (form.get('nombre')?.hasError('required')) {
            <mat-error>El nombre es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tasa de Interés (%)</mat-label>
          <input matInput type="number" formControlName="tasaInteres" step="0.01" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Valor por Acción ($)</mat-label>
          <input matInput type="number" formControlName="valorUnitario" step="0.01" />
          <mat-hint>Equivalencia en dólares de cada acción</mat-hint>
          @if (form.get('valorUnitario')?.hasError('required')) {
            <mat-error>El valor por acción es requerido</mat-error>
          }
        </mat-form-field>

        <mat-checkbox formControlName="activo">Activo</mat-checkbox>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid || isLoading" (click)="save()">
        {{ isLoading ? 'Guardando...' : 'Guardar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 8px; }
    mat-dialog-content { min-width: 350px; }
  `],
})
export class TipoAccionDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TipoAccionDialogComponent>);
  private service = inject(TipoAccionService);
  private snackBar = inject(MatSnackBar);
  data: TipoAccion | null = inject(MAT_DIALOG_DATA);

  isLoading = false;
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      nombre: [this.data?.nombre || '', Validators.required],
      tasaInteres: [this.data?.tasaInteres ?? 0],
      valorUnitario: [this.data?.valorUnitario ?? null, [Validators.required, Validators.min(0.01)]],
      activo: [this.data?.activo ?? true],
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.isLoading = true;
    const request$ = this.data
      ? this.service.update(this.data.id, this.form.value)
      : this.service.create(this.form.value);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          `Tipo de acción ${this.data ? 'actualizado' : 'creado'} exitosamente`,
          'Cerrar', { duration: 3000 },
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al guardar', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      },
    });
  }
}
