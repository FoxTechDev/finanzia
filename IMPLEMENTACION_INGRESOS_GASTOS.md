# Implementación de Manejo de Ingresos y Gastos en PersonaService

## Resumen de Cambios

Se ha implementado el manejo completo de ingresos y gastos en el módulo de Persona del backend NestJS, permitiendo crear y actualizar personas con sus ingresos y gastos asociados.

## Archivos Modificados

### 1. Nuevos DTOs Creados

#### `src/ingreso-cliente/dto/create-ingreso-nested.dto.ts`
- DTO para crear ingresos anidados dentro de CreatePersonaDto
- Omite el campo `personaId` que se asigna automáticamente
- Hereda validaciones de `CreateIngresoClienteDto`

#### `src/gasto-cliente/dto/create-gasto-nested.dto.ts`
- DTO para crear gastos anidados dentro de CreatePersonaDto
- Omite el campo `personaId` que se asigna automáticamente
- Hereda validaciones de `CreateGastoClienteDto`

### 2. Modificaciones en CreatePersonaDto

**Archivo**: `src/persona/dto/create-persona.dto.ts`

Se agregaron los siguientes campos opcionales:

```typescript
@ValidateNested({ each: true })
@Type(() => CreateIngresoNestedDto)
@IsArray()
@IsOptional()
ingresos?: CreateIngresoNestedDto[];

@ValidateNested({ each: true })
@Type(() => CreateGastoNestedDto)
@IsArray()
@IsOptional()
gastos?: CreateGastoNestedDto[];
```

### 3. Modificaciones en PersonaService

**Archivo**: `src/persona/persona.service.ts`

#### Importaciones Agregadas
```typescript
import { IngresoCliente } from '../ingreso-cliente/entities/ingreso-cliente.entity';
import { GastoCliente } from '../gasto-cliente/entities/gasto-cliente.entity';
```

#### Método `create()`
- Extrae `ingresos` y `gastos` del DTO
- Procesa y guarda los ingresos asociados a la persona
- Procesa y guarda los gastos asociados a la persona
- Todo dentro de la misma transacción para garantizar consistencia

#### Método `update()`
- Extrae `ingresos` y `gastos` del DTO
- Elimina ingresos existentes y crea nuevos (si se proporcionan)
- Elimina gastos existentes y crea nuevos (si se proporcionan)
- Todo dentro de la misma transacción

#### Métodos `findOne()` y `findByDui()`
- Se agregaron las relaciones `ingresos` y `ingresos.tipoIngreso`
- Se agregaron las relaciones `gastos` y `gastos.tipoGasto`
- Ahora incluyen los datos completos de ingresos y gastos al consultar una persona

## Estructura de los DTOs

### CreateIngresoNestedDto
```typescript
{
  tipoIngresoId: number;      // ID del tipo de ingreso
  monto: number;               // Monto del ingreso (>= 0)
  descripcion?: string;        // Descripción opcional
}
```

### CreateGastoNestedDto
```typescript
{
  tipoGastoId: number;         // ID del tipo de gasto
  monto: number;               // Monto del gasto (>= 0)
  descripcion?: string;        // Descripción opcional
}
```

## Ejemplos de Uso

### 1. Crear una Persona con Ingresos y Gastos

```typescript
// POST /persona
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "fechaNacimiento": "1990-01-15",
  "nacionalidad": "Salvadoreña",
  "numeroDui": "123456789",
  "fechaEmisionDui": "2010-05-20",
  "lugarEmisionDui": "San Salvador",

  // Ingresos
  "ingresos": [
    {
      "tipoIngresoId": 1,
      "monto": 800.00,
      "descripcion": "Salario mensual"
    },
    {
      "tipoIngresoId": 2,
      "monto": 200.00,
      "descripcion": "Ingresos adicionales"
    }
  ],

  // Gastos
  "gastos": [
    {
      "tipoGastoId": 1,
      "monto": 300.00,
      "descripcion": "Renta"
    },
    {
      "tipoGastoId": 2,
      "monto": 150.00,
      "descripcion": "Alimentación"
    },
    {
      "tipoGastoId": 3,
      "monto": 50.00,
      "descripcion": "Transporte"
    }
  ]
}
```

### 2. Actualizar Ingresos y Gastos de una Persona

```typescript
// PATCH /persona/:id
{
  // Solo actualizar ingresos y gastos
  "ingresos": [
    {
      "tipoIngresoId": 1,
      "monto": 900.00,
      "descripcion": "Salario mensual actualizado"
    }
  ],

  "gastos": [
    {
      "tipoGastoId": 1,
      "monto": 350.00,
      "descripcion": "Renta actualizada"
    }
  ]
}
```

