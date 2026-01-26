import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { LineaCreditoService } from './linea-credito.service';
import { CreateLineaCreditoDto } from './dto/create-linea-credito.dto';
import { UpdateLineaCreditoDto } from './dto/update-linea-credito.dto';

@Controller('lineas-credito')
export class LineaCreditoController {
  constructor(private readonly lineaCreditoService: LineaCreditoService) {}

  @Post()
  create(@Body() createDto: CreateLineaCreditoDto) {
    return this.lineaCreditoService.create(createDto);
  }

  @Get()
  findAll(@Query('activo') activo?: string) {
    if (activo === 'true') {
      return this.lineaCreditoService.findAllActive();
    }
    return this.lineaCreditoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lineaCreditoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateLineaCreditoDto,
  ) {
    return this.lineaCreditoService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lineaCreditoService.remove(id);
  }
}
