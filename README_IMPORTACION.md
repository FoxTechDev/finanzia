# GUÍA DE IMPORTACIÓN DE DATOS - SISTEMA DE MICROCRÉDITOS

Esta guía te ayudará a importar los datos procesados del archivo `prestamos.xlsx` al sistema de créditos.

---

## ARCHIVOS GENERADOS

### Datos Procesados (JSON)
- `clientes_import.json` - 67 clientes
- `direcciones_import.json` - 67 direcciones
- `prestamos_import.json` - 170 préstamos
- `pagos_import.json` - 969 pagos

### Scripts SQL
- `01_insert_personas.sql` - Importación de personas
- `02_insert_direcciones.sql` - Importación de direcciones
- `03_insert_prestamos.sql` - Importación de préstamos
- `04_insert_pagos.sql` - Importación de pagos
- `import_all.sql` - Script completo (todos juntos)
- `validar_importacion.sql` - Script de validación

### Documentación
- `RESUMEN_ETL.md` - Resumen ejecutivo completo
- `MAPEO_CAMPOS.md` - Documentación del mapeo de campos
- `reporte_transformacion.json` - Estadísticas del proceso

---

## OPCIÓN 1: IMPORTACIÓN MEDIANTE SQL (RECOMENDADO)

### Paso 1: Verificar prerrequisitos

Asegúrate de que existan los siguientes catálogos en la base de datos:

```sql
-- Verificar catálogos necesarios
SELECT * FROM tipo_credito WHERE id = 1;  -- Debe existir
SELECT * FROM departamento WHERE id = 6;  -- San Salvador
SELECT * FROM municipio WHERE id = 1;     -- San Salvador
SELECT * FROM distrito WHERE id = 1;      -- Distrito 1
```

Si no existen, créalos primero:

```sql
-- Ejemplo: crear tipo de crédito
INSERT INTO tipo_credito (id, nombre, descripcion)
VALUES (1, 'Crédito Personal', 'Crédito personal de microfinanzas');
```

### Paso 2: Conectar a la base de datos

```bash
# Windows (PowerShell o CMD)
psql -U tu_usuario -d nombre_base_datos

# Linux/Mac
psql -U tu_usuario -d nombre_base_datos
```

### Paso 3: Ejecutar el script de importación

**Opción A: Script completo (más rápido)**

```sql
\i C:/Users/javie/OneDrive/Documentos/DESARROLLO/MICRO/import_all.sql
```

**Opción B: Scripts individuales (más control)**

```sql
\i C:/Users/javie/OneDrive/Documentos/DESARROLLO/MICRO/01_insert_personas.sql
\i C:/Users/javie/OneDrive/Documentos/DESARROLLO/MICRO/02_insert_direcciones.sql
\i C:/Users/javie/OneDrive/Documentos/DESARROLLO/MICRO/03_insert_prestamos.sql
\i C:/Users/javie/OneDrive/Documentos/DESARROLLO/MICRO/04_insert_pagos.sql
```

### Paso 4: Validar la importación

```sql
\i C:/Users/javie/OneDrive/Documentos/DESARROLLO/MICRO/validar_importacion.sql
```

Este script mostrará:
- Conteo de registros importados
- Validación de integridad referencial
- Validación de montos
- Errores y advertencias

---

## OPCIÓN 2: IMPORTACIÓN MEDIANTE API (NESTJS)

### Paso 1: Crear endpoint de importación masiva

Agrega los siguientes endpoints al backend:

```typescript
// src/persona/persona.controller.ts
@Post('import/bulk')
async importBulk(@Body() personas: CreatePersonaDto[]) {
  return await this.personaService.createMany(personas);
}

// src/creditos/desembolso/prestamo.controller.ts
@Post('import/bulk')
async importBulk(@Body() prestamos: CreatePrestamoDto[]) {
  return await this.prestamoService.createMany(prestamos);
}

// src/creditos/pagos/pago.controller.ts
@Post('import/bulk')
async importBulk(@Body() pagos: CreatePagoDto[]) {
  return await this.pagoService.createMany(pagos);
}
```

### Paso 2: Implementar servicios de importación masiva

```typescript
// src/persona/persona.service.ts
async createMany(personas: CreatePersonaDto[]) {
  return await this.personaRepository.save(personas);
}
```

### Paso 3: Importar usando cURL o Postman

