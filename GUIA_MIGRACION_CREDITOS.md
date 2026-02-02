# GUÍA DE MIGRACIÓN - MÓDULO DE CRÉDITOS

Documentación completa para la migración de datos desde `prestamos.xlsx` al sistema de créditos FINANZIA.

## Fecha de Generación
26 de enero de 2026

## Resumen Ejecutivo

Esta migración extrae datos de un archivo Excel con formato matricial (fechas como columnas, clientes como filas) y los transforma en un modelo relacional normalizado para el sistema de créditos.

### Datos Procesados
- **67 clientes** únicos
- **170 préstamos** desembolsados
- **969 pagos** registrados
- **232 fechas** de transacciones (febrero 2025 - enero 2026)

---

## PARTE 1: PREREQUISITOS

### 1.1 Software Requerido
- MySQL 8.0 o superior
- Node.js 16+ (ya utilizado para generar los scripts)
- Acceso a la base de datos `micro_app`

### 1.2 Credenciales de Base de Datos
```
Host: localhost
Puerto: 3306
Usuario: root
Password: root
Base de datos: micro_app
```

### 1.3 Datos Base Requeridos

Antes de ejecutar la migración, deben existir:

1. **Personas (Clientes)**: 67 registros
   - Script: `01_insert_personas_mysql.sql`
   - Los IDs de persona deben coincidir con el orden de aparición en el Excel

2. **Catálogos del sistema**:
   - Estado de Solicitud
   - Estado de Préstamo
   - Estado de Pago
   - Tipo de Crédito
   - Línea de Crédito
   - Clasificación de Préstamo
   - Etc.

3. **Usuario Sistema**: Al menos un usuario con ID 1 para auditoría

---

## PARTE 2: VALIDACIÓN PRE-MIGRACIÓN

### 2.1 Ejecutar Script de Validación

```bash
mysql -u root -p micro_app < 00_validar_prerequisitos.sql
```

Este script verifica:
- Existencia de todos los catálogos necesarios
- Presencia de las 67 personas
- Líneas y tipos de crédito configurados
- Usuarios para auditoría

### 2.2 Revisión de Resultados

Todos los campos deben mostrar `✓`. Si alguno muestra `✗`:

1. **EstadoSolicitud**: Ejecutar seeds de catálogos
2. **LineaCredito**: Crear líneas de crédito básicas
3. **Personas**: Ejecutar `01_insert_personas_mysql.sql`
4. **Usuarios**: Crear usuario del sistema

---

## PARTE 3: ESTRUCTURA DEL EXCEL ORIGINAL

### 3.1 Formato de Datos

El archivo `prestamos.xlsx` tiene estructura matricial:

```
Fila 0: | Nombre | 2/3/25 | ... | 2/8/25 | ... |
Fila 1: |        | Desem. | Pago | Saldo | Desem. | Pago | Saldo | ...
Fila 2: | Cliente1 | 200 | 55 | 220 | 0 | 55 | 165 | ...
Fila 3: | Cliente2 | 200 | 55 | 220 | 0 | 0 | 220 | ...
```

**Interpretación**:
- Cada fecha tiene 3 columnas: Desembolso, Pago, Saldo
- **Desembolso > 0**: Crear nuevo préstamo
- **Pago > 0**: Registrar pago sobre préstamo activo
- **Saldo**: Saldo pendiente del cliente

---

## PARTE 4: TRANSFORMACIONES APLICADAS

### 4.1 Mapeo de Datos

#### Excel → Base de Datos

| Campo Excel | Tabla BD | Campo BD | Transformación |
|-------------|----------|----------|----------------|
| Nombre (Columna A) | persona | nombre, apellido | Buscar por coincidencia |
| Fecha (Fila 0) | prestamo, pago | fechaOtorgamiento, fechaPago | Convertir serial Excel a DATE |
| Desem. | prestamo | montoDesembolsado | parseFloat |
| Pago | pago | montoPagado | parseFloat |
| Saldo | prestamo | saldoCapital | parseFloat |

