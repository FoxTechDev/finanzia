import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Departamento, Municipio } from '@core/models/cliente.model';

interface DialogData {
  municipio: Municipio | null;
  departamentos: Departamento[];
}

@Component({
  selector: 'app-municipio-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.municipio ? 'Editar' : 'Nuevo' }} Municipio</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Departamento</mat-label>
        <mat-select [(ngModel)]="departamentoId" [disabled]="isSaving">
          @for (dep of data.departamentos; track dep.id) {
            <mat-option [value]="dep.id">{{ dep.nombre }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Nombre del Municipio</mat-label>
        <input matInput [(ngModel)]="nombre" [disabled]="isSaving" />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="isSaving">Cancelar</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="!isValid() || isSaving">
        @if (isSaving) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          Guardar
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 8px; }
    mat-dialog-content { min-width: 300px; }
  `],
})
export class MunicipioDialogComponent {
  private dialogRef = inject(MatDialogRef<MunicipioDialogComponent>);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  nombre = this.data.municipio?.nombre || '';
  departamentoId = this.data.municipio?.departamentoId || null;
  isSaving = false;

  isValid(): boolean {
    return !!this.nombre.trim() && !!this.departamentoId;
  }

  save(): void {
    if (!this.isValid()) return;

    this.isSaving = true;
    const url = `${environment.apiUrl}/municipios`;
    const body = { nombre: this.nombre, departamentoId: this.departamentoId };

    const request$ = this.data.municipio
      ? this.http.patch(`${url}/${this.data.municipio.id}`, body)
      : this.http.post(url, body);

    request$.subscribe({
      next: () => {
        this.snackBar.open('Municipio guardado', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Error al guardar', 'Cerrar', { duration: 3000 });
        this.isSaving = false;
      },
    });
  }
}
