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
import { TipoDecisionComiteService } from './tipo-decision-comite.service';
import { CreateTipoDecisionComiteDto } from './dto/create-tipo-decision-comite.dto';
import { UpdateTipoDecisionComiteDto } from './dto/update-tipo-decision-comite.dto';

@Controller('catalogos/tipo-decision-comite')
export class TipoDecisionComiteController {
  constructor(private readonly tipoDecisionComiteService: TipoDecisionComiteService) {}

  @Post()
  create(@Body() createTipoDecisionComiteDto: CreateTipoDecisionComiteDto) {
    return this.tipoDecisionComiteService.create(createTipoDecisionComiteDto);
  }

  @Get()
  findAll() {
    return this.tipoDecisionComiteService.findAll();
  }

  @Get('activos')
  findActivos() {
    return this.tipoDecisionComiteService.findActivos();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoDecisionComiteService.findOne(id);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.tipoDecisionComiteService.findByCodigo(codigo);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoDecisionComiteDto: UpdateTipoDecisionComiteDto,
  ) {
    return this.tipoDecisionComiteService.update(id, updateTipoDecisionComiteDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tipoDecisionComiteService.remove(id);
  }
}
