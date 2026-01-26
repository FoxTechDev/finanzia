import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { SolicitudService } from '../../services/solicitud.service';
import { LineaCreditoService } from '../../services/linea-credito.service';
import { TipoCreditoService } from '../../services/tipo-credito.service';
import { PersonaService } from '../../../clientes/services/persona.service';
import {
  LineaCredito,
  TipoCredito,
  DestinoCredito,
  DESTINO_CREDITO_LABELS,
  CreateSolicitudRequest,
  Solicitud,
} from '@core/models/credito.model';
import { Persona } from '@core/models/cliente.model';
import { Garantia } from '@core/models/garantia.model';
import { GarantiaStepComponent } from './garantia-step/garantia-step.component';
import { AnalisisAsesorStepComponent } from './analisis-asesor-step/analisis-asesor-step.component';

@Component({
  selector: 'app-solicitud-form',
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
    MatAutocompleteModule,
    MatStepperModule,
    MatTooltipModule,
    CurrencyPipe,
    GarantiaStepComponent,
    AnalisisAsesorStepComponent,
  ],
  template: `
    <div class="container">
      <div class="header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditing ? 'Editar' : 'Nueva' }} Solicitud de Crédito</h1>
        @if (savedSolicitud()) {
          <span class="solicitud-numero">{{ savedSolicitud()?.numeroSolicitud }}</span>
        }
      </div>

      @if (isLoading()) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <mat-card-content>
            <mat-stepper [linear]="!isEditing" #stepper>
              <!-- Paso 1: Cliente -->
              <mat-step [stepControl]="clienteForm" [editable]="canEditBasicData()">
                <ng-template matStepLabel>Cliente</ng-template>
                <form [formGroup]="clienteForm" class="step-content">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Buscar cliente (DUI, Nombre o Apellido)</mat-label>
                    <input
                      matInput
                      formControlName="busquedaCliente"
                      placeholder="Ej: 00000000-0 o Juan Pérez"
                      [matAutocomplete]="autoCliente"
                    />
                    <mat-icon matSuffix>search</mat-icon>
                    <mat-autocomplete
                      #autoCliente="matAutocomplete"
                      (optionSelected)="onClienteSelected($event)"
                      [displayWith]="displayCliente"
                    >
                      @for (cliente of clientesFiltrados(); track cliente.id) {
                        <mat-option [value]="cliente">
                          <div class="autocomplete-option">
                            <span class="dui">{{ cliente.numeroDui }}</span>
                            <span class="nombre">{{ cliente.nombre }} {{ cliente.apellido }}</span>
                          </div>
                        </mat-option>
                      }
                      @if (isSearching() && clientesFiltrados().length === 0) {
                        <mat-option disabled>
                          <mat-spinner diameter="20"></mat-spinner>
                          Buscando...
                        </mat-option>
                      }
                    </mat-autocomplete>
                    @if (clienteForm.get('personaId')?.hasError('required')) {
                      <mat-error>Seleccione un cliente</mat-error>
                    }
                    <mat-hint>Ingrese al menos 2 caracteres para buscar</mat-hint>
                  </mat-form-field>

                  @if (selectedCliente()) {
                    <div class="cliente-info">
                      <div class="cliente-header">
                        <mat-icon>person</mat-icon>
                        <h3>Cliente seleccionado</h3>
                        <button mat-icon-button (click)="clearCliente()" matTooltip="Cambiar cliente">
                          <mat-icon>close</mat-icon>
                        </button>
                      </div>
                      <div class="cliente-details">
                        <p><strong>Nombre:</strong> {{ selectedCliente()?.nombre }} {{ selectedCliente()?.apellido }}</p>
                        <p><strong>DUI:</strong> {{ selectedCliente()?.numeroDui }}</p>
                        @if (selectedCliente()?.telefono) {
                          <p><strong>Teléfono:</strong> {{ selectedCliente()?.telefono }}</p>
                        }
                        @if (selectedCliente()?.correoElectronico) {
                          <p><strong>Email:</strong> {{ selectedCliente()?.correoElectronico }}</p>
                        }
                      </div>
                    </div>
                  }

                  <div class="step-actions">
                    <button mat-raised-button color="primary" matStepperNext [disabled]="clienteForm.invalid">
                      Siguiente <mat-icon>arrow_forward</mat-icon>
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- Paso 2: Tipo de Crédito -->
              <mat-step [stepControl]="creditoForm" [editable]="canEditBasicData()">
                <ng-template matStepLabel>Tipo de Crédito</ng-template>
                <form [formGroup]="creditoForm" class="step-content">
                  <div class="row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Línea de Crédito</mat-label>
                      <mat-select formControlName="lineaCreditoId" (selectionChange)="onLineaChange($event)">
                        @for (linea of lineas(); track linea.id) {
                          <mat-option [value]="linea.id">{{ linea.nombre }}</mat-option>
                        }
                      </mat-select>
                      @if (creditoForm.get('lineaCreditoId')?.hasError('required')) {
                        <mat-error>Seleccione una línea</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Tipo de Crédito</mat-label>
                      <mat-select formControlName="tipoCreditoId" (selectionChange)="onTipoChange($event)">
                        @for (tipo of tiposDisponibles(); track tipo.id) {
                          <mat-option [value]="tipo.id">
                            {{ tipo.nombre }}
                            @if (tipo.requiereGarantia) {
                              <mat-icon class="garantia-icon" matTooltip="Requiere garantía">security</mat-icon>
                            }
                          </mat-option>
                        }
                      </mat-select>
                      @if (creditoForm.get('tipoCreditoId')?.hasError('required')) {
                        <mat-error>Seleccione un tipo</mat-error>
                      }
                    </mat-form-field>
                  </div>

                  @if (selectedTipo()) {
                    <div class="tipo-info">
                      <h4>
                        <mat-icon>info</mat-icon>
                        Parámetros del producto
                      </h4>
                      <div class="params-grid">
                        <div class="param">
                          <span class="label">Monto:</span>
                          <span class="value">{{ selectedTipo()?.montoMinimo | currency:'USD':'symbol':'1.2-2' }} - {{ selectedTipo()?.montoMaximo | currency:'USD':'symbol':'1.2-2' }}</span>
                        </div>
                        <div class="param">
                          <span class="label">Plazo:</span>
                          <span class="value">{{ selectedTipo()?.plazoMinimo }} - {{ selectedTipo()?.plazoMaximo }} meses</span>
                        </div>
                        <div class="param">
                          <span class="label">Tasa:</span>
                          <span class="value">{{ selectedTipo()?.tasaInteresMinima }}% - {{ selectedTipo()?.tasaInteresMaxima }}%</span>
                        </div>
                        <div class="param">
                          <span class="label">Garantía:</span>
                          <span class="value" [class.required]="selectedTipo()?.requiereGarantia">
                            {{ selectedTipo()?.requiereGarantia ? 'Requerida' : 'No requerida' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  }

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Destino del Crédito</mat-label>
                    <mat-select formControlName="destinoCredito">
                      @for (destino of destinos; track destino.value) {
                        <mat-option [value]="destino.value">{{ destino.label }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Descripción del destino</mat-label>
                    <textarea matInput formControlName="descripcionDestino" rows="2"></textarea>
                    <mat-hint>Describa para qué se utilizará el crédito</mat-hint>
                  </mat-form-field>

                  <div class="step-actions">
                    <button mat-button matStepperPrevious>
                      <mat-icon>arrow_back</mat-icon> Anterior
                    </button>
                    <button mat-raised-button color="primary" matStepperNext [disabled]="creditoForm.invalid">
                      Siguiente <mat-icon>arrow_forward</mat-icon>
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- Paso 3: Condiciones -->
              <mat-step [stepControl]="condicionesForm" [editable]="canEditBasicData()">
                <ng-template matStepLabel>Condiciones</ng-template>
                <form [formGroup]="condicionesForm" class="step-content">
                  <div class="row">
                    <mat-form-field appearance="outline" class="third-width">
                      <mat-label>Monto Solicitado ($)</mat-label>
                      <input matInput type="number" formControlName="montoSolicitado" step="0.01" />
                      <mat-icon matPrefix>attach_money</mat-icon>
                      @if (condicionesForm.get('montoSolicitado')?.hasError('required')) {
                        <mat-error>Ingrese el monto</mat-error>
                      }
                      @if (condicionesForm.get('montoSolicitado')?.hasError('min')) {
                        <mat-error>Mínimo: {{ selectedTipo()?.montoMinimo | currency:'USD' }}</mat-error>
                      }
                      @if (condicionesForm.get('montoSolicitado')?.hasError('max')) {
                        <mat-error>Máximo: {{ selectedTipo()?.montoMaximo | currency:'USD' }}</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="third-width">
                      <mat-label>Plazo (meses)</mat-label>
                      <input matInput type="number" formControlName="plazoSolicitado" />
                      <mat-icon matPrefix>calendar_month</mat-icon>
                      @if (condicionesForm.get('plazoSolicitado')?.hasError('required')) {
                        <mat-error>Ingrese el plazo</mat-error>
                      }
                      @if (condicionesForm.get('plazoSolicitado')?.hasError('min')) {
                        <mat-error>Mínimo: {{ selectedTipo()?.plazoMinimo }} meses</mat-error>
                      }
                      @if (condicionesForm.get('plazoSolicitado')?.hasError('max')) {
                        <mat-error>Máximo: {{ selectedTipo()?.plazoMaximo }} meses</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="third-width">
                      <mat-label>Tasa Propuesta (%)</mat-label>
                      <input matInput type="number" formControlName="tasaInteresPropuesta" step="0.01" />
                      <mat-icon matPrefix>percent</mat-icon>
                      @if (condicionesForm.get('tasaInteresPropuesta')?.hasError('required')) {
                        <mat-error>Ingrese la tasa</mat-error>
                      }
                      @if (condicionesForm.get('tasaInteresPropuesta')?.hasError('min')) {
                        <mat-error>Mínima: {{ selectedTipo()?.tasaInteresMinima }}%</mat-error>
                      }
                      @if (condicionesForm.get('tasaInteresPropuesta')?.hasError('max')) {
                        <mat-error>Máxima: {{ selectedTipo()?.tasaInteresMaxima }}%</mat-error>
                      }
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Fecha de Solicitud</mat-label>
                    <input matInput type="date" formControlName="fechaSolicitud" />
                    <mat-icon matPrefix>event</mat-icon>
                  </mat-form-field>

                  <div class="step-actions">
                    <button mat-button matStepperPrevious>
                      <mat-icon>arrow_back</mat-icon> Anterior
                    </button>
                    @if (!savedSolicitud()) {
                      <button
                        mat-raised-button
                        color="primary"
                        [disabled]="condicionesForm.invalid || isSaving()"
                        (click)="saveBasicData()"
                      >
                        @if (isSaving()) {
                          <mat-spinner diameter="20"></mat-spinner>
                        }
                        {{ isSaving() ? 'Guardando...' : 'Guardar y Continuar' }}
                      </button>
                    } @else {
                      <button
                        mat-raised-button
                        color="primary"
                        matStepperNext
                        [disabled]="condicionesForm.invalid"
                      >
                        @if (requiereGarantia()) {
                          Siguiente <mat-icon>arrow_forward</mat-icon>
                        } @else {
                          Ir a Análisis <mat-icon>arrow_forward</mat-icon>
                        }
                      </button>
                    }
                  </div>
                </form>
              </mat-step>

              <!-- Paso 4: Garantías (Condicional) -->
              @if (requiereGarantia()) {
                <mat-step [optional]="false">
                  <ng-template matStepLabel>
                    Garantías
                    @if (garantias().length > 0) {
                      <span class="badge">{{ garantias().length }}</span>
                    }
                  </ng-template>
                  <div class="step-content">
                    @if (savedSolicitud()) {
                      <app-garantia-step
                        [solicitudId]="savedSolicitud()!.id"
                        (garantiasChanged)="onGarantiasChanged($event)"
                      ></app-garantia-step>
                    } @else {
                      <div class="warning-box">
                        <mat-icon>warning</mat-icon>
                        <p>Debe guardar la solicitud primero para agregar garantías.</p>
                      </div>
                    }

                    <div class="step-actions">
                      <button mat-button matStepperPrevious>
                        <mat-icon>arrow_back</mat-icon> Anterior
                      </button>
                      <button mat-raised-button color="primary" matStepperNext>
                        Siguiente <mat-icon>arrow_forward</mat-icon>
                      </button>
                    </div>
                  </div>
                </mat-step>
              }

              <!-- Paso 5: Análisis del Asesor -->
              <mat-step [optional]="true">
                <ng-template matStepLabel>Análisis Asesor</ng-template>
                <div class="step-content">
                  @if (savedSolicitud()) {
                    <app-analisis-asesor-step
                      [solicitud]="savedSolicitud()!"
                      (analisisUpdated)="onAnalisisUpdated($event)"
                    ></app-analisis-asesor-step>
                  } @else {
                    <div class="warning-box">
                      <mat-icon>warning</mat-icon>
                      <p>Debe guardar la solicitud primero para completar el análisis.</p>
                    </div>
                  }

                  <div class="step-actions">
                    <button mat-button matStepperPrevious>
                      <mat-icon>arrow_back</mat-icon> Anterior
                    </button>
                    <button mat-raised-button color="accent" (click)="finalize()">
                      <mat-icon>check</mat-icon> Finalizar
                    </button>
                  </div>
                </div>
              </mat-step>
            </mat-stepper>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [
    `
      .container {
        padding: 16px;
        max-width: 1000px;
        margin: 0 auto;
        box-sizing: border-box;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }
      .header h1 { margin: 0; flex: 1; min-width: 200px; font-size: 1.5rem; }
      .solicitud-numero {
        background: #667eea;
        color: white;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 14px;
      }
      .loading { display: flex; justify-content: center; padding: 48px; }
      .step-content { padding: 16px 0; }

      /* Responsive form fields */
      .full-width { width: 100%; margin-bottom: 8px; }
      .half-width { flex: 1 1 200px; min-width: 0; margin-bottom: 8px; }
      .third-width { flex: 1 1 150px; min-width: 0; margin-bottom: 8px; }
      .row { display: flex; gap: 16px; flex-wrap: wrap; }

      .step-actions {
        display: flex;
        gap: 16px;
        margin-top: 24px;
        justify-content: flex-end;
        flex-wrap: wrap;
      }
      .step-actions button { display: flex; align-items: center; gap: 4px; }

      .cliente-info {
        background: #e8f5e9;
        padding: 16px;
        border-radius: 8px;
        margin: 16px 0;
        border-left: 4px solid #4caf50;
      }
      .cliente-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
      .cliente-header h3 { margin: 0; flex: 1; }
      .cliente-header mat-icon { color: #4caf50; }
      .cliente-details p { margin: 4px 0; word-break: break-word; }

      .tipo-info {
        background: #e3f2fd;
        padding: 16px;
        border-radius: 8px;
        margin: 16px 0;
        border-left: 4px solid #2196f3;
      }
      .tipo-info h4 {
        margin: 0 0 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #1976d2;
        flex-wrap: wrap;
      }
      .params-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 12px;
      }
      .param { display: flex; flex-direction: column; }
      .param .label { font-size: 12px; color: #666; }
      .param .value { font-weight: 500; word-break: break-word; }
      .param .value.required { color: #f57c00; }

      .garantia-icon { font-size: 18px; margin-left: 8px; color: #f57c00; vertical-align: middle; }

      .autocomplete-option { display: flex; gap: 12px; flex-wrap: wrap; }
      .autocomplete-option .dui { color: #666; font-family: monospace; }
      .autocomplete-option .nombre { font-weight: 500; }

      .warning-box {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: #fff3e0;
        border-radius: 8px;
        color: #e65100;
        flex-wrap: wrap;
      }
      .warning-box mat-icon { font-size: 32px; width: 32px; height: 32px; flex-shrink: 0; }
      .warning-box p { margin: 0; flex: 1; min-width: 200px; }

      .badge {
        background: #667eea;
        color: white;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 12px;
        margin-left: 8px;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .container { padding: 8px; }
        .header h1 { font-size: 1.25rem; }
        .half-width, .third-width { flex: 1 1 100%; }
        .row { gap: 8px; }
        .step-actions {
          flex-direction: column;
          align-items: stretch;
        }
        .step-actions button { justify-content: center; width: 100%; }
        .params-grid { grid-template-columns: 1fr 1fr; }
      }

      @media (max-width: 480px) {
        .params-grid { grid-template-columns: 1fr; }
        .cliente-header h3 { font-size: 1rem; }
      }

      /* Fix for mat-stepper on mobile */
      ::ng-deep .mat-horizontal-stepper-header-container {
        flex-wrap: wrap;
      }
      ::ng-deep .mat-step-header {
        flex-shrink: 0;
      }
    `,
  ],
})
export class SolicitudFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private solicitudService = inject(SolicitudService);
  private lineaService = inject(LineaCreditoService);
  private tipoService = inject(TipoCreditoService);
  private personaService = inject(PersonaService);
  private snackBar = inject(MatSnackBar);

  isLoading = signal(true);
  isSaving = signal(false);
  isSearching = signal(false);
  isEditing = false;
  solicitudId: number | null = null;

  lineas = signal<LineaCredito[]>([]);
  tipos = signal<TipoCredito[]>([]);
  tiposDisponibles = signal<TipoCredito[]>([]);
  clientesFiltrados = signal<Persona[]>([]);
  selectedCliente = signal<Persona | null>(null);
  selectedTipo = signal<TipoCredito | null>(null);
  savedSolicitud = signal<Solicitud | null>(null);
  garantias = signal<Garantia[]>([]);

  destinos = Object.entries(DESTINO_CREDITO_LABELS).map(([value, label]) => ({
    value: value as DestinoCredito,
    label,
  }));

  clienteForm: FormGroup;
  creditoForm: FormGroup;
  condicionesForm: FormGroup;

  constructor() {
    const today = new Date().toISOString().split('T')[0];

    this.clienteForm = this.fb.group({
      busquedaCliente: [''],
      personaId: ['', Validators.required],
    });

    this.creditoForm = this.fb.group({
      lineaCreditoId: ['', Validators.required],
      tipoCreditoId: ['', Validators.required],
      destinoCredito: [DestinoCredito.CONSUMO_PERSONAL, Validators.required],
      descripcionDestino: [''],
    });

    this.condicionesForm = this.fb.group({
      montoSolicitado: ['', [Validators.required, Validators.min(0)]],
      plazoSolicitado: ['', [Validators.required, Validators.min(1)]],
      tasaInteresPropuesta: ['', [Validators.required, Validators.min(0)]],
      fechaSolicitud: [today, Validators.required],
    });

    // Setup cliente search with improved search
    this.clienteForm.get('busquedaCliente')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (typeof value === 'string' && value.length >= 2) {
          this.isSearching.set(true);
          return this.personaService.search(value, 10);
        }
        this.clientesFiltrados.set([]);
        return of([]);
      })
    ).subscribe({
      next: (clientes) => {
        this.clientesFiltrados.set(clientes);
        this.isSearching.set(false);
      },
      error: () => {
        this.clientesFiltrados.set([]);
        this.isSearching.set(false);
      },
    });
  }

  ngOnInit(): void {
    this.solicitudId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
    this.isEditing = !!this.solicitudId;

    this.loadData();
  }

  loadData(): void {
    this.lineaService.getAll(true).subscribe({
      next: (lineas) => {
        this.lineas.set(lineas);
        this.tipoService.getAll(undefined, true).subscribe({
          next: (tipos) => {
            this.tipos.set(tipos);
            if (this.isEditing && this.solicitudId) {
              this.loadSolicitud(this.solicitudId);
            } else {
              this.isLoading.set(false);
            }
          },
          error: () => {
            this.snackBar.open('Error al cargar tipos de crédito', 'Cerrar', { duration: 3000 });
            this.isLoading.set(false);
          },
        });
      },
      error: () => {
        this.snackBar.open('Error al cargar líneas de crédito', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  loadSolicitud(id: number): void {
    this.solicitudService.getById(id).subscribe({
      next: (solicitud) => {
        this.savedSolicitud.set(solicitud);
        this.selectedCliente.set(solicitud.persona as unknown as Persona);
        this.clienteForm.patchValue({ personaId: solicitud.personaId });

        this.creditoForm.patchValue({
          lineaCreditoId: solicitud.lineaCreditoId,
          tipoCreditoId: solicitud.tipoCreditoId,
          destinoCredito: solicitud.destinoCredito,
          descripcionDestino: solicitud.descripcionDestino,
        });

        this.onLineaChange({ value: solicitud.lineaCreditoId });
        this.onTipoChange({ value: solicitud.tipoCreditoId });

        this.condicionesForm.patchValue({
          montoSolicitado: solicitud.montoSolicitado,
          plazoSolicitado: solicitud.plazoSolicitado,
          tasaInteresPropuesta: solicitud.tasaInteresPropuesta,
          fechaSolicitud: solicitud.fechaSolicitud,
        });

        if (solicitud.garantias) {
          this.garantias.set(solicitud.garantias);
        }

        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar solicitud', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/creditos/solicitudes']);
      },
    });
  }

  displayCliente(cliente: Persona): string {
    return cliente ? `${cliente.numeroDui} - ${cliente.nombre} ${cliente.apellido}` : '';
  }

  onClienteSelected(event: { option: { value: Persona } }): void {
    const cliente = event.option.value;
    this.selectedCliente.set(cliente);
    this.clienteForm.patchValue({ personaId: cliente.id });
  }

  clearCliente(): void {
    this.selectedCliente.set(null);
    this.clienteForm.patchValue({ personaId: '', busquedaCliente: '' });
    this.clientesFiltrados.set([]);
  }

  onLineaChange(event: { value: number }): void {
    const lineaId = event.value;
    const tiposFiltrados = this.tipos().filter(t => t.lineaCreditoId === lineaId);
    this.tiposDisponibles.set(tiposFiltrados);
    if (!this.isEditing) {
      this.creditoForm.patchValue({ tipoCreditoId: '' });
      this.selectedTipo.set(null);
    }
  }

  onTipoChange(event: { value: number }): void {
    const tipo = this.tipos().find(t => t.id === event.value);
    this.selectedTipo.set(tipo || null);

    if (tipo) {
      // Update validators
      this.condicionesForm.get('montoSolicitado')?.setValidators([
        Validators.required,
        Validators.min(tipo.montoMinimo),
        Validators.max(tipo.montoMaximo),
      ]);
      this.condicionesForm.get('plazoSolicitado')?.setValidators([
        Validators.required,
        Validators.min(tipo.plazoMinimo),
        Validators.max(tipo.plazoMaximo),
      ]);
      this.condicionesForm.get('tasaInteresPropuesta')?.setValidators([
        Validators.required,
        Validators.min(tipo.tasaInteresMinima),
        Validators.max(tipo.tasaInteresMaxima),
      ]);

      // Set default values
      if (!this.condicionesForm.get('tasaInteresPropuesta')?.value) {
        this.condicionesForm.patchValue({ tasaInteresPropuesta: tipo.tasaInteres });
      }

      this.condicionesForm.updateValueAndValidity();
    }
  }

  requiereGarantia(): boolean {
    return this.selectedTipo()?.requiereGarantia || false;
  }

  canEditBasicData(): boolean {
    // Allow editing basic data if not saved or if editing an existing solicitud
    return !this.savedSolicitud() || this.isEditing;
  }

  saveBasicData(): void {
    if (this.clienteForm.invalid || this.creditoForm.invalid || this.condicionesForm.invalid) {
      return;
    }

    this.isSaving.set(true);

    const data: CreateSolicitudRequest = {
      personaId: Number(this.clienteForm.value.personaId),
      lineaCreditoId: Number(this.creditoForm.value.lineaCreditoId),
      tipoCreditoId: Number(this.creditoForm.value.tipoCreditoId),
      destinoCredito: this.creditoForm.value.destinoCredito,
      descripcionDestino: this.creditoForm.value.descripcionDestino || undefined,
      montoSolicitado: Number(this.condicionesForm.value.montoSolicitado),
      plazoSolicitado: Number(this.condicionesForm.value.plazoSolicitado),
      tasaInteresPropuesta: Number(this.condicionesForm.value.tasaInteresPropuesta),
      fechaSolicitud: this.condicionesForm.value.fechaSolicitud,
    };

    const request$ = this.savedSolicitud()
      ? this.solicitudService.update(this.savedSolicitud()!.id, data)
      : this.solicitudService.create(data);

    request$.subscribe({
      next: (solicitud) => {
        this.savedSolicitud.set(solicitud);
        this.snackBar.open(
          `Solicitud ${this.savedSolicitud() ? 'actualizada' : 'creada'}: ${solicitud.numeroSolicitud}`,
          'Cerrar',
          { duration: 3000 }
        );
        this.isSaving.set(false);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al guardar', 'Cerrar', { duration: 3000 });
        this.isSaving.set(false);
      },
    });
  }

  onGarantiasChanged(garantias: Garantia[]): void {
    this.garantias.set(garantias);
  }

  onAnalisisUpdated(solicitud: Solicitud): void {
    this.savedSolicitud.set(solicitud);
  }

  finalize(): void {
    if (this.savedSolicitud()) {
      this.snackBar.open('Solicitud completada exitosamente', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/creditos/solicitudes', this.savedSolicitud()!.id]);
    } else {
      this.snackBar.open('Debe guardar la solicitud primero', 'Cerrar', { duration: 3000 });
    }
  }

  goBack(): void {
    this.router.navigate(['/creditos/solicitudes']);
  }
}
