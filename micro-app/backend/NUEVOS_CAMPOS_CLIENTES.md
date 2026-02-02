# Nuevos Campos para Módulo de Clientes

## Resumen de Cambios

Se han agregado tres funcionalidades principales al módulo de clientes (Persona):

### 1. **Dependencias Familiares** (Nueva Entidad)
Nueva tabla `dependencia_familiar` con los siguientes campos:
- Nombre del dependiente
- Parentesco (Hijo, Hija, Cónyuge, Padre, Madre, Hermano, Hermana, Abuelo, Abuela, Otro)
- Edad
- ¿Trabaja? (boolean)
- ¿Estudia? (boolean)
- Observaciones

### 2. **Información de Vivienda** (Campos en tabla `direccion`)
- Tipo de vivienda: PROPIA, ALQUILADA, FAMILIAR, PRESTADA, OTRA
- Tiempo de residir (años)
- Tiempo de residir (meses adicionales)
- Monto de alquiler mensual

### 3. **Detalle de Ingresos y Gastos** (Campos en tabla `actividad_economica`)
- Ingresos adicionales (monto)
- Descripción de ingresos adicionales
- Gastos de vivienda
- Gastos de alimentación
- Gastos de transporte
- Gastos de servicios básicos
- Gastos de educación
- Gastos médicos
- Otros gastos
- Total de gastos

## Archivos Creados

### Módulo DependenciaFamiliar (Nuevo)
```
src/dependencia-familiar/
├── entities/
│   └── dependencia-familiar.entity.ts
├── dto/
│   ├── create-dependencia-familiar.dto.ts
│   └── update-dependencia-familiar.dto.ts
├── dependencia-familiar.service.ts
├── dependencia-familiar.controller.ts
└── dependencia-familiar.module.ts
```

### Archivos Modificados
- `src/persona/entities/persona.entity.ts` - Agregada relación con DependenciaFamiliar
- `src/persona/dto/create-persona.dto.ts` - Agregado campo dependenciasFamiliares
- `src/persona/persona.service.ts` - Manejo de dependencias familiares en create/update
- `src/direccion/entities/direccion.entity.ts` - Agregados campos de vivienda
- `src/direccion/dto/create-direccion.dto.ts` - Agregados campos de vivienda
- `src/actividad-economica/entities/actividad-economica.entity.ts` - Agregados campos de ingresos/gastos
- `src/actividad-economica/dto/create-actividad-economica.dto.ts` - Agregados campos de ingresos/gastos
- `src/app.module.ts` - Registrado DependenciaFamiliarModule

### Migración
- `src/database/migrations/1769900000000-AddClientDetailsFields.ts`

### Archivo de Pruebas
- `test-client-details.http` - Ejemplos de uso de los endpoints

## Instrucciones de Instalación

### 1. Compilar el Proyecto
```bash
cd C:/Users/javie/OneDrive/Documentos/DESARROLLO/MICRO/micro-app/backend
npm run build
```

### 2. Ejecutar la Migración

**IMPORTANTE:** Antes de ejecutar la migración, realiza un backup de la base de datos.

```bash
# Ver migraciones pendientes
npm run migration:show

# Ejecutar la migración
npm run migration:run
```

Si los comandos npm no están configurados, usa TypeORM CLI directamente:

```bash
# Ver migraciones pendientes
npx typeorm migration:show -d dist/config/typeorm.config.js

# Ejecutar migración
npx typeorm migration:run -d dist/config/typeorm.config.js
```

### 3. Revertir la Migración (si es necesario)
```bash
npm run migration:revert
# o
npx typeorm migration:revert -d dist/config/typeorm.config.js
```

### 4. Reiniciar el Servidor
```bash
npm run start:dev
```

## Nuevos Endpoints

### Dependencias Familiares

