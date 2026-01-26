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
import { TipoDeduccion } from '../entities/tipo-deduccion.entity';
import {
  CreateTipoDeduccionDto,
  UpdateTipoDeduccionDto,
} from '../dto/create-tipo-deduccion.dto';

@Controller('tipos-deduccion')
export class TipoDeduccionController {
  constructor(
    @InjectRepository(TipoDeduccion)
    private tipoDeduccionRepository: Repository<TipoDeduccion>,
  ) {}

  /**
   * GET /api/tipos-deduccion
   * Lista todos los tipos de deducción
   */
  @Get()
  async findAll(@Query('activo') activo?: string): Promise<TipoDeduccion[]> {
    const where = activo !== undefined ? { activo: activo === 'true' } : {};
    return this.tipoDeduccionRepository.find({
      where,
      order: { nombre: 'ASC' },
    });
  }

  /**
   * GET /api/tipos-deduccion/:id
   * Obtiene un tipo de deducción por ID
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TipoDeduccion> {
    return this.tipoDeduccionRepository.findOneOrFail({
      where: { id },
    });
  }

  /**
   * POST /api/tipos-deduccion
   * Crea un nuevo tipo de deducción
   */
  @Post()
  async create(
    @Body() dto: CreateTipoDeduccionDto,
  ): Promise<TipoDeduccion> {
    const tipoDeduccion = this.tipoDeduccionRepository.create(dto);
    return this.tipoDeduccionRepository.save(tipoDeduccion);
  }

  /**
   * PUT /api/tipos-deduccion/:id
   * Actualiza un tipo de deducción
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoDeduccionDto,
  ): Promise<TipoDeduccion> {
    await this.tipoDeduccionRepository.update(id, dto);
    return this.tipoDeduccionRepository.findOneOrFail({
      where: { id },
    });
  }

  /**
   * DELETE /api/tipos-deduccion/:id
   * Elimina un tipo de deducción (soft delete - desactiva)
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.tipoDeduccionRepository.update(id, { activo: false });
  }
}
