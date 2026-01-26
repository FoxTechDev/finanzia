import { Component, inject, Input, signal, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, distinctUntilChanged, switchMap, of, forkJoin } from 'rxjs';
import { GarantiaService } from '../../../services/garantia.service';
import { PersonaService } from '../../../../clientes/services/persona.service';
import { UbicacionService } from '../../../../clientes/services/ubicacion.service';
import {
  Garantia,
  CreateGarantiaRequest,
  EstadoGarantia,
  ESTADO_GARANTIA_LABELS,
  CoberturaGarantia,
  TipoGarantiaCatalogo,
  TipoInmuebleCatalogo,
  TipoDocumentoCatalogo,
} from '@core/models/garantia.model';
import { Persona, Departamento, Municipio, Distrito } from '@core/models/cliente.model';

@Component({
  selector: 'app-garantia-step',
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
    MatDialogModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    CurrencyPipe,
  ],
  template: `
    <div class="garantia-step">
      <!-- Cobertura -->
      <div class="cobertura-card">
        <div class="cobertura-info">
          <div class="cobertura-item">
            <span class="label">Total Garantías:</span>
            <span class="value">{{ cobertura()?.totalGarantias | currency:'USD' }}</span>
          </div>
          <div class="cobertura-item">
            <span class="label">Monto Solicitado:</span>
            <span class="value">{{ cobertura()?.montoSolicitado | currency:'USD' }}</span>
          </div>
          <div class="cobertura-item">
            <span class="label">Cobertura:</span>
            <span class="value" [class.good]="(cobertura()?.cobertura || 0) >= 100" [class.warning]="(cobertura()?.cobertura || 0) < 100">
              {{ cobertura()?.cobertura || 0 }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Lista de garantías -->
      <div class="garantias-list">
        <div class="list-header">
          <h3>Garantías registradas</h3>
          <button mat-raised-button color="primary" (click)="openForm()">
            <mat-icon>add</mat-icon> Agregar Garantía
          </button>
        </div>

        @if (isLoading()) {
          <div class="loading">
            <mat-spinner diameter="30"></mat-spinner>
          </div>
        } @else if (garantias().length === 0) {
          <div class="empty-state">
            <mat-icon>security</mat-icon>
            <p>No hay garantías registradas</p>
          </div>
        } @else {
          <div class="garantias-cards">
            @for (garantia of garantias(); track garantia.id) {
              <mat-card class="garantia-card">
                <mat-card-header>
                  <mat-chip [color]="'primary'">
                    {{ garantia.tipoGarantiaCatalogo?.nombre || 'Sin tipo' }}
                  </mat-chip>
                  <span class="spacer"></span>
                  <mat-chip>{{ getEstadoLabel(garantia.estado!) }}</mat-chip>
                </mat-card-header>
                <mat-card-content>
                  <p><strong>Descripción:</strong> {{ garantia.descripcion || 'Sin descripción' }}</p>
                  <p><strong>Valor Estimado:</strong> {{ garantia.valorEstimado | currency:'USD' }}</p>
                  @if (garantia.hipotecaria) {
                    <p><strong>Tipo Inmueble:</strong> {{ garantia.hipotecaria.tipoInmuebleEntity?.nombre || 'N/A' }}</p>
                    <p><strong>Registro CNR:</strong> {{ garantia.hipotecaria.numeroRegistro || 'N/A' }}</p>
                    @if (garantia.hipotecaria.departamento) {
                      <p><strong>Ubicación:</strong> {{ garantia.hipotecaria.departamento?.nombre }}, {{ garantia.hipotecaria.municipio?.nombre }}</p>
                    }
                  }
                  @if (garantia.prendaria) {
                    <p><strong>Tipo Bien:</strong> {{ garantia.prendaria.tipoBien }}</p>
                    <p><strong>Marca/Modelo:</strong> {{ garantia.prendaria.marca }} {{ garantia.prendaria.modelo }}</p>
                  }
                  @if (garantia.fiador) {
                    <p><strong>Fiador:</strong> {{ garantia.fiador.personaFiador?.nombre }} {{ garantia.fiador.personaFiador?.apellido }}</p>
                    <p><strong>Lugar de Trabajo:</strong> {{ garantia.fiador.lugarTrabajo || 'N/A' }}</p>
                  }
                  @if (garantia.documentaria) {
                    <p><strong>Tipo Doc:</strong> {{ garantia.documentaria.tipoDocumentoEntity?.nombre || 'N/A' }}</p>
                    <p><strong>Monto:</strong> {{ garantia.documentaria.montoDocumento | currency:'USD' }}</p>
                  }
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button color="primary" (click)="editGarantia(garantia)">
                    <mat-icon>edit</mat-icon> Editar
                  </button>
                  <button mat-button color="warn" (click)="deleteGarantia(garantia)">
                    <mat-icon>delete</mat-icon> Eliminar
                  </button>
                </mat-card-actions>
              </mat-card>
            }
          </div>
        }
      </div>

      <!-- Formulario de garantía (dialog inline) -->
      @if (showForm()) {
        <div class="form-overlay" (click)="closeForm()">
          <mat-card class="form-dialog" (click)="$event.stopPropagation()">
            <mat-card-header>
              <mat-card-title>{{ editingGarantia() ? 'Editar' : 'Nueva' }} Garantía</mat-card-title>
              <span class="spacer"></span>
              <button mat-icon-button (click)="closeForm()">
                <mat-icon>close</mat-icon>
              </button>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="garantiaForm" class="garantia-form">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="form-field">
                    <mat-label>Tipo de Garantía</mat-label>
                    <mat-select formControlName="tipoGarantiaId" (selectionChange)="onTipoChange()">
                      @for (tipo of tiposGarantia(); track tipo.id) {
                        <mat-option [value]="tipo.id">{{ tipo.nombre }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="form-field">
                    <mat-label>Valor Estimado ($)</mat-label>
                    <input matInput type="number" formControlName="valorEstimado" step="0.01" />
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="form-field-full">
                  <mat-label>Descripción</mat-label>
                  <textarea matInput formControlName="descripcion" rows="2"></textarea>
                </mat-form-field>

                <!-- Formularios específicos según tipo -->
                @if (getTipoCodigo() === 'HIPOTECARIA') {
                  <div class="tipo-form" formGroupName="hipotecaria">
                    <h4>Datos del Inmueble</h4>
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Tipo de Inmueble</mat-label>
                        <mat-select formControlName="tipoInmuebleId">
                          @for (tipo of tiposInmueble(); track tipo.id) {
                            <mat-option [value]="tipo.id">{{ tipo.nombre }}</mat-option>
                          }
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Valor Pericial ($)</mat-label>
                        <input matInput type="number" formControlName="valorPericial" step="0.01" />
                      </mat-form-field>
                    </div>

                    <mat-form-field appearance="outline" class="form-field-full">
                      <mat-label>Dirección del Inmueble</mat-label>
                      <textarea matInput formControlName="direccion" rows="2"></textarea>
                    </mat-form-field>

                    <!-- Ubicación geográfica -->
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field-third">
                        <mat-label>Departamento</mat-label>
                        <mat-select formControlName="departamentoId" (selectionChange)="onDepartamentoChange($event.value)">
                          @for (dep of departamentos(); track dep.id) {
                            <mat-option [value]="dep.id">{{ dep.nombre }}</mat-option>
                          }
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="form-field-third">
                        <mat-label>Municipio</mat-label>
                        <mat-select formControlName="municipioId" (selectionChange)="onMunicipioChange($event.value)">
                          @for (mun of municipios(); track mun.id) {
                            <mat-option [value]="mun.id">{{ mun.nombre }}</mat-option>
                          }
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="form-field-third">
                        <mat-label>Distrito</mat-label>
                        <mat-select formControlName="distritoId">
                          @for (dis of distritos(); track dis.id) {
                            <mat-option [value]="dis.id">{{ dis.nombre }}</mat-option>
                          }
                        </mat-select>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field-third">
                        <mat-label>No. Registro CNR</mat-label>
                        <input matInput formControlName="numeroRegistro" />
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="form-field-third">
                        <mat-label>Folio</mat-label>
                        <input matInput formControlName="folioRegistro" />
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="form-field-third">
                        <mat-label>Libro</mat-label>
                        <input matInput formControlName="libroRegistro" />
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Área Terreno (m²)</mat-label>
                        <input matInput type="number" formControlName="areaTerreno" step="0.01" />
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Área Construcción (m²)</mat-label>
                        <input matInput type="number" formControlName="areaConstruccion" step="0.01" />
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Nombre del Perito</mat-label>
                        <input matInput formControlName="nombrePerito" />
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Fecha de Avalúo</mat-label>
                        <input matInput type="date" formControlName="fechaAvaluo" />
                      </mat-form-field>
                    </div>
                  </div>
                }

                @if (getTipoCodigo() === 'PRENDARIA') {
                  <div class="tipo-form" formGroupName="prendaria">
                    <h4>Datos del Bien</h4>
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Tipo de Bien</mat-label>
                        <input matInput formControlName="tipoBien" placeholder="Ej: Vehículo, Maquinaria" />
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Valor Pericial ($)</mat-label>
                        <input matInput type="number" formControlName="valorPericial" step="0.01" />
                      </mat-form-field>
                    </div>

                    <mat-form-field appearance="outline" class="form-field-full">
                      <mat-label>Descripción del Bien</mat-label>
                      <textarea matInput formControlName="descripcionBien" rows="2"></textarea>
                    </mat-form-field>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field-third">
                        <mat-label>Marca</mat-label>
                        <input matInput formControlName="marca" />
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="form-field-third">
                        <mat-label>Modelo</mat-label>
                        <input matInput formControlName="modelo" />
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="form-field-third">
                        <mat-label>Año</mat-label>
                        <input matInput type="number" formControlName="anio" />
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Serie</mat-label>
                        <input matInput formControlName="serie" />
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Placa (si aplica)</mat-label>
                        <input matInput formControlName="placa" />
                      </mat-form-field>
                    </div>

                    <mat-form-field appearance="outline" class="form-field-full">
                      <mat-label>Ubicación del Bien</mat-label>
                      <textarea matInput formControlName="ubicacionBien" rows="2"></textarea>
                    </mat-form-field>
                  </div>
                }

                @if (getTipoCodigo() === 'FIDUCIARIA') {
                  <div class="tipo-form" formGroupName="fiador">
                    <h4>Datos del Fiador</h4>
                    <mat-form-field appearance="outline" class="form-field-full">
                      <mat-label>Buscar Fiador (DUI o Nombre)</mat-label>
                      <input
                        matInput
                        [formControl]="fiadorSearchControl"
                        [matAutocomplete]="autoFiador"
                        placeholder="Ingrese DUI o nombre del fiador"
                      />
                      <mat-autocomplete
                        #autoFiador="matAutocomplete"
                        (optionSelected)="onFiadorSelected($event)"
                        [displayWith]="displayFiador"
                      >
                        @for (fiador of fiadoresFiltrados(); track fiador.id) {
                          <mat-option [value]="fiador">
                            {{ fiador.numeroDui }} - {{ fiador.nombre }} {{ fiador.apellido }}
                          </mat-option>
                        }
                      </mat-autocomplete>
                    </mat-form-field>

                    @if (selectedFiador()) {
                      <div class="fiador-info">
                        <div class="fiador-header">
                          <mat-icon>person</mat-icon>
                          <span><strong>{{ selectedFiador()?.nombre }} {{ selectedFiador()?.apellido }}</strong></span>
                          <button mat-icon-button type="button" (click)="clearFiador()" matTooltip="Cambiar fiador">
                            <mat-icon>close</mat-icon>
                          </button>
                        </div>
                        <p><strong>DUI:</strong> {{ selectedFiador()?.numeroDui }}</p>
                        @if (selectedFiador()?.telefono) {
                          <p><strong>Teléfono:</strong> {{ selectedFiador()?.telefono }}</p>
                        }
                      </div>

                      <mat-form-field appearance="outline" class="form-field-full">
                        <mat-label>Parentesco con el solicitante</mat-label>
                        <input matInput formControlName="parentesco" placeholder="Ej: Padre, Hermano, Cónyuge, Amigo" />
                        <mat-hint>Relación del fiador con el solicitante del crédito</mat-hint>
                      </mat-form-field>

                      <div class="readonly-section">
                        <p class="section-label"><mat-icon>work</mat-icon> Información laboral del fiador (datos del cliente)</p>

                        <div class="form-row">
                          <mat-form-field appearance="outline" class="form-field readonly-field">
                            <mat-label>Ocupación</mat-label>
                            <input matInput formControlName="ocupacion" readonly />
                          </mat-form-field>

                          <mat-form-field appearance="outline" class="form-field readonly-field">
                            <mat-label>Ingreso Mensual ($)</mat-label>
                            <input matInput type="number" formControlName="ingresoMensual" readonly />
                          </mat-form-field>
                        </div>

                        <div class="form-row">
                          <mat-form-field appearance="outline" class="form-field readonly-field">
                            <mat-label>Lugar de Trabajo</mat-label>
                            <input matInput formControlName="lugarTrabajo" readonly />
                          </mat-form-field>

                          <mat-form-field appearance="outline" class="form-field readonly-field">
                            <mat-label>Teléfono Laboral</mat-label>
                            <input matInput formControlName="telefonoLaboral" readonly />
                          </mat-form-field>
                        </div>

                        <mat-form-field appearance="outline" class="form-field-full readonly-field">
                          <mat-label>Dirección Laboral</mat-label>
                          <textarea matInput formControlName="direccionLaboral" rows="2" readonly></textarea>
                        </mat-form-field>
                      </div>
                    } @else {
                      <div class="select-fiador-hint">
                        <mat-icon>info</mat-icon>
                        <span>Busque y seleccione un fiador para ver su información laboral</span>
                      </div>
                    }
                  </div>
                }

                @if (getTipoCodigo() === 'DOCUMENTARIA') {
                  <div class="tipo-form" formGroupName="documentaria">
                    <h4>Datos del Documento</h4>
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Tipo de Documento</mat-label>
                        <mat-select formControlName="tipoDocumentoId">
                          @for (tipo of tiposDocumento(); track tipo.id) {
                            <mat-option [value]="tipo.id">{{ tipo.nombre }}</mat-option>
                          }
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Número de Documento</mat-label>
                        <input matInput formControlName="numeroDocumento" />
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Fecha de Emisión</mat-label>
                        <input matInput type="date" formControlName="fechaEmision" />
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Monto del Documento ($)</mat-label>
                        <input matInput type="number" formControlName="montoDocumento" step="0.01" />
                      </mat-form-field>
                    </div>
                  </div>
                }

                @if (getTipoCodigo() === 'SGR') {
                  <div class="tipo-form">
                    <h4>Certificación SGR</h4>
                    <mat-form-field appearance="outline" class="form-field-full">
                      <mat-label>Número de Certificación SGR</mat-label>
                      <input matInput formControlName="certificacionSGR" />
                    </mat-form-field>
                  </div>
                }

                <mat-form-field appearance="outline" class="form-field-full">
                  <mat-label>Observaciones</mat-label>
                  <textarea matInput formControlName="observaciones" rows="2"></textarea>
                </mat-form-field>
              </form>
            </mat-card-content>
            <mat-card-actions align="end">
              <button mat-button (click)="closeForm()">Cancelar</button>
              <button
                mat-raised-button
                color="primary"
                [disabled]="garantiaForm.invalid || isSavingGarantia()"
                (click)="saveGarantia()"
              >
                {{ isSavingGarantia() ? 'Guardando...' : (editingGarantia() ? 'Actualizar' : 'Agregar') }}
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .garantia-step { padding: 8px 0; }
    .cobertura-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 16px;
      border-radius: 12px;
      color: white;
      margin-bottom: 16px;
    }
    .cobertura-info { display: flex; justify-content: space-around; flex-wrap: wrap; gap: 16px; }
    .cobertura-item { text-align: center; min-width: 100px; }
    .cobertura-item .label { display: block; font-size: 12px; opacity: 0.9; }
    .cobertura-item .value { font-size: 20px; font-weight: 600; }
    .cobertura-item .value.good { color: #4caf50; }
    .cobertura-item .value.warning { color: #ff9800; }
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .list-header h3 { margin: 0; }
    .loading { display: flex; justify-content: center; padding: 32px; }
    .empty-state { text-align: center; padding: 48px; color: #666; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .garantias-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .garantia-card { border-left: 4px solid #667eea; }
    .garantia-card mat-card-header { padding: 16px; display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
    .garantia-card mat-card-content { padding: 0 16px; }
    .garantia-card mat-card-content p { margin: 4px 0; font-size: 14px; word-break: break-word; }
    .garantia-card mat-card-actions { padding: 8px 16px; display: flex; flex-wrap: wrap; gap: 4px; }
    .spacer { flex: 1; }
    .form-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
      overflow-y: auto;
    }
    .form-dialog {
      width: 100%;
      max-width: 800px;
      margin: 16px auto;
    }
    .form-dialog mat-card-header { display: flex; align-items: center; }
    .garantia-form { padding: 16px 0; }

    /* Responsive form fields */
    .form-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }
    .form-field {
      flex: 1 1 200px;
      min-width: 0;
    }
    .form-field-full {
      width: 100%;
      margin-bottom: 8px;
    }
    .form-field-third {
      flex: 1 1 150px;
      min-width: 0;
    }

    .tipo-form {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
    }
    .tipo-form h4 { margin: 0 0 16px; color: #667eea; }
    .fiador-info {
      background: #e8f5e9;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      border-left: 4px solid #4caf50;
    }
    .fiador-info p { margin: 4px 0; }
    .fiador-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .fiador-header mat-icon { color: #4caf50; }
    .fiador-header span { flex: 1; }

    .readonly-section {
      background: #fafafa;
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;
      border: 1px dashed #ccc;
    }
    .section-label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 13px;
      margin: 0 0 16px 0;
    }
    .section-label mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .readonly-field input, .readonly-field textarea {
      color: #666 !important;
      background: #f5f5f5 !important;
    }

    .select-fiador-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: #fff3e0;
      border-radius: 8px;
      color: #e65100;
      font-size: 14px;
    }
    .select-fiador-hint mat-icon { color: #f57c00; }

    /* Responsive adjustments */
    @media (max-width: 600px) {
      .cobertura-item .value { font-size: 16px; }
      .cobertura-item .label { font-size: 10px; }
      .form-overlay { padding: 8px; }
      .form-dialog { margin: 8px auto; }
      .form-row { gap: 8px; }
      .form-field, .form-field-third { flex: 1 1 100%; }
      .garantias-cards { grid-template-columns: 1fr; }
      .list-header { flex-direction: column; align-items: flex-start; }
      .list-header button { width: 100%; }
    }
  `],
})
export class GarantiaStepComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private garantiaService = inject(GarantiaService);
  private personaService = inject(PersonaService);
  private ubicacionService = inject(UbicacionService);
  private snackBar = inject(MatSnackBar);

  @Input() solicitudId!: number;
  @Output() garantiasChanged = new EventEmitter<Garantia[]>();

  isLoading = signal(true);
  isSavingGarantia = signal(false);
  showForm = signal(false);
  editingGarantia = signal<Garantia | null>(null);

  garantias = signal<Garantia[]>([]);
  cobertura = signal<CoberturaGarantia | null>(null);
  fiadoresFiltrados = signal<Persona[]>([]);
  selectedFiador = signal<Persona | null>(null);

  // Catálogos
  tiposGarantia = signal<TipoGarantiaCatalogo[]>([]);
  tiposInmueble = signal<TipoInmuebleCatalogo[]>([]);
  tiposDocumento = signal<TipoDocumentoCatalogo[]>([]);
  departamentos = signal<Departamento[]>([]);
  municipios = signal<Municipio[]>([]);
  distritos = signal<Distrito[]>([]);

  garantiaForm: FormGroup;
  fiadorSearchControl = new FormControl('');

  constructor() {
    this.garantiaForm = this.fb.group({
      tipoGarantiaId: [null, Validators.required],
      valorEstimado: [0, [Validators.required, Validators.min(0)]],
      descripcion: [''],
      observaciones: [''],
      certificacionSGR: [''],
      hipotecaria: this.fb.group({
        tipoInmuebleId: [null],
        direccion: [''],
        departamentoId: [null],
        municipioId: [null],
        distritoId: [null],
        numeroRegistro: [''],
        folioRegistro: [''],
        libroRegistro: [''],
        areaTerreno: [null],
        areaConstruccion: [null],
        valorPericial: [null],
        nombrePerito: [''],
        fechaAvaluo: [''],
      }),
      prendaria: this.fb.group({
        tipoBien: [''],
        descripcionBien: [''],
        marca: [''],
        modelo: [''],
        serie: [''],
        placa: [''],
        anio: [null],
        valorPericial: [null],
        ubicacionBien: [''],
      }),
      fiador: this.fb.group({
        personaFiadorId: [null],
        parentesco: [''],
        ocupacion: [''],
        ingresoMensual: [null],
        direccionLaboral: [''],
        telefonoLaboral: [''],
        lugarTrabajo: [''],
      }),
      documentaria: this.fb.group({
        tipoDocumentoId: [null],
        numeroDocumento: [''],
        fechaEmision: [''],
        montoDocumento: [null],
      }),
    });

    // Setup fiador search
    this.fiadorSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (typeof value === 'string' && value.length >= 2) {
          return this.personaService.search(value, 10);
        }
        return of([]);
      })
    ).subscribe({
      next: (personas) => this.fiadoresFiltrados.set(personas),
      error: () => this.fiadoresFiltrados.set([]),
    });
  }

  ngOnInit(): void {
    this.loadCatalogos();
    if (this.solicitudId) {
      this.loadGarantias();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['solicitudId'] && this.solicitudId) {
      this.loadGarantias();
    }
  }

  loadCatalogos(): void {
    forkJoin({
      tiposGarantia: this.garantiaService.getTiposGarantia(true),
      tiposInmueble: this.garantiaService.getTiposInmueble(true),
      tiposDocumento: this.garantiaService.getTiposDocumento(true),
      departamentos: this.ubicacionService.getDepartamentos(),
    }).subscribe({
      next: (result) => {
        this.tiposGarantia.set(result.tiposGarantia);
        this.tiposInmueble.set(result.tiposInmueble);
        this.tiposDocumento.set(result.tiposDocumento);
        this.departamentos.set(result.departamentos);
      },
      error: () => {
        this.snackBar.open('Error al cargar catálogos', 'Cerrar', { duration: 3000 });
      },
    });
  }

  loadGarantias(): void {
    this.isLoading.set(true);
    this.garantiaService.getBySolicitud(this.solicitudId).subscribe({
      next: (garantias) => {
        this.garantias.set(garantias);
        this.garantiasChanged.emit(garantias);
        this.loadCobertura();
      },
      error: () => {
        this.snackBar.open('Error al cargar garantías', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  loadCobertura(): void {
    this.garantiaService.getCobertura(this.solicitudId).subscribe({
      next: (cobertura) => {
        this.cobertura.set(cobertura);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  getTipoCodigo(): string {
    const tipoId = this.garantiaForm.value.tipoGarantiaId;
    const tipo = this.tiposGarantia().find(t => t.id === tipoId);
    return tipo?.codigo?.toUpperCase() || '';
  }

  openForm(): void {
    const defaultTipoId = this.tiposGarantia().find(t => t.codigo === 'FIDUCIARIA')?.id || this.tiposGarantia()[0]?.id;
    const defaultInmuebleId = this.tiposInmueble()[0]?.id;
    const defaultDocumentoId = this.tiposDocumento()[0]?.id;

    this.garantiaForm.reset({
      tipoGarantiaId: defaultTipoId,
      valorEstimado: 0,
      hipotecaria: { tipoInmuebleId: defaultInmuebleId },
      documentaria: { tipoDocumentoId: defaultDocumentoId },
    });
    this.selectedFiador.set(null);
    this.fiadorSearchControl.setValue('');
    this.municipios.set([]);
    this.distritos.set([]);
    this.editingGarantia.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingGarantia.set(null);
  }

  editGarantia(garantia: Garantia): void {
    this.editingGarantia.set(garantia);

    // Load municipios and distritos if hipotecaria has location
    if (garantia.hipotecaria?.departamentoId) {
      this.ubicacionService.getMunicipios(garantia.hipotecaria.departamentoId).subscribe(
        muns => this.municipios.set(muns)
      );
      if (garantia.hipotecaria.municipioId) {
        this.ubicacionService.getDistritos(garantia.hipotecaria.municipioId).subscribe(
          dists => this.distritos.set(dists)
        );
      }
    }

    this.garantiaForm.patchValue({
      tipoGarantiaId: garantia.tipoGarantiaId,
      valorEstimado: garantia.valorEstimado,
      descripcion: garantia.descripcion,
      observaciones: garantia.observaciones,
      hipotecaria: garantia.hipotecaria ? {
        tipoInmuebleId: garantia.hipotecaria.tipoInmuebleId,
        direccion: garantia.hipotecaria.direccion,
        departamentoId: garantia.hipotecaria.departamentoId,
        municipioId: garantia.hipotecaria.municipioId,
        distritoId: garantia.hipotecaria.distritoId,
        numeroRegistro: garantia.hipotecaria.numeroRegistro,
        folioRegistro: garantia.hipotecaria.folioRegistro,
        libroRegistro: garantia.hipotecaria.libroRegistro,
        areaTerreno: garantia.hipotecaria.areaTerreno,
        areaConstruccion: garantia.hipotecaria.areaConstruccion,
        valorPericial: garantia.hipotecaria.valorPericial,
        nombrePerito: garantia.hipotecaria.nombrePerito,
        fechaAvaluo: garantia.hipotecaria.fechaAvaluo,
      } : {},
      prendaria: garantia.prendaria || {},
      fiador: garantia.fiador ? {
        personaFiadorId: garantia.fiador.personaFiadorId,
        parentesco: garantia.fiador.parentesco,
        ocupacion: garantia.fiador.ocupacion,
        ingresoMensual: garantia.fiador.ingresoMensual,
        direccionLaboral: garantia.fiador.direccionLaboral,
        telefonoLaboral: garantia.fiador.telefonoLaboral,
        lugarTrabajo: garantia.fiador.lugarTrabajo,
      } : {},
      documentaria: garantia.documentaria ? {
        tipoDocumentoId: garantia.documentaria.tipoDocumentoId,
        numeroDocumento: garantia.documentaria.numeroDocumento,
        fechaEmision: garantia.documentaria.fechaEmision,
        montoDocumento: garantia.documentaria.montoDocumento,
      } : {},
    });

    if (garantia.fiador?.personaFiador) {
      this.selectedFiador.set(garantia.fiador.personaFiador);
      this.fiadorSearchControl.setValue(garantia.fiador.personaFiador);
    }

    this.showForm.set(true);
  }

  deleteGarantia(garantia: Garantia): void {
    if (!confirm('¿Está seguro de eliminar esta garantía?')) return;

    this.garantiaService.delete(garantia.id!).subscribe({
      next: () => {
        this.snackBar.open('Garantía eliminada', 'Cerrar', { duration: 3000 });
        this.loadGarantias();
      },
      error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 }),
    });
  }

  saveGarantia(): void {
    if (this.garantiaForm.invalid) return;

    this.isSavingGarantia.set(true);
    const formValue = this.garantiaForm.value;
    const tipoCodigo = this.getTipoCodigo();

    const data: CreateGarantiaRequest = {
      solicitudId: this.solicitudId,
      tipoGarantiaId: Number(formValue.tipoGarantiaId),
      valorEstimado: Number(formValue.valorEstimado),
      descripcion: formValue.descripcion,
      observaciones: formValue.observaciones,
    };

    // Add type-specific data
    switch (tipoCodigo) {
      case 'HIPOTECARIA':
        data.hipotecaria = this.cleanObject({
          ...formValue.hipotecaria,
          tipoInmuebleId: Number(formValue.hipotecaria.tipoInmuebleId),
          departamentoId: formValue.hipotecaria.departamentoId ? Number(formValue.hipotecaria.departamentoId) : null,
          municipioId: formValue.hipotecaria.municipioId ? Number(formValue.hipotecaria.municipioId) : null,
          distritoId: formValue.hipotecaria.distritoId ? Number(formValue.hipotecaria.distritoId) : null,
        });
        break;
      case 'PRENDARIA':
        data.prendaria = this.cleanObject(formValue.prendaria);
        break;
      case 'FIDUCIARIA':
        if (!this.selectedFiador()) {
          this.snackBar.open('Seleccione un fiador', 'Cerrar', { duration: 3000 });
          this.isSavingGarantia.set(false);
          return;
        }
        data.fiador = {
          ...this.cleanObject(formValue.fiador),
          personaFiadorId: this.selectedFiador()!.id,
        };
        break;
      case 'DOCUMENTARIA':
        data.documentaria = this.cleanObject({
          ...formValue.documentaria,
          tipoDocumentoId: Number(formValue.documentaria.tipoDocumentoId),
        });
        break;
      case 'SGR':
        data.certificacionSGR = formValue.certificacionSGR;
        break;
    }

    const request$ = this.editingGarantia()
      ? this.garantiaService.update(this.editingGarantia()!.id!, data)
      : this.garantiaService.create(data);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          `Garantía ${this.editingGarantia() ? 'actualizada' : 'agregada'}`,
          'Cerrar',
          { duration: 3000 }
        );
        this.closeForm();
        this.loadGarantias();
        this.isSavingGarantia.set(false);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al guardar', 'Cerrar', { duration: 3000 });
        this.isSavingGarantia.set(false);
      },
    });
  }

  onTipoChange(): void {
    // Reset type-specific forms when type changes
  }

  onDepartamentoChange(departamentoId: number): void {
    this.municipios.set([]);
    this.distritos.set([]);
    this.garantiaForm.get('hipotecaria.municipioId')?.setValue(null);
    this.garantiaForm.get('hipotecaria.distritoId')?.setValue(null);

    if (departamentoId) {
      this.ubicacionService.getMunicipios(departamentoId).subscribe({
        next: (muns) => this.municipios.set(muns),
        error: () => this.snackBar.open('Error al cargar municipios', 'Cerrar', { duration: 3000 }),
      });
    }
  }

  onMunicipioChange(municipioId: number): void {
    this.distritos.set([]);
    this.garantiaForm.get('hipotecaria.distritoId')?.setValue(null);

    if (municipioId) {
      this.ubicacionService.getDistritos(municipioId).subscribe({
        next: (dists) => this.distritos.set(dists),
        error: () => this.snackBar.open('Error al cargar distritos', 'Cerrar', { duration: 3000 }),
      });
    }
  }

  onFiadorSelected(event: { option: { value: Persona } }): void {
    const fiador = event.option.value;
    this.garantiaForm.get('fiador.personaFiadorId')?.setValue(fiador.id);

    // Cargar datos completos del fiador incluyendo actividad económica
    this.personaService.getById(fiador.id!).subscribe({
      next: (personaCompleta) => {
        this.selectedFiador.set(personaCompleta);

        // Auto-completar campos desde los datos de la persona
        const actividadEconomica = personaCompleta.actividadEconomica;

        this.garantiaForm.get('fiador')?.patchValue({
          ocupacion: actividadEconomica?.cargoOcupacion || '',
          ingresoMensual: actividadEconomica?.ingresosMensuales || null,
          lugarTrabajo: actividadEconomica?.nombreEmpresa || '',
          direccionLaboral: actividadEconomica?.detalleDireccion || '',
          telefonoLaboral: personaCompleta.telefono || '',
        });
      },
      error: () => {
        // Si falla la carga completa, usar los datos básicos
        this.selectedFiador.set(fiador);
      },
    });
  }

  displayFiador(persona: Persona): string {
    return persona ? `${persona.numeroDui} - ${persona.nombre} ${persona.apellido}` : '';
  }

  clearFiador(): void {
    this.selectedFiador.set(null);
    this.fiadorSearchControl.setValue('');
    this.garantiaForm.get('fiador')?.patchValue({
      personaFiadorId: null,
      parentesco: '',
      ocupacion: '',
      ingresoMensual: null,
      lugarTrabajo: '',
      direccionLaboral: '',
      telefonoLaboral: '',
    });
  }

  getEstadoLabel(estado: EstadoGarantia): string {
    return ESTADO_GARANTIA_LABELS[estado] || estado;
  }

  private cleanObject(obj: any): any {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
        cleaned[key] = obj[key];
      }
    }
    return cleaned;
  }
}