### 4.2 Cálculos Automáticos

Para cada préstamo:

```javascript
tasaInteres = 10% (flat)
totalInteres = montoDesembolsado * 0.10
totalPagar = montoDesembolsado + totalInteres
numeroCuotas = 4
cuotaNormal = totalPagar / 4
periodicidadPago = SEMANAL
fechaVencimiento = fechaOtorgamiento + 28 días
```

Para cada pago:

```javascript
capitalAplicado = montoPagado * 0.80
interesAplicado = montoPagado * 0.20
```

### 4.3 Lógica de Negocio

1. **Creación de Solicitudes**: Una solicitud por cada desembolso
2. **Estado de Solicitudes**: Todas en estado DESEMBOLSADA (ID 6)
3. **Estado de Préstamos**:
   - VIGENTE si saldoCapital > 0
   - CANCELADO si saldoCapital = 0
4. **Numeración**:
   - Solicitudes: SOL-000001, SOL-000002, ...
   - Préstamos: CRE-000001, CRE-000002, ...
   - Pagos: PAG-00000001, PAG-00000002, ...

---

## PARTE 5: EJECUCIÓN DE LA MIGRACIÓN

### 5.1 Opción A: Script Maestro (Recomendado)

```bash
cd C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO
mysql -u root -p micro_app < MASTER_import_from_excel.sql
```

Este script ejecuta en orden:
1. Solicitudes (170 registros)
2. Préstamos (170 registros)
3. Pagos (969 registros)

### 5.2 Opción B: Scripts Individuales

Si necesitas control granular:

```bash
# 1. Solicitudes
mysql -u root -p micro_app < 07_insert_solicitudes_from_excel.sql

# 2. Préstamos
mysql -u root -p micro_app < 08_insert_prestamos_from_excel.sql

# 3. Pagos
mysql -u root -p micro_app < 09_insert_pagos_from_excel.sql
```

### 5.3 Tiempo Estimado
- Solicitudes: ~5 segundos
- Préstamos: ~10 segundos
- Pagos: ~30 segundos
- **Total**: ~1 minuto

---

## PARTE 6: VALIDACIÓN POST-MIGRACIÓN

### 6.1 Ejecutar Script de Validación

```bash
mysql -u root -p micro_app < 10_validar_migracion_creditos.sql
```

### 6.2 Verificaciones Realizadas

El script valida:

1. **Integridad Referencial**:
   - Todas las foreign keys son válidas
   - No hay huérfanos (solicitudes sin persona, pagos sin préstamo)

2. **Consistencia de Datos**:
   - No hay montos negativos
   - Saldos no exceden totales
   - Estados son válidos

3. **Duplicados**:
   - Números de solicitud únicos
   - Números de crédito únicos
   - Números de pago únicos

4. **Análisis Financiero**:
   - Total desembolsado
   - Total pagado
   - Saldo pendiente
   - Distribución por cliente

### 6.3 Interpretación de Resultados

```
IntegridadReferencial: ✓
MontosValidos: ✓
SinDuplicados: ✓
TotalSolicitudes: 170
TotalPrestamos: 170
TotalPagos: 969
```

Si todos muestran `✓`, la migración fue **EXITOSA**.

---

## PARTE 7: VALORES POR DEFECTO APLICADOS

### 7.1 Configuración de Créditos

Todos los préstamos migrados usan:

| Campo | Valor |
|-------|-------|
| Línea de Crédito | ID 1 (Crédito Personal) |
| Tipo de Crédito | ID 1 (Crédito Personal) |
| Destino | CONSUMO_PERSONAL |
| Tasa de Interés | 10.00% |
| Tasa Moratoria | 5.00% |
| Tipo de Interés | FLAT |
| Periodicidad | SEMANAL |
| Plazo | 4 cuotas |
| Categoría NCB-022 | A (Normal) |

### 7.2 Auditoría

