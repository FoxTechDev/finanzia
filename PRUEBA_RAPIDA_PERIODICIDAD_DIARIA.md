# Prueba Rápida: Periodicidad DIARIA

## Objetivo
Verificar que el nuevo campo "Número de Días de Pago" funciona correctamente para la periodicidad DIARIA.

---

## Paso 1: Iniciar la Aplicación

### Backend
```bash
cd micro-app/backend
npm run start:dev
```

### Frontend
```bash
cd micro-app/frontend
npm start
# o
ng serve
```

Abrir navegador en: `http://localhost:4200`

---

## Paso 2: Navegar al Formulario

1. Login con tus credenciales
2. Ir a: **Créditos → Solicitudes → Nueva Solicitud**
3. Debería aparecer el formulario de solicitud de crédito

---

## Paso 3: Probar el Nuevo Campo

### Test 1: Verificar Visibilidad del Campo

1. En el **Paso 1 (Cliente)**:
   - Buscar y seleccionar cualquier cliente
   - Clic en "Siguiente"

2. En el **Paso 2 (Tipo de Crédito)**:
   - Seleccionar una Línea de Crédito
   - Seleccionar un Tipo de Crédito
   - Clic en "Siguiente"

3. En el **Paso 3 (Condiciones)**:
   - Buscar el campo **"Periodicidad de Pago"**
   - Seleccionar **"MENSUAL"** o **"SEMANAL"**
   - ✅ **Verificar:** NO debe aparecer campo "Número de Días de Pago"

4. Ahora seleccionar **"DIARIO"**:
   - ✅ **Verificar:** DEBE aparecer el campo "Número de Días de Pago"
   - ✅ **Verificar:** El campo tiene placeholder "Ej: 30, 60, 90"
   - ✅ **Verificar:** El campo tiene icono de calendario
   - ✅ **Verificar:** El hint dice "Cantidad total de días de pago (1-365)"

### Test 2: Validaciones

Con periodicidad **DIARIO** seleccionada:

1. **Dejar el campo vacío** y hacer clic fuera:
   - ✅ **Verificar:** Aparece error "Ingrese el número de días"

2. **Ingresar 0** (cero):
   - ✅ **Verificar:** Aparece error "Mínimo 1 día"

3. **Ingresar 400**:
   - ✅ **Verificar:** Aparece error "Máximo 365 días"

4. **Ingresar -5** (negativo):
   - ✅ **Verificar:** HTML5 previene la entrada o muestra error

5. **Ingresar 30**:
   - ✅ **Verificar:** No hay errores, campo válido

### Test 3: Sincronización con Campo Plazo

1. Con periodicidad **DIARIO** seleccionada
2. Ingresar **45** en "Número de Días de Pago"
3. ✅ **Verificar:** El campo "Plazo (días)" automáticamente muestra **45**
4. ✅ **Verificar:** El campo "Plazo (días)" está en **solo lectura** (gris, no editable)
5. Cambiar a **60** en "Número de Días de Pago"
6. ✅ **Verificar:** El campo "Plazo (días)" se actualiza a **60**

### Test 4: Cambio de Periodicidad

1. Con periodicidad **DIARIO** y valor **30** en "Número de Días"
2. Cambiar periodicidad a **"MENSUAL"**
3. ✅ **Verificar:** El campo "Número de Días de Pago" desaparece (transición suave)
4. ✅ **Verificar:** El campo "Plazo (meses)" ahora es **editable**
5. ✅ **Verificar:** El label del plazo cambió de "(días)" a "(meses)"
6. Volver a cambiar a **"DIARIO"**
7. ✅ **Verificar:** El campo "Número de Días de Pago" reaparece
8. ✅ **Verificar:** El valor anterior (30) se ha limpiado (campo vacío)

### Test 5: Cálculo del Plan de Pago

1. Completar el formulario con los siguientes datos:
   ```
   Periodicidad: DIARIO
   Número de Días: 30
   Monto: $1,000.00
   Tasa: 15%
   Tipo de Interés: FLAT
   ```

2. Hacer clic en **"Calcular Cuota y Plan de Pago"**

3. ✅ **Verificar:** Se muestra la previsualización con:
   - Cuota calculada
   - Total Interés
   - Total a Pagar
   - Número de Cuotas: **30**

