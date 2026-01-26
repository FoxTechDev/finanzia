import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeriodicidadPago } from './entities/periodicidad-pago.entity';
import { CreatePeriodicidadPagoDto } from './dto/create-periodicidad-pago.dto';
import { UpdatePeriodicidadPagoDto } from './dto/update-periodicidad-pago.dto';

@Injectable()
export class PeriodicidadPagoService {
  constructor(
    @InjectRepository(PeriodicidadPago)
    private readonly periodicidadPagoRepository: Repository<PeriodicidadPago>,
  ) {}

  async create(createPeriodicidadPagoDto: CreatePeriodicidadPagoDto): Promise<PeriodicidadPago> {
    const exists = await this.periodicidadPagoRepository.findOne({
      where: { codigo: createPeriodicidadPagoDto.codigo },
    });

    if (exists) {
      throw new ConflictException(`El código ${createPeriodicidadPagoDto.codigo} ya existe`);
    }

    const periodicidadPago = this.periodicidadPagoRepository.create(createPeriodicidadPagoDto);
    return await this.periodicidadPagoRepository.save(periodicidadPago);
  }

  async findAll(): Promise<PeriodicidadPago[]> {
    return await this.periodicidadPagoRepository.find({
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findActivos(): Promise<PeriodicidadPago[]> {
    return await this.periodicidadPagoRepository.find({
      where: { activo: true },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<PeriodicidadPago> {
    const periodicidadPago = await this.periodicidadPagoRepository.findOne({
      where: { id },
    });

    if (!periodicidadPago) {
      throw new NotFoundException(`PeriodicidadPago con ID ${id} no encontrado`);
    }

    return periodicidadPago;
  }

  async findByCodigo(codigo: string): Promise<PeriodicidadPago> {
    const periodicidadPago = await this.periodicidadPagoRepository.findOne({
      where: { codigo },
    });

    if (!periodicidadPago) {
      throw new NotFoundException(`PeriodicidadPago con código ${codigo} no encontrado`);
    }

    return periodicidadPago;
  }

  async update(id: number, updatePeriodicidadPagoDto: UpdatePeriodicidadPagoDto): Promise<PeriodicidadPago> {
    const periodicidadPago = await this.findOne(id);

    if (updatePeriodicidadPagoDto.codigo && updatePeriodicidadPagoDto.codigo !== periodicidadPago.codigo) {
      const exists = await this.periodicidadPagoRepository.findOne({
        where: { codigo: updatePeriodicidadPagoDto.codigo },
      });

      if (exists) {
        throw new ConflictException(`El código ${updatePeriodicidadPagoDto.codigo} ya existe`);
      }
    }

    Object.assign(periodicidadPago, updatePeriodicidadPagoDto);
    return await this.periodicidadPagoRepository.save(periodicidadPago);
  }

  async remove(id: number): Promise<void> {
    const periodicidadPago = await this.findOne(id);
    await this.periodicidadPagoRepository.remove(periodicidadPago);
  }
}
