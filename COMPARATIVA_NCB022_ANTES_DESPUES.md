# Comparativa: Sistema Anterior vs NCB-022 Correcto

## Resumen de Cambios

Este documento compara el sistema de clasificación implementado anteriormente con la normativa NCB-022 correcta.

---

## COMPARATIVA GENERAL

| Aspecto | ANTES (Incorrecto) | AHORA (NCB-022 Correcto) |
|---------|-------------------|--------------------------|
| Número de categorías | 5 | 8 |
| Códigos | A, B, C, D, E | A1, A2, B, C1, C2, D1, D2, E |
| Diferenciación por sector | No | Sí (Consumo, Vivienda, Empresas) |
| Cumplimiento NCB-022 | NO | SÍ |

---

## COMPARATIVA DETALLADA DE CATEGORÍAS

### ANTES (Sistema Antiguo - INCORRECTO)

| Código | Nombre | Días Mora | Provisión | Estado |
|--------|--------|-----------|-----------|--------|
| A | Normal | 0-30 | 1% | INCORRECTO |
| B | Subnormal | 31-60 | 5% | INCORRECTO |
| C | Deficiente | 61-90 | 20% | INCORRECTO |
| D | Difícil Recuperación | 91-180 | 50% | INCORRECTO |
| E | Irrecuperable | >180 | 100% | INCORRECTO |

**Problemas identificados:**
- Solo 5 categorías (faltan 3)
- Categoría "A" no distingue entre A1 (0%) y A2 (1%)
- Porcentaje de provisión de "C" era 20% (debería ser 15% para C1 y 25% para C2)
- No diferencia entre sectores crediticios
- Rangos de días de mora incorrectos

---

### AHORA (NCB-022 CORRECTO - Sector CONSUMO)

| Código | Nombre | Días Mora | Provisión | Estado |
|--------|--------|-----------|-----------|--------|
| A1 | Normal | 0-7 | 0% | CORRECTO |
| A2 | Normal con debilidades | 8-30 | 1% | CORRECTO |
| B | Subnormal | 31-60 | 5% | CORRECTO |
| C1 | Deficiente | 61-90 | 15% | CORRECTO |
| C2 | Deficiente con mayor riesgo | 91-120 | 25% | CORRECTO |
| D1 | Difícil Recuperación | 121-150 | 50% | CORRECTO |
| D2 | Difícil Recuperación alto riesgo | 151-180 | 75% | CORRECTO |
| E | Irrecuperable | >180 | 100% | CORRECTO |

---

### AHORA (NCB-022 CORRECTO - Sector VIVIENDA)

| Código | Nombre | Días Mora | Provisión | Estado |
|--------|--------|-----------|-----------|--------|
| A1-VIV | Normal | 0-7 | 0% | CORRECTO |
| A2-VIV | Normal con debilidades | 8-30 | 1% | CORRECTO |
| B-VIV | Subnormal | 31-90 | 5% | CORRECTO |
| C1-VIV | Deficiente | 91-120 | 15% | CORRECTO |
| C2-VIV | Deficiente con mayor riesgo | 121-180 | 25% | CORRECTO |
| D1-VIV | Difícil Recuperación | 181-270 | 50% | CORRECTO |
| D2-VIV | Difícil Recuperación alto riesgo | 271-360 | 75% | CORRECTO |
| E-VIV | Irrecuperable | >360 | 100% | CORRECTO |

**Nota sobre VIVIENDA**: Los rangos de días de mora son MÁS AMPLIOS que Consumo debido a que son créditos de largo plazo con garantía hipotecaria.

---

## IMPACTO EN PROVISIONES

### Ejemplo: Préstamo con 40 días de mora

| Sistema | Clasificación | Provisión | Diferencia |
|---------|---------------|-----------|------------|
| ANTES (Incorrecto) | B - Subnormal | 5% | - |
| AHORA Consumo (Correcto) | B - Subnormal | 5% | Sin cambio |
| AHORA Vivienda (Correcto) | A2 - Normal | 1% | -4% |

### Ejemplo: Préstamo con 100 días de mora

| Sistema | Clasificación | Provisión | Diferencia |
|---------|---------------|-----------|------------|
| ANTES (Incorrecto) | D - Difícil | 50% | - |
| AHORA Consumo (Correcto) | C2 - Deficiente | 25% | -25% |
| AHORA Vivienda (Correcto) | C1 - Deficiente | 15% | -35% |

