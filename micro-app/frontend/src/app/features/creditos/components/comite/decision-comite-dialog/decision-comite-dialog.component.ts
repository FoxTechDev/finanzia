import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { ComiteService } from '../../../services/comite.service';
import { GarantiaService } from '../../../services/garantia.service';
import {
  Solicitud,
  TipoDecisionComite,
  DESTINO_CREDITO_LABELS,
} from '@core/models/credito.model';
import {
  Garantia,
  CoberturaGarantia,
  RECOMENDACION_ASESOR_LABELS,
} from '@core/models/garantia.model';

@Component({
  selector: 'app-decision-comite-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    CurrencyPipe,
  ],
  template: `
    <h2 mat-dialog-title>Decisión del Comité de Crédito</h2>

    <mat-dialog-content>
      <!-- Resumen de la solicitud -->
      <div class="section">
        <h3>Resumen de la Solicitud</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Número:</span>
            <span class="value">{{ solicitud.numeroSolicitud }}</span>
          </div>
          <div class="info-item">
            <span class="label">Cliente:</span>
            <span class="value">{{ solicitud.persona?.nombre }} {{ solicitud.persona?.apellido }}</span>
          </div>
          <div class="info-item">
            <span class="label">Tipo Crédito:</span>
            <span class="value">{{ solicitud.tipoCredito?.nombre }}</span>
          </div>
          <div class="info-item">
            <span class="label">Destino:</span>
            <span class="value">{{ getDestinoLabel(solicitud.destinoCredito) }}</span>
          </div>
        </div>

        <div class="amounts-row">
          <div class="amount-card">
            <div class="amount-label">Monto Solicitado</div>
            <div class="amount-value">{{ solicitud.montoSolicitado | currency:'USD':'symbol':'1.2-2' }}</div>
          </div>
          <div class="amount-card">
            <div class="amount-label">Plazo</div>
            <div class="amount-value">{{ solicitud.plazoSolicitado }} meses</div>
          </div>
          <div class="amount-card">
            <div class="amount-label">Tasa Propuesta</div>
            <div class="amount-value">{{ solicitud.tasaInteresPropuesta }}%</div>
          </div>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Análisis del Asesor -->
      <div class="section">
        <h3>Análisis del Asesor</h3>
        @if (solicitud.recomendacionAsesor) {
          <div class="recomendacion-row">
            <span class="label">Recomendación:</span>
            <mat-chip [ngClass]="getRecomendacionClass(solicitud.recomendacionAsesor)">
              {{ getRecomendacionLabel(solicitud.recomendacionAsesor) }}
            </mat-chip>
          </div>
        }
        @if (solicitud.analisisAsesor) {
          <div class="analisis-text">
            <span class="label">Análisis:</span>
            <p>{{ solicitud.analisisAsesor }}</p>
          </div>
        }
        @if (solicitud.capacidadPago) {
          <div class="info-item">
            <span class="label">Capacidad de Pago:</span>
            <span class="value">{{ solicitud.capacidadPago | currency:'USD':'symbol':'1.2-2' }}</span>
          </div>
        }
        @if (!solicitud.recomendacionAsesor && !solicitud.analisisAsesor) {
          <p class="no-data">Sin análisis del asesor</p>
        }
      </div>

      <mat-divider></mat-divider>

      <!-- Garantías -->
      <div class="section">
        <h3>Garantías</h3>
        @if (garantias().length > 0) {
          <div class="garantias-list">
            @for (garantia of garantias(); track garantia.id) {
              <div class="garantia-item">
                <span class="garantia-tipo">{{ garantia.tipoGarantiaCatalogo?.nombre }}</span>
                <span class="garantia-valor">{{ garantia.valorEstimado | currency:'USD':'symbol':'1.2-2' }}</span>
              </div>
            }
          </div>
          @if (cobertura()) {
            <div class="cobertura-row">
              <span class="label">Cobertura Total:</span>
              <span class="cobertura-value" [class.cobertura-ok]="cobertura()!.cobertura >= 100">
                {{ cobertura()!.cobertura | number:'1.2-2' }}%
              </span>
            </div>
          }
        } @else {
          <p class="no-data">Sin garantías registradas</p>
        }
      </div>

      <mat-divider></mat-divider>

      <!-- Formulario de decisión -->
      <div class="section">
        <h3>Decisión del Comité</h3>
        <form [formGroup]="form">
          <mat-radio-group formControlName="tipoDecision" class="decision-radio-group">
            <mat-radio-button value="AUTORIZADA" color="primary">
              <mat-icon class="decision-icon autorizar">check_circle</mat-icon>
              Autorizar
            </mat-radio-button>
            <mat-radio-button value="DENEGADA" color="warn">
              <mat-icon class="decision-icon denegar">cancel</mat-icon>
              Denegar
            </mat-radio-button>
            <mat-radio-button value="OBSERVADA" color="accent">
              <mat-icon class="decision-icon observar">warning</mat-icon>
              Observar
            </mat-radio-button>
          </mat-radio-group>

          <!-- Campos para Autorizar -->
          @if (form.get('tipoDecision')?.value === 'AUTORIZADA') {
            <div class="autorizar-fields">
              <div class="fields-row">
                <mat-form-field appearance="outline">
                  <mat-label>Monto Autorizado</mat-label>
                  <input matInput type="number" formControlName="montoAutorizado">
                  <span matPrefix>$&nbsp;</span>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Plazo Autorizado (meses)</mat-label>
                  <input matInput type="number" formControlName="plazoAutorizado">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Tasa Autorizada (%)</mat-label>
                  <input matInput type="number" formControlName="tasaAutorizada" step="0.01">
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Condiciones Especiales</mat-label>
                <textarea matInput formControlName="condicionesEspeciales" rows="3"></textarea>
              </mat-form-field>
            </div>
          }

          <!-- Campos para Denegar -->
          @if (form.get('tipoDecision')?.value === 'DENEGADA') {
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Motivo del Rechazo</mat-label>
              <textarea matInput formControlName="observaciones" rows="3" required></textarea>
              <mat-error>El motivo del rechazo es requerido</mat-error>
            </mat-form-field>
          }

          <!-- Campos para Observar -->
          @if (form.get('tipoDecision')?.value === 'OBSERVADA') {
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Observaciones</mat-label>
              <textarea matInput formControlName="observaciones" rows="3" required></textarea>
              <mat-error>Las observaciones son requeridas</mat-error>
            </mat-form-field>
          }
        </form>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        (click)="confirmar()"
        [disabled]="!form.valid || isSubmitting()"
      >
        @if (isSubmitting()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          <mat-icon>gavel</mat-icon>
          Confirmar Decisión
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .section { margin: 16px 0; }
      .section h3 { margin: 0 0 12px 0; color: #333; font-size: 1.1em; }
      .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
      .info-item { display: flex; gap: 8px; }
      .info-item .label { color: #666; }
      .info-item .value { font-weight: 500; }
      .amounts-row { display: flex; gap: 16px; margin-top: 12px; }
      .amount-card { flex: 1; background: #f5f5f5; padding: 12px; border-radius: 8px; text-align: center; }
      .amount-label { font-size: 0.85em; color: #666; }
      .amount-value { font-size: 1.2em; font-weight: 600; color: #1976d2; }
      .recomendacion-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
      .analisis-text p { margin: 8px 0; background: #f9f9f9; padding: 12px; border-radius: 4px; }
      .no-data { color: #999; font-style: italic; }
      .garantias-list { display: flex; flex-direction: column; gap: 8px; }
      .garantia-item { display: flex; justify-content: space-between; padding: 8px; background: #f5f5f5; border-radius: 4px; }
      .garantia-valor { font-weight: 600; color: #1976d2; }
      .cobertura-row { display: flex; justify-content: space-between; margin-top: 12px; padding: 8px; background: #e3f2fd; border-radius: 4px; }
      .cobertura-value { font-weight: 600; }
      .cobertura-ok { color: #4caf50; }
      .decision-radio-group { display: flex; gap: 24px; margin: 16px 0; }
      .decision-icon { vertical-align: middle; margin-right: 4px; }
      .decision-icon.autorizar { color: #4caf50; }
      .decision-icon.denegar { color: #f44336; }
      .decision-icon.observar { color: #ff9800; }
      .autorizar-fields { margin-top: 16px; }
      .fields-row { display: flex; gap: 16px; }
      .fields-row mat-form-field { flex: 1; }
      .full-width { width: 100%; }
      mat-dialog-content { max-height: 70vh; }
      mat-chip.recomendacion-aprobar { background-color: #4caf50 !important; color: white !important; }
      mat-chip.recomendacion-rechazar { background-color: #f44336 !important; color: white !important; }
      mat-chip.recomendacion-observar { background-color: #ff9800 !important; color: white !important; }
    `,
  ],
})
export class DecisionComiteDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<DecisionComiteDialogComponent>);
  private data = inject<{ solicitud: Solicitud }>(MAT_DIALOG_DATA);
  private comiteService = inject(ComiteService);
  private garantiaService = inject(GarantiaService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  solicitud = this.data.solicitud;
  garantias = signal<Garantia[]>([]);
  cobertura = signal<CoberturaGarantia | null>(null);
  isSubmitting = signal(false);

  form: FormGroup = this.fb.group({
    tipoDecision: ['AUTORIZADA', Validators.required],
    observaciones: [''],
    condicionesEspeciales: [''],
    montoAutorizado: [this.solicitud.montoSolicitado],
    plazoAutorizado: [this.solicitud.plazoSolicitado],
    tasaAutorizada: [this.solicitud.tasaInteresPropuesta],
  });

  ngOnInit(): void {
    this.loadGarantias();
    this.loadCobertura();

    // Actualizar validaciones según el tipo de decisión
    this.form.get('tipoDecision')?.valueChanges.subscribe((value) => {
      const observacionesControl = this.form.get('observaciones');
      if (value === 'DENEGADA' || value === 'OBSERVADA') {
        observacionesControl?.setValidators([Validators.required]);
      } else {
        observacionesControl?.clearValidators();
      }
      observacionesControl?.updateValueAndValidity();
    });
  }

  loadGarantias(): void {
    this.garantiaService.getBySolicitud(this.solicitud.id).subscribe({
      next: (garantias) => this.garantias.set(garantias),
      error: () => console.error('Error al cargar garantías'),
    });
  }

  loadCobertura(): void {
    this.garantiaService.getCobertura(this.solicitud.id).subscribe({
      next: (cobertura) => this.cobertura.set(cobertura),
      error: () => console.error('Error al cargar cobertura'),
    });
  }

  getDestinoLabel(destino: string): string {
    return DESTINO_CREDITO_LABELS[destino as keyof typeof DESTINO_CREDITO_LABELS] || destino;
  }

  getRecomendacionLabel(recomendacion: string): string {
    return RECOMENDACION_ASESOR_LABELS[recomendacion as keyof typeof RECOMENDACION_ASESOR_LABELS] || recomendacion;
  }

  getRecomendacionClass(recomendacion: string): string {
    return 'recomendacion-' + recomendacion.toLowerCase();
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  confirmar(): void {
    if (!this.form.valid) {
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.form.value;

    const decision = {
      tipoDecision: formValue.tipoDecision as TipoDecisionComite,
      observaciones: formValue.observaciones || undefined,
      condicionesEspeciales: formValue.condicionesEspeciales || undefined,
      montoAutorizado: formValue.tipoDecision === 'AUTORIZADA' ? Number(formValue.montoAutorizado) : undefined,
      plazoAutorizado: formValue.tipoDecision === 'AUTORIZADA' ? Number(formValue.plazoAutorizado) : undefined,
      tasaAutorizada: formValue.tipoDecision === 'AUTORIZADA' ? Number(formValue.tasaAutorizada) : undefined,
    };

    this.comiteService.registrarDecision(this.solicitud.id, decision).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.snackBar.open(err.error?.message || 'Error al registrar decisión', 'Cerrar', { duration: 3000 });
      },
    });
  }
}
