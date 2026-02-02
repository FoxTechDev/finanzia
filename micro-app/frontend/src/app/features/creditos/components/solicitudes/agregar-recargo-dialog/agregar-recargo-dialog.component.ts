import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RecargoSolicitudDto } from '@core/models/credito.model';

@Component({
  selector: 'app-agregar-recargo-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>add_circle_outline</mat-icon>
      Agregar Recargo
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="recargo-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre del Recargo</mat-label>
          <input matInput formControlName="nombre" placeholder="Ej: Seguro, GPS, Ahorro">
          <mat-icon matPrefix>label</mat-icon>
          @if (form.get('nombre')?.hasError('required') && form.get('nombre')?.touched) {
            <mat-error>El nombre es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tipo de Cálculo</mat-label>
          <mat-select formControlName="tipo">
            <mat-option value="FIJO">Monto Fijo</mat-option>
            <mat-option value="PORCENTAJE">Porcentaje</mat-option>
          </mat-select>
          <mat-icon matPrefix>calculate</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>
            {{ form.get('tipo')?.value === 'PORCENTAJE' ? 'Porcentaje (%)' : 'Monto ($)' }}
          </mat-label>
          <input
            matInput
            type="number"
            formControlName="valor"
            step="0.01"
            min="0"
            [max]="form.get('tipo')?.value === 'PORCENTAJE' ? 100 : null"
            [placeholder]="form.get('tipo')?.value === 'PORCENTAJE' ? 'Ej: 5' : 'Ej: 10.00'"
          >
          <mat-icon matPrefix>attach_money</mat-icon>
          @if (form.get('valor')?.hasError('required') && form.get('valor')?.touched) {
            <mat-error>El valor es requerido</mat-error>
          }
          @if (form.get('valor')?.hasError('min')) {
            <mat-error>El valor debe ser mayor o igual a 0</mat-error>
          }
          @if (form.get('valor')?.hasError('max')) {
            <mat-error>El porcentaje no puede ser mayor a 100%</mat-error>
          }
          <mat-hint>
            @if (form.get('tipo')?.value === 'PORCENTAJE') {
              Se calculará como porcentaje de la cuota base
            } @else {
              Monto fijo que se agregará a cada cuota
            }
          </mat-hint>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Desde Cuota (Opcional)</mat-label>
            <input
              matInput
              type="number"
              formControlName="aplicaDesde"
              min="1"
              placeholder="1"
            >
            <mat-icon matPrefix>play_arrow</mat-icon>
            @if (form.get('aplicaDesde')?.hasError('min') && form.get('aplicaDesde')?.touched) {
              <mat-error>Debe ser mayor o igual a 1</mat-error>
            }
            <mat-hint>Dejar vacío para iniciar desde la cuota 1</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Hasta Cuota (Opcional)</mat-label>
            <input
              matInput
              type="number"
              formControlName="aplicaHasta"
              min="1"
              placeholder="Hasta el final"
            >
            <mat-icon matPrefix>stop</mat-icon>
            @if (form.get('aplicaHasta')?.hasError('min') && form.get('aplicaHasta')?.touched) {
              <mat-error>Debe ser mayor o igual a 1</mat-error>
            }
            @if (form.hasError('rangoInvalido')) {
              <mat-error>Debe ser mayor o igual a "Desde Cuota"</mat-error>
            }
            <mat-hint>Dejar vacío para aplicar hasta el final</mat-hint>
          </mat-form-field>
        </div>

        @if (form.get('aplicaDesde')?.value || form.get('aplicaHasta')?.value) {
          <div class="info-box">
            <mat-icon>info</mat-icon>
            <p>
              Este recargo se aplicará
              @if (form.get('aplicaDesde')?.value && form.get('aplicaHasta')?.value) {
                desde la cuota {{ form.get('aplicaDesde')?.value }} hasta la cuota {{ form.get('aplicaHasta')?.value }}
              } @else if (form.get('aplicaDesde')?.value) {
                desde la cuota {{ form.get('aplicaDesde')?.value }} hasta el final
              } @else {
                hasta la cuota {{ form.get('aplicaHasta')?.value }}
              }
            </p>
          </div>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        (click)="guardar()"
        [disabled]="form.invalid"
      >
        <mat-icon>check</mat-icon>
        Agregar Recargo
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      padding: 16px 24px;
    }

    mat-dialog-content {
      padding: 0 24px 24px 24px;
      min-width: 400px;
      max-width: 600px;
    }

    .recargo-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 16px;
    }

    .full-width {
      width: 100%;
    }

    .row {
      display: flex;
      gap: 16px;
    }

    .half-width {
      flex: 1;
    }

    .info-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #e3f2fd;
      border-radius: 4px;
      color: #1565c0;
    }

    .info-box mat-icon {
      color: #1976d2;
      flex-shrink: 0;
    }

    .info-box p {
      margin: 0;
      font-size: 14px;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;
    }

    /* Responsive */
    @media (max-width: 600px) {
      mat-dialog-content {
        min-width: 280px;
      }

      .row {
        flex-direction: column;
        gap: 8px;
      }

      .half-width {
        width: 100%;
      }
    }
  `],
})
export class AgregarRecargoDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AgregarRecargoDialogComponent>);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      tipo: ['FIJO', Validators.required],
      valor: [0, [Validators.required, Validators.min(0)]],
      aplicaDesde: [null, [Validators.min(1)]],
      aplicaHasta: [null, [Validators.min(1)]],
    }, {
      validators: this.validarRangoCuotas,
    });

    // Actualizar validadores de valor según el tipo
    this.form.get('tipo')?.valueChanges.subscribe(tipo => {
      const valorControl = this.form.get('valor');
      if (tipo === 'PORCENTAJE') {
        valorControl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      } else {
        valorControl?.setValidators([Validators.required, Validators.min(0)]);
      }
      valorControl?.updateValueAndValidity();
    });
  }

  validarRangoCuotas(group: FormGroup): { [key: string]: boolean } | null {
    const desde = group.get('aplicaDesde')?.value;
    const hasta = group.get('aplicaHasta')?.value;

    if (desde && hasta && hasta < desde) {
      return { rangoInvalido: true };
    }

    return null;
  }

  guardar(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    const recargo: RecargoSolicitudDto = {
      nombre: formValue.nombre.trim(),
      tipo: formValue.tipo,
      valor: Number(formValue.valor),
      aplicaDesde: formValue.aplicaDesde || undefined,
      aplicaHasta: formValue.aplicaHasta || undefined,
    };

    this.dialogRef.close(recargo);
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}
