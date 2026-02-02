# Mejoras en Endpoints de Solicitud y Comité

## Resumen de Cambios

Se han mejorado los endpoints del backend para las vistas de solicitud y comité, agregando información completa y calculada dinámicamente.

---

## 1. Vista de Consulta de Solicitud

### Nuevo Endpoint: `GET /api/solicitudes/:id/detalle`

Este endpoint reemplaza o complementa el endpoint básico `GET /api/solicitudes/:id` y proporciona información completa de la solicitud incluyendo el plan de pago calculado.

#### Información que Retorna:

- **Datos de la solicitud**: Número, monto solicitado/aprobado, plazo, tasa de interés, estado, fechas, etc.
- **Datos del cliente (persona)**: Información completa del cliente que realizó la solicitud
- **Tipo de crédito**: Detalles del producto de crédito solicitado
- **Periodicidad de pago**: Código y nombre de la periodicidad (MENSUAL, QUINCENAL, etc.)
- **Plan de pago calculado**: Tabla completa con todas las cuotas calculadas dinámicamente

#### Características del Plan de Pago:

- Se calcula dinámicamente usando el método existente `calcularPlanPago()`
- Usa valores aprobados si la solicitud está aprobada, o valores solicitados si aún no lo está
- Incluye:
  - Cuota normal
  - Total de interés
  - Total a pagar
  - Número de cuotas
  - Tabla detallada con cada cuota (número, fecha, capital, interés, cuota total, saldo)

#### Ejemplo de Respuesta:

```json
{
  "id": 1,
  "numeroSolicitud": "SOL-2024-000001",
  "personaId": 1,
  "montoSolicitado": 5000,
  "montoAprobado": 5000,
  "plazoSolicitado": 12,
  "plazoAprobado": 12,
  "tasaInteresPropuesta": 18.5,
  "tasaInteresAprobada": 18.5,
  "persona": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "numeroDui": "12345678-9"
  },
  "tipoCredito": {
    "id": 1,
    "codigo": "PERSONAL",
    "nombre": "Crédito Personal"
  },
  "periodicidadPago": {
    "id": 1,
    "codigo": "MENSUAL",
    "nombre": "Mensual"
  },
  "estado": {
    "id": 1,
    "codigo": "APROBADA",
    "nombre": "Aprobada"
  },
  "planPago": {
    "cuotaNormal": 456.78,
    "totalInteres": 484.36,
    "totalPagar": 5484.36,
    "numeroCuotas": 12,
    "planPago": [
      {
        "numeroCuota": 1,
        "fechaVencimiento": "2024-02-15T00:00:00.000Z",
        "capital": 379.53,
        "interes": 77.25,
        "cuotaTotal": 456.78,
        "saldoCapital": 4620.47
      },
      {
        "numeroCuota": 2,
        "fechaVencimiento": "2024-03-15T00:00:00.000Z",
        "capital": 385.39,
        "interes": 71.39,
        "cuotaTotal": 456.78,
        "saldoCapital": 4235.08
      }
      // ... resto de las cuotas
    ]
  }
}
```

---

## 2. Vista del Comité de Crédito

### Nuevo Endpoint: `GET /api/comite/:solicitudId/revision`

Este endpoint proporciona toda la información necesaria para que el comité de crédito evalúe y tome decisiones sobre una solicitud.

#### Información que Retorna:

- **Solicitud completa**: Todos los datos de la solicitud con sus relaciones
- **Actividad económica del cliente**: Ocupación, empresa, ingresos estimados
- **Ingresos del cliente**: Lista detallada de todos los ingresos registrados
- **Gastos del cliente**: Lista detallada de todos los gastos registrados
- **Análisis financiero calculado**:
  - Total de ingresos
  - Total de gastos
  - Capacidad de pago (ingresos - gastos)
  - Ratio de endeudamiento (% de ingresos que representaría la cuota)

#### Ejemplo de Respuesta:

```json
{
  "solicitud": {
    "id": 1,
    "numeroSolicitud": "SOL-2024-000001",
    "personaId": 1,
    "montoSolicitado": 5000,
    "plazoSolicitado": 12,
    "tasaInteresPropuesta": 18.5,
    "analisisAsesor": "Cliente con buen historial crediticio...",
    "recomendacionAsesor": "APROBADA",
    "capacidadPago": 1300,
    "persona": {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "numeroDui": "12345678-9",
      "actividadEconomica": {
        "id": 1,
        "ocupacion": "Comerciante",
        "nombreEmpresa": "Mi Negocio",
        "direccionEmpresa": "Calle Principal #123",
        "telefonoEmpresa": "2222-3333",
        "ingresoMensual": 1500,
        "tiempoActividad": "5 años"
      }
    },
    "tipoCredito": {
      "id": 1,
      "nombre": "Crédito Personal",
      "tasaInteres": 18.5
    },
    "periodicidadPago": {
      "id": 1,
      "codigo": "MENSUAL",
      "nombre": "Mensual"
    },
    "estado": {
      "id": 3,
      "codigo": "EN_COMITE",
      "nombre": "En Comité"
    }
  },
  "ingresos": [
    {
      "id": 1,
      "tipoIngreso": {
        "id": 1,
        "nombre": "Salario",
        "descripcion": "Ingresos por salario"
      },
      "monto": 1200,
      "descripcion": "Salario mensual como empleado"
    },
    {
      "id": 2,
      "tipoIngreso": {
        "id": 2,
        "nombre": "Negocio Propio",
        "descripcion": "Ingresos por negocio propio"
      },
      "monto": 800,
      "descripcion": "Ingresos estimados por ventas en negocio"
    }
  ],
  "gastos": [
    {
      "id": 1,
      "tipoGasto": {
        "id": 1,
        "nombre": "Alimentación",
        "descripcion": "Gastos en alimentación"
      },
      "monto": 400,
      "descripcion": "Gastos mensuales en comida"
    },
    {
      "id": 2,
      "tipoGasto": {
        "id": 2,
        "nombre": "Vivienda",
        "descripcion": "Gastos de vivienda"
      },
      "monto": 300,
      "descripcion": "Alquiler mensual"
    }
  ],
  "analisisFinanciero": {
    "totalIngresos": 2000,
    "totalGastos": 700,
    "capacidadPago": 1300,
    "ratioEndeudamiento": 32.15
  }
}
```

