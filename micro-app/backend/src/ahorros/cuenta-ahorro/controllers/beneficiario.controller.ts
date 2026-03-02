import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { BeneficiarioService } from '../services/beneficiario.service';
import {
  CreateBeneficiarioDto,
  UpdateBeneficiarioDto,
} from '../dto/beneficiario.dto';

@Controller('ahorros/cuentas/:cuentaId/beneficiarios')
export class BeneficiarioController {
  constructor(private readonly service: BeneficiarioService) {}

  @Get()
  findAll(@Param('cuentaId', ParseIntPipe) cuentaId: number) {
    return this.service.findByCuenta(cuentaId);
  }

  @Post()
  create(
    @Param('cuentaId', ParseIntPipe) cuentaId: number,
    @Body() dto: CreateBeneficiarioDto,
  ) {
    return this.service.create(cuentaId, dto);
  }

  @Post('bulk')
  createBulk(
    @Param('cuentaId', ParseIntPipe) cuentaId: number,
    @Body() dtos: CreateBeneficiarioDto[],
  ) {
    return this.service.createBulk(cuentaId, dtos);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBeneficiarioDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