| Campo | Valor |
|-------|-------|
| Usuario Desembolso | ID 1 (Sistema) |
| Analista | ID 1 (Sistema) |
| Aprobador | ID 1 (Sistema) |

---

## PARTE 8: CASOS ESPECIALES Y ADVERTENCIAS

### 8.1 Múltiples Préstamos por Cliente

Los clientes pueden tener múltiples préstamos. El script los separa correctamente:

```
Cliente ID 1:
  - CRE-000001: $200.00 (2025-02-03)
  - CRE-000002: $250.00 (2025-03-01)
```

### 8.2 Préstamos con Múltiples Pagos

Los pagos se asocian al préstamo activo más reciente del cliente en esa fecha.

### 8.3 Saldos Iniciales

El saldo inicial de cada préstamo es `montoDesembolsado + totalInteres`. Los pagos posteriores reducen este saldo.

### 8.4 Fechas Futuras

El Excel contiene fechas hasta enero 2026. El script las procesa correctamente sin validaciones de fecha máxima.

---

## PARTE 9: RESOLUCIÓN DE PROBLEMAS

### 9.1 Error: "Cannot add or update a child row: a foreign key constraint fails"

**Causa**: Falta un registro referenciado (persona, tipo de crédito, etc.)

**Solución**:
1. Ejecutar `00_validar_prerequisitos.sql`
2. Identificar qué catálogo falta
3. Ejecutar seeds correspondientes

### 9.2 Error: "Duplicate entry for key 'numeroCredito'"

**Causa**: La tabla ya contiene préstamos

**Solución**:
```sql
-- Opción A: Limpiar tablas (CUIDADO: Borra todos los datos)
TRUNCATE TABLE pago;
TRUNCATE TABLE plan_pago;
TRUNCATE TABLE prestamo;
TRUNCATE TABLE solicitud;

-- Opción B: Ajustar IDs en los scripts SQL
-- Editar scripts y cambiar los IDs iniciales
```

### 9.3 Error: "Table doesn't exist"

**Causa**: La estructura de la BD no está creada

**Solución**:
```bash
# Ejecutar migraciones del backend
cd micro-app/backend
npm run migration:run
```

### 9.4 Diferencias en Saldos

**Causa**: La distribución 80/20 capital/interés es una estimación

**Solución**:
- Revisar manualmente los préstamos con diferencias significativas
- Ajustar la lógica de distribución si es necesario
- O recalcular plan de pagos después de la migración

---

## PARTE 10: SIGUIENTES PASOS

### 10.1 Tareas Inmediatas Post-Migración

1. **Generar Planes de Pago**:
   ```sql
   -- Ejecutar stored procedure o servicio del backend
   CALL generar_plan_pago_para_todos_los_prestamos();
   ```

2. **Recalcular Saldos**:
   ```sql
   -- Si hay discrepancias, recalcular desde pagos
   UPDATE prestamo pr SET saldoCapital = (
     SELECT pr.totalPagar - COALESCE(SUM(p.capitalAplicado), 0)
     FROM pago p
     WHERE p.prestamoId = pr.id AND p.estado = 'APLICADO'
   );
   ```

3. **Actualizar Días de Mora**:
   ```sql
   -- Calcular mora para préstamos vigentes
   UPDATE prestamo SET diasMora = DATEDIFF(CURDATE(), fechaVencimiento)
   WHERE estado = 'VIGENTE' AND fechaVencimiento < CURDATE();
   ```

### 10.2 Verificaciones en el Frontend

1. Acceder al módulo de Créditos
2. Revisar listado de solicitudes (deben ser 170)
3. Abrir detalle de un préstamo
4. Verificar historial de pagos
5. Comprobar cálculos de saldos

### 10.3 Pruebas de Integración

1. **Crear un nuevo préstamo manualmente** para verificar que los IDs no colisionan
2. **Registrar un nuevo pago** sobre un préstamo migrado
3. **Generar reportes** de cartera
4. **Exportar datos** para comparar con Excel original

---

## PARTE 11: CONTACTO Y SOPORTE

