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
  Query,
} from '@nestjs/common';
import { IngresoClienteService } from './ingreso-cliente.service';
import { CreateIngresoClienteDto } from './dto/create-ingreso-cliente.dto';
import { UpdateIngresoClienteDto } from './dto/update-ingreso-cliente.dto';

@Controller('ingreso-cliente')
export class IngresoClienteController {
  constructor(private readonly ingresoClienteService: IngresoClienteService) {}

  @Post()
  create(@Body() createIngresoClienteDto: CreateIngresoClienteDto) {
    return this.ingresoClienteService.create(createIngresoClienteDto);
  }

  @Get()
  findAll(@Query('personaId', new ParseIntPipe({ optional: true })) personaId?: number) {
    if (personaId) {
      return this.ingresoClienteService.findByPersona(personaId);
    }
    return this.ingresoClienteService.findAll();
  }

  @Get('persona/:personaId')
  findByPersona(@Param('personaId', ParseIntPipe) personaId: number) {
    return this.ingresoClienteService.findByPersona(personaId);
  }

  @Get('persona/:personaId/total')
  getTotalByPersona(@Param('personaId', ParseIntPipe) personaId: number) {
    return this.ingresoClienteService.getTotalByPersona(personaId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ingresoClienteService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateIngresoClienteDto: UpdateIngresoClienteDto,
  ) {
    return this.ingresoClienteService.update(id, updateIngresoClienteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ingresoClienteService.remove(id);
  }
}
