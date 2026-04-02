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
import { TipoAhorroService } from './tipo-ahorro.service';
import { CreateTipoAhorroDto } from './dto/create-tipo-ahorro.dto';
import { UpdateTipoAhorroDto } from './dto/update-tipo-ahorro.dto';

@Controller('ahorros/tipos-ahorro')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TipoAhorroController {
  constructor(private readonly service: TipoAhorroService) {}

  @Post()
  create(@Body() dto: CreateTipoAhorroDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('activo') activo?: string,
    @Query('lineaCodigo') lineaCodigo?: string,
  ) {
    const activoBool =
      activo !== undefined ? activo === 'true' : undefined;
    return this.service.findAll(activoBool, lineaCodigo);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoAhorroDto,
  ) {
    return this.service.update(id, dto);
  }
}
