# Auditoría de Foreign Keys - Base de Datos micro_app

## Fecha de Auditoría
2026-01-25

## Resumen Ejecutivo

Se realizó una auditoría completa de las relaciones entre las entidades del backend (TypeORM) y las foreign keys existentes en la base de datos MySQL.

**Estado Actual:**
- Foreign Keys existentes: 28
- Foreign Keys faltantes: 20+
- Tablas duplicadas detectadas: 4 (lineacredito, referenciafamiliar, referenciapersonal, solicitudhistorial)

---

## 1. Foreign Keys Existentes (28)

Las siguientes foreign keys YA ESTÁN creadas en la base de datos:

### Módulo de Ubicación Geográfica
- ✅ `direccion.idPersona` → `persona.idPersona`
- ✅ `direccion.idDepartamento` → `departamento.idDepartamento`
- ✅ `direccion.idMunicipio` → `municipio.idMunicipio`
- ✅ `direccion.idDistrito` → `distrito.idDistrito`
- ✅ `municipio.idDepartamento` → `departamento.idDepartamento`
- ✅ `distrito.idMunicipio` → `municipio.idMunicipio`

### Módulo de Actividad Económica
- ✅ `actividad_economica.idPersona` → `persona.idPersona`
- ✅ `actividad_economica.idDepartamento` → `departamento.idDepartamento`
- ✅ `actividad_economica.idMunicipio` → `municipio.idMunicipio`
- ✅ `actividad_economica.idDistrito` → `distrito.idDistrito`

### Módulo de Referencias
- ✅ `referencia_personal.idPersona` → `persona.idPersona`
- ✅ `referencia_familiar.idPersona` → `persona.idPersona`
- ✅ `referenciapersonal.idPersona` → `persona.idPersona` (tabla duplicada)
- ✅ `referenciafamiliar.idPersona` → `persona.idPersona` (tabla duplicada)

### Módulo de Solicitudes
- ✅ `solicitud.personaId` → `persona.idPersona`
- ✅ `solicitud_historial.solicitudId` → `solicitud.id`

### Módulo de Garantías
- ✅ `garantia.solicitudId` → `solicitud.id`
- ✅ `garantia.tipoGarantiaId` → `tipo_garantia_catalogo.id`
- ✅ `garantia_hipotecaria.garantiaId` → `garantia.id`
- ✅ `garantia_hipotecaria.tipoInmuebleId` → `tipo_inmueble.id`
- ✅ `garantia_hipotecaria.departamentoId` → `departamento.idDepartamento`
- ✅ `garantia_hipotecaria.municipioId` → `municipio.idMunicipio`
- ✅ `garantia_hipotecaria.distritoId` → `distrito.idDistrito`
- ✅ `garantia_prendaria.garantiaId` → `garantia.id`
- ✅ `garantia_fiador.garantiaId` → `garantia.id`
- ✅ `garantia_fiador.personaFiadorId` → `persona.idPersona`
- ✅ `garantia_documentaria.garantiaId` → `garantia.id`
- ✅ `garantia_documentaria.tipoDocumentoId` → `tipo_documento_garantia.id`

---

## 2. Foreign Keys FALTANTES (Críticas)

Las siguientes relaciones están definidas en las entidades TypeORM pero **NO TIENEN** foreign key en la base de datos:

### 2.1 Módulo de Línea de Crédito y Tipo de Crédito
```sql
-- CRÍTICO: tipo_credito debe referenciar a linea_credito
❌ tipo_credito.lineaCreditoId → linea_credito.id
```
**Impacto:** No se garantiza integridad referencial entre tipos de crédito y líneas de crédito.

### 2.2 Módulo de Solicitudes
```sql
-- CRÍTICO: solicitud debe referenciar tipo y línea de crédito
❌ solicitud.lineaCreditoId → linea_credito.id
❌ solicitud.tipoCreditoId → tipo_credito.id

-- Referencias a usuarios (analista/aprobador)
❌ solicitud.analistaId → users.id
❌ solicitud.aprobadorId → users.id

-- Historial de solicitud (tabla duplicada)
❌ solicitudhistorial.solicitudId → solicitud.id
❌ solicitudhistorial.usuarioId → users.id
❌ solicitud_historial.usuarioId → users.id
```
**Impacto:** No se valida que una solicitud esté asociada a un tipo y línea de crédito válidos.

