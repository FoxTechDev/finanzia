import { Component, inject, signal } from '@angular/core';
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
import { Departamento, Municipio, Distrito } from '@core/models/cliente.model';

interface DialogData {
  distrito: Distrito | null;
  departamentos: Departamento[];
  municipios: Municipio[];
}

@Component({
  selector: 'app-distrito-dialog',
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
    <h2 mat-dialog-title>{{ data.distrito ? 'Editar' : 'Nuevo' }} Distrito</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Departamento</mat-label>
        <mat-select [(ngModel)]="departamentoId" (selectionChange)="onDepartamentoChange($event.value)" [disabled]="isSaving">
          @for (dep of data.departamentos; track dep.id) {
            <mat-option [value]="dep.id">{{ dep.nombre }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Municipio</mat-label>
        <mat-select [(ngModel)]="municipioId" [disabled]="isSaving || !departamentoId">
          @for (mun of municipiosFiltrados(); track mun.id) {
            <mat-option [value]="mun.id">{{ mun.nombre }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Nombre del Distrito</mat-label>
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
export class DistritoDialogComponent {
  private dialogRef = inject(MatDialogRef<DistritoDialogComponent>);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  nombre = this.data.distrito?.nombre || '';
  municipioId: number | null = this.data.distrito?.municipioId || null;
  departamentoId: number | null = null;
  municipiosFiltrados = signal<Municipio[]>([]);
  isSaving = false;

  constructor() {
    if (this.data.distrito?.municipio) {
      this.departamentoId = this.data.distrito.municipio.departamentoId;
      this.filterMunicipios();
    }
  }

  onDepartamentoChange(departamentoId: number): void {
    this.municipioId = null;
    this.filterMunicipios();
  }

  private filterMunicipios(): void {
    if (this.departamentoId) {
      this.municipiosFiltrados.set(
        this.data.municipios.filter((m) => m.departamentoId === this.departamentoId)
      );
    } else {
      this.municipiosFiltrados.set([]);
    }
  }

  isValid(): boolean {
    return !!this.nombre.trim() && !!this.municipioId;
  }

  save(): void {
    if (!this.isValid()) return;

    this.isSaving = true;
    const url = `${environment.apiUrl}/distritos`;
    const body = { nombre: this.nombre, municipioId: this.municipioId };

    const request$ = this.data.distrito
      ? this.http.patch(`${url}/${this.data.distrito.id}`, body)
      : this.http.post(url, body);

    request$.subscribe({
      next: () => {
        this.snackBar.open('Distrito guardado', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Error al guardar', 'Cerrar', { duration: 3000 });
        this.isSaving = false;
      },
    });
  }
}
