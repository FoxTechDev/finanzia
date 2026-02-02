/**
 * Script detallado para analizar el archivo prestamos.xlsx
 * Analiza la estructura matricial con fechas como columnas
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_FILE = path.join(__dirname, 'prestamos.xlsx');

console.log('Analizando estructura detallada del Excel...\n');

try {
  const workbook = XLSX.readFile(EXCEL_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Obtener el rango de celdas
  const range = XLSX.utils.decode_range(worksheet['!ref']);

  console.log(`Rango de celdas: ${worksheet['!ref']}`);
  console.log(`Filas: ${range.s.r} a ${range.e.r}`);
  console.log(`Columnas: ${range.s.c} a ${range.e.c}`);
  console.log();

  // Leer primeras filas para entender estructura
  console.log('='.repeat(80));
  console.log('PRIMERAS FILAS DEL EXCEL (raw):');
  console.log('='.repeat(80));

  for (let row = 0; row <= Math.min(5, range.e.r); row++) {
    console.log(`\nFila ${row}:`);
    for (let col = 0; col <= Math.min(15, range.e.c); col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[cellAddress];
      if (cell && cell.v !== undefined && cell.v !== '') {
        console.log(`  Col ${col} (${String.fromCharCode(65 + col)}): ${JSON.stringify(cell.v)} (tipo: ${cell.t})`);
      }
    }
  }

  // Leer primera columna completa (nombres de clientes)
  console.log('\n' + '='.repeat(80));
  console.log('PRIMERA COLUMNA (Clientes):');
  console.log('='.repeat(80));

  const clientes = [];
  for (let row = 1; row <= range.e.r; row++) {
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
    const cell = worksheet[cellAddress];
    if (cell && cell.v !== undefined && cell.v !== '') {
      clientes.push({
        fila: row,
        nombre: cell.v
      });
      if (row <= 10) {
        console.log(`Fila ${row}: ${cell.v}`);
      }
    }
  }
  console.log(`\nTotal de clientes encontrados: ${clientes.length}`);

  // Analizar estructura de encabezados (fila 0)
  console.log('\n' + '='.repeat(80));
  console.log('ENCABEZADOS (Fila 0 - Fechas de pagos):');
  console.log('='.repeat(80));

  const headers = [];
  for (let col = 1; col <= Math.min(20, range.e.c); col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    const cell = worksheet[cellAddress];
    if (cell && cell.v !== undefined && cell.v !== '') {
      headers.push({
        col: col,
        valor: cell.v
      });
      console.log(`Col ${col}: ${cell.v}`);
    }
  }

  // Analizar datos de un cliente específico
  console.log('\n' + '='.repeat(80));
  console.log('ANÁLISIS DETALLADO DEL PRIMER CLIENTE:');
  console.log('='.repeat(80));

  if (clientes.length > 0) {
    const primerCliente = clientes[0];
    console.log(`\nCliente: ${primerCliente.nombre} (Fila ${primerCliente.fila})`);
    console.log('\nDatos en columnas:');

    for (let col = 1; col <= Math.min(20, range.e.c); col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: primerCliente.fila, c: col });
      const cell = worksheet[cellAddress];

      const headerAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      const headerCell = worksheet[headerAddress];
      const headerVal = headerCell ? headerCell.v : `Col${col}`;

      if (cell && cell.v !== undefined && cell.v !== '') {
        console.log(`  ${headerVal}: ${cell.v}`);
      }
    }
  }

  // Convertir a JSON completo
  const data = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,  // Usar arrays en lugar de objetos
    raw: false,  // Convertir valores
    defval: ''
  });

  console.log('\n' + '='.repeat(80));
  console.log('MUESTRA DE DATOS RAW (primeras 3 filas, primeras 15 columnas):');
  console.log('='.repeat(80));

  data.slice(0, 3).forEach((row, idx) => {
    console.log(`\nFila ${idx}:`);
    row.slice(0, 15).forEach((cell, colIdx) => {
      if (cell !== '' && cell !== undefined) {
        console.log(`  Col ${colIdx}: ${cell}`);
      }
    });
  });

  // Guardar análisis
  const outputData = {
    metadata: {
      totalFilas: range.e.r + 1,
      totalColumnas: range.e.c + 1,
      totalClientes: clientes.length,
      totalHeaders: headers.length
    },
    clientes: clientes.slice(0, 10),  // Primeros 10
    headers: headers,
    datosCompletos: data
  };

  const outputFile = path.join(__dirname, 'prestamos_detailed_analysis.json');
  fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2), 'utf8');
  console.log(`\n\n✓ Análisis detallado guardado en: ${outputFile}`);

} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  console.error(error.stack);
  process.exit(1);
}
