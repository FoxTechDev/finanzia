import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CatalogoGarantiaService } from '../services/catalogo-garantia.service';
import { CreateTipoGarantiaCatalogoDto } from '../dto/create-tipo-garantia-catalogo.dto';
import { CreateTipoInmuebleDto } from '../dto/create-tipo-inmueble.dto';
import { CreateTipoDocumentoGarantiaDto } from '../dto/create-tipo-documento-garantia.dto';

@Controller('catalogos-garantia')
export class CatalogoGarantiaController {
  constructor(private readonly catalogoService: CatalogoGarantiaService) {}

  // ========== TIPO GARANTÍA ==========
  @Post('tipos-garantia')
  createTipoGarantia(@Body() dto: CreateTipoGarantiaCatalogoDto) {
    return this.catalogoService.createTipoGarantia(dto);
  }

  @Get('tipos-garantia')
  findAllTiposGarantia(@Query('activos') activos?: string) {
    return this.catalogoService.findAllTiposGarantia(activos === 'true');
  }

  @Get('tipos-garantia/:id')
  findTipoGarantiaById(@Param('id', ParseIntPipe) id: number) {
    return this.catalogoService.findTipoGarantiaById(id);
  }

  @Patch('tipos-garantia/:id')
  updateTipoGarantia(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateTipoGarantiaCatalogoDto>,
  ) {
    return this.catalogoService.updateTipoGarantia(id, dto);
  }

  @Delete('tipos-garantia/:id')
  deleteTipoGarantia(@Param('id', ParseIntPipe) id: number) {
    return this.catalogoService.deleteTipoGarantia(id);
  }

  // ========== TIPO INMUEBLE ==========
  @Post('tipos-inmueble')
  createTipoInmueble(@Body() dto: CreateTipoInmuebleDto) {
    return this.catalogoService.createTipoInmueble(dto);
  }

  @Get('tipos-inmueble')
  findAllTiposInmueble(@Query('activos') activos?: string) {
    return this.catalogoService.findAllTiposInmueble(activos === 'true');
  }

  @Get('tipos-inmueble/:id')
  findTipoInmuebleById(@Param('id', ParseIntPipe) id: number) {
    return this.catalogoService.findTipoInmuebleById(id);
  }

  @Patch('tipos-inmueble/:id')
  updateTipoInmueble(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateTipoInmuebleDto>,
  ) {
    return this.catalogoService.updateTipoInmueble(id, dto);
  }

  @Delete('tipos-inmueble/:id')
  deleteTipoInmueble(@Param('id', ParseIntPipe) id: number) {
    return this.catalogoService.deleteTipoInmueble(id);
  }

  // ========== TIPO DOCUMENTO GARANTÍA ==========
  @Post('tipos-documento')
  createTipoDocumento(@Body() dto: CreateTipoDocumentoGarantiaDto) {
    return this.catalogoService.createTipoDocumento(dto);
  }

  @Get('tipos-documento')
  findAllTiposDocumento(@Query('activos') activos?: string) {
    return this.catalogoService.findAllTiposDocumento(activos === 'true');
  }

  @Get('tipos-documento/:id')
  findTipoDocumentoById(@Param('id', ParseIntPipe) id: number) {
    return this.catalogoService.findTipoDocumentoById(id);
  }

  @Patch('tipos-documento/:id')
  updateTipoDocumento(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateTipoDocumentoGarantiaDto>,
  ) {
    return this.catalogoService.updateTipoDocumento(id, dto);
  }

  @Delete('tipos-documento/:id')
  deleteTipoDocumento(@Param('id', ParseIntPipe) id: number) {
    return this.catalogoService.deleteTipoDocumento(id);
  }
}
