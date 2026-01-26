import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClasificacionPrestamo } from '../entities/clasificacion-prestamo.entity';
import { CreateClasificacionPrestamoDto } from '../dto/create-clasificacion-prestamo.dto';
import { UpdateClasificacionPrestamoDto } from '../dto/update-clasificacion-prestamo.dto';

/**
 * Servicio para gestión de clasificaciones de préstamos NCB-022
 *
 * NORMATIVA NCB-022 - Superintendencia del Sistema Financiero (SSF) El Salvador
 * "Normas para Clasificar los Activos de Riesgo Crediticio y Constituir las Reservas de Saneamiento"
 *
 * CATEGORÍAS OBLIGATORIAS (8):
 * - A1: Normal (0% provisión)
 * - A2: Normal con debilidades (1% provisión)
 * - B: Subnormal (5% provisión)
 * - C1: Deficiente (15% provisión)
 * - C2: Deficiente con mayor riesgo (25% provisión)
 * - D1: Difícil Recuperación (50% provisión)
 * - D2: Difícil Recuperación con alto riesgo (75% provisión)
 * - E: Irrecuperable (100% provisión)
 *
 * SECTORES CREDITICIOS:
 * Los rangos de días de mora varían según el sector:
 * - CONSUMO: A1(0-7), A2(8-30), B(31-60), C1(61-90), C2(91-120), D1(121-150), D2(151-180), E(>180)
 * - VIVIENDA: A1(0-7), A2(8-30), B(31-90), C1(91-120), C2(121-180), D1(181-270), D2(271-360), E(>360)
 * - EMPRESAS: Clasificación basada en criterios cualitativos además de días de mora
 *
 * IMPORTANTE:
 * - Los porcentajes de provisión son UNIFORMES para todos los sectores
 * - Los rangos de días de mora SON DIFERENTES según el sector
 * - Este servicio debe especializarse según el tipo de crédito
 *
 * Referencias:
 * - NCB-022: https://www.ssf.gob.sv/images/stories/desc_normas_contables_bancos/16_ncb-022.pdf
 * - Ley de Bancos de El Salvador
 * - Normativas prudenciales SSF
 */
@Injectable()
export class ClasificacionPrestamoService {
  constructor(
    @InjectRepository(ClasificacionPrestamo)
    private clasificacionRepository: Repository<ClasificacionPrestamo>,
  ) {}

  /**
   * Lista todas las clasificaciones
   */
  async findAll(): Promise<ClasificacionPrestamo[]> {
    return this.clasificacionRepository.find({
      order: { orden: 'ASC', codigo: 'ASC' },
    });
  }

  /**
   * Lista solo las clasificaciones activas
   */
  async findActivas(): Promise<ClasificacionPrestamo[]> {
    return this.clasificacionRepository.find({
      where: { activo: true },
      order: { orden: 'ASC', codigo: 'ASC' },
    });
  }

  /**
   * Obtiene una clasificación por ID
   */
  async findOne(id: number): Promise<ClasificacionPrestamo> {
    const clasificacion = await this.clasificacionRepository.findOne({
      where: { id },
    });

    if (!clasificacion) {
      throw new NotFoundException(`Clasificación con ID ${id} no encontrada`);
    }

    return clasificacion;
  }

  /**
   * Obtiene una clasificación por código
   */
  async findByCodigo(codigo: string): Promise<ClasificacionPrestamo | null> {
    return this.clasificacionRepository.findOne({
      where: { codigo },
    });
  }

  /**
   * Determina la clasificación según días de mora
   */
  async determinarClasificacionPorMora(diasMora: number): Promise<ClasificacionPrestamo | null> {
    const clasificaciones = await this.findActivas();

    for (const clasificacion of clasificaciones) {
      const cumpleMinimo = diasMora >= clasificacion.diasMoraMinimo;
      const cumpleMaximo =
        clasificacion.diasMoraMaximo === null || diasMora <= clasificacion.diasMoraMaximo;

      if (cumpleMinimo && cumpleMaximo) {
        return clasificacion;
      }
    }

    return null;
  }

