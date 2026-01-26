import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoPago } from './entities/estado-pago.entity';
import { CreateEstadoPagoDto } from './dto/create-estado-pago.dto';
import { UpdateEstadoPagoDto } from './dto/update-estado-pago.dto';

@Injectable()
export class EstadoPagoService {
  constructor(
    @InjectRepository(EstadoPago)
    private readonly estadoPagoRepository: Repository<EstadoPago>,
  ) {}

  async create(createEstadoPagoDto: CreateEstadoPagoDto): Promise<EstadoPago> {
    const exists = await this.estadoPagoRepository.findOne({
      where: { codigo: createEstadoPagoDto.codigo },
    });

    if (exists) {
      throw new ConflictException(`El código ${createEstadoPagoDto.codigo} ya existe`);
    }

    const estadoPago = this.estadoPagoRepository.create(createEstadoPagoDto);
    return await this.estadoPagoRepository.save(estadoPago);
  }

  async findAll(): Promise<EstadoPago[]> {
    return await this.estadoPagoRepository.find({
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findActivos(): Promise<EstadoPago[]> {
    return await this.estadoPagoRepository.find({
      where: { activo: true },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<EstadoPago> {
    const estadoPago = await this.estadoPagoRepository.findOne({
      where: { id },
    });

    if (!estadoPago) {
      throw new NotFoundException(`EstadoPago con ID ${id} no encontrado`);
    }

    return estadoPago;
  }

  async findByCodigo(codigo: string): Promise<EstadoPago> {
    const estadoPago = await this.estadoPagoRepository.findOne({
      where: { codigo },
    });

    if (!estadoPago) {
      throw new NotFoundException(`EstadoPago con código ${codigo} no encontrado`);
    }

    return estadoPago;
  }

  async update(id: number, updateEstadoPagoDto: UpdateEstadoPagoDto): Promise<EstadoPago> {
    const estadoPago = await this.findOne(id);

    if (updateEstadoPagoDto.codigo && updateEstadoPagoDto.codigo !== estadoPago.codigo) {
      const exists = await this.estadoPagoRepository.findOne({
        where: { codigo: updateEstadoPagoDto.codigo },
      });

      if (exists) {
        throw new ConflictException(`El código ${updateEstadoPagoDto.codigo} ya existe`);
      }
    }

    Object.assign(estadoPago, updateEstadoPagoDto);
    return await this.estadoPagoRepository.save(estadoPago);
  }

  async remove(id: number): Promise<void> {
    const estadoPago = await this.findOne(id);
    await this.estadoPagoRepository.remove(estadoPago);
  }
}