```bash
# Importar personas
curl -X POST http://localhost:3000/api/persona/import/bulk \
  -H "Content-Type: application/json" \
  -d @clientes_import.json

# Importar direcciones
curl -X POST http://localhost:3000/api/direccion/import/bulk \
  -H "Content-Type: application/json" \
  -d @direcciones_import.json

# Importar préstamos
curl -X POST http://localhost:3000/api/prestamo/import/bulk \
  -H "Content-Type: application/json" \
  -d @prestamos_import.json

# Importar pagos
curl -X POST http://localhost:3000/api/pago/import/bulk \
  -H "Content-Type: application/json" \
  -d @pagos_import.json
```

---

## OPCIÓN 3: IMPORTACIÓN MEDIANTE SCRIPT DE NODEJS

### Crear script de importación

```javascript
// import-data.js
const fs = require('fs');
const { DataSource } = require('typeorm');

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'tu_usuario',
  password: 'tu_password',
  database: 'nombre_base_datos',
  entities: ['dist/**/*.entity.js'],
});

async function importData() {
  await dataSource.initialize();

  // Importar personas
  const personas = JSON.parse(fs.readFileSync('clientes_import.json', 'utf8'));
  await dataSource.manager.save('Persona', personas);

  // Importar direcciones
  const direcciones = JSON.parse(fs.readFileSync('direcciones_import.json', 'utf8'));
  await dataSource.manager.save('Direccion', direcciones);

  // Importar préstamos
  const prestamos = JSON.parse(fs.readFileSync('prestamos_import.json', 'utf8'));
  await dataSource.manager.save('Prestamo', prestamos);

  // Importar pagos
  const pagos = JSON.parse(fs.readFileSync('pagos_import.json', 'utf8'));
  await dataSource.manager.save('Pago', pagos);

  await dataSource.destroy();
  console.log('Importación completada');
}

importData();
```

Ejecutar:

```bash
node import-data.js
```

---

## VERIFICACIÓN POST-IMPORTACIÓN

### 1. Verificar conteo de registros

```sql
SELECT
  (SELECT COUNT(*) FROM persona WHERE "numeroDui" LIKE '10000%') as personas,
  (SELECT COUNT(*) FROM prestamo WHERE "numeroCredito" LIKE 'CRE2026%') as prestamos,
  (SELECT COUNT(*) FROM pago WHERE "numeroPago" LIKE 'PAG2026%') as pagos;
```

**Resultado esperado:**
- Personas: 67
- Préstamos: 170
- Pagos: 969

### 2. Verificar montos

```sql
SELECT
  ROUND(SUM("montoDesembolsado")::numeric, 2) as total_desembolsado,
  ROUND(SUM("saldoCapital")::numeric, 2) as saldo_pendiente
FROM prestamo
WHERE "numeroCredito" LIKE 'CRE2026%';
```

**Resultado esperado:**
- Total desembolsado: $48,702.50
- Saldo pendiente: $26,999.40

### 3. Verificar total pagado

```sql
SELECT ROUND(SUM("montoPagado")::numeric, 2) as total_pagado
FROM pago
WHERE "numeroPago" LIKE 'PAG2026%';
```

**Resultado esperado:**
- Total pagado: $45,209.30

---

## TAREAS POST-IMPORTACIÓN

### CRÍTICO - Datos ficticios a reemplazar

1. **DUIs ficticios:** Todos los DUIs con formato `10000XXX-X` son ficticios y DEBEN reemplazarse con DUIs reales.

```sql
-- Listar personas con DUI ficticio
SELECT "idPersona", nombre, apellido, "numeroDui"
FROM persona
WHERE "numeroDui" LIKE '10000%'
ORDER BY "idPersona";
```

2. **Actualizar DUI de un cliente:**

```sql
UPDATE persona
SET "numeroDui" = '12345678-9'  -- DUI real
WHERE "idPersona" = 1;
```

### IMPORTANTE - Datos faltantes a completar

3. **Completar teléfonos:**

```sql
UPDATE persona
SET telefono = '7890-1234'
WHERE "idPersona" = 1;
```

4. **Completar emails:**

```sql
UPDATE persona
SET "correoElectronico" = 'cliente@example.com'
WHERE "idPersona" = 1;
```

5. **Actualizar fechas de nacimiento reales:**

