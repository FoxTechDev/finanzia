import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Garantia } from './entities/garantia.entity';
import { GarantiaHipotecaria } from './entities/garantia-hipotecaria.entity';
import { GarantiaPrendaria } from './entities/garantia-prendaria.entity';
import { GarantiaFiador } from './entities/garantia-fiador.entity';
import { GarantiaDocumentaria } from './entities/garantia-documentaria.entity';
import { TipoGarantiaCatalogo } from './entities/tipo-garantia-catalogo.entity';
import { CreateGarantiaDto } from './dto/create-garantia.dto';
import { UpdateGarantiaDto } from './dto/update-garantia.dto';
import { Solicitud } from '../solicitud/entities/solicitud.entity';

@Injectable()
export class GarantiaService {
  constructor(
    @InjectRepository(Garantia)
    private readonly garantiaRepository: Repository<Garantia>,
    @InjectRepository(GarantiaHipotecaria)
    private readonly hipotecariaRepository: Repository<GarantiaHipotecaria>,
    @InjectRepository(GarantiaPrendaria)
    private readonly prendariaRepository: Repository<GarantiaPrendaria>,
    @InjectRepository(GarantiaFiador)
    private readonly fiadorRepository: Repository<GarantiaFiador>,
    @InjectRepository(GarantiaDocumentaria)
    private readonly documentariaRepository: Repository<GarantiaDocumentaria>,
    @InjectRepository(Solicitud)
    private readonly solicitudRepository: Repository<Solicitud>,
    @InjectRepository(TipoGarantiaCatalogo)
    private readonly tipoGarantiaRepository: Repository<TipoGarantiaCatalogo>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createGarantiaDto: CreateGarantiaDto): Promise<Garantia> {
    // Verificar que la solicitud existe
    const solicitud = await this.solicitudRepository.findOne({
      where: { id: createGarantiaDto.solicitudId },
    });

    if (!solicitud) {
      throw new NotFoundException(
        `Solicitud con ID ${createGarantiaDto.solicitudId} no encontrada`,
      );
    }

    // Verificar que el tipo de garantía existe y obtener su código
    const tipoGarantia = await this.tipoGarantiaRepository.findOne({
      where: { id: createGarantiaDto.tipoGarantiaId },
    });

    if (!tipoGarantia) {
      throw new NotFoundException(
        `Tipo de garantía con ID ${createGarantiaDto.tipoGarantiaId} no encontrado`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        hipotecaria,
        prendaria,
        fiador,
        documentaria,
        certificacionSGR,
        ...garantiaData
      } = createGarantiaDto;

      // Crear la garantía base
      const garantia = queryRunner.manager.create(Garantia, garantiaData);
      const savedGarantia = await queryRunner.manager.save(garantia);

      // Crear el detalle según el código del tipo de garantía
      const tipoCodigo = tipoGarantia.codigo.toUpperCase();

      if (tipoCodigo === 'HIPOTECARIA' && hipotecaria) {
        const hipotecariaEntity = queryRunner.manager.create(GarantiaHipotecaria, {
          ...hipotecaria,
          garantiaId: savedGarantia.id,
        });
        await queryRunner.manager.save(hipotecariaEntity);
      } else if (tipoCodigo === 'PRENDARIA' && prendaria) {
        const prendariaEntity = queryRunner.manager.create(GarantiaPrendaria, {
          ...prendaria,
          garantiaId: savedGarantia.id,
        });
        await queryRunner.manager.save(prendariaEntity);
      } else if (tipoCodigo === 'FIDUCIARIA' && fiador) {
        const fiadorEntity = queryRunner.manager.create(GarantiaFiador, {
          ...fiador,
          garantiaId: savedGarantia.id,
        });
        await queryRunner.manager.save(fiadorEntity);
      } else if (tipoCodigo === 'DOCUMENTARIA' && documentaria) {
        const documentariaEntity = queryRunner.manager.create(GarantiaDocumentaria, {
          ...documentaria,
          garantiaId: savedGarantia.id,
        });
        await queryRunner.manager.save(documentariaEntity);
      } else if (tipoCodigo === 'SGR' && certificacionSGR) {
        savedGarantia.observaciones = certificacionSGR;
        await queryRunner.manager.save(savedGarantia);
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedGarantia.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Garantia[]> {
    return this.garantiaRepository.find({
      relations: [
        'solicitud',
        'tipoGarantiaCatalogo',
        'hipotecaria',
        'hipotecaria.tipoInmuebleEntity',
        'hipotecaria.departamento',
        'hipotecaria.municipio',
        'hipotecaria.distrito',
        'prendaria',
        'fiador',
        'fiador.personaFiador',
        'documentaria',
        'documentaria.tipoDocumentoEntity',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findBySolicitud(solicitudId: number): Promise<Garantia[]> {
    return this.garantiaRepository.find({
      where: { solicitudId },
      relations: [
        'tipoGarantiaCatalogo',
        'hipotecaria',
        'hipotecaria.tipoInmuebleEntity',
        'hipotecaria.departamento',
        'hipotecaria.municipio',
        'hipotecaria.distrito',
        'prendaria',
        'fiador',
        'fiador.personaFiador',
        'documentaria',
        'documentaria.tipoDocumentoEntity',
      ],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Garantia> {
    const garantia = await this.garantiaRepository.findOne({
      where: { id },
      relations: [
        'solicitud',
        'tipoGarantiaCatalogo',
        'hipotecaria',
        'hipotecaria.tipoInmuebleEntity',
        'hipotecaria.departamento',
        'hipotecaria.municipio',
        'hipotecaria.distrito',
        'prendaria',
        'fiador',
        'fiador.personaFiador',
        'documentaria',
        'documentaria.tipoDocumentoEntity',
      ],
    });

    if (!garantia) {
      throw new NotFoundException(`Garantía con ID ${id} no encontrada`);
    }

    return garantia;
  }

  async update(id: number, updateGarantiaDto: UpdateGarantiaDto): Promise<Garantia> {
    const garantia = await this.findOne(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        hipotecaria,
        prendaria,
        fiador,
        documentaria,
        certificacionSGR,
        ...garantiaData
      } = updateGarantiaDto;

      // Actualizar datos base de la garantía
      Object.assign(garantia, garantiaData);
      await queryRunner.manager.save(garantia);

      // Actualizar el detalle según el código del tipo de garantía
      const tipoCodigo = garantia.tipoGarantiaCatalogo?.codigo?.toUpperCase() || '';

      if (tipoCodigo === 'HIPOTECARIA' && hipotecaria && garantia.hipotecaria) {
        Object.assign(garantia.hipotecaria, hipotecaria);
        await queryRunner.manager.save(garantia.hipotecaria);
      } else if (tipoCodigo === 'PRENDARIA' && prendaria && garantia.prendaria) {
        Object.assign(garantia.prendaria, prendaria);
        await queryRunner.manager.save(garantia.prendaria);
      } else if (tipoCodigo === 'FIDUCIARIA' && fiador && garantia.fiador) {
        Object.assign(garantia.fiador, fiador);
        await queryRunner.manager.save(garantia.fiador);
      } else if (tipoCodigo === 'DOCUMENTARIA' && documentaria && garantia.documentaria) {
        Object.assign(garantia.documentaria, documentaria);
        await queryRunner.manager.save(garantia.documentaria);
      } else if (tipoCodigo === 'SGR' && certificacionSGR) {
        garantia.observaciones = certificacionSGR;
        await queryRunner.manager.save(garantia);
      }

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    const garantia = await this.findOne(id);
    await this.garantiaRepository.remove(garantia);
  }

  async calcularCobertura(
    solicitudId: number,
  ): Promise<{ totalGarantias: number; montoSolicitado: number; cobertura: number }> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id: solicitudId },
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${solicitudId} no encontrada`);
    }

    const garantias = await this.findBySolicitud(solicitudId);

    const totalGarantias = garantias.reduce((sum, g) => {
      return sum + (Number(g.valorEstimado) || 0);
    }, 0);

    const montoSolicitado = Number(solicitud.montoSolicitado) || 0;
    const cobertura = montoSolicitado > 0 ? (totalGarantias / montoSolicitado) * 100 : 0;

    return {
      totalGarantias,
      montoSolicitado,
      cobertura: Math.round(cobertura * 100) / 100,
    };
  }
}
