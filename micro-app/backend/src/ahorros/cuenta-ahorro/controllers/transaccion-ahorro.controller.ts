import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { TransaccionAhorroService } from '../services/transaccion-ahorro.service';
import { DepositoAhorroDto, RetiroAhorroDto } from '../dto/transaccion-ahorro.dto';
import { CapitalizacionService } from '../services/capitalizacion.service';
import { ProvisionService } from '../services/provision.service';

@Controller('ahorros/cuentas')
export class TransaccionAhorroController {
  constructor(
    private readonly transService: TransaccionAhorroService,
    private readonly capitalizacionService: CapitalizacionService,
    private readonly provisionService: ProvisionService,
  ) {}

  @Post(':id/depositar')
  depositar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DepositoAhorroDto,
    @Request() req: any,
  ) {
    return this.transService.depositar(
      id,
      dto,
      req.user?.id,
      req.user?.firstName
        ? `${req.user.firstName} ${req.user.lastName || ''}`
        : undefined,
    );
  }

  @Post(':id/retirar')
  retirar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RetiroAhorroDto,
    @Request() req: any,
  ) {
    return this.transService.retirar(
      id,
      dto,
      req.user?.id,
      req.user?.firstName
        ? `${req.user.firstName} ${req.user.lastName || ''}`
        : undefined,
    );
  }

  @Post('capitalizacion/procesar')
  procesarCapitalizacion() {
    return this.capitalizacionService.procesarCapitalizacion();
  }

  @Post('provision/calcular')
  calcularProvision(@Body() body: { fecha?: string }) {
    return this.provisionService.calcularProvisionDiaria(body?.fecha);
  }
}