```sql
UPDATE persona
SET "fechaNacimiento" = '1985-05-15'
WHERE "idPersona" = 1;
```

6. **Actualizar sexo correcto:**

```sql
UPDATE persona
SET sexo = 'Masculino'  -- o 'Femenino'
WHERE "idPersona" = 1;
```

7. **Completar direcciones:**

```sql
UPDATE direccion
SET "detalleDireccion" = 'Col. Escalón, Pasaje 5, Casa #123'
WHERE "idPersona" = 1;
```

### RECOMENDADO - Ajustes financieros

8. **Verificar y ajustar tasas de interés:**

```sql
-- Ver préstamos con tasa por defecto (10%)
SELECT id, "numeroCredito", "montoDesembolsado", "tasaInteres"
FROM prestamo
WHERE "numeroCredito" LIKE 'CRE2026%'
  AND "tasaInteres" = 0.10;

-- Actualizar tasa de un préstamo
UPDATE prestamo
SET "tasaInteres" = 0.12  -- 12% tasa real
WHERE id = 1;
```

9. **Recalcular totales si cambia la tasa:**

```sql
UPDATE prestamo
SET
  "totalInteres" = "montoDesembolsado" * "tasaInteres",
  "totalPagar" = "montoDesembolsado" + ("montoDesembolsado" * "tasaInteres"),
  "cuotaNormal" = ("montoDesembolsado" + ("montoDesembolsado" * "tasaInteres")) / "numeroCuotas"
WHERE id = 1;
```

---

## SOLUCIÓN DE PROBLEMAS

### Error: "solicitudId violates foreign key constraint"

**Problema:** El campo `solicitudId` en préstamos no tiene un registro correspondiente.

**Solución:** Los datos importados tienen `solicitudId = NULL`. Si tu base de datos requiere una solicitud, créala primero o modifica la constraint.

```sql
-- Opción 1: Permitir NULL temporalmente
ALTER TABLE prestamo ALTER COLUMN "solicitudId" DROP NOT NULL;

-- Opción 2: Crear solicitudes ficticias
INSERT INTO solicitud (id, "personaId", "montoSolicitado", "fechaSolicitud", estado)
SELECT
  pr.id,
  pr."personaId",
  pr."montoAutorizado",
  pr."fechaOtorgamiento",
  'APROBADA'
FROM prestamo pr
WHERE pr."numeroCredito" LIKE 'CRE2026%'
  AND pr."solicitudId" IS NULL;

-- Vincular préstamos con solicitudes
UPDATE prestamo pr
SET "solicitudId" = pr.id
WHERE pr."numeroCredito" LIKE 'CRE2026%'
  AND pr."solicitudId" IS NULL;
```

### Error: "duplicate key value violates unique constraint"

**Problema:** Ya existen registros con los mismos IDs.

**Solución:** Ajusta las secuencias o modifica los IDs antes de importar.

```sql
-- Ver ID máximo actual
SELECT MAX("idPersona") FROM persona;

-- Ajustar secuencia
SELECT setval('persona_"idPersona"_seq', 1000);

-- Ahora los nuevos registros comenzarán desde 1001
```

### Error: "tipo_credito con id 1 no existe"

**Problema:** Falta el catálogo de tipo de crédito.

**Solución:** Crear el tipo de crédito antes de importar préstamos.

```sql
INSERT INTO tipo_credito (id, nombre, descripcion, "tasaInteresMinima", "tasaInteresMaxima")
VALUES (1, 'Crédito Personal', 'Microcrédito personal', 0.08, 0.20);
```

---

## RESUMEN RÁPIDO

```bash
# 1. Conectar a la base de datos
psql -U usuario -d base_datos

# 2. Verificar catálogos (ver sección prerrequisitos)

# 3. Importar datos
\i import_all.sql

# 4. Validar importación
\i validar_importacion.sql

# 5. Completar datos faltantes (ver sección tareas)
```

---

## CONTACTO

Si encuentras problemas durante la importación:

1. Revisa el archivo `reporte_transformacion.json` para ver errores del proceso ETL
2. Ejecuta `validar_importacion.sql` para identificar inconsistencias
3. Consulta `RESUMEN_ETL.md` para detalles completos del proceso
4. Revisa `MAPEO_CAMPOS.md` para entender el mapeo de campos

---

**Última actualización:** 2026-01-24
**Versión:** 1.0
