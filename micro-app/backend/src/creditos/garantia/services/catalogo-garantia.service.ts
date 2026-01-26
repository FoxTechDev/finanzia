import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoGarantiaCatalogo } from '../entities/tipo-garantia-catalogo.entity';
import { TipoInmueble } from '../entities/tipo-inmueble.entity';
import { TipoDocumentoGarantia } from '../entities/tipo-documento-garantia.entity';
import { CreateTipoGarantiaCatalogoDto } from '../dto/create-tipo-garantia-catalogo.dto';
import { CreateTipoInmuebleDto } from '../dto/create-tipo-inmueble.dto';
import { CreateTipoDocumentoGarantiaDto } from '../dto/create-tipo-documento-garantia.dto';

@Injectable()
export class CatalogoGarantiaService {
  constructor(
    @InjectRepository(TipoGarantiaCatalogo)
    private tipoGarantiaRepo: Repository<TipoGarantiaCatalogo>,
    @InjectRepository(TipoInmueble)
    private tipoInmuebleRepo: Repository<TipoInmueble>,
    @InjectRepository(TipoDocumentoGarantia)
    private tipoDocumentoRepo: Repository<TipoDocumentoGarantia>,
  ) {}

  // ========== TIPO GARANTÍA ==========
  async createTipoGarantia(dto: CreateTipoGarantiaCatalogoDto): Promise<TipoGarantiaCatalogo> {
    const existing = await this.tipoGarantiaRepo.findOne({ where: { codigo: dto.codigo } });
    if (existing) {
      throw new ConflictException(`Ya existe un tipo de garantía con código ${dto.codigo}`);
    }
    const tipo = this.tipoGarantiaRepo.create(dto);
    return this.tipoGarantiaRepo.save(tipo);
  }

  async findAllTiposGarantia(soloActivos = false): Promise<TipoGarantiaCatalogo[]> {
    const where = soloActivos ? { activo: true } : {};
    return this.tipoGarantiaRepo.find({ where, order: { nombre: 'ASC' } });
  }

  async findTipoGarantiaById(id: number): Promise<TipoGarantiaCatalogo> {
    const tipo = await this.tipoGarantiaRepo.findOne({ where: { id } });
    if (!tipo) {
      throw new NotFoundException(`Tipo de garantía con ID ${id} no encontrado`);
    }
    return tipo;
  }

  async findTipoGarantiaByCodigo(codigo: string): Promise<TipoGarantiaCatalogo> {
    const tipo = await this.tipoGarantiaRepo.findOne({ where: { codigo } });
    if (!tipo) {
      throw new NotFoundException(`Tipo de garantía con código ${codigo} no encontrado`);
    }
    return tipo;
  }

  async updateTipoGarantia(id: number, dto: Partial<CreateTipoGarantiaCatalogoDto>): Promise<TipoGarantiaCatalogo> {
    const tipo = await this.findTipoGarantiaById(id);
    if (dto.codigo && dto.codigo !== tipo.codigo) {
      const existing = await this.tipoGarantiaRepo.findOne({ where: { codigo: dto.codigo } });
      if (existing) {
        throw new ConflictException(`Ya existe un tipo de garantía con código ${dto.codigo}`);
      }
    }
    Object.assign(tipo, dto);
    return this.tipoGarantiaRepo.save(tipo);
  }

  async deleteTipoGarantia(id: number): Promise<void> {
    const tipo = await this.findTipoGarantiaById(id);
    await this.tipoGarantiaRepo.remove(tipo);
  }

  // ========== TIPO INMUEBLE ==========
  async createTipoInmueble(dto: CreateTipoInmuebleDto): Promise<TipoInmueble> {
    const existing = await this.tipoInmuebleRepo.findOne({ where: { codigo: dto.codigo } });
    if (existing) {
      throw new ConflictException(`Ya existe un tipo de inmueble con código ${dto.codigo}`);
    }
    const tipo = this.tipoInmuebleRepo.create(dto);
    return this.tipoInmuebleRepo.save(tipo);
  }

  async findAllTiposInmueble(soloActivos = false): Promise<TipoInmueble[]> {
    const where = soloActivos ? { activo: true } : {};
    return this.tipoInmuebleRepo.find({ where, order: { nombre: 'ASC' } });
  }

  async findTipoInmuebleById(id: number): Promise<TipoInmueble> {
    const tipo = await this.tipoInmuebleRepo.findOne({ where: { id } });
    if (!tipo) {
      throw new NotFoundException(`Tipo de inmueble con ID ${id} no encontrado`);
    }
    return tipo;
  }

  async updateTipoInmueble(id: number, dto: Partial<CreateTipoInmuebleDto>): Promise<TipoInmueble> {
    const tipo = await this.findTipoInmuebleById(id);
    if (dto.codigo && dto.codigo !== tipo.codigo) {
      const existing = await this.tipoInmuebleRepo.findOne({ where: { codigo: dto.codigo } });
      if (existing) {
        throw new ConflictException(`Ya existe un tipo de inmueble con código ${dto.codigo}`);
      }
    }
    Object.assign(tipo, dto);
    return this.tipoInmuebleRepo.save(tipo);
  }

  async deleteTipoInmueble(id: number): Promise<void> {
    const tipo = await this.findTipoInmuebleById(id);
    await this.tipoInmuebleRepo.remove(tipo);
  }

  // ========== TIPO DOCUMENTO GARANTÍA ==========
  async createTipoDocumento(dto: CreateTipoDocumentoGarantiaDto): Promise<TipoDocumentoGarantia> {
    const existing = await this.tipoDocumentoRepo.findOne({ where: { codigo: dto.codigo } });
    if (existing) {
      throw new ConflictException(`Ya existe un tipo de documento con código ${dto.codigo}`);
    }
    const tipo = this.tipoDocumentoRepo.create(dto);
    return this.tipoDocumentoRepo.save(tipo);
  }

  async findAllTiposDocumento(soloActivos = false): Promise<TipoDocumentoGarantia[]> {
    const where = soloActivos ? { activo: true } : {};
    return this.tipoDocumentoRepo.find({ where, order: { nombre: 'ASC' } });
  }

  async findTipoDocumentoById(id: number): Promise<TipoDocumentoGarantia> {
    const tipo = await this.tipoDocumentoRepo.findOne({ where: { id } });
    if (!tipo) {
      throw new NotFoundException(`Tipo de documento con ID ${id} no encontrado`);
    }
    return tipo;
  }

  async updateTipoDocumento(id: number, dto: Partial<CreateTipoDocumentoGarantiaDto>): Promise<TipoDocumentoGarantia> {
    const tipo = await this.findTipoDocumentoById(id);
    if (dto.codigo && dto.codigo !== tipo.codigo) {
      const existing = await this.tipoDocumentoRepo.findOne({ where: { codigo: dto.codigo } });
      if (existing) {
        throw new ConflictException(`Ya existe un tipo de documento con código ${dto.codigo}`);
      }
    }
    Object.assign(tipo, dto);
    return this.tipoDocumentoRepo.save(tipo);
  }

  async deleteTipoDocumento(id: number): Promise<void> {
    const tipo = await this.findTipoDocumentoById(id);
    await this.tipoDocumentoRepo.remove(tipo);
  }
}
