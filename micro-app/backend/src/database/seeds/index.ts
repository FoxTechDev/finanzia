import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../../config/typeorm.config';
import { seedCatalogos } from './catalogos.seed';
import { seedUbicaciones } from './ubicacion.seed';
import { seedCreditos } from './creditos.seed';
import { seedDesembolso } from './desembolso.seed';
import { seedRoles } from './roles.seed';

async function runSeeds() {
  console.log('🚀 Conectando a la base de datos...');

  const dataSource = new DataSource(dataSourceOptions);

  try {
    await dataSource.initialize();
    console.log('✓ Conexión establecida\n');

    // Ejecutar seeds en orden
    await seedRoles(dataSource); // Roles primero ya que users depende de rol
    await seedCatalogos(dataSource);
    await seedUbicaciones(dataSource);
    await seedCreditos(dataSource);
    await seedDesembolso(dataSource);

    console.log('\n🎉 Todos los seeds ejecutados correctamente!');
  } catch (error) {
    console.error('❌ Error ejecutando seeds:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('\n👋 Conexión cerrada');
  }
}

runSeeds();
