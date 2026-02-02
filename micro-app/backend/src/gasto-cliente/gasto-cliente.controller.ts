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
import { GastoClienteService } from './gasto-cliente.service';
import { CreateGastoClienteDto } from './dto/create-gasto-cliente.dto';
import { UpdateGastoClienteDto } from './dto/update-gasto-cliente.dto';

@Controller('gasto-cliente')
export class GastoClienteController {
  constructor(private readonly gastoClienteService: GastoClienteService) {}

  @Post()
  create(@Body() createGastoClienteDto: CreateGastoClienteDto) {
    return this.gastoClienteService.create(createGastoClienteDto);
  }

  @Get()
  findAll(@Query('personaId', new ParseIntPipe({ optional: true })) personaId?: number) {
    if (personaId) {
      return this.gastoClienteService.findByPersona(personaId);
    }
    return this.gastoClienteService.findAll();
  }

  @Get('persona/:personaId')
  findByPersona(@Param('personaId', ParseIntPipe) personaId: number) {
    return this.gastoClienteService.findByPersona(personaId);
  }

  @Get('persona/:personaId/total')
  getTotalByPersona(@Param('personaId', ParseIntPipe) personaId: number) {
    return this.gastoClienteService.getTotalByPersona(personaId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gastoClienteService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGastoClienteDto: UpdateGastoClienteDto,
  ) {
    return this.gastoClienteService.update(id, updateGastoClienteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gastoClienteService.remove(id);
  }
}