  /**
   * Crea una nueva clasificación
   */
  async create(dto: CreateClasificacionPrestamoDto): Promise<ClasificacionPrestamo> {
    // Verificar que no exista el código
    const existente = await this.findByCodigo(dto.codigo);
    if (existente) {
      throw new ConflictException(`Ya existe una clasificación con código ${dto.codigo}`);
    }

    // Preparar los datos para la entidad
    const data = {
      codigo: dto.codigo,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      diasMoraMinimo: dto.diasMoraMinimo,
      diasMoraMaximo: dto.diasMoraMaximo ?? null,
      porcentajeProvision: dto.porcentajeProvision,
      activo: dto.activo ?? true,
      orden: dto.orden ?? 0,
    };

    const clasificacion = this.clasificacionRepository.create(data);
    return await this.clasificacionRepository.save(clasificacion);
  }

  /**
   * Actualiza una clasificación
   */
  async update(id: number, dto: UpdateClasificacionPrestamoDto): Promise<ClasificacionPrestamo> {
    const clasificacion = await this.findOne(id);

    // Actualizar solo los campos proporcionados
    if (dto.nombre !== undefined) clasificacion.nombre = dto.nombre;
    if (dto.descripcion !== undefined) clasificacion.descripcion = dto.descripcion ?? null;
    if (dto.diasMoraMinimo !== undefined) clasificacion.diasMoraMinimo = dto.diasMoraMinimo;
    if (dto.diasMoraMaximo !== undefined) clasificacion.diasMoraMaximo = dto.diasMoraMaximo ?? null;
    if (dto.porcentajeProvision !== undefined) clasificacion.porcentajeProvision = dto.porcentajeProvision;
    if (dto.activo !== undefined) clasificacion.activo = dto.activo;
    if (dto.orden !== undefined) clasificacion.orden = dto.orden;

    return this.clasificacionRepository.save(clasificacion);
  }

  /**
   * Elimina una clasificación
   */
  async remove(id: number): Promise<void> {
    const clasificacion = await this.findOne(id);
    await this.clasificacionRepository.remove(clasificacion);
  }

  /**
   * Inicializa las clasificaciones NCB-022 por defecto
   * IMPORTANTE: Esta implementación usa rangos del sector CONSUMO
   * Para VIVIENDA o EMPRESAS, consultar la normativa NCB-022 completa
   *
   * Normativa: NCB-022 - Superintendencia del Sistema Financiero (SSF) El Salvador
   * Las 8 categorías obligatorias según NCB-022 son: A1, A2, B, C1, C2, D1, D2, E
   */
  async inicializarClasificacionesNCB022(): Promise<void> {
    const clasificaciones = [
      {
        codigo: 'A1',
        nombre: 'Normal',
        descripcion: 'Riesgo normal - Sector Consumo',
        diasMoraMinimo: 0,
        diasMoraMaximo: 7,
        porcentajeProvision: 0,
        orden: 1,
      },
      {
        codigo: 'A2',
        nombre: 'Normal con debilidades',
        descripcion: 'Riesgo normal con debilidades menores - Sector Consumo',
        diasMoraMinimo: 8,
        diasMoraMaximo: 30,
        porcentajeProvision: 1,
        orden: 2,
      },
      {
        codigo: 'B',
        nombre: 'Subnormal',
        descripcion: 'Créditos que ameritan atención especial - Sector Consumo',
        diasMoraMinimo: 31,
        diasMoraMaximo: 60,
        porcentajeProvision: 5,
        orden: 3,
      },
      {
        codigo: 'C1',
        nombre: 'Deficiente',
        descripcion: 'Alto riesgo de incumplimiento - Sector Consumo',
        diasMoraMinimo: 61,
        diasMoraMaximo: 90,
        porcentajeProvision: 15,
        orden: 4,
      },
      {
        codigo: 'C2',
        nombre: 'Deficiente con mayor riesgo',
        descripcion: 'Deficiente con problemas graves - Sector Consumo',
        diasMoraMinimo: 91,
        diasMoraMaximo: 120,
        porcentajeProvision: 25,
        orden: 5,
      },
      {
        codigo: 'D1',
        nombre: 'Difícil Recuperación',
        descripcion: 'Muy alto riesgo de pérdida - Sector Consumo',
        diasMoraMinimo: 121,
        diasMoraMaximo: 150,
        porcentajeProvision: 50,
        orden: 6,
      },
      {
        codigo: 'D2',
        nombre: 'Difícil Recuperación con alto riesgo',
        descripcion: 'Recuperación altamente improbable - Sector Consumo',
        diasMoraMinimo: 151,
        diasMoraMaximo: 180,
        porcentajeProvision: 75,
        orden: 7,
      },
      {
        codigo: 'E',
        nombre: 'Irrecuperable',
        descripcion: 'Pérdida prácticamente cierta - Sector Consumo (más de 180 días)',
        diasMoraMinimo: 181,
        diasMoraMaximo: undefined,
        porcentajeProvision: 100,
        orden: 8,
      },
    ];

    for (const clasificacion of clasificaciones) {
      const existe = await this.findByCodigo(clasificacion.codigo);
      if (!existe) {
        await this.create(clasificacion);
      }
    }
  }

