# Instrucciones de Prueba: Recargos en Solicitud de Crédito

## Resumen

Se ha implementado la funcionalidad de **recargos** en el formulario de solicitud de crédito. Ahora puedes agregar recargos (seguros, GPS, ahorros, etc.) antes de calcular el plan de pago y visualizarlos en la previsualización.

---

## Archivos Modificados

### Frontend:
- ✅ `micro-app/frontend/src/app/core/models/credito.model.ts`
- ✅ `micro-app/frontend/src/app/features/creditos/components/solicitudes/solicitud-form.component.ts`

### Archivos Nuevos:
- ✅ `micro-app/frontend/src/app/features/creditos/components/solicitudes/agregar-recargo-dialog/agregar-recargo-dialog.component.ts`
- ✅ `micro-app/backend/test-recargos-solicitud.http` (archivo de pruebas HTTP)

---

## Cómo Probar (Frontend)

### Paso 1: Iniciar la Aplicación

```bash
# Terminal 1 - Backend
cd micro-app/backend
npm run start:dev

# Terminal 2 - Frontend
cd micro-app/frontend
ng serve
```

Abrir en el navegador: `http://localhost:4200`

---

### Paso 2: Crear una Nueva Solicitud

1. Ir a **Créditos → Solicitudes**
2. Hacer clic en **"Nueva Solicitud"**
3. Completar los pasos:
   - **Paso 1 - Cliente:** Seleccionar un cliente
   - **Paso 2 - Tipo de Crédito:** Seleccionar línea y tipo
   - **Paso 3 - Condiciones:**
     - Periodicidad de Pago: **MENSUAL**
     - Monto Solicitado: **$1000**
     - Plazo: **6 meses**
     - Tasa de Interés: **12%**
     - Tipo de Interés: **FLAT**

---

### Paso 3: Agregar Recargos

1. En el **Paso 3 - Condiciones**, buscar la sección **"Recargos Opcionales"**
2. Hacer clic en el botón **"Agregar Recargo"**

#### Ejemplo 1: Recargo Fijo (GPS)
- **Nombre:** GPS
- **Tipo de Cálculo:** Monto Fijo
- **Monto:** $5.00
- **Desde Cuota:** (dejar vacío)
- **Hasta Cuota:** (dejar vacío)
- Clic en **"Agregar Recargo"**

El recargo aparecerá como un chip:
```
┌─────────────────────────┐
│ GPS                 [X] │
│ $5.00                   │
└─────────────────────────┘
```

#### Ejemplo 2: Recargo Porcentual (Seguro)
- **Nombre:** Seguro de Vida
- **Tipo de Cálculo:** Porcentaje
- **Porcentaje:** 2
- **Desde Cuota:** (dejar vacío)
- **Hasta Cuota:** (dejar vacío)
- Clic en **"Agregar Recargo"**

El recargo aparecerá como:
```
┌─────────────────────────┐
│ Seguro de Vida      [X] │
│ 2%                      │
└─────────────────────────┘
```

#### Ejemplo 3: Recargo con Rango (Ahorro)
- **Nombre:** Ahorro Obligatorio
- **Tipo de Cálculo:** Monto Fijo
- **Monto:** $10.00
- **Desde Cuota:** 1
- **Hasta Cuota:** 3
- Clic en **"Agregar Recargo"**

El recargo aparecerá como:
```
┌────────────────────────────────┐
│ Ahorro Obligatorio         [X] │
│ $10.00 (Cuotas: 1 - 3)         │
└────────────────────────────────┘
```

---

### Paso 4: Calcular Plan de Pago

1. Hacer clic en **"Calcular Cuota y Plan de Pago"**
2. Esperar a que el backend calcule el plan
3. Verificar la **Previsualización del Plan de Pago**

#### Resultados Esperados:

**Con GPS ($5.00):**
- Cuota Base: ~$176.67
- Recargos: $5.00
- **Cuota Total: ~$181.67**

**Con Seguro (2%):**
- Cuota Base: ~$176.67
- Recargos: ~$3.53
- **Cuota Total: ~$180.20**

**Con GPS + Seguro:**
- Cuota Base: ~$176.67
- GPS: $5.00
- Seguro: ~$3.53
- **Cuota Total: ~$185.20**

---

### Paso 5: Verificar Tabla del Plan de Pago

La tabla debe mostrar una nueva columna **"Recargos"**:

```
┌──┬────────────┬─────────┬─────────┬──────────┬────────┬─────────┐
│# │ Fecha      │ Capital │ Interés │ Recargos │ Total  │ Saldo   │
├──┼────────────┼─────────┼─────────┼──────────┼────────┼─────────┤
│1 │ 01/04/2026 │ $166.67 │ $10.00  │ $5.00    │ $181.67│ $833.33 │
│2 │ 01/05/2026 │ $166.67 │ $10.00  │ $5.00    │ $181.67│ $666.66 │
│3 │ 01/06/2026 │ $166.67 │ $10.00  │ $5.00    │ $181.67│ $500.00 │
│4 │ 01/07/2026 │ $166.67 │ $10.00  │ $5.00    │ $181.67│ $333.33 │
│5 │ 01/08/2026 │ $166.67 │ $10.00  │ $5.00    │ $181.67│ $166.66 │
│6 │ 01/09/2026 │ $166.66 │ $10.00  │ $5.00    │ $181.66│ $0.00   │
└──┴────────────┴─────────┴─────────┴──────────┴────────┴─────────┘
```

---

### Paso 6: Eliminar Recargos

1. Hacer clic en la **X** del chip de un recargo
2. El recargo se eliminará inmediatamente
3. El plan de pago calculado se limpiará
4. Deberás hacer clic nuevamente en **"Calcular Cuota y Plan de Pago"**

