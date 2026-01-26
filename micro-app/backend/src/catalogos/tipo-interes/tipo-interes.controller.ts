import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { TipoInteresService } from './tipo-interes.service';
import { CreateTipoInteresDto } from './dto/create-tipo-interes.dto';
import { UpdateTipoInteresDto } from './dto/update-tipo-interes.dto';

@Controller('catalogos/tipo-interes')
export class TipoInteresController {
  constructor(private readonly tipoInteresService: TipoInteresService) {}

  @Post()
  create(@Body() createTipoInteresDto: CreateTipoInteresDto) {
    return this.tipoInteresService.create(createTipoInteresDto);
  }

  @Get()
  findAll() {
    return this.tipoInteresService.findAll();
  }

  @Get('activos')
  findActivos() {
    return this.tipoInteresService.findActivos();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoInteresService.findOne(id);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.tipoInteresService.findByCodigo(codigo);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoInteresDto: UpdateTipoInteresDto,
  ) {
    return this.tipoInteresService.update(id, updateTipoInteresDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tipoInteresService.remove(id);
  }
}
