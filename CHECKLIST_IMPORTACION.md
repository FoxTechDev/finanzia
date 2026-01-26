# Checklist de Importación MySQL

## Pre-requisitos

### 1. Verificar MySQL en Ejecución
```bash
mysql --version
```
**Resultado esperado:** MySQL versión 5.7 o superior

```bash
mysql -u root -p
```
**Resultado esperado:** Conexión exitosa al servidor MySQL

---

### 2. Verificar Base de Datos
```sql
SHOW DATABASES;
```
**Verificar que existe:** `micro_app`

**Si no existe, crear:**
```sql
CREATE DATABASE micro_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 3. Verificar Tablas Creadas
```sql
USE micro_app;
SHOW TABLES;
```

**Tablas requeridas:**
- ✓ persona
- ✓ direccion
- ✓ prestamo
- ✓ pago

**Verificar estructura de tablas:**
```sql
DESCRIBE persona;
DESCRIBE direccion;
DESCRIBE prestamo;
DESCRIBE pago;
```

**Verificar claves primarias:**
```sql
SHOW KEYS FROM persona WHERE Key_name = 'PRIMARY';     -- Debe ser: idPersona
SHOW KEYS FROM direccion WHERE Key_name = 'PRIMARY';   -- Debe ser: idDireccion
SHOW KEYS FROM prestamo WHERE Key_name = 'PRIMARY';    -- Debe ser: id
SHOW KEYS FROM pago WHERE Key_name = 'PRIMARY';        -- Debe ser: id
```

---

### 4. Verificar Tablas Vacías
```sql
SELECT 'persona' AS tabla, COUNT(*) AS registros FROM persona
UNION ALL
SELECT 'direccion', COUNT(*) FROM direccion
UNION ALL
SELECT 'prestamo', COUNT(*) FROM prestamo
UNION ALL
SELECT 'pago', COUNT(*) FROM pago;
```

**Resultado esperado:** Todas las tablas con 0 registros

**Si hay datos previos, limpiar:**
```sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE pago;
TRUNCATE TABLE prestamo;
TRUNCATE TABLE direccion;
TRUNCATE TABLE persona;
SET FOREIGN_KEY_CHECKS = 1;
```

---

### 5. Verificar Archivos SQL Generados
En el directorio `C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\`

- ✓ 01_insert_personas_mysql.sql (25 KB)
- ✓ 02_insert_direcciones_mysql.sql (12 KB)
- ✓ 03_insert_prestamos_mysql.sql (161 KB)
- ✓ 04_insert_pagos_mysql.sql (726 KB)
- ✓ import_all_mysql.sql (3.7 KB)
- ✓ importar_mysql.bat (1.8 KB)

---

## Proceso de Importación

### Método 1: Script Batch Automático (Recomendado)

1. Navegar al directorio:
   ```
   C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\
   ```

2. Doble clic en:
   ```
   importar_mysql.bat
   ```

3. Esperar a que complete (15-20 segundos)

4. Verificar mensaje de éxito

---

### Método 2: Cliente MySQL con SOURCE

1. Abrir cliente MySQL:
   ```bash
   mysql -u root -proot -h localhost -P 3306
   ```

2. Seleccionar base de datos:
   ```sql
   USE micro_app;
   ```

3. Ejecutar importación:
   ```sql
   SOURCE C:/Users/javie/OneDrive/Documentos/DESARROLLO/MICRO/import_all_mysql.sql;
   ```

4. Esperar a que complete

---

### Método 3: Línea de Comandos

1. Abrir terminal/CMD

2. Ejecutar:
   ```bash
   cd C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO
   mysql -u root -proot -h localhost -P 3306 micro_app < import_all_mysql.sql
   ```

3. Esperar a que complete

---

## Post-Importación: Verificación

### 1. Verificar Conteo de Registros
```sql
USE micro_app;

