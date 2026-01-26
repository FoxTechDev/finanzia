import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { PersonaService } from '../../services/persona.service';
import { UbicacionService } from '../../services/ubicacion.service';
import {
  Departamento,
  Municipio,
  Distrito,
  CreatePersonaRequest,
  ReferenciaPersonal,
  ReferenciaFamiliar,
} from '@core/models/cliente.model';
import { ReferenciaPersonalDialogComponent } from './referencia-personal-dialog.component';
import { ReferenciaFamiliarDialogComponent } from './referencia-familiar-dialog.component';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTableModule,
    MatDialogModule,
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.scss',
})
export class ClienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private personaService = inject(PersonaService);
  private ubicacionService = inject(UbicacionService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  isEditMode = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  clienteId: number | null = null;

  // Datos de ubicación
  departamentos = signal<Departamento[]>([]);
  municipiosDireccion = signal<Municipio[]>([]);
  distritosDireccion = signal<Distrito[]>([]);
  municipiosActividad = signal<Municipio[]>([]);
  distritosActividad = signal<Distrito[]>([]);

  // Referencias
  referenciasPersonales = signal<ReferenciaPersonal[]>([]);
  referenciasFamiliares = signal<ReferenciaFamiliar[]>([]);
  displayedColumnsPersonales = ['nombre', 'relacion', 'telefono', 'acciones'];
  displayedColumnsFamiliares = ['nombre', 'parentesco', 'telefono', 'acciones'];

  // Opciones
  sexoOptions = ['Masculino', 'Femenino', 'Otro'];
  estadoCivilOptions = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión libre'];
  tipoActividadOptions = ['Empleado', 'Independiente', 'Empresario', 'Jubilado', 'Estudiante', 'Otro'];
  relacionOptions = ['Amigo', 'Vecino', 'Compañero de trabajo', 'Conocido', 'Otro'];
  parentescoOptions = ['Padre', 'Madre', 'Hermano/a', 'Hijo/a', 'Cónyuge', 'Tío/a', 'Primo/a', 'Abuelo/a', 'Otro'];

  // Formularios
  datosPersonalesForm!: FormGroup;
  direccionForm!: FormGroup;
  actividadEconomicaForm!: FormGroup;

  ngOnInit(): void {
    this.initForms();
    this.loadDepartamentos();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.clienteId = +id;
      this.isEditMode.set(true);
      this.loadCliente(+id);
    }
  }

  private initForms(): void {
    this.datosPersonalesForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      apellido: ['', [Validators.required, Validators.maxLength(100)]],
      fechaNacimiento: ['', Validators.required],
      sexo: [''],
      nacionalidad: ['', [Validators.required, Validators.maxLength(60)]],
      estadoCivil: [''],
      telefono: ['', Validators.maxLength(30)],
      correoElectronico: ['', [Validators.email, Validators.maxLength(120)]],
      numeroDui: ['', [Validators.required, Validators.maxLength(10)]],
      fechaEmisionDui: ['', Validators.required],
      lugarEmisionDui: ['', [Validators.required, Validators.maxLength(120)]],
    });

    this.direccionForm = this.fb.group({
      departamentoId: ['', Validators.required],
      municipioId: ['', Validators.required],
      distritoId: ['', Validators.required],
      detalleDireccion: ['', Validators.maxLength(200)],
    });

    this.actividadEconomicaForm = this.fb.group({
      tipoActividad: ['', [Validators.required, Validators.maxLength(60)]],
      nombreEmpresa: ['', Validators.maxLength(150)],
      cargoOcupacion: ['', Validators.maxLength(120)],
      ingresosMensuales: ['', Validators.min(0)],
      departamentoId: ['', Validators.required],
      municipioId: ['', Validators.required],
      distritoId: ['', Validators.required],
      detalleDireccion: ['', Validators.maxLength(200)],
      latitud: [''],
      longitud: [''],
    });
  }

  // Obtener ubicación GPS
  isGettingLocation = signal(false);

  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.snackBar.open('Geolocalización no soportada en este navegador', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isGettingLocation.set(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.actividadEconomicaForm.patchValue({
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
        });
        this.isGettingLocation.set(false);
        this.snackBar.open('Ubicación obtenida correctamente', 'Cerrar', { duration: 2000 });
      },
      (error) => {
        this.isGettingLocation.set(false);
        let message = 'Error al obtener ubicación';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permiso de ubicación denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            message = 'Tiempo de espera agotado';
            break;
        }
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  clearLocation(): void {
    this.actividadEconomicaForm.patchValue({
      latitud: '',
      longitud: '',
    });
  }

  // Métodos para referencias personales
  openReferenciaPersonalDialog(referencia?: ReferenciaPersonal, index?: number): void {
    const dialogRef = this.dialog.open(ReferenciaPersonalDialogComponent, {
      width: '400px',
      data: {
        referencia: referencia || null,
        relacionOptions: this.relacionOptions,
      },
    });

    dialogRef.afterClosed().subscribe((result: ReferenciaPersonal | undefined) => {
      if (result) {
        const current = [...this.referenciasPersonales()];
        if (index !== undefined) {
          current[index] = result;
        } else {
          current.push(result);
        }
        this.referenciasPersonales.set(current);
      }
    });
  }

  editReferenciaPersonal(referencia: ReferenciaPersonal, index: number): void {
    this.openReferenciaPersonalDialog(referencia, index);
  }

  removeReferenciaPersonal(index: number): void {
    const current = [...this.referenciasPersonales()];
    current.splice(index, 1);
    this.referenciasPersonales.set(current);
  }

  // Métodos para referencias familiares
  openReferenciaFamiliarDialog(referencia?: ReferenciaFamiliar, index?: number): void {
    const dialogRef = this.dialog.open(ReferenciaFamiliarDialogComponent, {
      width: '400px',
      data: {
        referencia: referencia || null,
        parentescoOptions: this.parentescoOptions,
      },
    });

    dialogRef.afterClosed().subscribe((result: ReferenciaFamiliar | undefined) => {
      if (result) {
        const current = [...this.referenciasFamiliares()];
        if (index !== undefined) {
          current[index] = result;
        } else {
          current.push(result);
        }
        this.referenciasFamiliares.set(current);
      }
    });
  }

  editReferenciaFamiliar(referencia: ReferenciaFamiliar, index: number): void {
    this.openReferenciaFamiliarDialog(referencia, index);
  }

  removeReferenciaFamiliar(index: number): void {
    const current = [...this.referenciasFamiliares()];
    current.splice(index, 1);
    this.referenciasFamiliares.set(current);
  }

  private loadDepartamentos(): void {
    this.ubicacionService.getDepartamentos().subscribe({
      next: (data) => this.departamentos.set(data),
      error: () =>
        this.snackBar.open('Error al cargar departamentos', 'Cerrar', {
          duration: 3000,
        }),
    });
  }

  onDepartamentoDireccionChange(departamentoId: number): void {
    this.direccionForm.patchValue({ municipioId: '', distritoId: '' });
    this.municipiosDireccion.set([]);
    this.distritosDireccion.set([]);

    if (departamentoId) {
      this.ubicacionService.getMunicipios(departamentoId).subscribe({
        next: (data) => this.municipiosDireccion.set(data),
      });
    }
  }

  onMunicipioDireccionChange(municipioId: number): void {
    this.direccionForm.patchValue({ distritoId: '' });
    this.distritosDireccion.set([]);

    if (municipioId) {
      this.ubicacionService.getDistritos(municipioId).subscribe({
        next: (data) => this.distritosDireccion.set(data),
      });
    }
  }

  onDepartamentoActividadChange(departamentoId: number): void {
    this.actividadEconomicaForm.patchValue({ municipioId: '', distritoId: '' });
    this.municipiosActividad.set([]);
    this.distritosActividad.set([]);

    if (departamentoId) {
      this.ubicacionService.getMunicipios(departamentoId).subscribe({
        next: (data) => this.municipiosActividad.set(data),
      });
    }
  }

  onMunicipioActividadChange(municipioId: number): void {
    this.actividadEconomicaForm.patchValue({ distritoId: '' });
    this.distritosActividad.set([]);

    if (municipioId) {
      this.ubicacionService.getDistritos(municipioId).subscribe({
        next: (data) => this.distritosActividad.set(data),
      });
    }
  }

  private loadCliente(id: number): void {
    this.isLoading.set(true);
    this.personaService.getById(id).subscribe({
      next: (cliente) => {
        this.datosPersonalesForm.patchValue({
          ...cliente,
          fechaNacimiento: new Date(cliente.fechaNacimiento),
          fechaEmisionDui: new Date(cliente.fechaEmisionDui),
        });

        if (cliente.direccion) {
          this.onDepartamentoDireccionChange(cliente.direccion.departamentoId);
          setTimeout(() => {
            this.onMunicipioDireccionChange(cliente.direccion!.municipioId);
            this.direccionForm.patchValue(cliente.direccion!);
          }, 300);
        }

        if (cliente.actividadEconomica) {
          this.onDepartamentoActividadChange(cliente.actividadEconomica.departamentoId);
          setTimeout(() => {
            this.onMunicipioActividadChange(cliente.actividadEconomica!.municipioId);
            this.actividadEconomicaForm.patchValue(cliente.actividadEconomica!);
          }, 300);
        }

        // Cargar referencias
        if (cliente.referenciasPersonales && cliente.referenciasPersonales.length > 0) {
          this.referenciasPersonales.set(cliente.referenciasPersonales);
        }

        if (cliente.referenciasFamiliares && cliente.referenciasFamiliares.length > 0) {
          this.referenciasFamiliares.set(cliente.referenciasFamiliares);
        }

        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar cliente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/clientes']);
      },
    });
  }

  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  private cleanEmptyValues(obj: Record<string, unknown>, numericFields: string[] = []): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === '' || value === null || value === undefined) {
        continue; // Omitir valores vacíos
      }
      // Convertir campos numéricos a número
      if (numericFields.includes(key) && value !== '') {
        cleaned[key] = Number(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  onSubmit(): void {
    if (
      this.datosPersonalesForm.invalid ||
      this.direccionForm.invalid ||
      this.actividadEconomicaForm.invalid
    ) {
      this.snackBar.open('Complete todos los campos requeridos', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.isSaving.set(true);

    // Eliminar IDs y personaId de las referencias para evitar error de validación
    const refPersonales = this.referenciasPersonales().map(({ id, personaId, ...rest }) => rest);
    const refFamiliares = this.referenciasFamiliares().map(({ id, personaId, ...rest }) => rest);

    // Limpiar valores vacíos y convertir campos numéricos
    const actividadEconomica = this.cleanEmptyValues(
      this.actividadEconomicaForm.value,
      ['ingresosMensuales', 'departamentoId', 'municipioId', 'distritoId', 'latitud', 'longitud']
    );

    const direccion = this.cleanEmptyValues(
      this.direccionForm.value,
      ['departamentoId', 'municipioId', 'distritoId']
    );

    const persona: CreatePersonaRequest = {
      ...this.cleanEmptyValues(this.datosPersonalesForm.value),
      fechaNacimiento: this.formatDate(this.datosPersonalesForm.value.fechaNacimiento),
      fechaEmisionDui: this.formatDate(this.datosPersonalesForm.value.fechaEmisionDui),
      direccion,
      actividadEconomica,
      referenciasPersonales: refPersonales,
      referenciasFamiliares: refFamiliares,
    } as CreatePersonaRequest;

    const request$ = this.isEditMode()
      ? this.personaService.update(this.clienteId!, persona)
      : this.personaService.create(persona);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode() ? 'Cliente actualizado' : 'Cliente registrado',
          'Cerrar',
          { duration: 3000 }
        );
        this.router.navigate(['/clientes']);
      },
      error: (error) => {
        this.isSaving.set(false);
        this.snackBar.open(
          error.error?.message || 'Error al guardar',
          'Cerrar',
          { duration: 3000 }
        );
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/clientes']);
  }
}
