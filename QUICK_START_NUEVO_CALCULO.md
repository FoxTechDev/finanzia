# Quick Start: Nuevo Cálculo de Plan de Pagos

## Cambio Principal
Se ajustó la lógica del cálculo del plan de pagos para usar **1 mes = 4 semanas exactas** (antes era 4.33).

---

## Regla Simple

| Ingreso del Usuario | Sistema Calcula |
|---------------------|-----------------|
| DIARIO: 30 días | → 30 cuotas diarias |
| SEMANAL: 3 meses | → 12 cuotas semanales (3 × 4) |
| QUINCENAL: 3 meses | → 6 cuotas quincenales (3 × 2) |
| MENSUAL: 3 meses | → 3 cuotas mensuales |
| TRIMESTRAL: 3 meses | → 1 cuota trimestral (3 / 3) |

---

## Prueba Rápida

### Usando archivo HTTP:
1. Abrir `test-nuevo-calculo-plan-pago.http`
2. Reemplazar `YOUR_JWT_TOKEN_HERE` con tu token
3. Ejecutar la prueba #2 (SEMANAL)

### Resultado Esperado:
```json
{
  "numeroCuotas": 12,  // ← 3 meses × 4 semanas
  "cuotaNormal": 87.50,
  "totalPagar": 1050.00,
  "planPago": [...]  // 12 fechas semanales
}
```

---

## Archivos Modificados
1. `calculo-interes.service.ts` - Cambio de 4.33 a 4 en SEMANAL
2. `solicitud.service.ts` - Solo DIARIO interpreta plazo como cuotas
3. `calcular-plan-pago.dto.ts` - Documentación actualizada
4. `tipo-credito.service.ts` - Validación con 4 semanas por mes

---

## Para Frontend
- **Etiqueta campo plazo:**
  - DIARIO: "Plazo (días)"
  - Otros: "Plazo (meses)"
- **Mostrar en tiempo real:** "3 meses = 12 cuotas semanales"

Ver ejemplos completos en: `EJEMPLOS_FRONTEND_PLAN_PAGOS.md`

---

## Validación

### Checklist Mínimo:
- [ ] SEMANAL: 3 meses → 12 cuotas ✓
- [ ] QUINCENAL: 3 meses → 6 cuotas ✓
- [ ] MENSUAL sigue funcionando igual ✓
- [ ] DIARIO sigue funcionando igual ✓

Ver checklist completo en: `CHECKLIST_VERIFICACION_CALCULO_PLAN_PAGOS.md`

---

## Documentación Completa
- **Resumen técnico:** `RESUMEN_AJUSTE_CALCULO_PLAN_PAGOS.md`
- **Pruebas HTTP:** `test-nuevo-calculo-plan-pago.http`
- **Ejemplos frontend:** `EJEMPLOS_FRONTEND_PLAN_PAGOS.md`
- **Checklist QA:** `CHECKLIST_VERIFICACION_CALCULO_PLAN_PAGOS.md`

---

**Fecha:** 2026-01-31
**Estado:** Listo para pruebas
