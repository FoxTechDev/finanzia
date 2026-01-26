/**
 * Genera scripts SQL para importar datos a PostgreSQL
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = __dirname;

// Leer archivos JSON
const personas = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, 'clientes_import.json'), 'utf8'));
const direcciones = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, 'direcciones_import.json'), 'utf8'));
const prestamos = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, 'prestamos_import.json'), 'utf8'));
const pagos = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, 'pagos_import.json'), 'utf8'));

/**
 * Escapa valores para SQL
 */
function escaparSQL(valor) {
  if (valor === null || valor === undefined) {
    return 'NULL';
  }
  if (typeof valor === 'number') {
    return valor;
  }
  if (typeof valor === 'boolean') {
    return valor ? 'TRUE' : 'FALSE';
  }
  // String: escapar comillas simples
  return `'${String(valor).replace(/'/g, "''")}'`;
}

/**
 * Genera SQL INSERT para personas
 */
function generarSQLPersonas() {
  let sql = `-- =============================================
-- INSERTAR PERSONAS (CLIENTES)
-- Total: ${personas.length} registros
-- =============================================

`;

  personas.forEach(p => {
    sql += `INSERT INTO persona (
  "idPersona", nombre, apellido, "fechaNacimiento", sexo, nacionalidad,
  "estadoCivil", telefono, "correoElectronico", "numeroDui",
  "fechaEmisionDui", "lugarEmisionDui"
) VALUES (
  ${p.id},
  ${escaparSQL(p.nombre)},
  ${escaparSQL(p.apellido)},
  ${escaparSQL(p.fechaNacimiento)},
  ${escaparSQL(p.sexo)},
  ${escaparSQL(p.nacionalidad)},
  ${escaparSQL(p.estadoCivil)},
  ${escaparSQL(p.telefono)},
  ${escaparSQL(p.correoElectronico)},
  ${escaparSQL(p.numeroDui)},
  ${escaparSQL(p.fechaEmisionDui)},
  ${escaparSQL(p.lugarEmisionDui)}
);

`;
  });

  sql += `-- Actualizar secuencia de persona
SELECT setval('persona_"idPersona"_seq', (SELECT MAX("idPersona") FROM persona));

`;

  return sql;
}

/**
 * Genera SQL INSERT para direcciones
 */
function generarSQLDirecciones() {
  let sql = `-- =============================================
-- INSERTAR DIRECCIONES
-- Total: ${direcciones.length} registros
-- =============================================

`;

  direcciones.forEach(d => {
    sql += `INSERT INTO direccion (
  "idDireccion", "idPersona", "idDepartamento", "idMunicipio",
  "idDistrito", "detalleDireccion"
) VALUES (
  ${d.id},
  ${d.personaId},
  ${d.departamentoId},
  ${d.municipioId},
  ${d.distritoId},
  ${escaparSQL(d.detalleDireccion)}
);

`;
  });

  sql += `-- Actualizar secuencia de direccion
SELECT setval('direccion_"idDireccion"_seq', (SELECT MAX("idDireccion") FROM direccion));

`;

  return sql;
}

/**
 * Genera SQL INSERT para prestamos
 */
