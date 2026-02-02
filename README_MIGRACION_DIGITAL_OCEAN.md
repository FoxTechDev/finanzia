# Guía de Migración de Datos a Digital Ocean MySQL

## Sistema FINANZIA - Microfinanzas

Esta guía detalla el proceso completo para importar todos los datos del sistema FINANZIA a la base de datos MySQL en Digital Ocean.

---

## 📋 Tabla de Contenidos

1. [Prerrequisitos](#prerrequisitos)
2. [Estructura de Datos](#estructura-de-datos)
3. [Orden de Importación](#orden-de-importación)
4. [Scripts Generados](#scripts-generados)
5. [Proceso de Importación](#proceso-de-importación)
6. [Verificaciones Post-Importación](#verificaciones-post-importación)
7. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Prerrequisitos

### Base de Datos

- MySQL 8.0 o superior
- Base de datos `micro_app` creada
- Usuario con permisos completos (CREATE, INSERT, UPDATE, ALTER, etc.)

### Archivos Requeridos

Asegúrese de tener todos estos archivos en el mismo directorio:

```
C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\
├── 00_setup_base_mysql.sql               (NUEVO - Configuración base)
├── 01_insert_personas_mysql.sql          (EXISTENTE - 67 personas)
├── 02_insert_direcciones_mysql.sql       (EXISTENTE - 67 direcciones)
├── 03_insert_prestamos_mysql.sql         (EXISTENTE - 170 préstamos)
├── 04_insert_pagos_mysql.sql             (EXISTENTE - ~969 pagos)
├── 05_generate_solicitudes_mysql.sql     (NUEVO - 170 solicitudes)
├── 06_update_prestamos_add_solicitudes.sql (NUEVO - Vincular préstamos)
└── MASTER_import_digital_ocean_mysql.sql (NUEVO - Script maestro)
```

### Acceso a Digital Ocean

- IP del servidor de base de datos
- Puerto (generalmente 25060 para MySQL en Digital Ocean)
- Usuario y contraseña
- Conexión habilitada desde su IP (configurar en firewall de Digital Ocean)

---

## 📊 Estructura de Datos

### Datos a Importar

| Categoría | Cantidad | Descripción |
|-----------|----------|-------------|
| **Catálogos** | ~60 | Estados, tipos, clasificaciones |
| **Roles** | 5 | ADMIN, ASESOR, COMITE, CAJERO, GERENTE |
| **Líneas de Crédito** | 3 | MICRO, CONSUMO, VIVIENDA |
| **Tipos de Crédito** | 3 | Microcrédito semanal/mensual, Consumo |
| **Personas** | 67 | Clientes del sistema |
| **Direcciones** | 67 | Una dirección por persona |
| **Solicitudes** | 170 | Generadas automáticamente |
| **Préstamos** | 170 | Préstamos desembolsados |
| **Pagos** | ~969 | Historial de pagos |
| **TOTAL** | **~1,514** | Registros totales |

### Relaciones de Datos

```
Persona (67)
   ├── Direccion (67) [1:1]
   ├── Solicitud (170) [1:N]
   │     └── Prestamo (170) [1:1]
   │           └── Pago (~969) [1:N]
   └── Actividad Económica [futuro]
```

---

## 🔄 Orden de Importación

**IMPORTANTE:** El orden es crítico debido a las relaciones de foreign keys.

### Fase 1: Configuración Base
1. **Catálogos** (estados, tipos, clasificaciones)
2. **Roles del sistema**
3. **Líneas y tipos de crédito**
4. **Usuario administrador inicial**

### Fase 2: Datos de Clientes
5. **Personas** (clientes)
6. **Direcciones** (vinculadas a personas)

### Fase 3: Operaciones Crediticias
7. **Solicitudes** (generadas desde préstamos)
8. **Préstamos** (desembolsos)
9. **Vinculación** préstamo-solicitud
10. **Pagos** (historial de pagos)

---

## 📝 Scripts Generados

### 1. `00_setup_base_mysql.sql` (NUEVO)

**Propósito:** Configuración inicial de catálogos y datos maestros

**Contenido:**
- 14 catálogos básicos (estados, tipos, clasificaciones)
- 5 roles del sistema
- 3 líneas de crédito
- 3 tipos de crédito predefinidos
- 1 usuario administrador inicial

**Tiempo estimado:** 10-20 segundos

### 2. `05_generate_solicitudes_mysql.sql` (NUEVO - INCOMPLETO)

**Propósito:** Generar solicitudes basadas en préstamos existentes

**Estado:** Contiene solo 5 solicitudes de ejemplo

**ACCIÓN REQUERIDA:** Debe completarse con las 170 solicitudes

**Opciones para completar:**
- Ver sección [Generación de Solicitudes Completas](#generación-de-solicitudes-completas)

### 3. `06_update_prestamos_add_solicitudes.sql` (NUEVO)

**Propósito:** Vincular cada préstamo con su solicitud correspondiente

**Estrategia:** Relación 1:1 donde `prestamo.solicitudId = solicitud.id`

**Tiempo estimado:** 5 segundos

### 4. `MASTER_import_digital_ocean_mysql.sql` (NUEVO)

**Propósito:** Script maestro que ejecuta todos los demás en orden

**Características:**
- Ejecuta todos los scripts en secuencia
- Muestra progreso paso a paso
- Genera reporte de verificación final
- Calcula estadísticas de cartera

**Tiempo estimado total:** 2-5 minutos

---

## 🚀 Proceso de Importación

### Opción A: Ejecución Automática (Recomendada)

#### Desde línea de comandos MySQL:

```bash
mysql -h <HOST_DIGITAL_OCEAN> \
      -P 25060 \
      -u <USUARIO> \
      -p \
      --ssl-mode=REQUIRED \
      micro_app < MASTER_import_digital_ocean_mysql.sql
```

#### Desde MySQL Workbench:

1. Conectar a Digital Ocean MySQL
2. Abrir `MASTER_import_digital_ocean_mysql.sql`
3. Ejecutar el script completo (⚡ Run)
4. Revisar salida en consola

### Opción B: Ejecución Manual (Paso a Paso)

Si prefiere control total sobre cada fase:

```bash
# 1. Configuración base
mysql -h <HOST> -P 25060 -u <USER> -p micro_app < 00_setup_base_mysql.sql

# 2. Personas
mysql -h <HOST> -P 25060 -u <USER> -p micro_app < 01_insert_personas_mysql.sql

# 3. Direcciones
mysql -h <HOST> -P 25060 -u <USER> -p micro_app < 02_insert_direcciones_mysql.sql

# 4. Solicitudes (después de completar el archivo)
mysql -h <HOST> -P 25060 -u <USER> -p micro_app < 05_generate_solicitudes_mysql.sql

# 5. Préstamos
mysql -h <HOST> -P 25060 -u <USER> -p micro_app < 03_insert_prestamos_mysql.sql

# 6. Vincular préstamos con solicitudes
mysql -h <HOST> -P 25060 -u <USER> -p micro_app < 06_update_prestamos_add_solicitudes.sql

# 7. Pagos
mysql -h <HOST> -P 25060 -u <USER> -p micro_app < 04_insert_pagos_mysql.sql
```

---

## ⚠️ Generación de Solicitudes Completas

El archivo `05_generate_solicitudes_mysql.sql` **contiene solo 5 solicitudes de ejemplo**. Necesita completarse con las 170 solicitudes.

### Opción 1: Script Python Generador (Recomendado)

Crear archivo `generate_solicitudes.py`:

```python
#!/usr/bin/env python3
"""
Generador de solicitudes SQL para FINANZIA
Genera 170 solicitudes basadas en el archivo de préstamos
"""

import re
from datetime import datetime, timedelta

# Leer archivo de préstamos
with open('03_insert_prestamos_mysql.sql', 'r', encoding='utf-8') as f:
    prestamos_content = f.read()

# Extraer datos de cada préstamo usando regex
prestamo_pattern = r"VALUES \(\s*(\d+),\s*NULL,\s*(\d+),\s*'([^']+)',\s*(\d+),\s*([0-9.]+),\s*[0-9.]+,\s*(\d+),\s*([0-9.]+),[^']*'([^']+)',[^']*'([^']+)'[^']*'VIGENTE'|'CANCELADO'|'MORA'"

matches = re.findall(prestamo_pattern, prestamos_content)

# Generar SQL
sql_output = """-- =====================================================
-- SOLICITUDES COMPLETAS GENERADAS AUTOMÁTICAMENTE
-- Total: 170 solicitudes
-- =====================================================

USE micro_app;

SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;

SET @estadoDesembolsada = (SELECT id FROM estado_solicitud WHERE codigo = 'DESEMBOLSADA' LIMIT 1);
SET @lineaCreditoMicro = (SELECT id FROM linea_credito WHERE codigo = 'MICRO' LIMIT 1);

"""

for i, match in enumerate(matches, 1):
    prestamo_id, persona_id, numero_credito, tipo_credito_id, monto, plazo, tasa, fecha_otorg, periodicidad = match

    # Calcular fechas de solicitud (7 días antes)
    fecha_otorg_obj = datetime.strptime(fecha_otorg, '%Y-%m-%d')
    fecha_solicitud = (fecha_otorg_obj - timedelta(days=7)).strftime('%Y-%m-%d')
    fecha_aprobacion = (fecha_otorg_obj - timedelta(days=1)).strftime('%Y-%m-%d')

    # Generar número de solicitud
    numero_sol = f"SOL-2025-{i:06d}"

    sql_output += f"""
INSERT INTO solicitud (
    id, numeroSolicitud, personaId, lineaCreditoId, tipoCreditoId,
    montoSolicitado, plazoSolicitado, tasaInteresPropuesta,
    destinoCredito, estadoId,
    montoAprobado, plazoAprobado, tasaInteresAprobada,
    fechaSolicitud, fechaAprobacion,
    analistaId, nombreAnalista,
    observaciones, categoriaRiesgo
) VALUES (
    {prestamo_id}, '{numero_sol}', {persona_id}, @lineaCreditoMicro, {tipo_credito_id},
    {monto}, {plazo}, {tasa},
    'CAPITAL_TRABAJO', @estadoDesembolsada,
    {monto}, {plazo}, {tasa},
    '{fecha_solicitud}', '{fecha_aprobacion}',
    1, 'Sistema',
    'Solicitud generada automáticamente desde préstamo {numero_credito}', 'A'
);
"""

sql_output += """
COMMIT;
ALTER TABLE solicitud AUTO_INCREMENT = 171;

SET FOREIGN_KEY_CHECKS = 1;
SET AUTOCOMMIT = 1;

SELECT '✅ 170 solicitudes generadas exitosamente' AS 'Estado';
"""

# Guardar archivo
with open('05_generate_solicitudes_mysql.sql', 'w', encoding='utf-8') as f:
    f.write(sql_output)

print("✅ Archivo 05_generate_solicitudes_mysql.sql generado exitosamente")
print(f"📊 Total de solicitudes: {len(matches)}")
```

**Ejecutar:**
```bash
python generate_solicitudes.py
```

### Opción 2: Generación Manual

Si no puede usar Python, puede:

1. Usar Excel para generar los 170 registros
2. Copiar el patrón de las primeras 5 solicitudes
3. Usar fórmulas para auto-generar los valores

---

## ✅ Verificaciones Post-Importación

### 1. Verificar Integridad Referencial

```sql
USE micro_app;

-- Todas estas consultas deben devolver 0
SELECT COUNT(*) AS 'Direcciones sin persona'
FROM direccion d
LEFT JOIN persona p ON d.idPersona = p.idPersona
WHERE p.idPersona IS NULL;

SELECT COUNT(*) AS 'Préstamos sin solicitud'
FROM prestamo pr
WHERE pr.solicitudId IS NULL;

SELECT COUNT(*) AS 'Pagos sin préstamo'
FROM pago pg
LEFT JOIN prestamo pr ON pg.prestamoId = pr.id
WHERE pr.id IS NULL;
```

### 2. Verificar Conteos

```sql
SELECT 'Personas' AS Tabla, COUNT(*) AS Registros FROM persona
UNION ALL
SELECT 'Direcciones', COUNT(*) FROM direccion
UNION ALL
SELECT 'Solicitudes', COUNT(*) FROM solicitud
UNION ALL
SELECT 'Préstamos', COUNT(*) FROM prestamo
UNION ALL
SELECT 'Pagos', COUNT(*) FROM pago;

-- Resultado esperado:
-- Personas: 67
-- Direcciones: 67
-- Solicitudes: 170
-- Préstamos: 170
-- Pagos: ~969
```

### 3. Verificar Estadísticas de Cartera

```sql
SELECT
    estado,
    COUNT(*) AS cantidad,
    CONCAT('$', FORMAT(SUM(saldoCapital), 2)) AS saldo_capital
FROM prestamo
GROUP BY estado;
```

### 4. Probar Login en Aplicación

1. Acceder a la aplicación FINANZIA
2. Intentar login con:
   - Email: `admin@finanzia.com`
   - Password: (según configuración - ver nota abajo)
3. Verificar que se muestre el dashboard
4. Revisar listados de clientes, solicitudes y préstamos

---

## 🔐 Configuración de Seguridad Post-Importación

### 1. Actualizar Password de Administrador

El password en `00_setup_base_mysql.sql` es un placeholder. **Debe cambiarse:**

```sql
-- Generar nuevo hash bcrypt con Node.js
-- const bcrypt = require('bcrypt');
-- const hash = await bcrypt.hash('TuPasswordSeguro123!', 10);

UPDATE users
SET password = '$2b$10$[NUEVO_HASH_BCRYPT_AQUI]'
WHERE email = 'admin@finanzia.com';
```

### 2. Crear Usuarios Adicionales

```sql
-- Ejemplo: Asesor de negocio
SET @asesorRolId = (SELECT id FROM rol WHERE codigo = 'ASESOR');

INSERT INTO users (email, password, firstName, lastName, isActive, rolId)
VALUES (
    'asesor@finanzia.com',
    '$2b$10$[HASH_BCRYPT]',
    'Asesor',
    'Ejemplo',
    1,
    @asesorRolId
);
```

---

## 🆘 Solución de Problemas

### Error: "Table doesn't exist"

**Causa:** TypeORM no ha creado las tablas automáticamente

**Solución:**
```bash
# En el backend de la aplicación
cd micro-app/backend
npm run migration:run
```

### Error: "Foreign key constraint fails"

**Causa:** Datos importados en orden incorrecto

**Solución:**
1. Eliminar todos los datos: `TRUNCATE TABLE [tabla]`
2. Reiniciar importación en orden correcto
3. O usar `SET FOREIGN_KEY_CHECKS = 0;`

### Error: "Duplicate entry"

**Causa:** Datos ya importados previamente

**Solución:**
```sql
-- Verificar si hay datos
SELECT COUNT(*) FROM persona;

-- Si hay datos, decidir:
-- Opción A: Limpiar todo y reimportar
TRUNCATE TABLE pago;
TRUNCATE TABLE prestamo;
TRUNCATE TABLE solicitud;
TRUNCATE TABLE direccion;
TRUNCATE TABLE persona;

-- Opción B: Usar INSERT IGNORE en los scripts
-- (modificar scripts para usar INSERT IGNORE en lugar de INSERT)
```

### Préstamos sin Solicitud

**Verificar:**
```sql
SELECT COUNT(*) FROM prestamo WHERE solicitudId IS NULL;
```

**Solución:**
```sql
-- Ejecutar script de vinculación nuevamente
SOURCE 06_update_prestamos_add_solicitudes.sql;
```

### Solicitudes Incompletas

Si solo hay 5 solicitudes en lugar de 170:

**Causa:** No se completó el archivo `05_generate_solicitudes_mysql.sql`

**Solución:** Ver sección [Generación de Solicitudes Completas](#generación-de-solicitudes-completas)

---

## 📞 Soporte

Para problemas o dudas:

1. Revisar logs de MySQL en Digital Ocean
2. Verificar configuración de firewall (IP whitelisting)
3. Comprobar credenciales de acceso
4. Revisar que TypeORM esté configurado correctamente

---

## 📊 Resumen de Archivos

| Archivo | Tipo | Registros | Estado |
|---------|------|-----------|--------|
| `00_setup_base_mysql.sql` | ✨ NUEVO | ~80 | ✅ Completo |
| `01_insert_personas_mysql.sql` | 📦 EXISTENTE | 67 | ✅ Completo |
| `02_insert_direcciones_mysql.sql` | 📦 EXISTENTE | 67 | ✅ Completo |
| `03_insert_prestamos_mysql.sql` | 📦 EXISTENTE | 170 | ✅ Completo |
| `04_insert_pagos_mysql.sql` | 📦 EXISTENTE | 969 | ✅ Completo |
| `05_generate_solicitudes_mysql.sql` | ✨ NUEVO | 5/170 | ⚠️ INCOMPLETO |
| `06_update_prestamos_add_solicitudes.sql` | ✨ NUEVO | - | ✅ Completo |
| `MASTER_import_digital_ocean_mysql.sql` | ✨ NUEVO | - | ✅ Completo |

**ACCIÓN REQUERIDA:** Completar `05_generate_solicitudes_mysql.sql` con 170 solicitudes

---

## ✅ Checklist de Importación

- [ ] Verificar acceso a Digital Ocean MySQL
- [ ] Crear base de datos `micro_app` (si no existe)
- [ ] Completar archivo `05_generate_solicitudes_mysql.sql` (170 solicitudes)
- [ ] Ejecutar `MASTER_import_digital_ocean_mysql.sql`
- [ ] Verificar integridad referencial (0 errores)
- [ ] Verificar conteos de registros
- [ ] Actualizar password de administrador
- [ ] Probar login en aplicación
- [ ] Crear usuarios adicionales (asesores, comité, etc.)
- [ ] Configurar backups en Digital Ocean
- [ ] Documentar credenciales de forma segura

---

**Última actualización:** 2026-01-26
**Versión:** 1.0
**Sistema:** FINANZIA - Microfinanzas
