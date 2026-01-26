import { DataSource } from 'typeorm';
import { LineaCredito } from '../../creditos/linea-credito/entities/linea-credito.entity';
import { TipoCredito } from '../../creditos/tipo-credito/entities/tipo-credito.entity';

interface TipoCreditoData {
  codigo: string;
  nombre: string;
  descripcion: string;
  tasaInteres: number;
  tasaInteresMinima: number;
  tasaInteresMaxima: number;
  tasaInteresMoratorio: number;
  montoMinimo: number;
  montoMaximo: number;
  plazoMinimo: number;
  plazoMaximo: number;
  periodicidadPago: string;
  tipoCuota: string;
  diasGracia: number;
  porcentajeFinanciamiento?: number;
  requiereGarantia: boolean;
}

interface LineaCreditoData {
  codigo: string;
  nombre: string;
  descripcion: string;
  tipos: TipoCreditoData[];
}

const lineasCredito: LineaCreditoData[] = [
  {
    codigo: 'CONSUMO',
    nombre: 'Créditos de Consumo',
    descripcion: 'Línea de créditos destinados a gastos personales y del hogar',
    tipos: [
      {
        codigo: 'CONS-PERSONAL',
        nombre: 'Crédito Personal',
        descripcion: 'Crédito para gastos personales sin destino específico',
        tasaInteres: 18.0,
        tasaInteresMinima: 16.0,
        tasaInteresMaxima: 22.0,
        tasaInteresMoratorio: 24.0,
        montoMinimo: 100.0,
        montoMaximo: 5000.0,
        plazoMinimo: 3,
        plazoMaximo: 36,
        periodicidadPago: 'mensual',
        tipoCuota: 'fija',
        diasGracia: 0,
        requiereGarantia: false,
      },
      {
        codigo: 'CONS-EDUCACION',
        nombre: 'Crédito Educativo',
        descripcion: 'Crédito para gastos de educación y capacitación',
        tasaInteres: 14.0,
        tasaInteresMinima: 12.0,
        tasaInteresMaxima: 16.0,
        tasaInteresMoratorio: 20.0,
        montoMinimo: 200.0,
        montoMaximo: 10000.0,
        plazoMinimo: 6,
        plazoMaximo: 48,
        periodicidadPago: 'mensual',
        tipoCuota: 'fija',
        diasGracia: 30,
        requiereGarantia: false,
      },
      {
        codigo: 'CONS-SALUD',
        nombre: 'Crédito de Salud',
        descripcion: 'Crédito para gastos médicos y de salud',
        tasaInteres: 15.0,
        tasaInteresMinima: 13.0,
        tasaInteresMaxima: 18.0,
        tasaInteresMoratorio: 22.0,
        montoMinimo: 100.0,
        montoMaximo: 8000.0,
        plazoMinimo: 3,
        plazoMaximo: 24,
        periodicidadPago: 'mensual',
        tipoCuota: 'fija',
        diasGracia: 0,
        requiereGarantia: false,
      },
      {
        codigo: 'CONS-ELECTRODOMESTICOS',
        nombre: 'Crédito Electrodomésticos',
        descripcion: 'Crédito para compra de electrodomésticos y equipos del hogar',
        tasaInteres: 20.0,
        tasaInteresMinima: 18.0,
        tasaInteresMaxima: 24.0,
        tasaInteresMoratorio: 28.0,
        montoMinimo: 50.0,
        montoMaximo: 3000.0,
        plazoMinimo: 3,
        plazoMaximo: 24,
        periodicidadPago: 'mensual',
        tipoCuota: 'fija',
        diasGracia: 0,
        requiereGarantia: false,
      },
    ],
  },
  {
    codigo: 'VIVIENDA',
    nombre: 'Créditos de Vivienda',
    descripcion: 'Línea de créditos para adquisición, construcción y mejora de vivienda',
    tipos: [
      {
        codigo: 'VIV-ADQUISICION',
        nombre: 'Adquisición de Vivienda',
        descripcion: 'Crédito para compra de vivienda nueva o usada',
        tasaInteres: 10.0,
        tasaInteresMinima: 8.5,
        tasaInteresMaxima: 12.0,
        tasaInteresMoratorio: 15.0,
        montoMinimo: 5000.0,
        montoMaximo: 150000.0,
        plazoMinimo: 60,
        plazoMaximo: 300,
        periodicidadPago: 'mensual',
        tipoCuota: 'fija',
        diasGracia: 0,
        porcentajeFinanciamiento: 80.0,
        requiereGarantia: true,
      },
      {
        codigo: 'VIV-CONSTRUCCION',
        nombre: 'Construcción de Vivienda',
        descripcion: 'Crédito para construcción de vivienda en terreno propio',
        tasaInteres: 11.0,
        tasaInteresMinima: 9.0,
        tasaInteresMaxima: 13.0,
        tasaInteresMoratorio: 16.0,
        montoMinimo: 3000.0,
        montoMaximo: 100000.0,
        plazoMinimo: 36,
        plazoMaximo: 240,
        periodicidadPago: 'mensual',
        tipoCuota: 'fija',
        diasGracia: 60,
        porcentajeFinanciamiento: 70.0,
        requiereGarantia: true,
      },
      {
        codigo: 'VIV-MEJORA',
        nombre: 'Mejora de Vivienda',
        descripcion: 'Crédito para remodelación y mejoras de vivienda existente',
        tasaInteres: 12.0,
        tasaInteresMinima: 10.0,
        tasaInteresMaxima: 14.0,
        tasaInteresMoratorio: 18.0,
        montoMinimo: 500.0,
        montoMaximo: 25000.0,
        plazoMinimo: 12,
        plazoMaximo: 120,
        periodicidadPago: 'mensual',
        tipoCuota: 'fija',
        diasGracia: 30,
        porcentajeFinanciamiento: 100.0,
        requiereGarantia: false,
      },
      {
        codigo: 'VIV-TERRENO',
        nombre: 'Compra de Terreno',
        descripcion: 'Crédito para adquisición de terreno para construcción',
        tasaInteres: 13.0,
        tasaInteresMinima: 11.0,
        tasaInteresMaxima: 15.0,
        tasaInteresMoratorio: 19.0,
        montoMinimo: 1000.0,
        montoMaximo: 50000.0,
        plazoMinimo: 24,
        plazoMaximo: 180,
        periodicidadPago: 'mensual',
        tipoCuota: 'fija',
        diasGracia: 0,
        porcentajeFinanciamiento: 60.0,
        requiereGarantia: true,
      },
    ],
  },
  {
    codigo: 'EMPRESA',
    nombre: 'Créditos Empresariales',
    descripcion: 'Línea de créditos para micro, pequeña y mediana empresa',
    tipos: [
      {
        codigo: 'EMP-CAPITAL',
        nombre: 'Capital de Trabajo',
        descripcion: 'Crédito para financiamiento de operaciones corrientes del negocio',
        tasaInteres: 16.0,
        tasaInteresMinima: 14.0,
        tasaInteresMaxima: 20.0,
        tasaInteresMoratorio: 24.0,
        montoMinimo: 200.0,
        montoMaximo: 20000.0,
        plazoMinimo: 3,
        plazoMaximo: 24,
        periodicidadPago: 'mensual',
        tipoCuota: 'fija',
        diasGracia: 0,
        requiereGarantia: false,
      },
      {
        codigo: 'EMP-ACTIVO-FIJO',
        nombre: 'Activo Fijo',
        descripcion: 'Crédito para compra de maquinaria, equipo y vehículos de trabajo',
        tasaInteres: 14.0,
        tasaInteresMinima: 12.0,
        tasaInteresMaxima: 18.0,
        tasaInteresMoratorio: 22.0,
        montoMinimo: 500.0,
        montoMaximo: 50000.0,
        plazoMinimo: 12,
        plazoMaximo: 60,
        periodicidadPago: 'mensual',
        tipoCuota: 'fija',
        diasGracia: 30,
        porcentajeFinanciamiento: 80.0,
        requiereGarantia: true,
      },
      {
        codigo: 'EMP-INVERSION',
        nombre: 'Inversión Empresarial',
        descripcion: 'Crédito para proyectos de inversión y expansión de negocio',
        tasaInteres: 15.0,
        tasaInteresMinima: 13.0,
        tasaInteresMaxima: 19.0,
        tasaInteresMoratorio: 23.0,
        montoMinimo: 1000.0,
        montoMaximo: 100000.0,
        plazoMinimo: 24,
        plazoMaximo: 84,
        periodicidadPago: 'mensual',
        tipoCuota: 'fija',
        diasGracia: 60,
        requiereGarantia: true,
      },
      {
        codigo: 'EMP-MICROEMPRESA',
        nombre: 'Microempresa',
        descripcion: 'Crédito para emprendedores y microempresas con acceso simplificado',
        tasaInteres: 22.0,
        tasaInteresMinima: 20.0,
        tasaInteresMaxima: 26.0,
        tasaInteresMoratorio: 30.0,
        montoMinimo: 50.0,
        montoMaximo: 5000.0,
        plazoMinimo: 3,
        plazoMaximo: 18,
        periodicidadPago: 'mensual',
        tipoCuota: 'fija',
        diasGracia: 0,
        requiereGarantia: false,
      },
    ],
  },
  {
    codigo: 'AGRICOLA',
    nombre: 'Créditos Agrícolas',
    descripcion: 'Línea de créditos para actividades agropecuarias',
    tipos: [
      {
        codigo: 'AGRI-AVIO',
        nombre: 'Avío Agrícola',
        descripcion: 'Crédito para financiamiento de ciclo de cultivo (insumos, mano de obra)',
        tasaInteres: 14.0,
        tasaInteresMinima: 12.0,
        tasaInteresMaxima: 16.0,
        tasaInteresMoratorio: 20.0,
        montoMinimo: 200.0,
        montoMaximo: 15000.0,
        plazoMinimo: 4,
        plazoMaximo: 12,
        periodicidadPago: 'mensual',
        tipoCuota: 'fija',
        diasGracia: 90,
        requiereGarantia: false,
      },
      {
        codigo: 'AGRI-REFACCIONARIO',
        nombre: 'Refaccionario Agrícola',
        descripcion: 'Crédito para adquisición de maquinaria y equipo agrícola',
        tasaInteres: 12.0,
        tasaInteresMinima: 10.0,
        tasaInteresMaxima: 14.0,
        tasaInteresMoratorio: 18.0,
        montoMinimo: 500.0,
        montoMaximo: 30000.0,
        plazoMinimo: 12,
        plazoMaximo: 60,
        periodicidadPago: 'mensual',
        tipoCuota: 'fija',
        diasGracia: 60,
        porcentajeFinanciamiento: 70.0,
        requiereGarantia: true,
      },
      {
        codigo: 'AGRI-PECUARIO',
        nombre: 'Crédito Pecuario',
        descripcion: 'Crédito para actividades ganaderas (compra de ganado, alimentación)',
        tasaInteres: 15.0,
        tasaInteresMinima: 13.0,
        tasaInteresMaxima: 17.0,
        tasaInteresMoratorio: 21.0,
        montoMinimo: 300.0,
        montoMaximo: 20000.0,
        plazoMinimo: 6,
        plazoMaximo: 36,
        periodicidadPago: 'mensual',
        tipoCuota: 'fija',
        diasGracia: 30,
        requiereGarantia: false,
      },
    ],
  },
];