SELECT 'persona' AS tabla, COUNT(*) AS registros FROM persona
UNION ALL
SELECT 'direccion', COUNT(*) FROM direccion
UNION ALL
SELECT 'prestamo', COUNT(*) FROM prestamo
UNION ALL
SELECT 'pago', COUNT(*) FROM pago;
```

**Resultados esperados:**
| Tabla | Registros |
|-------|-----------|
| persona | 67 |
| direccion | 67 |
| prestamo | 170 |
| pago | 969 |
| **TOTAL** | **1,273** |

---

### 2. Verificar Integridad Referencial

**Direcciones huérfanas (debe ser 0):**
```sql
SELECT COUNT(*) AS direcciones_sin_persona
FROM direccion d
LEFT JOIN persona p ON d.`idPersona` = p.`idPersona`
WHERE p.`idPersona` IS NULL;
```

**Préstamos huérfanos (debe ser 0):**
```sql
SELECT COUNT(*) AS prestamos_sin_persona
FROM prestamo pr
LEFT JOIN persona p ON pr.`personaId` = p.`idPersona`
WHERE p.`idPersona` IS NULL;
```

**Pagos huérfanos (debe ser 0):**
```sql
SELECT COUNT(*) AS pagos_sin_prestamo
FROM pago pg
LEFT JOIN prestamo pr ON pg.`prestamoId` = pr.id
WHERE pr.id IS NULL;
```

**Todos deben retornar: 0**

---

### 3. Verificar Datos de Muestra

**Primera persona:**
```sql
SELECT * FROM persona WHERE `idPersona` = 1;
```
**Debe retornar:** Alexander Estanley Mejía Gutiérrez

**Primera dirección:**
```sql
SELECT * FROM direccion WHERE `idDireccion` = 1;
```
**Debe retornar:** Dirección para persona con idPersona = 1

**Primer préstamo:**
```sql
SELECT * FROM prestamo WHERE id = 1;
```
**Debe retornar:** Préstamo CRE2026000100 para personaId = 1

**Primer pago:**
```sql
SELECT * FROM pago WHERE id = 1;
```
**Debe retornar:** Pago PAG2026001001 para prestamoId = 1

---

### 4. Verificar Caracteres Especiales

```sql
SELECT nombre, apellido FROM persona WHERE nombre LIKE '%á%' OR apellido LIKE '%é%' LIMIT 5;
```
**Verificar que:** Acentos y caracteres especiales (á, é, í, ó, ú, ñ) se muestren correctamente

---

### 5. Verificar Relaciones

**Personas con sus direcciones:**
```sql
SELECT p.`idPersona`, p.nombre, p.apellido, COUNT(d.`idDireccion`) AS num_direcciones
FROM persona p
LEFT JOIN direccion d ON p.`idPersona` = d.`idPersona`
GROUP BY p.`idPersona`, p.nombre, p.apellido
LIMIT 10;
```

**Personas con sus préstamos:**
```sql
SELECT p.`idPersona`, p.nombre, p.apellido, COUNT(pr.id) AS num_prestamos
FROM persona p
LEFT JOIN prestamo pr ON p.`idPersona` = pr.`personaId`
GROUP BY p.`idPersona`, p.nombre, p.apellido
ORDER BY num_prestamos DESC
LIMIT 10;
```

**Préstamos con sus pagos:**
```sql
SELECT pr.id, pr.`numeroCredito`, COUNT(pg.id) AS num_pagos
FROM prestamo pr
LEFT JOIN pago pg ON pr.id = pg.`prestamoId`
GROUP BY pr.id, pr.`numeroCredito`
ORDER BY num_pagos DESC
LIMIT 10;
```

---

## Checklist Final

- [ ] MySQL está en ejecución
- [ ] Base de datos `micro_app` existe
- [ ] Tablas están creadas (persona, direccion, prestamo, pago)
- [ ] Tablas están vacías antes de importar
- [ ] Archivos SQL MySQL generados están disponibles
- [ ] Importación ejecutada sin errores
- [ ] Conteo de registros es correcto (1,273 total)
- [ ] Integridad referencial verificada (0 huérfanos)
- [ ] Datos de muestra verificados
- [ ] Caracteres especiales se muestran correctamente
- [ ] Relaciones entre tablas funcionan correctamente

---

## Solución de Problemas

### Error: "Access denied for user 'root'@'localhost'"
**Solución:** Verificar credenciales MySQL
```bash
mysql -u root -p
# Ingresar contraseña correcta
```

### Error: "Unknown database 'micro_app'"
**Solución:** Crear la base de datos
```sql
CREATE DATABASE micro_app;
```

### Error: "Table 'persona' doesn't exist"
**Solución:** Ejecutar script de creación de tablas antes de importar datos

### Error: "Duplicate entry '1' for key 'PRIMARY'"
**Solución:** Limpiar tablas antes de importar
```sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE pago;
TRUNCATE TABLE prestamo;
TRUNCATE TABLE direccion;
TRUNCATE TABLE persona;
SET FOREIGN_KEY_CHECKS = 1;
```

### Error: "Cannot add or update a child row: a foreign key constraint fails"
**Solución:** Verificar orden de importación. Debe ser: persona → direccion → prestamo → pago

### Caracteres especiales se ven mal (�)
**Solución:** Verificar codificación de la base de datos
```sql
ALTER DATABASE micro_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## Comandos Útiles

**Ver estructura de tabla:**
```sql
SHOW CREATE TABLE persona;
```

**Ver índices de tabla:**
```sql
SHOW INDEX FROM persona;
```

**Ver claves foráneas:**
```sql
SELECT
  TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'micro_app'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

**Ver tamaño de tablas:**
```sql
SELECT
  TABLE_NAME,
  ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Tamaño (MB)',
  TABLE_ROWS AS 'Registros'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'micro_app'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
```

---

## ✓ Importación Completada

Si todos los puntos del checklist están marcados, la importación ha sido exitosa.

**Total de registros importados:** 1,273
- Personas: 67
- Direcciones: 67
- Préstamos: 170
- Pagos: 969

Los datos están listos para usar en el sistema de créditos.

---

**Fecha:** 2026-01-24
**Base de datos:** micro_app
**Conversión:** PostgreSQL → MySQL