### Ejemplo: Préstamo con 5 días de mora

| Sistema | Clasificación | Provisión | Diferencia |
|---------|---------------|-----------|------------|
| ANTES (Incorrecto) | A - Normal | 1% | - |
| AHORA (Correcto) | A1 - Normal | 0% | -1% |

**OBSERVACIÓN CRÍTICA**: Los préstamos con mora entre 0-7 días estaban siendo aprovisionados al 1% cuando debería ser 0%. Esto representa sobreprovisión que afecta los resultados financieros.

---

## ANÁLISIS DE RIESGOS POR NO CUMPLIR NCB-022

### Riesgos Regulatorios

| Riesgo | Impacto | Descripción |
|--------|---------|-------------|
| Sanciones SSF | Alto | Multas por incumplimiento normativo |
| Observaciones en auditoría | Alto | Calificación negativa de auditoría externa |
| Reportes rechazados | Alto | Reportes R01, R02, R07 no aceptados por SSF |
| Intervención regulatoria | Muy Alto | En casos graves, la SSF puede intervenir la institución |

### Riesgos Financieros

| Riesgo | Impacto | Descripción |
|--------|---------|-------------|
| Provisiones incorrectas | Alto | Estados financieros no confiables |
| Capital regulatorio mal calculado | Alto | Incumplimiento de índices de solvencia |
| Pérdidas no reconocidas | Medio | Subestimación de riesgo real de cartera |
| Decisiones de negocio erróneas | Medio | Basadas en información incorrecta |

### Riesgos Operativos

| Riesgo | Impacto | Descripción |
|--------|---------|-------------|
| Clasificación incorrecta | Alto | Préstamos mal categorizados afectan gestión de cobranza |
| Procesos de cobranza inadecuados | Medio | No se activan acciones correctivas a tiempo |
| Pérdida de confianza | Alto | Stakeholders dudan de la gestión de riesgos |

---

## BENEFICIOS DE LA CORRECCIÓN

### Cumplimiento Normativo
- Alineación total con NCB-022 de la SSF
- Reportes regulatorios correctos y aceptados
- Sin riesgo de sanciones por este concepto
- Facilita auditorías externas

### Gestión de Riesgos
- Clasificación más granular (8 vs 5 categorías)
- Mejor seguimiento de deterioro de cartera
- Alertas tempranas más precisas
- Provisiones más ajustadas al riesgo real

### Gestión Financiera
- Estados financieros confiables
- Cálculo correcto de indicadores prudenciales
- Mejor toma de decisiones estratégicas
- Transparencia ante accionistas y reguladores

---

## CATEGORÍAS FALTANTES EN SISTEMA ANTERIOR

Las siguientes categorías NO EXISTÍAN en el sistema anterior y son OBLIGATORIAS según NCB-022:

| Código | Nombre | Provisión | Por qué es importante |
|--------|--------|-----------|------------------------|
| A1 | Normal | 0% | Distingue créditos sin mora (0% provisión) de los que tienen mora leve (1%) |
| C1 | Deficiente | 15% | Primera etapa de deficiencia, requiere acciones de recuperación inmediatas |
| C2 | Deficiente mayor | 25% | Deficiencia agravada, alto riesgo pero aún recuperable |
| D1 | Difícil Recuperación | 50% | Primera etapa de alta morosidad, recuperación improbable |
| D2 | Difícil Recuperación alto | 75% | Etapa crítica, recuperación muy improbable |

**Impacto de la falta de A1**: Todos los préstamos al día (sin mora) estaban siendo aprovisionados al 1% cuando deberían estar al 0%. Esto genera sobreprovisión y afecta negativamente los resultados.

**Impacto de la falta de C1, C2, D1, D2**: No se estaba reconociendo adecuadamente el deterioro progresivo de la cartera. Un préstamo pasaba de 20% a 50% de provisión sin etapas intermedias.

---

## MATRIZ DE CONVERSIÓN PARA MIGRACIÓN

Guía para reclasificar préstamos del sistema antiguo al nuevo:

### Sector CONSUMO

