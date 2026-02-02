# Esquema de Base de Datos - Ingresos y Gastos

## Diagrama de Relaciones

```
┌─────────────────────┐
│     PERSONA         │
│─────────────────────│
│ idPersona (PK)      │
│ nombre              │
│ apellido            │
│ ...                 │
└──────┬──────────────┘
       │
       │ 1:N
       ├──────────────────────────────────┐
       │                                  │
       │                                  │
       ▼                                  ▼
┌──────────────────┐              ┌──────────────────┐
│ GASTO_CLIENTE    │              │ INGRESO_CLIENTE  │
│──────────────────│              │──────────────────│
│ idGasto (PK)     │              │ idIngreso (PK)   │
│ idPersona (FK)   │              │ idPersona (FK)   │
│ idTipoGasto (FK) │              │ idTipoIngreso(FK)│
│ monto            │              │ monto            │
│ descripcion      │              │ descripcion      │
└────┬─────────────┘              └────┬─────────────┘
     │                                 │
     │ N:1                             │ N:1
     │                                 │
     ▼                                 ▼
┌──────────────────┐              ┌──────────────────┐
│   TIPO_GASTO     │              │  TIPO_INGRESO    │
│──────────────────│              │──────────────────│
│ idTipoGasto (PK) │              │ idTipoIngreso(PK)│
│ nombre (UNIQUE)  │              │ nombre (UNIQUE)  │
│ descripcion      │              │ descripcion      │
│ activo           │              │ activo           │
└──────────────────┘              └──────────────────┘

CATÁLOGOS (Valores iniciales)     CATÁLOGOS (Valores iniciales)
═══════════════════════════       ═══════════════════════════
1. Vivienda                        1. Salario Principal
2. Alimentación                    2. Ingresos Adicionales
3. Transporte                      3. Negocio Propio
4. Servicios Básicos               4. Remesas
5. Educación                       5. Alquileres
6. Gastos Médicos                  6. Otros
7. Otros
```

## Relaciones y Cardinalidad

### Persona → Gasto Cliente (1:N)
- Una persona puede tener múltiples gastos
- Un gasto pertenece a una sola persona
- **Eliminación en cascada**: Si se elimina la persona, se eliminan sus gastos

### Persona → Ingreso Cliente (1:N)
- Una persona puede tener múltiples ingresos
- Un ingreso pertenece a una sola persona
- **Eliminación en cascada**: Si se elimina la persona, se eliminan sus ingresos

### Tipo Gasto → Gasto Cliente (1:N)
- Un tipo de gasto puede estar asociado a múltiples gastos
- Un gasto pertenece a un solo tipo
- **Restricción de eliminación**: No se puede eliminar un tipo si está en uso

### Tipo Ingreso → Ingreso Cliente (1:N)
- Un tipo de ingreso puede estar asociado a múltiples ingresos
- Un ingreso pertenece a un solo tipo
- **Restricción de eliminación**: No se puede eliminar un tipo si está en uso

## Ejemplo de Datos

### Persona ID: 1 (Juan Pérez)

#### Ingresos
```
┌────────────┬──────────────────────┬────────────┬─────────────────────┐
│ ID Ingreso │ Tipo Ingreso         │ Monto      │ Descripción         │
├────────────┼──────────────────────┼────────────┼─────────────────────┤
│ 1          │ Salario Principal    │ $1,200.00  │ Salario mensual     │
│ 2          │ Negocio Propio       │   $500.00  │ Consultoría         │
│ 3          │ Alquileres           │   $300.00  │ Alquiler de casa    │
└────────────┴──────────────────────┴────────────┴─────────────────────┘
TOTAL INGRESOS: $2,000.00
```

#### Gastos
```
┌───────────┬─────────────────────┬───────────┬──────────────────────┐
│ ID Gasto  │ Tipo Gasto          │ Monto     │ Descripción          │
├───────────┼─────────────────────┼───────────┼──────────────────────┤
│ 1         │ Vivienda            │  $350.00  │ Alquiler mensual     │
│ 2         │ Alimentación        │  $200.00  │ Compras del mes      │
│ 3         │ Transporte          │   $75.00  │ Transporte público   │
│ 4         │ Servicios Básicos   │  $120.00  │ Luz, agua, internet  │
│ 5         │ Educación           │  $100.00  │ Colegio hijo         │
│ 6         │ Gastos Médicos      │   $50.00  │ Medicamentos         │
└───────────┴─────────────────────┴───────────┴──────────────────────┘
TOTAL GASTOS: $895.00
```

#### Análisis Financiero
```
╔════════════════════════════════════╗
║   RESUMEN FINANCIERO MENSUAL       ║
╠════════════════════════════════════╣
║ Total Ingresos:      $2,000.00     ║
║ Total Gastos:          $895.00     ║
║ ─────────────────────────────────  ║
║ CAPACIDAD DE PAGO:   $1,105.00     ║
╚════════════════════════════════════╝
```

## Índices de Base de Datos

### Tabla: gasto_cliente
```sql
INDEX IDX_gasto_cliente_persona (idPersona)
-- Mejora el rendimiento de consultas por persona
```

### Tabla: ingreso_cliente
```sql
INDEX IDX_ingreso_cliente_persona (idPersona)
-- Mejora el rendimiento de consultas por persona
```

### Tabla: tipo_gasto
```sql
UNIQUE INDEX nombre
-- Garantiza unicidad de nombres
```

### Tabla: tipo_ingreso
```sql
UNIQUE INDEX nombre
-- Garantiza unicidad de nombres
```

## Queries Comunes Optimizadas

