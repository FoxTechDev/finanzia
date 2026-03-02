import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { CatalogosAhorroService } from '../../../services/catalogos-ahorro.service';
import { TipoAhorro, LineaAhorro } from '@core/models/ahorro.model';

@Component({
  selector: 'app-tipos-ahorro',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule,
    DecimalPipe,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Tipos de Ahorro</h1>
        <button mat-fab color="primary" (click)="openDialog()" matTooltip="Nuevo tipo">
          <mat-icon>add</mat-icon>
        </button>
      </div>

      @if (isLoading()) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <mat-card-content>
            <div class="table-responsive">
              <table mat-table [dataSource]="tipos()" class="full-width">
                <ng-container matColumnDef="nombre">
                  <th mat-header-cell *matHeaderCellDef>Nombre</th>
                  <td mat-cell *matCellDef="let item">{{ item.nombre }}</td>
                </ng-container>

                <ng-container matColumnDef="linea">
                  <th mat-header-cell *matHeaderCellDef>Línea</th>
                  <td mat-cell *matCellDef="let item">{{ item.lineaAhorro?.nombre || '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="esPlazo">
                  <th mat-header-cell *matHeaderCellDef>A Plazo</th>
                  <td mat-cell *matCellDef="let item">{{ item.esPlazo ? 'Sí' : 'No' }}</td>
                </ng-container>

                <ng-container matColumnDef="tasaVigente">
                  <th mat-header-cell *matHeaderCellDef>Tasa Vigente</th>
                  <td mat-cell *matCellDef="let item">{{ item.tasaVigente | number:'1.2-4' }}%</td>
                </ng-container>

                <ng-container matColumnDef="montoMin">
                  <th mat-header-cell *matHeaderCellDef>Monto Mín.</th>
                  <td mat-cell *matCellDef="let item">{{ item.montoAperturaMin | number:'1.2-2' }}</td>
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

            @if (tipos().length === 0) {
              <div class="empty">
                <mat-icon>savings</mat-icon>
                <p>No hay tipos de ahorro registrados</p>
                <button mat-raised-button color="primary" (click)="openDialog()">
                  Agregar tipo de ahorro
                </button>
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
    .table-responsive { overflow-x: auto; }
    .empty { text-align: center; padding: 48px; }
    .empty mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; }
    .empty p { color: #666; margin: 16px 0; }
    mat-chip.activo { background-color: #4caf50 !important; color: white !important; }
    mat-chip.inactivo { background-color: #9e9e9e !important; color: white !important; }
  `],
})
export class TiposAhorroComponent implements OnInit {
  private service = inject(CatalogosAhorroService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  tipos = signal<TipoAhorro[]>([]);
  isLoading = signal(true);
  displayedColumns = ['nombre', 'linea', 'esPlazo', 'tasaVigente', 'montoMin', 'activo', 'acciones'];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.service.getTipos().subscribe({
      next: (data) => { this.tipos.set(data); this.isLoading.set(false); },
      error: () => {
        this.snackBar.open('Error al cargar tipos de ahorro', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  openDialog(tipo?: TipoAhorro): void {
    const dialogRef = this.dialog.open(TipoAhorroDialogComponent, {
      width: '550px',
      data: tipo || null,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }
}

// ===== Dialog Component =====
@Component({
  selector: 'app-tipo-ahorro-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar' : 'Nuevo' }} Tipo de Ahorro</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Línea de Ahorro</mat-label>
          <mat-select formControlName="lineaAhorroId">
            @for (linea of lineas(); track linea.id) {
              <mat-option [value]="linea.id">{{ linea.nombre }}</mat-option>
            }
          </mat-select>
          @if (form.get('lineaAhorroId')?.hasError('required')) {
            <mat-error>La línea es requerida</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" maxlength="50" />
          @if (form.get('nombre')?.hasError('required')) {
            <mat-error>El nombre es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="descripcion" rows="2" maxlength="255"></textarea>
        </mat-form-field>

        <mat-checkbox formControlName="esPlazo" class="full-width" style="margin-bottom: 16px">Es a plazo fijo</mat-checkbox>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Tasa Mín. (%)</mat-label>
            <input matInput type="number" formControlName="tasaMin" step="0.01" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Tasa Máx. (%)</mat-label>
            <input matInput type="number" formControlName="tasaMax" step="0.01" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Tasa Vigente (%)</mat-label>
            <input matInput type="number" formControlName="tasaVigente" step="0.01" />
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Plazo (días)</mat-label>
            <input matInput type="number" formControlName="plazo" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Plazo Mín.</mat-label>
            <input matInput type="number" formControlName="plazoMin" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Plazo Máx.</mat-label>
            <input matInput type="number" formControlName="plazoMax" />
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Monto Apertura Mín. ($)</mat-label>
            <input matInput type="number" formControlName="montoAperturaMin" step="0.01" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Días Gracia</mat-label>
            <input matInput type="number" formControlName="diasGracia" />
          </mat-form-field>
        </div>

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
    mat-dialog-content { min-width: 400px; }
    .row { display: flex; gap: 12px; }
    .row mat-form-field { flex: 1; }
  `],
})
export class TipoAhorroDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TipoAhorroDialogComponent>);
  private service = inject(CatalogosAhorroService);
  private snackBar = inject(MatSnackBar);
  data: TipoAhorro | null = inject(MAT_DIALOG_DATA);

  lineas = signal<LineaAhorro[]>([]);
  isLoading = false;
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      lineaAhorroId: [this.data?.lineaAhorroId || null, Validators.required],
      nombre: [this.data?.nombre || '', Validators.required],
      descripcion: [this.data?.descripcion || ''],
      esPlazo: [this.data?.esPlazo ?? false],
      tasaMin: [this.data?.tasaMin || 0],
      tasaMax: [this.data?.tasaMax || 0],
      tasaVigente: [this.data?.tasaVigente || 0],
      plazo: [this.data?.plazo || 0],
      plazoMin: [this.data?.plazoMin || 0],
      plazoMax: [this.data?.plazoMax || 0],
      montoAperturaMin: [this.data?.montoAperturaMin || 0],
      diasGracia: [this.data?.diasGracia || 0],
      activo: [this.data?.activo ?? true],
    });
  }

  ngOnInit(): void {
    this.service.getLineas(true).subscribe((data) => this.lineas.set(data));
  }

  save(): void {
    if (this.form.invalid) return;
    this.isLoading = true;
    const request$ = this.data
      ? this.service.updateTipo(this.data.id, this.form.value)
      : this.service.createTipo(this.form.value);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          `Tipo de ahorro ${this.data ? 'actualizado' : 'creado'} exitosamente`,
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
