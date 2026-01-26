/**
 * Script para analizar la estructura real del Excel de préstamos
 * Lee sin encabezados para ver la estructura matricial
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, 'prestamos.xlsx');

function analizarEstructura() {
  console.log('Analizando estructura del Excel...\n');

  const workbook = XLSX.readFile(EXCEL_PATH);
  const nombreHoja = workbook.SheetNames[0];
  const hoja = workbook.Sheets[nombreHoja];

  console.log(`Hoja: ${nombreHoja}\n`);

  // Obtener el rango de la hoja
  const rango = XLSX.utils.decode_range(hoja['!ref']);
  console.log(`Rango de celdas: ${hoja['!ref']}`);
  console.log(`Filas: ${rango.s.r + 1} a ${rango.e.r + 1}`);
  console.log(`Columnas: ${rango.s.c + 1} a ${rango.e.c + 1}`);
  console.log(`Total filas: ${rango.e.r - rango.s.r + 1}`);
  console.log(`Total columnas: ${rango.e.c - rango.s.c + 1}\n`);

  // Leer sin encabezados - array de arrays
  const datos = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: null });

  console.log('='.repeat(70));
  console.log('PRIMERAS 10 FILAS DEL EXCEL:');
  console.log('='.repeat(70));

  // Mostrar las primeras 10 filas
  datos.slice(0, 15).forEach((fila, index) => {
    console.log(`\nFila ${index + 1}:`);

    // Mostrar solo las primeras 15 columnas para no saturar
    const columnasAMostrar = Math.min(fila.length, 15);
    for (let i = 0; i < columnasAMostrar; i++) {
      const valor = fila[i];
      if (valor !== null && valor !== undefined && valor !== '') {
        console.log(`  Col ${i + 1}: ${typeof valor === 'number' && valor > 40000 && valor < 50000 ?
          'FECHA_EXCEL:' + valor + ' (' + convertirFechaExcel(valor) + ')' :
          JSON.stringify(valor)}`);
      }
    }
  });

  console.log('\n' + '='.repeat(70));
  console.log('ANÁLISIS DE COLUMNAS (primeras 20):');
  console.log('='.repeat(70));

  // Analizar las primeras 20 columnas
  for (let col = 0; col < Math.min(20, datos[0].length); col++) {
    const valoresFila0 = datos[0] ? datos[0][col] : null;
    const valoresFila1 = datos[1] ? datos[1][col] : null;
    const valoresFila2 = datos[2] ? datos[2][col] : null;

    console.log(`\nColumna ${col + 1}:`);
    console.log(`  Fila 1: ${formatearValor(valoresFila0)}`);
    console.log(`  Fila 2: ${formatearValor(valoresFila1)}`);
    console.log(`  Fila 3: ${formatearValor(valoresFila2)}`);
  }

  // Guardar datos completos
  const outputPath = path.join(__dirname, 'excel_raw_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(datos, null, 2), 'utf8');
  console.log(`\n✓ Datos crudos guardados en: ${outputPath}`);
}

function convertirFechaExcel(numeroExcel) {
  // Excel almacena fechas como número de días desde 1/1/1900
  const fecha = new Date((numeroExcel - 25569) * 86400 * 1000);
  return fecha.toISOString().split('T')[0];
}

function formatearValor(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return 'vacío';
  }
  if (typeof valor === 'number' && valor > 40000 && valor < 50000) {
    return `FECHA: ${convertirFechaExcel(valor)}`;
  }
  return JSON.stringify(valor);
}

analizarEstructura();
