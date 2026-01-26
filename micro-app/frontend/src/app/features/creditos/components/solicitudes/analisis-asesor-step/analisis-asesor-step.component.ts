import { Component, inject, Input, Output, EventEmitter, signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { GarantiaService } from '../../../services/garantia.service';
import {
  RecomendacionAsesor,
  RECOMENDACION_ASESOR_LABELS,
  UpdateAnalisisAsesorRequest,
} from '@core/models/garantia.model';
import { Solicitud } from '@core/models/credito.model';

@Component({
  selector: 'app-analisis-asesor-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
  ],
  template: `
    <div class="analisis-step">
      <div class="intro-section">
        <mat-icon class="intro-icon">assessment</mat-icon>
        <h3>Análisis del Asesor de Negocio</h3>
        <p>Complete el análisis detallado del cliente y su capacidad de pago para esta solicitud de crédito.</p>
      </div>

      <form [formGroup]="analisisForm" class="analisis-form">
        <mat-card class="section-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>description</mat-icon>
            <mat-card-title>Análisis Detallado</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Análisis del Asesor</mat-label>
              <textarea
                matInput
                formControlName="analisisAsesor"
                rows="5"
                placeholder="Ingrese su análisis detallado del cliente, su negocio, historial crediticio, y justificación de la solicitud..."
              ></textarea>
              <mat-hint>Describa su evaluación general del cliente y la solicitud</mat-hint>
            </mat-form-field>
          </mat-card-content>
        </mat-card>

        <mat-card class="section-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>history</mat-icon>
            <mat-card-title>Antecedentes del Cliente</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Antecedentes</mat-label>
              <textarea
                matInput
                formControlName="antecedentesCliente"
                rows="4"
                placeholder="Historial de relación con la institución, comportamiento de pago previo, referencias comerciales..."
              ></textarea>
              <mat-hint>Incluya información relevante sobre el historial del cliente</mat-hint>
            </mat-form-field>
          </mat-card-content>
        </mat-card>

        <div class="two-columns">
          <mat-card class="section-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>account_balance_wallet</mat-icon>
              <mat-card-title>Capacidad de Pago</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Capacidad de Pago Mensual ($)</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="capacidadPago"
                  step="0.01"
                  placeholder="0.00"
                />
                <mat-icon matPrefix>attach_money</mat-icon>
                <mat-hint>Monto mensual que el cliente puede destinar al pago del crédito</mat-hint>
                @if (analisisForm.get('capacidadPago')?.hasError('min')) {
                  <mat-error>El valor debe ser mayor o igual a 0</mat-error>
                }
              </mat-form-field>
            </mat-card-content>
          </mat-card>

          <mat-card class="section-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>thumb_up</mat-icon>
              <mat-card-title>Recomendación</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Recomendación del Asesor</mat-label>
                <mat-select formControlName="recomendacionAsesor">
                  @for (rec of recomendaciones; track rec.value) {
                    <mat-option [value]="rec.value">
                      <span [class]="'rec-option rec-' + rec.value.toLowerCase()">
                        {{ rec.label }}
                      </span>
                    </mat-option>
                  }
                </mat-select>
                <mat-hint>Su recomendación para esta solicitud</mat-hint>
              </mat-form-field>

              @if (analisisForm.value.recomendacionAsesor) {
                <div class="recomendacion-badge" [class]="'badge-' + analisisForm.value.recomendacionAsesor.toLowerCase()">
                  <mat-icon>
                    @switch (analisisForm.value.recomendacionAsesor) {
                      @case ('APROBAR') { check_circle }
                      @case ('RECHAZAR') { cancel }
                      @case ('OBSERVAR') { visibility }
                    }
                  </mat-icon>
                  <span>{{ getRecomendacionLabel(analisisForm.value.recomendacionAsesor) }}</span>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <div class="actions">
          <button
            mat-raised-button
            color="primary"
            [disabled]="isSaving() || analisisForm.pristine"
            (click)="save()"
          >
            @if (isSaving()) {
              <mat-spinner diameter="20"></mat-spinner>
              Guardando...
            } @else {
              <mat-icon>save</mat-icon>
              Guardar Análisis
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .analisis-step { padding: 8px 0; }
    .intro-section {
      text-align: center;
      padding: 24px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
      margin-bottom: 24px;
    }
    .intro-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 8px; }
    .intro-section h3 { margin: 8px 0; font-size: 1.25rem; }
    .intro-section p { margin: 0; opacity: 0.9; font-size: 0.9rem; }
    .analisis-form { display: flex; flex-direction: column; gap: 16px; }
    .section-card { border-left: 4px solid #667eea; }
    .section-card mat-card-header { padding-bottom: 8px; flex-wrap: wrap; }
    .section-card mat-card-header mat-icon { color: #667eea; }
    .section-card mat-card-content { padding: 0 16px 16px; }
    .full-width { width: 100%; }
    .two-columns {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }
    .recomendacion-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 20px;
      margin-top: 8px;
      font-weight: 500;
      flex-wrap: wrap;
    }
    .badge-aprobar { background: #e8f5e9; color: #2e7d32; }
    .badge-rechazar { background: #ffebee; color: #c62828; }
    .badge-observar { background: #fff8e1; color: #f57c00; }
    .rec-aprobar { color: #2e7d32; }
    .rec-rechazar { color: #c62828; }
    .rec-observar { color: #f57c00; }
    .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }
    .actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .actions mat-spinner { margin-right: 8px; }

    /* Responsive adjustments */
    @media (max-width: 600px) {
      .intro-section { padding: 16px 12px; }
      .intro-icon { font-size: 36px; width: 36px; height: 36px; }
      .intro-section h3 { font-size: 1rem; }
      .intro-section p { font-size: 0.85rem; }
      .section-card mat-card-content { padding: 0 12px 12px; }
      .two-columns { grid-template-columns: 1fr; }
      .actions { justify-content: stretch; }
      .actions button { width: 100%; justify-content: center; }
    }
  `],
})
export class AnalisisAsesorStepComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private garantiaService = inject(GarantiaService);
  private snackBar = inject(MatSnackBar);

  @Input() solicitud!: Solicitud;
  @Output() analisisUpdated = new EventEmitter<Solicitud>();

  isSaving = signal(false);
  analisisForm: FormGroup;

  recomendaciones = Object.entries(RECOMENDACION_ASESOR_LABELS).map(([value, label]) => ({
    value: value as RecomendacionAsesor,
    label,
  }));

  constructor() {
    this.analisisForm = this.fb.group({
      analisisAsesor: [''],
      recomendacionAsesor: [null],
      capacidadPago: [null, [Validators.min(0)]],
      antecedentesCliente: [''],
    });
  }

  ngOnInit(): void {
    this.loadFromSolicitud();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['solicitud'] && this.solicitud) {
      this.loadFromSolicitud();
    }
  }

  loadFromSolicitud(): void {
    if (this.solicitud) {
      this.analisisForm.patchValue({
        analisisAsesor: this.solicitud.analisisAsesor || '',
        recomendacionAsesor: this.solicitud.recomendacionAsesor || null,
        capacidadPago: this.solicitud.capacidadPago || null,
        antecedentesCliente: this.solicitud.antecedentesCliente || '',
      });
      this.analisisForm.markAsPristine();
    }
  }

  getRecomendacionLabel(rec: RecomendacionAsesor): string {
    return RECOMENDACION_ASESOR_LABELS[rec] || rec;
  }

  save(): void {
    if (this.analisisForm.invalid || !this.solicitud?.id) return;

    this.isSaving.set(true);

    const data: UpdateAnalisisAsesorRequest = {
      analisisAsesor: this.analisisForm.value.analisisAsesor || undefined,
      recomendacionAsesor: this.analisisForm.value.recomendacionAsesor || undefined,
      capacidadPago: this.analisisForm.value.capacidadPago || undefined,
      antecedentesCliente: this.analisisForm.value.antecedentesCliente || undefined,
    };

    this.garantiaService.actualizarAnalisisAsesor(this.solicitud.id, data).subscribe({
      next: (updatedSolicitud) => {
        this.snackBar.open('Análisis guardado exitosamente', 'Cerrar', { duration: 3000 });
        this.analisisForm.markAsPristine();
        this.analisisUpdated.emit(updatedSolicitud);
        this.isSaving.set(false);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al guardar', 'Cerrar', { duration: 3000 });
        this.isSaving.set(false);
      },
    });
  }
}
