/**
 * ETL - Transformación de prestamos.xlsx al formato del sistema de créditos
 *
 * Estructura del Excel:
 * - Fila 1: "Nombre" + fechas intercaladas
 * - Fila 2: "" + "Desem.", "Pago", "Saldo" (repetido para cada fecha)
 * - Fila 3+: Nombre del cliente + datos de desembolsos/pagos/saldos
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// ======================== CONFIGURACIÓN ========================
const EXCEL_PATH = path.join(__dirname, 'prestamos.xlsx');
const OUTPUT_DIR = __dirname;

// IDs autoincrementales para generar datos
let nextPersonaId = 1;
let nextPrestamoId = 1;
let nextPagoId = 1;
let nextDireccionId = 1;

// ======================== FUNCIONES AUXILIARES ========================

/**
 * Convierte número de fecha de Excel a formato ISO (YYYY-MM-DD)
 */
function convertirFechaExcel(numeroExcel) {
  if (!numeroExcel || typeof numeroExcel !== 'number') return null;
  const fecha = new Date((numeroExcel - 25569) * 86400 * 1000);
  return fecha.toISOString().split('T')[0];
}

/**
 * Extrae nombre y apellidos de un nombre completo
 */
function parsearNombreCompleto(nombreCompleto) {
  if (!nombreCompleto || typeof nombreCompleto !== 'string') {
    return { nombre: 'DESCONOCIDO', apellido: 'DESCONOCIDO' };
  }

  const partes = nombreCompleto.trim().split(' ');

  if (partes.length === 1) {
    return { nombre: partes[0], apellido: '' };
  } else if (partes.length === 2) {
    return { nombre: partes[0], apellido: partes[1] };
  } else if (partes.length === 3) {
    return { nombre: partes[0], apellido: `${partes[1]} ${partes[2]}` };
  } else {
    // 4 o más partes: asumimos primeros 2 son nombres, resto apellidos
    const nombres = partes.slice(0, 2).join(' ');
    const apellidos = partes.slice(2).join(' ');
    return { nombre: nombres, apellido: apellidos };
  }
}

/**
 * Genera un DUI ficticio para El Salvador (formato: 12345678-9)
 */
function generarDUI(index) {
  const numero = String(10000000 + index).padStart(8, '0');
  const digito = (index % 10);
  return `${numero}-${digito}`;
}

/**
 * Genera un número de crédito único
 */
function generarNumeroCredito(personaId, prestamoIndex) {
  const año = new Date().getFullYear();
  const numero = String(personaId * 100 + prestamoIndex).padStart(6, '0');
  return `CRE${año}${numero}`;
}

/**
 * Genera un número de pago único
 */
function generarNumeroPago(prestamoId, pagoIndex) {
  const año = new Date().getFullYear();
  const numero = String(prestamoId * 1000 + pagoIndex).padStart(6, '0');
  return `PAG${año}${numero}`;
}

// ======================== PROCESAMIENTO PRINCIPAL ========================

