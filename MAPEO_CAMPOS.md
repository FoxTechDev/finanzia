# DOCUMENTACIÓN DE MAPEO - EXCEL A SISTEMA DE CRÉDITOS

## Fecha de generación
2026-01-24T22:09:48.706Z

## Estructura del archivo Excel

### Formato
- **Archivo:** prestamos.xlsx
- **Hoja:** bdPrestamo
- **Estructura:** Matricial con fechas como columnas

### Filas
1. **Fila 1:** Encabezados - "Nombre" + fechas de transacciones (formato Excel numérico)
2. **Fila 2:** Subencabezados - "Desem.", "Pago", "Saldo" (repetidos para cada fecha)
3. **Fila 3+:** Datos de clientes y transacciones

### Columnas
- **Columna 1:** Nombre completo del cliente
- **Columnas 2+:** Agrupadas de 3 en 3 por fecha:
  - Desembolso (monto del préstamo otorgado)
  - Pago (monto del pago realizado)
  - Saldo (saldo restante del préstamo)

## Mapeo de datos

### PERSONA (clientes)
| Campo Excel | Campo BD | Transformación |
|-------------|----------|----------------|
| Nombre completo (Col 1) | nombre | Primeras 1-2 palabras |
| Nombre completo (Col 1) | apellido | Últimas palabras |
| N/A | fechaNacimiento | Valor por defecto: "1990-01-01" |
| N/A | sexo | Valor por defecto: "Femenino" |
| N/A | nacionalidad | Valor por defecto: "Salvadoreña" |
| N/A | estadoCivil | NULL |
| N/A | telefono | NULL |
| N/A | correoElectronico | NULL |
| Generado | numeroDui | Formato: 12345678-9 (generado) |
| N/A | fechaEmisionDui | Valor por defecto: "2015-01-01" |
| N/A | lugarEmisionDui | Valor por defecto: "San Salvador" |

### DIRECCION
| Campo Excel | Campo BD | Transformación |
|-------------|----------|----------------|
| N/A | personaId | Relación con persona creada |
| N/A | departamentoId | Valor por defecto: 6 (San Salvador) |
| N/A | municipioId | Valor por defecto: 1 (San Salvador) |
| N/A | distritoId | Valor por defecto: 1 |
| N/A | detalleDireccion | NULL |

### PRESTAMO
| Campo Excel | Campo BD | Transformación |
|-------------|----------|----------------|
| N/A | solicitudId | NULL |
| Nombre (Col 1) | personaId | Relación con persona |
| Generado | numeroCredito | Formato: CRE{AÑO}{ID} |
| N/A | tipoCreditoId | Valor por defecto: 1 |
| Desembolso | montoAutorizado | Valor numérico |
| Desembolso | montoDesembolsado | Valor numérico |
| N/A | plazoAutorizado | Valor por defecto: 12 cuotas |
| N/A | tasaInteres | Valor por defecto: 0.10 (10%) |
| N/A | tasaInteresMoratorio | Valor por defecto: 0.15 (15%) |
| N/A | tipoInteres | Valor por defecto: "FLAT" |
| N/A | periodicidadPago | Valor por defecto: "SEMANAL" |
| Calculado | cuotaNormal | (monto + interés) / plazo |
| Calculado | cuotaTotal | (monto + interés) / plazo |
| N/A | numeroCuotas | Valor por defecto: 12 |
| Calculado | totalInteres | monto * tasa |
| N/A | totalRecargos | 0 |
| Calculado | totalPagar | monto + interés |
| Saldo | saldoCapital | Último saldo registrado |
| N/A | saldoInteres | 0 |
| N/A | capitalMora | 0 |
| N/A | interesMora | 0 |
| N/A | diasMora | 0 |
| Fecha (Fila 1) | fechaOtorgamiento | Fecha del desembolso |
| Fecha (Fila 1) | fechaPrimeraCuota | Fecha del desembolso |
| Calculado | fechaVencimiento | fechaOtorgamiento + plazo |
| Fecha último pago | fechaUltimoPago | Fecha del último pago registrado |
| Condicional | fechaCancelacion | Fecha si saldo = 0 |
| N/A | categoriaNCB022 | Valor por defecto: "A" |
| Calculado | estado | "VIGENTE" o "CANCELADO" según saldo |

