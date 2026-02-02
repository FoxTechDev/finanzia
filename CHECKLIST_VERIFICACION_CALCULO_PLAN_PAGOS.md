# Checklist de Verificación: Nuevo Cálculo de Plan de Pagos

## Objetivo
Verificar que el nuevo sistema de cálculo de plan de pagos funcione correctamente con la regla **1 mes = 4 semanas base**.

---

## 1. Preparación

### 1.1. Asegurar que el backend esté actualizado
```bash
cd micro-app/backend
npm install
npm run build
npm run start:dev
```

### 1.2. Verificar que el servidor esté corriendo
- URL: http://localhost:3000/api
- Estado: El servidor debe estar escuchando en el puerto 3000

---

## 2. Pruebas Básicas (Endpoint: POST /api/solicitudes/calcular-plan-pago)

### 2.1. Prueba DIARIO (sin cambios)
**Input:**
```json
{
  "monto": 1000,
  "plazo": 30,
  "tasaInteres": 24,
  "periodicidad": "DIARIO",
  "tipoInteres": "AMORTIZADO",
  "fechaPrimeraCuota": "2026-02-01"
}
```

**Output Esperado:**
- ✅ `numeroCuotas: 30`
- ✅ Plan de pago con 30 fechas diarias
- ✅ Domingos excluidos automáticamente

**Estado:** ⬜ Pasó | ⬜ Falló

---

### 2.2. Prueba SEMANAL (cambio principal: 3 meses × 4 = 12 cuotas)
**Input:**
```json
{
  "monto": 1000,
  "plazo": 3,
  "tasaInteres": 24,
  "periodicidad": "SEMANAL",
  "tipoInteres": "AMORTIZADO",
  "fechaPrimeraCuota": "2026-02-01"
}
```

**Output Esperado:**
- ✅ `numeroCuotas: 12` (3 × 4)
- ✅ Plan de pago con 12 fechas semanales (cada 7 días)
- ✅ `cuotaNormal` aproximadamente: $87.50
- ✅ `totalPagar` > `monto` (incluye interés)

**Estado:** ⬜ Pasó | ⬜ Falló

**Notas:**
_____________________________________________________________

---

### 2.3. Prueba QUINCENAL (3 meses × 2 = 6 cuotas)
**Input:**
```json
{
  "monto": 1000,
  "plazo": 3,
  "tasaInteres": 24,
  "periodicidad": "QUINCENAL",
  "tipoInteres": "AMORTIZADO",
  "fechaPrimeraCuota": "2026-02-01"
}
```

**Output Esperado:**
- ✅ `numeroCuotas: 6` (3 × 2)
- ✅ Plan de pago con 6 fechas quincenales (cada 15 días)
- ✅ `cuotaNormal` > cuota semanal (menos cuotas)

**Estado:** ⬜ Pasó | ⬜ Falló

**Notas:**
_____________________________________________________________

---

### 2.4. Prueba MENSUAL (3 meses × 1 = 3 cuotas)
**Input:**
```json
{
  "monto": 1000,
  "plazo": 3,
  "tasaInteres": 24,
  "periodicidad": "MENSUAL",
  "tipoInteres": "AMORTIZADO",
  "fechaPrimeraCuota": "2026-02-01"
}
```

**Output Esperado:**
- ✅ `numeroCuotas: 3` (3 × 1)
- ✅ Plan de pago con 3 fechas mensuales (mismo día cada mes)
- ✅ `cuotaNormal` > cuota quincenal

**Estado:** ⬜ Pasó | ⬜ Falló

**Notas:**
_____________________________________________________________

---

### 2.5. Prueba TRIMESTRAL (3 meses / 3 = 1 cuota)
**Input:**
```json
{
  "monto": 1000,
  "plazo": 3,
  "tasaInteres": 24,
  "periodicidad": "TRIMESTRAL",
  "tipoInteres": "AMORTIZADO",
  "fechaPrimeraCuota": "2026-02-01"
}
```

**Output Esperado:**
- ✅ `numeroCuotas: 1` (3 / 3)
- ✅ Plan de pago con 1 fecha (pago único)
- ✅ `cuotaNormal` = `totalPagar` (una sola cuota)

**Estado:** ⬜ Pasó | ⬜ Falló

**Notas:**
_____________________________________________________________

---

## 3. Pruebas de Borde

### 3.1. SEMANAL - 1 mes
**Input:** `plazo: 1, periodicidad: SEMANAL`

**Output Esperado:**
- ✅ `numeroCuotas: 4` (1 × 4)

**Estado:** ⬜ Pasó | ⬜ Falló

