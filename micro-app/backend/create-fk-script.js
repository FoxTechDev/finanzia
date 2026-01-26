const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'micro_app',
  multipleStatements: true
};

// Definición de las FK a crear
const FOREIGN_KEYS = [
  // PRIORIDAD 1 - CRÍTICA
  {
    name: 'FK_tipo_credito_linea_credito',
    table: 'tipo_credito',
    column: 'lineaCreditoId',
    refTable: 'linea_credito',
    refColumn: 'id',
    onDelete: 'RESTRICT',
    priority: 1,
    validation: `
      SELECT tc.id, tc.codigo, tc.lineaCreditoId
      FROM tipo_credito tc
      LEFT JOIN linea_credito lc ON tc.lineaCreditoId = lc.id
      WHERE lc.id IS NULL
    `
  },
  {
    name: 'FK_solicitud_linea_credito',
    table: 'solicitud',
    column: 'lineaCreditoId',
    refTable: 'linea_credito',
    refColumn: 'id',
    onDelete: 'RESTRICT',
    priority: 1,
    validation: `
      SELECT s.id, s.numeroSolicitud, s.lineaCreditoId
      FROM solicitud s
      LEFT JOIN linea_credito lc ON s.lineaCreditoId = lc.id
      WHERE lc.id IS NULL
    `
  },
  {
    name: 'FK_solicitud_tipo_credito',
    table: 'solicitud',
    column: 'tipoCreditoId',
    refTable: 'tipo_credito',
    refColumn: 'id',
    onDelete: 'RESTRICT',
    priority: 1,
    validation: `
      SELECT s.id, s.numeroSolicitud, s.tipoCreditoId
      FROM solicitud s
      LEFT JOIN tipo_credito tc ON s.tipoCreditoId = tc.id
      WHERE tc.id IS NULL
    `
  },
  {
    name: 'FK_prestamo_solicitud',
    table: 'prestamo',
    column: 'solicitudId',
    refTable: 'solicitud',
    refColumn: 'id',
    onDelete: 'RESTRICT',
    priority: 1,
    validation: `
      SELECT p.id, p.numeroCredito, p.solicitudId
      FROM prestamo p
      LEFT JOIN solicitud s ON p.solicitudId = s.id
      WHERE s.id IS NULL
    `
  },
  {
    name: 'FK_prestamo_persona',
    table: 'prestamo',
    column: 'personaId',
    refTable: 'persona',
    refColumn: 'idPersona',
    onDelete: 'RESTRICT',
    priority: 1,
    validation: `
      SELECT p.id, p.numeroCredito, p.personaId
      FROM prestamo p
      LEFT JOIN persona per ON p.personaId = per.idPersona
      WHERE per.idPersona IS NULL
    `
  },
  {
    name: 'FK_prestamo_tipo_credito',
    table: 'prestamo',
    column: 'tipoCreditoId',
    refTable: 'tipo_credito',
    refColumn: 'id',
    onDelete: 'RESTRICT',
    priority: 1,
    validation: `
      SELECT p.id, p.numeroCredito, p.tipoCreditoId
      FROM prestamo p
      LEFT JOIN tipo_credito tc ON p.tipoCreditoId = tc.id
      WHERE tc.id IS NULL
    `
  },
  {
    name: 'FK_plan_pago_prestamo',
    table: 'plan_pago',
    column: 'prestamoId',
    refTable: 'prestamo',
    refColumn: 'id',
    onDelete: 'CASCADE',
    priority: 1,
    validation: `
      SELECT pp.id, pp.prestamoId, pp.numeroCuota
      FROM plan_pago pp
      LEFT JOIN prestamo p ON pp.prestamoId = p.id
      WHERE p.id IS NULL
    `
  },
  {
    name: 'FK_pago_prestamo',
    table: 'pago',
    column: 'prestamoId',
    refTable: 'prestamo',
    refColumn: 'id',
    onDelete: 'RESTRICT',
    priority: 1,
    validation: `
      SELECT pg.id, pg.numeroPago, pg.prestamoId
      FROM pago pg
      LEFT JOIN prestamo p ON pg.prestamoId = p.id
      WHERE p.id IS NULL
    `
  },
  // PRIORIDAD 2 - ALTA
  {
    name: 'FK_pago_detalle_cuota_pago',
    table: 'pago_detalle_cuota',
    column: 'pagoId',
    refTable: 'pago',
    refColumn: 'id',
    onDelete: 'CASCADE',
    priority: 2,
    validation: `
      SELECT pdc.id, pdc.pagoId
      FROM pago_detalle_cuota pdc
      LEFT JOIN pago pg ON pdc.pagoId = pg.id
      WHERE pg.id IS NULL
    `
  },
  {
    name: 'FK_pago_detalle_cuota_plan_pago',
    table: 'pago_detalle_cuota',
    column: 'planPagoId',
    refTable: 'plan_pago',
    refColumn: 'id',
    onDelete: 'RESTRICT',
    priority: 2,
    validation: `
      SELECT pdc.id, pdc.planPagoId
      FROM pago_detalle_cuota pdc
      LEFT JOIN plan_pago pp ON pdc.planPagoId = pp.id
      WHERE pp.id IS NULL
    `
  },
  {
    name: 'FK_deduccion_prestamo_prestamo',
    table: 'deduccion_prestamo',
    column: 'prestamoId',
    refTable: 'prestamo',
    refColumn: 'id',
    onDelete: 'CASCADE',
    priority: 2,
    validation: `
      SELECT dp.id, dp.prestamoId
      FROM deduccion_prestamo dp
      LEFT JOIN prestamo p ON dp.prestamoId = p.id
      WHERE p.id IS NULL
    `
  },
  {
    name: 'FK_recargo_prestamo_prestamo',
    table: 'recargo_prestamo',
    column: 'prestamoId',
    refTable: 'prestamo',
    refColumn: 'id',
    onDelete: 'CASCADE',
    priority: 2,
    validation: `
      SELECT rp.id, rp.prestamoId
      FROM recargo_prestamo rp
      LEFT JOIN prestamo p ON rp.prestamoId = p.id
      WHERE p.id IS NULL
    `
  },
  {
    name: 'FK_decision_comite_solicitud',
    table: 'decision_comite',
    column: 'solicitudId',
    refTable: 'solicitud',
    refColumn: 'id',
    onDelete: 'CASCADE',
    priority: 2,
    validation: `
      SELECT dc.id, dc.solicitudId
      FROM decision_comite dc
      LEFT JOIN solicitud s ON dc.solicitudId = s.id
      WHERE s.id IS NULL
    `
  },
  // PRIORIDAD 3 - MEDIA (CATÁLOGOS)
  {
    name: 'FK_deduccion_prestamo_tipo_deduccion',
    table: 'deduccion_prestamo',
    column: 'tipoDeduccionId',
    refTable: 'tipo_deduccion',
    refColumn: 'id',
    onDelete: 'SET NULL',
    priority: 3,
    validation: `
      SELECT dp.id, dp.tipoDeduccionId
      FROM deduccion_prestamo dp
      WHERE dp.tipoDeduccionId IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM tipo_deduccion td WHERE td.id = dp.tipoDeduccionId)
    `
  },
  {
    name: 'FK_recargo_prestamo_tipo_recargo',
    table: 'recargo_prestamo',
    column: 'tipoRecargoId',
    refTable: 'tipo_recargo',
    refColumn: 'id',
    onDelete: 'SET NULL',
    priority: 3,
    validation: `
      SELECT rp.id, rp.tipoRecargoId
      FROM recargo_prestamo rp
      WHERE rp.tipoRecargoId IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM tipo_recargo tr WHERE tr.id = rp.tipoRecargoId)
    `
  },
  {
    name: 'FK_prestamo_clasificacion_prestamo',
    table: 'prestamo',
    column: 'clasificacionPrestamoId',
    refTable: 'clasificacion_prestamo',
    refColumn: 'id',
    onDelete: 'SET NULL',
    priority: 3,
    validation: `
      SELECT p.id, p.clasificacionPrestamoId
      FROM prestamo p
      WHERE p.clasificacionPrestamoId IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM clasificacion_prestamo cp WHERE cp.id = p.clasificacionPrestamoId)
    `
  },
  {
    name: 'FK_prestamo_estado_prestamo',
    table: 'prestamo',
    column: 'estadoPrestamoId',
    refTable: 'estado_prestamo',
    refColumn: 'id',
    onDelete: 'SET NULL',
    priority: 3,
    validation: `
      SELECT p.id, p.estadoPrestamoId
      FROM prestamo p
      WHERE p.estadoPrestamoId IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM estado_prestamo ep WHERE ep.id = p.estadoPrestamoId)
    `
  },
  // PRIORIDAD 4 - BAJA (USUARIOS)
  {
    name: 'FK_solicitud_analista',
    table: 'solicitud',
    column: 'analistaId',
    refTable: 'users',
    refColumn: 'id',
    onDelete: 'SET NULL',
    priority: 4,
    validation: `
      SELECT s.id, s.analistaId
      FROM solicitud s
      WHERE s.analistaId IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = s.analistaId)
    `
  },
  {
    name: 'FK_solicitud_aprobador',
    table: 'solicitud',
    column: 'aprobadorId',
    refTable: 'users',
    refColumn: 'id',
    onDelete: 'SET NULL',
    priority: 4,
    validation: `
      SELECT s.id, s.aprobadorId
      FROM solicitud s
      WHERE s.aprobadorId IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = s.aprobadorId)
    `
  },
  {
    name: 'FK_prestamo_usuario_desembolso',
    table: 'prestamo',
    column: 'usuarioDesembolsoId',
    refTable: 'users',
    refColumn: 'id',
    onDelete: 'SET NULL',
    priority: 4,
    validation: `
      SELECT p.id, p.usuarioDesembolsoId
      FROM prestamo p
      WHERE p.usuarioDesembolsoId IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = p.usuarioDesembolsoId)
    `
  },
  {
    name: 'FK_pago_usuario',
    table: 'pago',
    column: 'usuarioId',
    refTable: 'users',
    refColumn: 'id',
    onDelete: 'SET NULL',
    priority: 4,
    validation: `
      SELECT pg.id, pg.usuarioId
      FROM pago pg
      WHERE pg.usuarioId IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = pg.usuarioId)
    `
  },
  {
    name: 'FK_pago_usuario_anulacion',
    table: 'pago',
    column: 'usuarioAnulacionId',
    refTable: 'users',
    refColumn: 'id',
    onDelete: 'SET NULL',
    priority: 4,
    validation: `
      SELECT pg.id, pg.usuarioAnulacionId
      FROM pago pg
      WHERE pg.usuarioAnulacionId IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = pg.usuarioAnulacionId)
    `
  },
  {
    name: 'FK_decision_comite_usuario',
    table: 'decision_comite',
    column: 'usuarioId',
    refTable: 'users',
    refColumn: 'id',
    onDelete: 'SET NULL',
    priority: 4,
    validation: `
      SELECT dc.id, dc.usuarioId
      FROM decision_comite dc
      WHERE dc.usuarioId IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = dc.usuarioId)
    `
  },
  {
    name: 'FK_solicitud_historial_usuario',
    table: 'solicitud_historial',
    column: 'usuarioId',
    refTable: 'users',
    refColumn: 'id',
    onDelete: 'SET NULL',
    priority: 4,
    validation: `
      SELECT sh.id, sh.usuarioId
      FROM solicitud_historial sh
      WHERE sh.usuarioId IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = sh.usuarioId)
    `
  }
];

