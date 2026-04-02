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
import { SexoService } from './sexo.service';
import { CreateSexoDto } from './dto/create-sexo.dto';
import { UpdateSexoDto } from './dto/update-sexo.dto';

@Controller('catalogos/sexo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SexoController {
  constructor(private readonly sexoService: SexoService) {}

  @Post()
  create(@Body() createSexoDto: CreateSexoDto) {
    return this.sexoService.create(createSexoDto);
  }

  @Get()
  findAll() {
    return this.sexoService.findAll();
  }

  @Get('activos')
  findActivos() {
    return this.sexoService.findActivos();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sexoService.findOne(id);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.sexoService.findByCodigo(codigo);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSexoDto: UpdateSexoDto,
  ) {
    return this.sexoService.update(id, updateSexoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sexoService.remove(id);
  }
}