---

## 3. Mejoras en Endpoint de Solicitudes Pendientes en Comité

### Endpoint Mejorado: `GET /api/comite/pendientes`

Se agregó la relación `periodicidadPago` para que la lista de solicitudes pendientes incluya también la información de periodicidad.

---

## Archivos Modificados

### Módulo de Solicitudes

1. **solicitud.service.ts**
   - Agregado método `findOneConPlanPago()` para obtener solicitud con plan de pago calculado
   - Mejora en `findOne()` para incluir la relación `estado`

2. **solicitud.controller.ts**
   - Agregado endpoint `GET :id/detalle` para obtener solicitud con plan de pago
   - Agregados decoradores de Swagger para documentación

3. **solicitud.module.ts**
   - Sin cambios (ya tenía las dependencias necesarias)

### Módulo de Comité

1. **comite.service.ts**
   - Agregada inyección de `IngresoClienteService` y `GastoClienteService`
   - Agregado método `findSolicitudParaComite()` para obtener información completa
   - Mejora en `findPendientes()` para incluir periodicidad de pago

2. **comite.controller.ts**
   - Agregado endpoint `GET :solicitudId/revision` para vista de comité
   - Agregados decoradores de Swagger para documentación

3. **comite.module.ts**
   - Agregadas importaciones de `IngresoClienteModule` y `GastoClienteModule`

### DTOs Nuevos

1. **solicitud-detalle-response.dto.ts**
   - DTO de respuesta para el endpoint de detalle de solicitud

2. **solicitud-comite-response.dto.ts**
   - DTO de respuesta para el endpoint de revisión de comité

---

## Cómo Usar los Nuevos Endpoints

### Para la Vista de Consulta de Solicitud:

```typescript
// En el frontend
const solicitudDetalle = await fetch(`/api/solicitudes/${id}/detalle`).then(r => r.json());

// Ahora tienes acceso a:
console.log(solicitudDetalle.solicitud);
console.log(solicitudDetalle.persona);
console.log(solicitudDetalle.tipoCredito);
console.log(solicitudDetalle.periodicidadPago);
console.log(solicitudDetalle.planPago); // Plan de pago completo calculado
```

### Para la Vista del Comité:

```typescript
// En el frontend
const revision = await fetch(`/api/comite/${solicitudId}/revision`).then(r => r.json());

// Ahora tienes acceso a:
console.log(revision.solicitud); // Solicitud completa
console.log(revision.solicitud.persona.actividadEconomica); // Actividad económica
console.log(revision.ingresos); // Lista de ingresos
console.log(revision.gastos); // Lista de gastos
console.log(revision.analisisFinanciero); // Análisis calculado
console.log(revision.analisisFinanciero.capacidadPago); // Capacidad de pago
console.log(revision.analisisFinanciero.ratioEndeudamiento); // Ratio de endeudamiento
```

---

## Ventajas de las Mejoras

### Rendimiento
- **Un solo request**: El frontend obtiene toda la información necesaria en una sola llamada
- **Cálculo en el servidor**: El plan de pago se calcula en el backend usando la lógica existente
- **Datos relacionados**: TypeORM carga eficientemente todas las relaciones en una sola query

### Mantenibilidad
- **Código reutilizable**: Se usa el método `calcularPlanPago()` existente
- **Separación de responsabilidades**: Cada endpoint tiene un propósito claro
- **Documentación**: Swagger documenta automáticamente los endpoints

### Experiencia de Usuario
- **Información completa**: El frontend no necesita hacer múltiples requests
- **Datos actualizados**: El plan de pago se calcula dinámicamente con los valores actuales
- **Análisis automático**: El comité recibe análisis financiero calculado automáticamente

---

## Próximas Mejoras Sugeridas

1. **Agregar campo `tipoInteres` a TipoCredito**: Actualmente se usa "AMORTIZADO" por defecto. Se podría agregar un campo en la entidad para que cada tipo de crédito tenga su propio tipo de interés.

2. **Cachear plan de pago**: Si la solicitud no cambia, se podría cachear el plan de pago calculado para mejorar performance.

3. **Agregar histórico de decisiones**: El endpoint de comité podría incluir también las decisiones anteriores si la solicitud ha sido observada y reenviada.

4. **Validaciones adicionales**: Agregar validaciones de negocio como verificar que el ratio de endeudamiento no supere cierto umbral.

5. **Exportar a PDF**: Agregar endpoint para exportar la información del comité en formato PDF para las actas de sesión.

---

## Notas Técnicas

- El plan de pago se calcula usando el servicio `CalculoInteresService` y `PlanPagoService` existentes
- Si hay un error al calcular el plan de pago, se retorna `null` en lugar de fallar completamente
- Los servicios de ingresos y gastos ya existían y se reutilizaron
- La periodicidad de pago se incluye en todas las consultas relacionadas con solicitudes
- Los totales y análisis financiero se calculan usando los métodos `getTotalByPersona()` de cada servicio
