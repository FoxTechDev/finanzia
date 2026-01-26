import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ReferenciaPersonal } from '@core/models/cliente.model';

interface DialogData {
  referencia: ReferenciaPersonal | null;
  relacionOptions: string[];
}

@Component({
  selector: 'app-referencia-personal-dialog',
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
    <h2 mat-dialog-title>{{ data.referencia ? 'Editar' : 'Nueva' }} Referencia Personal</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre Completo</mat-label>
          <input matInput formControlName="nombreReferencia" />
          @if (form.get('nombreReferencia')?.hasError('required')) {
            <mat-error>El nombre es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Relación</mat-label>
          <mat-select formControlName="relacion">
            @for (rel of data.relacionOptions; track rel) {
              <mat-option [value]="rel">{{ rel }}</mat-option>
            }
          </mat-select>
          @if (form.get('relacion')?.hasError('required')) {
            <mat-error>La relación es requerida</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Teléfono</mat-label>
          <input matInput formControlName="telefonoReferencia" type="tel" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Dirección</mat-label>
          <textarea matInput formControlName="direccionReferencia" rows="2"></textarea>
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
export class ReferenciaPersonalDialogComponent {
  private dialogRef = inject(MatDialogRef<ReferenciaPersonalDialogComponent>);
  private fb = inject(FormBuilder);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  form: FormGroup = this.fb.group({
    nombreReferencia: [this.data.referencia?.nombreReferencia || '', [Validators.required, Validators.maxLength(150)]],
    relacion: [this.data.referencia?.relacion || '', [Validators.required, Validators.maxLength(80)]],
    telefonoReferencia: [this.data.referencia?.telefonoReferencia || '', Validators.maxLength(30)],
    direccionReferencia: [this.data.referencia?.direccionReferencia || '', Validators.maxLength(200)],
  });

  save(): void {
    if (this.form.valid) {
      const result: ReferenciaPersonal = {
        ...this.data.referencia,
        ...this.form.value,
      };
      this.dialogRef.close(result);
    }
  }
}
