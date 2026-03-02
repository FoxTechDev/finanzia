import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BancoService } from './banco.service';
import { CreateBancoDto } from './dto/create-banco.dto';
import { UpdateBancoDto } from './dto/update-banco.dto';

@Controller('bancos')
export class BancoController {
  constructor(private readonly bancoService: BancoService) {}

  @Get()
  findAll(@Query('activo') activo?: string) {
    // Convertir el query param string a boolean si está presente
    let activoFilter: boolean | undefined;
    if (activo === 'true') activoFilter = true;
    else if (activo === 'false') activoFilter = false;

    return this.bancoService.findAll(activoFilter);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bancoService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBancoDto) {
    return this.bancoService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBancoDto) {
    return this.bancoService.update(id, dto);
  }
}
