# Reestructuración de Ingresos y Gastos - Documentación

## Resumen de Cambios

Se ha reestructurado la forma en que se almacenan los ingresos y gastos de los clientes, pasando de columnas individuales a tablas relacionales con catálogos.

## Estructura Anterior

### Tabla `actividad_economica`
- Campos de gastos como columnas individuales:
  - `gastosVivienda`
  - `gastosAlimentacion`
  - `gastosTransporte`
  - `gastosServiciosBasicos`
  - `gastosEducacion`
  - `gastosMedicos`
  - `otrosGastos`
  - `totalGastos`
- Campos de ingresos adicionales:
  - `ingresosAdicionales`
  - `descripcionIngresosAdicionales`

### Tabla `direccion`
- `tiempoResidenciaMeses` (eliminado)
- `montoAlquiler` (eliminado)

## Nueva Estructura

### 1. Catálogo de Tipos de Gasto (`tipo_gasto`)

**Campos:**
- `idTipoGasto` (PK)
- `nombre` (único)
- `descripcion`
- `activo`

**Valores por defecto:**
1. Vivienda
2. Alimentación
3. Transporte
4. Servicios Básicos
5. Educación
6. Gastos Médicos
7. Otros

### 2. Catálogo de Tipos de Ingreso (`tipo_ingreso`)

**Campos:**
- `idTipoIngreso` (PK)
- `nombre` (único)
- `descripcion`
- `activo`

**Valores por defecto:**
1. Salario Principal
2. Ingresos Adicionales
3. Negocio Propio
4. Remesas
5. Alquileres
6. Otros

### 3. Gastos del Cliente (`gasto_cliente`)

**Campos:**
- `idGasto` (PK)
- `idPersona` (FK → persona)
- `idTipoGasto` (FK → tipo_gasto)
- `monto` (decimal)
- `descripcion` (opcional)

**Relaciones:**
- Un cliente puede tener múltiples gastos
- Cada gasto pertenece a un tipo de gasto

### 4. Ingresos del Cliente (`ingreso_cliente`)

**Campos:**
- `idIngreso` (PK)
- `idPersona` (FK → persona)
- `idTipoIngreso` (FK → tipo_ingreso)
- `monto` (decimal)
- `descripcion` (opcional)

**Relaciones:**
- Un cliente puede tener múltiples ingresos
- Cada ingreso pertenece a un tipo de ingreso

## Endpoints API

### Tipos de Gasto (`/tipo-gasto`)

#### Obtener todos los tipos de gasto
```http
GET /tipo-gasto
```

#### Obtener solo tipos activos
```http
GET /tipo-gasto/activos
```

#### Obtener un tipo de gasto
```http
GET /tipo-gasto/:id
```

#### Crear tipo de gasto
```http
POST /tipo-gasto
Content-Type: application/json

{
  "nombre": "Entretenimiento",
  "descripcion": "Gastos en ocio y entretenimiento",
  "activo": true
}
```

#### Actualizar tipo de gasto
```http
PATCH /tipo-gasto/:id
Content-Type: application/json

{
  "nombre": "Entretenimiento y Ocio",
  "activo": false
}
```

#### Eliminar tipo de gasto
```http
DELETE /tipo-gasto/:id
```

### Tipos de Ingreso (`/tipo-ingreso`)

Los endpoints son análogos a los de tipos de gasto, reemplazando `/tipo-gasto` por `/tipo-ingreso`.

### Gastos del Cliente (`/gasto-cliente`)

#### Crear gasto
```http
POST /gasto-cliente
Content-Type: application/json

{
  "personaId": 1,
  "tipoGastoId": 1,
  "monto": 350.00,
  "descripcion": "Pago mensual de alquiler"
}
```

#### Obtener todos los gastos
```http
GET /gasto-cliente
```

#### Obtener gastos por cliente
```http
GET /gasto-cliente/persona/:personaId
```

O usando query parameter:
```http
GET /gasto-cliente?personaId=1
```

#### Obtener total de gastos de un cliente
```http
GET /gasto-cliente/persona/:personaId/total
```

Respuesta:
```json
1250.50
```

