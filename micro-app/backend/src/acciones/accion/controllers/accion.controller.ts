import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { AccionService } from '../services/accion.service';
import { AccionDividendoService } from '../services/accion-dividendo.service';
import { CreateAccionDto } from '../dto/create-accion.dto';

@Controller('acciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccionController {
  constructor(
    private readonly accionService: AccionService,
    private readonly dividendoService: AccionDividendoService,
  ) {}

  @Post()
  abrir(@Body() dto: CreateAccionDto) {
    return this.accionService.abrir(dto);
  }

  @Get()
  findAll(
    @Query('personaId') personaId?: string,
    @Query('activa') activa?: string,
  ) {
    return this.accionService.findAll(
      personaId ? parseInt(personaId, 10) : undefined,
      activa !== undefined ? activa === 'true' : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.accionService.findOneEntity(id);
  }

  @Get(':id/dividendos')
  findDividendos(@Param('id', ParseIntPipe) id: number) {
    return this.dividendoService.findDividendosByAccion(id);
  }

  @Post('dividendos/procesar')
  procesarDividendos() {
    return this.dividendoService.procesarDividendos();
  }
}
