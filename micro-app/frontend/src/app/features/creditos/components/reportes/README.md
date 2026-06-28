# Componentes de Reportes del Módulo de Créditos

Este directorio contiene los componentes para generación de reportes del módulo de créditos con capacidad de filtrado y exportación.

---

## 1. Reporte de Colocación de Créditos

**Ruta**: `/creditos/reportes/colocacion`

**Componente**: `ReporteColocacionComponent`

### Filtros
- Fecha Desde (requerido)
- Fecha Hasta (requerido)
- Línea de Crédito (opcional)
- Tipo de Crédito (opcional)

### Columnas
No. Préstamo, Cliente, Línea, Tipo, Monto Desembolsado, Tasa, Plazo, Periodicidad, Saldo Capital, F. Otorgamiento, F. Vencimiento

### Totales
- Total de préstamos
- Total desembolsado
- Saldo total de capital

---

## 2. Reporte de Pagos

**Ruta**: `/creditos/reportes/pagos`

**Componente**: `ReportePagosComponent`

### Filtros
- Fecha Desde (requerido)
- Fecha Hasta (requerido)
- Estado de Pago (opcional)

### Columnas
Fecha, No. Préstamo, Cliente, Línea, Tipo, Monto Pagado, Distribución (Capital, Interés, Recargos, Mora), Saldo Anterior, Saldo Nuevo

### Totales
- Total de pagos
- Total monto pagado
- Total capital aplicado
- Total interés aplicado

---

## 3. Detalle de Cartera de Préstamos

**Ruta**: `/creditos/reportes/cartera`

**Componente**: `ReporteCarteraComponent`

### Filtros
- Fecha de Corte (requerido): Fecha para el cálculo del estado de la cartera

### Columnas (16 columnas)
1. numeroCredito
2. nombreCliente
3. lineaCredito
4. tipoCredito
5. fechaOtorgamiento
6. fechaVencimiento
7. monto
8. plazo (meses)
9. tasaInteres
10. cuotaTotal
11. numeroCuotas
12. saldoCapital
13. saldoInteres
14. cuotasAtrasadas
15. capitalMora
16. interesMora

### Totales
- Total de préstamos
- Total monto
- Total saldo capital
- Total saldo interés
- Total capital en mora
- Total interés en mora

### Backend Endpoint
```
GET /api/reportes/cartera?fechaCorte=YYYY-MM-DD
```

### Características Especiales
- Resaltado visual de cuotas atrasadas y montos en mora
- Badge con la fecha de corte en los resultados
- Exportación completa de las 16 columnas a Excel y PDF
- Diseño optimizado para tablas amplias (landscape en PDF)

---

## Características Comunes

### Roles Permitidos
- ADMIN
- COMITE
- ASESOR (solo para Reporte de Colocación)

### Exportación

#### Excel (xlsx)
- Todas las columnas incluidas
- Fila de totales al final
- Formato numérico para montos
- Nombres de archivo descriptivos

#### PDF
- Formato landscape para mejor visualización
- Encabezado con logo FINANZIA
- Título del reporte
- Periodo/Fecha de corte
- Fecha de generación
- Tabla con todos los datos
- Fila de totales resaltada

### Responsive Design
- Desktop: Grid multi-columna
- Tablet: Grid adaptativo
- Mobile: Stack vertical, scroll horizontal en tablas

### Paginación
- Tamaño por defecto: 10 registros
- Opciones: 10, 25, 50, 100
- Navegación completa (first/last)

## Dependencias

```json
{
  "xlsx": "^0.18.5",
  "jspdf": "^4.0.0",
  "jspdf-autotable": "^5.0.7"
}
```

## Servicio

**Archivo**: `reporte.service.ts`

### Métodos Disponibles

```typescript
getReporteColocacion(filtros: FiltrosReporteColocacion): Observable<DatosReporteColocacion[]>
getReportePagos(filtros: FiltrosReportePagos): Observable<DatosReportePagos[]>
getReporteCartera(fechaCorte: string): Observable<DatosReporteCartera[]>
```

## Navegación

Los reportes están accesibles desde el menú lateral en la sección "Reportes":

```html
<mat-expansion-panel>
  <mat-expansion-panel-header>
    <mat-icon>assessment</mat-icon>
    <span>Reportes</span>
  </mat-expansion-panel-header>
  <mat-nav-list>
    <a routerLink="/creditos/reportes/colocacion">Colocación de Créditos</a>
    <a routerLink="/creditos/reportes/pagos">Reporte de Pagos</a>
    <a routerLink="/creditos/reportes/cartera">Detalle de Cartera</a>
  </mat-nav-list>
</mat-expansion-panel>
```

## Stack Tecnológico

- Angular 17+
- Angular Material
- Reactive Forms
- Standalone Components
- Signals API
- TypeScript 5.2+

## Mejoras Futuras

- [ ] Gráficos estadísticos (charts)
- [ ] Comparación entre periodos
- [ ] Exportación a CSV
- [ ] Reportes programados
- [ ] Envío automático por email
- [ ] Más filtros avanzados
- [ ] Drill-down en los datos