4. ✅ **Verificar:** La tabla del plan muestra **30 filas** (una por cada día)

5. ✅ **Verificar:** Las fechas son consecutivas (día tras día)

### Test 6: Guardar Solicitud

1. Con los datos del Test 5
2. Hacer clic en **"Guardar y Continuar"**
3. ✅ **Verificar:** Se muestra mensaje de éxito con número de solicitud
4. ✅ **Verificar:** Se avanza al siguiente paso sin errores

### Test 7: Editar Solicitud Existente

1. Ir a **Créditos → Solicitudes**
2. Buscar la solicitud recién creada (periodicidad DIARIO)
3. Hacer clic en el botón de "Editar"
4. Ir al **Paso 3 (Condiciones)**
5. ✅ **Verificar:** El campo "Número de Días de Pago" muestra el valor guardado (30)
6. ✅ **Verificar:** El campo "Plazo (días)" también muestra 30
7. Cambiar "Número de Días" a **45**
8. Guardar cambios
9. ✅ **Verificar:** Se actualiza correctamente

---

## Paso 4: Pruebas Responsive

### Desktop (Pantalla grande)

1. Abrir el formulario en pantalla completa
2. ✅ **Verificar:** El campo "Número de Días" ocupa aproximadamente la mitad del ancho
3. ✅ **Verificar:** Los campos están bien alineados
4. ✅ **Verificar:** No hay etiquetas superpuestas

### Tablet (Pantalla mediana)

1. Redimensionar navegador a ~800px de ancho
2. ✅ **Verificar:** El campo se adapta correctamente
3. ✅ **Verificar:** El texto es legible
4. ✅ **Verificar:** Los botones son accesibles

### Mobile (Pantalla pequeña)

1. Abrir DevTools (F12)
2. Activar modo responsive
3. Seleccionar dispositivo: **iPhone 12** o **Samsung Galaxy S20**
4. ✅ **Verificar:** El campo ocupa el 100% del ancho
5. ✅ **Verificar:** El área de toque es suficientemente grande (mínimo 44x44px)
6. ✅ **Verificar:** Los mensajes de error se muestran correctamente
7. ✅ **Verificar:** El teclado numérico se abre automáticamente al tocar el campo

---

## Paso 5: Pruebas de Accesibilidad

### Navegación por Teclado

1. Seleccionar periodicidad **DIARIO** usando teclado (Tab + Enter)
2. Presionar **Tab** para ir al campo "Número de Días"
3. ✅ **Verificar:** El campo recibe el foco (borde azul)
4. Ingresar valor con teclado: **30**
5. Presionar **Tab** para ir al siguiente campo
6. ✅ **Verificar:** El campo "Plazo" muestra el valor sincronizado

### Screen Reader (Opcional)

Si tienes un lector de pantalla (NVDA, JAWS, etc.):

1. Activar lector de pantalla
2. Navegar al campo "Número de Días de Pago"
3. ✅ **Verificar:** El lector anuncia:
   - "Número de Días de Pago, campo de edición, número"
   - "Cantidad total de días de pago (1-365)"
4. ✅ **Verificar:** Los errores se anuncian correctamente

---

## Paso 6: Verificar Backend

### Inspeccionar Request

1. Abrir DevTools (F12) → Pestaña **Network**
2. Completar formulario con periodicidad DIARIO y 30 días
3. Hacer clic en "Guardar y Continuar"
4. Buscar request `POST /api/solicitudes`
5. Ir a **Payload** o **Request Body**
6. ✅ **Verificar:** El JSON contiene:
   ```json
   {
     "periodicidadPagoId": 1,
     "plazoSolicitado": 30,
     "montoSolicitado": 1000,
     "tasaInteresPropuesta": 15,
     ...
   }
   ```
7. ✅ **Verificar:** NO se envía el campo `numeroDiasPago` (es solo UI)
8. ✅ **Verificar:** El campo `plazoSolicitado` tiene el valor correcto (30)

### Calcular Plan de Pago

1. Completar formulario con periodicidad DIARIO y 30 días
2. En DevTools → Network
3. Hacer clic en "Calcular Cuota y Plan de Pago"
4. Buscar request `POST /api/solicitudes/calcular-plan`
5. ✅ **Verificar:** El JSON contiene:
   ```json
   {
     "monto": 1000,
     "plazo": 30,
     "tasaInteres": 15,
     "periodicidad": "DIARIO",
     "tipoInteres": "FLAT",
     "fechaPrimeraCuota": "2024-01-31"
   }
   ```
