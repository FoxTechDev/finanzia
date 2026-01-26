import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DestinoCredito } from './entities/destino-credito.entity';
import { CreateDestinoCreditoDto } from './dto/create-destino-credito.dto';
import { UpdateDestinoCreditoDto } from './dto/update-destino-credito.dto';

@Injectable()
export class DestinoCreditoService {
  constructor(
    @InjectRepository(DestinoCredito)
    private readonly destinoCreditoRepository: Repository<DestinoCredito>,
  ) {}

  async create(createDestinoCreditoDto: CreateDestinoCreditoDto): Promise<DestinoCredito> {
    const exists = await this.destinoCreditoRepository.findOne({
      where: { codigo: createDestinoCreditoDto.codigo },
    });

    if (exists) {
      throw new ConflictException(`El código ${createDestinoCreditoDto.codigo} ya existe`);
    }

    const destinoCredito = this.destinoCreditoRepository.create(createDestinoCreditoDto);
    return await this.destinoCreditoRepository.save(destinoCredito);
  }

  async findAll(): Promise<DestinoCredito[]> {
    return await this.destinoCreditoRepository.find({
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findActivos(): Promise<DestinoCredito[]> {
    return await this.destinoCreditoRepository.find({
      where: { activo: true },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<DestinoCredito> {
    const destinoCredito = await this.destinoCreditoRepository.findOne({
      where: { id },
    });

    if (!destinoCredito) {
      throw new NotFoundException(`DestinoCredito con ID ${id} no encontrado`);
    }

    return destinoCredito;
  }

  async findByCodigo(codigo: string): Promise<DestinoCredito> {
    const destinoCredito = await this.destinoCreditoRepository.findOne({
      where: { codigo },
    });

    if (!destinoCredito) {
      throw new NotFoundException(`DestinoCredito con código ${codigo} no encontrado`);
    }

    return destinoCredito;
  }

  async update(id: number, updateDestinoCreditoDto: UpdateDestinoCreditoDto): Promise<DestinoCredito> {
    const destinoCredito = await this.findOne(id);

    if (updateDestinoCreditoDto.codigo && updateDestinoCreditoDto.codigo !== destinoCredito.codigo) {
      const exists = await this.destinoCreditoRepository.findOne({
        where: { codigo: updateDestinoCreditoDto.codigo },
      });

      if (exists) {
        throw new ConflictException(`El código ${updateDestinoCreditoDto.codigo} ya existe`);
      }
    }

    Object.assign(destinoCredito, updateDestinoCreditoDto);
    return await this.destinoCreditoRepository.save(destinoCredito);
  }

  async remove(id: number): Promise<void> {
    const destinoCredito = await this.findOne(id);
    await this.destinoCreditoRepository.remove(destinoCredito);
  }
}
