# Checklist de Verificación - Endpoints Mejorados

## Pre-requisitos

- [ ] Backend ejecutándose en puerto 3000
- [ ] Base de datos MySQL conectada
- [ ] Datos de prueba cargados:
  - [ ] Al menos 1 persona registrada
  - [ ] Al menos 1 solicitud de crédito
  - [ ] Ingresos del cliente registrados
  - [ ] Gastos del cliente registrados
  - [ ] Actividad económica del cliente registrada

---

## Verificación del Endpoint: GET /api/solicitudes/:id/detalle

### Verificar que retorna:
- [ ] Datos básicos de la solicitud
- [ ] Objeto `persona` con información del cliente
- [ ] Objeto `tipoCredito` con información del producto
- [ ] Objeto `periodicidadPago` con:
  - [ ] Campo `codigo` (ej: 'MENSUAL')
  - [ ] Campo `nombre` (ej: 'Mensual')
- [ ] Objeto `estado` con información del estado actual
- [ ] Objeto `planPago` (puede ser null si no hay periodicidad)

### Si planPago no es null, verificar:
- [ ] Campo `cuotaNormal` (número)
- [ ] Campo `totalInteres` (número)
- [ ] Campo `totalPagar` (número)
- [ ] Campo `numeroCuotas` (número)
- [ ] Array `planPago` con cuotas

### Cada cuota debe tener:
- [ ] `numeroCuota` (1, 2, 3, ...)
- [ ] `fechaVencimiento` (fecha)
- [ ] `capital` (número)
- [ ] `interes` (número)
- [ ] `cuotaTotal` (número)
- [ ] `saldoCapital` (número)

### Verificar cálculos:
- [ ] La suma de todas las cuotas iguala el `totalPagar`
- [ ] El saldo de capital disminuye en cada cuota
- [ ] La última cuota tiene saldo de capital = 0
- [ ] Las fechas están correctamente espaciadas según periodicidad

---

## Verificación del Endpoint: GET /api/comite/:solicitudId/revision

### Verificar estructura de respuesta:
- [ ] Objeto `solicitud` presente
- [ ] Array `ingresos` presente (puede estar vacío)
- [ ] Array `gastos` presente (puede estar vacío)
- [ ] Objeto `analisisFinanciero` presente

### Verificar objeto `solicitud`:
- [ ] Contiene datos básicos de la solicitud
- [ ] Objeto `persona` incluido con:
  - [ ] Datos básicos del cliente
  - [ ] Objeto `actividadEconomica` (si existe)
- [ ] Objeto `tipoCredito` incluido
- [ ] Objeto `periodicidadPago` incluido
- [ ] Objeto `estado` incluido
- [ ] Array `historial` incluido

### Verificar array `ingresos`:
- [ ] Cada ingreso tiene `id`
- [ ] Cada ingreso tiene `monto`
- [ ] Cada ingreso tiene objeto `tipoIngreso` con:
  - [ ] Campo `nombre`
  - [ ] Campo `descripcion` (opcional)
- [ ] Campo `descripcion` del ingreso (opcional)

### Verificar array `gastos`:
- [ ] Cada gasto tiene `id`
- [ ] Cada gasto tiene `monto`
- [ ] Cada gasto tiene objeto `tipoGasto` con:
  - [ ] Campo `nombre`
  - [ ] Campo `descripcion` (opcional)
- [ ] Campo `descripcion` del gasto (opcional)

### Verificar objeto `analisisFinanciero`:
- [ ] Campo `totalIngresos` (número)
- [ ] Campo `totalGastos` (número)
- [ ] Campo `capacidadPago` (número)
- [ ] Campo `ratioEndeudamiento` (número o null)

### Verificar cálculos del análisis financiero:
- [ ] `totalIngresos` = suma de todos los montos de ingresos
- [ ] `totalGastos` = suma de todos los montos de gastos
- [ ] `capacidadPago` = totalIngresos - totalGastos
- [ ] Si `capacidadPago` > 0:
  - [ ] `ratioEndeudamiento` debe ser un número
  - [ ] `ratioEndeudamiento` debe ser >= 0
- [ ] Si `capacidadPago` <= 0:
  - [ ] `ratioEndeudamiento` puede ser null

---

## Verificación del Endpoint: GET /api/comite/pendientes

