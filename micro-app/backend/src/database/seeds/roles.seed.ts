import { DataSource } from 'typeorm';
import { Rol } from '../../catalogos/rol/entities/rol.entity';

/**
 * Seeder para los roles del sistema
 * Inserta los roles iniciales: ADMIN, ASESOR, COMITE
 */
export async function seedRoles(dataSource: DataSource): Promise<void> {
  console.log('🌱 Iniciando seed de roles...');

  const rolRepository = dataSource.getRepository(Rol);

  const roles = [
    {
      codigo: 'ADMIN',
      nombre: 'Administrador',
      descripcion: 'Acceso completo a todo el sistema',
      orden: 1,
      activo: true,
    },
    {
      codigo: 'ASESOR',
      nombre: 'Asesor de Negocio',
      descripcion: 'Acceso a clientes, solicitudes y análisis del asesor',
      orden: 2,
      activo: true,
    },
    {
      codigo: 'COMITE',
      nombre: 'Comité de Crédito',
      descripcion: 'Acceso al comité de crédito y visualización de solicitudes',
      orden: 3,
      activo: true,
    },
  ];

  for (const rolData of roles) {
    const existe = await rolRepository.findOne({
      where: { codigo: rolData.codigo },
    });

    if (!existe) {
      const rol = rolRepository.create(rolData);
      await rolRepository.save(rol);
      console.log(`  ✅ Rol ${rolData.codigo} - ${rolData.nombre} creado`);
    } else {
      console.log(`  ⏭️  Rol ${rolData.codigo} ya existe, omitiendo...`);
    }
  }

  console.log('✅ Seed de roles completado!\n');
}
