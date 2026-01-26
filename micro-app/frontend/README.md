# Frontend - FINANZIA Sistema de Gestión de Créditos

## Stack Tecnológico

- **Framework:** Angular 17 (Standalone Components)
- **UI Library:** Angular Material 17
- **Estilos:** SCSS
- **Estado:** RxJS + Services
- **HTTP:** HttpClient con Interceptores
- **Routing:** Angular Router con Guards
- **Formularios:** Reactive Forms

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/              # Servicios, guards, interceptores, modelos
│   │   │   ├── guards/        # Auth y Role guards
│   │   │   ├── interceptors/  # Auth y Error interceptors
│   │   │   ├── services/      # Servicios compartidos
│   │   │   └── models/        # Interfaces y tipos
│   │   ├── features/          # Módulos de funcionalidad
│   │   │   ├── auth/          # Login, registro
│   │   │   ├── home/          # Dashboard
│   │   │   ├── clientes/      # Gestión de clientes
│   │   │   ├── creditos/      # Gestión de créditos
│   │   │   ├── catalogos/     # Catálogos de sistema
│   │   │   └── usuarios/      # Gestión de usuarios
│   │   ├── shared/            # Componentes compartidos
│   │   └── app.config.ts      # Configuración principal
│   ├── environments/          # Environments (dev, prod)
│   ├── assets/                # Recursos estáticos
│   └── styles.scss            # Estilos globales
├── angular.json               # Configuración de Angular CLI
├── package.json               # Dependencias
├── tsconfig.json              # Configuración TypeScript
├── web.config                 # Config para IIS/Azure
└── DEPLOY-AZURE.md           # Guía de despliegue
```

## Requisitos Previos

- Node.js 18+ y npm
- Angular CLI 17: `npm install -g @angular/cli`

## Instalación

```bash
# Clonar el repositorio
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

La aplicación estará disponible en `http://localhost:4200`

## Scripts Disponibles

### Desarrollo
```bash
npm start              # Servidor de desarrollo (puerto 4200)
npm run watch          # Build continuo en modo desarrollo
```

### Producción
```bash
npm run build:prod     # Build optimizado para producción
npm run serve:prod     # Prueba local con config de producción
```

### Testing
```bash
npm test               # Ejecutar tests unitarios
npm run test:ci        # Tests para CI/CD (sin watch)
```

### Análisis
```bash
npm run build:stats    # Generar estadísticas del bundle
npm run analyze        # Analizar tamaño de módulos (requiere webpack-bundle-analyzer)
```

### Linting
```bash
npm run lint           # Ejecutar linter
```

## Configuración de Environments

### Desarrollo (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api',
  enableDebugLogs: true,
  httpTimeout: 30000,
  appName: 'FINANZIA',
  appVersion: '1.0.0-dev',
};
```

### Producción (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: '/api',  // Ruta relativa para Azure
  enableDebugLogs: false,
  httpTimeout: 30000,
  appName: 'FINANZIA',
  appVersion: '1.0.0',
};
```

## Características Principales

### Autenticación y Autorización
- Login con JWT
- Guards para rutas protegidas
- Role-based access control (ADMIN, ASESOR, COMITE)
- Auto-refresh de token
- Logout automático en 401

### Módulos Principales

#### Clientes
- Lista paginada de clientes
- Crear/Editar cliente
- Búsqueda y filtros
- Validaciones completas

#### Créditos
- Gestión del proceso de crédito
- Estados: En proceso, Aprobado, Rechazado, Desembolsado
- Cálculo automático de amortización
- Documentación adjunta

#### Catálogos (ADMIN)
- Tipos de cliente
- Tipos de crédito
- Garantías
- Destinos de crédito
- Estados de proceso

#### Usuarios (ADMIN)
- Gestión de usuarios del sistema
- Asignación de roles
- Activación/desactivación

### Interceptores

#### Error Interceptor
- Retry automático (2 intentos)
- Backoff exponencial (1s, 2s)
- Manejo inteligente de errores
- Mensajes user-friendly

