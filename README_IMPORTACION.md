# IMPORTACIÓN DE DESEMBOLSOS - GUÍA RÁPIDA

## ARCHIVOS GENERADOS

| Archivo | Descripción | Acción |
|---------|-------------|--------|
| `importar_desembolsos.sql` | Script SQL principal | **EJECUTAR EN LA BD** |
| `verificar_importacion.sql` | Script de verificación | Ejecutar después de importar |
| `desembolsos_lista.json` | Datos procesados | Referencia |
| `RESUMEN_IMPORTACION.md` | Resumen ejecutivo | Leer primero |
| `INSTRUCCIONES_IMPORTACION.md` | Guía detallada | Para problemas |

---

## PROCESO EN 3 PASOS

### 1️⃣ PREPARACIÓN (5 min)

```sql
-- A. Verificar IDs de catálogos
SELECT id FROM tipo_credito WHERE codigo = 'EMP-MICROEMPRESA';      -- Esperado: 12
SELECT id FROM estado_solicitud WHERE codigo = 'APROBADA';          -- Esperado: 6
SELECT id FROM estado_prestamo WHERE codigo = 'VIGENTE';            -- Esperado: 1
SELECT id FROM estado_prestamo WHERE codigo = 'CANCELADO';          -- Esperado: 3
SELECT id FROM periodicidad_pago WHERE codigo = 'MENSUAL';          -- Esperado: 3

-- B. Verificar personas
SELECT COUNT(*) FROM persona WHERE id BETWEEN 1 AND 69;             -- Esperado: 69

-- C. Backup
-- mysqldump -u usuario -p base_datos > backup_antes_importacion.sql
```

**Si algún ID no coincide:** Editar `generar_sql_desembolsos.js` líneas 13-19 y regenerar con `node generar_sql_desembolsos.js`

### 2️⃣ IMPORTACIÓN (2 min)

```sql
-- Abrir: importar_desembolsos.sql

-- Descomentar líneas iniciales:
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;
START TRANSACTION;

-- Ejecutar todo el script

-- Verificar (ver paso 3)

-- Si todo OK, descomentar y ejecutar:
COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
SET AUTOCOMMIT = 1;
```

### 3️⃣ VERIFICACIÓN (3 min)

```bash
# Ejecutar script de verificación
mysql -u usuario -p base_datos < verificar_importacion.sql

# O copiar/pegar en tu cliente SQL
```

**Checks esperados:**
- ✓ 173 solicitudes creadas
- ✓ 173 préstamos creados
- ✓ 69 préstamos VIGENTES (uno por cliente)
- ✓ 104 préstamos CANCELADOS (desembolsos anteriores)
- ✓ Cada cliente tiene solo 1 préstamo VIGENTE
- ✓ El último desembolso de cada cliente está VIGENTE

---

## DATOS A IMPORTAR

```
📊 ESTADÍSTICAS
├── 69 clientes únicos
├── 173 desembolsos totales
├── $49,352.50 monto total
├── $285.27 monto promedio
├── $50 - $1,500 rango de montos
└── 2025-02-03 a 2026-01-23 rango de fechas

👥 DISTRIBUCIÓN
├── 42 clientes con múltiples desembolsos
└── 27 clientes con un solo desembolso

🏆 TOP 5 CLIENTES
├── 1. Olga Yanira Galicia (11 desembolsos)
├── 2. Sandra Gómez de Rivera (10 desembolsos)
├── 3. Deysi Emeli García (9 desembolsos)
├── 4. Norma Isabel Cácamo (8 desembolsos)
└── 5. Karen Yaneth Chachagua (6 desembolsos)
```

---

## REGLA DE MÚLTIPLES DESEMBOLSOS

Para clientes con más de un desembolso:

```
┌─────────────────────────────────────────────────┐
│ Cliente: Karen Chachagua (6 desembolsos)        │
├─────────────────────────────────────────────────┤
│ 1. 2025-02-03  $200  →  CANCELADO ❌          │
│ 2. 2025-05-15  $200  →  CANCELADO ❌          │
│ 3. 2025-06-12  $300  →  CANCELADO ❌          │
│ 4. 2025-09-02  $400  →  CANCELADO ❌          │
│ 5. 2025-11-08  $500  →  CANCELADO ❌          │
│ 6. 2026-01-05  $500  →  VIGENTE ✅ (último)   │
└─────────────────────────────────────────────────┘

RESULTADO: 1 préstamo activo, 5 cancelados
```

