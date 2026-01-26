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
import { DestinoCreditoService } from './destino-credito.service';
import { CreateDestinoCreditoDto } from './dto/create-destino-credito.dto';
import { UpdateDestinoCreditoDto } from './dto/update-destino-credito.dto';

@Controller('catalogos/destino-credito')
export class DestinoCreditoController {
  constructor(private readonly destinoCreditoService: DestinoCreditoService) {}

  @Post()
  create(@Body() createDestinoCreditoDto: CreateDestinoCreditoDto) {
    return this.destinoCreditoService.create(createDestinoCreditoDto);
  }

  @Get()
  findAll() {
    return this.destinoCreditoService.findAll();
  }

  @Get('activos')
  findActivos() {
    return this.destinoCreditoService.findActivos();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.destinoCreditoService.findOne(id);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.destinoCreditoService.findByCodigo(codigo);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDestinoCreditoDto: UpdateDestinoCreditoDto,
  ) {
    return this.destinoCreditoService.update(id, updateDestinoCreditoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.destinoCreditoService.remove(id);
  }
}
