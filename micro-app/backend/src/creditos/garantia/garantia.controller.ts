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
import { GarantiaService } from './garantia.service';
import { CreateGarantiaDto } from './dto/create-garantia.dto';
import { UpdateGarantiaDto } from './dto/update-garantia.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('garantias')
@UseGuards(JwtAuthGuard)
export class GarantiaController {
  constructor(private readonly garantiaService: GarantiaService) {}

  @Post()
  create(@Body() createGarantiaDto: CreateGarantiaDto) {
    return this.garantiaService.create(createGarantiaDto);
  }

  @Get()
  findAll() {
    return this.garantiaService.findAll();
  }

  @Get('solicitud/:solicitudId')
  findBySolicitud(@Param('solicitudId', ParseIntPipe) solicitudId: number) {
    return this.garantiaService.findBySolicitud(solicitudId);
  }

  @Get('solicitud/:solicitudId/cobertura')
  calcularCobertura(@Param('solicitudId', ParseIntPipe) solicitudId: number) {
    return this.garantiaService.calcularCobertura(solicitudId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.garantiaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGarantiaDto: UpdateGarantiaDto,
  ) {
    return this.garantiaService.update(id, updateGarantiaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.garantiaService.remove(id);
  }
}
