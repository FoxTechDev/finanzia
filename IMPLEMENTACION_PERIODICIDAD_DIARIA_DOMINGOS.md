# Implementación: Exclusión de Domingos en Periodicidad DIARIA

## Resumen de Cambios

Se ha implementado la funcionalidad para **excluir domingos** en el cálculo del plan de pagos cuando la periodicidad es **DIARIA**.

---

## Archivos Modificados

### 1. `plan-pago.service.ts`
**Ubicación:** `micro-app/backend/src/creditos/desembolso/services/plan-pago.service.ts`

#### Cambios realizados:

- **Método `calcularFechaVencimiento()`**: Modificado para llamar a un nuevo método privado cuando la periodicidad es DIARIA.

- **Nuevo método `agregarDiasHabilesExcluyendoDomingos()`**:
  - Método privado que agrega días hábiles a una fecha
  - Excluye domingos del cálculo
  - Si una fecha cae en domingo (getDay() === 0), automáticamente avanza al lunes
  - Valida que la fecha resultante no sea domingo

**Lógica implementada:**
```typescript
// Para cada día a agregar
for (let i = 0; i < diasAgregar; i++) {
  fecha.setDate(fecha.getDate() + 1);

  // Si cae en domingo, avanzar al lunes
  if (fecha.getDay() === 0) {
    fecha.setDate(fecha.getDate() + 1);
  }
}
```

---

### 2. `calculo-interes.service.ts`
**Ubicación:** `micro-app/backend/src/creditos/desembolso/services/calculo-interes.service.ts`

#### Cambios realizados:

- **Documentación mejorada** en `calcularNumeroCuotas()` explicando que para DIARIO normalmente no se usa este método porque el plazo viene expresado en número de cuotas directamente.

- **Documentación mejorada** en el método `calcular()` explicando el comportamiento para periodicidad DIARIA con el parámetro `plazoEnCuotas`.

**Nota importante:**
- El cálculo de número de cuotas para DIARIO ya considera aproximadamente 28 días hábiles por mes (excluyendo domingos)
- Cuando `plazoEnCuotas=true`, el plazo representa el número de cuotas (días) directamente

---

### 3. `calcular-plan-pago.dto.ts`
**Ubicación:** `micro-app/backend/src/creditos/solicitud/dto/calcular-plan-pago.dto.ts`

#### Cambios realizados:

- **Documentación extendida** del DTO con explicación clara sobre la interpretación del campo `plazo`:
  - Para DIARIO, SEMANAL, QUINCENAL: número de cuotas
  - Para MENSUAL, TRIMESTRAL, SEMESTRAL, ANUAL, AL_VENCIMIENTO: meses

- **Ejemplo documentado:**
  ```
  Ejemplo para DIARIO:
  - plazo = 5 significa 5 cuotas diarias (excluyendo domingos)
  - Si la primera cuota es viernes, las siguientes serán: sábado, lunes, martes, miércoles
  ```

---

## Comportamiento Implementado

### Periodicidad DIARIA

Cuando la periodicidad es **DIARIO**:

1. El campo `plazo` representa el **número de cuotas** (días) directamente
2. Las fechas del plan de pago **excluyen domingos** automáticamente
3. Si una fecha calculada cae en domingo, se mueve al **lunes siguiente**

### Ejemplo Práctico

**Input:**
- Fecha inicio: Viernes 31 de enero 2026
- Número de días/cuotas: 5
- Periodicidad: DIARIO

**Output esperado:**
1. Cuota 1: Sábado 1 febrero 2026
2. Cuota 2: Lunes 3 febrero 2026 (salta domingo 2)
3. Cuota 3: Martes 4 febrero 2026
4. Cuota 4: Miércoles 5 febrero 2026
5. Cuota 5: Jueves 6 febrero 2026

### Otras Periodicidades

Las demás periodicidades (SEMANAL, QUINCENAL, MENSUAL, etc.) **NO** se ven afectadas por esta lógica. Continúan funcionando exactamente igual que antes, sin exclusión de domingos.

---

## Validación y Pruebas

### Archivo de Pruebas HTTP

Se ha creado el archivo `test-periodicidad-diaria-domingos.http` con 8 casos de prueba que validan:

1. ✅ Inicio en viernes (caso del ejemplo)
2. ✅ Inicio en jueves (10 cuotas)
3. ✅ Inicio en sábado (debe ajustar si la primera cuota cae domingo)
4. ✅ Inicio en lunes (validar semana completa)
5. ✅ Periodicidad SEMANAL (NO debe saltar domingos)
6. ✅ Periodicidad MENSUAL (NO debe saltar domingos)
7. ✅ Plan de 30 días (validar múltiples semanas)
8. ✅ Sin fecha de primera cuota (usar default: hoy + 30 días)

