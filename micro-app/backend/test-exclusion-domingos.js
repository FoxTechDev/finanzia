/**
 * Script de prueba para validar la lógica de exclusión de domingos
 * Este script simula el comportamiento del método agregarDiasHabilesExcluyendoDomingos
 *
 * Ejecutar: node test-exclusion-domingos.js
 */

/**
 * Agrega días hábiles a una fecha, excluyendo domingos
 * @param {Date} fecha - Fecha base a modificar
 * @param {number} diasAgregar - Número de días hábiles a agregar
 */
function agregarDiasHabilesExcluyendoDomingos(fecha, diasAgregar) {
  // Primero, verificar si la fecha inicial es domingo y ajustarla
  if (fecha.getDay() === 0) {
    fecha.setDate(fecha.getDate() + 1);
  }

  // Ahora agregar los días adicionales
  for (let i = 0; i < diasAgregar; i++) {
    // Agregar 1 día
    fecha.setDate(fecha.getDate() + 1);

    // Si cae en domingo (0), avanzar al lunes
    if (fecha.getDay() === 0) {
      fecha.setDate(fecha.getDate() + 1);
    }
  }
}

/**
 * Función de prueba
 */
function testExclusionDomingos() {
  console.log('='.repeat(80));
  console.log('TEST: Exclusión de Domingos en Periodicidad DIARIA');
  console.log('='.repeat(80));

  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Test 1: Iniciar viernes 31 de enero 2026, 5 días
  console.log('\n📋 Test 1: Viernes 31 enero 2026 + 5 días');
  console.log('-'.repeat(80));
  let fechaInicial = new Date(2026, 0, 31); // 31 enero 2026 (viernes)
  console.log(`Fecha inicial: ${diasSemana[fechaInicial.getDay()]} ${fechaInicial.toLocaleDateString()}`);

  const plan1 = [];
  let fecha = new Date(fechaInicial);
  for (let i = 0; i < 5; i++) {
    // Para la primera cuota, usar la fecha inicial tal cual (ajustándola si es domingo)
    if (i === 0) {
      if (fecha.getDay() === 0) {
        fecha.setDate(fecha.getDate() + 1);
      }
    } else {
      // Para las siguientes cuotas, agregar días hábiles
      agregarDiasHabilesExcluyendoDomingos(fecha, 1);
    }

    plan1.push({
      cuota: i + 1,
      dia: diasSemana[fecha.getDay()],
      fecha: fecha.toLocaleDateString()
    });
  }

  console.table(plan1);

  // Validar que no hay domingos
  const tieneDomingos1 = plan1.some(p => p.dia === 'Domingo');
  console.log(`✅ ¿Tiene domingos?: ${tieneDomingos1 ? 'SÍ ❌' : 'NO ✅'}`);

  // Test 2: Iniciar sábado 1 de febrero 2026 (que es domingo), 7 días
  console.log('\n📋 Test 2: Domingo 1 febrero 2026 + 7 días (debe ajustar al lunes 2)');
  console.log('-'.repeat(80));
  fechaInicial = new Date(2026, 1, 1); // 1 febrero 2026 (domingo)
  console.log(`Fecha inicial: ${diasSemana[fechaInicial.getDay()]} ${fechaInicial.toLocaleDateString()}`);

  const plan2 = [];
  fecha = new Date(fechaInicial);
  for (let i = 0; i < 7; i++) {
    if (i === 0) {
      if (fecha.getDay() === 0) {
        fecha.setDate(fecha.getDate() + 1);
      }
    } else {
      agregarDiasHabilesExcluyendoDomingos(fecha, 1);
    }

    plan2.push({
      cuota: i + 1,
      dia: diasSemana[fecha.getDay()],
      fecha: fecha.toLocaleDateString()
    });
  }

  console.table(plan2);

  const tieneDomingos2 = plan2.some(p => p.dia === 'Domingo');
  console.log(`✅ ¿Tiene domingos?: ${tieneDomingos2 ? 'SÍ ❌' : 'NO ✅'}`);

  // Test 3: Iniciar lunes 2 de febrero 2026, 10 días
  console.log('\n📋 Test 3: Lunes 2 febrero 2026 + 10 días');
  console.log('-'.repeat(80));
  fechaInicial = new Date(2026, 1, 2); // 2 febrero 2026 (lunes)
  console.log(`Fecha inicial: ${diasSemana[fechaInicial.getDay()]} ${fechaInicial.toLocaleDateString()}`);

  const plan3 = [];
  fecha = new Date(fechaInicial);
  for (let i = 0; i < 10; i++) {
    if (i === 0) {
      if (fecha.getDay() === 0) {
        fecha.setDate(fecha.getDate() + 1);
      }
    } else {
      agregarDiasHabilesExcluyendoDomingos(fecha, 1);
    }

    plan3.push({
      cuota: i + 1,
      dia: diasSemana[fecha.getDay()],
      fecha: fecha.toLocaleDateString()
    });
  }

  console.table(plan3);

  const tieneDomingos3 = plan3.some(p => p.dia === 'Domingo');
  console.log(`✅ ¿Tiene domingos?: ${tieneDomingos3 ? 'SÍ ❌' : 'NO ✅'}`);

  // Test 4: Iniciar jueves 29 de enero 2026, 15 días
  console.log('\n📋 Test 4: Jueves 29 enero 2026 + 15 días (2 semanas completas)');
  console.log('-'.repeat(80));
  fechaInicial = new Date(2026, 0, 29); // 29 enero 2026 (jueves)
  console.log(`Fecha inicial: ${diasSemana[fechaInicial.getDay()]} ${fechaInicial.toLocaleDateString()}`);

  const plan4 = [];
  fecha = new Date(fechaInicial);
  for (let i = 0; i < 15; i++) {
    if (i === 0) {
      if (fecha.getDay() === 0) {
        fecha.setDate(fecha.getDate() + 1);
      }
    } else {
      agregarDiasHabilesExcluyendoDomingos(fecha, 1);
    }

    plan4.push({
      cuota: i + 1,
      dia: diasSemana[fecha.getDay()],
      fecha: fecha.toLocaleDateString()
    });
  }

  console.table(plan4);

  const tieneDomingos4 = plan4.some(p => p.dia === 'Domingo');
  console.log(`✅ ¿Tiene domingos?: ${tieneDomingos4 ? 'SÍ ❌' : 'NO ✅'}`);

  // Resumen
  console.log('\n' + '='.repeat(80));
  console.log('RESUMEN DE PRUEBAS');
  console.log('='.repeat(80));

  const todosExitosos = !tieneDomingos1 && !tieneDomingos2 && !tieneDomingos3 && !tieneDomingos4;

  if (todosExitosos) {
    console.log('✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE');
    console.log('✅ No se encontraron domingos en ningún plan de pago');
  } else {
    console.log('❌ ALGUNAS PRUEBAS FALLARON');
    console.log('❌ Se encontraron domingos en uno o más planes de pago');
  }

  console.log('='.repeat(80));
}

// Ejecutar pruebas
testExclusionDomingos();
