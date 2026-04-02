import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { EstadoGarantiaService } from './estado-garantia.service';
import { CreateEstadoGarantiaDto } from './dto/create-estado-garantia.dto';
import { UpdateEstadoGarantiaDto } from './dto/update-estado-garantia.dto';

@Controller('catalogos/estado-garantia')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EstadoGarantiaController {
  constructor(private readonly estadoGarantiaService: EstadoGarantiaService) {}

  @Post()
  create(@Body() createEstadoGarantiaDto: CreateEstadoGarantiaDto) {
    return this.estadoGarantiaService.create(createEstadoGarantiaDto);
  }

  @Get()
  findAll() {
    return this.estadoGarantiaService.findAll();
  }

  @Get('activos')
  findActivos() {
    return this.estadoGarantiaService.findActivos();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.estadoGarantiaService.findOne(id);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.estadoGarantiaService.findByCodigo(codigo);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstadoGarantiaDto: UpdateEstadoGarantiaDto,
  ) {
    return this.estadoGarantiaService.update(id, updateEstadoGarantiaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.estadoGarantiaService.remove(id);
  }
}
