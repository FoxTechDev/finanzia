import { DataSource } from 'typeorm';
import { Departamento } from '../../departamento/entities/departamento.entity';
import { Municipio } from '../../municipio/entities/municipio.entity';
import { Distrito } from '../../distrito/entities/distrito.entity';

interface DistritoData {
  nombre: string;
}

interface MunicipioData {
  nombre: string;
  distritos: DistritoData[];
}

interface DepartamentoData {
  nombre: string;
  municipios: MunicipioData[];
}

const ubicacionesElSalvador: DepartamentoData[] = [
  {
    nombre: 'Ahuachapán',
    municipios: [
      {
        nombre: 'Ahuachapán Norte',
        distritos: [
          { nombre: 'Atiquizaya' },
          { nombre: 'El Refugio' },
          { nombre: 'San Lorenzo' },
          { nombre: 'Turín' },
        ],
      },
      {
        nombre: 'Ahuachapán Centro',
        distritos: [
          { nombre: 'Ahuachapán' },
          { nombre: 'Apaneca' },
          { nombre: 'Concepción de Ataco' },
          { nombre: 'Tacuba' },
        ],
      },
      {
        nombre: 'Ahuachapán Sur',
        distritos: [
          { nombre: 'Guaymango' },
          { nombre: 'Jujutla' },
          { nombre: 'San Francisco Menéndez' },
          { nombre: 'San Pedro Puxtla' },
        ],
      },
    ],
  },
  {
    nombre: 'Santa Ana',
    municipios: [
      {
        nombre: 'Santa Ana Norte',
        distritos: [
          { nombre: 'Masahuat' },
          { nombre: 'Metapán' },
          { nombre: 'Santa Rosa Guachipilín' },
          { nombre: 'Texistepeque' },
        ],
      },
      {
        nombre: 'Santa Ana Centro',
        distritos: [{ nombre: 'Santa Ana' }],
      },
      {
        nombre: 'Santa Ana Este',
        distritos: [{ nombre: 'Coatepeque' }, { nombre: 'El Congo' }],
      },
      {
        nombre: 'Santa Ana Oeste',
        distritos: [
          { nombre: 'Candelaria de la Frontera' },
          { nombre: 'Chalchuapa' },
          { nombre: 'El Porvenir' },
          { nombre: 'San Antonio Pajonal' },
          { nombre: 'San Sebastián Salitrillo' },
          { nombre: 'Santiago de la Frontera' },
        ],
      },
    ],
  },
  {
    nombre: 'Sonsonate',
    municipios: [
      {
        nombre: 'Sonsonate Norte',
        distritos: [
          { nombre: 'Juayúa' },
          { nombre: 'Nahuizalco' },
          { nombre: 'Salcoatitán' },
          { nombre: 'Santa Catarina Masahuat' },
        ],
      },
      {
        nombre: 'Sonsonate Centro',
        distritos: [
          { nombre: 'Sonsonate' },
          { nombre: 'Sonzacate' },
          { nombre: 'Nahulingo' },
          { nombre: 'San Antonio del Monte' },
          { nombre: 'Santo Domingo de Guzmán' },
        ],
      },
      {
        nombre: 'Sonsonate Este',
        distritos: [
          { nombre: 'Izalco' },
          { nombre: 'Armenia' },
          { nombre: 'Caluco' },
          { nombre: 'San Julián' },
          { nombre: 'Cuisnahuat' },
          { nombre: 'Santa Isabel Ishuatán' },
        ],
      },
      {
        nombre: 'Sonsonate Oeste',
        distritos: [{ nombre: 'Acajutla' }],
      },
    ],
  },
  {
    nombre: 'Chalatenango',
    municipios: [
      {
        nombre: 'Chalatenango Norte',
        distritos: [
          { nombre: 'La Palma' },
          { nombre: 'Citalá' },
          { nombre: 'San Ignacio' },
        ],
      },
      {
        nombre: 'Chalatenango Centro',
        distritos: [
          { nombre: 'Nueva Concepción' },
          { nombre: 'Tejutla' },
          { nombre: 'La Reina' },
          { nombre: 'Agua Caliente' },
          { nombre: 'Dulce Nombre de María' },
          { nombre: 'El Paraíso' },
          { nombre: 'San Fernando' },
          { nombre: 'San Francisco Morazán' },
          { nombre: 'San Rafael' },
          { nombre: 'Santa Rita' },
        ],
      },
      {
        nombre: 'Chalatenango Sur',
        distritos: [
          { nombre: 'Chalatenango' },
          { nombre: 'Arcatao' },
          { nombre: 'Azacualpa' },
          { nombre: 'Comalapa' },
          { nombre: 'Concepción Quezaltepeque' },
          { nombre: 'El Carrizal' },
          { nombre: 'La Laguna' },
          { nombre: 'Las Vueltas' },
          { nombre: 'Nombre de Jesús' },
          { nombre: 'Nueva Trinidad' },
          { nombre: 'Ojos de Agua' },
          { nombre: 'Potonico' },
          { nombre: 'San Antonio de la Cruz' },
          { nombre: 'San Antonio Los Ranchos' },
          { nombre: 'San Francisco Lempa' },
          { nombre: 'San Isidro Labrador' },
          { nombre: 'San José Cancasque' },
          { nombre: 'San Miguel de Mercedes' },
          { nombre: 'San José Las Flores' },
          { nombre: 'San Luis del Carmen' },
        ],
      },
    ],
  },
  {
    nombre: 'La Libertad',
    municipios: [
      {
        nombre: 'La Libertad Norte',
        distritos: [
          { nombre: 'Quezaltepeque' },
          { nombre: 'San Matías' },
          { nombre: 'San Pablo Tacachico' },
        ],
      },
      {
        nombre: 'La Libertad Centro',
        distritos: [{ nombre: 'San Juan Opico' }, { nombre: 'Ciudad Arce' }],
      },
      {
        nombre: 'La Libertad Oeste',
        distritos: [
          { nombre: 'Colón' },
          { nombre: 'Jayaque' },
          { nombre: 'Sacacoyo' },
          { nombre: 'Tepecoyo' },
          { nombre: 'Talnique' },
        ],
      },
      {
        nombre: 'La Libertad Este',
        distritos: [
          { nombre: 'Antiguo Cuscatlán' },
          { nombre: 'Huizúcar' },
          { nombre: 'Nuevo Cuscatlán' },
          { nombre: 'San José Villanueva' },
          { nombre: 'Zaragoza' },
        ],
      },
      {
        nombre: 'La Libertad Costa',
        distritos: [
          { nombre: 'Chiltiupán' },
          { nombre: 'Jicalapa' },
          { nombre: 'La Libertad' },
          { nombre: 'Tamanique' },
          { nombre: 'Teotepeque' },
        ],
      },
      {
        nombre: 'La Libertad Sur',
        distritos: [{ nombre: 'Comasagua' }, { nombre: 'Santa Tecla' }],
      },
    ],
  },
  {
    nombre: 'San Salvador',
    municipios: [
      {
        nombre: 'San Salvador Norte',
        distritos: [
          { nombre: 'Aguilares' },
          { nombre: 'El Paisnal' },
          { nombre: 'Guazapa' },
        ],
      },
      {
        nombre: 'San Salvador Oeste',
        distritos: [{ nombre: 'Apopa' }, { nombre: 'Nejapa' }],
      },
      {
        nombre: 'San Salvador Este',
        distritos: [
          { nombre: 'Ilopango' },
          { nombre: 'San Martín' },
          { nombre: 'Soyapango' },
          { nombre: 'Tonacatepeque' },
        ],
      },
      {
        nombre: 'San Salvador Centro',
        distritos: [
          { nombre: 'Ayutuxtepeque' },
          { nombre: 'Mejicanos' },
          { nombre: 'San Salvador' },
          { nombre: 'Cuscatancingo' },
          { nombre: 'Ciudad Delgado' },
        ],
      },
      {
        nombre: 'San Salvador Sur',
        distritos: [
          { nombre: 'Panchimalco' },
          { nombre: 'Rosario de Mora' },
          { nombre: 'San Marcos' },
          { nombre: 'Santo Tomás' },
          { nombre: 'Santiago Texacuangos' },
        ],
      },
    ],
  },
  {
    nombre: 'Cuscatlán',
    municipios: [
      {
        nombre: 'Cuscatlán Norte',
        distritos: [
          { nombre: 'Suchitoto' },
          { nombre: 'San José Guayabal' },
          { nombre: 'Oratorio de Concepción' },
          { nombre: 'San Bartolomé Perulapía' },
          { nombre: 'San Pedro Perulapán' },
        ],
      },
      {
        nombre: 'Cuscatlán Sur',
        distritos: [
          { nombre: 'Cojutepeque' },
          { nombre: 'San Rafael Cedros' },
          { nombre: 'Candelaria' },
          { nombre: 'Monte San Juan' },
          { nombre: 'El Carmen' },
          { nombre: 'San Cristóbal' },
          { nombre: 'Santa Cruz Michapa' },
          { nombre: 'San Ramón' },
          { nombre: 'El Rosario' },
          { nombre: 'Santa Cruz Analquito' },
          { nombre: 'Tenancingo' },
        ],
      },
    ],
  },
  {
    nombre: 'La Paz',
    municipios: [
      {
        nombre: 'La Paz Oeste',
        distritos: [
          { nombre: 'Cuyultitán' },
          { nombre: 'Olocuilta' },
          { nombre: 'San Juan Talpa' },
          { nombre: 'San Luis Talpa' },
          { nombre: 'San Pedro Masahuat' },
          { nombre: 'Tapalhuaca' },
          { nombre: 'San Francisco Chinameca' },
        ],
      },
      {
        nombre: 'La Paz Centro',
        distritos: [
          { nombre: 'El Rosario' },
          { nombre: 'Jerusalén' },
          { nombre: 'Mercedes La Ceiba' },
          { nombre: 'Paraíso de Osorio' },
          { nombre: 'San Antonio Masahuat' },
          { nombre: 'San Emigdio' },
          { nombre: 'San Juan Tepezontes' },
          { nombre: 'San Luis La Herradura' },
          { nombre: 'San Miguel Tepezontes' },
          { nombre: 'San Pedro Nonualco' },
          { nombre: 'Santa María Ostuma' },
          { nombre: 'Santiago Nonualco' },
        ],
      },
      {
        nombre: 'La Paz Este',
        distritos: [
          { nombre: 'San Juan Nonualco' },
          { nombre: 'San Rafael Obrajuelo' },
          { nombre: 'Zacatecoluca' },
        ],
      },
    ],
  },
  {
    nombre: 'Cabañas',
    municipios: [
      {
        nombre: 'Cabañas Este',
        distritos: [
          { nombre: 'Sensuntepeque' },
          { nombre: 'Victoria' },
          { nombre: 'Villa Dolores' },
          { nombre: 'Guacotecti' },
          { nombre: 'San Isidro' },
        ],
      },
      {
        nombre: 'Cabañas Oeste',
        distritos: [
          { nombre: 'Ilobasco' },
          { nombre: 'Tejutepeque' },
          { nombre: 'Jutiapa' },
          { nombre: 'Cinquera' },
        ],
      },
    ],
  },
  {
    nombre: 'San Vicente',
    municipios: [
      {
        nombre: 'San Vicente Norte',
        distritos: [
          { nombre: 'Apastepeque' },
          { nombre: 'Santa Clara' },
          { nombre: 'San Ildefonso' },
          { nombre: 'San Esteban Catarina' },
          { nombre: 'San Sebastián' },
          { nombre: 'San Lorenzo' },
          { nombre: 'Santo Domingo' },
        ],
      },
      {
        nombre: 'San Vicente Sur',
        distritos: [
          { nombre: 'San Vicente' },
          { nombre: 'Guadalupe' },
          { nombre: 'Verapaz' },
          { nombre: 'Nuevo Tepetitán' },
          { nombre: 'Tecoluca' },
          { nombre: 'San Cayetano Istepeque' },
        ],
      },
    ],
  },
  {
    nombre: 'Usulután',
    municipios: [
      {
        nombre: 'Usulután Norte',
        distritos: [
          { nombre: 'Santiago de María' },
          { nombre: 'Alegría' },
          { nombre: 'Berlín' },
          { nombre: 'Mercedes Umaña' },
          { nombre: 'Jucuapa' },
          { nombre: 'El Triunfo' },
          { nombre: 'Estanzuelas' },
          { nombre: 'San Buenaventura' },
          { nombre: 'Nueva Granada' },
        ],
      },
      {
        nombre: 'Usulután Este',
        distritos: [
          { nombre: 'Usulután' },
          { nombre: 'Jucuarán' },
          { nombre: 'San Dionisio' },
          { nombre: 'Concepción Batres' },
          { nombre: 'Santa María' },
          { nombre: 'Ozatlán' },
          { nombre: 'Tecapán' },
          { nombre: 'Santa Elena' },
          { nombre: 'California' },
          { nombre: 'Ereguayquín' },
        ],
      },
      {
        nombre: 'Usulután Oeste',
        distritos: [
          { nombre: 'Jiquilisco' },
          { nombre: 'Puerto El Triunfo' },
          { nombre: 'San Agustín' },
          { nombre: 'San Francisco Javier' },
        ],
      },
    ],
  },
  {
    nombre: 'San Miguel',
    municipios: [
      {
        nombre: 'San Miguel Norte',
        distritos: [
          { nombre: 'Ciudad Barrios' },
          { nombre: 'Sesori' },
          { nombre: 'Nuevo Edén de San Juan' },
          { nombre: 'San Gerardo' },
          { nombre: 'San Luis de la Reina' },
          { nombre: 'Carolina' },
          { nombre: 'San Antonio del Mosco' },
          { nombre: 'Chapeltique' },
        ],
      },
      {
        nombre: 'San Miguel Centro',
        distritos: [
          { nombre: 'San Miguel' },
          { nombre: 'Comacarán' },
          { nombre: 'Uluazapa' },
          { nombre: 'Moncagua' },
          { nombre: 'Quelepa' },
          { nombre: 'Chirilagua' },
        ],
      },
      {
        nombre: 'San Miguel Oeste',
        distritos: [
          { nombre: 'Chinameca' },
          { nombre: 'Nueva Guadalupe' },
          { nombre: 'Lolotique' },
          { nombre: 'San Jorge' },
          { nombre: 'San Rafael Oriente' },
          { nombre: 'El Tránsito' },
        ],
      },
    ],
  },
  {
    nombre: 'Morazán',
    municipios: [
      {
        nombre: 'Morazán Norte',
        distritos: [
          { nombre: 'Arambala' },
          { nombre: 'Cacaopera' },
          { nombre: 'Corinto' },
          { nombre: 'El Rosario' },
          { nombre: 'Joateca' },
          { nombre: 'Jocoaitique' },
          { nombre: 'Meanguera' },
          { nombre: 'Perquín' },
          { nombre: 'San Fernando' },
          { nombre: 'San Isidro' },
          { nombre: 'Torola' },
        ],
      },
      {
        nombre: 'Morazán Sur',
        distritos: [
          { nombre: 'Chilanga' },
          { nombre: 'Delicias de Concepción' },
          { nombre: 'El Divisadero' },
          { nombre: 'Gualococti' },
          { nombre: 'Guatajiagua' },
          { nombre: 'Jocoro' },
          { nombre: 'Lolotiquillo' },
          { nombre: 'Osicala' },
          { nombre: 'San Carlos' },
          { nombre: 'San Francisco Gotera' },
          { nombre: 'San Simón' },
          { nombre: 'Sensembra' },
          { nombre: 'Sociedad' },
          { nombre: 'Yamabal' },
          { nombre: 'Yoloaiquín' },
        ],
      },
    ],
  },
  {
    nombre: 'La Unión',
    municipios: [
      {
        nombre: 'La Unión Norte',
        distritos: [
          { nombre: 'Anamorós' },
          { nombre: 'Bolívar' },
          { nombre: 'Concepción de Oriente' },
          { nombre: 'El Sauce' },
          { nombre: 'Lislique' },
          { nombre: 'Nueva Esparta' },
          { nombre: 'Pasaquina' },
          { nombre: 'Polorós' },
          { nombre: 'San José La Fuente' },
          { nombre: 'Santa Rosa de Lima' },
        ],
      },
      {
        nombre: 'La Unión Sur',
        distritos: [
          { nombre: 'Conchagua' },
          { nombre: 'El Carmen' },
          { nombre: 'Intipucá' },
          { nombre: 'La Unión' },
          { nombre: 'Meanguera del Golfo' },
          { nombre: 'San Alejo' },
          { nombre: 'Yayantique' },
          { nombre: 'Yucuaiquín' },
        ],
      },
    ],
  },
];