async function checkIfFKExists(connection, constraintName) {
  const [rows] = await connection.execute(`
    SELECT COUNT(*) as count
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = 'micro_app'
      AND CONSTRAINT_NAME = ?
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
  `, [constraintName]);
  return rows[0].count > 0;
}

async function validateForeignKey(connection, fk) {
  console.log(`\n  Validando ${fk.name}...`);

  const [orphanRows] = await connection.execute(fk.validation);

  if (orphanRows.length > 0) {
    console.log(`  ⚠️  ADVERTENCIA: ${orphanRows.length} registro(s) huérfano(s) encontrado(s)`);
    console.log(`     Tabla: ${fk.table}, Columna: ${fk.column}`);
    console.log(`     Primeros 3 registros huérfanos:`, orphanRows.slice(0, 3));
    return false;
  }

  console.log(`  ✅ Validación exitosa - No hay registros huérfanos`);
  return true;
}

async function createForeignKey(connection, fk) {
  const sql = `
    ALTER TABLE ${fk.table}
    ADD CONSTRAINT ${fk.name}
    FOREIGN KEY (${fk.column})
    REFERENCES ${fk.refTable}(${fk.refColumn})
    ON DELETE ${fk.onDelete}
    ON UPDATE CASCADE
  `;

  await connection.execute(sql);
}