### 11.1 Archivos Generados

Todos los archivos están en:
```
C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\
```

Lista completa:
- `00_validar_prerequisitos.sql` - Validación pre-migración
- `07_insert_solicitudes_from_excel.sql` - 170 solicitudes
- `08_insert_prestamos_from_excel.sql` - 170 préstamos
- `09_insert_pagos_from_excel.sql` - 969 pagos
- `10_validar_migracion_creditos.sql` - Validación post-migración
- `MASTER_import_from_excel.sql` - Script maestro
- `REPORTE_TRANSFORMACION_EXCEL.md` - Reporte técnico
- `GUIA_MIGRACION_CREDITOS.md` - Este documento

### 11.2 Logs y Trazabilidad

Todos los registros migrados tienen:
```sql
observaciones = 'Solicitud/Pago migrado desde Excel'
nombreUsuarioDesembolso = 'Sistema'
createdAt = NOW()
```

Para identificar datos migrados:
```sql
SELECT * FROM prestamo WHERE nombreUsuarioDesembolso = 'Sistema';
SELECT * FROM pago WHERE observaciones LIKE '%migrado desde Excel%';
```

---

## APÉNDICE A: ESTRUCTURA DE DATOS

### Diagrama de Relaciones

```
persona (67 registros)
    ↓ (1:N)
solicitud (170 registros)
    ↓ (1:1)
prestamo (170 registros)
    ↓ (1:N)
pago (969 registros)
    ↓ (1:N)
pago_detalle_cuota (generado después)

prestamo
    ↓ (1:N)
plan_pago (generado después)
```

### Campos Calculados vs Importados

**Importados directamente del Excel**:
- montoDesembolsado
- fechaOtorgamiento
- montoPagado
- fechaPago
- saldoCapital

**Calculados automáticamente**:
- tasaInteres (10%)
- totalInteres
- totalPagar
- cuotaNormal
- fechaVencimiento
- capitalAplicado
- interesAplicado

---

## APÉNDICE B: CONSULTAS ÚTILES

### Buscar Cliente Específico

```sql
SELECT
  p.idPersona,
  CONCAT(p.nombre, ' ', p.apellido) AS Cliente,
  COUNT(pr.id) AS TotalPrestamos,
  SUM(pr.montoDesembolsado) AS MontoTotal,
  SUM(pr.saldoCapital) AS SaldoPendiente
FROM persona p
LEFT JOIN prestamo pr ON p.idPersona = pr.personaId
WHERE p.nombre LIKE '%Alexander%'
GROUP BY p.idPersona;
```

### Historial Completo de un Préstamo

```sql
SELECT
  pr.numeroCredito,
  pr.montoDesembolsado,
  pr.fechaOtorgamiento,
  pr.totalPagar,
  pr.saldoCapital,
  pg.numeroPago,
  pg.fechaPago,
  pg.montoPagado,
  pg.saldoCapitalPosterior
FROM prestamo pr
LEFT JOIN pago pg ON pr.id = pg.prestamoId
WHERE pr.numeroCredito = 'CRE-000001'
ORDER BY pg.fechaPago;
```

### Préstamos Cancelados vs Vigentes

```sql
SELECT
  estado,
  COUNT(*) AS Total,
  SUM(montoDesembolsado) AS MontoTotal,
  AVG(montoDesembolsado) AS MontoPromedio
FROM prestamo
GROUP BY estado;
```

---

## CHANGELOG

### Versión 1.0 - 26 de enero de 2026
- Generación inicial de scripts de migración
- 170 préstamos, 969 pagos procesados
- Validaciones pre y post-migración incluidas
- Documentación completa

---

**FIN DE LA GUÍA**

Para cualquier duda o ajuste necesario, revisar:
1. Reporte técnico: `REPORTE_TRANSFORMACION_EXCEL.md`
2. Análisis del Excel: `excel_analysis.json`
3. Logs de procesamiento: Salida de `generate_migration_sql.js`