**Nota**: Al actualizar, se eliminan todos los ingresos/gastos existentes y se crean los nuevos. Para mantener algunos existentes, debes enviar todos los que desees conservar.

### 3. Consultar una Persona con sus Ingresos y Gastos

```typescript
// GET /persona/:id
// La respuesta incluirá automáticamente:
{
  "id": 1,
  "nombre": "Juan",
  "apellido": "Pérez",
  // ... otros campos de persona

  "ingresos": [
    {
      "id": 1,
      "monto": 800.00,
      "descripcion": "Salario mensual",
      "tipoIngreso": {
        "id": 1,
        "nombre": "Salario",
        // ... otros campos del tipo
      }
    }
  ],

  "gastos": [
    {
      "id": 1,
      "monto": 300.00,
      "descripcion": "Renta",
      "tipoGasto": {
        "id": 1,
        "nombre": "Vivienda",
        // ... otros campos del tipo
      }
    }
  ]
}
```

## Validaciones Aplicadas

### Para Ingresos y Gastos:
- `tipoIngresoId` / `tipoGastoId`: Debe ser un número positivo (requerido)
- `monto`: Debe ser un número >= 0 (requerido)
- `descripcion`: Texto opcional

### Validación de Arrays:
- Los arrays de ingresos y gastos son opcionales
- Si se proporcionan, cada elemento debe cumplir las validaciones
- Se valida con `@ValidateNested({ each: true })` para validar cada elemento del array

## Comportamiento de Transacciones

### Al Crear (create):
1. Se crea la persona
2. Se crean las relaciones (dirección, actividad económica, referencias, dependencias)
3. Se crean los ingresos
4. Se crean los gastos
5. Si algún paso falla, se hace rollback de toda la transacción

### Al Actualizar (update):
1. Se actualizan los datos de la persona
2. Se actualizan las relaciones one-to-one (dirección, actividad económica)
3. Si se proporcionan, se eliminan y recrean las referencias
4. Si se proporcionan, se eliminan y recrean las dependencias
5. Si se proporcionan, se eliminan y recrean los ingresos
6. Si se proporcionan, se eliminan y recrean los gastos
7. Si algún paso falla, se hace rollback de toda la transacción

## Consideraciones Importantes

1. **Cascade**: Las entidades IngresoCliente y GastoCliente tienen `onDelete: 'CASCADE'`, por lo que al eliminar una persona se eliminan automáticamente sus ingresos y gastos.

2. **Estrategia de Actualización**: Se usa la estrategia de "eliminar y recrear" para simplificar la lógica y evitar problemas de sincronización. Esto significa que al actualizar, se pierden los IDs anteriores de ingresos/gastos.

3. **Transacciones**: Todas las operaciones se realizan dentro de transacciones para garantizar la consistencia de los datos.

4. **Relaciones Incluidas**: Al consultar una persona, se incluyen automáticamente los tipos de ingreso y tipos de gasto para tener información completa.

## Testing

Para probar la implementación, puedes usar el siguiente archivo HTTP:

```http
### Crear persona con ingresos y gastos
POST http://localhost:3000/api/persona
Content-Type: application/json

{
  "nombre": "Test",
  "apellido": "Usuario",
  "fechaNacimiento": "1990-01-01",
  "nacionalidad": "Salvadoreña",
  "numeroDui": "999999999",
  "fechaEmisionDui": "2010-01-01",
  "lugarEmisionDui": "San Salvador",
  "ingresos": [
    {
      "tipoIngresoId": 1,
      "monto": 1000.00,
      "descripcion": "Ingreso de prueba"
    }
  ],
  "gastos": [
    {
      "tipoGastoId": 1,
      "monto": 500.00,
      "descripcion": "Gasto de prueba"
    }
  ]
}

### Consultar persona con ingresos y gastos
GET http://localhost:3000/api/persona/1

### Actualizar ingresos y gastos
PATCH http://localhost:3000/api/persona/1
Content-Type: application/json

{
  "ingresos": [
    {
      "tipoIngresoId": 1,
      "monto": 1200.00,
      "descripcion": "Ingreso actualizado"
    }
  ],
  "gastos": [
    {
      "tipoGastoId": 1,
      "monto": 600.00,
      "descripcion": "Gasto actualizado"
    }
  ]
}
```

## Próximos Pasos Sugeridos

1. Implementar endpoints específicos para gestionar ingresos y gastos individualmente (CRUD completo)
2. Agregar validación para verificar que los `tipoIngresoId` y `tipoGastoId` existan en la base de datos
3. Considerar agregar cálculos automáticos de totales (suma de ingresos, suma de gastos, balance)
4. Agregar paginación para personas con muchos ingresos/gastos
5. Implementar tests unitarios y de integración para los nuevos métodos
