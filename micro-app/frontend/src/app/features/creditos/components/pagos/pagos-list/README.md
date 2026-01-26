# Componente de Consulta de Pagos (PagosListComponent)

## Descripción

Componente standalone de Angular para la consulta y gestión de todos los pagos del sistema. Permite visualizar, filtrar y anular pagos aplicados a préstamos.

## Características

### Funcionalidades Principales

1. **Lista de Pagos**
   - Visualización completa de todos los pagos del sistema
   - Tabla ordenable con MatTable
   - Paginación del lado del servidor con MatPaginator
   - Información detallada: número de pago, fecha, cliente, monto, tipo, estado

2. **Sistema de Filtros**
   - Búsqueda por cliente (nombre o número de documento)
   - Filtro por rango de fechas (fecha desde - fecha hasta)
   - Filtro por estado del pago (APLICADO, ANULADO, Todos)
   - Botones para aplicar y limpiar filtros

3. **Estadísticas en Tiempo Real**
   - Total de pagos
   - Pagos aplicados
   - Pagos anulados
   - Monto total aplicado
   - Tarjetas con gradientes visuales

4. **Acciones sobre Pagos**
   - Ver detalle completo del pago (diálogo modal)
   - Anular pago (solo para pagos con estado APLICADO)
   - Navegación al detalle del préstamo

5. **Diseño Responsive**
   - Adaptable a móviles, tablets y desktop
   - Grid flexible para filtros y estadísticas
   - Tabla con scroll horizontal en pantallas pequeñas

## Estructura del Componente

### Imports

```typescript
- CommonModule: Directivas comunes de Angular
- ReactiveFormsModule: Para manejo de formularios reactivos
- Material Design: Componentes de Angular Material
  - MatTableModule: Tabla de datos
  - MatPaginatorModule: Paginación
  - MatSortModule: Ordenamiento
  - MatFormFieldModule: Campos de formulario
  - MatDatepickerModule: Selector de fechas
  - MatChipsModule: Chips para estados
  - MatDialogModule: Diálogos modales
```

### Propiedades Principales

```typescript
- loading: Signal para estado de carga
- pagos: Signal con array de pagos
- dataSource: Fuente de datos para MatTable
- totalRegistros: Total de registros para paginación
- currentPage: Página actual
- pageSize: Tamaño de página
- filtrosForm: FormGroup para filtros
```

### Computed Signals

```typescript
- totalPagos(): Total de pagos
- pagosAplicados(): Cantidad de pagos aplicados
- pagosAnulados(): Cantidad de pagos anulados
- totalMontoAplicado(): Suma de montos aplicados
```

## Uso

### Navegación

Acceder desde el menú principal a la ruta:

```
/creditos/pagos
```

### Flujo de Trabajo

1. **Consultar Pagos**
   - Al cargar, muestra todos los pagos paginados
   - Utiliza filtros para búsquedas específicas
   - Ordena por columnas haciendo clic en los encabezados

2. **Filtrar Pagos**
   - Ingrese nombre o DUI del cliente
   - Seleccione rango de fechas
   - Elija estado del pago
   - Clic en "Aplicar Filtros"

3. **Ver Detalle**
   - Clic en el ícono de ojo (visibility)
   - Se abre un diálogo con información completa

4. **Anular Pago**
   - Disponible solo para pagos APLICADOS
   - Clic en el ícono de cancelar (cancel)
   - Ingrese motivo de anulación (mínimo 10 caracteres)
   - Confirme la acción

## Endpoints del Backend

### GET /api/pagos

Lista todos los pagos con filtros y paginación.

**Query Parameters:**
- `page`: Número de página (desde 1)
- `limit`: Cantidad de registros por página
- `estado`: Estado del pago (APLICADO, ANULADO)
- `fechaDesde`: Fecha inicio en formato YYYY-MM-DD
- `fechaHasta`: Fecha fin en formato YYYY-MM-DD
- `prestamoId`: ID del préstamo (opcional)

**Response:**
```json
{
  "data": [Pago[]],
  "total": number,
  "page": number,
  "limit": number,
  "totalPages": number
}
```

### POST /api/pagos/:id/anular

Anula un pago existente.

**Body:**
```json
{
  "motivoAnulacion": string,
  "usuarioAnulacionId": number,
  "nombreUsuarioAnulacion": string
}
```

## Estilos y Diseño

### Paleta de Colores

- **Estadística 1**: Gradiente púrpura (#667eea - #764ba2)
- **Estadística 2**: Gradiente verde (#11998e - #38ef7d)
- **Estadística 3**: Gradiente naranja (#fc4a1a - #f7b733)
- **Estadística 4**: Gradiente azul-púrpura (#4776E6 - #8E54E9)

### Estados de Pago

- **APLICADO**: Chip verde (#4caf50)
- **ANULADO**: Chip rojo (#f44336)

### Responsive Breakpoints

- **Mobile**: < 768px
  - Grid de filtros: 1 columna
  - Estadísticas: 1 columna
  - Botones: ancho completo

- **Tablet**: 768px - 1024px
  - Grid de filtros: 2 columnas
  - Estadísticas: 2 columnas

- **Desktop**: > 1024px
  - Grid de filtros: 4 columnas
  - Estadísticas: 4 columnas

## Dependencias

### Componentes Relacionados

- `AnularPagoDialogComponent`: Diálogo para anular pagos
- `DetallePagoDialogComponent`: Diálogo para ver detalle

### Servicios

- `PagoService`: Servicio para operaciones de pagos
  - `getAll(filtros)`: Lista pagos
  - `anular(id, request)`: Anula un pago

### Modelos

```typescript
interface Pago {
  id: number;
  numeroPago: string;
  fechaPago: string;
  montoPagado: number;
  capitalAplicado: number;
  interesAplicado: number;
  tipoPago: TipoPago;
  estado: EstadoPago;
  prestamo?: Prestamo;
  // ... más campos
}

interface FiltrosPago {
  prestamoId?: number;
  estado?: EstadoPago;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
}
```

## Mejoras Futuras

1. **Exportación de Datos**
   - Exportar a Excel/PDF
   - Generar reportes

2. **Filtros Avanzados**
   - Búsqueda por número de crédito
   - Filtro por rango de montos
   - Filtro por tipo de pago

3. **Gráficos y Analíticas**
   - Gráfico de pagos por mes
   - Estadísticas de anulaciones
   - Tendencias de pagos

4. **Acciones Masivas**
   - Selección múltiple de pagos
   - Reportes de múltiples pagos

## Notas Técnicas

- Componente **standalone** (no requiere módulo)
- Usa **Signals** de Angular para reactividad
- **OnPush Change Detection** para mejor rendimiento
- Paginación del **lado del servidor** para escalabilidad
- Formularios **reactivos** para mejor control y validación

## Autor

Desarrollado con Angular 17 y Angular Material