### PAGO
| Campo Excel | Campo BD | Transformación |
|-------------|----------|----------------|
| Préstamo | prestamoId | Relación con préstamo |
| Generado | numeroPago | Formato: PAG{AÑO}{ID} |
| Fecha (Fila 1) | fechaPago | Fecha de la columna |
| Fecha (Fila 1) | fechaRegistro | Fecha de la columna |
| Pago | montoPagado | Valor numérico |
| Calculado | capitalAplicado | montoPagado * 0.8 |
| Calculado | interesAplicado | montoPagado * 0.2 |
| N/A | recargosAplicado | 0 |
| N/A | interesMoratorioAplicado | 0 |
| Saldo anterior | saldoCapitalAnterior | Saldo antes del pago |
| N/A | saldoInteresAnterior | 0 |
| Saldo | saldoCapitalPosterior | Saldo después del pago |
| N/A | saldoInteresPosterior | 0 |
| N/A | tipoPago | "CUOTA_COMPLETA" |
| N/A | estado | "APLICADO" |

## Datos generados/calculados

### DUI (numeroDui)
Formato: 12345678-9
- 8 dígitos base generados secuencialmente
- 1 dígito verificador

### Número de Crédito (numeroCredito)
Formato: CRE{AÑO}{SECUENCIA}
Ejemplo: CRE2025000001

### Número de Pago (numeroPago)
Formato: PAG{AÑO}{SECUENCIA}
Ejemplo: PAG2025000001

### Cálculos financieros
- **Total interés:** montoDesembolsado * tasaInteres
- **Total a pagar:** montoDesembolsado + totalInteres
- **Cuota normal:** totalPagar / numeroCuotas
- **Capital aplicado:** montoPagado * 0.8 (80% del pago)
- **Interés aplicado:** montoPagado * 0.2 (20% del pago)

## Validaciones aplicadas

1. **Nombres:** Se extraen de la columna 1, parseando nombre y apellidos
2. **Fechas:** Se convierten del formato numérico de Excel a ISO (YYYY-MM-DD)
3. **Montos:** Se validan como números, con valor por defecto 0 si están vacíos
4. **Estado del préstamo:** Se marca como "CANCELADO" si saldoCapital = 0
5. **Relaciones:** Se mantiene integridad referencial entre persona → préstamo → pago

## Limitaciones y advertencias

⚠️ **Datos no disponibles en el Excel:**
- Información personal completa (DUI, teléfono, email, fecha nacimiento)
- Términos específicos del préstamo (tasa, plazo, tipo)
- Distribución exacta de pagos entre capital e interés
- Información de solicitud de crédito
- Dirección completa del cliente

⚠️ **Asunciones realizadas:**
- Tasa de interés: 10% (FLAT)
- Plazo: 12 cuotas semanales
- Distribución de pago: 80% capital, 20% interés
- Ubicación: San Salvador
- Tipo de crédito: Personal

⚠️ **Acciones requeridas post-importación:**
1. Completar datos personales de clientes (DUI real, teléfono, email)
2. Verificar y ajustar términos de préstamos (tasas, plazos)
3. Revisar distribución de pagos entre capital e interés
4. Actualizar direcciones completas
5. Validar saldos y estados de préstamos

## Archivos generados

1. **clientes_import.json** - Datos de personas/clientes
2. **direcciones_import.json** - Direcciones de clientes
3. **prestamos_import.json** - Datos de préstamos
4. **pagos_import.json** - Histórico de pagos
5. **reporte_transformacion.json** - Estadísticas y errores
6. **MAPEO_CAMPOS.md** - Esta documentación
