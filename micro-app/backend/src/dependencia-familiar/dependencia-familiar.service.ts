import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DependenciaFamiliar } from './entities/dependencia-familiar.entity';
import { CreateDependenciaFamiliarDto } from './dto/create-dependencia-familiar.dto';
import { UpdateDependenciaFamiliarDto } from './dto/update-dependencia-familiar.dto';

@Injectable()
export class DependenciaFamiliarService {
  constructor(
    @InjectRepository(DependenciaFamiliar)
    private readonly dependenciaRepository: Repository<DependenciaFamiliar>,
  ) {}

  /**
   * Crea una nueva dependencia familiar para una persona
   */
  async create(
    personaId: number,
    createDto: CreateDependenciaFamiliarDto,
  ): Promise<DependenciaFamiliar> {
    const dependencia = this.dependenciaRepository.create({
      ...createDto,
      personaId,
    });
    return await this.dependenciaRepository.save(dependencia);
  }

  /**
   * Obtiene todas las dependencias familiares de una persona
   */
  async findByPersona(personaId: number): Promise<DependenciaFamiliar[]> {
    return await this.dependenciaRepository.find({
      where: { personaId },
      order: { id: 'ASC' },
    });
  }

  /**
   * Obtiene una dependencia familiar por ID
   */
  async findOne(id: number): Promise<DependenciaFamiliar> {
    const dependencia = await this.dependenciaRepository.findOne({
      where: { id },
    });

    if (!dependencia) {
      throw new NotFoundException(`Dependencia familiar con ID ${id} no encontrada`);
    }

    return dependencia;
  }

  /**
   * Actualiza una dependencia familiar
   */
  async update(
    id: number,
    updateDto: UpdateDependenciaFamiliarDto,
  ): Promise<DependenciaFamiliar> {
    const dependencia = await this.findOne(id);
    Object.assign(dependencia, updateDto);
    return await this.dependenciaRepository.save(dependencia);
  }

  /**
   * Elimina una dependencia familiar
   */
  async remove(id: number): Promise<void> {
    const dependencia = await this.findOne(id);
    await this.dependenciaRepository.remove(dependencia);
  }

  /**
   * Elimina todas las dependencias de una persona
   */
  async removeByPersona(personaId: number): Promise<void> {
    await this.dependenciaRepository.delete({ personaId });
  }
}
