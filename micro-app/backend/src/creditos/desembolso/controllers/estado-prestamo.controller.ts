import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  EstadoPrestamoService,
  CreateEstadoPrestamoDto,
  UpdateEstadoPrestamoDto,
} from '../services/estado-prestamo.service';
import { EstadoPrestamo } from '../entities/estado-prestamo.entity';

/**
 * Controlador para gestión de estados de préstamos
 */
@Controller('estado-prestamo')
export class EstadoPrestamoController {
  constructor(private readonly estadoService: EstadoPrestamoService) {}

  /**
   * GET /api/estado-prestamo
   * Lista todos los estados
   */
  @Get()
  async findAll(): Promise<EstadoPrestamo[]> {
    return this.estadoService.findAll();
  }

  /**
   * GET /api/estado-prestamo/activos
   * Lista solo los estados activos
   */
  @Get('activos')
  async findActivos(): Promise<EstadoPrestamo[]> {
    return this.estadoService.findActivos();
  }

  /**
   * GET /api/estado-prestamo/:id
   * Obtiene un estado por ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<EstadoPrestamo> {
    return this.estadoService.findOne(id);
  }

  /**
   * POST /api/estado-prestamo
   * Crea un nuevo estado
   */
  @Post()
  async create(@Body() dto: CreateEstadoPrestamoDto): Promise<EstadoPrestamo> {
    return this.estadoService.create(dto);
  }

  /**
   * PUT /api/estado-prestamo/:id
   * Actualiza un estado
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoPrestamoDto,
  ): Promise<EstadoPrestamo> {
    return this.estadoService.update(id, dto);
  }

  /**
   * DELETE /api/estado-prestamo/:id
   * Elimina un estado
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.estadoService.remove(id);
  }

  /**
   * POST /api/estado-prestamo/inicializar
   * Inicializa los estados por defecto
   */
  @Post('inicializar')
  async inicializar(): Promise<{ message: string }> {
    await this.estadoService.inicializarEstadosPorDefecto();
    return { message: 'Estados de préstamo inicializados exitosamente' };
  }
}
