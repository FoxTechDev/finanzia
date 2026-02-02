# Ejemplos de Uso - Nuevos Campos de Clientes

## Ejemplo 1: Crear Cliente Completo con Todos los Nuevos Campos

### Request
```http
POST http://localhost:3000/personas
Content-Type: application/json

{
  "nombre": "María Isabel",
  "apellido": "González Rodríguez",
  "fechaNacimiento": "1988-07-15",
  "sexo": "Femenino",
  "nacionalidad": "Salvadoreña",
  "estadoCivil": "Casada",
  "telefono": "7123-4567",
  "correoElectronico": "maria.gonzalez@example.com",
  "numeroDui": "03456789-1",
  "fechaEmisionDui": "2015-03-20",
  "lugarEmisionDui": "San Salvador",

  "direccion": {
    "departamentoId": 1,
    "municipioId": 1,
    "distritoId": 1,
    "detalleDireccion": "Colonia Escalón, Pasaje Los Rosales #45, Casa 12",
    "tipoVivienda": "Propia",
    "tiempoResidenciaAnios": 5,
    "tiempoResidenciaMeses": 8,
    "montoAlquiler": null
  },

  "actividadEconomica": {
    "tipoActividad": "Empleada",
    "nombreEmpresa": "Corporación Internacional S.A. de C.V.",
    "cargoOcupacion": "Gerente de Recursos Humanos",
    "ingresosMensuales": 1800.00,
    "departamentoId": 1,
    "municipioId": 1,
    "distritoId": 1,
    "detalleDireccion": "Torre Empresarial, Piso 8, Oficina 802",

    "ingresosAdicionales": 500.00,
    "descripcionIngresosAdicionales": "Comisiones por reclutamiento y bonificaciones trimestrales",

    "gastosVivienda": 0,
    "gastosAlimentacion": 500.00,
    "gastosTransporte": 150.00,
    "gastosServiciosBasicos": 120.00,
    "gastosEducacion": 300.00,
    "gastosMedicos": 80.00,
    "otrosGastos": 100.00,
    "totalGastos": 1250.00
  },

  "dependenciasFamiliares": [
    {
      "nombreDependiente": "Carlos Alberto González",
      "parentesco": "Hijo",
      "edad": 14,
      "trabaja": false,
      "estudia": true,
      "observaciones": "Cursa noveno grado en Colegio San Francisco. Buen rendimiento académico."
    },
    {
      "nombreDependiente": "Sofía Valentina González",
      "parentesco": "Hija",
      "edad": 10,
      "trabaja": false,
      "estudia": true,
      "observaciones": "Cursa quinto grado. Practica ballet los sábados."
    },
    {
      "nombreDependiente": "Roberto González",
      "parentesco": "Cónyuge",
      "edad": 42,
      "trabaja": true,
      "estudia": false,
      "observaciones": "Ingeniero civil, trabaja en constructora local"
    }
  ]
}
```

### Response Esperado
```json
{
  "id": 123,
  "nombre": "María Isabel",
  "apellido": "González Rodríguez",
  "fechaNacimiento": "1988-07-15",
  "sexo": "Femenino",
  "nacionalidad": "Salvadoreña",
  "estadoCivil": "Casada",
  "telefono": "7123-4567",
  "correoElectronico": "maria.gonzalez@example.com",
  "numeroDui": "03456789-1",
  "fechaEmisionDui": "2015-03-20",
  "lugarEmisionDui": "San Salvador",

  "direccion": {
    "id": 234,
    "detalleDireccion": "Colonia Escalón, Pasaje Los Rosales #45, Casa 12",
    "tipoVivienda": "Propia",
    "tiempoResidenciaAnios": 5,
    "tiempoResidenciaMeses": 8,
    "montoAlquiler": null,
    "departamento": { "id": 1, "nombre": "San Salvador" },
    "municipio": { "id": 1, "nombre": "San Salvador" },
    "distrito": { "id": 1, "nombre": "Distrito 1" }
  },

  "actividadEconomica": {
    "id": 345,
    "tipoActividad": "Empleada",
    "nombreEmpresa": "Corporación Internacional S.A. de C.V.",
    "cargoOcupacion": "Gerente de Recursos Humanos",
    "ingresosMensuales": 1800.00,
    "ingresosAdicionales": 500.00,
    "descripcionIngresosAdicionales": "Comisiones por reclutamiento y bonificaciones trimestrales",
    "gastosVivienda": 0,
    "gastosAlimentacion": 500.00,
    "gastosTransporte": 150.00,
    "gastosServiciosBasicos": 120.00,
    "gastosEducacion": 300.00,
    "gastosMedicos": 80.00,
    "otrosGastos": 100.00,
    "totalGastos": 1250.00
  },

  "dependenciasFamiliares": [
    {
      "id": 1,
      "nombreDependiente": "Carlos Alberto González",
      "parentesco": "Hijo",
      "edad": 14,
      "trabaja": false,
      "estudia": true,
      "observaciones": "Cursa noveno grado en Colegio San Francisco. Buen rendimiento académico."
    },
    {
      "id": 2,
      "nombreDependiente": "Sofía Valentina González",
      "parentesco": "Hija",
      "edad": 10,
      "trabaja": false,
      "estudia": true,
      "observaciones": "Cursa quinto grado. Practica ballet los sábados."
    },
    {
      "id": 3,
      "nombreDependiente": "Roberto González",
      "parentesco": "Cónyuge",
      "edad": 42,
      "trabaja": true,
      "estudia": false,
      "observaciones": "Ingeniero civil, trabaja en constructora local"
    }
  ]
}
```