### Verificar que retorna array de solicitudes:
- [ ] Cada solicitud tiene periodicidadPago incluido
- [ ] Solo se muestran solicitudes con estado 'EN_COMITE'
- [ ] Los filtros funcionan correctamente:
  - [ ] `montoMinimo`
  - [ ] `montoMaximo`
  - [ ] `fechaDesde`
  - [ ] `fechaHasta`
  - [ ] `lineaCreditoId`

---

## Pruebas de Integración

### Escenario 1: Solicitud sin periodicidad
- [ ] El endpoint `/detalle` retorna planPago = null
- [ ] No se genera error
- [ ] El resto de la información está presente

### Escenario 2: Solicitud con valores solicitados y aprobados diferentes
- [ ] El plan de pago usa los valores aprobados (si existen)
- [ ] Si no hay valores aprobados, usa los solicitados

### Escenario 3: Cliente sin ingresos ni gastos
- [ ] El endpoint `/revision` no falla
- [ ] Arrays de ingresos y gastos están vacíos
- [ ] `totalIngresos` = 0
- [ ] `totalGastos` = 0
- [ ] `capacidadPago` = 0
- [ ] `ratioEndeudamiento` = null

### Escenario 4: Cliente sin actividad económica
- [ ] El endpoint `/revision` no falla
- [ ] `persona.actividadEconomica` = null o undefined
- [ ] El resto de la información está presente

---

## Pruebas de Rendimiento

### Tiempo de respuesta aceptable:
- [ ] `/solicitudes/:id/detalle` responde en < 500ms
- [ ] `/comite/:solicitudId/revision` responde en < 1000ms
- [ ] `/comite/pendientes` responde en < 500ms

### Verificar queries a la base de datos:
- [ ] No hay queries N+1 (usar eager loading correctamente)
- [ ] Las relaciones se cargan en una sola query
- [ ] Los totales se calculan eficientemente

---

## Pruebas de Errores

### Error 404 - Not Found:
- [ ] `/solicitudes/99999/detalle` retorna 404 si no existe
- [ ] `/comite/99999/revision` retorna 404 si no existe
- [ ] El mensaje de error es claro

### Error 400 - Bad Request:
- [ ] IDs inválidos retornan error apropiado
- [ ] Parámetros mal formados retornan error claro

### Error 500 - Server Error:
- [ ] Si hay error al calcular plan de pago, no rompe el endpoint
- [ ] Los logs muestran información útil del error
- [ ] El cliente recibe respuesta apropiada

---

## Documentación

- [ ] Los decoradores de Swagger están presentes
- [ ] Los endpoints están documentados en el código
- [ ] El archivo `MEJORAS_ENDPOINTS_SOLICITUD_COMITE.md` está actualizado
- [ ] El archivo `test-endpoints-mejorados.http` funciona correctamente

---

## Código

### Calidad del código:
- [ ] No hay errores de TypeScript
- [ ] No hay warnings en la compilación
- [ ] Los tipos están correctamente definidos
- [ ] No se usa `any` innecesariamente

### Mejores prácticas:
- [ ] Los servicios están correctamente inyectados
- [ ] Los métodos tienen documentación JSDoc
- [ ] Los nombres de variables son descriptivos
- [ ] El código sigue las convenciones de NestJS

---

## Base de Datos

### Verificar integridad de datos:
- [ ] Las relaciones entre tablas están correctas
- [ ] Los índices necesarios existen
- [ ] No hay registros huérfanos
- [ ] Los tipos de datos son apropiados

---

## Próximos Pasos Después de Verificación

Una vez completada la verificación:

1. [ ] Integrar endpoints en el frontend
2. [ ] Agregar tests unitarios
3. [ ] Agregar tests de integración
4. [ ] Configurar Swagger UI (opcional)
5. [ ] Documentar en el manual de usuario
6. [ ] Actualizar colección de Postman/Insomnia

---

## Notas

- Si alguna verificación falla, revisar los logs del servidor
- Verificar que las relaciones en las entidades están correctamente definidas
- Asegurar que los datos de prueba están completos
- Si el plan de pago no se calcula, verificar que la periodicidad esté configurada

---

## Resultado Final

Total de verificaciones: [ ] / [ ]

Estado: [ ] Aprobado  [ ] Con observaciones  [ ] Rechazado

Observaciones:
_____________________________________________________________________
_____________________________________________________________________
_____________________________________________________________________

Fecha de verificación: _______________
Verificado por: _____________________