function generarSQLPrestamos() {
  let sql = `-- =============================================
-- INSERTAR PRESTAMOS
-- Total: ${prestamos.length} registros
-- =============================================

`;

  prestamos.forEach(p => {
    sql += `INSERT INTO prestamo (
  id, "solicitudId", "personaId", "numeroCredito", "tipoCreditoId",
  "montoAutorizado", "montoDesembolsado", "plazoAutorizado",
  "tasaInteres", "tasaInteresMoratorio", "tipoInteres", "periodicidadPago",
  "cuotaNormal", "cuotaTotal", "numeroCuotas", "totalInteres",
  "totalRecargos", "totalPagar", "saldoCapital", "saldoInteres",
  "capitalMora", "interesMora", "diasMora", "fechaOtorgamiento",
  "fechaPrimeraCuota", "fechaVencimiento", "fechaUltimoPago",
  "fechaCancelacion", "clasificacionPrestamoId", "categoriaNCB022",
  "estadoPrestamoId", estado, "usuarioDesembolsoId", "nombreUsuarioDesembolso"
) VALUES (
  ${p.id},
  ${escaparSQL(p.solicitudId)},
  ${p.personaId},
  ${escaparSQL(p.numeroCredito)},
  ${p.tipoCreditoId},
  ${p.montoAutorizado},
  ${p.montoDesembolsado},
  ${p.plazoAutorizado},
  ${p.tasaInteres},
  ${p.tasaInteresMoratorio},
  ${escaparSQL(p.tipoInteres)},
  ${escaparSQL(p.periodicidadPago)},
  ${p.cuotaNormal},
  ${p.cuotaTotal},
  ${p.numeroCuotas},
  ${p.totalInteres},
  ${p.totalRecargos},
  ${p.totalPagar},
  ${p.saldoCapital},
  ${p.saldoInteres},
  ${p.capitalMora},
  ${p.interesMora},
  ${p.diasMora},
  ${escaparSQL(p.fechaOtorgamiento)},
  ${escaparSQL(p.fechaPrimeraCuota)},
  ${escaparSQL(p.fechaVencimiento)},
  ${escaparSQL(p.fechaUltimoPago)},
  ${escaparSQL(p.fechaCancelacion)},
  ${escaparSQL(p.clasificacionPrestamoId)},
  ${escaparSQL(p.categoriaNCB022)},
  ${escaparSQL(p.estadoPrestamoId)},
  ${escaparSQL(p.estado)},
  ${escaparSQL(p.usuarioDesembolsoId)},
  ${escaparSQL(p.nombreUsuarioDesembolso)}
);

`;
  });

  sql += `-- Actualizar secuencia de prestamo
SELECT setval('prestamo_id_seq', (SELECT MAX(id) FROM prestamo));

`;

  return sql;
}

/**
 * Genera SQL INSERT para pagos
 */
function generarSQLPagos() {
  let sql = `-- =============================================
-- INSERTAR PAGOS
-- Total: ${pagos.length} registros
-- =============================================

`;

  // Generar en lotes de 50 para mejor rendimiento
  const loteSize = 50;
  for (let i = 0; i < pagos.length; i += loteSize) {
    const lote = pagos.slice(i, i + loteSize);

    lote.forEach(p => {
      sql += `INSERT INTO pago (
  id, "prestamoId", "numeroPago", "fechaPago", "fechaRegistro",
  "montoPagado", "capitalAplicado", "interesAplicado",
  "recargosAplicado", "interesMoratorioAplicado",
  "saldoCapitalAnterior", "saldoInteresAnterior",
  "capitalMoraAnterior", "interesMoraAnterior", "diasMoraAnterior",
  "saldoCapitalPosterior", "saldoInteresPosterior",
  "tipoPago", estado, "fechaAnulacion", "motivoAnulacion",
  "usuarioAnulacionId", "nombreUsuarioAnulacion",
  "usuarioId", "nombreUsuario", observaciones
) VALUES (
  ${p.id},
  ${p.prestamoId},
  ${escaparSQL(p.numeroPago)},
  ${escaparSQL(p.fechaPago)},
  ${escaparSQL(p.fechaRegistro)},
  ${p.montoPagado},
  ${p.capitalAplicado},
  ${p.interesAplicado},
  ${p.recargosAplicado},
  ${p.interesMoratorioAplicado},
  ${p.saldoCapitalAnterior},
  ${p.saldoInteresAnterior},
  ${p.capitalMoraAnterior},
  ${p.interesMoraAnterior},
  ${p.diasMoraAnterior},
  ${p.saldoCapitalPosterior},
  ${p.saldoInteresPosterior},
  ${escaparSQL(p.tipoPago)},
  ${escaparSQL(p.estado)},
  ${escaparSQL(p.fechaAnulacion)},
  ${escaparSQL(p.motivoAnulacion)},
  ${escaparSQL(p.usuarioAnulacionId)},
  ${escaparSQL(p.nombreUsuarioAnulacion)},
  ${escaparSQL(p.usuarioId)},
  ${escaparSQL(p.nombreUsuario)},
  ${escaparSQL(p.observaciones)}
);

`;
    });
  }

  sql += `-- Actualizar secuencia de pago
SELECT setval('pago_id_seq', (SELECT MAX(id) FROM pago));

`;

  return sql;
}