#### Obtener un gasto específico
```http
GET /gasto-cliente/:id
```

#### Actualizar gasto
```http
PATCH /gasto-cliente/:id
Content-Type: application/json

{
  "monto": 375.00,
  "descripcion": "Alquiler actualizado"
}
```

#### Eliminar gasto
```http
DELETE /gasto-cliente/:id
```

### Ingresos del Cliente (`/ingreso-cliente`)

Los endpoints son análogos a los de gastos del cliente, reemplazando `/gasto-cliente` por `/ingreso-cliente`.

## Migración

### Ejecutar la migración

```bash
# Desde el directorio backend
npm run migration:run
```

### Revertir la migración (si es necesario)

```bash
npm run migration:revert
```

## Cambios en Entidades

### `Persona`
Ahora incluye las relaciones:
```typescript
@OneToMany(() => GastoCliente, (gasto) => gasto.persona, { cascade: true })
gastos: GastoCliente[];

@OneToMany(() => IngresoCliente, (ingreso) => ingreso.persona, { cascade: true })
ingresos: IngresoCliente[];
```

### `Direccion`
Se mantiene solo:
- `tiempoResidenciaAnios`

Se eliminaron:
- `tiempoResidenciaMeses`
- `montoAlquiler`

### `ActividadEconomica`
Se eliminaron todos los campos de gastos e ingresos adicionales. Ahora solo mantiene:
- `tipoActividad`
- `nombreEmpresa`
- `cargoOcupacion`
- `ingresosMensuales`
- Campos de ubicación (departamento, municipio, distrito, etc.)

## Beneficios de la Nueva Estructura

1. **Flexibilidad**: Se pueden agregar nuevos tipos de gastos/ingresos sin modificar la estructura de base de datos
2. **Escalabilidad**: Un cliente puede tener múltiples gastos/ingresos del mismo tipo
3. **Mantenibilidad**: Los catálogos pueden ser gestionados dinámicamente
4. **Trazabilidad**: Cada gasto/ingreso tiene descripción opcional para mayor detalle
5. **Normalización**: Cumple con las mejores prácticas de diseño de bases de datos

## Ejemplo de Uso Completo

### 1. Crear gastos para un cliente

```bash
# Gasto de vivienda
curl -X POST http://localhost:3000/gasto-cliente \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": 1,
    "tipoGastoId": 1,
    "monto": 350.00,
    "descripcion": "Alquiler mensual"
  }'

# Gasto de alimentación
curl -X POST http://localhost:3000/gasto-cliente \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": 1,
    "tipoGastoId": 2,
    "monto": 200.00,
    "descripcion": "Compras del mes"
  }'

# Gasto de transporte
curl -X POST http://localhost:3000/gasto-cliente \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": 1,
    "tipoGastoId": 3,
    "monto": 75.00,
    "descripcion": "Transporte público"
  }'
```

### 2. Crear ingresos para un cliente

```bash
# Salario principal
curl -X POST http://localhost:3000/ingreso-cliente \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": 1,
    "tipoIngresoId": 1,
    "monto": 1200.00,
    "descripcion": "Salario como desarrollador"
  }'

# Negocio propio
curl -X POST http://localhost:3000/ingreso-cliente \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": 1,
    "tipoIngresoId": 3,
    "monto": 500.00,
    "descripcion": "Consultoría freelance"
  }'
```

### 3. Consultar totales

```bash
# Total de ingresos
curl http://localhost:3000/ingreso-cliente/persona/1/total
# Respuesta: 1700.00

# Total de gastos
curl http://localhost:3000/gasto-cliente/persona/1/total
# Respuesta: 625.00

# Capacidad de pago = Ingresos - Gastos = 1075.00
```

## Notas Adicionales

- Todos los endpoints están documentados en Swagger (disponible en `/api`)
- Las validaciones se manejan con class-validator en los DTOs
- Las relaciones están configuradas con CASCADE DELETE para mantener la integridad referencial
- Los catálogos usan RESTRICT en el DELETE para evitar eliminar tipos que estén en uso

## Soporte

Para cualquier duda o problema con la migración, contactar al equipo de desarrollo.
