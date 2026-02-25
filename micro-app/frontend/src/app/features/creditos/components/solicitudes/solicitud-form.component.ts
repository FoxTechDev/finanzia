import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, switchMap, of, Subject, takeUntil } from 'rxjs';
import { SolicitudService } from '../../services/solicitud.service';
import { LineaCreditoService } from '../../services/linea-credito.service';
import { TipoCreditoService } from '../../services/tipo-credito.service';
import { PersonaService } from '../../../clientes/services/persona.service';
import { CatalogosService } from '../../../catalogos/services/catalogos.service';
import {
  LineaCredito,
  TipoCredito,
  DestinoCredito,
  DESTINO_CREDITO_LABELS,
  CreateSolicitudRequest,
  Solicitud,
  PeriodicidadPagoCatalogo,
  TipoInteres,
  TIPO_INTERES_LABELS,
  PlanPagoCalculado,
  CuotaPlanPagoPreview,
  CalcularPlanPagoRequest,
  RecargoSolicitudDto,
} from '@core/models/credito.model';
import { Persona } from '@core/models/cliente.model';
import { Garantia } from '@core/models/garantia.model';
import { GarantiaStepComponent } from './garantia-step/garantia-step.component';
import { AnalisisAsesorStepComponent } from './analisis-asesor-step/analisis-asesor-step.component';
import { AgregarRecargoDialogComponent } from './agregar-recargo-dialog/agregar-recargo-dialog.component';

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
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatChipsModule,
    MatDialogModule,
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
                  <!-- Periodicidad de Pago -->
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Periodicidad de Pago</mat-label>
                    <mat-select formControlName="periodicidadPagoId">
                      <mat-option [value]="null">-- Seleccione --</mat-option>
                      @for (periodicidad of periodicidades(); track periodicidad.id) {
                        <mat-option [value]="periodicidad.id">{{ periodicidad.nombre }}</mat-option>
                      }
                    </mat-select>
                    <mat-icon matPrefix>schedule</mat-icon>
                    <mat-hint>Seleccione la frecuencia de pago del crédito</mat-hint>
                  </mat-form-field>

                  <!-- Campos de Monto, Plazo, Tasa y Número de Cuotas -->
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
                      <input
                        matInput
                        type="number"
                        formControlName="plazoSolicitado"
                        placeholder="Ej: 3, 6, 12"
                      />
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
                      <mat-hint>{{ hintPlazo() }}</mat-hint>
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

                  <!-- Campo Número de Cuotas -->
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Número de Cuotas</mat-label>
                    <input
                      matInput
                      type="number"
                      formControlName="numeroCuotas"
                      min="1"
                      [max]="mostrarCamposFechaDiaria() ? 365 : 999"
                      placeholder="Número de pagos"
                    />
                    <mat-icon matPrefix>calculate</mat-icon>
                    @if (condicionesForm.get('numeroCuotas')?.hasError('required')) {
                      <mat-error>Ingrese el número de cuotas</mat-error>
                    }
                    @if (condicionesForm.get('numeroCuotas')?.hasError('min')) {
                      <mat-error>Mínimo 1 cuota</mat-error>
                    }
                    @if (condicionesForm.get('numeroCuotas')?.hasError('max')) {
                      <mat-error>Máximo {{ mostrarCamposFechaDiaria() ? 365 : 999 }} cuotas</mat-error>
                    }
                    @if (mostrarCamposFechaDiaria()) {
                      <mat-hint>Ingrese el número de pagos diarios (excluye domingos)</mat-hint>
                    } @else if (numeroCuotasEstimado() !== null) {
                      <mat-hint>Calculado automáticamente: {{ numeroCuotasEstimado() }} cuotas {{ getPeriodicidadLabel() }}</mat-hint>
                    } @else {
                      <mat-hint>Se calculará automáticamente según periodicidad</mat-hint>
                    }
                  </mat-form-field>

                  <div class="row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Tipo de Interés</mat-label>
                      <mat-select formControlName="tipoInteres">
                        @for (tipo of tiposInteres; track tipo.value) {
                          <mat-option [value]="tipo.value">{{ tipo.label }}</mat-option>
                        }
                      </mat-select>
                      <mat-icon matPrefix>trending_up</mat-icon>
                      <mat-hint>Método de cálculo de interés</mat-hint>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Fecha de Solicitud</mat-label>
                      <input matInput type="date" formControlName="fechaSolicitud" />
                      <mat-icon matPrefix>event</mat-icon>
                    </mat-form-field>
                  </div>

                  <!-- Sección de Recargos -->
                  <div class="recargos-section">
                    <div class="section-header">
                      <h4>
                        <mat-icon>add_circle_outline</mat-icon>
                        Recargos Opcionales
                      </h4>
                      <button
                        mat-stroked-button
                        color="primary"
                        type="button"
                        (click)="agregarRecargo()"
                      >
                        <mat-icon>add</mat-icon>
                        Agregar Recargo
                      </button>
                    </div>

                    @if (recargos().length > 0) {
                      <div class="recargos-list">
                        @for (recargo of recargos(); track $index) {
                          <mat-chip-row class="recargo-chip" [removable]="true" (removed)="eliminarRecargo($index)">
                            <div class="recargo-info">
                              <span class="recargo-nombre">{{ recargo.nombre }}</span>
                              <span class="recargo-detalle">
                                {{ recargo.tipo === 'PORCENTAJE' ? recargo.valor + '%' : (recargo.valor | currency:'USD') }}
                                @if (recargo.aplicaDesde || recargo.aplicaHasta) {
                                  <span class="recargo-rango">
                                    (Cuotas: {{ recargo.aplicaDesde || 1 }} - {{ recargo.aplicaHasta || 'fin' }})
                                  </span>
                                }
                              </span>
                            </div>
                            <button matChipRemove [attr.aria-label]="'Eliminar ' + recargo.nombre">
                              <mat-icon>cancel</mat-icon>
                            </button>
                          </mat-chip-row>
                        }
                      </div>
                    } @else {
                      <p class="no-recargos-message">
                        <mat-icon>info</mat-icon>
                        No hay recargos agregados. Los recargos se aplican a cada cuota del plan de pago.
                      </p>
                    }
                  </div>

                  <!-- Botón para calcular plan de pago -->
                  <div class="calcular-plan-section">
                    <button
                      mat-raised-button
                      color="accent"
                      type="button"
                      (click)="calcularPlanPago()"
                      [disabled]="!puedeCalcularPlan() || isCalculando()"
                    >
                      @if (isCalculando()) {
                        <mat-spinner diameter="20"></mat-spinner>
                      } @else {
                        <mat-icon>calculate</mat-icon>
                      }
                      {{ isCalculando() ? 'Calculando...' : 'Calcular Cuota y Plan de Pago' }}
                    </button>
                  </div>

                  <!-- Previsualización del Plan de Pago -->
                  @if (planPagoCalculado()) {
                    <div class="plan-pago-preview">
                      <h4><mat-icon>receipt_long</mat-icon> Previsualización del Plan de Pago</h4>

                      <div class="resumen-cuota">
                        <div class="cuota-principal">
                          <span class="label">Cuota:</span>
                          <span class="valor">{{ planPagoCalculado()!.cuotaNormal | currency:'USD':'symbol':'1.2-2' }}</span>
                        </div>
                        <div class="detalle-grid">
                          <div class="detalle-item">
                            <span class="label">Total Interés:</span>
                            <span class="valor">{{ planPagoCalculado()!.totalInteres | currency:'USD':'symbol':'1.2-2' }}</span>
                          </div>
                          <div class="detalle-item">
                            <span class="label">Total a Pagar:</span>
                            <span class="valor">{{ planPagoCalculado()!.totalPagar | currency:'USD':'symbol':'1.2-2' }}</span>
                          </div>
                          <div class="detalle-item">
                            <span class="label">Número de Cuotas:</span>
                            <span class="valor">{{ planPagoCalculado()!.numeroCuotas }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="tabla-plan-pago">
                        <table mat-table [dataSource]="planPagoCalculado()!.planPago" class="mat-elevation-z1">
                          <ng-container matColumnDef="numeroCuota">
                            <th mat-header-cell *matHeaderCellDef>#</th>
                            <td mat-cell *matCellDef="let cuota">{{ cuota.numeroCuota }}</td>
                          </ng-container>

                          <ng-container matColumnDef="fechaVencimiento">
                            <th mat-header-cell *matHeaderCellDef>Fecha</th>
                            <td mat-cell *matCellDef="let cuota">{{ cuota.fechaVencimiento | date:'dd/MM/yyyy' }}</td>
                          </ng-container>

                          <ng-container matColumnDef="capital">
                            <th mat-header-cell *matHeaderCellDef>Capital</th>
                            <td mat-cell *matCellDef="let cuota">{{ cuota.capital | currency:'USD':'symbol':'1.2-2' }}</td>
                          </ng-container>

                          <ng-container matColumnDef="interes">
                            <th mat-header-cell *matHeaderCellDef>Interés</th>
                            <td mat-cell *matCellDef="let cuota">{{ cuota.interes | currency:'USD':'symbol':'1.2-2' }}</td>
                          </ng-container>

                          @if (tieneRecargos()) {
                            <ng-container matColumnDef="recargos">
                              <th mat-header-cell *matHeaderCellDef>Recargos</th>
                              <td mat-cell *matCellDef="let cuota">{{ cuota.recargos | currency:'USD':'symbol':'1.2-2' }}</td>
                            </ng-container>
                          }

                          <ng-container matColumnDef="cuotaTotal">
                            <th mat-header-cell *matHeaderCellDef>Cuota</th>
                            <td mat-cell *matCellDef="let cuota">{{ cuota.cuotaTotal | currency:'USD':'symbol':'1.2-2' }}</td>
                          </ng-container>

                          <ng-container matColumnDef="saldoCapital">
                            <th mat-header-cell *matHeaderCellDef>Saldo</th>
                            <td mat-cell *matCellDef="let cuota">{{ cuota.saldoCapital | currency:'USD':'symbol':'1.2-2' }}</td>
                          </ng-container>

                          <tr mat-header-row *matHeaderRowDef="obtenerColumnasPlanPago()"></tr>
                          <tr mat-row *matRowDef="let row; columns: obtenerColumnasPlanPago();"></tr>
                        </table>
                      </div>
                    </div>
                  }

                  <div class="step-actions">
                    <button mat-button matStepperPrevious>
                      <mat-icon>arrow_back</mat-icon> Anterior
                    </button>
                    @if (!savedSolicitud() || isEditing) {
                      <button
                        mat-raised-button
                        color="primary"
                        [disabled]="condicionesForm.invalid || isSaving()"
                        (click)="saveBasicData()"
                      >
                        @if (isSaving()) {
                          <mat-spinner diameter="20"></mat-spinner>
                        }
                        {{ isSaving() ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar y Continuar') }}
                      </button>
                    }
                    @if (savedSolicitud() && !isEditing) {
                      <button
                        mat-raised-button
                        color="primary"
                        matStepperNext
                        [disabled]="condicionesForm.invalid"
                      >
                        @if (requiereGarantia()) {
                          <ng-container>Siguiente <mat-icon>arrow_forward</mat-icon></ng-container>
                        } @else {
                          <ng-container>Ir a Análisis <mat-icon>arrow_forward</mat-icon></ng-container>
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

      .info-cuotas {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        margin: 16px 0;
        background: #e8f5e9;
        border-radius: 8px;
        border-left: 4px solid #4caf50;
        color: #2e7d32;
        flex-wrap: wrap;
      }
      .info-cuotas mat-icon {
        color: #4caf50;
        flex-shrink: 0;
      }
      .info-cuotas span {
        flex: 1;
        font-size: 14px;
        line-height: 1.5;
      }
      .info-cuotas strong {
        color: #1b5e20;
        font-weight: 600;
      }

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
        .info-cuotas {
          padding: 10px 12px;
          font-size: 13px;
        }
      }

      @media (max-width: 480px) {
        .params-grid { grid-template-columns: 1fr; }
        .cliente-header h3 { font-size: 1rem; }
        .info-cuotas {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
        .info-cuotas mat-icon {
          align-self: center;
        }
      }

      /* Fix for mat-stepper on mobile */
      ::ng-deep .mat-horizontal-stepper-header-container {
        flex-wrap: wrap;
      }
      ::ng-deep .mat-step-header {
        flex-shrink: 0;
      }

      /* Estilos para sección de recargos */
      .recargos-section {
        margin: 24px 0;
        padding: 16px;
        background: #f9f9f9;
        border-radius: 8px;
        border-left: 4px solid #9c27b0;
      }

      .recargos-section .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        flex-wrap: wrap;
        gap: 12px;
      }

      .recargos-section .section-header h4 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #7b1fa2;
        font-size: 16px;
      }

      .recargos-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }

      .recargo-chip {
        max-width: 100%;
      }

      .recargo-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .recargo-nombre {
        font-weight: 500;
        font-size: 14px;
      }

      .recargo-detalle {
        font-size: 12px;
        color: #666;
      }

      .recargo-rango {
        font-style: italic;
        margin-left: 4px;
      }

      .no-recargos-message {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #666;
        font-size: 14px;
        margin: 12px 0;
        padding: 12px;
        background: white;
        border-radius: 4px;
      }

      .no-recargos-message mat-icon {
        color: #9c27b0;
      }

      /* Estilos para calcular plan de pago */
      .calcular-plan-section {
        display: flex;
        justify-content: center;
        margin: 16px 0;
        padding: 16px;
        background: #f5f5f5;
        border-radius: 8px;
      }
      .calcular-plan-section button {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      /* Estilos para previsualización del plan de pago */
      .plan-pago-preview {
        margin: 16px 0;
        padding: 16px;
        background: #fff8e1;
        border-radius: 8px;
        border-left: 4px solid #ff9800;
      }
      .plan-pago-preview h4 {
        margin: 0 0 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #e65100;
        flex-wrap: wrap;
      }

      .resumen-cuota {
        background: white;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .cuota-principal {
        text-align: center;
        padding: 20px 16px;
        background: #667eea;
        color: white;
        border-radius: 8px;
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .cuota-principal .label {
        display: block;
        font-size: 14px;
        font-weight: 400;
        opacity: 0.9;
        margin-bottom: 4px;
        line-height: 1.4;
      }
      .cuota-principal .valor {
        display: block;
        font-size: 32px;
        font-weight: bold;
        line-height: 1.2;
        word-break: break-word;
      }

      .detalle-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
      }

      .detalle-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 12px;
        background: #f5f5f5;
        border-radius: 4px;
        min-height: 60px;
      }
      .detalle-item .label {
        display: block;
        font-size: 12px;
        color: #666;
        font-weight: 500;
        margin-bottom: 4px;
        line-height: 1.3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .detalle-item .valor {
        display: block;
        font-size: 16px;
        font-weight: 600;
        color: #333;
        line-height: 1.4;
        word-break: break-word;
      }

      .tabla-plan-pago {
        overflow-x: auto;
        max-height: 400px;
        overflow-y: auto;
        margin-top: 16px;
      }
      .tabla-plan-pago table {
        width: 100%;
        font-size: 13px;
        border-collapse: collapse;
      }
      .tabla-plan-pago th {
        background: #667eea;
        color: white;
        position: sticky;
        top: 0;
        z-index: 10;
        padding: 12px 8px;
        text-align: left;
        font-weight: 600;
        white-space: nowrap;
      }
      .tabla-plan-pago td {
        text-align: right;
        padding: 10px 8px;
        border-bottom: 1px solid #e0e0e0;
      }
      .tabla-plan-pago td:first-child {
        text-align: center;
        font-weight: 500;
      }
      .tabla-plan-pago tr:hover {
        background-color: #f5f5f5;
      }

      /* Responsive adjustments para plan de pago */
      @media (max-width: 768px) {
        .cuota-principal .valor {
          font-size: 28px;
        }
        .detalle-grid {
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .detalle-item {
          padding: 10px;
          min-height: 55px;
        }
        .tabla-plan-pago {
          font-size: 11px;
        }
        .tabla-plan-pago th,
        .tabla-plan-pago td {
          padding: 8px 4px;
        }
      }

      @media (max-width: 480px) {
        .plan-pago-preview {
          padding: 12px;
        }
        .cuota-principal {
          padding: 16px 12px;
        }
        .cuota-principal .valor {
          font-size: 24px;
        }
        .detalle-item .valor {
          font-size: 14px;
        }
        .tabla-plan-pago {
          font-size: 10px;
          max-height: 300px;
        }
      }
    `,
  ],
})
export class SolicitudFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private solicitudService = inject(SolicitudService);
  private lineaService = inject(LineaCreditoService);
  private tipoService = inject(TipoCreditoService);
  private personaService = inject(PersonaService);
  private catalogosService = inject(CatalogosService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  isLoading = signal(true);
  isSaving = signal(false);
  isSearching = signal(false);
  isEditing = false;
  solicitudId: number | null = null;

  lineas = signal<LineaCredito[]>([]);
  tipos = signal<TipoCredito[]>([]);
  tiposDisponibles = signal<TipoCredito[]>([]);
  periodicidades = signal<PeriodicidadPagoCatalogo[]>([]);
  clientesFiltrados = signal<Persona[]>([]);
  selectedCliente = signal<Persona | null>(null);
  selectedTipo = signal<TipoCredito | null>(null);
  savedSolicitud = signal<Solicitud | null>(null);
  garantias = signal<Garantia[]>([]);
  mostrarCamposFechaDiaria = signal<boolean>(false);
  planPagoCalculado = signal<PlanPagoCalculado | null>(null);
  isCalculando = signal(false);
  recargos = signal<RecargoSolicitudDto[]>([]);

  // Propiedades para los límites de plazo convertidos según periodicidad
  plazoMinimoConvertido = signal<number>(1);
  plazoMaximoConvertido = signal<number>(12);
  unidadPlazo = signal<string>('meses');

  // Propiedades para hints dinámicos
  hintPlazo = signal<string>('');
  numeroCuotasEstimado = signal<number | null>(null);

  destinos = Object.entries(DESTINO_CREDITO_LABELS).map(([value, label]) => ({
    value: value as DestinoCredito,
    label,
  }));

  tiposInteres = Object.entries(TIPO_INTERES_LABELS).map(([value, label]) => ({
    value: value as TipoInteres,
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
      periodicidadPagoId: [''],
      fechaDesdePago: [''],
      fechaHastaPago: [''],
      numeroCuotas: [''], // Campo de número de cuotas (editable para DIARIA, calculado para otras)
      montoSolicitado: ['', [Validators.required, Validators.min(0)]],
      plazoSolicitado: ['', [Validators.required, Validators.min(1)]],
      tasaInteresPropuesta: ['', [Validators.required, Validators.min(0)]],
      tipoInteres: [TipoInteres.FLAT, Validators.required],
      fechaSolicitud: [today, Validators.required],
    });

    // Setup cliente search with improved search
    this.clienteForm.get('busquedaCliente')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
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

    // Suscribirse a cambios de periodicidad de pago
    this.condicionesForm.get('periodicidadPagoId')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(periodicidadId => {
      this.onPeriodicidadChange(periodicidadId);
    });

    // Suscribirse a cambios del campo numeroCuotas (cuando es editable en DIARIA)
    this.condicionesForm.get('numeroCuotas')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // Solo actualizar si estamos en modo DIARIA (no recalcular para evitar loops)
      if (!this.mostrarCamposFechaDiaria()) {
        // Si no es DIARIA, este campo se calcula automáticamente
        // No hacemos nada aquí
      }
    });

    // Suscribirse a cambios del plazo para actualizar el número de cuotas automáticamente
    this.condicionesForm.get('plazoSolicitado')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.actualizarNumeroCuotas();
    });
  }

  ngOnInit(): void {
    this.solicitudId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
    this.isEditing = !!this.solicitudId;

    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.lineaService.getAll(true).subscribe({
      next: (lineas) => {
        this.lineas.set(lineas);
        this.tipoService.getAll(undefined, true).subscribe({
          next: (tipos) => {
            this.tipos.set(tipos);
            // Cargar periodicidades de pago
            this.catalogosService.getPeriodicidadesPago(true).subscribe({
              next: (periodicidades) => {
                this.periodicidades.set(periodicidades as PeriodicidadPagoCatalogo[]);
                if (this.isEditing && this.solicitudId) {
                  this.loadSolicitud(this.solicitudId);
                } else {
                  this.isLoading.set(false);
                }
              },
              error: () => {
                this.snackBar.open('Error al cargar periodicidades', 'Cerrar', { duration: 3000 });
                this.isLoading.set(false);
              },
            });
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
          periodicidadPagoId: solicitud.periodicidadPagoId,
          tipoInteres: solicitud.tipoInteres || TipoInteres.FLAT,
          fechaDesdePago: solicitud.fechaDesdePago,
          fechaHastaPago: solicitud.fechaHastaPago,
          montoSolicitado: solicitud.montoSolicitado,
          plazoSolicitado: solicitud.plazoSolicitado,
          tasaInteresPropuesta: solicitud.tasaInteresPropuesta,
          fechaSolicitud: solicitud.fechaSolicitud,
        });

        // Verificar si la periodicidad es DIARIO para mostrar campos de fecha
        if (solicitud.periodicidadPagoId) {
          this.onPeriodicidadChange(solicitud.periodicidadPagoId);
        }

        if (solicitud.garantias) {
          this.garantias.set(solicitud.garantias);
        }

        // Cargar el plan de pago guardado y los recargos
        this.cargarPlanPagoGuardado(id);

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
      // Update validators para monto
      this.condicionesForm.get('montoSolicitado')?.setValidators([
        Validators.required,
        Validators.min(tipo.montoMinimo),
        Validators.max(tipo.montoMaximo),
      ]);

      // Actualizar validadores de plazo según la periodicidad seleccionada
      this.actualizarValidadoresPlazo();

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

    // Para periodicidad DIARIA, el plazo ya está sincronizado con numeroDiasPago
    const data: CreateSolicitudRequest = {
      personaId: Number(this.clienteForm.value.personaId),
      lineaCreditoId: Number(this.creditoForm.value.lineaCreditoId),
      tipoCreditoId: Number(this.creditoForm.value.tipoCreditoId),
      destinoCredito: this.creditoForm.value.destinoCredito,
      descripcionDestino: this.creditoForm.value.descripcionDestino || undefined,
      periodicidadPagoId: this.condicionesForm.value.periodicidadPagoId ? Number(this.condicionesForm.value.periodicidadPagoId) : undefined,
      tipoInteres: this.condicionesForm.value.tipoInteres || undefined,
      fechaDesdePago: this.condicionesForm.value.fechaDesdePago || undefined,
      fechaHastaPago: this.condicionesForm.value.fechaHastaPago || undefined,
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

        // Si hay un plan de pago calculado, guardarlo
        if (this.planPagoCalculado()) {
          this.guardarPlanPagoSolicitud(solicitud.id);
        } else {
          this.snackBar.open(
            `Solicitud ${this.isEditing ? 'actualizada' : 'creada'}: ${solicitud.numeroSolicitud}`,
            'Cerrar',
            { duration: 3000 }
          );
          this.isSaving.set(false);
        }
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al guardar', 'Cerrar', { duration: 3000 });
        this.isSaving.set(false);
      },
    });
  }

  /**
   * Guarda el plan de pago calculado en la base de datos
   */
  private guardarPlanPagoSolicitud(solicitudId: number): void {
    const periodicidad = this.periodicidades().find(
      p => p.id === this.condicionesForm.value.periodicidadPagoId
    );

    if (!periodicidad) {
      this.snackBar.open('Solicitud guardada (sin plan de pago)', 'Cerrar', { duration: 3000 });
      this.isSaving.set(false);
      return;
    }

    // Construir la fecha de primera cuota
    let fechaPrimeraCuota: string;
    if (periodicidad.codigo === 'DIARIO' && this.condicionesForm.value.fechaDesdePago) {
      fechaPrimeraCuota = new Date(this.condicionesForm.value.fechaDesdePago).toISOString().split('T')[0];
    } else {
      fechaPrimeraCuota = this.condicionesForm.value.fechaSolicitud;
    }

    // Obtener el número de cuotas
    const numeroCuotasValue = this.condicionesForm.value.numeroCuotas
      ? Number(this.condicionesForm.value.numeroCuotas)
      : this.numeroCuotasEstimado();

    const request: CalcularPlanPagoRequest = {
      monto: Number(this.condicionesForm.value.montoSolicitado),
      plazo: Number(this.condicionesForm.value.plazoSolicitado),
      tasaInteres: Number(this.condicionesForm.value.tasaInteresPropuesta),
      periodicidad: periodicidad.codigo,
      tipoInteres: this.condicionesForm.value.tipoInteres,
      fechaPrimeraCuota,
      numeroCuotas: numeroCuotasValue ?? undefined,
      recargos: this.recargos().length > 0 ? this.recargos() : undefined,
    };

    this.solicitudService.guardarPlanPago(solicitudId, request).subscribe({
      next: () => {
        this.snackBar.open(
          `Solicitud ${this.isEditing ? 'actualizada' : 'creada'} con plan de pago guardado`,
          'Cerrar',
          { duration: 3000 }
        );
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error al guardar plan de pago:', err);
        this.snackBar.open(
          `Solicitud guardada, pero error al guardar plan de pago: ${err.error?.message || 'Error desconocido'}`,
          'Cerrar',
          { duration: 5000 }
        );
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

  /**
   * Maneja el cambio de periodicidad de pago
   * Si es DIARIO, el campo numeroCuotas es editable
   * Para otras periodicidades, se calcula automáticamente
   */
  onPeriodicidadChange(periodicidadId: number): void {
    const periodicidad = this.periodicidades().find(p => p.id === periodicidadId);
    const esDiario = periodicidad?.codigo === 'DIARIO';

    this.mostrarCamposFechaDiaria.set(esDiario);

    const numeroCuotasControl = this.condicionesForm.get('numeroCuotas');

    if (esDiario) {
      // Para periodicidad DIARIA, el campo numeroCuotas es editable y requerido
      numeroCuotasControl?.setValidators([Validators.required, Validators.min(1), Validators.max(365)]);
      numeroCuotasControl?.enable();

      // Si no tiene valor, inicializar con el valor del plazo
      if (!numeroCuotasControl?.value) {
        const plazoActual = this.condicionesForm.get('plazoSolicitado')?.value;
        if (plazoActual) {
          numeroCuotasControl?.setValue(plazoActual);
        }
      }
    } else {
      // Para otras periodicidades, el campo es readonly (calculado automáticamente)
      numeroCuotasControl?.clearValidators();
      numeroCuotasControl?.disable();
    }

    numeroCuotasControl?.updateValueAndValidity();

    // Actualizar validadores del plazo según la nueva periodicidad
    this.actualizarValidadoresPlazo();

    // Actualizar hint dinámico
    this.actualizarHintPlazo(periodicidad?.codigo);

    // Actualizar número de cuotas calculado
    this.actualizarNumeroCuotas();
  }


  /**
   * Actualiza los validadores del plazo
   * IMPORTANTE: El plazo SIEMPRE se ingresa en MESES para todas las periodicidades
   */
  actualizarValidadoresPlazo(): void {
    const tipo = this.selectedTipo();
    if (!tipo) return;

    // SIEMPRE usar límites en meses del tipo de crédito
    this.plazoMinimoConvertido.set(tipo.plazoMinimo);
    this.plazoMaximoConvertido.set(tipo.plazoMaximo);
    this.unidadPlazo.set('meses');

    this.condicionesForm.get('plazoSolicitado')?.setValidators([
      Validators.required,
      Validators.min(tipo.plazoMinimo),
      Validators.max(tipo.plazoMaximo),
    ]);

    this.condicionesForm.get('plazoSolicitado')?.updateValueAndValidity();
  }

  /**
   * Actualiza el hint del campo de plazo
   * El plazo siempre se ingresa en meses
   */
  actualizarHintPlazo(codigoPeriodicidad?: string): void {
    if (!codigoPeriodicidad) {
      this.hintPlazo.set('Seleccione una periodicidad');
      return;
    }

    const hints: { [key: string]: string } = {
      DIARIO: 'Plazo en meses (el número de cuotas se ingresa abajo)',
      SEMANAL: 'Ejemplo: 3 meses = 12 cuotas semanales',
      QUINCENAL: 'Ejemplo: 3 meses = 6 cuotas quincenales',
      MENSUAL: 'Ejemplo: 3 meses = 3 cuotas mensuales',
      TRIMESTRAL: 'Ejemplo: 6 meses = 2 cuotas trimestrales',
      SEMESTRAL: 'Ejemplo: 12 meses = 2 cuotas semestrales',
      ANUAL: 'Ejemplo: 12 meses = 1 cuota anual',
    };

    this.hintPlazo.set(hints[codigoPeriodicidad] || 'Ingrese el plazo en meses');
  }

  /**
   * Calcula y actualiza el número de cuotas según el plazo y la periodicidad
   * - Para DIARIA: no se calcula, el usuario lo ingresa manualmente
   * - Para otras: se calcula automáticamente y se actualiza el campo
   */
  actualizarNumeroCuotas(): void {
    const periodicidadId = this.condicionesForm.get('periodicidadPagoId')?.value;
    const plazo = this.condicionesForm.get('plazoSolicitado')?.value;

    if (!periodicidadId || !plazo || plazo <= 0) {
      this.numeroCuotasEstimado.set(null);
      return;
    }

    const periodicidad = this.periodicidades().find(p => p.id === periodicidadId);
    if (!periodicidad) {
      this.numeroCuotasEstimado.set(null);
      return;
    }

    const codigo = periodicidad.codigo;

    // Para periodicidad DIARIA, el usuario ingresa el número de cuotas manualmente
    if (codigo === 'DIARIO') {
      const numeroCuotasManual = this.condicionesForm.get('numeroCuotas')?.value;
      if (numeroCuotasManual > 0) {
        this.numeroCuotasEstimado.set(numeroCuotasManual);
      } else {
        this.numeroCuotasEstimado.set(null);
      }
      return;
    }

    // Para otras periodicidades, calcular cuotas automáticamente según el plazo en MESES
    let cuotas = 0;
    switch (codigo) {
      case 'SEMANAL':
        cuotas = plazo * 4; // 1 mes = 4 semanas
        break;
      case 'QUINCENAL':
        cuotas = plazo * 2; // 1 mes = 2 quincenas
        break;
      case 'MENSUAL':
        cuotas = plazo * 1; // 1 mes = 1 cuota
        break;
      case 'TRIMESTRAL':
        cuotas = Math.ceil(plazo / 3); // 3 meses = 1 trimestre
        break;
      case 'SEMESTRAL':
        cuotas = Math.ceil(plazo / 6); // 6 meses = 1 semestre
        break;
      case 'ANUAL':
        cuotas = Math.ceil(plazo / 12); // 12 meses = 1 año
        break;
      default:
        cuotas = plazo;
    }

    this.numeroCuotasEstimado.set(cuotas);

    // Actualizar el campo numeroCuotas con el valor calculado (readonly para periodicidades != DIARIA)
    this.condicionesForm.get('numeroCuotas')?.setValue(cuotas, { emitEvent: false });
  }

  /**
   * Obtiene el texto descriptivo de la periodicidad seleccionada
   */
  getPeriodicidadLabel(): string {
    const periodicidadId = this.condicionesForm.get('periodicidadPagoId')?.value;
    const periodicidad = this.periodicidades().find(p => p.id === periodicidadId);
    return periodicidad?.nombre.toLowerCase() || '';
  }

  /**
   * Carga el plan de pago guardado previamente en la base de datos
   * Esto se ejecuta cuando se está editando una solicitud existente
   */
  private cargarPlanPagoGuardado(solicitudId: number): void {
    this.solicitudService.obtenerPlanPago(solicitudId).subscribe({
      next: (planGuardado: any) => {
        // El backend retorna un objeto con solicitud, planPago, recargos y totales
        if (planGuardado.planPago && planGuardado.planPago.length > 0) {
          // Usar los totales calculados por el backend
          const totales = planGuardado.totales || {};
          const numeroCuotas = planGuardado.planPago.length;

          // Transformar el plan al formato esperado por el componente
          const planCalculado: PlanPagoCalculado = {
            cuotaNormal: totales.cuotaNormal || planGuardado.planPago[0]?.cuotaTotal || 0,
            numeroCuotas,
            totalInteres: totales.totalInteres || 0,
            totalPagar: totales.totalPagar || 0,
            planPago: planGuardado.planPago.map((cuota: any) => ({
              numeroCuota: cuota.numeroCuota,
              fechaVencimiento: cuota.fechaVencimiento,
              capital: Number(cuota.capital),
              interes: Number(cuota.interes),
              recargos: Number(cuota.recargos) || 0,
              cuotaTotal: Number(cuota.cuotaTotal),
              saldoCapital: Number(cuota.saldoCapital),
            })),
          };

          this.planPagoCalculado.set(planCalculado);

          // Cargar los recargos si existen
          if (planGuardado.recargos && planGuardado.recargos.length > 0) {
            const recargosDto = planGuardado.recargos.map((r: any) => ({
              nombre: r.nombre,
              tipo: r.tipo,
              valor: Number(r.valor),
              aplicaDesde: r.aplicaDesde,
              aplicaHasta: r.aplicaHasta,
            }));
            this.recargos.set(recargosDto);
          }
        }
      },
      error: () => {
        // Si no hay plan guardado o hay un error, no hacer nada
        // El usuario podrá calcular uno nuevo si lo desea
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/creditos/solicitudes']);
  }

  /**
   * Verifica si se puede calcular el plan de pago
   */
  puedeCalcularPlan(): boolean {
    const monto = this.condicionesForm.get('montoSolicitado')?.value;
    const plazo = this.condicionesForm.get('plazoSolicitado')?.value;
    const tasa = this.condicionesForm.get('tasaInteresPropuesta')?.value;
    const periodicidadId = this.condicionesForm.get('periodicidadPagoId')?.value;
    const tipoInteres = this.condicionesForm.get('tipoInteres')?.value;

    return !!(monto > 0 && plazo > 0 && tasa >= 0 && periodicidadId && tipoInteres);
  }

  /**
   * Calcula el plan de pago llamando al backend
   */
  calcularPlanPago(): void {
    if (!this.puedeCalcularPlan()) {
      this.snackBar.open('Complete todos los campos requeridos para calcular el plan', 'Cerrar', { duration: 3000 });
      return;
    }

    const periodicidad = this.periodicidades().find(
      p => p.id === this.condicionesForm.value.periodicidadPagoId
    );

    if (!periodicidad) {
      this.snackBar.open('Seleccione una periodicidad válida', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isCalculando.set(true);
    this.planPagoCalculado.set(null);

    // Usar la fecha de solicitud como fecha de primera cuota
    // Si es pago diario y hay fechaDesdePago, usar esa fecha
    let fechaPrimeraCuota: string;
    if (periodicidad.codigo === 'DIARIO' && this.condicionesForm.value.fechaDesdePago) {
      fechaPrimeraCuota = new Date(this.condicionesForm.value.fechaDesdePago).toISOString().split('T')[0];
    } else {
      // Por defecto usar la fecha de solicitud
      fechaPrimeraCuota = this.condicionesForm.value.fechaSolicitud;
    }

    // Obtener el número de cuotas (para DIARIA es ingresado, para otras es calculado)
    const numeroCuotasValue = this.condicionesForm.value.numeroCuotas
      ? Number(this.condicionesForm.value.numeroCuotas)
      : this.numeroCuotasEstimado();

    const request: CalcularPlanPagoRequest = {
      monto: Number(this.condicionesForm.value.montoSolicitado),
      plazo: Number(this.condicionesForm.value.plazoSolicitado),
      tasaInteres: Number(this.condicionesForm.value.tasaInteresPropuesta),
      periodicidad: periodicidad.codigo,
      tipoInteres: this.condicionesForm.value.tipoInteres,
      fechaPrimeraCuota,
      numeroCuotas: numeroCuotasValue ?? undefined, // Convertir null a undefined
      recargos: this.recargos().length > 0 ? this.recargos() : undefined,
    };

    this.solicitudService.calcularPlanPago(request).subscribe({
      next: (resultado) => {
        this.planPagoCalculado.set(resultado);
        this.isCalculando.set(false);
        this.snackBar.open('Plan de pago calculado exitosamente', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.isCalculando.set(false);
        this.snackBar.open(err.error?.message || 'Error al calcular el plan de pago', 'Cerrar', { duration: 3000 });
      },
    });
  }

  /**
   * Abre el diálogo para agregar un recargo
   */
  agregarRecargo(): void {
    const dialogRef = this.dialog.open(AgregarRecargoDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((recargo: RecargoSolicitudDto | null) => {
      if (recargo) {
        this.recargos.update(recargos => [...recargos, recargo]);
        this.snackBar.open('Recargo agregado exitosamente', 'Cerrar', { duration: 2000 });

        // Limpiar el plan de pago calculado para forzar recálculo
        this.planPagoCalculado.set(null);
      }
    });
  }

  /**
   * Elimina un recargo por índice
   */
  eliminarRecargo(index: number): void {
    this.recargos.update(recargos => recargos.filter((_, i) => i !== index));
    this.snackBar.open('Recargo eliminado', 'Cerrar', { duration: 2000 });

    // Limpiar el plan de pago calculado para forzar recálculo
    this.planPagoCalculado.set(null);
  }

  /**
   * Verifica si hay recargos en el plan calculado
   */
  tieneRecargos(): boolean {
    return this.recargos().length > 0;
  }

  /**
   * Obtiene las columnas a mostrar en la tabla del plan de pago
   * Incluye la columna de recargos solo si hay recargos agregados
   */
  obtenerColumnasPlanPago(): string[] {
    const columnas = ['numeroCuota', 'fechaVencimiento', 'capital', 'interes'];

    if (this.tieneRecargos()) {
      columnas.push('recargos');
    }

    columnas.push('cuotaTotal', 'saldoCapital');

    return columnas;
  }
}