```http
# Crear dependencia familiar
POST /personas/{personaId}/dependencias
Content-Type: application/json

{
  "nombreDependiente": "María López",
  "parentesco": "Hija",
  "edad": 15,
  "trabaja": false,
  "estudia": true,
  "observaciones": "Cursa tercer año"
}

# Listar dependencias de una persona
GET /personas/{personaId}/dependencias

# Obtener una dependencia específica
GET /personas/{personaId}/dependencias/{id}

# Actualizar dependencia
PATCH /personas/{personaId}/dependencias/{id}

# Eliminar dependencia
DELETE /personas/{personaId}/dependencias/{id}
```

### Actualización de Dirección (campos nuevos)

```http
PATCH /personas/{personaId}/direccion
Content-Type: application/json

{
  "tipoVivienda": "Alquilada",
  "tiempoResidenciaAnios": 3,
  "tiempoResidenciaMeses": 6,
  "montoAlquiler": 350.00
}
```

### Actualización de Actividad Económica (campos nuevos)

```http
PATCH /personas/{personaId}/actividad-economica
Content-Type: application/json

{
  "ingresosAdicionales": 300.00,
  "descripcionIngresosAdicionales": "Renta de propiedad",
  "gastosVivienda": 350.00,
  "gastosAlimentacion": 400.00,
  "gastosTransporte": 100.00,
  "gastosServiciosBasicos": 80.00,
  "gastosEducacion": 150.00,
  "gastosMedicos": 50.00,
  "otrosGastos": 70.00,
  "totalGastos": 1200.00
}
```

## Crear Persona con Todos los Campos

```json
POST /personas
Content-Type: application/json

{
  "persona": {
    "nombre": "Carlos",
    "apellido": "Martínez",
    "fechaNacimiento": "1985-03-15",
    "sexo": "Masculino",
    "nacionalidad": "Salvadoreño",
    "estadoCivil": "Casado",
    "telefono": "7890-1234",
    "correoElectronico": "carlos@example.com",
    "numeroDui": "12345678-9",
    "fechaEmisionDui": "2010-05-20",
    "lugarEmisionDui": "San Salvador"
  },
  "direccion": {
    "departamentoId": 1,
    "municipioId": 1,
    "distritoId": 1,
    "detalleDireccion": "Colonia Escalón #456",
    "tipoVivienda": "Propia",
    "tiempoResidenciaAnios": 8,
    "tiempoResidenciaMeses": 3
  },
  "actividadEconomica": {
    "tipoActividad": "Empleado",
    "nombreEmpresa": "Empresa XYZ",
    "cargoOcupacion": "Gerente",
    "ingresosMensuales": 1500.00,
    "departamentoId": 1,
    "municipioId": 1,
    "distritoId": 1,
    "ingresosAdicionales": 400.00,
    "descripcionIngresosAdicionales": "Comisiones",
    "gastosVivienda": 0,
    "gastosAlimentacion": 450.00,
    "gastosTransporte": 120.00,
    "gastosServiciosBasicos": 90.00,
    "gastosEducacion": 200.00,
    "gastosMedicos": 60.00,
    "otrosGastos": 80.00,
    "totalGastos": 1000.00
  },
  "dependenciasFamiliares": [
    {
      "nombreDependiente": "Ana Martínez",
      "parentesco": "Hija",
      "edad": 12,
      "trabaja": false,
      "estudia": true,
      "observaciones": "Sexto grado"
    },
    {
      "nombreDependiente": "Rosa de Martínez",
      "parentesco": "Cónyuge",
      "edad": 38,
      "trabaja": true,
      "estudia": false
    }
  ]
}
```

## Estructura de Base de Datos

### Nueva Tabla: dependencia_familiar

