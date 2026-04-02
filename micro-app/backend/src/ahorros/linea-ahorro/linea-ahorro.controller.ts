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
import { LineaAhorroService } from './linea-ahorro.service';
import { CreateLineaAhorroDto } from './dto/create-linea-ahorro.dto';
import { UpdateLineaAhorroDto } from './dto/update-linea-ahorro.dto';

@Controller('ahorros/lineas-ahorro')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LineaAhorroController {
  constructor(private readonly service: LineaAhorroService) {}

  @Post()
  create(@Body() dto: CreateLineaAhorroDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('activo') activo?: string) {
    const activoBool =
      activo !== undefined ? activo === 'true' : undefined;
    return this.service.findAll(activoBool);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLineaAhorroDto,
  ) {
    return this.service.update(id, dto);
  }
}