function procesarExcel() {
  console.log('='.repeat(70));
  console.log('ETL - TRANSFORMACIÓN DE DATOS DE PRÉSTAMOS');
  console.log('='.repeat(70));
  console.log('');

  // 1. Leer archivo Excel
  console.log('1. Leyendo archivo Excel...');
  const workbook = XLSX.readFile(EXCEL_PATH);
  const hoja = workbook.Sheets[workbook.SheetNames[0]];
  const datos = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: null });

  console.log(`   ✓ Archivo leído: ${datos.length} filas, ${datos[0].length} columnas\n`);

  // 2. Extraer fechas de la fila 1
  console.log('2. Extrayendo fechas de transacciones...');
  const fechas = [];
  for (let col = 1; col < datos[0].length; col += 3) {
    const valorFecha = datos[0][col];
    if (typeof valorFecha === 'number' && valorFecha > 40000) {
      fechas.push({
        columna: col,
        fecha: convertirFechaExcel(valorFecha)
      });
    }
  }
  console.log(`   ✓ ${fechas.length} fechas de transacciones identificadas\n`);

  // 3. Procesar clientes y transacciones
  console.log('3. Procesando clientes y transacciones...');

  const personas = [];
  const direcciones = [];
  const prestamos = [];
  const pagos = [];
  const errores = [];

  // Mapa para rastrear préstamos por cliente
  const prestamoPorCliente = new Map();

  // Procesar desde fila 3 (índice 2) en adelante
  for (let filaIdx = 2; filaIdx < datos.length; filaIdx++) {
    const fila = datos[filaIdx];
    const nombreCompleto = fila[0];

    // Saltar filas sin nombre
    if (!nombreCompleto || nombreCompleto === '') continue;

    try {
      // Crear persona
      const { nombre, apellido } = parsearNombreCompleto(nombreCompleto);
      const personaId = nextPersonaId++;
      const dui = generarDUI(personaId);

      const persona = {
        id: personaId,
        nombre,
        apellido,
        fechaNacimiento: '1990-01-01', // Dato ficticio - no disponible en Excel
        sexo: 'Femenino', // Dato ficticio - no disponible en Excel
        nacionalidad: 'Salvadoreña',
        estadoCivil: null,
        telefono: null,
        correoElectronico: null,
        numeroDui: dui,
        fechaEmisionDui: '2015-01-01', // Dato ficticio
        lugarEmisionDui: 'San Salvador', // Dato ficticio
      };

      personas.push(persona);

      // Crear dirección básica
      const direccion = {
        id: nextDireccionId++,
        personaId,
        departamentoId: 6, // San Salvador por defecto
        municipioId: 1, // San Salvador por defecto
        distritoId: 1, // Por defecto
        detalleDireccion: null,
      };

      direcciones.push(direccion);

      // Procesar transacciones de este cliente
      let prestamoActual = null;
      let prestamoIndex = 0;

      fechas.forEach((fechaInfo, idx) => {
        const col = fechaInfo.columna;
        const fecha = fechaInfo.fecha;

        const desembolso = fila[col] || 0;
        const pago = fila[col + 1] || 0;
        const saldo = fila[col + 2] || 0;

        // Si hay desembolso, crear nuevo préstamo
        if (desembolso > 0) {
          const prestamoId = nextPrestamoId++;
          const numeroCredito = generarNumeroCredito(personaId, prestamoIndex++);

          // Calcular datos del préstamo (estimaciones básicas)
          const montoDesembolsado = Number(desembolso);
          const tasaInteres = 0.10; // 10% por defecto
          const tasaInteresMoratorio = 0.15; // 15% por defecto
          const plazoAutorizado = 12; // 12 cuotas por defecto
          const totalInteres = montoDesembolsado * tasaInteres;
          const totalPagar = montoDesembolsado + totalInteres;
          const cuotaNormal = totalPagar / plazoAutorizado;

          prestamoActual = {
            id: prestamoId,
            solicitudId: null, // No disponible en Excel
            personaId,
            numeroCredito,
            tipoCreditoId: 1, // Por defecto - Crédito personal
            montoAutorizado: montoDesembolsado,
            montoDesembolsado,
            plazoAutorizado,
            tasaInteres,
            tasaInteresMoratorio,
            tipoInteres: 'FLAT',
            periodicidadPago: 'SEMANAL', // Asumiendo pagos semanales por las fechas
            cuotaNormal,
            cuotaTotal: cuotaNormal,
            numeroCuotas: plazoAutorizado,
            totalInteres,
            totalRecargos: 0,
            totalPagar,
            saldoCapital: Number(saldo || montoDesembolsado),
            saldoInteres: 0,
            capitalMora: 0,
            interesMora: 0,
            diasMora: 0,
            fechaOtorgamiento: fecha,
            fechaPrimeraCuota: fecha,
            fechaVencimiento: calcularFechaVencimiento(fecha, plazoAutorizado, 'SEMANAL'),
            fechaUltimoPago: null,
            fechaCancelacion: null,
            clasificacionPrestamoId: null,
            categoriaNCB022: 'A',
            estadoPrestamoId: null,
            estado: 'VIGENTE',
            usuarioDesembolsoId: 1,
            nombreUsuarioDesembolso: 'Sistema',
          };

          prestamos.push(prestamoActual);
          prestamoPorCliente.set(`${personaId}-${prestamoId}`, prestamoActual);
        }

        // Si hay pago y existe un préstamo activo
        if (pago > 0 && prestamoActual) {
          const pagoId = nextPagoId++;
          const numeroPago = generarNumeroPago(prestamoActual.id, pagoId);
          const montoPagado = Number(pago);

          // Distribución simple: 80% capital, 20% interés
          const capitalAplicado = montoPagado * 0.8;
          const interesAplicado = montoPagado * 0.2;

          const pagoObj = {
            id: pagoId,
            prestamoId: prestamoActual.id,
            numeroPago,
            fechaPago: fecha,
            fechaRegistro: fecha,
            montoPagado,
            capitalAplicado,
            interesAplicado,
            recargosAplicado: 0,
            interesMoratorioAplicado: 0,
            saldoCapitalAnterior: prestamoActual.saldoCapital,
            saldoInteresAnterior: prestamoActual.saldoInteres,
            capitalMoraAnterior: 0,
            interesMoraAnterior: 0,
            diasMoraAnterior: 0,
            saldoCapitalPosterior: Number(saldo || 0),
            saldoInteresPosterior: 0,
            tipoPago: 'CUOTA_COMPLETA',
            estado: 'APLICADO',
            fechaAnulacion: null,
            motivoAnulacion: null,
            usuarioAnulacionId: null,
            nombreUsuarioAnulacion: null,
            usuarioId: 1,
            nombreUsuario: 'Sistema',
            observaciones: null,
          };

          pagos.push(pagoObj);

          // Actualizar saldo del préstamo
          prestamoActual.saldoCapital = Number(saldo || 0);
          if (fecha > (prestamoActual.fechaUltimoPago || prestamoActual.fechaOtorgamiento)) {
            prestamoActual.fechaUltimoPago = fecha;
          }

          // Marcar como cancelado si saldo es 0
          if (prestamoActual.saldoCapital === 0) {
            prestamoActual.estado = 'CANCELADO';
            prestamoActual.fechaCancelacion = fecha;
          }
        }
      });

    } catch (error) {
      errores.push({
        fila: filaIdx + 1,
        nombreCompleto,
        error: error.message
      });
    }
  }

  console.log(`   ✓ ${personas.length} clientes procesados`);
  console.log(`   ✓ ${prestamos.length} préstamos generados`);
  console.log(`   ✓ ${pagos.length} pagos registrados`);
  if (errores.length > 0) {
    console.log(`   ⚠ ${errores.length} errores encontrados\n`);
  } else {
    console.log('');
  }

  // 4. Generar reportes y archivos de salida
  console.log('4. Generando archivos de salida...');

  const reporte = {
    fechaProcesamiento: new Date().toISOString(),
    archivoOrigen: 'prestamos.xlsx',
    estadisticas: {
      totalClientes: personas.length,
      totalPrestamos: prestamos.length,
      totalPagos: pagos.length,
      totalErrores: errores.length,
      fechasTransacciones: fechas.length,
      rangoFechas: {
        inicio: fechas[0]?.fecha,
        fin: fechas[fechas.length - 1]?.fecha
      },
      montosResumen: {
        totalDesembolsado: prestamos.reduce((sum, p) => sum + p.montoDesembolsado, 0),
        totalPagado: pagos.reduce((sum, p) => sum + p.montoPagado, 0),
        saldosPendientes: prestamos.reduce((sum, p) => sum + p.saldoCapital, 0)
      }
    },
    errores
  };

  // Guardar archivos JSON
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'clientes_import.json'),
    JSON.stringify(personas, null, 2),
    'utf8'
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'direcciones_import.json'),
    JSON.stringify(direcciones, null, 2),
    'utf8'
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'prestamos_import.json'),
    JSON.stringify(prestamos, null, 2),
    'utf8'
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'pagos_import.json'),
    JSON.stringify(pagos, null, 2),
    'utf8'
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'reporte_transformacion.json'),
    JSON.stringify(reporte, null, 2),
    'utf8'
  );

  console.log(`   ✓ clientes_import.json (${personas.length} registros)`);
  console.log(`   ✓ direcciones_import.json (${direcciones.length} registros)`);
  console.log(`   ✓ prestamos_import.json (${prestamos.length} registros)`);
  console.log(`   ✓ pagos_import.json (${pagos.length} registros)`);
  console.log(`   ✓ reporte_transformacion.json\n`);

  // 5. Generar documentación de mapeo
  console.log('5. Generando documentación de mapeo...');
  generarDocumentacionMapeo();

  console.log('');
  console.log('='.repeat(70));
  console.log('TRANSFORMACIÓN COMPLETADA EXITOSAMENTE');
  console.log('='.repeat(70));
  console.log('');
  console.log('Resumen:');
  console.log(`  - Clientes: ${personas.length}`);
  console.log(`  - Préstamos: ${prestamos.length}`);
  console.log(`  - Pagos: ${pagos.length}`);
  console.log(`  - Total desembolsado: $${reporte.estadisticas.montosResumen.totalDesembolsado.toFixed(2)}`);
  console.log(`  - Total pagado: $${reporte.estadisticas.montosResumen.totalPagado.toFixed(2)}`);
  console.log(`  - Saldo pendiente: $${reporte.estadisticas.montosResumen.saldosPendientes.toFixed(2)}`);
  console.log('');
}