/**
 * Genera script SQL completo
 */
function generarSQLCompleto() {
  console.log('Generando scripts SQL de importación...\n');

  let sqlCompleto = `-- =============================================
-- SCRIPT DE IMPORTACIÓN DE DATOS
-- Generado: ${new Date().toISOString()}
-- Fuente: prestamos.xlsx
-- =============================================
--
-- ADVERTENCIA: Este script insertará datos de importación.
-- Asegúrese de ejecutar en el orden correcto:
-- 1. Personas
-- 2. Direcciones
-- 3. Préstamos
-- 4. Pagos
--
-- IMPORTANTE: Verifique que existan los catálogos necesarios:
-- - tipo_credito (id: 1)
-- - departamento (id: 6)
-- - municipio (id: 1)
-- - distrito (id: 1)
-- =============================================

BEGIN;

-- Deshabilitar triggers temporalmente para mejorar rendimiento
SET session_replication_role = 'replica';

`;

  // Generar cada sección
  sqlCompleto += generarSQLPersonas();
  sqlCompleto += '\n';
  sqlCompleto += generarSQLDirecciones();
  sqlCompleto += '\n';
  sqlCompleto += generarSQLPrestamos();
  sqlCompleto += '\n';
  sqlCompleto += generarSQLPagos();

  sqlCompleto += `
-- Rehabilitar triggers
SET session_replication_role = 'origin';

COMMIT;

-- =============================================
-- FIN DEL SCRIPT
-- =============================================
`;

  return sqlCompleto;
}

// Generar archivos SQL individuales y completo
console.log('='.repeat(70));
console.log('GENERACIÓN DE SCRIPTS SQL');
console.log('='.repeat(70));
console.log('');

const sqlPersonas = generarSQLPersonas();
fs.writeFileSync(path.join(OUTPUT_DIR, '01_insert_personas.sql'), sqlPersonas, 'utf8');
console.log(`✓ 01_insert_personas.sql (${personas.length} registros)`);

const sqlDirecciones = generarSQLDirecciones();
fs.writeFileSync(path.join(OUTPUT_DIR, '02_insert_direcciones.sql'), sqlDirecciones, 'utf8');
console.log(`✓ 02_insert_direcciones.sql (${direcciones.length} registros)`);

const sqlPrestamos = generarSQLPrestamos();
fs.writeFileSync(path.join(OUTPUT_DIR, '03_insert_prestamos.sql'), sqlPrestamos, 'utf8');
console.log(`✓ 03_insert_prestamos.sql (${prestamos.length} registros)`);

const sqlPagos = generarSQLPagos();
fs.writeFileSync(path.join(OUTPUT_DIR, '04_insert_pagos.sql'), sqlPagos, 'utf8');
console.log(`✓ 04_insert_pagos.sql (${pagos.length} registros)`);

const sqlCompleto = generarSQLCompleto();
fs.writeFileSync(path.join(OUTPUT_DIR, 'import_all.sql'), sqlCompleto, 'utf8');
console.log(`✓ import_all.sql (script completo)`);

console.log('');
console.log('='.repeat(70));
console.log('SCRIPTS SQL GENERADOS EXITOSAMENTE');
console.log('='.repeat(70));
console.log('');
console.log('Para importar los datos:');
console.log('  1. Conéctese a la base de datos PostgreSQL');
console.log('  2. Ejecute: \\i import_all.sql');
console.log('  O ejecute los scripts individuales en orden numérico');
console.log('');
