# Reporte de Colocación de Créditos - Guía de Implementación

## Resumen

Se ha creado exitosamente el componente de **Reporte de Colocación de Créditos** para el módulo de préstamos de la aplicación Angular 17 con Angular Material.

## Archivos Creados

### 1. Servicio de Reportes
**Ubicación**: `C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\micro-app\frontend\src\app\features\creditos\services\reporte.service.ts`

**Responsabilidades**:
- Consulta de préstamos desembolsados por periodo
- Transformación de datos al formato del reporte
- Filtrado por línea y tipo de crédito

### 2. Componente de Reporte
**Ubicación**: `C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\micro-app\frontend\src\app\features\creditos\components\reportes\reporte-colocacion.component.ts`

**Características**:
- Formulario reactivo con validaciones
- Filtros: fecha desde, fecha hasta, línea de crédito, tipo de crédito
- Tabla con paginación (10, 25, 50, 100 registros)
- Resumen estadístico (total préstamos, total desembolsado, saldo total)
- Exportación a Excel (.xlsx)
- Exportación a PDF con formato profesional
- Diseño responsive (mobile-first)
- Estados de carga y vacío

### 3. Documentación
**Ubicación**: `C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\micro-app\frontend\src\app\features\creditos\components\reportes\README.md`

### 4. Ruta Configurada
**Ubicación**: `C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\micro-app\frontend\src\app\features\creditos\creditos.routes.ts`

**Ruta**: `/creditos/reportes/colocacion`

**Roles permitidos**: ADMIN, ASESOR, COMITE

## Dependencias Instaladas

Las siguientes dependencias fueron instaladas exitosamente:

```json
{
  "xlsx": "^0.18.5",
  "jspdf": "^2.5.2",
  "jspdf-autotable": "^3.8.4"
}
```

## Compilación

El proyecto compila correctamente. Se verificó con:

```bash
npm run build -- --configuration development
```

**Resultado**: ✅ Build exitoso
**Bundle del componente**: `chunk-MPW4HKXV.js (reporte-colocacion-component) - 1.29 MB`

## Cómo Acceder al Reporte

### Opción 1: Navegación Directa
Acceder a la URL: `http://localhost:4200/creditos/reportes/colocacion`

### Opción 2: Agregar al Menú de Navegación

Editar el archivo del sidebar/menú y agregar:

```typescript
// En el array de opciones del menú de Créditos
{
  label: 'Reporte de Colocación',
  icon: 'assessment',
  route: '/creditos/reportes/colocacion',
  roles: [RoleCodes.ADMIN, RoleCodes.ASESOR, RoleCodes.COMITE]
}
```

### Opción 3: Agregar Botón en Módulo de Préstamos

En el componente `prestamos-list.component.ts`, agregar un botón en el header:

```html
<button mat-raised-button color="accent" routerLink="/creditos/reportes/colocacion">
  <mat-icon>assessment</mat-icon>
  Reporte de Colocación
</button>
```

## Uso del Reporte

### Paso 1: Seleccionar Fechas
- **Fecha desde**: Fecha inicial del periodo (requerido)
- **Fecha hasta**: Fecha final del periodo (requerido)
- Por defecto: primer día del mes actual hasta último día del mes actual

### Paso 2: Filtros Opcionales
- **Línea de crédito**: Filtra préstamos de una línea específica
- **Tipo de crédito**: Filtra préstamos de un tipo específico (se filtra automáticamente por línea seleccionada)

### Paso 3: Generar Reporte
- Hacer clic en "Generar Reporte"
- Se mostrarán los préstamos desembolsados en el periodo

### Paso 4: Exportar
- **Excel**: Descarga archivo `.xlsx` con todos los datos
- **PDF**: Descarga archivo `.pdf` con formato profesional

## Columnas del Reporte

| Columna | Descripción | Formato |
|---------|-------------|---------|
| No. Préstamo | Número de crédito | Texto |
| Nombre del Cliente | Nombre completo de la persona | Texto |
| Línea de Crédito | Nombre de la línea | Texto |
| Tipo de Crédito | Nombre del tipo | Texto |
| Monto Desembolsado | Monto otorgado | Moneda USD |
| Tasa de Interés | Tasa aplicada | Porcentaje |
| Plazo | Número de cuotas | Número |
| Periodicidad | Frecuencia de pago | Texto |
| Saldo Capital | Saldo pendiente | Moneda USD |
| Fecha Otorgamiento | Fecha de desembolso | dd/MM/yyyy |
| Fecha Vencimiento | Fecha de última cuota | dd/MM/yyyy |

## Resumen Estadístico

El reporte incluye tres indicadores principales:

1. **Total de Préstamos**: Cantidad de préstamos encontrados
2. **Total Desembolsado**: Suma de todos los montos desembolsados
3. **Saldo Total Capital**: Suma de todos los saldos pendientes

## Formato de Exportación

### Excel
```
Archivo: reporte-colocacion-2024-01-01-2024-01-31.xlsx

Estructura:
- Hoja 1: "Reporte Colocación"
- Columnas con encabezados
- Datos de préstamos
- Fila final con totales
```

### PDF
```
Archivo: reporte-colocacion-2024-01-01-2024-01-31.pdf

Estructura:
- Logo: FINANZIA (centrado)
- Título: "Reporte de Colocación de Préstamos"
- Subtítulo: "Correspondiente al periodo del DD/MM/YYYY al DD/MM/YYYY"
- Fecha de generación
- Tabla con todos los datos
- Fila de totales resaltada en color
```

## Integración con Backend

El componente espera que el backend soporte el siguiente endpoint:

### Endpoint Requerido

```
GET /api/prestamos
```

