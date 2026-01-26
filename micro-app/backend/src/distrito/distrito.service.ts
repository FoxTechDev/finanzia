import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Distrito } from './entities/distrito.entity';
import { CreateDistritoDto } from './dto/create-distrito.dto';

@Injectable()
export class DistritoService {
  constructor(
    @InjectRepository(Distrito)
    private readonly distritoRepository: Repository<Distrito>,
  ) {}

  async create(createDistritoDto: CreateDistritoDto): Promise<Distrito> {
    const distrito = this.distritoRepository.create(createDistritoDto);
    return this.distritoRepository.save(distrito);
  }

  async findAll(): Promise<Distrito[]> {
    return this.distritoRepository.find({
      relations: ['municipio', 'municipio.departamento'],
      order: { nombre: 'ASC' },
    });
  }

  async findByMunicipio(municipioId: number): Promise<Distrito[]> {
    return this.distritoRepository.find({
      where: { municipioId },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Distrito> {
    return this.distritoRepository.findOneOrFail({
      where: { id },
      relations: ['municipio'],
    });
  }
}