export async function seedCreditos(dataSource: DataSource): Promise<void> {
  const lineaCreditoRepo = dataSource.getRepository(LineaCredito);
  const tipoCreditoRepo = dataSource.getRepository(TipoCredito);

  console.log('🏦 Iniciando seed de líneas y tipos de crédito...');

  const fechaVigencia = new Date();
  fechaVigencia.setMonth(fechaVigencia.getMonth() - 1); // Vigente desde hace un mes

  for (const lineaData of lineasCredito) {
    // Crear o encontrar línea de crédito
    let lineaCredito = await lineaCreditoRepo.findOne({
      where: { codigo: lineaData.codigo },
    });

    if (!lineaCredito) {
      lineaCredito = lineaCreditoRepo.create({
        codigo: lineaData.codigo,
        nombre: lineaData.nombre,
        descripcion: lineaData.descripcion,
        activo: true,
      });
      lineaCredito = await lineaCreditoRepo.save(lineaCredito);
      console.log(`  ✓ Línea de crédito: ${lineaCredito.nombre}`);
    }

    for (const tipoData of lineaData.tipos) {
      // Crear tipo de crédito si no existe
      const existingTipo = await tipoCreditoRepo.findOne({
        where: { codigo: tipoData.codigo },
      });

      if (!existingTipo) {
        const tipoCredito = tipoCreditoRepo.create({
          ...tipoData,
          lineaCreditoId: lineaCredito.id,
          fechaVigenciaDesde: fechaVigencia,
          activo: true,
        });
        await tipoCreditoRepo.save(tipoCredito);
        console.log(`    ✓ Tipo de crédito: ${tipoData.nombre}`);
      }
    }
  }

  const totalLineas = await lineaCreditoRepo.count();
  const totalTipos = await tipoCreditoRepo.count();

  console.log('');
  console.log('📊 Resumen de seed de créditos:');
  console.log(`   - Líneas de crédito: ${totalLineas}`);
  console.log(`   - Tipos de crédito: ${totalTipos}`);
  console.log('');
  console.log('✅ Seed de créditos completado!');
}