async function main() {
  const connection = await mysql.createConnection(DB_CONFIG);

  try {
    console.log('='.repeat(80));
    console.log('CREACIÓN DE FOREIGN KEYS FALTANTES - micro_app');
    console.log('='.repeat(80));

    // Agrupar por prioridad
    const byPriority = FOREIGN_KEYS.reduce((acc, fk) => {
      if (!acc[fk.priority]) acc[fk.priority] = [];
      acc[fk.priority].push(fk);
      return acc;
    }, {});

    const results = {
      total: FOREIGN_KEYS.length,
      created: 0,
      skipped: 0,
      failed: 0,
      errors: []
    };

    // Procesar por prioridad
    for (const priority of [1, 2, 3, 4]) {
      const fks = byPriority[priority] || [];
      if (fks.length === 0) continue;

      console.log(`\n${'='.repeat(80)}`);
      console.log(`PRIORIDAD ${priority} - ${fks.length} Foreign Keys`);
      console.log('='.repeat(80));

      for (const fk of fks) {
        try {
          // Verificar si ya existe
          const exists = await checkIfFKExists(connection, fk.name);
          if (exists) {
            console.log(`\n⏭️  ${fk.name} ya existe - SALTANDO`);
            results.skipped++;
            continue;
          }

          // Validar datos
          const isValid = await validateForeignKey(connection, fk);

          if (!isValid) {
            console.log(`  ❌ SALTANDO ${fk.name} - Datos huérfanos detectados`);
            results.failed++;
            results.errors.push({
              fk: fk.name,
              error: 'Datos huérfanos detectados'
            });
            continue;
          }

          // Crear FK
          console.log(`  Creando ${fk.name}...`);
          await createForeignKey(connection, fk);
          console.log(`  ✅ ${fk.name} creada exitosamente`);
          results.created++;

        } catch (error) {
          console.error(`  ❌ Error creando ${fk.name}:`, error.message);
          results.failed++;
          results.errors.push({
            fk: fk.name,
            error: error.message
          });
        }
      }
    }

    // Resumen
    console.log('\n' + '='.repeat(80));
    console.log('RESUMEN DE EJECUCIÓN');
    console.log('='.repeat(80));
    console.log(`Total FK definidas:     ${results.total}`);
    console.log(`FK creadas:             ${results.created}`);
    console.log(`FK ya existentes:       ${results.skipped}`);
    console.log(`FK fallidas:            ${results.failed}`);

    if (results.errors.length > 0) {
      console.log('\nERRORES ENCONTRADOS:');
      results.errors.forEach(err => {
        console.log(`  - ${err.fk}: ${err.error}`);
      });
    }

    // Guardar log
    const logFile = path.join(__dirname, 'fk-creation-log.json');
    await fs.writeFile(logFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      results,
      errors: results.errors
    }, null, 2));

    console.log(`\n📄 Log guardado en: ${logFile}`);

  } catch (error) {
    console.error('Error fatal:', error);
  } finally {
    await connection.end();
  }
}

main();
