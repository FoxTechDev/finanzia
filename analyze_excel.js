/**
 * Script de análisis del archivo prestamos.xlsx
 * Extrae información de créditos y pagos para generar scripts SQL
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Configuración
const EXCEL_FILE = path.join(__dirname, 'prestamos.xlsx');
const OUTPUT_DIR = __dirname;

// Función para formatear fechas a formato MySQL
function formatDateMySQL(excelDate) {
  if (!excelDate) return null;

  let date;

  // Si es un número de Excel (serial date)
  if (typeof excelDate === 'number') {
    const utc_days = Math.floor(excelDate - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    date = new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
  }
  // Si es una cadena de texto
  else if (typeof excelDate === 'string') {
    date = new Date(excelDate);
  }
  // Si ya es un objeto Date
  else if (excelDate instanceof Date) {
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

// Función para limpiar valores de texto
function cleanText(text) {
  if (!text) return null;
  return String(text).trim().replace(/'/g, "\\'");
}

// Función para formatear montos
function formatMoney(value) {
  if (!value || value === '' || isNaN(value)) return 0;
  return parseFloat(value).toFixed(2);
}

console.log('='.repeat(70));
console.log('ANÁLISIS DEL ARCHIVO PRESTAMOS.XLSX');
console.log('='.repeat(70));
console.log();

try {
  // Leer el archivo Excel
  console.log(`Leyendo archivo: ${EXCEL_FILE}`);
  const workbook = XLSX.readFile(EXCEL_FILE);

  console.log('\n--- HOJAS DISPONIBLES ---');
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`  ${index + 1}. ${sheetName}`);
  });

  console.log('\n' + '='.repeat(70));

  // Analizar cada hoja
  const analysis = {};

  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n\n### HOJA: ${sheetName} ###`);
    console.log('-'.repeat(70));

    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    console.log(`Total de filas: ${data.length}`);

    if (data.length > 0) {
      console.log('\nColumnas encontradas:');
      const columns = Object.keys(data[0]);
      columns.forEach((col, idx) => {
        console.log(`  ${idx + 1}. ${col}`);
      });

      console.log('\nPrimeras 3 filas (muestra):');
      data.slice(0, 3).forEach((row, idx) => {
        console.log(`\n  Fila ${idx + 1}:`);
        Object.keys(row).forEach(key => {
          let value = row[key];
          if (typeof value === 'string' && value.length > 50) {
            value = value.substring(0, 50) + '...';
          }
          console.log(`    ${key}: ${value}`);
        });
      });
    }

    analysis[sheetName] = {
      rowCount: data.length,
      columns: data.length > 0 ? Object.keys(data[0]) : [],
      data: data
    };
  });

  // Guardar análisis completo en JSON para procesamiento posterior
  const analysisFile = path.join(OUTPUT_DIR, 'excel_analysis.json');
  fs.writeFileSync(analysisFile, JSON.stringify(analysis, null, 2), 'utf8');
  console.log(`\n\n${'='.repeat(70)}`);
  console.log(`✓ Análisis completo guardado en: ${analysisFile}`);

  // Generar reporte de mapeo
  console.log('\n\n' + '='.repeat(70));
  console.log('REPORTE DE MAPEO DE DATOS');
  console.log('='.repeat(70));

  let mappingReport = '# REPORTE DE MAPEO - PRESTAMOS.XLSX\n\n';
  mappingReport += `Fecha de análisis: ${new Date().toLocaleString()}\n\n`;

  Object.keys(analysis).forEach(sheetName => {
    const sheet = analysis[sheetName];
    mappingReport += `## HOJA: ${sheetName}\n`;
    mappingReport += `Total de registros: ${sheet.rowCount}\n\n`;
    mappingReport += '### Columnas detectadas:\n';
    sheet.columns.forEach((col, idx) => {
      mappingReport += `${idx + 1}. ${col}\n`;
    });
    mappingReport += '\n';
  });

  const reportFile = path.join(OUTPUT_DIR, 'REPORTE_MAPEO.md');
  fs.writeFileSync(reportFile, mappingReport, 'utf8');
  console.log(`✓ Reporte de mapeo guardado en: ${reportFile}`);

  console.log('\n' + '='.repeat(70));
  console.log('ANÁLISIS COMPLETADO');
  console.log('='.repeat(70));

} catch (error) {
  console.error('\n❌ ERROR durante el análisis:', error.message);
  console.error(error.stack);
  process.exit(1);
}