### 2.3 Módulo de Préstamos
```sql
-- CRÍTICO: prestamo debe referenciar solicitud, persona y tipo de crédito
❌ prestamo.solicitudId → solicitud.id
❌ prestamo.personaId → persona.idPersona
❌ prestamo.tipoCreditoId → tipo_credito.id

-- Relaciones con catálogos
❌ prestamo.clasificacionPrestamoId → clasificacion_prestamo.id
❌ prestamo.estadoPrestamoId → estado_prestamo.id

-- Auditoría
❌ prestamo.usuarioDesembolsoId → users.id
```
**Impacto:** No se garantiza que el préstamo esté asociado a una solicitud, cliente o tipo válido.

### 2.4 Módulo de Plan de Pago
```sql
-- CRÍTICO: plan_pago debe referenciar a prestamo
❌ plan_pago.prestamoId → prestamo.id
```
**Impacto:** Puede haber cuotas huérfanas sin préstamo asociado.

### 2.5 Módulo de Pagos
```sql
-- CRÍTICO: pagos deben referenciar a prestamo
❌ pago.prestamoId → prestamo.id

-- Detalle de cuotas pagadas
❌ pago_detalle_cuota.pagoId → pago.id
❌ pago_detalle_cuota.planPagoId → plan_pago.id

-- Auditoría
❌ pago.usuarioId → users.id
❌ pago.usuarioAnulacionId → users.id
```
**Impacto:** Pagos sin validación de existencia del préstamo.

### 2.6 Módulo de Deducciones y Recargos
```sql
-- Deducciones
❌ deduccion_prestamo.prestamoId → prestamo.id
❌ deduccion_prestamo.tipoDeduccionId → tipo_deduccion.id

-- Recargos
❌ recargo_prestamo.prestamoId → prestamo.id
❌ recargo_prestamo.tipoRecargoId → tipo_recargo.id
```

### 2.7 Módulo de Comité de Crédito
```sql
-- Decisiones del comité
❌ decision_comite.solicitudId → solicitud.id
❌ decision_comite.usuarioId → users.id
```

---

## 3. Problemas Detectados

### 3.1 Tablas Duplicadas
Se detectaron las siguientes tablas duplicadas que deben ser eliminadas:

1. **lineacredito** (duplicado de **linea_credito**)
2. **referenciafamiliar** (duplicado de **referencia_familiar**)
3. **referenciapersonal** (duplicado de **referencia_personal**)
4. **solicitudhistorial** (duplicado de **solicitud_historial**)

**Recomendación:** Migrar datos si existen y eliminar las tablas duplicadas.

### 3.2 Inconsistencias de Nomenclatura
- Algunas FK usan `idPersona` (snake_case antiguo)
- Otras FK usan `personaId` (camelCase)
- **Recomendación:** Mantener snake_case en BD (`persona_id`, `solicitud_id`, etc.)

---

## 4. Matriz de Relaciones Backend vs Base de Datos

| Entidad Backend | Relación TypeORM | FK en BD | Estado |
|----------------|------------------|----------|--------|
| TipoCredito | `@ManyToOne(() => LineaCredito)` | ❌ | Faltante |
| Solicitud | `@ManyToOne(() => LineaCredito)` | ❌ | Faltante |
| Solicitud | `@ManyToOne(() => TipoCredito)` | ❌ | Faltante |
| Solicitud | `@ManyToOne(() => Persona)` | ✅ | Existe |
| Garantia | `@ManyToOne(() => Solicitud)` | ✅ | Existe |
| Prestamo | `@OneToOne(() => Solicitud)` | ❌ | Faltante |
| Prestamo | `@ManyToOne(() => Persona)` | ❌ | Faltante |
| Prestamo | `@ManyToOne(() => TipoCredito)` | ❌ | Faltante |
| PlanPago | `@ManyToOne(() => Prestamo)` | ❌ | Faltante |
| Pago | `@ManyToOne(() => Prestamo)` | ❌ | Faltante |
| PagoDetalleCuota | `@ManyToOne(() => Pago)` | ❌ | Faltante |
| PagoDetalleCuota | `@ManyToOne(() => PlanPago)` | ❌ | Faltante |
| DeduccionPrestamo | `@ManyToOne(() => Prestamo)` | ❌ | Faltante |
| RecargoPrestamo | `@ManyToOne(() => Prestamo)` | ❌ | Faltante |
| DecisionComite | `@ManyToOne(() => Solicitud)` | ❌ | Faltante |

