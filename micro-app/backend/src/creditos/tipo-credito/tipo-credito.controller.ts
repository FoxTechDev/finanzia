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
import { TipoCreditoService } from './tipo-credito.service';
import { CreateTipoCreditoDto } from './dto/create-tipo-credito.dto';
import { UpdateTipoCreditoDto } from './dto/update-tipo-credito.dto';

@Controller('tipos-credito')
export class TipoCreditoController {
  constructor(private readonly tipoCreditoService: TipoCreditoService) {}

  @Post()
  create(@Body() createDto: CreateTipoCreditoDto) {
    return this.tipoCreditoService.create(createDto);
  }

  @Get()
  findAll(
    @Query('lineaCreditoId') lineaCreditoId?: string,
    @Query('activo') activo?: string,
  ) {
    const lineaId = lineaCreditoId ? parseInt(lineaCreditoId) : undefined;

    if (activo === 'true') {
      return this.tipoCreditoService.findAllActive(lineaId);
    }
    return this.tipoCreditoService.findAll(lineaId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoCreditoService.findOne(id);
  }

  @Post(':id/validar')
  validarParametros(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { monto: number; plazo: number; tasaInteres: number },
  ) {
    return this.tipoCreditoService.validarParametros(
      id,
      body.monto,
      body.plazo,
      body.tasaInteres,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTipoCreditoDto,
  ) {
    return this.tipoCreditoService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tipoCreditoService.remove(id);
  }
}
