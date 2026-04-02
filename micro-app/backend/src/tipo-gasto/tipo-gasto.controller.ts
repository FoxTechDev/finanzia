import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TipoGastoService } from './tipo-gasto.service';
import { CreateTipoGastoDto } from './dto/create-tipo-gasto.dto';
import { UpdateTipoGastoDto } from './dto/update-tipo-gasto.dto';

@Controller('tipo-gasto')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TipoGastoController {
  constructor(private readonly tipoGastoService: TipoGastoService) {}

  @Post()
  create(@Body() createTipoGastoDto: CreateTipoGastoDto) {
    return this.tipoGastoService.create(createTipoGastoDto);
  }

  @Get()
  findAll() {
    return this.tipoGastoService.findAll();
  }

  @Get('activos')
  findActive() {
    return this.tipoGastoService.findActive();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoGastoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoGastoDto: UpdateTipoGastoDto,
  ) {
    return this.tipoGastoService.update(id, updateTipoGastoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tipoGastoService.remove(id);
  }
}
