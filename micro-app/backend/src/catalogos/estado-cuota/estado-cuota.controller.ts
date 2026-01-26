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
import { EstadoCuotaService } from './estado-cuota.service';
import { CreateEstadoCuotaDto } from './dto/create-estado-cuota.dto';
import { UpdateEstadoCuotaDto } from './dto/update-estado-cuota.dto';

@Controller('catalogos/estado-cuota')
export class EstadoCuotaController {
  constructor(private readonly estadoCuotaService: EstadoCuotaService) {}

  @Post()
  create(@Body() createEstadoCuotaDto: CreateEstadoCuotaDto) {
    return this.estadoCuotaService.create(createEstadoCuotaDto);
  }

  @Get()
  findAll() {
    return this.estadoCuotaService.findAll();
  }

  @Get('activos')
  findActivos() {
    return this.estadoCuotaService.findActivos();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.estadoCuotaService.findOne(id);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.estadoCuotaService.findByCodigo(codigo);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstadoCuotaDto: UpdateEstadoCuotaDto,
  ) {
    return this.estadoCuotaService.update(id, updateEstadoCuotaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.estadoCuotaService.remove(id);
  }
}