---

## Cómo Probar (Backend - REST Client)

### Opción 1: Usar archivo HTTP incluido

1. Abrir en VS Code: `micro-app/backend/test-recargos-solicitud.http`
2. Instalar extensión **REST Client** si no la tienes
3. Hacer clic en **"Send Request"** sobre cualquier test

### Opción 2: Usar Postman o Insomnia

**Endpoint:**
```
POST http://localhost:3000/api/solicitudes/calcular-plan-pago
```

**Headers:**
```
Content-Type: application/json
```

**Body (ejemplo con recargos):**
```json
{
  "monto": 1000,
  "plazo": 6,
  "tasaInteres": 12,
  "periodicidad": "MENSUAL",
  "tipoInteres": "FLAT",
  "fechaPrimeraCuota": "2026-03-01",
  "recargos": [
    {
      "nombre": "GPS",
      "tipo": "FIJO",
      "valor": 5.00
    },
    {
      "nombre": "Seguro de Vida",
      "tipo": "PORCENTAJE",
      "valor": 2
    }
  ]
}
```

**Respuesta Esperada:**
```json
{
  "cuotaNormal": 176.67,
  "totalInteres": 60.00,
  "totalPagar": 1310.00,
  "numeroCuotas": 6,
  "planPago": [
    {
      "numeroCuota": 1,
      "fechaVencimiento": "2026-04-01",
      "capital": 166.67,
      "interes": 10.00,
      "recargos": 8.53,
      "cuotaTotal": 185.20,
      "saldoCapital": 833.33
    },
    ...
  ]
}
```

---

## Casos de Prueba Recomendados

### Test 1: Sin Recargos (Baseline)
- Monto: $1000
- Plazo: 6 meses
- Tasa: 12%
- Periodicidad: MENSUAL
- Recargos: (ninguno)
- **Resultado:** Cuota = $176.67

### Test 2: Recargo Fijo Simple
- Recargo: GPS $5.00
- **Resultado:** Cuota = $181.67

### Test 3: Recargo Porcentual
- Recargo: Seguro 2%
- **Resultado:** Cuota = ~$180.20

### Test 4: Múltiples Recargos
- GPS: $5.00
- Seguro: 2%
- Ahorro: $10.00
- **Resultado:** Cuota = ~$195.20

### Test 5: Recargo en Rango Específico
- GPS: $5.00 (solo cuotas 1-3)
- **Resultado:**
  - Cuotas 1-3: $181.67
  - Cuotas 4-6: $176.67

### Test 6: Periodicidad DIARIA con Recargos
- Monto: $500
- Plazo: 2 meses
- Número de Cuotas: 45
- Recargo: GPS $0.50
- **Resultado:** 45 cuotas diarias con recargo

### Test 7: Tipo AMORTIZADO con Recargos
- Monto: $5000
- Plazo: 12 meses
- Tipo: AMORTIZADO
- Recargos: Seguro 1.5%
- **Resultado:** Cuotas decrecientes + recargo

---

## Validaciones Implementadas

El diálogo valida automáticamente:

1. ✅ **Nombre requerido**
2. ✅ **Valor >= 0**
3. ✅ **Porcentaje <= 100%**
4. ✅ **Desde Cuota >= 1**
5. ✅ **Hasta Cuota >= 1**
6. ✅ **Hasta Cuota >= Desde Cuota**

---

## Características Responsive

El diálogo y la sección de recargos se adaptan a:

- **Desktop:** Diálogo de 500px, formulario en 2 columnas
- **Tablet:** Diálogo ajustado, formulario en 2 columnas
- **Mobile:** Diálogo full-width, formulario en 1 columna

---

## Troubleshooting

### El botón "Agregar Recargo" no funciona
- ✅ Verificar que se haya importado `MatDialogModule`
- ✅ Verificar consola del navegador por errores

### Los recargos no aparecen en el plan de pago
- ✅ Verificar que se haya hecho clic en "Calcular Cuota y Plan de Pago"
- ✅ Verificar la consola de red (Network) por errores del backend

### La columna "Recargos" no aparece
- ✅ Verificar que haya recargos agregados
- ✅ El método `tieneRecargos()` debe retornar `true`

### Errores al calcular plan
- ✅ Verificar que el backend esté corriendo
- ✅ Verificar endpoint: `POST /api/solicitudes/calcular-plan-pago`
- ✅ Revisar logs del backend

---

## Próximos Pasos (Opcionales)

1. **Persistir recargos en la solicitud:**
   - Guardar recargos al crear/actualizar la solicitud
   - Cargar recargos al editar una solicitud existente

2. **Catálogo de recargos:**
   - Crear tabla `tipo_recargo_solicitud`
   - Permitir seleccionar recargos predefinidos

3. **Editar recargos:**
   - Botón para editar un recargo en lugar de solo eliminar
   - Reutilizar el diálogo con datos prellenados

4. **Reportes:**
   - Incluir recargos en el detalle de solicitud
   - Mostrar recargos en reportes PDF

---

## Soporte

Si encuentras problemas:

1. Verificar los logs del backend
2. Revisar la consola del navegador
3. Usar el archivo `test-recargos-solicitud.http` para probar el backend directamente

---

## Documentación Adicional

- 📄 `RESUMEN_IMPLEMENTACION_RECARGOS_SOLICITUD.md` - Detalles técnicos completos
- 🧪 `test-recargos-solicitud.http` - Tests de API REST
- 💻 `agregar-recargo-dialog.component.ts` - Código del diálogo

---

**Implementación Completada: 2026-02-01**
**Versión: 1.0.0**