Esta regla se aplica automáticamente en el SQL.

---

## ESTRUCTURA GENERADA

Por cada desembolso se crea:

```
SOLICITUD (SOL-XXXXXX)
├── Estado: APROBADA
├── Tipo: Microcrédito (ID: 12)
├── Monto: [Monto del desembolso]
├── Plazo: 12 meses
├── Tasa: 120% anual
└── Fecha: [Fecha del desembolso]
    │
    └──> PRÉSTAMO (CRE-XXXXXX)
         ├── Estado: VIGENTE o CANCELADO
         ├── Fecha otorgamiento: [Fecha del desembolso]
         ├── Fecha vencimiento: [Fecha + 12 meses]
         ├── Interés total: [Monto × 120%]
         └── Cuota mensual: [(Monto + Interés) ÷ 12]
```

---

## TAREAS POST-IMPORTACIÓN

### CRÍTICO: Generar planes de pago

Los préstamos se crean SIN plan de pagos. Ejecutar:

```typescript
// Para cada préstamo importado
POST /api/desembolso/prestamo/:id/generar-plan-pago
```

O ejecutar un script masivo desde el backend.

### Actualizar saldos de préstamos cancelados

```sql
UPDATE prestamo
SET saldoCapital = 0,
    saldoInteres = 0,
    fechaCancelacion = fechaOtorgamiento,
    fechaUltimoPago = fechaOtorgamiento
WHERE estado = 'CANCELADO'
  AND numeroCredito LIKE 'CRE-%';
```

---

## SOLUCIÓN DE PROBLEMAS

### Error: Duplicate entry

```bash
# Editar generar_sql_desembolsos.js
# Ajustar línea: let solicitudCounter = 1000; (usar siguiente ID disponible)
node generar_sql_desembolsos.js
```

### Error: Foreign key personaId

```sql
-- Ver personas faltantes
SELECT id FROM (
    SELECT 1 as id UNION SELECT 2 UNION SELECT 3 -- ... hasta 69
) as ids_excel
WHERE id NOT IN (SELECT id FROM persona);
```

### Error: Foreign key tipoCreditoId

```sql
-- Ver ID real del tipo de crédito
SELECT id FROM tipo_credito WHERE codigo = 'EMP-MICROEMPRESA';
-- Actualizar CONFIG.TIPO_CREDITO_ID en generar_sql_desembolsos.js
```

---

## COMANDOS ÚTILES

### Regenerar SQL
```bash
cd C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO
node generar_sql_desembolsos.js
```

### Backup
```bash
mysqldump -u usuario -p base_datos > backup.sql
```

### Restaurar backup
```bash
mysql -u usuario -p base_datos < backup.sql
```

### Ver log de errores
```sql
SHOW ERRORS;
```

---

## CHECKLIST

Antes de ejecutar:
- [ ] Leí `RESUMEN_IMPORTACION.md`
- [ ] Verifiqué IDs de catálogos
- [ ] Verifiqué que existen todas las personas
- [ ] Hice backup de la BD
- [ ] Revisé el archivo `importar_desembolsos.sql`

Durante la ejecución:
- [ ] Descomentarías líneas de transacción
- [ ] Ejecuté el script completo
- [ ] Ejecuté `verificar_importacion.sql`
- [ ] Todos los checks pasaron ✓

Después de importar:
- [ ] Hice COMMIT
- [ ] Generé planes de pago
- [ ] Actualicé saldos de cancelados
- [ ] Verifiqué integridad final

---

## CONTACTO

Para problemas:
1. Revisar `INSTRUCCIONES_IMPORTACION.md` (guía detallada)
2. Ejecutar `verificar_importacion.sql`
3. Hacer ROLLBACK si algo falla
4. Ajustar configuración y reintentar

---

## RESULTADO ESPERADO

Después de la importación exitosa:

```
✓ 173 solicitudes aprobadas
✓ 173 préstamos creados
✓ 69 préstamos VIGENTES (uno por cliente)
✓ 104 préstamos CANCELADOS (históricos)
✓ $49,352.50 capital activo
✓ Regla de múltiples desembolsos aplicada correctamente
```

---

**SIGUIENTE PASO:** Leer `RESUMEN_IMPORTACION.md` para comenzar
