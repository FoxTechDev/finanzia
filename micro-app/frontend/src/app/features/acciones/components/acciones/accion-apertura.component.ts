import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { debounceTime, switchMap, of } from 'rxjs';
import { formatLocalDate } from '@core/utils/date.utils';
import { TipoAccionService } from '../../services/tipo-accion.service';
import { AccionService } from '../../services/accion.service';
import { CuentaAhorroService } from '../../../ahorros/services/cuenta-ahorro.service';
import { BancoService } from '../../../ahorros/services/banco.service';
import { PersonaService } from '../../../clientes/services/persona.service';
import { TipoAccion } from '@core/models/accion.model';
import { CuentaAVResumen, Banco } from '@core/models/ahorro.model';
import { Persona } from '@core/models/cliente.model';

@Component({
  selector: 'app-accion-apertura',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>Apertura de Acción</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <!-- Búsqueda de cliente -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Buscar Cliente</mat-label>
          <input matInput
            [formControl]="searchControl"
            [matAutocomplete]="auto"
            placeholder="Nombre o DUI del cliente" />
          <mat-icon matSuffix>search</mat-icon>
          <mat-autocomplete #auto="matAutocomplete"
            (optionSelected)="onClienteSelected($event.option.value)"
            [displayWith]="displayCliente">
            @for (persona of personas(); track persona.id) {
              <mat-option [value]="persona">
                {{ persona.nombre }} {{ persona.apellido }} - {{ persona.numeroDui }}
              </mat-option>
            }
          </mat-autocomplete>
        </mat-form-field>

        @if (clienteSeleccionado()) {
          <div class="cliente-info">
            <strong>{{ clienteSeleccionado()!.nombre }} {{ clienteSeleccionado()!.apellido }}</strong>
            <span>DUI: {{ clienteSeleccionado()!.numeroDui }}</span>
          </div>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tipo de Acción</mat-label>
          <mat-select formControlName="tipoAccionId" (selectionChange)="onTipoChange($event.value)">
            @for (tipo of tiposAccion(); track tipo.id) {
              <mat-option [value]="tipo.id">
                {{ tipo.nombre }} (\${{ tipo.valorUnitario }}/acción, {{ tipo.tasaInteres }}%)
              </mat-option>
            }
          </mat-select>
          @if (form.get('tipoAccionId')?.hasError('required')) {
            <mat-error>El tipo de acción es requerido</mat-error>
          }
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Monto a Invertir ($)</mat-label>
            <input matInput type="number" formControlName="monto" step="0.01" />
            @if (form.get('monto')?.hasError('required')) {
              <mat-error>El monto es requerido</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fecha de Apertura</mat-label>
            <input matInput formControlName="fechaApertura" type="date" />
          </mat-form-field>
        </div>

        @if (tipoSeleccionado() && cantidadAcciones() !== null) {
          <div class="preview">
            <mat-icon>show_chart</mat-icon>
            <span>Cantidad de acciones: <strong>{{ cantidadAcciones() }}</strong></span>
          </div>
        }

        <!-- Destino del pago de intereses: cuenta AV o transferencia bancaria -->
        <p class="section-label">Pago de intereses (elegir una opción)</p>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cuenta AV para pago de intereses</mat-label>
          <mat-select formControlName="cuentaAhorroDestinoId" [disabled]="transferirBanco()">
            <mat-option [value]="null">-- Ninguna --</mat-option>
            @for (cuenta of cuentasAV(); track cuenta.id) {
              <mat-option [value]="cuenta.id">{{ cuenta.noCuenta }} - {{ cuenta.nombreCliente }}</mat-option>
            }
          </mat-select>
          @if (clienteSeleccionado() && cuentasAV().length === 0) {
            <mat-hint>El cliente no tiene cuentas de ahorro a la vista activas</mat-hint>
          }
        </mat-form-field>

        <div class="full-width checkbox-row">
          <mat-checkbox [checked]="transferirBanco()" (change)="onTransferirBancoChange($event.checked)">
            Transferir intereses a cuenta bancaria
          </mat-checkbox>
        </div>

        @if (transferirBanco()) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Banco</mat-label>
            <mat-select formControlName="bancoId">
              @for (banco of bancos(); track banco.id) {
                <mat-option [value]="banco.id">{{ banco.nombre }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>No. Cuenta Banco</mat-label>
              <input matInput formControlName="cuentaBancoNumero" maxlength="30" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Propietario</mat-label>
              <input matInput formControlName="cuentaBancoPropietario" maxlength="100" />
            </mat-form-field>
          </div>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observación</mat-label>
          <textarea matInput formControlName="observacion" rows="2" maxlength="200"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary"
        [disabled]="form.invalid || !clienteSeleccionado() || isLoading"
        (click)="save()">
        {{ isLoading ? 'Abriendo...' : 'Abrir Acción' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 8px; }
    mat-dialog-content { min-width: 450px; }
    .row { display: flex; gap: 12px; }
    .row mat-form-field { flex: 1; }
    .cliente-info {
      background: #f5f5f5; padding: 12px; border-radius: 8px; margin-bottom: 16px;
      display: flex; flex-direction: column; gap: 4px;
    }
    .cliente-info span { color: #666; font-size: 13px; }
    .preview {
      display: flex; align-items: center; gap: 8px;
      background: #e3f2fd; padding: 10px 12px; border-radius: 8px;
      margin-bottom: 16px; color: #0d47a1;
    }
    .section-label { font-size: 13px; color: #666; margin: 8px 0 4px; }
    .checkbox-row { margin-bottom: 16px; }
  `],
})
export class AccionAperturaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AccionAperturaComponent>);
  private accionService = inject(AccionService);
  private tipoAccionService = inject(TipoAccionService);
  private cuentaAhorroService = inject(CuentaAhorroService);
  private bancoService = inject(BancoService);
  private personaService = inject(PersonaService);
  private snackBar = inject(MatSnackBar);

  tiposAccion = signal<TipoAccion[]>([]);
  personas = signal<Persona[]>([]);
  clienteSeleccionado = signal<Persona | null>(null);
  tipoSeleccionado = signal<TipoAccion | null>(null);
  cuentasAV = signal<CuentaAVResumen[]>([]);
  bancos = signal<Banco[]>([]);
  transferirBanco = signal(false);

  isLoading = false;
  searchControl = this.fb.control('');
  form: FormGroup;

  private montoSignal = signal<number | null>(null);

  cantidadAcciones = computed(() => {
    const tipo = this.tipoSeleccionado();
    const monto = this.montoSignal();
    if (!tipo || !monto || tipo.valorUnitario <= 0) return null;
    return Math.round((monto / tipo.valorUnitario) * 10000) / 10000;
  });

  constructor() {
    const hoy = formatLocalDate(new Date());
    this.form = this.fb.group({
      personaId: [null, Validators.required],
      tipoAccionId: [null, Validators.required],
      monto: [null, [Validators.required, Validators.min(0.01)]],
      fechaApertura: [hoy, Validators.required],
      cuentaAhorroDestinoId: [null],
      bancoId: [null],
      cuentaBancoNumero: [''],
      cuentaBancoPropietario: [''],
      observacion: [''],
    });

    this.form.get('monto')!.valueChanges.subscribe((val) => this.montoSignal.set(val));
  }

  ngOnInit(): void {
    this.tipoAccionService.getAll(true).subscribe((data) => this.tiposAccion.set(data));
    this.bancoService.getAll(true).subscribe((data) => this.bancos.set(data));

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        switchMap((val) => {
          if (typeof val === 'string' && val.length >= 2) {
            return this.personaService.search(val);
          }
          return of([]);
        }),
      )
      .subscribe((data) => this.personas.set(data));
  }

  onClienteSelected(persona: Persona): void {
    this.clienteSeleccionado.set(persona);
    this.form.patchValue({ personaId: persona.id });
    this.cuentaAhorroService.getActivasAV(persona.id).subscribe((data) => this.cuentasAV.set(data));
  }

  displayCliente(persona: Persona): string {
    return persona ? `${persona.nombre} ${persona.apellido}` : '';
  }

  onTipoChange(tipoId: number): void {
    const tipo = this.tiposAccion().find((t) => t.id === tipoId);
    this.tipoSeleccionado.set(tipo || null);
  }

  onTransferirBancoChange(checked: boolean): void {
    this.transferirBanco.set(checked);
    if (checked) {
      this.form.patchValue({ cuentaAhorroDestinoId: null });
    } else {
      this.form.patchValue({
        bancoId: null,
        cuentaBancoNumero: '',
        cuentaBancoPropietario: '',
      });
    }
  }

  save(): void {
    if (this.form.invalid || !this.clienteSeleccionado()) return;

    const { cuentaAhorroDestinoId, bancoId } = this.form.value;
    if (!cuentaAhorroDestinoId && !bancoId) {
      this.snackBar.open(
        'Seleccione la cuenta de ahorro o el banco donde se pagarán los intereses',
        'Cerrar', { duration: 3000 },
      );
      return;
    }

    this.isLoading = true;

    this.accionService.abrir(this.form.value).subscribe({
      next: (accion) => {
        this.snackBar.open(`Acción ${accion.correlativo} abierta exitosamente`, 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al abrir la acción', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      },
    });
  }
}