### Parámetros de Query

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| fechaDesde | string | Sí | Formato YYYY-MM-DD |
| fechaHasta | string | Sí | Formato YYYY-MM-DD |
| lineaCreditoId | number | No | ID de línea de crédito |
| tipoCreditoId | number | No | ID de tipo de crédito |

### Respuesta Esperada

```typescript
// Array de préstamos con la siguiente estructura
[
  {
    id: number,
    numeroCredito: string,
    persona: {
      nombre: string,
      apellido: string,
      numeroDui: string
    },
    tipoCredito: {
      nombre: string,
      lineaCredito: {
        nombre: string
      }
    },
    montoDesembolsado: number,
    tasaInteres: number,
    numeroCuotas: number,
    periodicidadPago: string,
    saldoCapital: number,
    fechaOtorgamiento: string,
    fechaVencimiento: string
  }
]
```

### Nota Importante

Si el backend actual no filtra por fechas de otorgamiento, será necesario implementar esta funcionalidad. Alternativamente, el filtrado puede hacerse en el frontend, pero no es lo recomendado para grandes volúmenes de datos.

## Consideraciones de Backend

### Opción 1: Backend ya soporta filtros de fecha
✅ El reporte funcionará de inmediato

### Opción 2: Backend no soporta filtros de fecha
⚠️ Necesitas modificar el backend para agregar estos filtros:

```typescript
// En el controlador de préstamos (NestJS)
@Get()
async findAll(
  @Query('fechaDesde') fechaDesde?: string,
  @Query('fechaHasta') fechaHasta?: string,
  @Query('lineaCreditoId') lineaCreditoId?: number,
  @Query('tipoCreditoId') tipoCreditoId?: number,
) {
  // Implementar filtrado por fechas de otorgamiento
}
```

## Personalización

### Cambiar el Logo del PDF

1. Coloca tu logo en: `src/assets/images/logo.png`
2. Convierte el logo a base64 (puedes usar: https://www.base64-image.de/)
3. Edita el método `exportarPDF()` en el componente:

```typescript
// Agregar después de crear el doc
const logoBase64 = 'data:image/png;base64,...';
doc.addImage(logoBase64, 'PNG', 15, 10, 30, 20);
```

### Modificar Columnas Visibles

Edita el array `columnasVisibles` en el componente:

```typescript
columnasVisibles = [
  'numeroCredito',
  'nombreCliente',
  // Agregar o quitar columnas según necesidad
];
```

### Cambiar Colores

Los colores están definidos en los estilos del componente. Busca las secciones:
- `.summary-item.primary`: Color para total desembolsado
- `.summary-item.accent`: Color para saldo total
- `headStyles`: Color de encabezados de tabla en PDF

## Responsive Breakpoints

El componente se adapta a:
- **Desktop** (>960px): Grid multi-columna, botones horizontales
- **Tablet** (600px-960px): Grid adaptativo
- **Mobile** (<600px): Columnas apiladas verticalmente, tabla con scroll

## Testing

### Test Manual Básico

1. ✅ Acceder a la ruta `/creditos/reportes/colocacion`
2. ✅ Verificar que el formulario carga con fechas del mes actual
3. ✅ Seleccionar fechas y generar reporte
4. ✅ Verificar que la tabla muestra datos correctos
5. ✅ Exportar a Excel y verificar contenido
6. ✅ Exportar a PDF y verificar formato
7. ✅ Probar filtros por línea y tipo de crédito
8. ✅ Verificar responsive en mobile/tablet
9. ✅ Probar paginación
10. ✅ Verificar botón "Limpiar Filtros"

### Estados a Probar

- Loading state: Spinner mientras carga
- Empty state: Mensaje cuando no hay datos
- Error state: Manejo de errores del backend
- Success state: Tabla con datos y totales correctos

## Troubleshooting

### Error: "No se encontraron préstamos"

**Causa**: El rango de fechas no tiene préstamos desembolsados o el backend no soporta filtros de fecha.

**Solución**:
1. Verificar que existen préstamos en el rango de fechas
2. Confirmar que el backend filtra por `fechaOtorgamiento`

### Error: "Error al cargar líneas de crédito"

**Causa**: Servicio de líneas de crédito no disponible.

**Solución**: Verificar que el endpoint `/api/lineas-credito` esté funcionando.

### Excel se descarga vacío

**Causa**: Datos del reporte están vacíos.

**Solución**: Generar reporte primero antes de exportar.

### PDF no se genera

**Causa**: Error en librería jsPDF.

**Solución**: Verificar que las dependencias se instalaron correctamente: `npm install jspdf jspdf-autotable`

## Próximos Pasos

### Recomendaciones de Mejora

1. **Agregar más filtros**:
   - Estado del préstamo (vigente, mora, cancelado)
   - Asesor asignado
   - Sucursal
   - Rango de montos

2. **Gráficos estadísticos**:
   - Distribución por línea de crédito
   - Distribución por tipo de crédito
   - Evolución mensual

3. **Comparación de periodos**:
   - Comparar con mes anterior
   - Comparar con año anterior

4. **Exportación adicional**:
   - CSV
   - JSON

5. **Programación automática**:
   - Reportes programados mensuales
   - Envío por correo

6. **Drill-down**:
   - Hacer clic en fila para ver detalle del préstamo

## Soporte

Para cualquier duda o mejora, contactar al equipo de desarrollo.

---

**Desarrollado siguiendo las mejores prácticas de Angular 17 y Material Design**

**Stack Tecnológico**:
- Angular 17
- Angular Material
- Reactive Forms
- Signals API
- TypeScript
- XLSX
- jsPDF
- Standalone Components
