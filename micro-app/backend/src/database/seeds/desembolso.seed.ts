import { DataSource } from 'typeorm';
import { EstadoPrestamo } from '../../creditos/desembolso/entities/estado-prestamo.entity';
import { ClasificacionPrestamo } from '../../creditos/desembolso/entities/clasificacion-prestamo.entity';

/**
 * Seeder para catálogos del módulo de desembolso
 * Inserta estados de préstamo y clasificaciones NCB-022
 */
export async function seedDesembolso(dataSource: DataSource): Promise<void> {
  console.log('🏦 Iniciando seed de catálogos de desembolso...');

  // Seed de Estados de Préstamo
  console.log('\n  📋 Seeding Estados de Préstamo...');
  const estadoPrestamoRepo = dataSource.getRepository(EstadoPrestamo);

  const estadosPrestamo = [
    {
      codigo: 'VIGENTE',
      nombre: 'Vigente',
      descripcion: 'Préstamo activo y al día en sus pagos',
      orden: 1,
      color: '#28A745',
    },
    {
      codigo: 'MORA',
      nombre: 'En Mora',
      descripcion: 'Préstamo con pagos atrasados',
      orden: 2,
      color: '#FFC107',
    },
    {
      codigo: 'CANCELADO',
      nombre: 'Cancelado',
      descripcion: 'Préstamo totalmente pagado',
      orden: 3,
      color: '#17A2B8',
    },
    {
      codigo: 'CASTIGADO',
      nombre: 'Castigado',
      descripcion: 'Préstamo declarado incobrable',
      orden: 4,
      color: '#DC3545',
    },
  ];

  for (const estado of estadosPrestamo) {
    const existe = await estadoPrestamoRepo.findOne({
      where: { codigo: estado.codigo },
    });

    if (!existe) {
      const registro = estadoPrestamoRepo.create({
        ...estado,
        activo: true,
      });
      await estadoPrestamoRepo.save(registro);
      console.log(`    ✅ ${estado.codigo} - ${estado.nombre}`);
    } else {
      console.log(`    ⏭️  ${estado.codigo} ya existe, omitiendo...`);
    }
  }

  // Seed de Clasificaciones de Préstamo (NCB-022)
  console.log('\n  📋 Seeding Clasificaciones de Préstamo NCB-022...');
  const clasificacionRepo = dataSource.getRepository(ClasificacionPrestamo);

  const clasificaciones = [
    {
      codigo: 'A',
      nombre: 'Categoría A - Normal',
      descripcion: 'Crédito normal - Mora de 0 a 30 días. Provisión: 1%',
      orden: 1,
      color: '#28A745',
      diasMoraMinimo: 0,
      diasMoraMaximo: 30,
      porcentajeProvision: 1.0,
    },
    {
      codigo: 'B',
      nombre: 'Categoría B - Mención Especial',
      descripcion:
        'Crédito con problemas potenciales - Mora de 31 a 60 días. Provisión: 5%',
      orden: 2,
      color: '#FFC107',
      diasMoraMinimo: 31,
      diasMoraMaximo: 60,
      porcentajeProvision: 5.0,
    },
    {
      codigo: 'C',
      nombre: 'Categoría C - Subnormal',
      descripcion:
        'Crédito deficiente - Mora de 61 a 90 días. Provisión: 20%',
      orden: 3,
      color: '#FD7E14',
      diasMoraMinimo: 61,
      diasMoraMaximo: 90,
      porcentajeProvision: 20.0,
    },
    {
      codigo: 'D',
      nombre: 'Categoría D - Dudoso',
      descripcion:
        'Crédito de difícil recuperación - Mora de 91 a 120 días. Provisión: 50%',
      orden: 4,
      color: '#E83E8C',
      diasMoraMinimo: 91,
      diasMoraMaximo: 120,
      porcentajeProvision: 50.0,
    },
    {
      codigo: 'E',
      nombre: 'Categoría E - Pérdida',
      descripcion:
        'Crédito irrecuperable - Mora mayor a 120 días. Provisión: 100%',
      orden: 5,
      color: '#DC3545',
      diasMoraMinimo: 121,
      diasMoraMaximo: null,
      porcentajeProvision: 100.0,
    },
  ];

  for (const clasificacion of clasificaciones) {
    const existe = await clasificacionRepo.findOne({
      where: { codigo: clasificacion.codigo },
    });

    if (!existe) {
      const registro = clasificacionRepo.create({
        ...clasificacion,
        activo: true,
      });
      await clasificacionRepo.save(registro);
      console.log(`    ✅ ${clasificacion.codigo} - ${clasificacion.nombre}`);
    } else {
      console.log(`    ⏭️  ${clasificacion.codigo} ya existe, omitiendo...`);
    }
  }

  console.log('\n✅ Seed de desembolso completado exitosamente!');
}
