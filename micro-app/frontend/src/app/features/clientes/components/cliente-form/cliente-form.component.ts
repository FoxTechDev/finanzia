import { Component, inject, OnInit, signal, computed, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
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
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { PersonaService } from '../../services/persona.service';
import { UbicacionService } from '../../services/ubicacion.service';
import { CatalogosService } from '@features/catalogos/services/catalogos.service';
import {
  Departamento,
  Municipio,
  Distrito,
  CreatePersonaRequest,
  ReferenciaPersonal,
  ReferenciaFamiliar,
  TipoIngreso,
  TipoGasto,
  IngresoCliente,
  GastoCliente,
} from '@core/models/cliente.model';
import { CatalogoBase } from '@core/models/catalogo.model';
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
    MatCheckboxModule,
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
  private catalogosService = inject(CatalogosService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  // Referencias a las tablas para forzar actualización
  @ViewChild('ingresosTable') ingresosTable?: MatTable<any>;
  @ViewChild('gastosTable') gastosTable?: MatTable<any>;
  @ViewChild('dependenciasTable') dependenciasTable?: MatTable<any>;

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

  // Catálogos de ingresos y gastos
  tiposIngreso = signal<CatalogoBase[]>([]);
  tiposGasto = signal<CatalogoBase[]>([]);
  tiposVivienda = signal<CatalogoBase[]>([]);

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
  parentescoDependienteOptions = ['Hijo', 'Hija', 'Cónyuge', 'Padre', 'Madre', 'Hermano', 'Hermana', 'Abuelo', 'Abuela', 'Otro'];

  // Formularios
  datosPersonalesForm!: FormGroup;
  direccionForm!: FormGroup;
  actividadEconomicaForm!: FormGroup;
  ingresosGastosForm!: FormGroup;

  // Columnas para tablas
  displayedColumnsDependientes = ['nombreDependiente', 'parentesco', 'edad', 'trabaja', 'estudia', 'acciones'];
  displayedColumnsIngresos = ['tipo', 'monto', 'descripcion', 'acciones'];
  displayedColumnsGastos = ['tipo', 'monto', 'descripcion', 'acciones'];

  ngOnInit(): void {
    this.initForms();

    const id = this.route.snapshot.paramMap.get('id');

    // Cargar catálogos base primero
    forkJoin({
      departamentos: this.ubicacionService.getDepartamentos(),
      tiposIngreso: this.catalogosService.getTiposIngreso(),
      tiposGasto: this.catalogosService.getTiposGasto(),
      tiposVivienda: this.catalogosService.getTiposVivienda(),
    }).subscribe({
      next: (data) => {
        this.departamentos.set(data.departamentos);
        this.tiposIngreso.set(data.tiposIngreso);
        this.tiposGasto.set(data.tiposGasto);
        this.tiposVivienda.set(data.tiposVivienda);

        // Una vez cargados los catálogos, cargar el cliente si estamos en modo edición
        if (id) {
          this.clienteId = +id;
          this.isEditMode.set(true);
          this.loadCliente(+id);
        }
      },
      error: () => {
        this.snackBar.open('Error al cargar catálogos', 'Cerrar', { duration: 3000 });
      },
    });
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
      tipoViviendaId: ['', Validators.required],
      tiempoResidenciaAnios: ['', [Validators.min(0)]],
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

    // Formulario de ingresos y gastos con validador personalizado
    this.ingresosGastosForm = this.fb.group({
      ingresos: this.fb.array([]),
      gastos: this.fb.array([]),
      dependenciasFamiliares: this.fb.array([]),
    }, { validators: this.ingresosGastosValidator });
  }

  /**
   * Validador personalizado para el formulario de ingresos y gastos.
   * Permite avanzar en el stepper si los arrays están vacíos (datos opcionales).
   * Si hay elementos en los arrays, valida que estén completos.
   */
  private ingresosGastosValidator = (control: AbstractControl): ValidationErrors | null => {
    const ingresosArray = control.get('ingresos') as FormArray;
    const gastosArray = control.get('gastos') as FormArray;
    const dependenciasArray = control.get('dependenciasFamiliares') as FormArray;

    // Si todos los arrays están vacíos, el formulario es válido
    if (ingresosArray.length === 0 && gastosArray.length === 0 && dependenciasArray.length === 0) {
      return null;
    }

    // Si hay elementos, validar que cada uno esté completo
    let hasErrors = false;

    // Validar ingresos
    if (ingresosArray.length > 0) {
      for (let i = 0; i < ingresosArray.length; i++) {
        const ingresoGroup = ingresosArray.at(i);
        if (ingresoGroup.invalid) {
          hasErrors = true;
          ingresoGroup.markAllAsTouched();
        }
      }
    }

    // Validar gastos
    if (gastosArray.length > 0) {
      for (let i = 0; i < gastosArray.length; i++) {
        const gastoGroup = gastosArray.at(i);
        if (gastoGroup.invalid) {
          hasErrors = true;
          gastoGroup.markAllAsTouched();
        }
      }
    }

    // Validar dependencias familiares
    if (dependenciasArray.length > 0) {
      for (let i = 0; i < dependenciasArray.length; i++) {
        const depGroup = dependenciasArray.at(i);
        if (depGroup.invalid) {
          hasErrors = true;
          depGroup.markAllAsTouched();
        }
      }
    }

    return hasErrors ? { incompleteItems: true } : null;
  };

  private loadCatalogos(): void {
    this.catalogosService.getTiposIngreso().subscribe({
      next: (data) => this.tiposIngreso.set(data),
      error: () => this.snackBar.open('Error al cargar tipos de ingreso', 'Cerrar', { duration: 3000 }),
    });

    this.catalogosService.getTiposGasto().subscribe({
      next: (data) => this.tiposGasto.set(data),
      error: () => this.snackBar.open('Error al cargar tipos de gasto', 'Cerrar', { duration: 3000 }),
    });

    this.catalogosService.getTiposVivienda().subscribe({
      next: (data) => this.tiposVivienda.set(data),
      error: () => this.snackBar.open('Error al cargar tipos de vivienda', 'Cerrar', { duration: 3000 }),
    });
  }

  // Getters para FormArrays
  get ingresos(): FormArray {
    return this.ingresosGastosForm.get('ingresos') as FormArray;
  }

  get gastos(): FormArray {
    return this.ingresosGastosForm.get('gastos') as FormArray;
  }

  get dependenciasFamiliares(): FormArray {
    return this.ingresosGastosForm.get('dependenciasFamiliares') as FormArray;
  }

  // Cálculos automáticos
  totalIngresos = computed(() => {
    if (!this.ingresosGastosForm) return 0;
    const ingresosArray = this.ingresos;
    let total = 0;
    for (let i = 0; i < ingresosArray.length; i++) {
      const monto = parseFloat(ingresosArray.at(i).get('monto')?.value) || 0;
      total += monto;
    }
    return total;
  });

  totalGastos = computed(() => {
    if (!this.ingresosGastosForm) return 0;
    const gastosArray = this.gastos;
    let total = 0;
    for (let i = 0; i < gastosArray.length; i++) {
      const monto = parseFloat(gastosArray.at(i).get('monto')?.value) || 0;
      total += monto;
    }
    return total;
  });

  ingresoDisponible = computed(() => {
    return this.totalIngresos() - this.totalGastos();
  });

  // Métodos para manejar ingresos
  createIngreso(): FormGroup {
    return this.fb.group({
      tipoIngresoId: [null, Validators.required],
      monto: [null, [Validators.required, Validators.min(0)]],
      descripcion: ['', Validators.maxLength(200)],
    });
  }

  agregarIngreso(): void {
    this.ingresos.push(this.createIngreso());
    this.ingresosGastosForm.updateValueAndValidity();
    this.refreshIngresosTable();
  }

  eliminarIngreso(index: number): void {
    this.ingresos.removeAt(index);
    this.ingresosGastosForm.updateValueAndValidity();
    this.refreshIngresosTable();
  }

  private refreshIngresosTable(): void {
    this.cdr.detectChanges();
    this.ingresosTable?.renderRows();
  }

  // Métodos para manejar gastos
  createGasto(): FormGroup {
    return this.fb.group({
      tipoGastoId: [null, Validators.required],
      monto: [null, [Validators.required, Validators.min(0)]],
      descripcion: ['', Validators.maxLength(200)],
    });
  }

  agregarGasto(): void {
    this.gastos.push(this.createGasto());
    this.ingresosGastosForm.updateValueAndValidity();
    this.refreshGastosTable();
  }

  eliminarGasto(index: number): void {
    this.gastos.removeAt(index);
    this.ingresosGastosForm.updateValueAndValidity();
    this.refreshGastosTable();
  }

  private refreshGastosTable(): void {
    this.cdr.detectChanges();
    this.gastosTable?.renderRows();
  }

  // Métodos para manejar dependientes
  createDependiente(): FormGroup {
    return this.fb.group({
      nombreDependiente: ['', [Validators.required, Validators.maxLength(150)]],
      parentesco: ['', Validators.required],
      edad: [null, [Validators.min(0), Validators.max(120)]],
      trabaja: [false],
      estudia: [false],
      observaciones: ['', Validators.maxLength(200)],
    });
  }

  agregarDependiente(): void {
    this.dependenciasFamiliares.push(this.createDependiente());
    this.ingresosGastosForm.updateValueAndValidity();
    this.refreshDependenciasTable();
  }

  eliminarDependiente(index: number): void {
    this.dependenciasFamiliares.removeAt(index);
    this.ingresosGastosForm.updateValueAndValidity();
    this.refreshDependenciasTable();
  }

  private refreshDependenciasTable(): void {
    this.cdr.detectChanges();
    this.dependenciasTable?.renderRows();
  }

  // Obtener nombre de tipo de ingreso
  getNombreTipoIngreso(id: number): string {
    const tipo = this.tiposIngreso().find(t => t.id === id);
    return tipo?.nombre || '';
  }

  // Obtener nombre de tipo de gasto
  getNombreTipoGasto(id: number): string {
    const tipo = this.tiposGasto().find(t => t.id === id);
    return tipo?.nombre || '';
  }

  /**
   * Verifica si el formulario de ingresos/gastos tiene errores para mostrar en la UI.
   */
  hasIngresosGastosErrors(): boolean {
    return this.ingresosGastosForm.invalid && this.ingresosGastosForm.touched;
  }

  /**
   * Obtiene el mensaje de error para el formulario de ingresos/gastos.
   */
  getIngresosGastosErrorMessage(): string {
    if (!this.ingresosGastosForm.errors) {
      return '';
    }
    if (this.ingresosGastosForm.errors['incompleteItems']) {
      return 'Complete todos los campos de los ingresos, gastos o dependientes agregados';
    }
    return '';
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
          // Cargar municipios por departamento, luego distritos por municipio, luego patchValue
          this.ubicacionService.getMunicipios(cliente.direccion.departamentoId).subscribe({
            next: (municipios) => {
              this.municipiosDireccion.set(municipios);
              if (cliente.direccion!.municipioId) {
                this.ubicacionService.getDistritos(cliente.direccion!.municipioId).subscribe({
                  next: (distritos) => {
                    this.distritosDireccion.set(distritos);
                    this.direccionForm.patchValue(cliente.direccion!);
                  },
                });
              } else {
                this.direccionForm.patchValue(cliente.direccion!);
              }
            },
          });
        }

        if (cliente.actividadEconomica) {
          // Cargar municipios por departamento, luego distritos por municipio, luego patchValue
          this.ubicacionService.getMunicipios(cliente.actividadEconomica.departamentoId).subscribe({
            next: (municipios) => {
              this.municipiosActividad.set(municipios);
              if (cliente.actividadEconomica!.municipioId) {
                this.ubicacionService.getDistritos(cliente.actividadEconomica!.municipioId).subscribe({
                  next: (distritos) => {
                    this.distritosActividad.set(distritos);
                    this.actividadEconomicaForm.patchValue(cliente.actividadEconomica!);
                  },
                });
              } else {
                this.actividadEconomicaForm.patchValue(cliente.actividadEconomica!);
              }
            },
          });
        }

        // Cargar referencias
        if (cliente.referenciasPersonales && cliente.referenciasPersonales.length > 0) {
          this.referenciasPersonales.set(cliente.referenciasPersonales);
        }

        if (cliente.referenciasFamiliares && cliente.referenciasFamiliares.length > 0) {
          this.referenciasFamiliares.set(cliente.referenciasFamiliares);
        }

        // Cargar ingresos
        if (cliente.ingresos && cliente.ingresos.length > 0) {
          cliente.ingresos.forEach(ingreso => {
            const ingresoGroup = this.createIngreso();
            ingresoGroup.patchValue({
              tipoIngresoId: ingreso.tipoIngresoId ?? ingreso.tipoIngreso?.id,
              monto: ingreso.monto,
              descripcion: ingreso.descripcion,
            });
            this.ingresos.push(ingresoGroup);
          });
        }

        // Cargar gastos
        if (cliente.gastos && cliente.gastos.length > 0) {
          cliente.gastos.forEach(gasto => {
            const gastoGroup = this.createGasto();
            gastoGroup.patchValue({
              tipoGastoId: gasto.tipoGastoId ?? gasto.tipoGasto?.id,
              monto: gasto.monto,
              descripcion: gasto.descripcion,
            });
            this.gastos.push(gastoGroup);
          });
        }

        // Cargar dependencias familiares
        if (cliente.dependenciasFamiliares && cliente.dependenciasFamiliares.length > 0) {
          cliente.dependenciasFamiliares.forEach(dep => {
            const depGroup = this.createDependiente();
            depGroup.patchValue(dep);
            this.dependenciasFamiliares.push(depGroup);
          });
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
      this.actividadEconomicaForm.invalid ||
      this.ingresosGastosForm.invalid
    ) {
      this.snackBar.open('Complete todos los campos requeridos', 'Cerrar', {
        duration: 3000,
      });
      // Marcar todos los campos como touched para mostrar errores
      this.datosPersonalesForm.markAllAsTouched();
      this.direccionForm.markAllAsTouched();
      this.actividadEconomicaForm.markAllAsTouched();
      this.ingresosGastosForm.markAllAsTouched();
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
      ['departamentoId', 'municipioId', 'distritoId', 'tipoViviendaId', 'tiempoResidenciaAnios']
    );

    // Preparar ingresos
    const ingresos = this.ingresos.value.map((ingreso: any) =>
      this.cleanEmptyValues(ingreso, ['tipoIngresoId', 'monto'])
    );

    // Preparar gastos
    const gastosData = this.gastos.value.map((gasto: any) =>
      this.cleanEmptyValues(gasto, ['tipoGastoId', 'monto'])
    );

    // Preparar dependientes
    const dependientes = this.dependenciasFamiliares.value.map((dep: any) =>
      this.cleanEmptyValues(dep, ['edad'])
    );

    const persona: CreatePersonaRequest = {
      ...this.cleanEmptyValues(this.datosPersonalesForm.value),
      fechaNacimiento: this.formatDate(this.datosPersonalesForm.value.fechaNacimiento),
      fechaEmisionDui: this.formatDate(this.datosPersonalesForm.value.fechaEmisionDui),
      direccion,
      actividadEconomica,
      referenciasPersonales: refPersonales,
      referenciasFamiliares: refFamiliares,
      ingresos,
      gastos: gastosData,
      dependenciasFamiliares: dependientes,
    } as any;

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
