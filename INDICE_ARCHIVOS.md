# ÍNDICE DE ARCHIVOS GENERADOS - PROCESO ETL

**Ubicación:** `C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\`
**Fecha:** 2026-01-24

---

## ARCHIVOS PRINCIPALES - IMPORTACIÓN

### Datos JSON (para API o scripts)

| Archivo | Descripción | Registros |
|---------|-------------|-----------|
| `clientes_import.json` | Datos de personas/clientes listos para importar | 67 |
| `direcciones_import.json` | Direcciones de clientes | 67 |
| `prestamos_import.json` | Préstamos con términos completos | 170 |
| `pagos_import.json` | Histórico de pagos aplicados | 969 |

### Scripts SQL (para PostgreSQL)

| Archivo | Descripción | Uso |
|---------|-------------|-----|
| `01_insert_personas.sql` | INSERT de tabla persona | Ejecutar primero |
| `02_insert_direcciones.sql` | INSERT de tabla direccion | Ejecutar segundo |
| `03_insert_prestamos.sql` | INSERT de tabla prestamo | Ejecutar tercero |
| `04_insert_pagos.sql` | INSERT de tabla pago | Ejecutar cuarto |
| `import_all.sql` | Script completo (incluye todos los anteriores) | **RECOMENDADO** |
| `validar_importacion.sql` | Validación post-importación | Ejecutar después de importar |

---

## DOCUMENTACIÓN

### Guías de Usuario

| Archivo | Descripción | Para quién |
|---------|-------------|------------|
| `README_IMPORTACION.md` | **INICIO AQUÍ** - Guía paso a paso de importación | Usuarios finales |
| `RESUMEN_ETL.md` | Resumen ejecutivo completo del proceso | Gerentes/Administradores |
| `MAPEO_CAMPOS.md` | Mapeo detallado Excel → Base de datos | Desarrolladores/DBA |
| `INDICE_ARCHIVOS.md` | Este archivo - índice de todos los archivos | Todos |

### Reportes de Análisis

| Archivo | Descripción | Uso |
|---------|-------------|-----|
| `reporte_transformacion.json` | Estadísticas y errores del proceso ETL | Auditoría |
| `analisis_excel.json` | Análisis inicial de la estructura del Excel | Referencia técnica |
| `datos_crudos.json` | Datos sin procesar del Excel | Debugging |
| `excel_raw_data.json` | Datos en formato array de arrays | Debugging avanzado |

---

## SCRIPTS DE PROCESAMIENTO (Node.js)

### Scripts Principales

| Archivo | Descripción | Cuándo ejecutar |
|---------|-------------|-----------------|
| `transform-prestamos.js` | **SCRIPT PRINCIPAL** - Transforma Excel a JSON/SQL | Ya ejecutado |
| `generate-sql-import.js` | Genera scripts SQL desde JSON | Ya ejecutado |
| `analyze-excel-structure.js` | Analiza estructura del Excel | Para debugging |
| `process-excel.js` | Análisis inicial del Excel | Para debugging |

### Cómo re-ejecutar

```bash
# Re-generar todo desde cero
cd "C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO"
node transform-prestamos.js
node generate-sql-import.js
```

---

## FLUJO DE TRABAJO RECOMENDADO

### Para Importar Datos

1. **Leer primero:** `README_IMPORTACION.md`
2. **Verificar prerrequisitos** (catálogos en BD)
3. **Importar datos:** Ejecutar `import_all.sql`
4. **Validar:** Ejecutar `validar_importacion.sql`
5. **Completar datos faltantes** (DUIs, teléfonos, etc.)

### Para Entender el Proceso

1. **Resumen ejecutivo:** `RESUMEN_ETL.md`
2. **Mapeo técnico:** `MAPEO_CAMPOS.md`
3. **Estadísticas:** `reporte_transformacion.json`

### Para Debugging

1. **Ver datos originales:** `excel_raw_data.json`
2. **Ver análisis:** `analisis_excel.json`
3. **Re-ejecutar scripts:** `transform-prestamos.js`

---

## ESTADÍSTICAS RÁPIDAS

```
Clientes procesados:     67
Préstamos generados:     170
Pagos registrados:       969
Total desembolsado:      $48,702.50
Total pagado:            $45,209.30
Saldo pendiente:         $26,999.40
Errores encontrados:     0
```

---

## ARCHIVOS POR CATEGORÍA

### 📊 DATOS DE IMPORTACIÓN
- `clientes_import.json`
- `direcciones_import.json`
- `prestamos_import.json`
- `pagos_import.json`

### 🗄️ SCRIPTS SQL
- `01_insert_personas.sql`
- `02_insert_direcciones.sql`
- `03_insert_prestamos.sql`
- `04_insert_pagos.sql`
- `import_all.sql`
- `validar_importacion.sql`

### 📖 DOCUMENTACIÓN
- `README_IMPORTACION.md` ⭐ INICIO AQUÍ
- `RESUMEN_ETL.md`
- `MAPEO_CAMPOS.md`
- `INDICE_ARCHIVOS.md`

### 📈 REPORTES
- `reporte_transformacion.json`
- `analisis_excel.json`
- `datos_crudos.json`
- `excel_raw_data.json`

### 🔧 SCRIPTS DE PROCESAMIENTO
- `transform-prestamos.js` (Principal)
- `generate-sql-import.js`
- `analyze-excel-structure.js`
- `process-excel.js`

---

## NOTAS IMPORTANTES

### Datos Ficticios (REEMPLAZAR)

Todos los registros importados contienen:

- **DUIs ficticios** con formato `10000XXX-X`
- **Fechas de nacimiento** por defecto: `1990-01-01`
- **Sexo** por defecto: `Femenino`
- **Ubicación** por defecto: San Salvador

Estos datos DEBEN ser reemplazados con información real antes de usar en producción.

### Datos Calculados (VERIFICAR)

- **Tasas de interés:** 10% por defecto
- **Plazo:** 12 cuotas por defecto
- **Distribución de pagos:** 80% capital, 20% interés (aproximación)

Estos valores deben verificarse contra contratos reales.

---

## PRÓXIMOS PASOS

1. Ejecutar `README_IMPORTACION.md` paso a paso
2. Importar datos usando `import_all.sql`
3. Validar con `validar_importacion.sql`
4. Completar datos faltantes (DUIs, teléfonos, direcciones)
5. Verificar tasas y términos de préstamos
6. Recalcular distribución de pagos si es necesario

---

## SOPORTE

Si necesitas ayuda:

1. Consulta `README_IMPORTACION.md` - Sección "Solución de problemas"
2. Revisa `reporte_transformacion.json` para errores del proceso
3. Ejecuta `validar_importacion.sql` para identificar inconsistencias
4. Consulta `MAPEO_CAMPOS.md` para entender transformaciones

---

**Versión:** 1.0
**Última actualización:** 2026-01-24
**Archivos totales generados:** 18
