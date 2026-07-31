import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { TipoAccionService } from './tipo-accion.service';
import { CreateTipoAccionDto } from './dto/create-tipo-accion.dto';
import { UpdateTipoAccionDto } from './dto/update-tipo-accion.dto';

@Controller('acciones/tipos-accion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TipoAccionController {
  constructor(private readonly service: TipoAccionService) {}

  @Post()
  create(@Body() dto: CreateTipoAccionDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('activo') activo?: string) {
    const activoBool = activo !== undefined ? activo === 'true' : undefined;
    return this.service.findAll(activoBool);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoAccionDto,
  ) {
    return this.service.update(id, dto);
  }
}
