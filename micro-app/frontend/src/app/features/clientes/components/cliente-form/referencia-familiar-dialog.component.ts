import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ReferenciaFamiliar } from '@core/models/cliente.model';

interface DialogData {
  referencia: ReferenciaFamiliar | null;
  parentescoOptions: string[];
}

@Component({
  selector: 'app-referencia-familiar-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.referencia ? 'Editar' : 'Nueva' }} Referencia Familiar</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre Completo</mat-label>
          <input matInput formControlName="nombreFamiliar" />
          @if (form.get('nombreFamiliar')?.hasError('required')) {
            <mat-error>El nombre es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Parentesco</mat-label>
          <mat-select formControlName="parentesco">
            @for (par of data.parentescoOptions; track par) {
              <mat-option [value]="par">{{ par }}</mat-option>
            }
          </mat-select>
          @if (form.get('parentesco')?.hasError('required')) {
            <mat-error>El parentesco es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Teléfono</mat-label>
          <input matInput formControlName="telefonoFamiliar" type="tel" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Dirección</mat-label>
          <textarea matInput formControlName="direccionFamiliar" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid">
        Guardar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-container { display: flex; flex-direction: column; min-width: 300px; }
    .full-width { width: 100%; margin-bottom: 8px; }
    @media (max-width: 599px) {
      .form-container { min-width: 250px; }
    }
  `],
})
export class ReferenciaFamiliarDialogComponent {
  private dialogRef = inject(MatDialogRef<ReferenciaFamiliarDialogComponent>);
  private fb = inject(FormBuilder);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  form: FormGroup = this.fb.group({
    nombreFamiliar: [this.data.referencia?.nombreFamiliar || '', [Validators.required, Validators.maxLength(150)]],
    parentesco: [this.data.referencia?.parentesco || '', [Validators.required, Validators.maxLength(80)]],
    telefonoFamiliar: [this.data.referencia?.telefonoFamiliar || '', Validators.maxLength(30)],
    direccionFamiliar: [this.data.referencia?.direccionFamiliar || '', Validators.maxLength(200)],
  });

  save(): void {
    if (this.form.valid) {
      const result: ReferenciaFamiliar = {
        ...this.data.referencia,
        ...this.form.value,
      };
      this.dialogRef.close(result);
    }
  }
}