6. ✅ **Verificar:** El response contiene un array de 30 cuotas

---

## Paso 7: Pruebas de Regresión

### Verificar Otras Periodicidades

1. **MENSUAL:**
   - ✅ Campo "Número de Días" NO aparece
   - ✅ Campo "Plazo (meses)" es editable
   - ✅ Cálculo de plan funciona correctamente

2. **SEMANAL:**
   - ✅ Campo "Número de Días" NO aparece
   - ✅ Campo "Plazo (semanas)" es editable
   - ✅ Cálculo de plan funciona correctamente

3. **QUINCENAL:**
   - ✅ Campo "Número de Días" NO aparece
   - ✅ Campo "Plazo (quincenas)" es editable
   - ✅ Cálculo de plan funciona correctamente

---

## Checklist Final

### Funcionalidad ✅
- [ ] Campo aparece solo para DIARIO
- [ ] Validaciones funcionan (required, min, max)
- [ ] Sincronización con plazo funciona
- [ ] Campo plazo es readonly para DIARIO
- [ ] Cálculo de plan genera 30 cuotas correctas
- [ ] Guardado de solicitud funciona
- [ ] Edición de solicitud funciona
- [ ] Cambio de periodicidad limpia el campo

### UI/UX ✅
- [ ] Label es claro
- [ ] Placeholder ayuda al usuario
- [ ] Hint es informativo
- [ ] Mensajes de error son específicos
- [ ] No hay problemas visuales
- [ ] Transición suave entre periodicidades

### Responsive ✅
- [ ] Funciona en desktop
- [ ] Funciona en tablet
- [ ] Funciona en mobile
- [ ] Touch-friendly en móviles

### Compatibilidad ✅
- [ ] Otras periodicidades no afectadas
- [ ] Backend recibe datos correctos
- [ ] Solicitudes existentes funcionan
- [ ] Sin breaking changes

---

## Casos de Error Conocidos

### No Debería Pasar

❌ **Error:** El campo aparece para periodicidad MENSUAL
- **Causa:** Bug en lógica de mostrarCamposFechaDiaria
- **Acción:** Revisar código TypeScript

❌ **Error:** El plazo no se sincroniza con numeroDiasPago
- **Causa:** Suscripción no funciona
- **Acción:** Revisar valueChanges subscription

❌ **Error:** Validación no funciona
- **Causa:** Validadores no aplicados correctamente
- **Acción:** Revisar setValidators en onPeriodicidadChange

---

## Resultado Esperado

Al completar todas las pruebas, deberías tener:

✅ **0 errores críticos**
✅ **0 problemas de UI**
✅ **100% funcionalidad operativa**
✅ **Compatibilidad total con código existente**

---

## En Caso de Problemas

### Si el campo NO aparece para DIARIO:

1. Verificar en consola del navegador si hay errores
2. Verificar que el catálogo de periodicidades tiene un registro con `codigo = 'DIARIO'`
3. Revisar que `mostrarCamposFechaDiaria` signal se actualiza

### Si las validaciones NO funcionan:

1. Verificar en consola que no hay errores de TypeScript
2. Inspeccionar el FormControl en DevTools:
   ```javascript
   // En consola del navegador
   ng.getComponent($0).condicionesForm.get('numeroDiasPago')
   ```
3. Verificar que los validadores están presentes

### Si el plazo NO se sincroniza:

1. Verificar que la suscripción a valueChanges está activa
2. Verificar que `mostrarCamposFechaDiaria()` retorna `true`
3. Revisar que no hay errores en consola

---

## Reportar Issues

Si encuentras algún bug, reportar con:

1. **Descripción:** ¿Qué esperabas que pasara? ¿Qué pasó en su lugar?
2. **Pasos para reproducir:** Lista numerada de pasos
3. **Screenshots:** Capturas de pantalla del error
4. **Consola:** Errores de la consola del navegador
5. **Entorno:** Navegador, versión, sistema operativo

---

**Creado por:** Claude Code (Anthropic)
**Fecha:** 2026-01-31
**Versión:** 1.0.0
