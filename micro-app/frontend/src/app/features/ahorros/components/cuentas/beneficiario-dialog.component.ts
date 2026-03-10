import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BeneficiarioCuentaAhorro } from '@core/models/ahorro.model';

@Component({
  selector: 'app-beneficiario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.beneficiario ? 'Editar' : 'Agregar' }} Beneficiario</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="nombre" maxlength="100" />
            @if (form.get('nombre')?.hasError('required') && form.get('nombre')?.touched) {
              <mat-error>Requerido</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Apellidos</mat-label>
            <input matInput formControlName="apellidos" maxlength="100" />
            @if (form.get('apellidos')?.hasError('required') && form.get('apellidos')?.touched) {
              <mat-error>Requerido</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Parentesco</mat-label>
            <input matInput formControlName="parentesco" maxlength="50" />
            @if (form.get('parentesco')?.hasError('required') && form.get('parentesco')?.touched) {
              <mat-error>Requerido</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Porcentaje (%)</mat-label>
            <input matInput type="number" formControlName="porcentajeBeneficio" step="0.01" />
            @if (form.get('porcentajeBeneficio')?.hasError('required') && form.get('porcentajeBeneficio')?.touched) {
              <mat-error>Requerido</mat-error>
            } @else if (form.get('porcentajeBeneficio')?.hasError('min')) {
              <mat-error>Mínimo 0.01%</mat-error>
            } @else if (form.get('porcentajeBeneficio')?.hasError('max')) {
              <mat-error>Máximo {{ data.maxPorcentaje }}%</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Fecha Nacimiento</mat-label>
            <input matInput type="date" formControlName="fechaNacimiento" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="telefono" maxlength="20" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" maxlength="100" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Dirección</mat-label>
          <input matInput formControlName="direccion" maxlength="255" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">
        Guardar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    mat-dialog-content { min-width: 450px; }
    .row { display: flex; gap: 12px; }
    .row mat-form-field { flex: 1; }
  `],
})
export class BeneficiarioDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<BeneficiarioDialogComponent>);
  data: { beneficiario?: BeneficiarioCuentaAhorro; maxPorcentaje: number } = inject(MAT_DIALOG_DATA);

  form: FormGroup;

  constructor() {
    const b = this.data?.beneficiario;
    this.form = this.fb.group({
      nombre: [b?.nombre || '', [Validators.required, Validators.maxLength(100)]],
      apellidos: [b?.apellidos || '', [Validators.required, Validators.maxLength(100)]],
      parentesco: [b?.parentesco || '', [Validators.required, Validators.maxLength(50)]],
      porcentajeBeneficio: [b?.porcentajeBeneficio || null, [
        Validators.required,
        Validators.min(0.01),
        Validators.max(this.data?.maxPorcentaje || 100),
      ]],
      fechaNacimiento: [b?.fechaNacimiento || ''],
      telefono: [b?.telefono || ''],
      email: [b?.email || ''],
      direccion: [b?.direccion || ''],
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const value = { ...this.form.value };
    // Convert empty strings to null for optional fields (fechaNacimiento is DATE in MySQL)
    if (!value.fechaNacimiento) value.fechaNacimiento = null;
    if (!value.telefono) value.telefono = null;
    if (!value.email) value.email = null;
    if (!value.direccion) value.direccion = null;
    this.dialogRef.close(value);
  }
}
