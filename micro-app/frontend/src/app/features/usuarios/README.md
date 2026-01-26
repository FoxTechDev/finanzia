# Módulo de Gestión de Usuarios

Este módulo proporciona funcionalidad completa para la administración de usuarios del sistema. Solo es accesible por usuarios con rol **ADMIN**.

## Estructura del Módulo

```
usuarios/
├── components/
│   ├── usuarios-list/              # Lista principal de usuarios
│   │   └── usuarios-list.component.ts
│   └── usuario-form-dialog/        # Formulario de creación/edición
│       └── usuario-form-dialog.component.ts
├── services/
│   └── usuarios.service.ts         # Servicio para operaciones CRUD
├── usuarios.routes.ts              # Configuración de rutas
└── README.md                       # Este archivo
```

## Características

### Lista de Usuarios (`usuarios-list.component.ts`)

- **Visualización**: Tabla responsiva con Angular Material
- **Columnas**:
  - Email (con formato destacado)
  - Nombre completo (firstName + lastName)
  - Rol (chip con el nombre del rol)
  - Estado (activo/inactivo con chip colorido)
  - Acciones (editar, activar/desactivar)
- **Paginación**: MatPaginator con opciones de 5, 10, 25, 50 registros
- **Acciones**:
  - Crear nuevo usuario (botón flotante)
  - Editar usuario existente
  - Activar/desactivar usuario
- **Estados**:
  - Loading spinner mientras carga
  - Mensaje de lista vacía con call-to-action

### Formulario de Usuario (`usuario-form-dialog.component.ts`)

- **Modal Dialog** de Angular Material
- **Modo Creación**:
  - Email (requerido, validación de email)
  - Password (requerido, mínimo 6 caracteres, con toggle de visibilidad)
  - Nombre (opcional)
  - Apellido (opcional)
  - Rol (select con roles activos del sistema)
- **Modo Edición**:
  - Email (readonly, no modificable)
  - Nombre (opcional)
  - Apellido (opcional)
  - Rol (select con roles activos)
  - Estado activo (checkbox)
- **Validaciones**:
  - Email requerido y formato válido
  - Password requerido solo al crear (min 6 caracteres)
  - Mensajes de error contextuales
- **UX**:
  - Iconos Material Design para cada campo
  - Hints descriptivos
  - Botones con estados de loading
  - Confirmación con MatSnackBar

### Servicio (`usuarios.service.ts`)

Proporciona métodos para interactuar con el backend:

```typescript
// Obtener todos los usuarios
getAll(): Observable<UsuarioExtendido[]>

// Obtener usuario por ID
getById(id: string): Observable<UsuarioExtendido>

// Crear nuevo usuario
create(data: CreateUserDto): Observable<UsuarioExtendido>

// Actualizar usuario existente
update(id: string, data: UpdateUserDto): Observable<UsuarioExtendido>

// Obtener roles activos
getRoles(): Observable<Rol[]>

// Activar/desactivar usuario
toggleActive(id: string, isActive: boolean): Observable<UsuarioExtendido>
```

## Endpoints del Backend

El servicio consume los siguientes endpoints:

- `GET /users` - Listar todos los usuarios
- `GET /users/:id` - Obtener usuario por ID
- `POST /users` - Crear nuevo usuario
- `PATCH /users/:id` - Actualizar usuario
- `GET /roles/activos` - Obtener roles activos

## Permisos

- **Acceso**: Solo usuarios con rol `ADMIN`
- **Guard**: `roleGuard` con `data: { roles: [RoleCodes.ADMIN] }`
- **Navegación**: Enlace visible solo para ADMIN en el menú lateral

## Rutas

- **Principal**: `/usuarios` - Lista de usuarios

## Integración en el Sistema

### 1. Rutas Globales (`app.routes.ts`)

```typescript
{
  path: 'usuarios',
  loadChildren: () => import('./features/usuarios/usuarios.routes').then(m => m.USUARIOS_ROUTES),
  canActivate: [authGuard, roleGuard],
  data: { roles: [RoleCodes.ADMIN] },
}
```

### 2. Menú de Navegación (`main-layout.component.html`)

Agregado en la sección "Administración":

```html
<a mat-list-item routerLink="/usuarios" routerLinkActive="active">
  <mat-icon matListItemIcon>manage_accounts</mat-icon>
  <span matListItemTitle>Usuarios</span>
</a>
```

### 3. Login

Se ha removido el link de registro público del componente de login, ya que ahora solo los administradores pueden crear usuarios.

## Diseño Responsive

### Breakpoints

- **Mobile** (< 768px):
  - Padding reducido
  - Fuente más pequeña en tabla
  - Dialog ocupa el 90% del viewport

- **Tablet y Desktop** (>= 768px):
  - Layout optimizado con espaciado completo
  - Dialog con ancho fijo de 500px

### Características Responsive

- Tabla scrollable horizontalmente en móviles
- Dialog adaptativo con `maxWidth: 90vw`
- Botones y acciones touch-friendly
- Contenido scrollable en pantallas pequeñas

## DTOs y Modelos

### CreateUserDto
```typescript
{
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  rolId?: number;
}
```

### UpdateUserDto
```typescript
{
  email?: string;
  firstName?: string;
  lastName?: string;
  rolId?: number;
  isActive?: boolean;
}
```

### UsuarioExtendido
```typescript
{
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  rol?: Rol;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
```

## Mejoras Futuras

- [ ] Filtros de búsqueda por email, nombre, rol
- [ ] Ordenamiento por columnas
- [ ] Exportación de lista de usuarios (CSV, Excel)
- [ ] Historial de cambios de usuario
- [ ] Cambio de contraseña desde el formulario de edición
- [ ] Confirmación antes de desactivar usuario
- [ ] Bulk actions (activar/desactivar múltiples usuarios)
- [ ] Reseteo de contraseña por email

## Notas de Desarrollo

- **Standalone Components**: Todos los componentes son standalone (Angular 17+)
- **Signals**: Uso de signals para estados reactivos
- **Reactive Forms**: FormBuilder con validaciones integradas
- **Material Design**: 100% Angular Material UI
- **Inyección de Dependencias**: Uso del nuevo método `inject()` de Angular
- **TypeScript Strict**: Código tipado estrictamente
