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
import { EstadoPagoService } from './estado-pago.service';
import { CreateEstadoPagoDto } from './dto/create-estado-pago.dto';
import { UpdateEstadoPagoDto } from './dto/update-estado-pago.dto';

@Controller('catalogos/estado-pago')
export class EstadoPagoController {
  constructor(private readonly estadoPagoService: EstadoPagoService) {}

  @Post()
  create(@Body() createEstadoPagoDto: CreateEstadoPagoDto) {
    return this.estadoPagoService.create(createEstadoPagoDto);
  }

  @Get()
  findAll() {
    return this.estadoPagoService.findAll();
  }

  @Get('activos')
  findActivos() {
    return this.estadoPagoService.findActivos();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.estadoPagoService.findOne(id);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.estadoPagoService.findByCodigo(codigo);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstadoPagoDto: UpdateEstadoPagoDto,
  ) {
    return this.estadoPagoService.update(id, updateEstadoPagoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.estadoPagoService.remove(id);
  }
}
