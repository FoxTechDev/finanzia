import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecomendacionAsesor } from './entities/recomendacion-asesor.entity';
import { CreateRecomendacionAsesorDto } from './dto/create-recomendacion-asesor.dto';
import { UpdateRecomendacionAsesorDto } from './dto/update-recomendacion-asesor.dto';

@Injectable()
export class RecomendacionAsesorService {
  constructor(
    @InjectRepository(RecomendacionAsesor)
    private readonly recomendacionAsesorRepository: Repository<RecomendacionAsesor>,
  ) {}

  async create(createRecomendacionAsesorDto: CreateRecomendacionAsesorDto): Promise<RecomendacionAsesor> {
    const exists = await this.recomendacionAsesorRepository.findOne({
      where: { codigo: createRecomendacionAsesorDto.codigo },
    });

    if (exists) {
      throw new ConflictException(`El código ${createRecomendacionAsesorDto.codigo} ya existe`);
    }

    const recomendacionAsesor = this.recomendacionAsesorRepository.create(createRecomendacionAsesorDto);
    return await this.recomendacionAsesorRepository.save(recomendacionAsesor);
  }

  async findAll(): Promise<RecomendacionAsesor[]> {
    return await this.recomendacionAsesorRepository.find({
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findActivos(): Promise<RecomendacionAsesor[]> {
    return await this.recomendacionAsesorRepository.find({
      where: { activo: true },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<RecomendacionAsesor> {
    const recomendacionAsesor = await this.recomendacionAsesorRepository.findOne({
      where: { id },
    });

    if (!recomendacionAsesor) {
      throw new NotFoundException(`RecomendacionAsesor con ID ${id} no encontrado`);
    }

    return recomendacionAsesor;
  }

  async findByCodigo(codigo: string): Promise<RecomendacionAsesor> {
    const recomendacionAsesor = await this.recomendacionAsesorRepository.findOne({
      where: { codigo },
    });

    if (!recomendacionAsesor) {
      throw new NotFoundException(`RecomendacionAsesor con código ${codigo} no encontrado`);
    }

    return recomendacionAsesor;
  }

  async update(id: number, updateRecomendacionAsesorDto: UpdateRecomendacionAsesorDto): Promise<RecomendacionAsesor> {
    const recomendacionAsesor = await this.findOne(id);

    if (updateRecomendacionAsesorDto.codigo && updateRecomendacionAsesorDto.codigo !== recomendacionAsesor.codigo) {
      const exists = await this.recomendacionAsesorRepository.findOne({
        where: { codigo: updateRecomendacionAsesorDto.codigo },
      });

      if (exists) {
        throw new ConflictException(`El código ${updateRecomendacionAsesorDto.codigo} ya existe`);
      }
    }

    Object.assign(recomendacionAsesor, updateRecomendacionAsesorDto);
    return await this.recomendacionAsesorRepository.save(recomendacionAsesor);
  }

  async remove(id: number): Promise<void> {
    const recomendacionAsesor = await this.findOne(id);
    await this.recomendacionAsesorRepository.remove(recomendacionAsesor);
  }
}
