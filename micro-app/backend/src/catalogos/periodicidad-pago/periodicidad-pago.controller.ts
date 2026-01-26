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
import { PeriodicidadPagoService } from './periodicidad-pago.service';
import { CreatePeriodicidadPagoDto } from './dto/create-periodicidad-pago.dto';
import { UpdatePeriodicidadPagoDto } from './dto/update-periodicidad-pago.dto';

@Controller('catalogos/periodicidad-pago')
export class PeriodicidadPagoController {
  constructor(private readonly periodicidadPagoService: PeriodicidadPagoService) {}

  @Post()
  create(@Body() createPeriodicidadPagoDto: CreatePeriodicidadPagoDto) {
    return this.periodicidadPagoService.create(createPeriodicidadPagoDto);
  }

  @Get()
  findAll() {
    return this.periodicidadPagoService.findAll();
  }

  @Get('activos')
  findActivos() {
    return this.periodicidadPagoService.findActivos();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.periodicidadPagoService.findOne(id);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.periodicidadPagoService.findByCodigo(codigo);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePeriodicidadPagoDto: UpdatePeriodicidadPagoDto,
  ) {
    return this.periodicidadPagoService.update(id, updatePeriodicidadPagoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.periodicidadPagoService.remove(id);
  }
}
