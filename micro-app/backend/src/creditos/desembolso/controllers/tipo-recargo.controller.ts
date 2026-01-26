import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoRecargo } from '../entities/tipo-recargo.entity';
import {
  CreateTipoRecargoDto,
  UpdateTipoRecargoDto,
} from '../dto/create-tipo-recargo.dto';

@Controller('tipos-recargo')
export class TipoRecargoController {
  constructor(
    @InjectRepository(TipoRecargo)
    private tipoRecargoRepository: Repository<TipoRecargo>,
  ) {}

  /**
   * GET /api/tipos-recargo
   * Lista todos los tipos de recargo
   */
  @Get()
  async findAll(@Query('activo') activo?: string): Promise<TipoRecargo[]> {
    const where = activo !== undefined ? { activo: activo === 'true' } : {};
    return this.tipoRecargoRepository.find({
      where,
      order: { nombre: 'ASC' },
    });
  }

  /**
   * GET /api/tipos-recargo/:id
   * Obtiene un tipo de recargo por ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TipoRecargo> {
    return this.tipoRecargoRepository.findOneOrFail({
      where: { id },
    });
  }

  /**
   * POST /api/tipos-recargo
   * Crea un nuevo tipo de recargo
   */
  @Post()
  async create(@Body() dto: CreateTipoRecargoDto): Promise<TipoRecargo> {
    const tipoRecargo = this.tipoRecargoRepository.create(dto);
    return this.tipoRecargoRepository.save(tipoRecargo);
  }

  /**
   * PUT /api/tipos-recargo/:id
   * Actualiza un tipo de recargo
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoRecargoDto,
  ): Promise<TipoRecargo> {
    await this.tipoRecargoRepository.update(id, dto);
    return this.tipoRecargoRepository.findOneOrFail({
      where: { id },
    });
  }

  /**
   * DELETE /api/tipos-recargo/:id
   * Elimina un tipo de recargo (soft delete - desactiva)
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.tipoRecargoRepository.update(id, { activo: false });
  }
}
