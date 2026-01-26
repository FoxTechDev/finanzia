import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoPago } from './entities/tipo-pago.entity';
import { CreateTipoPagoDto } from './dto/create-tipo-pago.dto';
import { UpdateTipoPagoDto } from './dto/update-tipo-pago.dto';

@Injectable()
export class TipoPagoService {
  constructor(
    @InjectRepository(TipoPago)
    private readonly tipoPagoRepository: Repository<TipoPago>,
  ) {}

  async create(createTipoPagoDto: CreateTipoPagoDto): Promise<TipoPago> {
    const exists = await this.tipoPagoRepository.findOne({
      where: { codigo: createTipoPagoDto.codigo },
    });

    if (exists) {
      throw new ConflictException(`El código ${createTipoPagoDto.codigo} ya existe`);
    }

    const tipoPago = this.tipoPagoRepository.create(createTipoPagoDto);
    return await this.tipoPagoRepository.save(tipoPago);
  }

  async findAll(): Promise<TipoPago[]> {
    return await this.tipoPagoRepository.find({
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findActivos(): Promise<TipoPago[]> {
    return await this.tipoPagoRepository.find({
      where: { activo: true },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<TipoPago> {
    const tipoPago = await this.tipoPagoRepository.findOne({
      where: { id },
    });

    if (!tipoPago) {
      throw new NotFoundException(`TipoPago con ID ${id} no encontrado`);
    }

    return tipoPago;
  }

  async findByCodigo(codigo: string): Promise<TipoPago> {
    const tipoPago = await this.tipoPagoRepository.findOne({
      where: { codigo },
    });

    if (!tipoPago) {
      throw new NotFoundException(`TipoPago con código ${codigo} no encontrado`);
    }

    return tipoPago;
  }

  async update(id: number, updateTipoPagoDto: UpdateTipoPagoDto): Promise<TipoPago> {
    const tipoPago = await this.findOne(id);

    if (updateTipoPagoDto.codigo && updateTipoPagoDto.codigo !== tipoPago.codigo) {
      const exists = await this.tipoPagoRepository.findOne({
        where: { codigo: updateTipoPagoDto.codigo },
      });

      if (exists) {
        throw new ConflictException(`El código ${updateTipoPagoDto.codigo} ya existe`);
      }
    }

    Object.assign(tipoPago, updateTipoPagoDto);
    return await this.tipoPagoRepository.save(tipoPago);
  }

  async remove(id: number): Promise<void> {
    const tipoPago = await this.findOne(id);
    await this.tipoPagoRepository.remove(tipoPago);
  }
}