### 1. Obtener todos los gastos de una persona con sus tipos
```sql
SELECT
  gc.idGasto,
  gc.monto,
  gc.descripcion,
  tg.nombre as tipoGasto
FROM gasto_cliente gc
INNER JOIN tipo_gasto tg ON gc.idTipoGasto = tg.idTipoGasto
WHERE gc.idPersona = 1
ORDER BY tg.nombre;
```

### 2. Calcular total de ingresos por persona
```sql
SELECT
  p.nombre,
  p.apellido,
  SUM(ic.monto) as totalIngresos
FROM persona p
LEFT JOIN ingreso_cliente ic ON p.idPersona = ic.idPersona
WHERE p.idPersona = 1
GROUP BY p.idPersona;
```

### 3. Obtener resumen financiero completo
```sql
SELECT
  p.idPersona,
  p.nombre,
  p.apellido,
  COALESCE(SUM(ic.monto), 0) as totalIngresos,
  COALESCE(SUM(gc.monto), 0) as totalGastos,
  COALESCE(SUM(ic.monto), 0) - COALESCE(SUM(gc.monto), 0) as capacidadPago
FROM persona p
LEFT JOIN ingreso_cliente ic ON p.idPersona = ic.idPersona
LEFT JOIN gasto_cliente gc ON p.idPersona = gc.idPersona
WHERE p.idPersona = 1
GROUP BY p.idPersona;
```

### 4. Gastos agrupados por tipo
```sql
SELECT
  tg.nombre as tipoGasto,
  COUNT(gc.idGasto) as cantidad,
  SUM(gc.monto) as totalMonto
FROM gasto_cliente gc
INNER JOIN tipo_gasto tg ON gc.idTipoGasto = tg.idTipoGasto
WHERE gc.idPersona = 1
GROUP BY tg.idTipoGasto
ORDER BY totalMonto DESC;
```

## Restricciones de Integridad

### Foreign Keys

#### gasto_cliente
```sql
CONSTRAINT FK_gasto_cliente_persona
  FOREIGN KEY (idPersona)
  REFERENCES persona(idPersona)
  ON DELETE CASCADE
  ON UPDATE CASCADE

CONSTRAINT FK_gasto_cliente_tipo_gasto
  FOREIGN KEY (idTipoGasto)
  REFERENCES tipo_gasto(idTipoGasto)
  ON DELETE RESTRICT
  ON UPDATE CASCADE
```

#### ingreso_cliente
```sql
CONSTRAINT FK_ingreso_cliente_persona
  FOREIGN KEY (idPersona)
  REFERENCES persona(idPersona)
  ON DELETE CASCADE
  ON UPDATE CASCADE

CONSTRAINT FK_ingreso_cliente_tipo_ingreso
  FOREIGN KEY (idTipoIngreso)
  REFERENCES tipo_ingreso(idTipoIngreso)
  ON DELETE RESTRICT
  ON UPDATE CASCADE
```

## Tipos de Datos

### Montos
- **gasto_cliente.monto**: `DECIMAL(10,2)` - Hasta 99,999,999.99
- **ingreso_cliente.monto**: `DECIMAL(14,2)` - Hasta 999,999,999,999.99

### Textos
- **nombre**: `VARCHAR(100)` - Nombres de catálogos
- **descripcion**: `TEXT` - Descripciones detalladas

### Booleanos
- **activo**: `BOOLEAN` - Estado del catálogo (default: true)

## Consideraciones de Diseño

### ✅ Ventajas

1. **Normalización**: Evita redundancia de datos
2. **Flexibilidad**: Fácil agregar nuevos tipos sin cambiar esquema
3. **Escalabilidad**: Múltiples registros por persona
4. **Trazabilidad**: Descripción opcional para cada registro
5. **Integridad**: Foreign keys garantizan consistencia

### ⚠️ Consideraciones

1. **Performance**: JOIN necesario para obtener datos completos
2. **Complejidad**: Más tablas que gestionar
3. **Migración**: Requiere migrar datos existentes

### 🎯 Optimizaciones Implementadas

1. **Índices**: En columnas de búsqueda frecuente
2. **Cascade Delete**: Limpieza automática de datos huérfanos
3. **Restrict Delete**: Previene eliminar catálogos en uso
4. **Valores por defecto**: Catálogos pre-poblados

## Comparación: Antes vs Después

### ANTES (Estructura Plana)
```
actividad_economica
├── gastosVivienda
├── gastosAlimentacion
├── gastosTransporte
├── gastosServiciosBasicos
├── gastosEducacion
├── gastosMedicos
├── otrosGastos
└── totalGastos (calculado)

❌ Un solo gasto de cada tipo
❌ Difícil agregar nuevos tipos
❌ Sin trazabilidad individual
```

### DESPUÉS (Estructura Relacional)
```
tipo_gasto (catálogo)
  ↓
gasto_cliente (múltiples registros)
  ↓
persona

✅ Múltiples gastos del mismo tipo
✅ Nuevos tipos sin cambiar esquema
✅ Descripción por cada gasto
✅ Historial completo
```

## Migración de Datos Existentes

Si hay datos en el sistema anterior, usar este script:

```sql
-- Migrar gastos de vivienda
INSERT INTO gasto_cliente (idPersona, idTipoGasto, monto, descripcion)
SELECT idPersona, 1, gastosVivienda, 'Migrado del sistema anterior'
FROM actividad_economica
WHERE gastosVivienda IS NOT NULL AND gastosVivienda > 0;

-- Repetir para cada tipo de gasto...
```

## Respaldo Antes de Migrar

```bash
# Backup de la base de datos
mysqldump -u root -p finanzia_db > backup_before_migration.sql

# Ejecutar migración
npm run migration:run

# Si algo sale mal, restaurar
mysql -u root -p finanzia_db < backup_before_migration.sql
```
