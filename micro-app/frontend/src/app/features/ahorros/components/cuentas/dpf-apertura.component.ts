import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { debounceTime, switchMap, of } from 'rxjs';
import { CuentaAhorroService } from '../../services/cuenta-ahorro.service';
import { formatLocalDate } from '@core/utils/date.utils';
import { CatalogosAhorroService } from '../../services/catalogos-ahorro.service';
import { BancoService } from '../../services/banco.service';
import { BeneficiarioService } from '../../services/beneficiario.service';
import { PersonaService } from '../../../clientes/services/persona.service';
import { TipoAhorro, TipoCapitalizacion, Banco, CuentaAVResumen, CreateBeneficiarioRequest } from '@core/models/ahorro.model';
import { Persona } from '@core/models/cliente.model';
import { BeneficiarioDialogComponent } from './beneficiario-dialog.component';

@Component({
  selector: 'app-dpf-apertura',
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
    MatTableModule,
  ],
  template: `
    <h2 mat-dialog-title>Apertura - Dep\u00f3sito a Plazo Fijo</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <!-- B\u00fasqueda de cliente -->
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
          <mat-label>Tipo de Ahorro</mat-label>
          <mat-select formControlName="tipoAhorroId" (selectionChange)="onTipoChange($event.value)">
            @for (tipo of tiposAhorro(); track tipo.id) {
              <mat-option [value]="tipo.id">{{ tipo.nombre }}</mat-option>
            }
          </mat-select>
          @if (form.get('tipoAhorroId')?.hasError('required')) {
            <mat-error>El tipo es requerido</mat-error>
          }
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Monto ($)</mat-label>
            <input matInput type="number" formControlName="monto" step="0.01" />
            @if (form.get('monto')?.hasError('required')) {
              <mat-error>El monto es requerido</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Tasa de Inter\u00e9s (%)</mat-label>
            <input matInput type="number" formControlName="tasaInteres" step="0.01" />
            @if (form.get('tasaInteres')?.hasError('min')) {
              <mat-error>M\u00ednimo {{ tipoSeleccionado()?.tasaMin }}%</mat-error>
            } @else if (form.get('tasaInteres')?.hasError('max')) {
              <mat-error>M\u00e1ximo {{ tipoSeleccionado()?.tasaMax }}%</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Fecha de Apertura</mat-label>
            <input matInput formControlName="fechaApertura" type="date" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Plazo (d\u00edas)</mat-label>
            <input matInput formControlName="plazo" type="number" readonly />
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Fecha de Vencimiento</mat-label>
            <input matInput formControlName="fechaVencimiento" type="date" readonly />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Capitalizaci\u00f3n</mat-label>
            <mat-select formControlName="tipoCapitalizacionId">
              @for (cap of tiposCapitalizacion(); track cap.id) {
                <mat-option [value]="cap.id">{{ cap.nombre }}</mat-option>
              }
            </mat-select>
            @if (form.get('tipoCapitalizacionId')?.hasError('required')) {
              <mat-error>La capitalizaci\u00f3n es requerida</mat-error>
            }
          </mat-form-field>
        </div>

        <!-- Cuenta destino para pago de intereses -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cuenta AV para pago de intereses</mat-label>
          <mat-select formControlName="cuentaAhorroDestinoId">
            <mat-option [value]="null">-- Ninguna --</mat-option>
            @for (cuenta of cuentasAV(); track cuenta.id) {
              <mat-option [value]="cuenta.id">{{ cuenta.noCuenta }} - {{ cuenta.nombreCliente }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <!-- Transferencia a banco externo -->
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
          <mat-label>Observaci\u00f3n</mat-label>
          <textarea matInput formControlName="observacion" rows="2" maxlength="200"></textarea>
        </mat-form-field>

        <!-- Beneficiarios -->
        <div class="beneficiarios-section">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong>Beneficiarios</strong>
            <button mat-stroked-button type="button" color="primary" (click)="openBeneficiarioDialog()" [disabled]="getTotalPorcentaje() >= 100">
              <mat-icon>person_add</mat-icon> Agregar
            </button>
          </div>

          @if (beneficiarios().length > 0) {
            <table mat-table [dataSource]="beneficiarios()" class="full-width" style="margin-bottom: 8px;">
              <ng-container matColumnDef="nombre">
                <th mat-header-cell *matHeaderCellDef>Nombre</th>
                <td mat-cell *matCellDef="let b">{{ b.nombre }} {{ b.apellidos }}</td>
              </ng-container>
              <ng-container matColumnDef="parentesco">
                <th mat-header-cell *matHeaderCellDef>Parentesco</th>
                <td mat-cell *matCellDef="let b">{{ b.parentesco }}</td>
              </ng-container>
              <ng-container matColumnDef="porcentaje">
                <th mat-header-cell *matHeaderCellDef class="text-right">%</th>
                <td mat-cell *matCellDef="let b" class="text-right">{{ b.porcentajeBeneficio }}%</td>
              </ng-container>
              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let b; let i = index">
                  <button mat-icon-button color="warn" type="button" (click)="removeBeneficiario(i)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="benefColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: benefColumns"></tr>
            </table>
            <div style="text-align: right; font-size: 13px; color: #666;">
              Total: {{ getTotalPorcentaje() }}%
              @if (getTotalPorcentaje() !== 100 && beneficiarios().length > 0) {
                <span style="color: #e65100;"> (debe ser 100%)</span>
              }
            </div>
          }
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary"
        [disabled]="form.invalid || !clienteSeleccionado() || isLoading"
        (click)="save()">
        {{ isLoading ? 'Abriendo...' : 'Abrir Cuenta' }}
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
    .checkbox-row { margin-bottom: 16px; }
    .beneficiarios-section { margin-top: 16px; padding-top: 16px; border-top: 1px solid #e0e0e0; }
    .text-right { text-align: right; }
  `],
})
export class DpfAperturaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<DpfAperturaComponent>);
  private dialog = inject(MatDialog);
  private cuentaService = inject(CuentaAhorroService);
  private catalogos = inject(CatalogosAhorroService);
  private personaService = inject(PersonaService);
  private bancoService = inject(BancoService);
  private beneficiarioService = inject(BeneficiarioService);
  private snackBar = inject(MatSnackBar);

  tiposAhorro = signal<TipoAhorro[]>([]);
  tiposCapitalizacion = signal<TipoCapitalizacion[]>([]);
  personas = signal<Persona[]>([]);
  clienteSeleccionado = signal<Persona | null>(null);
  tipoSeleccionado = signal<TipoAhorro | null>(null);
  bancos = signal<Banco[]>([]);
  cuentasAV = signal<CuentaAVResumen[]>([]);
  transferirBanco = signal(false);
  beneficiarios = signal<CreateBeneficiarioRequest[]>([]);

  isLoading = false;
  searchControl = this.fb.control('');
  form: FormGroup;

  benefColumns = ['nombre', 'parentesco', 'porcentaje', 'acciones'];

  constructor() {
    const hoy = formatLocalDate(new Date());
    this.form = this.fb.group({
      personaId: [null, Validators.required],
      tipoAhorroId: [null, Validators.required],
      monto: [null, [Validators.required, Validators.min(0.01)]],
      tasaInteres: [0],
      fechaApertura: [hoy, Validators.required],
      plazo: [{ value: 0, disabled: true }],
      fechaVencimiento: [{ value: null, disabled: true }],
      tipoCapitalizacionId: [null, Validators.required],
      observacion: [''],
      cuentaAhorroDestinoId: [null],
      bancoId: [null],
      cuentaBancoNumero: [''],
      cuentaBancoPropietario: [''],
    });
  }

  ngOnInit(): void {
    this.catalogos.getTiposByLinea('DPF').subscribe((data) => this.tiposAhorro.set(data));
    this.catalogos.getTiposCapitalizacion().subscribe((data) => {
      // Filtrar: solo mensual (dias=30) y al vencimiento (dias=0)
      const filtrados = data.filter((c) => c.dias === 0 || c.dias === 30);
      this.tiposCapitalizacion.set(filtrados);
    });

    // Cargar lista de bancos activos
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

    // Recalcular vencimiento al cambiar fecha apertura
    this.form.get('fechaApertura')!.valueChanges.subscribe(() => {
      this.calcularVencimiento();
    });
  }

  onClienteSelected(persona: Persona): void {
    this.clienteSeleccionado.set(persona);
    this.form.patchValue({ personaId: persona.id });
    // Cargar cuentas AV activas del cliente
    this.cuentaService.getActivasAV(persona.id).subscribe((data) => this.cuentasAV.set(data));
  }

  displayCliente(persona: Persona): string {
    return persona ? `${persona.nombre} ${persona.apellido}` : '';
  }

  onTipoChange(tipoId: number): void {
    const tipo = this.tiposAhorro().find((t) => t.id === tipoId);
    this.tipoSeleccionado.set(tipo || null);
    if (tipo) {
      this.form.patchValue({
        tasaInteres: tipo.tasaVigente,
        plazo: tipo.plazo,
      });

      // Validators dinámicos de tasa según tipo
      const tasaControl = this.form.get('tasaInteres')!;
      const validators = [Validators.required];
      if (tipo.tasaMin > 0) validators.push(Validators.min(tipo.tasaMin));
      if (tipo.tasaMax > 0) validators.push(Validators.max(tipo.tasaMax));
      tasaControl.setValidators(validators);
      tasaControl.updateValueAndValidity();

      this.calcularVencimiento();
    }
  }

  onTransferirBancoChange(checked: boolean): void {
    this.transferirBanco.set(checked);
    if (!checked) {
      this.form.patchValue({
        bancoId: null,
        cuentaBancoNumero: '',
        cuentaBancoPropietario: '',
      });
    }
  }

  private calcularVencimiento(): void {
    const tipo = this.tipoSeleccionado();
    const fechaApertura = this.form.get('fechaApertura')?.value;
    if (tipo && fechaApertura && tipo.plazo > 0) {
      const fecha = new Date(fechaApertura);
      fecha.setDate(fecha.getDate() + tipo.plazo);
      this.form.patchValue({
        fechaVencimiento: formatLocalDate(fecha),
      });
    }
  }

  getTotalPorcentaje(): number {
    return this.beneficiarios().reduce((sum, b) => sum + b.porcentajeBeneficio, 0);
  }

  openBeneficiarioDialog(): void {
    const maxPorcentaje = 100 - this.getTotalPorcentaje();
    const dialogRef = this.dialog.open(BeneficiarioDialogComponent, {
      width: '550px',
      maxWidth: '95vw',
      data: { maxPorcentaje },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.beneficiarios.update((list) => [...list, result]);
      }
    });
  }

  removeBeneficiario(index: number): void {
    this.beneficiarios.update((list) => list.filter((_, i) => i !== index));
  }

  save(): void {
    if (this.form.invalid || !this.clienteSeleccionado()) return;

    // Validar beneficiarios: si hay alguno, total debe ser 100%
    if (this.beneficiarios().length > 0 && Math.abs(this.getTotalPorcentaje() - 100) > 0.01) {
      this.snackBar.open('El porcentaje de beneficiarios debe sumar exactamente 100%', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isLoading = true;

    // getRawValue() incluye los campos disabled (plazo, fechaVencimiento)
    this.cuentaService.abrir(this.form.getRawValue()).subscribe({
      next: (cuenta) => {
        if (this.beneficiarios().length > 0) {
          this.beneficiarioService.createBulk(cuenta.id, this.beneficiarios()).subscribe({
            next: () => {
              this.snackBar.open(`Cuenta ${cuenta.noCuenta} abierta exitosamente`, 'Cerrar', { duration: 3000 });
              this.dialogRef.close(true);
            },
            error: () => {
              this.snackBar.open(`Cuenta ${cuenta.noCuenta} abierta, pero error al guardar beneficiarios`, 'Cerrar', { duration: 5000 });
              this.dialogRef.close(true);
            },
          });
        } else {
          this.snackBar.open(`Cuenta ${cuenta.noCuenta} abierta exitosamente`, 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        }
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al abrir cuenta', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      },
    });
  }
}
