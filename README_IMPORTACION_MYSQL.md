# Importación de Datos a MySQL

## Archivos Generados

Los siguientes archivos SQL han sido convertidos de PostgreSQL a sintaxis MySQL:

1. **01_insert_personas_mysql.sql** - 67 registros de personas/clientes
2. **02_insert_direcciones_mysql.sql** - 67 registros de direcciones
3. **03_insert_prestamos_mysql.sql** - 170 registros de préstamos
4. **04_insert_pagos_mysql.sql** - 969 registros de pagos
5. **import_all_mysql.sql** - Script maestro de importación

**Total de registros:** 1,273

## Conversiones Aplicadas

Las siguientes transformaciones fueron aplicadas para garantizar compatibilidad con MySQL:

- ✓ Comillas dobles (`"columna"`) reemplazadas por backticks (`` `columna` ``)
- ✓ Comandos PostgreSQL específicos removidos (`SELECT setval(...)`)
- ✓ Sintaxis validada para MySQL 5.7+

## Configuración de Base de Datos

- **Base de datos:** micro_app
- **Servidor:** localhost:3306
- **Usuario:** root
- **Contraseña:** root

## Métodos de Importación

### Opción 1: Desde el Cliente MySQL (Recomendado)

```bash
mysql -u root -proot -h localhost -P 3306
```

Luego dentro del cliente MySQL:

```sql
USE micro_app;
SOURCE C:/Users/javie/OneDrive/Documentos/DESARROLLO/MICRO/import_all_mysql.sql;
```

**Nota:** En Windows, usar `/` (forward slash) en las rutas dentro de SOURCE.

### Opción 2: Desde Línea de Comandos

```bash
mysql -u root -proot -h localhost -P 3306 micro_app < import_all_mysql.sql
```

### Opción 3: Importación Individual

Si necesita importar las tablas individualmente:

```bash
# Personas
mysql -u root -proot micro_app < 01_insert_personas_mysql.sql

# Direcciones
mysql -u root -proot micro_app < 02_insert_direcciones_mysql.sql

# Préstamos
mysql -u root -proot micro_app < 03_insert_prestamos_mysql.sql

# Pagos
mysql -u root -proot micro_app < 04_insert_pagos_mysql.sql
```

## Orden de Importación

Es **crítico** mantener el siguiente orden para preservar la integridad referencial:

1. **Personas** - Tabla base sin dependencias
2. **Direcciones** - Depende de Personas (FK: `idPersona`)
3. **Préstamos** - Depende de Personas (FK: `personaId`)
4. **Pagos** - Depende de Préstamos (FK: `prestamoId`)

## Verificación Post-Importación

El script `import_all_mysql.sql` incluye verificaciones automáticas que mostrarán:

- Conteo de registros importados por tabla
- Verificación de integridad referencial
- Detección de registros huérfanos (si los hay)

Ejemplo de salida esperada:

```
=== RESUMEN DE IMPORTACIÓN ===
Tabla                      | Registros
---------------------------|----------
Personas importadas        | 67
Direcciones importadas     | 67
Préstamos importados       | 170
Pagos importados           | 969
---------------------------|----------
TOTAL DE REGISTROS         | 1273
```

## Estructura de Claves Primarias

- **persona:** `idPersona` (INT)
- **direccion:** `idDireccion` (INT)
- **prestamo:** `id` (INT)
- **pago:** `id` (INT)

## Optimizaciones Aplicadas

El script de importación incluye las siguientes optimizaciones para mejor rendimiento:

```sql
SET FOREIGN_KEY_CHECKS = 0;    -- Deshabilita verificación de FKs durante importación
SET AUTOCOMMIT = 0;            -- Agrupa inserts en una transacción
COMMIT;                        -- Confirma cambios por lotes
```

Estas se revierten automáticamente al final del script.

## Solución de Problemas

### Error: "Access denied for user 'root'@'localhost'"

Verifica tus credenciales MySQL:

```bash
mysql -u root -p
# Ingresa la contraseña cuando se solicite
```

### Error: "Unknown database 'micro_app'"

Crea la base de datos primero:

```sql
CREATE DATABASE micro_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Error: "Table doesn't exist"

Asegúrate de haber ejecutado el script de creación de tablas antes de importar los datos.

### Error: "Duplicate entry"

Las tablas deben estar vacías antes de importar. Para limpiar:

```sql
USE micro_app;
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE pago;
TRUNCATE TABLE prestamo;
TRUNCATE TABLE direccion;
TRUNCATE TABLE persona;
SET FOREIGN_KEY_CHECKS = 1;
```

## Tiempo Estimado de Importación

- **Personas:** < 1 segundo
- **Direcciones:** < 1 segundo
- **Préstamos:** < 5 segundos
- **Pagos:** < 10 segundos

**Total estimado:** ~15-20 segundos

## Contacto y Soporte

Si encuentras problemas durante la importación, verifica:

1. Versión de MySQL (requiere 5.7 o superior)
2. Permisos del usuario de base de datos
3. Esquema de tablas creado correctamente
4. Logs de errores de MySQL

---

**Generado por:** Sistema ETL de Conversión PostgreSQL → MySQL
**Fecha:** 2026-01-24