| Antiguo | Días Mora Antiguo | Nuevo | Días Mora Nuevo | Acción |
|---------|-------------------|-------|-----------------|--------|
| A | 0-7 | A1 | 0-7 | Reclasificar, provisión baja de 1% a 0% |
| A | 8-30 | A2 | 8-30 | Reclasificar, provisión se mantiene en 1% |
| B | 31-60 | B | 31-60 | Se mantiene igual |
| C | 61-90 | C1 | 61-90 | Reclasificar, provisión baja de 20% a 15% |
| D | 91-120 | C2 | 91-120 | Reclasificar crítico, provisión baja de 50% a 25% |
| D | 121-150 | D1 | 121-150 | Se mantiene en 50% |
| D | 151-180 | D2 | 151-180 | Reclasificar, provisión sube de 50% a 75% |
| E | >180 | E | >180 | Se mantiene igual |

### Sector VIVIENDA

| Antiguo | Días Mora Antiguo | Nuevo | Días Mora Nuevo | Acción |
|---------|-------------------|-------|-----------------|--------|
| A | 0-7 | A1-VIV | 0-7 | Reclasificar, provisión baja de 1% a 0% |
| A | 8-30 | A2-VIV | 8-30 | Reclasificar, provisión se mantiene en 1% |
| B | 31-60 | B-VIV | 31-90 | Revisar, rango más amplio |
| B | 61-90 | B-VIV | 31-90 | Se mantiene en B-VIV |
| C | 91-120 | C1-VIV | 91-120 | Reclasificar, provisión baja de 20% a 15% |
| D | 121-180 | C2-VIV | 121-180 | Reclasificar crítico, provisión baja de 50% a 25% |
| D | 181-270 | D1-VIV | 181-270 | Se mantiene en 50% |
| D | 271-360 | D2-VIV | 271-360 | Reclasificar, provisión sube de 50% a 75% |
| E | >360 | E-VIV | >360 | Se mantiene igual |

---

## ESTADÍSTICAS ESTIMADAS DE IMPACTO

Basado en una cartera típica de microfinanzas en El Salvador:

### Distribución Típica Antes (Estimado)

| Categoría Antigua | % Cartera | Provisión Promedio |
|-------------------|-----------|-------------------|
| A - Normal | 70% | 1% |
| B - Subnormal | 15% | 5% |
| C - Deficiente | 8% | 20% |
| D - Difícil | 5% | 50% |
| E - Irrecuperable | 2% | 100% |

**Provisión Total Estimada**: ~6.5% de la cartera

### Distribución Esperada Después (NCB-022 Consumo)

| Categoría Nueva | % Cartera | Provisión |
|-----------------|-----------|-----------|
| A1 - Normal | 50% | 0% |
| A2 - Normal debilidades | 20% | 1% |
| B - Subnormal | 15% | 5% |
| C1 - Deficiente | 5% | 15% |
| C2 - Deficiente mayor | 3% | 25% |
| D1 - Difícil | 3% | 50% |
| D2 - Difícil alto | 2% | 75% |
| E - Irrecuperable | 2% | 100% |

**Provisión Total Estimada**: ~5.5% de la cartera

**Impacto Financiero**: Reducción de ~1% en provisiones, lo que mejora los resultados pero requiere validación de que el cálculo es correcto según NCB-022.

---

## CONCLUSIÓN

La actualización de 5 a 8 categorías según NCB-022 es un cambio CRÍTICO Y OBLIGATORIO para el cumplimiento normativo. El sistema anterior presentaba:

1. INCUMPLIMIENTO TOTAL de la normativa NCB-022
2. Sobreprovisión en préstamos al día (A1 debería ser 0%, no 1%)
3. Falta de granularidad en etapas de deterioro (C1/C2, D1/D2)
4. No diferenciación por sectores crediticios

El nuevo sistema implementa correctamente las 8 categorías obligatorias, con porcentajes de provisión exactos según la normativa y rangos de días de mora diferenciados por sector.

**ACCIÓN REQUERIDA**: Ejecutar migración siguiendo la guía proporcionada en `GUIA_MIGRACION_NCB022.md`

---

**Documento preparado por**: Project Manager Senior - Sector Financiero
**Fecha**: 2026-01-23
**Base normativa**: NCB-022 - SSF El Salvador
**Referencias**:
- https://www.ssf.gob.sv/images/stories/desc_normas_contables_bancos/16_ncb-022.pdf
- https://webquery.ujmd.edu.sv/siab/bvirtual/BIBLIOTECA%20VIRTUAL/TESIS/30/MFE/ADRD0000855.pdf
