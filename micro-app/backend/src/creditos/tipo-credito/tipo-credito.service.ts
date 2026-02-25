import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, IsNull, Or } from 'typeorm';
import { TipoCredito } from './entities/tipo-credito.entity';
import { LineaCredito } from '../linea-credito/entities/linea-credito.entity';
import { CreateTipoCreditoDto } from './dto/create-tipo-credito.dto';
import { UpdateTipoCreditoDto } from './dto/update-tipo-credito.dto';
import { formatLocalDate } from '../../common/utils/date.utils';

@Injectable()
export class TipoCreditoService {
  constructor(
    @InjectRepository(TipoCredito)
    private readonly tipoCreditoRepository: Repository<TipoCredito>,
    @InjectRepository(LineaCredito)
    private readonly lineaCreditoRepository: Repository<LineaCredito>,
  ) {}

  /**
   * Genera el código automático para un tipo de crédito
   * Formato: CODIGO_LINEA-XXX (ejemplo: CONSUMO-001)
   */
  private async generarCodigo(lineaCreditoId: number): Promise<string> {
    // Obtener la línea de crédito
    const lineaCredito = await this.lineaCreditoRepository.findOne({
      where: { id: lineaCreditoId },
    });

    if (!lineaCredito) {
      throw new BadRequestException(`Línea de crédito con ID ${lineaCreditoId} no encontrada`);
    }

    // Contar cuántos tipos de crédito existen para esta línea
    const count = await this.tipoCreditoRepository.count({
      where: { lineaCreditoId },
    });

    // Generar el código con el formato CODIGO_LINEA-XXX
    const secuencial = (count + 1).toString().padStart(3, '0');
    return `${lineaCredito.codigo}-${secuencial}`;
  }

  async create(createDto: CreateTipoCreditoDto): Promise<TipoCredito> {
    // Generar el código automáticamente
    const codigo = await this.generarCodigo(createDto.lineaCreditoId);

    const tipoCredito = this.tipoCreditoRepository.create({
      ...createDto,
      codigo,
    });

    return this.tipoCreditoRepository.save(tipoCredito);
  }

  async findAll(lineaCreditoId?: number): Promise<TipoCredito[]> {
    const where: any = {};
    if (lineaCreditoId) {
      where.lineaCreditoId = lineaCreditoId;
    }

    return this.tipoCreditoRepository.find({
      where,
      relations: ['lineaCredito'],
      order: { nombre: 'ASC' },
    });
  }

  async findAllActive(lineaCreditoId?: number): Promise<TipoCredito[]> {
    const today = formatLocalDate(new Date());

    const queryBuilder = this.tipoCreditoRepository.createQueryBuilder('tipo')
      .leftJoinAndSelect('tipo.lineaCredito', 'linea')
      .where('tipo.activo = :activo', { activo: true })
      .andWhere('tipo.fechaVigenciaDesde <= :today', { today })
      .andWhere('(tipo.fechaVigenciaHasta IS NULL OR tipo.fechaVigenciaHasta >= :today)', { today });

    if (lineaCreditoId) {
      queryBuilder.andWhere('tipo.lineaCreditoId = :lineaCreditoId', { lineaCreditoId });
    }

    return queryBuilder.orderBy('tipo.nombre', 'ASC').getMany();
  }

  async findOne(id: number): Promise<TipoCredito> {
    const tipoCredito = await this.tipoCreditoRepository.findOne({
      where: { id },
      relations: ['lineaCredito'],
    });

    if (!tipoCredito) {
      throw new NotFoundException(`Tipo de crédito con ID ${id} no encontrado`);
    }

    return tipoCredito;
  }

  async update(id: number, updateDto: UpdateTipoCreditoDto): Promise<TipoCredito> {
    const tipoCredito = await this.findOne(id);

    // Si se cambia la línea de crédito, regenerar el código
    if (updateDto.lineaCreditoId && updateDto.lineaCreditoId !== tipoCredito.lineaCreditoId) {
      const nuevoCodigo = await this.generarCodigo(updateDto.lineaCreditoId);
      Object.assign(tipoCredito, updateDto, { codigo: nuevoCodigo });
    } else {
      Object.assign(tipoCredito, updateDto);
    }

    return this.tipoCreditoRepository.save(tipoCredito);
  }

  async remove(id: number): Promise<void> {
    const tipoCredito = await this.findOne(id);
    await this.tipoCreditoRepository.remove(tipoCredito);
  }

  // Validar que los parámetros de la solicitud estén dentro de los rangos permitidos
  // IMPORTANTE: El plazo SIEMPRE se valida en meses, independientemente de la periodicidad
  async validarParametros(
    tipoCreditoId: number,
    monto: number,
    plazo: number,
    tasaInteres: number,
    periodicidadCodigo?: string,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const tipoCredito = await this.findOne(tipoCreditoId);
    const errors: string[] = [];

    if (monto < tipoCredito.montoMinimo) {
      errors.push(`El monto mínimo permitido es $${tipoCredito.montoMinimo}`);
    }
    if (monto > tipoCredito.montoMaximo) {
      errors.push(`El monto máximo permitido es $${tipoCredito.montoMaximo}`);
    }

    // NUEVA LÓGICA: El plazo SIEMPRE se valida en meses
    // El plazo mínimo es 1 mes para cualquier periodicidad
    const plazoMinimo = Math.max(1, tipoCredito.plazoMinimo);
    const plazoMaximo = tipoCredito.plazoMaximo;
    const unidad = 'meses';

    if (plazo < plazoMinimo) {
      errors.push(`El plazo mínimo permitido es ${plazoMinimo} ${unidad}`);
    }
    if (plazo > plazoMaximo) {
      errors.push(`El plazo máximo permitido es ${plazoMaximo} ${unidad}`);
    }

    if (tasaInteres < tipoCredito.tasaInteresMinima) {
      errors.push(`La tasa de interés mínima permitida es ${tipoCredito.tasaInteresMinima}%`);
    }
    if (tasaInteres > tipoCredito.tasaInteresMaxima) {
      errors.push(`La tasa de interés máxima permitida es ${tipoCredito.tasaInteresMaxima}%`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