  /**
   * Inicializa las clasificaciones NCB-022 para sector VIVIENDA
   * Rangos de días de mora diferentes a Consumo según NCB-022
   */
  async inicializarClasificacionesVivienda(): Promise<void> {
    const clasificaciones = [
      {
        codigo: 'A1-VIV',
        nombre: 'Normal',
        descripcion: 'Riesgo normal - Sector Vivienda',
        diasMoraMinimo: 0,
        diasMoraMaximo: 7,
        porcentajeProvision: 0,
        orden: 1,
      },
      {
        codigo: 'A2-VIV',
        nombre: 'Normal con debilidades',
        descripcion: 'Riesgo normal con debilidades menores - Sector Vivienda',
        diasMoraMinimo: 8,
        diasMoraMaximo: 30,
        porcentajeProvision: 1,
        orden: 2,
      },
      {
        codigo: 'B-VIV',
        nombre: 'Subnormal',
        descripcion: 'Créditos que ameritan atención especial - Sector Vivienda',
        diasMoraMinimo: 31,
        diasMoraMaximo: 90,
        porcentajeProvision: 5,
        orden: 3,
      },
      {
        codigo: 'C1-VIV',
        nombre: 'Deficiente',
        descripcion: 'Alto riesgo de incumplimiento - Sector Vivienda',
        diasMoraMinimo: 91,
        diasMoraMaximo: 120,
        porcentajeProvision: 15,
        orden: 4,
      },
      {
        codigo: 'C2-VIV',
        nombre: 'Deficiente con mayor riesgo',
        descripcion: 'Deficiente con problemas graves - Sector Vivienda',
        diasMoraMinimo: 121,
        diasMoraMaximo: 180,
        porcentajeProvision: 25,
        orden: 5,
      },
      {
        codigo: 'D1-VIV',
        nombre: 'Difícil Recuperación',
        descripcion: 'Muy alto riesgo de pérdida - Sector Vivienda',
        diasMoraMinimo: 181,
        diasMoraMaximo: 270,
        porcentajeProvision: 50,
        orden: 6,
      },
      {
        codigo: 'D2-VIV',
        nombre: 'Difícil Recuperación con alto riesgo',
        descripcion: 'Recuperación altamente improbable - Sector Vivienda',
        diasMoraMinimo: 271,
        diasMoraMaximo: 360,
        porcentajeProvision: 75,
        orden: 7,
      },
      {
        codigo: 'E-VIV',
        nombre: 'Irrecuperable',
        descripcion: 'Pérdida prácticamente cierta - Sector Vivienda (más de 360 días)',
        diasMoraMinimo: 361,
        diasMoraMaximo: undefined,
        porcentajeProvision: 100,
        orden: 8,
      },
    ];

    for (const clasificacion of clasificaciones) {
      const existe = await this.findByCodigo(clasificacion.codigo);
      if (!existe) {
        await this.create(clasificacion);
      }
    }
  }
}
