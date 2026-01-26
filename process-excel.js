/**
 * Script de ETL para procesar archivo prestamos.xlsx
 * y generar datos estructurados para el sistema de créditos
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Configuración de rutas
const EXCEL_PATH = path.join(__dirname, 'prestamos.xlsx');
const OUTPUT_DIR = __dirname;

// Función para leer el archivo Excel
function leerExcel() {
  console.log('Leyendo archivo Excel:', EXCEL_PATH);

  if (!fs.existsSync(EXCEL_PATH)) {
    throw new Error(`Archivo no encontrado: ${EXCEL_PATH}`);
  }

  const workbook = XLSX.readFile(EXCEL_PATH);
  console.log('Hojas disponibles:', workbook.SheetNames.join(', '));

  return workbook;
}

// Función para convertir hoja a JSON
function hojasAJSON(workbook) {
  const datos = {};

  workbook.SheetNames.forEach(nombreHoja => {
    console.log(`\nProcesando hoja: ${nombreHoja}`);
    const hoja = workbook.Sheets[nombreHoja];
    const json = XLSX.utils.sheet_to_json(hoja, { defval: null });

    console.log(`  - Registros encontrados: ${json.length}`);

    if (json.length > 0) {
      console.log(`  - Columnas: ${Object.keys(json[0]).join(', ')}`);
      console.log(`  - Muestra primer registro:`);
      console.log(JSON.stringify(json[0], null, 2));
    }

    datos[nombreHoja] = json;
  });

  return datos;
}

// Función para generar reporte de análisis
function generarReporteAnalisis(datos) {
  const reporte = {
    fechaAnalisis: new Date().toISOString(),
    archivoOrigen: 'prestamos.xlsx',
    hojas: []
  };

  for (const [nombreHoja, registros] of Object.entries(datos)) {
    const analisisHoja = {
      nombre: nombreHoja,
      totalRegistros: registros.length,
      columnas: registros.length > 0 ? Object.keys(registros[0]) : [],
      muestraDatos: registros.slice(0, 3)
    };

    reporte.hojas.push(analisisHoja);
  }

  return reporte;
}

// Función principal
function main() {
  try {
    console.log('='.repeat(70));
    console.log('ETL - Análisis de prestamos.xlsx');
    console.log('='.repeat(70));

    // 1. Leer Excel
    const workbook = leerExcel();

    // 2. Convertir a JSON
    const datos = hojasAJSON(workbook);

    // 3. Generar reporte de análisis
    const reporte = generarReporteAnalisis(datos);

    // 4. Guardar datos crudos y reporte
    const reportePath = path.join(OUTPUT_DIR, 'analisis_excel.json');
    fs.writeFileSync(reportePath, JSON.stringify(reporte, null, 2), 'utf8');
    console.log(`\n✓ Reporte de análisis guardado: ${reportePath}`);

    const datosPath = path.join(OUTPUT_DIR, 'datos_crudos.json');
    fs.writeFileSync(datosPath, JSON.stringify(datos, null, 2), 'utf8');
    console.log(`✓ Datos crudos guardados: ${datosPath}`);

    console.log('\n' + '='.repeat(70));
    console.log('Análisis completado exitosamente');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Error durante el procesamiento:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar
main();