## Ejemplo 2: Agregar Dependencia a Cliente Existente

### Request
```http
POST http://localhost:3000/personas/123/dependencias
Content-Type: application/json

{
  "nombreDependiente": "Ana María Pérez de González",
  "parentesco": "Madre",
  "edad": 68,
  "trabaja": false,
  "estudia": false,
  "observaciones": "Pensionada, vive con la familia. Recibe atención médica regular."
}
```

### Response
```json
{
  "id": 4,
  "personaId": 123,
  "nombreDependiente": "Ana María Pérez de González",
  "parentesco": "Madre",
  "edad": 68,
  "trabaja": false,
  "estudia": false,
  "observaciones": "Pensionada, vive con la familia. Recibe atención médica regular."
}
```

## Ejemplo 3: Actualizar Información de Vivienda

### Request
```http
PATCH http://localhost:3000/personas/123/direccion
Content-Type: application/json

{
  "tipoVivienda": "Propia",
  "tiempoResidenciaAnios": 6,
  "tiempoResidenciaMeses": 0,
  "montoAlquiler": null
}
```

## Ejemplo 4: Cliente con Vivienda Alquilada

### Request
```http
POST http://localhost:3000/personas
Content-Type: application/json

{
  "nombre": "José",
  "apellido": "Martínez",
  "fechaNacimiento": "1995-05-20",
  "sexo": "Masculino",
  "nacionalidad": "Salvadoreño",
  "estadoCivil": "Soltero",
  "telefono": "7890-1234",
  "correoElectronico": "jose.martinez@example.com",
  "numeroDui": "04567890-2",
  "fechaEmisionDui": "2018-06-15",
  "lugarEmisionDui": "Santa Ana",

  "direccion": {
    "departamentoId": 1,
    "municipioId": 2,
    "distritoId": 3,
    "detalleDireccion": "Colonia San José, Avenida Principal #789",
    "tipoVivienda": "Alquilada",
    "tiempoResidenciaAnios": 2,
    "tiempoResidenciaMeses": 3,
    "montoAlquiler": 300.00
  },

  "actividadEconomica": {
    "tipoActividad": "Independiente",
    "nombreEmpresa": "Taller Mecánico El Buen Motor",
    "cargoOcupacion": "Propietario",
    "ingresosMensuales": 1200.00,
    "departamentoId": 1,
    "municipioId": 2,
    "distritoId": 3,
    "detalleDireccion": "Calle Los Mecánicos #45",

    "ingresosAdicionales": 200.00,
    "descripcionIngresosAdicionales": "Trabajos de fin de semana y servicios a domicilio",

    "gastosVivienda": 300.00,
    "gastosAlimentacion": 350.00,
    "gastosTransporte": 80.00,
    "gastosServiciosBasicos": 90.00,
    "gastosEducacion": 0,
    "gastosMedicos": 40.00,
    "otrosGastos": 60.00,
    "totalGastos": 920.00
  }
}
```

## Ejemplo 5: Consultar Todas las Dependencias de un Cliente

### Request
```http
GET http://localhost:3000/personas/123/dependencias
```