```sql
CREATE TABLE dependencia_familiar (
  idDependencia INT PRIMARY KEY AUTO_INCREMENT,
  idPersona INT NOT NULL,
  nombreDependiente VARCHAR(150) NOT NULL,
  parentesco ENUM('Hijo','Hija','Cónyuge','Padre','Madre','Hermano','Hermana','Abuelo','Abuela','Otro') DEFAULT 'Otro',
  edad INT,
  trabaja BOOLEAN DEFAULT FALSE,
  estudia BOOLEAN DEFAULT FALSE,
  observaciones TEXT,
  FOREIGN KEY (idPersona) REFERENCES persona(idPersona) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX IDX_dependencia_familiar_persona (idPersona)
);
```

### Campos Agregados a direccion

```sql
ALTER TABLE direccion
  ADD COLUMN tipoVivienda ENUM('Propia','Alquilada','Familiar','Prestada','Otra'),
  ADD COLUMN tiempoResidenciaAnios INT,
  ADD COLUMN tiempoResidenciaMeses INT,
  ADD COLUMN montoAlquiler DECIMAL(10,2);
```

### Campos Agregados a actividad_economica

```sql
ALTER TABLE actividad_economica
  ADD COLUMN ingresosAdicionales DECIMAL(14,2),
  ADD COLUMN descripcionIngresosAdicionales TEXT,
  ADD COLUMN gastosVivienda DECIMAL(10,2) COMMENT 'Alquiler o hipoteca mensual',
  ADD COLUMN gastosAlimentacion DECIMAL(10,2),
  ADD COLUMN gastosTransporte DECIMAL(10,2),
  ADD COLUMN gastosServiciosBasicos DECIMAL(10,2) COMMENT 'Agua, luz, teléfono, internet',
  ADD COLUMN gastosEducacion DECIMAL(10,2),
  ADD COLUMN gastosMedicos DECIMAL(10,2),
  ADD COLUMN otrosGastos DECIMAL(10,2),
  ADD COLUMN totalGastos DECIMAL(14,2) COMMENT 'Suma total de todos los gastos';
```

## Validaciones Implementadas

### DependenciaFamiliar
- `nombreDependiente`: requerido, máximo 150 caracteres
- `parentesco`: enum válido (Hijo, Hija, Cónyuge, etc.)
- `edad`: opcional, entero entre 0 y 120
- `trabaja`: boolean, default false
- `estudia`: boolean, default false
- `observaciones`: opcional, texto libre

### Direccion (campos nuevos)
- `tipoVivienda`: enum opcional (Propia, Alquilada, Familiar, Prestada, Otra)
- `tiempoResidenciaAnios`: entero opcional, mínimo 0
- `tiempoResidenciaMeses`: entero opcional, 0-11
- `montoAlquiler`: decimal opcional, mínimo 0

### ActividadEconomica (campos nuevos)
- `ingresosAdicionales`: decimal opcional, mínimo 0
- `descripcionIngresosAdicionales`: texto opcional
- Todos los campos de gastos: decimal opcional, mínimo 0
- `totalGastos`: decimal opcional, mínimo 0

## Documentación Swagger

Todos los endpoints están documentados con Swagger. Accede a:
```
http://localhost:3000/api
```

## Pruebas

Usa el archivo `test-client-details.http` con la extensión REST Client de VS Code para probar todos los endpoints.

## Consideraciones de Producción

1. **Backup:** Siempre realiza un backup antes de ejecutar migraciones en producción
2. **Validación:** Los campos de gastos no se validan automáticamente para sumar al totalGastos (puedes agregar lógica de negocio si lo deseas)
3. **Cascada:** Las dependencias familiares se eliminan automáticamente cuando se elimina una persona (ON DELETE CASCADE)
4. **Índices:** Se agregó un índice en `idPersona` en `dependencia_familiar` para mejorar el rendimiento de consultas

## Próximos Pasos Sugeridos

1. Agregar validación en el servicio para que `totalGastos` sea la suma de todos los gastos
2. Crear reportes que utilicen estos nuevos campos
3. Agregar campo calculado de "capacidad de pago" usando ingresos y gastos
4. Implementar validación de que si `tipoVivienda` es "Alquilada", `montoAlquiler` sea requerido
