import { DataSource } from 'typeorm';

/**
 * Seed para la tabla estado_solicitud con el nuevo flujo de estados
 *
 * Estados del flujo:
 * 1. REGISTRADA - Estado inicial al crear la solicitud
 * 2. ANALIZADA - Se asigna automáticamente cuando el asesor ingresa su análisis
 * 3. EN_COMITE - Cuando el asesor traslada a comité
 * 4. OBSERVADA - Cuando el comité observa la solicitud
 * 5. DENEGADA - Cuando el comité deniega (estado final)
 * 6. APROBADA - Cuando el comité aprueba
 * 7. DESEMBOLSADA - Estado final después del desembolso
 */
export async function seedEstadoSolicitud(dataSource: DataSource): Promise<void> {
  console.log('🌱 Iniciando seed de estados de solicitud...');

  const repository = dataSource.getRepository('estado_solicitud');

  const estados = [
    {
      codigo: 'REGISTRADA',
      nombre: 'Registrada',
      descripcion: 'Estado inicial al crear la solicitud',
      orden: 1,
      color: '#6C757D',
      activo: true,
    },
    {
      codigo: 'ANALIZADA',
      nombre: 'Analizada',
      descripcion: 'Se asigna automáticamente cuando el asesor ingresa su análisis',
      orden: 2,
      color: '#17A2B8',
      activo: true,
    },
    {
      codigo: 'EN_COMITE',
      nombre: 'En Comité',
      descripcion: 'Cuando el asesor traslada a comité (única acción del asesor después del análisis)',
      orden: 3,
      color: '#FD7E14',
      activo: true,
    },
    {
      codigo: 'OBSERVADA',
      nombre: 'Observada',
      descripcion: 'Cuando el comité observa la solicitud (permite al asesor modificar y reenviar a comité)',
      orden: 4,
      color: '#FFC107',
      activo: true,
    },
    {
      codigo: 'DENEGADA',
      nombre: 'Denegada',
      descripcion: 'Cuando el comité deniega (estado final, no se puede modificar)',
      orden: 5,
      color: '#DC3545',
      activo: true,
    },
    {
      codigo: 'APROBADA',
      nombre: 'Aprobada',
      descripcion: 'Cuando el comité aprueba',
      orden: 6,
      color: '#28A745',
      activo: true,
    },
    {
      codigo: 'DESEMBOLSADA',
      nombre: 'Desembolsada',
      descripcion: 'Estado final después del desembolso',
      orden: 7,
      color: '#007BFF',
      activo: true,
    },
  ];

  for (const estadoData of estados) {
    // Verificar si ya existe
    const existe = await repository.findOne({
      where: { codigo: estadoData.codigo },
    });

    if (!existe) {
      const estado = repository.create({
        ...estadoData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await repository.save(estado);
      console.log(`  ✅ ${estadoData.codigo} - ${estadoData.nombre}`);
    } else {
      // Actualizar si ya existe
      await repository.update(
        { codigo: estadoData.codigo },
        {
          nombre: estadoData.nombre,
          descripcion: estadoData.descripcion,
          orden: estadoData.orden,
          color: estadoData.color,
          activo: estadoData.activo,
          updatedAt: new Date(),
        }
      );
      console.log(`  🔄 ${estadoData.codigo} - ${estadoData.nombre} (actualizado)`);
    }
  }

  // Desactivar estados antiguos que ya no se usan
  const estadosObsoletos = [
    'CREADA',
    'EN_ANALISIS',
    'CANCELADA',
    'PENDIENTE_COMITE',
    'AUTORIZADA',
    'DENEGADA_COMITE',
    'OBSERVADA_COMITE',
  ];

  for (const codigoObsoleto of estadosObsoletos) {
    const obsoleto = await repository.findOne({
      where: { codigo: codigoObsoleto },
    });

    if (obsoleto) {
      await repository.update(
        { codigo: codigoObsoleto },
        { activo: false, updatedAt: new Date() }
      );
      console.log(`  ⏭️  ${codigoObsoleto} marcado como obsoleto`);
    }
  }

  console.log('\n✅ Seed de estados de solicitud completado!\n');
}