#### Auth Interceptor
- Inyección automática de token JWT
- Redirección a login en 401
- Manejo de refresh token

### Optimizaciones

#### Performance
- Lazy loading de módulos
- OnPush change detection strategy
- Output hashing para cache busting
- Tree-shaking y minificación
- Budgets configurados

#### UX
- Loading states en formularios
- Feedback visual en acciones
- Confirmación en acciones destructivas
- Responsive design (móvil-first)
- Material Design

## Despliegue

### Azure App Service
Ver [DEPLOY-AZURE.md](./DEPLOY-AZURE.md) para guía completa.

```bash
# Build
npm run build:prod

# Los archivos están en: dist/micro-app/browser/
```

### Azure Static Web Apps
```bash
az staticwebapp create \
  --name finanzia-static \
  --resource-group finanzia-rg \
  --location "Central US" \
  --source https://github.com/tu-repo \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist/micro-app/browser"
```

## Arquitectura

### Patrón de Comunicación
```
Component → Service → HttpClient → Interceptors → Backend API
```

### Manejo de Estado
- Servicios con BehaviorSubject para estado compartido
- RxJS operators para transformación de datos
- AsyncPipe para subscripciones automáticas

### Estructura de Formularios
```typescript
// Reactive Forms con validaciones
form = this.fb.group({
  campo: ['', [Validators.required, Validators.minLength(3)]],
  email: ['', [Validators.required, Validators.email]],
});

// Validadores personalizados
form.setAsyncValidators(customAsyncValidator);

// Manejo de errores
getErrorMessage(field: string): string {
  const control = this.form.get(field);
  if (control?.hasError('required')) return 'Campo requerido';
  if (control?.hasError('email')) return 'Email inválido';
  return '';
}
```

## Convenciones de Código

### Nomenclatura
- **Componentes:** `nombre.component.ts` (PascalCase en clase)
- **Servicios:** `nombre.service.ts` (PascalCase en clase)
- **Guards:** `nombre.guard.ts`
- **Interceptores:** `nombre.interceptor.ts`
- **Modelos:** `nombre.model.ts`

### Estructura de Componente
```typescript
@Component({
  selector: 'app-nombre',
  templateUrl: './nombre.component.html',
  styleUrls: ['./nombre.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Cuando sea posible
})
export class NombreComponent implements OnInit, OnDestroy {
  // Inputs
  @Input() data: any;

  // Outputs
  @Output() action = new EventEmitter<any>();

  // Propiedades públicas (template)
  items$ = new BehaviorSubject<any[]>([]);

  // Propiedades privadas
  private destroy$ = new Subject<void>();

  constructor(private service: ServiceName) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    // Lógica de inicialización
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## Troubleshooting

### Error: "Cannot find module @angular/..."
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 4200 is already in use"
```bash
# Cambiar puerto
ng serve --port 4300

# O matar proceso
# Windows: netstat -ano | findstr :4200
# Linux/Mac: lsof -ti:4200 | xargs kill
```

### Error de CORS en desarrollo
Configurar proxy en `proxy.conf.json`:
```json
{
  "/api": {
    "target": "http://localhost:3001",
    "secure": false,
    "changeOrigin": true
  }
}
```

Ejecutar: `ng serve --proxy-config proxy.conf.json`

### Build falla por límites de budget
Ajustar budgets en `angular.json` o analizar con:
```bash
npm run analyze
```

## Contribución

1. Crear rama desde `develop`
2. Seguir convenciones de código
3. Escribir tests para nuevas funcionalidades
4. Actualizar documentación
5. Crear Pull Request

## Recursos

- [Angular Docs](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
- [RxJS](https://rxjs.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)

## Licencia

Propietario: FINANZIA S.C. DE R.L. DE C.V.

## Soporte

Para dudas o problemas, contactar al equipo de desarrollo.

---

**Última actualización:** 2026-01-25
**Versión:** 1.0.0
