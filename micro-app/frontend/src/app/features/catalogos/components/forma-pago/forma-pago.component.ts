import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

interface FormaPago {
  idFormaPago: number;
  formaPago: string;
}

@Component({
  selector: 'app-forma-pago',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Formas de Pago</h1>
      </div>

      <mat-card>
        <mat-card-content>

          <!-- Formulario inline para crear/editar -->
          <div class="form-section">
            <form [formGroup]="form" (ngSubmit)="guardar()" class="inline-form">
              <mat-form-field appearance="outline" class="field-nombre">
                <mat-label>Forma de Pago</mat-label>
                <input matInput formControlName="formaPago" maxlength="50" placeholder="Ej: Efectivo">
                @if (form.get('formaPago')?.invalid && form.get('formaPago')?.touched) {
                  <mat-error>Campo requerido (máx. 50 caracteres)</mat-error>
                }
              </mat-form-field>

              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || guardando()">
                @if (guardando()) {
                  <mat-spinner diameter="18"></mat-spinner>
                } @else {
                  <mat-icon>{{ editandoId() ? 'save' : 'add' }}</mat-icon>
                  {{ editandoId() ? 'Guardar' : 'Agregar' }}
                }
              </button>

              @if (editandoId()) {
                <button mat-stroked-button type="button" (click)="cancelarEdicion()">
                  Cancelar
                </button>
              }
            </form>
          </div>

          <!-- Tabla -->
          @if (cargando()) {
            <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
          } @else {
            <table mat-table [dataSource]="formas()" class="full-width">
              <ng-container matColumnDef="idFormaPago">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let item">{{ item.idFormaPago }}</td>
              </ng-container>

              <ng-container matColumnDef="formaPago">
                <th mat-header-cell *matHeaderCellDef>Descripción</th>
                <td mat-cell *matCellDef="let item">{{ item.formaPago }}</td>
              </ng-container>

              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let item">
                  <button mat-icon-button color="primary" (click)="editar(item)" matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="eliminar(item)" matTooltip="Eliminar">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columnas"></tr>
              <tr mat-row *matRowDef="let row; columns: columnas;"
                  [class.editando]="row.idFormaPago === editandoId()"></tr>
            </table>

            @if (formas().length === 0) {
              <p class="empty">No hay formas de pago registradas.</p>
            }
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container { padding: 24px; max-width: 700px; margin: 0 auto; }
    .header h1 { margin-bottom: 16px; }
    .form-section { margin-bottom: 16px; }
    .inline-form { display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap; }
    .field-nombre { flex: 1; min-width: 200px; }
    .full-width { width: 100%; }
    .loading { display: flex; justify-content: center; padding: 32px; }
    .empty { text-align: center; color: #888; padding: 24px; }
    tr.editando { background: #e3f2fd; }
  `],
})
export class FormaPagoComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private apiUrl = `${environment.apiUrl}/catalogos/forma-pago`;

  formas = signal<FormaPago[]>([]);
  cargando = signal(false);
  guardando = signal(false);
  editandoId = signal<number | null>(null);

  columnas = ['idFormaPago', 'formaPago', 'acciones'];

  form = this.fb.group({
    formaPago: ['', [Validators.required, Validators.maxLength(50)]],
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.http.get<FormaPago[]>(this.apiUrl).subscribe({
      next: (data) => { this.formas.set(data); this.cargando.set(false); },
      error: () => { this.snackBar.open('Error al cargar formas de pago', 'Cerrar', { duration: 3000 }); this.cargando.set(false); },
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.guardando.set(true);
    const payload = this.form.value;
    const id = this.editandoId();

    const req$ = id
      ? this.http.patch<FormaPago>(`${this.apiUrl}/${id}`, payload)
      : this.http.post<FormaPago>(this.apiUrl, payload);

    req$.subscribe({
      next: () => {
        this.snackBar.open(id ? 'Actualizado correctamente' : 'Agregado correctamente', 'Cerrar', { duration: 3000 });
        this.cancelarEdicion();
        this.cargar();
        this.guardando.set(false);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al guardar', 'Cerrar', { duration: 4000 });
        this.guardando.set(false);
      },
    });
  }

  editar(item: FormaPago): void {
    this.editandoId.set(item.idFormaPago);
    this.form.setValue({ formaPago: item.formaPago });
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.form.reset();
  }

  eliminar(item: FormaPago): void {
    if (!confirm(`¿Eliminar "${item.formaPago}"?`)) return;
    this.http.delete(`${this.apiUrl}/${item.idFormaPago}`).subscribe({
      next: () => { this.snackBar.open('Eliminado', 'Cerrar', { duration: 3000 }); this.cargar(); },
      error: (err) => this.snackBar.open(err.error?.message || 'Error al eliminar', 'Cerrar', { duration: 4000 }),
    });
  }
}
