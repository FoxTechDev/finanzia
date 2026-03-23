import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, switchMap, of } from 'rxjs';
import { formatLocalDate } from '@core/utils/date.utils';
import { PersonaService } from '../../../clientes/services/persona.service';
import { CuentaAhorroService } from '../../services/cuenta-ahorro.service';
import { TransaccionAhorroService } from '../../services/transaccion-ahorro.service';
import { CatalogosAhorroService } from '../../services/catalogos-ahorro.service';
import { AuthService } from '@core/services/auth.service';
import { Persona } from '@core/models/cliente.model';
import { CuentaAhorroResumen, TransaccionAhorro, TipoTransaccionAhorro } from '@core/models/ahorro.model';

@Component({
  selector: 'app-movimiento-cuenta',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatIconModule,
    MatSnackBarModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-container" [class.print-mode]="mostrarComprobante()">

      <!-- ===== FORMULARIO ===== -->
      @if (!mostrarComprobante()) {
        <div class="form-header">
          <h2>
            <mat-icon>swap_horiz</mat-icon>
            Movimientos de Cuentas de Ahorro
          </h2>
        </div>

        <mat-card>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="registrar()">

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

              <!-- Selección de cuenta -->
              @if (cuentas().length > 0) {
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Cuenta de Ahorro</mat-label>
                  <mat-select formControlName="cuentaId" (selectionChange)="onCuentaSelected($event.value)">
                    @for (cuenta of cuentas(); track cuenta.id) {
                      <mat-option [value]="cuenta.id">
                        {{ cuenta.noCuenta }} - {{ cuenta.tipoAhorro }} (Saldo: {{ cuenta.saldoDisponible | currency:'USD':'symbol':'1.2-2' }})
                      </mat-option>
                    }
                  </mat-select>
                  @if (form.get('cuentaId')?.hasError('required')) {
                    <mat-error>Seleccione una cuenta</mat-error>
                  }
                </mat-form-field>
              }

              @if (clienteSeleccionado() && cuentas().length === 0 && !cargandoCuentas()) {
                <div class="aviso-sin-cuentas">
                  <mat-icon>info</mat-icon>
                  Este cliente no tiene cuentas de ahorro activas.
                </div>
              }

              <!-- Tipo de operación -->
              @if (cuentaSeleccionada()) {
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Tipo de Operación</mat-label>
                  <mat-select formControlName="tipoTransaccionId" (selectionChange)="onTipoTransaccionSelected($event.value)">
                    @for (tipo of tiposTransaccion(); track tipo.id) {
                      <mat-option [value]="tipo.id">
                        {{ tipo.nombre }}
                      </mat-option>
                    }
                  </mat-select>
                  @if (form.get('tipoTransaccionId')?.hasError('required')) {
                    <mat-error>Seleccione un tipo de operación</mat-error>
                  }
                </mat-form-field>
                @if (tiposTransaccion().length === 0 && !cargandoTipos()) {
                  <div class="aviso-sin-cuentas">
                    <mat-icon>info</mat-icon>
                    No hay tipos de transacción configurados para este tipo de ahorro.
                  </div>
                }

                <div class="row">
                  <mat-form-field appearance="outline">
                    <mat-label>Monto ($)</mat-label>
                    <input matInput type="number" formControlName="monto" step="0.01" min="0.01" />
                    @if (form.get('monto')?.hasError('required')) {
                      <mat-error>El monto es requerido</mat-error>
                    }
                    @if (form.get('monto')?.hasError('min')) {
                      <mat-error>Monto mínimo: $0.01</mat-error>
                    }
                    @if (form.get('monto')?.hasError('max')) {
                      <mat-error>Monto excede saldo disponible ({{ cuentaSeleccionada()!.saldoDisponible | currency:'USD':'symbol':'1.2-2' }})</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Fecha</mat-label>
                    <input matInput type="date" formControlName="fecha" />
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Observación</mat-label>
                  <textarea matInput formControlName="observacion" rows="2" maxlength="200"></textarea>
                </mat-form-field>

                @if (cuentaSeleccionada()) {
                  <div class="saldo-info">
                    <span>Saldo disponible: <strong>{{ cuentaSeleccionada()!.saldoDisponible | currency:'USD':'symbol':'1.2-2' }}</strong></span>
                  </div>
                }

                <div class="actions">
                  <button mat-raised-button color="primary" type="submit"
                    [disabled]="form.invalid || isLoading()">
                    @if (isLoading()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      <mat-icon>save</mat-icon>
                      Registrar Movimiento
                    }
                  </button>
                </div>
              }

            </form>
          </mat-card-content>
        </mat-card>
      }

      <!-- ===== COMPROBANTE ===== -->
      @if (mostrarComprobante() && transaccionResultado()) {
        <div class="comprobante">
          <div class="comprobante-header">
            <h3>FINANZIA S.C. DE R.L. DE C.V.</h3>
            <h4>Comprobante de {{ tipoTransaccionSeleccionada()?.nombre || 'Movimiento' }}</h4>
          </div>

          <mat-divider></mat-divider>

          <div class="comprobante-body">
            <div class="comprobante-row">
              <span class="label">Tipo Operación:</span>
              <span class="value tipo-op" [class.deposito]="esAbono()" [class.retiro]="!esAbono()">
                {{ tipoTransaccionSeleccionada()?.nombre?.toUpperCase() || '' }}
              </span>
            </div>
            <div class="comprobante-row">
              <span class="label">No. Cuenta:</span>
              <span class="value">{{ cuentaSeleccionada()!.noCuenta }}</span>
            </div>
            <div class="comprobante-row">
              <span class="label">Cliente:</span>
              <span class="value">{{ clienteSeleccionado()!.nombre }} {{ clienteSeleccionado()!.apellido }}</span>
            </div>
            <div class="comprobante-row">
              <span class="label">DUI:</span>
              <span class="value">{{ clienteSeleccionado()!.numeroDui }}</span>
            </div>

            <mat-divider></mat-divider>

            <div class="comprobante-row">
              <span class="label">Fecha:</span>
              <span class="value">{{ transaccionResultado()!.fecha | date:'dd/MM/yyyy' }}</span>
            </div>
            <div class="comprobante-row monto-row">
              <span class="label">Monto:</span>
              <span class="value monto">{{ transaccionResultado()!.monto | currency:'USD':'symbol':'1.2-2' }}</span>
            </div>
            <div class="comprobante-row">
              <span class="label">Saldo Anterior:</span>
              <span class="value">{{ transaccionResultado()!.saldoAnterior | currency:'USD':'symbol':'1.2-2' }}</span>
            </div>
            <div class="comprobante-row">
              <span class="label">Nuevo Saldo:</span>
              <span class="value"><strong>{{ transaccionResultado()!.nuevoSaldo | currency:'USD':'symbol':'1.2-2' }}</strong></span>
            </div>

            @if (transaccionResultado()!.observacion) {
              <div class="comprobante-row">
                <span class="label">Observación:</span>
                <span class="value">{{ transaccionResultado()!.observacion }}</span>
              </div>
            }

            <mat-divider></mat-divider>

            <div class="comprobante-row">
              <span class="label">Usuario:</span>
              <span class="value">{{ transaccionResultado()!.nombreUsuario || nombreUsuario() }}</span>
            </div>
          </div>

          <div class="comprobante-actions no-print">
            <button mat-raised-button color="primary" (click)="imprimir()">
              <mat-icon>print</mat-icon> Imprimir
            </button>
            <button mat-stroked-button (click)="nuevoMovimiento()">
              <mat-icon>add</mat-icon> Nuevo Movimiento
            </button>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .page-container { max-width: 600px; margin: 0 auto; padding: 16px; }
    .form-header { margin-bottom: 16px; }
    .form-header h2 { display: flex; align-items: center; gap: 8px; margin: 0; color: #333; }
    .full-width { width: 100%; }
    .row { display: flex; gap: 12px; }
    .row mat-form-field { flex: 1; }
    .cliente-info {
      background: #e3f2fd; padding: 12px; border-radius: 8px; margin-bottom: 16px;
      display: flex; flex-direction: column; gap: 4px;
    }
    .cliente-info span { color: #555; font-size: 13px; }
    .aviso-sin-cuentas {
      display: flex; align-items: center; gap: 8px;
      background: #fff3e0; padding: 12px; border-radius: 8px; margin-bottom: 16px;
      color: #e65100; font-size: 14px;
    }
    .saldo-info {
      background: #f5f5f5; padding: 8px 12px; border-radius: 6px; margin-bottom: 16px;
      font-size: 14px; color: #555;
    }
    .actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 8px; }
    .actions button { display: flex; align-items: center; gap: 6px; }

    /* Comprobante */
    .comprobante {
      background: #fff; border: 1px solid #ddd; border-radius: 8px;
      padding: 24px; max-width: 400px; margin: 0 auto;
    }
    .comprobante-header { text-align: center; margin-bottom: 16px; }
    .comprobante-header h3 { margin: 0 0 4px; font-size: 16px; }
    .comprobante-header h4 { margin: 0; font-size: 14px; color: #555; }
    .comprobante-body { padding: 16px 0; }
    .comprobante-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
    .comprobante-row .label { color: #666; }
    .comprobante-row .value { font-weight: 500; }
    .comprobante-row .monto { font-size: 18px; font-weight: 700; }
    .monto-row { padding: 8px 0; }
    .tipo-op.deposito { color: #2e7d32; }
    .tipo-op.retiro { color: #c62828; }
    mat-divider { margin: 8px 0; }
    .comprobante-actions { display: flex; justify-content: center; gap: 12px; margin-top: 20px; }

    @media (max-width: 600px) {
      .row { flex-direction: column; gap: 0; }
      .page-container { padding: 8px; }
    }

    /* Impresión */
    @media print {
      .no-print { display: none !important; }
      .page-container { padding: 0; max-width: none; }
      .comprobante { border: none; box-shadow: none; padding: 0; max-width: none; }
    }
  `],
})
export class MovimientoCuentaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private personaService = inject(PersonaService);
  private cuentaService = inject(CuentaAhorroService);
  private transaccionService = inject(TransaccionAhorroService);
  private catalogosService = inject(CatalogosAhorroService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  searchControl = new FormControl('');
  form: FormGroup;

  personas = signal<Persona[]>([]);
  clienteSeleccionado = signal<Persona | null>(null);
  cuentas = signal<CuentaAhorroResumen[]>([]);
  cuentaSeleccionada = signal<CuentaAhorroResumen | null>(null);
  cargandoCuentas = signal(false);
  cargandoTipos = signal(false);
  isLoading = signal(false);
  mostrarComprobante = signal(false);
  transaccionResultado = signal<TransaccionAhorro | null>(null);
  nombreUsuario = signal('');
  tiposTransaccion = signal<TipoTransaccionAhorro[]>([]);
  tipoTransaccionSeleccionada = signal<TipoTransaccionAhorro | null>(null);

  constructor() {
    const hoy = formatLocalDate(new Date());
    this.form = this.fb.group({
      cuentaId: [null, Validators.required],
      tipoTransaccionId: [null, Validators.required],
      monto: [null, [Validators.required, Validators.min(0.01)]],
      fecha: [hoy, Validators.required],
      observacion: [''],
    });

    this.form.get('monto')!.valueChanges.subscribe(() => {
      if (!this.esAbono()) {
        this.actualizarValidacionMonto();
      }
    });
  }

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.nombreUsuario.set(user.firstName + ' ' + user.lastName);
    }

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
    this.cuentaSeleccionada.set(null);
    this.form.patchValue({ cuentaId: null });
    this.cargarCuentas(persona);
  }

  displayCliente(persona: Persona): string {
    return persona ? persona.nombre + ' ' + persona.apellido : '';
  }

  private cargarCuentas(persona: Persona): void {
    this.cargandoCuentas.set(true);
    this.cuentaService.getAll({ buscar: persona.numeroDui, limit: '100' }).subscribe({
      next: (res) => {
        const activas = res.data.filter((c) => c.estado === 'Activa');
        this.cuentas.set(activas);
        this.cargandoCuentas.set(false);
      },
      error: () => {
        this.cuentas.set([]);
        this.cargandoCuentas.set(false);
      },
    });
  }

  onCuentaSelected(cuentaId: number): void {
    const cuenta = this.cuentas().find((c) => c.id === cuentaId) || null;
    this.cuentaSeleccionada.set(cuenta);
    this.tipoTransaccionSeleccionada.set(null);
    this.form.patchValue({ tipoTransaccionId: null });

    if (cuenta) {
      this.cargarTiposTransaccion(cuenta.tipoAhorroId);
    } else {
      this.tiposTransaccion.set([]);
    }
    this.actualizarValidacionMonto();
  }

  private cargarTiposTransaccion(tipoAhorroId: number): void {
    this.cargandoTipos.set(true);
    this.catalogosService.getTransaccionesByTipoAhorro(tipoAhorroId).subscribe({
      next: (tipos) => {
        this.tiposTransaccion.set(tipos);
        this.cargandoTipos.set(false);
      },
      error: () => {
        this.tiposTransaccion.set([]);
        this.cargandoTipos.set(false);
      },
    });
  }

  onTipoTransaccionSelected(tipoTransaccionId: number): void {
    const tipo = this.tiposTransaccion().find((t) => t.id === tipoTransaccionId) || null;
    this.tipoTransaccionSeleccionada.set(tipo);
    this.actualizarValidacionMonto();
  }

  esAbono(): boolean {
    const tipo = this.tipoTransaccionSeleccionada();
    return tipo?.naturaleza?.codigo === 'ABONO';
  }

  private actualizarValidacionMonto(): void {
    const montoCtrl = this.form.get('monto')!;
    const cuenta = this.cuentaSeleccionada();

    if (!this.esAbono() && cuenta) {
      montoCtrl.setValidators([Validators.required, Validators.min(0.01), Validators.max(cuenta.saldoDisponible)]);
    } else {
      montoCtrl.setValidators([Validators.required, Validators.min(0.01)]);
    }
    montoCtrl.updateValueAndValidity({ emitEvent: false });
  }

  registrar(): void {
    if (this.form.invalid) return;

    const { cuentaId, tipoTransaccionId, monto, fecha, observacion } = this.form.value;
    const payload = { monto, fecha, observacion, tipoTransaccionId };

    this.isLoading.set(true);

    const request$ = this.esAbono()
      ? this.transaccionService.depositar(cuentaId, payload)
      : this.transaccionService.retirar(cuentaId, payload);

    request$.subscribe({
      next: (txn) => {
        this.transaccionResultado.set(txn);
        this.mostrarComprobante.set(true);
        this.isLoading.set(false);
        const tipoNombre = this.tipoTransaccionSeleccionada()?.nombre || 'Movimiento';
        this.snackBar.open(`${tipoNombre} registrado exitosamente`, 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.snackBar.open(err.error?.message || 'Error al registrar movimiento', 'Cerrar', { duration: 4000 });
      },
    });
  }

  imprimir(): void {
    window.print();
  }

  nuevoMovimiento(): void {
    this.mostrarComprobante.set(false);
    this.transaccionResultado.set(null);
    this.clienteSeleccionado.set(null);
    this.cuentaSeleccionada.set(null);
    this.tipoTransaccionSeleccionada.set(null);
    this.tiposTransaccion.set([]);
    this.cuentas.set([]);
    this.searchControl.reset('');
    const hoy = formatLocalDate(new Date());
    this.form.reset({ tipoTransaccionId: null, fecha: hoy });
  }
}