/**
 * Calcula fecha de vencimiento según plazo y periodicidad
 */
function calcularFechaVencimiento(fechaInicio, plazo, periodicidad) {
  const fecha = new Date(fechaInicio);

  switch (periodicidad) {
    case 'DIARIO':
      fecha.setDate(fecha.getDate() + plazo);
      break;
    case 'SEMANAL':
      fecha.setDate(fecha.getDate() + (plazo * 7));
      break;
    case 'QUINCENAL':
      fecha.setDate(fecha.getDate() + (plazo * 15));
      break;
    case 'MENSUAL':
      fecha.setMonth(fecha.getMonth() + plazo);
      break;
    default:
      fecha.setMonth(fecha.getMonth() + plazo);
  }

  return fecha.toISOString().split('T')[0];
}

/**
 * Genera documentación del mapeo de campos
 */
function generarDocumentacionMapeo() {
  const mapeo = `# DOCUMENTACIÓN DE MAPEO - EXCEL A SISTEMA DE CRÉDITOS

## Fecha de generación
${new Date().toISOString()}

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
`;

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'MAPEO_CAMPOS.md'),
    mapeo,
    'utf8'
  );

  console.log('   ✓ MAPEO_CAMPOS.md');
}

// ======================== EJECUCIÓN ========================

try {
  procesarExcel();
} catch (error) {
  console.error('\n❌ ERROR FATAL:');
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}
