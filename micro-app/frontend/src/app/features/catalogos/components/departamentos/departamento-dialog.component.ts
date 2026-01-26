import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Departamento } from '@core/models/cliente.model';

@Component({
  selector: 'app-departamento-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar' : 'Nuevo' }} Departamento</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Nombre del Departamento</mat-label>
        <input matInput [(ngModel)]="nombre" [disabled]="isSaving" />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="isSaving">Cancelar</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="!nombre || isSaving">
        @if (isSaving) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          Guardar
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    mat-dialog-content { min-width: 300px; }
  `],
})
export class DepartamentoDialogComponent {
  private dialogRef = inject(MatDialogRef<DepartamentoDialogComponent>);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  data = inject<Departamento | null>(MAT_DIALOG_DATA);

  nombre = this.data?.nombre || '';
  isSaving = false;

  save(): void {
    if (!this.nombre.trim()) return;

    this.isSaving = true;
    const url = `${environment.apiUrl}/departamentos`;

    const request$ = this.data
      ? this.http.patch(`${url}/${this.data.id}`, { nombre: this.nombre })
      : this.http.post(url, { nombre: this.nombre });

    request$.subscribe({
      next: () => {
        this.snackBar.open('Departamento guardado', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Error al guardar', 'Cerrar', { duration: 3000 });
        this.isSaving = false;
      },
    });
  }
}