export async function seedUbicaciones(dataSource: DataSource): Promise<void> {
  const departamentoRepo = dataSource.getRepository(Departamento);
  const municipioRepo = dataSource.getRepository(Municipio);
  const distritoRepo = dataSource.getRepository(Distrito);

  console.log('🌱 Iniciando seed de ubicaciones de El Salvador...');

  for (const depData of ubicacionesElSalvador) {
    // Crear departamento
    let departamento = await departamentoRepo.findOne({
      where: { nombre: depData.nombre },
    });

    if (!departamento) {
      departamento = departamentoRepo.create({ nombre: depData.nombre });
      departamento = await departamentoRepo.save(departamento);
      console.log(`  ✓ Departamento: ${departamento.nombre}`);
    }

    for (const munData of depData.municipios) {
      // Crear municipio
      let municipio = await municipioRepo.findOne({
        where: {
          nombre: munData.nombre,
          departamentoId: departamento.id,
        },
      });

      if (!municipio) {
        municipio = municipioRepo.create({
          nombre: munData.nombre,
          departamentoId: departamento.id,
        });
        municipio = await municipioRepo.save(municipio);
        console.log(`    ✓ Municipio: ${municipio.nombre}`);
      }

      for (const distData of munData.distritos) {
        // Crear distrito
        const existingDistrito = await distritoRepo.findOne({
          where: {
            nombre: distData.nombre,
            municipioId: municipio.id,
          },
        });

        if (!existingDistrito) {
          const distrito = distritoRepo.create({
            nombre: distData.nombre,
            municipioId: municipio.id,
          });
          await distritoRepo.save(distrito);
        }
      }
    }
  }

  const totalDepartamentos = await departamentoRepo.count();
  const totalMunicipios = await municipioRepo.count();
  const totalDistritos = await distritoRepo.count();

  console.log('');
  console.log('📊 Resumen de seed:');
  console.log(`   - Departamentos: ${totalDepartamentos}`);
  console.log(`   - Municipios: ${totalMunicipios}`);
  console.log(`   - Distritos: ${totalDistritos}`);
  console.log('');
  console.log('✅ Seed de ubicaciones completado!');
}
