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
import { TipoPagoService } from './tipo-pago.service';
import { CreateTipoPagoDto } from './dto/create-tipo-pago.dto';
import { UpdateTipoPagoDto } from './dto/update-tipo-pago.dto';

@Controller('catalogos/tipo-pago')
export class TipoPagoController {
  constructor(private readonly tipoPagoService: TipoPagoService) {}

  @Post()
  create(@Body() createTipoPagoDto: CreateTipoPagoDto) {
    return this.tipoPagoService.create(createTipoPagoDto);
  }

  @Get()
  findAll() {
    return this.tipoPagoService.findAll();
  }

  @Get('activos')
  findActivos() {
    return this.tipoPagoService.findActivos();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoPagoService.findOne(id);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.tipoPagoService.findByCodigo(codigo);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoPagoDto: UpdateTipoPagoDto,
  ) {
    return this.tipoPagoService.update(id, updateTipoPagoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tipoPagoService.remove(id);
  }
}
