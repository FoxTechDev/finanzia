# MANUAL DE USUARIO - SISTEMA FINANZIA

## Sistema de Gestión de Microcréditos

**Versión:** 1.0
**Fecha:** Enero 2026

---

## TABLA DE CONTENIDO

1. [Ingreso de Clientes](#1-ingreso-de-clientes)
2. [Registro de Solicitudes de Crédito](#2-registro-de-solicitudes-de-crédito)
3. [Análisis del Asesor](#3-análisis-del-asesor)
4. [Resolución del Comité de Crédito](#4-resolución-del-comité-de-crédito)
5. [Desembolso del Préstamo](#5-desembolso-del-préstamo)
6. [Registro de Pagos](#6-registro-de-pagos)

---

## 1. INGRESO DE CLIENTES

### 1.1 Acceso al Módulo

1. Inicie sesión en el sistema FINANZIA
2. En el menú lateral, seleccione **Clientes > Nuevo Cliente**
3. También puede acceder desde **Clientes > Lista de Clientes** y hacer clic en el botón **+ Nuevo Cliente**

### 1.2 Formulario de Registro (3 Pasos)

#### **PASO 1: Datos Personales**

Complete los siguientes campos:

| Campo | Descripción | Obligatorio |
|-------|-------------|:-----------:|
| Nombre | Nombre(s) del cliente | ✓ |
| Apellido | Apellidos del cliente | ✓ |
| Fecha de Nacimiento | Formato DD/MM/AAAA | ✓ |
| Género | Masculino, Femenino u Otro | - |
| Nacionalidad | País de origen | ✓ |
| Estado Civil | Soltero/a, Casado/a, Divorciado/a, Viudo/a, Unión libre | - |
| Teléfono | Número de contacto principal | - |
| Correo Electrónico | Email válido | - |
| **Número de DUI** | Documento Único de Identidad | ✓ |
| Fecha de Expedición DUI | Fecha en que se emitió el DUI | ✓ |
| Lugar de Expedición | Lugar donde se emitió el DUI | ✓ |

> **Nota:** El número de DUI debe ser único en el sistema. Si ya existe un cliente con ese DUI, el sistema mostrará un mensaje de error.

Haga clic en **Siguiente** para continuar.

#### **PASO 2: Dirección de Domicilio**

Complete la dirección del cliente:

| Campo | Descripción | Obligatorio |
|-------|-------------|:-----------:|
| Departamento | Seleccione de la lista | ✓ |
| Municipio | Se carga según el departamento seleccionado | ✓ |
| Distrito | Se carga según el municipio seleccionado | ✓ |
| Dirección Detallada | Colonia, calle, número de casa, referencias | - |

Haga clic en **Siguiente** para continuar.

#### **PASO 3: Actividad Económica**

Complete la información laboral y económica:

| Campo | Descripción | Obligatorio |
|-------|-------------|:-----------:|
| Tipo de Actividad | Empleado, Independiente, Empresario, Jubilado, Estudiante, Otro | ✓ |
| Nombre de Empresa/Negocio | Donde labora o nombre del negocio propio | - |
| Ocupación/Cargo | Puesto que desempeña | - |
| Ingreso Mensual | Ingreso aproximado en USD | - |
| Departamento (trabajo) | Ubicación del trabajo/negocio | ✓ |
| Municipio (trabajo) | Se carga según departamento | ✓ |
| Distrito (trabajo) | Se carga según municipio | ✓ |
| Dirección del Trabajo | Dirección detallada del lugar de trabajo | - |

**Captura de Ubicación GPS:**
- Haga clic en el botón **Obtener Ubicación** para capturar automáticamente las coordenadas GPS del negocio/trabajo

### 1.3 Referencias (Opcional pero Recomendado)

#### Referencias Personales
Agregue al menos una referencia personal:
- **Nombre completo** de la referencia
- **Relación:** Amigo, Vecino, Compañero de trabajo, Conocido, Otro
- **Teléfono** de contacto

#### Referencias Familiares
Agregue referencias familiares:
- **Nombre completo** del familiar
- **Parentesco:** Padre, Madre, Hermano/a, Hijo/a, Cónyuge, Tío/a, Primo/a, Abuelo/a, Otro
- **Teléfono** de contacto

### 1.4 Guardar Cliente

1. Revise toda la información ingresada
2. Haga clic en el botón **Guardar**
3. El sistema mostrará un mensaje de confirmación
4. El cliente quedará registrado y disponible para solicitar créditos

---

## 2. REGISTRO DE SOLICITUDES DE CRÉDITO

### 2.1 Acceso al Módulo

1. En el menú lateral, seleccione **Créditos > Solicitudes**
2. Haga clic en el botón **+ Nueva Solicitud**

### 2.2 Formulario de Solicitud (5 Pasos)

#### **PASO 1: Selección del Cliente**

1. En el campo de búsqueda, escriba:
   - Número de DUI, o
   - Nombre del cliente, o
   - Apellido del cliente
2. Seleccione el cliente de la lista de resultados
3. El sistema mostrará los datos del cliente seleccionado:
   - Nombre completo
   - DUI
   - Teléfono
   - Correo electrónico

Haga clic en **Siguiente** para continuar.

#### **PASO 2: Tipo de Crédito y Destino**

| Campo | Descripción | Obligatorio |
|-------|-------------|:-----------:|
| Línea de Crédito | Categoría principal del crédito | ✓ |
| Tipo de Crédito | Producto específico dentro de la línea | ✓ |
| Destino del Crédito | Para qué se utilizará el dinero | ✓ |
| Descripción del Destino | Detalle adicional del uso del crédito | - |

**Destinos de Crédito Disponibles:**
- Capital de Trabajo
- Activo Fijo
- Consumo Personal
- Vivienda Nueva
- Vivienda Usada
- Mejora de Vivienda
- Consolidación de Deudas
- Educación
- Salud
- Vehículo
- Otro

Al seleccionar el Tipo de Crédito, el sistema mostrará:
- Monto mínimo y máximo permitido
- Plazo mínimo y máximo
- Tasa de interés mínima y máxima
- Si requiere garantía

Haga clic en **Siguiente** para continuar.

#### **PASO 3: Condiciones del Crédito**

| Campo | Descripción | Obligatorio |
|-------|-------------|:-----------:|
| Monto Solicitado | Cantidad en USD que solicita el cliente | ✓ |
| Plazo Solicitado | Número de meses para pagar | ✓ |
| Tasa de Interés Propuesta | Porcentaje anual de interés | ✓ |
| Fecha de Solicitud | Fecha en que se registra la solicitud | ✓ |

> **Validaciones:** El sistema verificará que el monto, plazo y tasa estén dentro de los rangos permitidos por el tipo de crédito seleccionado.

Haga clic en **Siguiente** para continuar.

#### **PASO 4: Garantías** (Si el producto lo requiere)

Si el tipo de crédito seleccionado requiere garantía, debe registrar al menos una:

##### Tipos de Garantía:

**A. Garantía Hipotecaria (Inmueble)**
| Campo | Descripción |
|-------|-------------|
| Tipo de Inmueble | Casa, terreno, local comercial, etc. |
| Valor del Avalúo | Valor estimado del inmueble |
| Dirección del Inmueble | Ubicación completa |
| Número de Inscripción CNR | Registro en el Centro Nacional de Registros |
| Folio y Libro | Datos de registro |
| Área del Terreno | En metros cuadrados |
| Área de Construcción | En metros cuadrados |
| Nombre del Valuador | Quien realizó el avalúo |
| Fecha del Avalúo | Cuándo se realizó |

**B. Garantía Prendaria (Bien Mueble)**
| Campo | Descripción |
|-------|-------------|
| Tipo de Bien | Vehículo, maquinaria, equipo, etc. |
| Valor del Avalúo | Valor estimado del bien |
| Descripción | Características del bien |
| Marca y Modelo | Si aplica |
| Año | Año de fabricación |
| Número de Serie | Identificador único |
| Placa | Si es vehículo |
| Ubicación del Bien | Dónde se encuentra |

**C. Garantía Fiduciaria (Fiador)**
1. Busque y seleccione al fiador (debe estar registrado como cliente)
2. Indique la relación con el solicitante
3. El sistema cargará automáticamente:
   - Ocupación del fiador
   - Ingreso mensual
   - Lugar de trabajo
   - Dirección laboral

**D. Garantía Documentaria**
| Campo | Descripción |
|-------|-------------|
| Tipo de Documento | Pagaré, letra de cambio, etc. |
| Número de Documento | Identificador |
| Fecha de Emisión | Cuándo se emitió |
| Monto del Documento | Valor |

**Cobertura de Garantías:**
- El sistema calcula automáticamente el porcentaje de cobertura
- Cobertura = (Valor Total de Garantías / Monto Solicitado) × 100
- Debe alcanzar el porcentaje mínimo requerido por la política

Haga clic en **Siguiente** para continuar.

#### **PASO 5: Análisis del Asesor** (Opcional en este paso)

Puede completar el análisis o dejarlo para después:
- Análisis detallado
- Antecedentes del cliente
- Capacidad de pago mensual
- Recomendación del asesor

### 2.3 Guardar Solicitud

1. Revise toda la información
2. Haga clic en **Guardar Solicitud**
3. El sistema asignará un número de solicitud único
4. La solicitud quedará en estado **CREADA**

---

## 3. ANÁLISIS DEL ASESOR

### 3.1 Acceso a la Solicitud

1. Vaya a **Créditos > Solicitudes**
2. Busque la solicitud por número o nombre del cliente
3. Haga clic en la solicitud para ver el detalle
4. Seleccione la pestaña **Análisis del Asesor**

### 3.2 Completar el Análisis

| Campo | Descripción | Obligatorio |
|-------|-------------|:-----------:|
| Análisis Detallado | Evaluación completa del caso | ✓ |
| Antecedentes del Cliente | Historial con la institución, comportamiento de pago, referencias comerciales | - |
| Capacidad de Pago Mensual | Monto que el cliente puede pagar mensualmente según su análisis | - |
| Recomendación | APROBAR, RECHAZAR u OBSERVAR | - |

### 3.3 Contenido del Análisis

El análisis debe incluir:

1. **Evaluación de Ingresos**
   - Fuente de ingresos
   - Estabilidad laboral
   - Ingresos adicionales

2. **Evaluación de Gastos**
   - Gastos fijos mensuales
   - Otras deudas
   - Dependientes económicos

3. **Capacidad de Pago**
   - Ingreso disponible después de gastos
   - Relación cuota/ingreso

4. **Evaluación de Garantías**
   - Calidad de las garantías presentadas
   - Cobertura suficiente

5. **Historial Crediticio**
   - Comportamiento en créditos anteriores
   - Referencias comerciales y personales

### 3.4 Recomendación del Asesor

| Recomendación | Descripción |
|---------------|-------------|
| **APROBAR** | El asesor considera que el crédito es viable y recomienda su aprobación |
| **RECHAZAR** | El asesor identifica riesgos significativos y no recomienda el crédito |
| **OBSERVAR** | Requiere información adicional o tiene condiciones especiales a considerar |

### 3.5 Enviar al Comité

1. Una vez completado el análisis, haga clic en **Guardar Análisis**
2. Luego haga clic en **Enviar al Comité**
3. La solicitud cambiará a estado **ENVIADA A COMITÉ**

---

## 4. RESOLUCIÓN DEL COMITÉ DE CRÉDITO

### 4.1 Acceso al Módulo

1. En el menú lateral, seleccione **Créditos > Comité de Crédito**
2. Verá la lista de solicitudes pendientes de resolución

### 4.2 Revisar la Solicitud

Al seleccionar una solicitud, el comité puede ver:

**Resumen de la Solicitud:**
- Número de solicitud
- Nombre del cliente
- Tipo y línea de crédito
- Destino del crédito
- Monto, plazo y tasa solicitados

**Análisis del Asesor:**
- Recomendación del asesor
- Análisis detallado
- Capacidad de pago estimada
- Antecedentes del cliente

**Garantías:**
- Lista de garantías presentadas
- Valor de cada garantía
- Porcentaje de cobertura total

### 4.3 Registrar la Decisión

Haga clic en **Registrar Decisión** para abrir el formulario de resolución.

#### **A. AUTORIZAR (Aprobar)**

Si el comité decide aprobar la solicitud:

| Campo | Descripción | Obligatorio |
|-------|-------------|:-----------:|
| Monto Autorizado | Puede ser igual o menor al solicitado | ✓ |
| Plazo Autorizado | Meses aprobados para el pago | ✓ |
| Tasa Autorizada | Tasa de interés aprobada | ✓ |
| Condiciones Especiales | Observaciones o condiciones adicionales | - |

#### **B. DENEGAR (Rechazar)**

Si el comité decide rechazar la solicitud:

| Campo | Descripción | Obligatorio |
|-------|-------------|:-----------:|
| Motivo del Rechazo | Razón detallada de la denegación | ✓ |

#### **C. OBSERVAR**

Si el comité requiere información adicional:

| Campo | Descripción | Obligatorio |
|-------|-------------|:-----------:|
| Observaciones | Qué información o documentos se requieren | ✓ |

### 4.4 Confirmar Decisión

1. Complete los campos según la decisión
2. Haga clic en **Confirmar Decisión**
3. El sistema actualizará el estado de la solicitud:
   - **APROBADA** si fue autorizada
   - **DENEGADA** si fue rechazada
   - **OBSERVADA** si requiere más información

---

## 5. DESEMBOLSO DEL PRÉSTAMO

### 5.1 Acceso al Módulo

1. En el menú lateral, seleccione **Créditos > Desembolsos**
2. Verá la lista de solicitudes aprobadas pendientes de desembolso
3. Seleccione la solicitud y haga clic en **Desembolsar**

### 5.2 Configuración del Desembolso (4 Pasos)

#### **PASO 1: Configuración General**

| Campo | Descripción | Obligatorio |
|-------|-------------|:-----------:|
| Periodicidad de Pago | Frecuencia de las cuotas | ✓ |
| Tipo de Interés | FLAT o AMORTIZADO | ✓ |
| Fecha Primera Cuota | Cuándo vence la primera cuota | ✓ |

**Periodicidades Disponibles:**
| Periodicidad | Descripción |
|--------------|-------------|
| DIARIO | Pago cada día |
| SEMANAL | Pago cada 7 días |
| QUINCENAL | Pago cada 15 días |
| MENSUAL | Pago cada mes |
| TRIMESTRAL | Pago cada 3 meses |
| SEMESTRAL | Pago cada 6 meses |
| ANUAL | Pago cada año |
| AL_VENCIMIENTO | Un solo pago al final |

**Tipos de Interés:**
| Tipo | Descripción |
|------|-------------|
| FLAT | Interés calculado sobre el monto original durante todo el plazo |
| AMORTIZADO | Interés calculado sobre saldo (sistema francés de amortización) |

Haga clic en **Siguiente** para continuar.

#### **PASO 2: Deducciones**

Las deducciones son montos que se descuentan del monto autorizado antes del desembolso.

Ejemplos de deducciones:
- Gastos de formalización
- Seguro de desgravamen
- Comisión por apertura
- Gastos de papelería

Para agregar una deducción:
1. Haga clic en **+ Agregar Deducción**
2. Seleccione el tipo de deducción
3. Indique si es monto FIJO o PORCENTAJE
4. Ingrese el valor
5. Repita para cada deducción necesaria

**Ejemplo:**
| Deducción | Tipo | Valor |
|-----------|------|-------|
| Comisión apertura | Porcentaje | 2% |
| Papelería | Fijo | $5.00 |

Haga clic en **Siguiente** para continuar.

#### **PASO 3: Cargos/Recargos**

Los cargos son montos que se agregan a cada cuota del préstamo.

Ejemplos de cargos:
- Seguro de vida
- Seguro del bien
- Ahorro programado
- GPS (en caso de vehículos)

Para agregar un cargo:
1. Haga clic en **+ Agregar Cargo**
2. Seleccione el tipo de cargo
3. Indique si es monto FIJO o PORCENTAJE
4. Ingrese el valor
5. Indique desde qué cuota aplica (normalmente 1)
6. Indique hasta qué cuota aplica (0 = hasta el final)

Haga clic en **Siguiente** para continuar.

#### **PASO 4: Confirmación**

Revise el resumen completo del desembolso:

**Resumen de Montos:**
```
Monto Autorizado:           $1,000.00
(-) Comisión apertura (2%):    $20.00
(-) Papelería:                  $5.00
─────────────────────────────────────
Monto a Desembolsar:          $975.00
```

**Información de Cuotas:**
```
Número de Cuotas:                  12
Cuota Normal:                  $95.00
Cargos por Cuota:               $5.00
Cuota Total:                  $100.00
```

**Totales:**
```
Capital:                    $1,000.00
Total Intereses:              $140.00
Total Cargos:                  $60.00
─────────────────────────────────────
TOTAL A PAGAR:              $1,200.00
```

**Plan de Pagos:**
El sistema mostrará la tabla completa con:
- Número de cuota
- Fecha de vencimiento
- Capital
- Interés
- Cargos
- Total cuota
- Saldo restante

### 5.3 Confirmar Desembolso

1. Verifique que toda la información sea correcta
2. Haga clic en **Confirmar Desembolso**
3. El sistema:
   - Creará el préstamo con un número único
   - Generará el plan de pagos
   - Actualizará el estado a **VIGENTE**
   - Registrará la fecha de desembolso

---

## 6. REGISTRO DE PAGOS

### 6.1 Acceso al Módulo

Existen dos formas de registrar pagos:

**Opción A: Desde la Lista de Préstamos**
1. Vaya a **Créditos > Préstamos**
2. Busque el préstamo por número o cliente
3. Haga clic en el préstamo
4. Seleccione **Registrar Pago**

**Opción B: Desde Consulta de Pagos**
1. Vaya a **Créditos > Consulta de Pagos**
2. Busque el préstamo
3. Haga clic en **Nuevo Pago**

### 6.2 Formulario de Pago

| Campo | Descripción | Obligatorio |
|-------|-------------|:-----------:|
| Fecha de Pago | Fecha en que se realiza el pago | ✓ |
| Monto a Pagar | Cantidad que el cliente está pagando | ✓ |
| Observaciones | Notas adicionales sobre el pago | - |

### 6.3 Vista Previa del Pago

Antes de confirmar, el sistema muestra:

**Resumen de Adeudo:**
```
Capital Pendiente:            $800.00
Interés Pendiente:            $50.00
Cargos Pendientes:            $10.00
Interés Moratorio:             $5.00
─────────────────────────────────────
TOTAL ADEUDADO:              $865.00

Cuotas Vencidas:                    2
Días en Mora:                      35
```

**Distribución del Pago:**

El sistema aplica el pago en el siguiente orden:
1. Interés Moratorio (si hay mora)
2. Interés Corriente
3. Cargos/Recargos
4. Capital

**Ejemplo de distribución:**
```
Monto del Pago:              $200.00

Distribución:
- Interés Moratorio:           $5.00
- Interés Corriente:          $50.00
- Cargos:                     $10.00
- Capital:                   $135.00
─────────────────────────────────────
Total Aplicado:              $200.00
```

**Cuotas Afectadas:**
| Cuota | Capital | Interés | Mora | Nuevo Estado |
|-------|---------|---------|------|--------------|
| 3 | $100.00 | $30.00 | $5.00 | PAGADA |
| 4 | $35.00 | $20.00 | $0.00 | PARCIAL |

### 6.4 Tipos de Pago

El sistema clasifica automáticamente el pago:

| Tipo | Descripción |
|------|-------------|
| **CUOTA COMPLETA** | Se pagó una o más cuotas completas |
| **PAGO PARCIAL** | Se pagó parte de una cuota |
| **PAGO ADELANTADO** | Se pagó más de lo adeudado actualmente |
| **CANCELACIÓN TOTAL** | Se liquidó todo el préstamo |

### 6.5 Confirmar Pago

1. Revise la distribución del pago
2. Verifique las cuotas que serán afectadas
3. Haga clic en **Confirmar Pago**
4. El sistema:
   - Registrará el pago con número único
   - Actualizará los saldos del préstamo
   - Actualizará el estado de las cuotas
   - Generará el recibo de pago

### 6.6 Imprimir Recibo

Después de confirmar el pago:
1. Aparecerá la opción **Imprimir Recibo**
2. El recibo incluye:
   - Número de pago
   - Fecha y hora
   - Datos del cliente
   - Número de préstamo
   - Monto pagado
   - Distribución del pago
   - Nuevo saldo

---

## ANEXOS

### A. Estados de una Solicitud

| Estado | Descripción |
|--------|-------------|
| CREADA | Solicitud recién registrada |
| PENDIENTE_ANÁLISIS | Esperando análisis del asesor |
| ENVIADA_A_COMITÉ | En revisión por el comité |
| APROBADA | Autorizada por el comité |
| DENEGADA | Rechazada por el comité |
| OBSERVADA | Requiere información adicional |
| LISTA_DESEMBOLSO | Aprobada y lista para desembolsar |
| DESEMBOLSADA | Préstamo activo creado |

### B. Estados de un Préstamo

| Estado | Descripción |
|--------|-------------|
| VIGENTE | Préstamo activo al día |
| MORA | Préstamo con cuotas vencidas |
| CANCELADO | Préstamo totalmente pagado |
| CASTIGADO | Préstamo irrecuperable |

### C. Estados de una Cuota

| Estado | Descripción |
|--------|-------------|
| PENDIENTE | Cuota por pagar |
| PARCIAL | Cuota parcialmente pagada |
| PAGADA | Cuota totalmente pagada |

### D. Clasificación de Riesgo (NCB-022)

| Categoría | Días de Mora | Provisión |
|-----------|--------------|-----------|
| A - Normal | 0-30 días | 1% |
| B - Subnormal | 31-90 días | 5% |
| C - Deficiente | 91-180 días | 20% |
| D - Difícil Cobro | 181-360 días | 50% |
| E - Irrecuperable | >360 días | 100% |

---

## SOPORTE

Para asistencia técnica o consultas sobre el sistema, contacte al administrador del sistema.

**FINANZIA S.C. DE R.L. DE C.V.**

---

*Este manual fue generado para la versión 1.0 del Sistema FINANZIA*
