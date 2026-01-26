import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClasificacionPrestamoService } from '../services/clasificacion-prestamo.service';
import { ClasificacionPrestamo } from '../entities/clasificacion-prestamo.entity';
import { CreateClasificacionPrestamoDto } from '../dto/create-clasificacion-prestamo.dto';
import { UpdateClasificacionPrestamoDto } from '../dto/update-clasificacion-prestamo.dto';

/**
 * Controlador para gestión de clasificaciones de préstamos NCB-022
 */
@Controller('clasificacion-prestamo')
export class ClasificacionPrestamoController {
  constructor(
    private readonly clasificacionService: ClasificacionPrestamoService,
  ) {}

  /**
   * GET /api/clasificacion-prestamo
   * Lista todas las clasificaciones
   */
  @Get()
  async findAll(): Promise<ClasificacionPrestamo[]> {
    return this.clasificacionService.findAll();
  }

  /**
   * GET /api/clasificacion-prestamo/activas
   * Lista solo las clasificaciones activas
   */
  @Get('activas')
  async findActivas(): Promise<ClasificacionPrestamo[]> {
    return this.clasificacionService.findActivas();
  }

  /**
   * GET /api/clasificacion-prestamo/:id
   * Obtiene una clasificación por ID
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ClasificacionPrestamo> {
    return this.clasificacionService.findOne(id);
  }

  /**
   * POST /api/clasificacion-prestamo
   * Crea una nueva clasificación
   */
  @Post()
  @UsePipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true
  }))
  async create(
    @Body() dto: CreateClasificacionPrestamoDto,
  ): Promise<ClasificacionPrestamo> {
    return this.clasificacionService.create(dto);
  }

  /**
   * PUT /api/clasificacion-prestamo/:id
   * Actualiza una clasificación
   */
  @Put(':id')
  @UsePipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true
  }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClasificacionPrestamoDto,
  ): Promise<ClasificacionPrestamo> {
    return this.clasificacionService.update(id, dto);
  }

  /**
   * DELETE /api/clasificacion-prestamo/:id
   * Elimina una clasificación
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.clasificacionService.remove(id);
  }

  /**
   * POST /api/clasificacion-prestamo/inicializar
   * Inicializa las clasificaciones NCB-022 por defecto
   */
  @Post('inicializar')
  async inicializar(): Promise<{ message: string }> {
    await this.clasificacionService.inicializarClasificacionesNCB022();
    return { message: 'Clasificaciones NCB-022 inicializadas exitosamente' };
  }
}
