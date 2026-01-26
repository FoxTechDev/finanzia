import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoGarantia } from './entities/estado-garantia.entity';
import { CreateEstadoGarantiaDto } from './dto/create-estado-garantia.dto';
import { UpdateEstadoGarantiaDto } from './dto/update-estado-garantia.dto';

@Injectable()
export class EstadoGarantiaService {
  constructor(
    @InjectRepository(EstadoGarantia)
    private readonly estadoGarantiaRepository: Repository<EstadoGarantia>,
  ) {}

  async create(createEstadoGarantiaDto: CreateEstadoGarantiaDto): Promise<EstadoGarantia> {
    const exists = await this.estadoGarantiaRepository.findOne({
      where: { codigo: createEstadoGarantiaDto.codigo },
    });

    if (exists) {
      throw new ConflictException(`El código ${createEstadoGarantiaDto.codigo} ya existe`);
    }

    const estadoGarantia = this.estadoGarantiaRepository.create(createEstadoGarantiaDto);
    return await this.estadoGarantiaRepository.save(estadoGarantia);
  }

  async findAll(): Promise<EstadoGarantia[]> {
    return await this.estadoGarantiaRepository.find({
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findActivos(): Promise<EstadoGarantia[]> {
    return await this.estadoGarantiaRepository.find({
      where: { activo: true },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<EstadoGarantia> {
    const estadoGarantia = await this.estadoGarantiaRepository.findOne({
      where: { id },
    });

    if (!estadoGarantia) {
      throw new NotFoundException(`Estado de garantía con ID ${id} no encontrado`);
    }

    return estadoGarantia;
  }

  async findByCodigo(codigo: string): Promise<EstadoGarantia> {
    const estadoGarantia = await this.estadoGarantiaRepository.findOne({
      where: { codigo },
    });

    if (!estadoGarantia) {
      throw new NotFoundException(`Estado de garantía con código ${codigo} no encontrado`);
    }

    return estadoGarantia;
  }

  async update(id: number, updateEstadoGarantiaDto: UpdateEstadoGarantiaDto): Promise<EstadoGarantia> {
    const estadoGarantia = await this.findOne(id);

    if (updateEstadoGarantiaDto.codigo && updateEstadoGarantiaDto.codigo !== estadoGarantia.codigo) {
      const exists = await this.estadoGarantiaRepository.findOne({
        where: { codigo: updateEstadoGarantiaDto.codigo },
      });

      if (exists) {
        throw new ConflictException(`El código ${updateEstadoGarantiaDto.codigo} ya existe`);
      }
    }

    Object.assign(estadoGarantia, updateEstadoGarantiaDto);
    return await this.estadoGarantiaRepository.save(estadoGarantia);
  }

  async remove(id: number): Promise<void> {
    const estadoGarantia = await this.findOne(id);
    await this.estadoGarantiaRepository.remove(estadoGarantia);
  }
}
