import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { debounceTime, switchMap, of } from 'rxjs';
import { CuentaAhorroService } from '../../services/cuenta-ahorro.service';
import { CatalogosAhorroService } from '../../services/catalogos-ahorro.service';
import { BeneficiarioService } from '../../services/beneficiario.service';
import { PersonaService } from '../../../clientes/services/persona.service';
import { TipoAhorro, TipoCapitalizacion, CreateBeneficiarioRequest } from '@core/models/ahorro.model';
import { Persona } from '@core/models/cliente.model';
import { BeneficiarioDialogComponent } from './beneficiario-dialog.component';

@Component({
  selector: 'app-cuenta-apertura',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatIconModule,
    MatTableModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ dialogTitle }}</h2>
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
          <mat-label>Tipo de Ahorro</mat-label>
          <mat-select formControlName="tipoAhorroId" (selectionChange)="onTipoChange($event.value)">
            @for (tipo of tiposAhorro(); track tipo.id) {
              <mat-option [value]="tipo.id">{{ tipo.nombre }} ({{ tipo.lineaAhorro?.nombre }})</mat-option>
            }
          </mat-select>
          @if (form.get('tipoAhorroId')?.hasError('required')) {
            <mat-error>El tipo es requerido</mat-error>
          }
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Monto de Apertura ($)</mat-label>
            <input matInput type="number" formControlName="monto" step="0.01" />
            @if (form.get('monto')?.hasError('required')) {
              <mat-error>El monto es requerido</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Tasa de Interés (%)</mat-label>
            <input matInput type="number" formControlName="tasaInteres" step="0.01" />
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Fecha de Apertura</mat-label>
            <input matInput formControlName="fechaApertura" type="date" />
          </mat-form-field>

          @if (tipoSeleccionado()?.esPlazo) {
            <mat-form-field appearance="outline">
              <mat-label>Plazo (días)</mat-label>
              <input matInput type="number" formControlName="plazo" />
            </mat-form-field>
          }
        </div>

        @if (tipoSeleccionado()?.esPlazo) {
          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Fecha Vencimiento</mat-label>
              <input matInput formControlName="fechaVencimiento" type="date" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Capitalización</mat-label>
              <mat-select formControlName="tipoCapitalizacionId">
                @for (cap of tiposCapitalizacion(); track cap.id) {
                  <mat-option [value]="cap.id">{{ cap.nombre }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observación</mat-label>
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
    .beneficiarios-section { margin-top: 16px; padding-top: 16px; border-top: 1px solid #e0e0e0; }
    .text-right { text-align: right; }
  `],
})
export class CuentaAperturaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CuentaAperturaComponent>);
  private dialog = inject(MatDialog);
  private cuentaService = inject(CuentaAhorroService);
  private catalogos = inject(CatalogosAhorroService);
  private personaService = inject(PersonaService);
  private beneficiarioService = inject(BeneficiarioService);
  private snackBar = inject(MatSnackBar);
  private dialogData = inject(MAT_DIALOG_DATA, { optional: true }) as { lineaCodigo?: string } | null;

  lineaCodigo = '';
  dialogTitle = 'Apertura de Cuenta de Ahorro';

  tiposAhorro = signal<TipoAhorro[]>([]);
  tiposCapitalizacion = signal<TipoCapitalizacion[]>([]);
  personas = signal<Persona[]>([]);
  clienteSeleccionado = signal<Persona | null>(null);
  tipoSeleccionado = signal<TipoAhorro | null>(null);
  beneficiarios = signal<CreateBeneficiarioRequest[]>([]);

  isLoading = false;
  searchControl = this.fb.control('');
  form: FormGroup;

  benefColumns = ['nombre', 'parentesco', 'porcentaje', 'acciones'];

  constructor() {
    const hoy = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      personaId: [null, Validators.required],
      tipoAhorroId: [null, Validators.required],
      monto: [null, [Validators.required, Validators.min(0.01)]],
      tasaInteres: [0],
      fechaApertura: [hoy, Validators.required],
      plazo: [0],
      fechaVencimiento: [null],
      tipoCapitalizacionId: [null],
      observacion: [''],
    });
  }

  ngOnInit(): void {
    this.lineaCodigo = this.dialogData?.lineaCodigo || '';
    const lineaNombres: Record<string, string> = {
      AV: 'Ahorro a la Vista',
      DPF: 'Depósito a Plazo Fijo',
      AP: 'Ahorro Programado',
    };
    if (this.lineaCodigo && lineaNombres[this.lineaCodigo]) {
      this.dialogTitle = `Apertura - ${lineaNombres[this.lineaCodigo]}`;
    }

    if (this.lineaCodigo) {
      this.catalogos.getTiposByLinea(this.lineaCodigo).subscribe((data) => this.tiposAhorro.set(data));
    } else {
      this.catalogos.getTipos(true).subscribe((data) => this.tiposAhorro.set(data));
    }
    this.catalogos.getTiposCapitalizacion().subscribe((data) => this.tiposCapitalizacion.set(data));

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
  }

  displayCliente(persona: Persona): string {
    return persona ? `${persona.nombre} ${persona.apellido}` : '';
  }

  onTipoChange(tipoId: number): void {
    const tipo = this.tiposAhorro().find((t) => t.id === tipoId);
    this.tipoSeleccionado.set(tipo || null);
    if (tipo) {
      this.form.patchValue({ tasaInteres: tipo.tasaVigente });
    }
  }

  getTotalPorcentaje(): number {
    return this.beneficiarios().reduce((sum, b) => sum + b.porcentajeBeneficio, 0);
  }

  openBeneficiarioDialog(): void {
    const maxPorcentaje = 100 - this.getTotalPorcentaje();
    const dialogRef = this.dialog.open(BeneficiarioDialogComponent, {
      width: '550px',
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

    this.cuentaService.abrir(this.form.value).subscribe({
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
