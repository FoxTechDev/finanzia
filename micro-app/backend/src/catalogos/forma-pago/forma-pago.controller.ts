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
import { FormaPagoService } from './forma-pago.service';
import { CreateFormaPagoDto } from './dto/create-forma-pago.dto';
import { UpdateFormaPagoDto } from './dto/update-forma-pago.dto';

@Controller('catalogos/forma-pago')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FormaPagoController {
  constructor(private readonly formaPagoService: FormaPagoService) {}

  @Post()
  create(@Body() dto: CreateFormaPagoDto) {
    return this.formaPagoService.create(dto);
  }

  @Get()
  findAll() {
    return this.formaPagoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.formaPagoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFormaPagoDto) {
    return this.formaPagoService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.formaPagoService.remove(id);
  }
}
