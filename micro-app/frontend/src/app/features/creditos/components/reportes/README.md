# Reporte de Colocación de Créditos

Componente para generar reportes de préstamos desembolsados con capacidad de filtrado y exportación a Excel y PDF.

## Ubicación

**Ruta**: `/creditos/reportes/colocacion`

**Componente**: `ReporteColocacionComponent`

**Servicio**: `ReporteService`

## Características

### Filtros Disponibles

1. **Fecha Desde** (requerido): Fecha inicial del periodo de consulta
2. **Fecha Hasta** (requerido): Fecha final del periodo de consulta
3. **Línea de Crédito** (opcional): Filtra por línea de crédito específica
4. **Tipo de Crédito** (opcional): Filtra por tipo de crédito específico

### Columnas del Reporte

- No. de Préstamo
- Nombre del Cliente (persona)
- Línea de Crédito
- Tipo de Crédito
- Monto Desembolsado
- Tasa de Interés
- Plazo (número de cuotas)
- Periodicidad de Pago
- Saldo Capital
- Fecha de Otorgamiento
- Fecha de Vencimiento

### Resumen de Datos

El reporte incluye un resumen con:
- Total de préstamos encontrados
- Total desembolsado (suma de todos los montos)
- Saldo total de capital (suma de todos los saldos)

### Exportación

#### Excel
- Formato `.xlsx`
- Incluye todas las columnas del reporte
- Fila de totales al final
- Nombre del archivo: `reporte-colocacion-YYYY-MM-DD-YYYY-MM-DD.xlsx`

#### PDF
- Formato landscape para mejor visualización
- Encabezado con:
  - Logo de la institución (FINANZIA)
  - Título del reporte
  - Periodo consultado
  - Fecha de generación
- Tabla con todos los datos
- Fila de totales resaltada
- Nombre del archivo: `reporte-colocacion-YYYY-MM-DD-YYYY-MM-DD.pdf`

## Uso

### Acceso al Componente

El reporte está disponible para los siguientes roles:
- ADMIN
- ASESOR
- COMITE

### Flujo de Uso

1. Seleccionar las fechas del periodo a consultar
2. (Opcional) Seleccionar una línea de crédito específica
3. (Opcional) Seleccionar un tipo de crédito específico
4. Hacer clic en "Generar Reporte"
5. Revisar los datos en la tabla
6. Exportar a Excel o PDF según necesidad

### Navegación

Para agregar un enlace al menú de navegación, agregar en el sidebar o menú principal:

```typescript
{
  label: 'Reporte de Colocación',
  icon: 'assessment',
  route: '/creditos/reportes/colocacion',
  roles: [RoleCodes.ADMIN, RoleCodes.ASESOR, RoleCodes.COMITE]
}
```

## Dependencias

- **xlsx**: Exportación a Excel
- **jspdf**: Generación de PDF
- **jspdf-autotable**: Tablas en PDF
- **Angular Material**: Componentes UI

## Personalización

### Modificar Columnas Visibles

Editar el array `columnasVisibles` en el componente:

```typescript
columnasVisibles = [
  'numeroCredito',
  'nombreCliente',
  // ... agregar o quitar columnas
];
```

### Cambiar Logo en PDF

Descomentar y configurar la línea del logo en el método `exportarPDF()`:

```typescript
// Convertir el logo a base64 primero
const logoBase64 = '...'; // Base64 del logo
doc.addImage(logoBase64, 'PNG', 15, 10, 30, 20);
```

### Ajustar Tamaño de Página en PDF

Modificar en el método `exportarPDF()`:

```typescript
const doc = new jsPDF('landscape'); // o 'portrait'
```

## Integración con Backend

El servicio consulta el endpoint:
```
GET /api/prestamos
```

Con los siguientes parámetros:
- `fechaDesde`: string (formato YYYY-MM-DD)
- `fechaHasta`: string (formato YYYY-MM-DD)
- `lineaCreditoId`: number (opcional)
- `tipoCreditoId`: number (opcional)

**Nota**: Asegurarse de que el backend soporte estos filtros para obtener préstamos desembolsados en el rango de fechas especificado.

## Responsive Design

El componente es completamente responsive:
- **Desktop**: Layout en grid con múltiples columnas
- **Tablet**: Grid adaptativo
- **Mobile**: Columnas en stack vertical, tabla con scroll horizontal

## Estados del Componente

1. **Inicial**: Formulario de filtros vacío con fechas por defecto (mes actual)
2. **Cargando**: Spinner visible mientras se obtienen datos
3. **Con Datos**: Tabla visible con datos paginados y opciones de exportación
4. **Sin Datos**: Mensaje informativo cuando no hay resultados

## Validaciones

- Fechas desde y hasta son obligatorias
- No se permite generar reporte con formulario inválido
- Validación de línea-tipo de crédito (tipos filtrados por línea seleccionada)

## Paginación

- Tamaño de página por defecto: 10 registros
- Opciones: 10, 25, 50, 100 registros por página
- Navegación first/last incluida

## Soporte y Mejoras Futuras

Posibles mejoras a implementar:
- [ ] Filtros adicionales (estado del préstamo, asesor, sucursal)
- [ ] Gráficos estadísticos
- [ ] Comparación entre periodos
- [ ] Exportación a otros formatos (CSV)
- [ ] Programación de reportes automáticos
- [ ] Envío por correo electrónico

## Desarrollador

Componente creado siguiendo los estándares y patrones del proyecto FINANZIA.

**Stack**:
- Angular 17
- Angular Material
- Reactive Forms
- Standalone Components
- Signals API
