import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { CatalogosAhorroService } from '../../../services/catalogos-ahorro.service';
import { LineaAhorro } from '@core/models/ahorro.model';

@Component({
  selector: 'app-lineas-ahorro',
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
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Líneas de Ahorro</h1>
        <button mat-fab color="primary" (click)="openDialog()" matTooltip="Nueva línea">
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
            <table mat-table [dataSource]="lineas()" class="full-width">
              <ng-container matColumnDef="codigo">
                <th mat-header-cell *matHeaderCellDef>Código</th>
                <td mat-cell *matCellDef="let item">{{ item.codigo }}</td>
              </ng-container>

              <ng-container matColumnDef="nombre">
                <th mat-header-cell *matHeaderCellDef>Nombre</th>
                <td mat-cell *matCellDef="let item">{{ item.nombre }}</td>
              </ng-container>

              <ng-container matColumnDef="descripcion">
                <th mat-header-cell *matHeaderCellDef>Descripción</th>
                <td mat-cell *matCellDef="let item">{{ item.descripcion || '-' }}</td>
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

            @if (lineas().length === 0) {
              <div class="empty">
                <mat-icon>savings</mat-icon>
                <p>No hay líneas de ahorro registradas</p>
                <button mat-raised-button color="primary" (click)="openDialog()">
                  Agregar línea de ahorro
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
    .empty { text-align: center; padding: 48px; }
    .empty mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; }
    .empty p { color: #666; margin: 16px 0; }
    mat-chip.activo { background-color: #4caf50 !important; color: white !important; }
    mat-chip.inactivo { background-color: #9e9e9e !important; color: white !important; }
  `],
})
export class LineasAhorroComponent implements OnInit {
  private service = inject(CatalogosAhorroService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  lineas = signal<LineaAhorro[]>([]);
  isLoading = signal(true);
  displayedColumns = ['codigo', 'nombre', 'descripcion', 'activo', 'acciones'];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.service.getLineas().subscribe({
      next: (data) => { this.lineas.set(data); this.isLoading.set(false); },
      error: () => {
        this.snackBar.open('Error al cargar líneas de ahorro', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  openDialog(linea?: LineaAhorro): void {
    const dialogRef = this.dialog.open(LineaAhorroDialogComponent, {
      width: '450px',
      data: linea || null,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }
}

// ===== Dialog Component =====
@Component({
  selector: 'app-linea-ahorro-dialog',
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
    <h2 mat-dialog-title>{{ data ? 'Editar' : 'Nueva' }} Línea de Ahorro</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Código</mat-label>
          <input matInput formControlName="codigo" maxlength="10" />
          @if (form.get('codigo')?.hasError('required')) {
            <mat-error>El código es requerido</mat-error>
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
          <textarea matInput formControlName="descripcion" rows="3" maxlength="255"></textarea>
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
export class LineaAhorroDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<LineaAhorroDialogComponent>);
  private service = inject(CatalogosAhorroService);
  private snackBar = inject(MatSnackBar);
  data: LineaAhorro | null = inject(MAT_DIALOG_DATA);

  isLoading = false;
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      codigo: [this.data?.codigo || '', Validators.required],
      nombre: [this.data?.nombre || '', Validators.required],
      descripcion: [this.data?.descripcion || ''],
      activo: [this.data?.activo ?? true],
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.isLoading = true;
    const request$ = this.data
      ? this.service.updateLinea(this.data.id, this.form.value)
      : this.service.createLinea(this.form.value);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          `Línea de ahorro ${this.data ? 'actualizada' : 'creada'} exitosamente`,
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