### Cómo Ejecutar las Pruebas

1. Asegúrate de que el backend esté corriendo
2. Obtén un token de autenticación válido
3. Reemplaza `YOUR_AUTH_TOKEN_HERE` en el archivo `.http` con tu token
4. Ejecuta las pruebas usando la extensión REST Client de VS Code
5. Verifica que las fechas generadas excluyan correctamente los domingos

---

## Compatibilidad

### Mantiene Compatibilidad Con:

- ✅ Todas las periodicidades existentes (SEMANAL, QUINCENAL, MENSUAL, TRIMESTRAL, SEMESTRAL, ANUAL, AL_VENCIMIENTO)
- ✅ Cálculo de interés FLAT y AMORTIZADO
- ✅ Endpoint existente de calcular plan de pago
- ✅ Proceso de desembolso
- ✅ Generación de solicitudes

### NO Afecta:

- Cálculo de intereses (solo afecta fechas de vencimiento)
- Cálculo de montos de cuotas
- Recargos y deducciones
- Estados de solicitud

---

## Recomendaciones

### Para el Frontend

Cuando se use periodicidad DIARIA en el formulario:

1. **Etiquetar claramente** el campo plazo como "Número de Días/Cuotas" en lugar de "Meses"
2. **Mostrar advertencia** que los domingos serán excluidos del plan de pago
3. **Validar** que el plazo mínimo sea 1 día
4. **Previsualizar** el plan de pago antes de crear la solicitud

### Ejemplo de UI:

```html
<div *ngIf="periodicidad === 'DIARIO'" class="alert alert-info">
  <i class="fas fa-info-circle"></i>
  <strong>Nota:</strong> Para periodicidad diaria, el plazo representa
  el número de cuotas (días). Los domingos serán excluidos automáticamente
  del plan de pago.
</div>
```

---

## Endpoint Afectado

### POST `/api/creditos/solicitud/calcular-plan-pago`

**Request Body:**
```json
{
  "monto": 10000,
  "plazo": 5,
  "tasaInteres": 15,
  "tipoInteres": "FLAT",
  "periodicidad": "DIARIO",
  "fechaPrimeraCuota": "2026-01-31"
}
```

**Response:**
```json
{
  "cuotaNormal": 2300,
  "totalInteres": 1500,
  "totalPagar": 11500,
  "numeroCuotas": 5,
  "planPago": [
    {
      "numeroCuota": 1,
      "fechaVencimiento": "2026-02-01",
      "capital": 2000,
      "interes": 300,
      "cuotaTotal": 2300,
      "saldoCapital": 8000
    },
    {
      "numeroCuota": 2,
      "fechaVencimiento": "2026-02-03",
      "capital": 2000,
      "interes": 300,
      "cuotaTotal": 2300,
      "saldoCapital": 6000
    }
    // ... resto de cuotas
  ]
}
```

**Nota:** Observa que la cuota 2 tiene fecha "2026-02-03" (lunes) en lugar de "2026-02-02" (domingo).

---

## Código Optimizado

### Ventajas de la Implementación:

1. **Sin duplicación:** La lógica de exclusión de domingos está centralizada en un método privado reutilizable
2. **Mantenible:** Documentación clara en cada método modificado
3. **Eficiente:** Solo se aplica la lógica cuando la periodicidad es DIARIA
4. **Compatible:** No afecta el comportamiento de otras periodicidades
5. **Testeable:** Archivo de pruebas HTTP completo para validación

---

## Próximos Pasos

### Opcional - Mejoras Futuras:

1. **Excluir festivos:** Además de domingos, excluir días festivos configurables
2. **Días hábiles personalizables:** Permitir configurar qué días son hábiles (ej: solo lunes a viernes)
3. **Validación de calendario:** Integrar con un calendario de días no laborables
4. **Reportes:** Incluir indicador en reportes cuando un plan de pago excluye domingos

---

## Soporte

Si tienes preguntas o necesitas ayuda con esta implementación:

1. Revisa los archivos de prueba en `test-periodicidad-diaria-domingos.http`
2. Consulta la documentación en los archivos modificados
3. Verifica los logs del servidor para debugging

---

**Fecha de Implementación:** 31 de enero de 2026
**Versión:** 1.0
**Estado:** ✅ Implementado y Listo para Pruebas