### Response
```json
[
  {
    "id": 1,
    "nombreDependiente": "Carlos Alberto González",
    "parentesco": "Hijo",
    "edad": 14,
    "trabaja": false,
    "estudia": true,
    "observaciones": "Cursa noveno grado en Colegio San Francisco. Buen rendimiento académico."
  },
  {
    "id": 2,
    "nombreDependiente": "Sofía Valentina González",
    "parentesco": "Hija",
    "edad": 10,
    "trabaja": false,
    "estudia": true,
    "observaciones": "Cursa quinto grado. Practica ballet los sábados."
  },
  {
    "id": 3,
    "nombreDependiente": "Roberto González",
    "parentesco": "Cónyuge",
    "edad": 42,
    "trabaja": true,
    "estudia": false,
    "observaciones": "Ingeniero civil, trabaja en constructora local"
  },
  {
    "id": 4,
    "nombreDependiente": "Ana María Pérez de González",
    "parentesco": "Madre",
    "edad": 68,
    "trabaja": false,
    "estudia": false,
    "observaciones": "Pensionada, vive con la familia. Recibe atención médica regular."
  }
]
```

## Ejemplo 6: Actualizar Gastos Mensuales

### Request
```http
PATCH http://localhost:3000/personas/123/actividad-economica
Content-Type: application/json

{
  "gastosVivienda": 0,
  "gastosAlimentacion": 550.00,
  "gastosTransporte": 160.00,
  "gastosServiciosBasicos": 130.00,
  "gastosEducacion": 320.00,
  "gastosMedicos": 90.00,
  "otrosGastos": 120.00,
  "totalGastos": 1370.00
}
```

## Ejemplo 7: Actualizar Dependencia Existente

### Request
```http
PATCH http://localhost:3000/personas/123/dependencias/1
Content-Type: application/json

{
  "edad": 15,
  "observaciones": "Cursa primero de bachillerato en Colegio San Francisco. Excelente rendimiento académico. Ganó beca por mérito."
}
```

## Ejemplo 8: Eliminar una Dependencia

### Request
```http
DELETE http://localhost:3000/personas/123/dependencias/4
```

### Response
```
204 No Content
```

## Análisis de Capacidad de Pago

Con los nuevos campos, puedes calcular:

```javascript
// Ejemplo de cálculo en el frontend o en un servicio
const capacidadPago = {
  ingresosTotal: persona.actividadEconomica.ingresosMensuales +
                 persona.actividadEconomica.ingresosAdicionales,
  gastosTotal: persona.actividadEconomica.totalGastos,
  ingresoDisponible: function() {
    return this.ingresosTotal - this.gastosTotal;
  },
  porcentajeCompromiso: function(montoCuota) {
    return (montoCuota / this.ingresoDisponible()) * 100;
  },
  cuotaMaxima: function() {
    // Máximo 40% del ingreso disponible
    return this.ingresoDisponible() * 0.40;
  }
};

// Ejemplo con datos de María González
// Ingresos: 1800 + 500 = 2300
// Gastos: 1250
// Disponible: 1050
// Cuota máxima: 420

console.log(`Ingreso disponible: $${capacidadPago.ingresoDisponible()}`);
console.log(`Cuota máxima recomendada: $${capacidadPago.cuotaMaxima()}`);
```

## Validaciones de Negocio Sugeridas

### 1. Validar que totalGastos sea igual a la suma
```typescript
// En el servicio o en el frontend
const sumaGastos =
  gastosVivienda +
  gastosAlimentacion +
  gastosTransporte +
  gastosServiciosBasicos +
  gastosEducacion +
  gastosMedicos +
  otrosGastos;

if (Math.abs(totalGastos - sumaGastos) > 0.01) {
  throw new Error('El total de gastos no coincide con la suma de los gastos individuales');
}
```

### 2. Validar montoAlquiler según tipoVivienda
```typescript
if (tipoVivienda === 'Alquilada' && !montoAlquiler) {
  throw new Error('El monto de alquiler es requerido para vivienda alquilada');
}

if (tipoVivienda === 'Propia' && montoAlquiler > 0) {
  throw new Error('No se debe especificar monto de alquiler para vivienda propia');
}
```

### 3. Validar capacidad de endeudamiento
```typescript
const relacionDeudaIngreso = montoCuota / (ingresosMensuales + ingresosAdicionales);

if (relacionDeudaIngreso > 0.40) {
  console.warn('El cliente excede el 40% de endeudamiento recomendado');
}
```

## Reportes Sugeridos

### 1. Análisis de Composición Familiar
Contar dependencias por tipo de parentesco para entender el perfil del cliente.

### 2. Análisis de Gastos
Identificar categorías de gasto más altas y compararlas con promedios.

### 3. Score de Estabilidad Residencial
Usar tiempoResidenciaAnios para evaluar estabilidad del cliente.

### 4. Análisis de Capacidad de Pago
Comparar ingresos vs gastos para determinar viabilidad de crédito.

---

**Nota:** Todos estos ejemplos están también disponibles en el archivo `test-client-details.http` para ser ejecutados directamente con REST Client de VS Code.
