import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LineaCredito } from './entities/linea-credito.entity';
import { CreateLineaCreditoDto } from './dto/create-linea-credito.dto';
import { UpdateLineaCreditoDto } from './dto/update-linea-credito.dto';

@Injectable()
export class LineaCreditoService {
  constructor(
    @InjectRepository(LineaCredito)
    private readonly lineaCreditoRepository: Repository<LineaCredito>,
  ) {}

  async create(createDto: CreateLineaCreditoDto): Promise<LineaCredito> {
    const existing = await this.lineaCreditoRepository.findOne({
      where: { codigo: createDto.codigo },
    });

    if (existing) {
      throw new ConflictException(`Ya existe una línea de crédito con el código ${createDto.codigo}`);
    }

    const lineaCredito = this.lineaCreditoRepository.create(createDto);
    return this.lineaCreditoRepository.save(lineaCredito);
  }

  async findAll(): Promise<LineaCredito[]> {
    return this.lineaCreditoRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async findAllActive(): Promise<LineaCredito[]> {
    return this.lineaCreditoRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<LineaCredito> {
    const lineaCredito = await this.lineaCreditoRepository.findOne({
      where: { id },
      relations: ['tiposCredito'],
    });

    if (!lineaCredito) {
      throw new NotFoundException(`Línea de crédito con ID ${id} no encontrada`);
    }

    return lineaCredito;
  }

  async update(id: number, updateDto: UpdateLineaCreditoDto): Promise<LineaCredito> {
    const lineaCredito = await this.findOne(id);

    if (updateDto.codigo && updateDto.codigo !== lineaCredito.codigo) {
      const existing = await this.lineaCreditoRepository.findOne({
        where: { codigo: updateDto.codigo },
      });
      if (existing) {
        throw new ConflictException(`Ya existe una línea de crédito con el código ${updateDto.codigo}`);
      }
    }

    Object.assign(lineaCredito, updateDto);
    return this.lineaCreditoRepository.save(lineaCredito);
  }

  async remove(id: number): Promise<void> {
    const lineaCredito = await this.findOne(id);
    await this.lineaCreditoRepository.remove(lineaCredito);
  }
}