---

### 3.2. SEMANAL - 6 meses
**Input:** `plazo: 6, periodicidad: SEMANAL`

**Output Esperado:**
- ✅ `numeroCuotas: 24` (6 × 4)

**Estado:** ⬜ Pasó | ⬜ Falló

---

### 3.3. QUINCENAL - 6 meses
**Input:** `plazo: 6, periodicidad: QUINCENAL`

**Output Esperado:**
- ✅ `numeroCuotas: 12` (6 × 2)

**Estado:** ⬜ Pasó | ⬜ Falló

---

## 4. Validación de Parámetros (TipoCreditoService)

### 4.1. Verificar mensajes de error con límites
**Escenario:**
- Tipo de crédito: plazo mínimo = 1 mes, plazo máximo = 12 meses
- Solicitud: `plazo: 0.5, periodicidad: SEMANAL`

**Output Esperado:**
- ✅ Error: "El plazo mínimo permitido es 4 semanas" (1 mes × 4)

**Estado:** ⬜ Pasó | ⬜ Falló

**Cómo probar:**
```bash
# Endpoint: POST /api/solicitudes
# Crear una solicitud con plazo menor al mínimo
```

---

### 4.2. Verificar límites máximos
**Escenario:**
- Tipo de crédito: plazo máximo = 12 meses
- Solicitud: `plazo: 15, periodicidad: SEMANAL`

**Output Esperado:**
- ✅ Error: "El plazo máximo permitido es 48 semanas" (12 meses × 4)

**Estado:** ⬜ Pasó | ⬜ Falló

---

## 5. Cálculo de Interés

### 5.1. FLAT (microcréditos)
**Input:**
```json
{
  "monto": 1000,
  "plazo": 3,
  "tasaInteres": 24,
  "periodicidad": "SEMANAL",
  "tipoInteres": "FLAT"
}
```

**Verificaciones:**
- ✅ `numeroCuotas: 12`
- ✅ Interés distribuido uniformemente en todas las cuotas
- ✅ `cuotaTotal` constante en todas las cuotas
- ✅ `interes` por cuota = `totalInteres / 12`

**Estado:** ⬜ Pasó | ⬜ Falló

**Notas:**
_____________________________________________________________

---

### 5.2. AMORTIZADO (sistema francés)
**Input:**
```json
{
  "monto": 1000,
  "plazo": 3,
  "tasaInteres": 24,
  "periodicidad": "SEMANAL",
  "tipoInteres": "AMORTIZADO"
}
```

**Verificaciones:**
- ✅ `numeroCuotas: 12`
- ✅ `cuotaTotal` constante (aproximadamente)
- ✅ `interes` decrece en cada cuota
- ✅ `capital` crece en cada cuota
- ✅ Última cuota: `saldoCapital: 0`

**Estado:** ⬜ Pasó | ⬜ Falló

**Notas:**
_____________________________________________________________

---

## 6. Comparación con Cálculo Manual

### 6.1. Calcular manualmente (SEMANAL, 3 meses)
**Valores conocidos:**
- Monto: $1,000
- Plazo: 3 meses
- Tasa: 24% anual
- Periodicidad: SEMANAL
- Tipo: AMORTIZADO

**Cálculo manual:**
1. Número de cuotas: 3 × 4 = **12 cuotas**
2. Tasa periódica: 24% / 52 semanas ≈ 0.4615% semanal
3. Fórmula cuota: P × [r(1+r)^n] / [(1+r)^n - 1]
4. Cuota esperada: ≈ $87.50

**Comparar con resultado del sistema:**
- ✅ `numeroCuotas` coincide: _______
- ✅ `cuotaNormal` coincide: _______
- ✅ `totalInteres` coincide: _______

**Estado:** ⬜ Pasó | ⬜ Falló

**Notas:**
_____________________________________________________________

---

## 7. Verificación de Fechas del Plan de Pagos

### 7.1. SEMANAL - Intervalo de 7 días
**Verificar:**
- ✅ Primera cuota: `fechaPrimeraCuota + 1 día`
- ✅ Segunda cuota: `primera cuota + 7 días`
- ✅ Tercera cuota: `segunda cuota + 7 días`
- ✅ ... y así sucesivamente

**Método:**
```javascript
// En el resultado del plan de pago
planPago[0].fechaVencimiento // Primera cuota
planPago[1].fechaVencimiento // Segunda cuota (debe ser +7 días)
```

**Estado:** ⬜ Pasó | ⬜ Falló

---

### 7.2. QUINCENAL - Intervalo de 15 días
**Verificar:**
- ✅ Intervalo entre cuotas: exactamente 15 días