---

## 5. Recomendaciones de Implementación

### Prioridad 1 - CRÍTICA (Flujo Principal de Negocio)
1. `tipo_credito.lineaCreditoId` → `linea_credito.id`
2. `solicitud.lineaCreditoId` → `linea_credito.id`
3. `solicitud.tipoCreditoId` → `tipo_credito.id`
4. `prestamo.solicitudId` → `solicitud.id`
5. `prestamo.personaId` → `persona.idPersona`
6. `prestamo.tipoCreditoId` → `tipo_credito.id`
7. `plan_pago.prestamoId` → `prestamo.id`
8. `pago.prestamoId` → `prestamo.id`

### Prioridad 2 - ALTA (Detalle de Operaciones)
9. `pago_detalle_cuota.pagoId` → `pago.id`
10. `pago_detalle_cuota.planPagoId` → `plan_pago.id`
11. `deduccion_prestamo.prestamoId` → `prestamo.id`
12. `recargo_prestamo.prestamoId` → `prestamo.id`
13. `decision_comite.solicitudId` → `solicitud.id`

### Prioridad 3 - MEDIA (Catálogos y Auditoría)
14. `deduccion_prestamo.tipoDeduccionId` → `tipo_deduccion.id`
15. `recargo_prestamo.tipoRecargoId` → `tipo_recargo.id`
16. `prestamo.clasificacionPrestamoId` → `clasificacion_prestamo.id`
17. `prestamo.estadoPrestamoId` → `estado_prestamo.id`

### Prioridad 4 - BAJA (Usuarios/Auditoría)
18. `solicitud.analistaId` → `users.id`
19. `solicitud.aprobadorId` → `users.id`
20. `prestamo.usuarioDesembolsoId` → `users.id`
21. `pago.usuarioId` → `users.id`
22. `pago.usuarioAnulacionId` → `users.id`
23. `decision_comite.usuarioId` → `users.id`
24. `solicitud_historial.usuarioId` → `users.id`

---

## 6. Consideraciones Antes de Crear Foreign Keys

1. **Validar datos existentes:** Verificar que no haya registros con IDs huérfanos
2. **Backup de la base de datos:** Hacer respaldo completo antes de ejecutar
3. **FK checks:** Desactivar temporalmente si hay datos inconsistentes
4. **Índices:** Las FK crean índices automáticamente en MySQL
5. **ON DELETE/UPDATE:** Decidir el comportamiento (CASCADE, RESTRICT, SET NULL)

---

## 7. Comportamiento Recomendado para FK

### CASCADE (Eliminación en cascada)
- `garantia.solicitudId` → ON DELETE CASCADE
- `plan_pago.prestamoId` → ON DELETE CASCADE
- `pago_detalle_cuota.pagoId` → ON DELETE CASCADE

### RESTRICT (Prevenir eliminación)
- `prestamo.solicitudId` → ON DELETE RESTRICT
- `solicitud.tipoCreditoId` → ON DELETE RESTRICT
- `pago.prestamoId` → ON DELETE RESTRICT

### SET NULL (Establecer a NULL)
- `solicitud.analistaId` → ON DELETE SET NULL
- `prestamo.usuarioDesembolsoId` → ON DELETE SET NULL

---

## Conclusión

La base de datos tiene una cobertura del **58%** de foreign keys respecto a las relaciones definidas en las entidades TypeORM. Es crítico implementar las FK faltantes del flujo principal (Línea de Crédito → Tipo de Crédito → Solicitud → Préstamo → Plan de Pago → Pago) para garantizar la integridad referencial del sistema.
