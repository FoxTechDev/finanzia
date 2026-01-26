import { DataSource } from 'typeorm';
import { CATALOGOS_CONFIG } from '../../catalogos/catalogos.config';

/**
 * Seeder para todos los catálogos del sistema
 * Inserta los valores iniciales definidos en catalogos.config.ts
 */
export async function seedCatalogos(dataSource: DataSource): Promise<void> {
  console.log('🌱 Iniciando seed de catálogos...');

  for (const catalogo of CATALOGOS_CONFIG) {
    console.log(`\n  📋 Seeding ${catalogo.nombre}...`);

    const repository = dataSource.getRepository(catalogo.tabla);

    for (const valor of catalogo.valores) {
      // Verificar si ya existe el registro
      const existe = await repository.findOne({
        where: { codigo: valor.codigo },
      });

      if (!existe) {
        const registro = repository.create({
          codigo: valor.codigo,
          nombre: valor.nombre,
          descripcion: valor.descripcion || null,
          orden: valor.orden || null,
          color: valor.color || null,
          activo: true,
        });

        await repository.save(registro);
        console.log(`    ✅ ${valor.codigo} - ${valor.nombre}`);
      } else {
        console.log(`    ⏭️  ${valor.codigo} ya existe, omitiendo...`);
      }
    }
  }

  console.log('\n✅ Seed de catálogos completado exitosamente!\n');
}