**Estado:** ⬜ Pasó | ⬜ Falló

---

### 7.3. MENSUAL - Mismo día cada mes
**Verificar:**
- ✅ Si primera cuota es 15 de febrero, segunda debe ser 15 de marzo

**Estado:** ⬜ Pasó | ⬜ Falló

---

## 8. Logs y Debugging

### 8.1. Verificar logs de CalculoInteresService
**Buscar en consola:**
```
🧮 CÁLCULO INTERÉS - Parámetros convertidos:
🧮 CÁLCULO FLAT - Resultado:
🧮 CÁLCULO AMORTIZADO - Resultado:
```

**Verificar que:**
- ✅ Los parámetros se convierten correctamente
- ✅ El número de cuotas es el esperado
- ✅ No hay errores de división por cero
- ✅ No hay valores `NaN` o `Infinity`

**Estado:** ⬜ Pasó | ⬜ Falló

---

## 9. Pruebas de Integración

### 9.1. Crear solicitud completa
**Pasos:**
1. Crear un cliente
2. Seleccionar tipo de crédito
3. Crear solicitud con periodicidad SEMANAL y plazo 3 meses
4. Verificar que la solicitud se cree correctamente
5. Consultar solicitud con plan de pago: `GET /api/solicitudes/:id/con-plan-pago`

**Verificar:**
- ✅ Solicitud creada exitosamente
- ✅ Plan de pago generado con 12 cuotas
- ✅ Fechas correctas en el plan de pago

**Estado:** ⬜ Pasó | ⬜ Falló

---

### 9.2. Aprobar solicitud y generar préstamo
**Pasos:**
1. Analizar solicitud
2. Trasladar a comité
3. Aprobar solicitud
4. Generar desembolso/préstamo

**Verificar:**
- ✅ El préstamo generado tiene 12 cuotas
- ✅ Las fechas de vencimiento son semanales
- ✅ Los montos coinciden con el plan calculado

**Estado:** ⬜ Pasó | ⬜ Falló

---

## 10. Pruebas de Regresión

### 10.1. MENSUAL (no debe cambiar)
**Verificar que MENSUAL siga funcionando como antes:**
- ✅ 3 meses = 3 cuotas
- ✅ 6 meses = 6 cuotas
- ✅ 12 meses = 12 cuotas

**Estado:** ⬜ Pasó | ⬜ Falló

---

### 10.2. DIARIO (no debe cambiar)
**Verificar que DIARIO siga funcionando como antes:**
- ✅ 30 días = 30 cuotas
- ✅ Domingos excluidos
- ✅ Fechas consecutivas correctas

**Estado:** ⬜ Pasó | ⬜ Falló

---

## 11. Resumen de Resultados

### Total de Pruebas: 25

| Categoría | Pasaron | Fallaron | Pendientes |
|-----------|---------|----------|------------|
| Pruebas Básicas (5) | ___ | ___ | ___ |
| Pruebas de Borde (3) | ___ | ___ | ___ |
| Validación de Parámetros (2) | ___ | ___ | ___ |
| Cálculo de Interés (2) | ___ | ___ | ___ |
| Comparación Manual (1) | ___ | ___ | ___ |
| Verificación de Fechas (3) | ___ | ___ | ___ |
| Logs y Debugging (1) | ___ | ___ | ___ |
| Integración (2) | ___ | ___ | ___ |
| Regresión (2) | ___ | ___ | ___ |

**Total:** ___/25 pasaron

---

## 12. Problemas Encontrados

### Problema 1:
**Descripción:** ____________________________________________________

**Severidad:** ⬜ Crítico | ⬜ Mayor | ⬜ Menor

**Solución:** _______________________________________________________

---

### Problema 2:
**Descripción:** ____________________________________________________

**Severidad:** ⬜ Crítico | ⬜ Mayor | ⬜ Menor

**Solución:** _______________________________________________________

---

## 13. Firma de Aprobación

**Probado por:** _______________________

**Fecha:** _____________

**Estado final:**
- ⬜ Aprobado - Listo para producción
- ⬜ Aprobado con observaciones menores
- ⬜ Rechazado - Requiere correcciones

**Observaciones:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

## Recursos Adicionales

- **Archivo de pruebas HTTP:** `test-nuevo-calculo-plan-pago.http`
- **Documentación técnica:** `RESUMEN_AJUSTE_CALCULO_PLAN_PAGOS.md`
- **Ejemplos frontend:** `EJEMPLOS_FRONTEND_PLAN_PAGOS.md`

---

**Última actualización:** 2026-01-31
