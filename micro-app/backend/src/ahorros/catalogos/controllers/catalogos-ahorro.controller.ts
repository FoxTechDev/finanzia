import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { CatalogosAhorroService } from '../services/catalogos-ahorro.service';
import {
  CreateEstadoCuentaAhorroDto,
  UpdateEstadoCuentaAhorroDto,
  CreateTipoCapitalizacionDto,
  UpdateTipoCapitalizacionDto,
  CreateNaturalezaMovimientoDto,
  UpdateNaturalezaMovimientoDto,
  CreateTipoTransaccionAhorroDto,
  UpdateTipoTransaccionAhorroDto,
} from '../dto/catalogos-ahorro.dto';

@Controller('ahorros/catalogos')
export class CatalogosAhorroController {
  constructor(private readonly service: CatalogosAhorroService) {}

  // ==================== Estados ====================

  @Get('estados')
  findEstados() {
    return this.service.findEstados();
  }

  @Post('estados')
  createEstado(@Body() dto: CreateEstadoCuentaAhorroDto) {
    return this.service.createEstado(dto);
  }

  @Patch('estados/:id')
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoCuentaAhorroDto,
  ) {
    return this.service.updateEstado(id, dto);
  }

  @Delete('estados/:id')
  deleteEstado(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteEstado(id);
  }

  // ==================== Tipos Capitalización ====================

  @Get('tipos-capitalizacion')
  findTiposCapitalizacion() {
    return this.service.findTiposCapitalizacion();
  }

  @Post('tipos-capitalizacion')
  createTipoCapitalizacion(@Body() dto: CreateTipoCapitalizacionDto) {
    return this.service.createTipoCapitalizacion(dto);
  }

  @Patch('tipos-capitalizacion/:id')
  updateTipoCapitalizacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoCapitalizacionDto,
  ) {
    return this.service.updateTipoCapitalizacion(id, dto);
  }

  @Delete('tipos-capitalizacion/:id')
  deleteTipoCapitalizacion(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteTipoCapitalizacion(id);
  }

  // ==================== Naturalezas ====================

  @Get('naturalezas')
  findNaturalezas() {
    return this.service.findNaturalezas();
  }

  @Post('naturalezas')
  createNaturaleza(@Body() dto: CreateNaturalezaMovimientoDto) {
    return this.service.createNaturaleza(dto);
  }

  @Patch('naturalezas/:id')
  updateNaturaleza(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNaturalezaMovimientoDto,
  ) {
    return this.service.updateNaturaleza(id, dto);
  }

  @Delete('naturalezas/:id')
  deleteNaturaleza(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteNaturaleza(id);
  }

  // ==================== Tipos Transacción ====================

  @Get('tipos-transaccion')
  findTiposTransaccion() {
    return this.service.findTiposTransaccion();
  }

  @Post('tipos-transaccion')
  createTipoTransaccion(@Body() dto: CreateTipoTransaccionAhorroDto) {
    return this.service.createTipoTransaccion(dto);
  }

  @Patch('tipos-transaccion/:id')
  updateTipoTransaccion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoTransaccionAhorroDto,
  ) {
    return this.service.updateTipoTransaccion(id, dto);
  }

  @Delete('tipos-transaccion/:id')
  deleteTipoTransaccion(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteTipoTransaccion(id);
  }
}
