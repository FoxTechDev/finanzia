/**
 * SCRIPT DE MIGRACIÓN COMPLETA
 * Extrae datos del Excel prestamos.xlsx y genera scripts SQL para MySQL
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const EXCEL_FILE = path.join(__dirname, 'prestamos.xlsx');
const OUTPUT_DIR = __dirname;

// Configuración de la base de datos
const DB_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'micro_app'
};

// ============================================================================
// UTILIDADES
// ============================================================================

function formatDateMySQL(excelDate) {
  if (!excelDate) return null;

  let date;

  if (typeof excelDate === 'number') {
    const utc_days = Math.floor(excelDate - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    date = new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
  } else if (typeof excelDate === 'string') {
    date = new Date(excelDate);
  } else if (excelDate instanceof Date) {
    date = excelDate;
  } else {
    return null;
  }

  if (isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function cleanText(text) {
  if (!text) return null;
  return String(text).trim().replace(/'/g, "\\'");
}

function parseMoneyValue(value) {
  if (!value || value === '') return 0;

  // Si es número, retornar directamente
  if (typeof value === 'number') {
    return parseFloat(value);
  }

  // Si es string, limpiar formato
  if (typeof value === 'string') {
    // Remover símbolos de moneda, espacios, comas
    let cleaned = value.replace(/[\$,\s]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  return 0;
}

function formatMoney(value) {
  return parseFloat(value).toFixed(2);
}

// ============================================================================
// LECTURA Y ANÁLISIS DEL EXCEL
// ============================================================================

console.log('='.repeat(80));
console.log('GENERACIÓN DE SCRIPTS SQL DE MIGRACIÓN');
console.log('='.repeat(80));
console.log();

try {
  console.log(`Leyendo archivo: ${EXCEL_FILE}\n`);
  const workbook = XLSX.readFile(EXCEL_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Leer todo como array de arrays
  const data = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    defval: ''
  });

  console.log(`Total de filas: ${data.length}`);
  console.log(`Total de columnas: ${data[0] ? data[0].length : 0}`);
  console.log();

  // Estructura de datos
  const estructuraDatos = {
    clientes: [],
    prestamos: [],
    pagos: [],
    planPagos: []
  };

  // Fila 0: Fechas
  const fechasRow = data[0];
  // Fila 1: Etiquetas (Desem., Pago, Saldo)
  const etiquetasRow = data[1];

  // Procesar fechas y sus posiciones
  const columnasFechas = [];
  for (let col = 1; col < fechasRow.length; col++) {
    const fecha = fechasRow[col];
    if (fecha && fecha !== '') {
      const fechaSQL = formatDateMySQL(fecha);
      if (fechaSQL) {
        columnasFechas.push({
          col: col,
          fecha: fechaSQL,
          fechaOriginal: fecha
        });
      }
    }
  }

  console.log(`Fechas únicas detectadas: ${columnasFechas.length}`);
  console.log('Primeras 5 fechas:');
  columnasFechas.slice(0, 5).forEach(f => {
    console.log(`  - ${f.fecha} (columna ${f.col})`);
  });
  console.log();

  // Cargar personas existentes en la BD
  console.log('Nota: Se asume que las personas ya existen en la BD del archivo 01_insert_personas_mysql.sql');
  console.log();

  // Mapeo de nombres a IDs de personas (basado en el orden del archivo de personas)
  const personasMap = new Map();
  let personaIdCounter = 1;

  // Procesar cada fila de cliente (desde fila 2 en adelante)
  let prestamoIdCounter = 1;
  let pagoIdCounter = 1;
  let planPagoIdCounter = 1;
  let solicitudIdCounter = 1;

  console.log('Procesando datos de clientes y préstamos...\n');

  for (let row = 2; row < data.length; row++) {
    const rowData = data[row];
    const nombreCliente = rowData[0];

    if (!nombreCliente || nombreCliente.trim() === '') {
      continue;
    }

    // Asignar ID de persona (en orden)
    let personaId;
    if (personasMap.has(nombreCliente)) {
      personaId = personasMap.get(nombreCliente);
    } else {
      personaId = personaIdCounter++;
      personasMap.set(nombreCliente, personaId);
      estructuraDatos.clientes.push({
        id: personaId,
        nombre: nombreCliente
      });
    }

    // Procesar cada grupo de columnas (Desem., Pago, Saldo)
    const prestamosCliente = [];

    for (let i = 0; i < columnasFechas.length; i++) {
      const fechaInfo = columnasFechas[i];
      const colBase = fechaInfo.col;

      // Las columnas van: Desem (colBase), Pago (colBase+1), Saldo (colBase+2)
      const desembolso = parseMoneyValue(rowData[colBase]);
      const pago = parseMoneyValue(rowData[colBase + 1]);
      const saldo = parseMoneyValue(rowData[colBase + 2]);

      // Si hay desembolso, crear nuevo préstamo
      if (desembolso > 0) {
        const prestamoId = prestamoIdCounter++;
        const numeroCredito = `CRE-${String(prestamoId).padStart(6, '0')}`;
        const numeroSolicitud = `SOL-${String(solicitudIdCounter++).padStart(6, '0')}`;

        // Calcular tasa de interés (10% flat sobre el monto)
        const tasaInteres = 10.00;
        const totalInteres = desembolso * (tasaInteres / 100);
        const totalPagar = desembolso + totalInteres;

        const prestamo = {
          id: prestamoId,
          personaId: personaId,
          personaNombre: nombreCliente,
          numeroCredito: numeroCredito,
          numeroSolicitud: numeroSolicitud,
          montoDesembolsado: desembolso,
          fechaOtorgamiento: fechaInfo.fecha,
          saldoInicial: saldo > 0 ? saldo : totalPagar,
          saldoActual: saldo,
          tasaInteres: tasaInteres,
          totalInteres: totalInteres,
          totalPagar: totalPagar,
          pagos: []
        };

        prestamosCliente.push(prestamo);
        estructuraDatos.prestamos.push(prestamo);
      }

      // Si hay pago, registrarlo en el préstamo activo más reciente
      if (pago > 0 && prestamosCliente.length > 0) {
        const prestamoActivo = prestamosCliente[prestamosCliente.length - 1];
        const numeroPago = `PAG-${String(pagoIdCounter++).padStart(8, '0')}`;

        const pagoRegistro = {
          id: pagoIdCounter - 1,
          prestamoId: prestamoActivo.id,
          numeroPago: numeroPago,
          fechaPago: fechaInfo.fecha,
          montoPagado: pago,
          saldoPosterior: saldo
        };

        prestamoActivo.pagos.push(pagoRegistro);
        estructuraDatos.pagos.push(pagoRegistro);
      }

      // Si hay saldo sin pago ni desembolso, es un saldo pendiente
      // (no hacemos nada, el saldo se mantiene)
    }
  }

  console.log(`Total de clientes procesados: ${estructuraDatos.clientes.length}`);
  console.log(`Total de préstamos generados: ${estructuraDatos.prestamos.length}`);
  console.log(`Total de pagos registrados: ${estructuraDatos.pagos.length}`);
  console.log();

  // ============================================================================
  // GENERAR SCRIPTS SQL
  // ============================================================================

  console.log('Generando scripts SQL...\n');

  // 1. SCRIPT DE SOLICITUDES
  let sqlSolicitudes = '';
  sqlSolicitudes += '-- =====================================================\n';
  sqlSolicitudes += '-- INSERTAR SOLICITUDES DE CRÉDITO\n';
  sqlSolicitudes += `-- Total: ${estructuraDatos.prestamos.length} solicitudes\n`;
  sqlSolicitudes += '-- Generado automáticamente desde prestamos.xlsx\n';
  sqlSolicitudes += '-- =====================================================\n\n';

  const solicitudInserts = [];

  estructuraDatos.prestamos.forEach((prestamo, idx) => {
    const solicitudId = idx + 1;

    const insert = `INSERT INTO solicitud (
  id, numeroSolicitud, personaId, lineaCreditoId, tipoCreditoId,
  montoSolicitado, plazoSolicitado, tasaInteresPropuesta,
  destinoCredito, estadoId,
  montoAprobado, plazoAprobado, tasaInteresAprobada,
  fechaSolicitud, fechaAnalisis, fechaAprobacion,
  analistaId, nombreAnalista, aprobadorId, nombreAprobador,
  observaciones, createdAt, updatedAt
) VALUES (
  ${solicitudId},
  '${prestamo.numeroSolicitud}',
  ${prestamo.personaId},
  1, -- lineaCreditoId: Crédito Personal
  1, -- tipoCreditoId: Crédito Personal
  ${formatMoney(prestamo.montoDesembolsado)},
  4, -- plazoSolicitado: 4 cuotas (asumido)
  ${formatMoney(prestamo.tasaInteres)},
  'CONSUMO_PERSONAL',
  6, -- estadoId: DESEMBOLSADA
  ${formatMoney(prestamo.montoDesembolsado)},
  4, -- plazoAprobado
  ${formatMoney(prestamo.tasaInteres)},
  '${prestamo.fechaOtorgamiento}',
  '${prestamo.fechaOtorgamiento}',
  '${prestamo.fechaOtorgamiento}',
  1, -- analistaId
  'Sistema',
  1, -- aprobadorId
  'Sistema',
  'Solicitud migrada desde Excel',
  NOW(),
  NOW()
);`;

    solicitudInserts.push(insert);
  });

  sqlSolicitudes += solicitudInserts.join('\n\n');

  // 2. SCRIPT DE PRÉSTAMOS
  let sqlPrestamos = '';
  sqlPrestamos += '-- =====================================================\n';
  sqlPrestamos += '-- INSERTAR PRÉSTAMOS (DESEMBOLSOS)\n';
  sqlPrestamos += `-- Total: ${estructuraDatos.prestamos.length} préstamos\n`;
  sqlPrestamos += '-- Generado automáticamente desde prestamos.xlsx\n';
  sqlPrestamos += '-- =====================================================\n\n';

  const prestamoInserts = [];

  estructuraDatos.prestamos.forEach((prestamo, idx) => {
    const solicitudId = idx + 1;
    const saldoCapital = prestamo.saldoActual;
    const estado = saldoCapital > 0 ? 'VIGENTE' : 'CANCELADO';
    const fechaCancelacion = saldoCapital === 0 ? prestamo.fechaOtorgamiento : null;

    // Calcular fecha de vencimiento (asumiendo 4 cuotas semanales)
    const fechaVencimiento = new Date(prestamo.fechaOtorgamiento);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 28); // 4 semanas
    const fechaVencimientoSQL = formatDateMySQL(fechaVencimiento);

    const fechaPrimeraCuota = new Date(prestamo.fechaOtorgamiento);
    fechaPrimeraCuota.setDate(fechaPrimeraCuota.getDate() + 7); // 1 semana
    const fechaPrimeraCuotaSQL = formatDateMySQL(fechaPrimeraCuota);

    const cuotaNormal = prestamo.totalPagar / 4; // 4 cuotas

    const insert = `INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  ${prestamo.id},
  ${solicitudId},
  ${prestamo.personaId},
  '${prestamo.numeroCredito}',
  1, -- tipoCreditoId
  ${formatMoney(prestamo.montoDesembolsado)},
  ${formatMoney(prestamo.montoDesembolsado)},
  4, -- plazoAutorizado (semanas)
  ${formatMoney(prestamo.tasaInteres)},
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  ${formatMoney(cuotaNormal)},
  ${formatMoney(cuotaNormal)},
  4, -- numeroCuotas
  ${formatMoney(prestamo.totalInteres)},
  0.00, -- totalRecargos
  ${formatMoney(prestamo.totalPagar)},
  ${formatMoney(saldoCapital)},
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '${prestamo.fechaOtorgamiento}',
  '${fechaPrimeraCuotaSQL}',
  '${fechaVencimientoSQL}',
  ${prestamo.pagos.length > 0 ? `'${prestamo.pagos[prestamo.pagos.length - 1].fechaPago}'` : 'NULL'},
  ${fechaCancelacion ? `'${fechaCancelacion}'` : 'NULL'},
  'A', -- categoriaNCB022
  '${estado}',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  ${estado === 'VIGENTE' ? 1 : 3}, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);`;

    prestamoInserts.push(insert);
  });

  sqlPrestamos += prestamoInserts.join('\n\n');

  // 3. SCRIPT DE PAGOS
  let sqlPagos = '';
  sqlPagos += '-- =====================================================\n';
  sqlPagos += '-- INSERTAR PAGOS\n';
  sqlPagos += `-- Total: ${estructuraDatos.pagos.length} pagos\n`;
  sqlPagos += '-- Generado automáticamente desde prestamos.xlsx\n';
  sqlPagos += '-- =====================================================\n\n';

  const pagoInserts = [];

  estructuraDatos.pagos.forEach((pago) => {
    // Buscar el préstamo asociado
    const prestamo = estructuraDatos.prestamos.find(p => p.id === pago.prestamoId);
    if (!prestamo) return;

    // Calcular distribución del pago (80% capital, 20% interés como estimación)
    const capitalAplicado = pago.montoPagado * 0.8;
    const interesAplicado = pago.montoPagado * 0.2;

    // Saldos anteriores (estimación)
    const saldoCapitalAnterior = pago.saldoPosterior + capitalAplicado;

    const insert = `INSERT INTO pago (
  id, prestamoId, numeroPago,
  fechaPago, fechaRegistro,
  montoPagado,
  capitalAplicado, interesAplicado, recargosAplicado, interesMoratorioAplicado,
  saldoCapitalAnterior, saldoInteresAnterior,
  capitalMoraAnterior, interesMoraAnterior, diasMoraAnterior,
  saldoCapitalPosterior, saldoInteresPosterior,
  tipoPago, estado,
  usuarioId, nombreUsuario,
  observaciones,
  createdAt, updatedAt
) VALUES (
  ${pago.id},
  ${pago.prestamoId},
  '${pago.numeroPago}',
  '${pago.fechaPago}',
  '${pago.fechaPago} 08:00:00',
  ${formatMoney(pago.montoPagado)},
  ${formatMoney(capitalAplicado)},
  ${formatMoney(interesAplicado)},
  0.00, -- recargosAplicado
  0.00, -- interesMoratorioAplicado
  ${formatMoney(saldoCapitalAnterior)},
  0.00, -- saldoInteresAnterior
  0.00, -- capitalMoraAnterior
  0.00, -- interesMoraAnterior
  0, -- diasMoraAnterior
  ${formatMoney(pago.saldoPosterior)},
  0.00, -- saldoInteresPosterior
  'CUOTA_COMPLETA',
  'APLICADO',
  1, -- usuarioId
  'Sistema',
  'Pago migrado desde Excel',
  NOW(),
  NOW()
);`;

    pagoInserts.push(insert);
  });

  sqlPagos += pagoInserts.join('\n\n');

  // 4. SCRIPT MAESTRO
  let sqlMaestro = '';
  sqlMaestro += '-- =====================================================\n';
  sqlMaestro += '-- SCRIPT MAESTRO DE MIGRACIÓN - MÓDULO DE CRÉDITOS\n';
  sqlMaestro += '-- Generado automáticamente desde prestamos.xlsx\n';
  sqlMaestro += `-- Fecha: ${new Date().toLocaleString()}\n`;
  sqlMaestro += '-- =====================================================\n\n';
  sqlMaestro += 'USE micro_app;\n\n';
  sqlMaestro += '-- Deshabilitar verificaciones temporalmente\n';
  sqlMaestro += 'SET FOREIGN_KEY_CHECKS = 0;\n';
  sqlMaestro += 'SET UNIQUE_CHECKS = 0;\n';
  sqlMaestro += 'SET AUTOCOMMIT = 0;\n\n';
  sqlMaestro += 'START TRANSACTION;\n\n';
  sqlMaestro += '-- =====================================================\n';
  sqlMaestro += '-- PASO 1: Ejecutar solicitudes\n';
  sqlMaestro += '-- =====================================================\n';
  sqlMaestro += 'SOURCE 07_insert_solicitudes_from_excel.sql;\n\n';
  sqlMaestro += '-- =====================================================\n';
  sqlMaestro += '-- PASO 2: Ejecutar préstamos\n';
  sqlMaestro += '-- =====================================================\n';
  sqlMaestro += 'SOURCE 08_insert_prestamos_from_excel.sql;\n\n';
  sqlMaestro += '-- =====================================================\n';
  sqlMaestro += '-- PASO 3: Ejecutar pagos\n';
  sqlMaestro += '-- =====================================================\n';
  sqlMaestro += 'SOURCE 09_insert_pagos_from_excel.sql;\n\n';
  sqlMaestro += 'COMMIT;\n\n';
  sqlMaestro += '-- Rehabilitar verificaciones\n';
  sqlMaestro += 'SET FOREIGN_KEY_CHECKS = 1;\n';
  sqlMaestro += 'SET UNIQUE_CHECKS = 1;\n';
  sqlMaestro += 'SET AUTOCOMMIT = 1;\n\n';
  sqlMaestro += 'SELECT "Migración completada exitosamente" AS STATUS;\n';

  // Guardar archivos
  const fileSolicitudes = path.join(OUTPUT_DIR, '07_insert_solicitudes_from_excel.sql');
  const filePrestamos = path.join(OUTPUT_DIR, '08_insert_prestamos_from_excel.sql');
  const filePagos = path.join(OUTPUT_DIR, '09_insert_pagos_from_excel.sql');
  const fileMaestro = path.join(OUTPUT_DIR, 'MASTER_import_from_excel.sql');

  fs.writeFileSync(fileSolicitudes, sqlSolicitudes, 'utf8');
  fs.writeFileSync(filePrestamos, sqlPrestamos, 'utf8');
  fs.writeFileSync(filePagos, sqlPagos, 'utf8');
  fs.writeFileSync(fileMaestro, sqlMaestro, 'utf8');

  console.log('✓ Scripts SQL generados:');
  console.log(`  - ${fileSolicitudes}`);
  console.log(`  - ${filePrestamos}`);
  console.log(`  - ${filePagos}`);
  console.log(`  - ${fileMaestro}`);
  console.log();

  // Generar reporte de transformaciones
  let reporte = '# REPORTE DE TRANSFORMACIÓN Y MAPEO\n\n';
  reporte += `Fecha: ${new Date().toLocaleString()}\n\n`;
  reporte += '## Resumen de la Migración\n\n';
  reporte += `- **Clientes procesados**: ${estructuraDatos.clientes.length}\n`;
  reporte += `- **Solicitudes generadas**: ${estructuraDatos.prestamos.length}\n`;
  reporte += `- **Préstamos desembolsados**: ${estructuraDatos.prestamos.length}\n`;
  reporte += `- **Pagos registrados**: ${estructuraDatos.pagos.length}\n`;
  reporte += `- **Fechas procesadas**: ${columnasFechas.length}\n\n`;
  reporte += '## Estructura del Excel Original\n\n';
  reporte += '- **Formato**: Matriz de pagos con fechas como columnas\n';
  reporte += '- **Fila 0**: Fechas de transacciones\n';
  reporte += '- **Fila 1**: Etiquetas (Desem., Pago, Saldo)\n';
  reporte += '- **Filas 2+**: Datos de clientes con montos\n\n';
  reporte += '## Transformaciones Aplicadas\n\n';
  reporte += '1. **Fechas**: Convertidas de serial de Excel a formato MySQL (YYYY-MM-DD)\n';
  reporte += '2. **Montos**: Limpiados de símbolos $ y formateados a DECIMAL(14,2)\n';
  reporte += '3. **Nombres**: Asociados a IDs de persona según orden del archivo de personas\n';
  reporte += '4. **Solicitudes**: Generadas automáticamente para cada desembolso\n';
  reporte += '5. **Préstamos**: Calculados con tasa flat del 10%, 4 cuotas semanales\n';
  reporte += '6. **Pagos**: Distribuidos 80% capital, 20% interés\n';
  reporte += '7. **Estados**: Determinados según saldo (VIGENTE si saldo > 0, CANCELADO si = 0)\n\n';
  reporte += '## Supuestos y Valores Por Defecto\n\n';
  reporte += '- **Línea de crédito**: ID 1 (Crédito Personal)\n';
  reporte += '- **Tipo de crédito**: ID 1 (Crédito Personal)\n';
  reporte += '- **Destino**: CONSUMO_PERSONAL\n';
  reporte += '- **Tasa de interés**: 10% flat\n';
  reporte += '- **Tasa moratoria**: 5%\n';
  reporte += '- **Plazo**: 4 cuotas\n';
  reporte += '- **Periodicidad**: SEMANAL\n';
  reporte += '- **Tipo de interés**: FLAT\n';
  reporte += '- **Categoría NCB-022**: A (Normal)\n';
  reporte += '- **Usuario**: ID 1 (Sistema)\n\n';
  reporte += '## Validaciones Requeridas Post-Migración\n\n';
  reporte += '1. Verificar que los IDs de persona coincidan con la tabla persona\n';
  reporte += '2. Validar que todas las foreign keys sean correctas\n';
  reporte += '3. Revisar los saldos calculados vs saldos reales\n';
  reporte += '4. Confirmar las fechas de vencimiento\n';
  reporte += '5. Validar la distribución de pagos (capital vs interés)\n\n';
  reporte += '## Muestra de Datos Procesados\n\n';
  reporte += '### Primeros 5 Clientes:\n\n';
  estructuraDatos.clientes.slice(0, 5).forEach(c => {
    reporte += `- ID ${c.id}: ${c.nombre}\n`;
  });
  reporte += '\n### Primeros 5 Préstamos:\n\n';
  estructuraDatos.prestamos.slice(0, 5).forEach(p => {
    reporte += `- ${p.numeroCredito}: $${formatMoney(p.montoDesembolsado)} - Cliente ID ${p.personaId} - Fecha: ${p.fechaOtorgamiento}\n`;
  });

  const reporteFile = path.join(OUTPUT_DIR, 'REPORTE_TRANSFORMACION_EXCEL.md');
  fs.writeFileSync(reporteFile, reporte, 'utf8');
  console.log(`✓ Reporte de transformación: ${reporteFile}`);
  console.log();

  console.log('='.repeat(80));
  console.log('MIGRACIÓN COMPLETADA');
  console.log('='.repeat(80));
  console.log();
  console.log('Siguiente paso:');
  console.log('  1. Revisar los scripts SQL generados');
  console.log('  2. Ejecutar: mysql -u root -p micro_app < MASTER_import_from_excel.sql');
  console.log('  3. O ejecutar cada script individualmente en orden');
  console.log();

} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  console.error(error.stack);
  process.exit(1);
}
