# Implementación del Endpoint de Recibo en el Backend

Este documento proporciona una guía de implementación del endpoint `/api/pagos/:id/recibo` en NestJS.

## Endpoint Requerido

```typescript
GET /api/pagos/:id/recibo
```

## Implementación en el Controller

Agregar este método al archivo `pago.controller.ts`:

```typescript
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PagoService } from '../services/pago.service';

@Controller('pagos')
export class PagoController {
  constructor(private readonly pagoService: PagoService) {}

  // ... otros métodos existentes ...

  /**
   * Obtiene los datos del recibo de un pago
   * GET /api/pagos/:id/recibo
   */
  @Get(':id/recibo')
  async getRecibo(@Param('id', ParseIntPipe) id: number) {
    return this.pagoService.getRecibo(id);
  }
}
```

## Implementación en el Service

Agregar este método al archivo `pago.service.ts`:

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from '../entities/pago.entity';

@Injectable()
export class PagoService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
  ) {}

  // ... otros métodos existentes ...

  /**
   * Obtiene los datos formateados del recibo de un pago
   */
  async getRecibo(id: number) {
    // Obtener el pago con todas las relaciones necesarias
    const pago = await this.pagoRepository.findOne({
      where: { id },
      relations: [
        'prestamo',
        'prestamo.persona',
        'prestamo.tipoCredito',
      ],
    });

    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    // Validar que el pago esté aplicado (no anulado)
    if (pago.estado === 'ANULADO') {
      throw new BadRequestException('No se puede generar recibo de un pago anulado');
    }

    // Construir la respuesta con el formato esperado por el frontend
    return {
      // Datos del recibo
      numeroPago: pago.numeroPago,
      fechaPago: pago.fechaPago,
      fechaImpresion: new Date().toISOString(),

      // Datos del cliente
      cliente: {
        nombre: pago.prestamo.persona.nombre,
        apellido: pago.prestamo.persona.apellido,
        numeroDui: pago.prestamo.persona.numeroDui,
      },

      // Datos del préstamo
      prestamo: {
        numeroCredito: pago.prestamo.numeroCredito,
        tipoCredito: pago.prestamo.tipoCredito.nombre,
      },

      // Detalle del pago
      montoPagado: pago.montoPagado,
      distribucion: {
        capitalAplicado: pago.capitalAplicado,
        interesAplicado: pago.interesAplicado,
        recargosAplicado: pago.recargosAplicado,
        interesMoratorioAplicado: pago.interesMoratorioAplicado,
      },

      // Saldos
      saldoAnterior: pago.saldoCapitalAnterior + pago.saldoInteresAnterior,
      saldoActual: pago.saldoCapitalPosterior + pago.saldoInteresPosterior,

      // Información del usuario
      nombreUsuario: pago.nombreUsuario || 'Sistema',
    };
  }
}
```

## DTO de Respuesta (Opcional)

Crear un DTO para tipar la respuesta en `dto/recibo-data.dto.ts`:

```typescript
export class ReciboDataDto {
  numeroPago: string;
  fechaPago: string;
  fechaImpresion: string;

  cliente: {
    nombre: string;
    apellido: string;
    numeroDui: string;
  };

  prestamo: {
    numeroCredito: string;
    tipoCredito: string;
  };

  montoPagado: number;
  distribucion: {
    capitalAplicado: number;
    interesAplicado: number;
    recargosAplicado: number;
    interesMoratorioAplicado: number;
  };

  saldoAnterior: number;
  saldoActual: number;
  nombreUsuario: string;
}
```

Usar el DTO en el controller:

```typescript
@Get(':id/recibo')
async getRecibo(@Param('id', ParseIntPipe) id: number): Promise<ReciboDataDto> {
  return this.pagoService.getRecibo(id);
}
```

## Validaciones Adicionales

Agregar validaciones según las reglas de negocio:

```typescript
async getRecibo(id: number): Promise<ReciboDataDto> {
  const pago = await this.pagoRepository.findOne({
    where: { id },
    relations: ['prestamo', 'prestamo.persona', 'prestamo.tipoCredito'],
  });

  if (!pago) {
    throw new NotFoundException(`Pago con ID ${id} no encontrado`);
  }

  // Validar que el pago esté aplicado
  if (pago.estado === 'ANULADO') {
    throw new BadRequestException('No se puede generar recibo de un pago anulado');
  }

  // Validar permisos si es necesario
  // Por ejemplo, validar que el usuario tenga acceso al préstamo
  // this.validateAccess(user, pago.prestamo);

  // Construir y retornar la respuesta
  return this.buildReciboData(pago);
}

private buildReciboData(pago: Pago): ReciboDataDto {
  return {
    numeroPago: pago.numeroPago,
    fechaPago: pago.fechaPago,
    fechaImpresion: new Date().toISOString(),
    cliente: {
      nombre: pago.prestamo.persona.nombre,
      apellido: pago.prestamo.persona.apellido,
      numeroDui: pago.prestamo.persona.numeroDui,
    },
    prestamo: {
      numeroCredito: pago.prestamo.numeroCredito,
      tipoCredito: pago.prestamo.tipoCredito.nombre,
    },
    montoPagado: pago.montoPagado,
    distribucion: {
      capitalAplicado: pago.capitalAplicado,
      interesAplicado: pago.interesAplicado,
      recargosAplicado: pago.recargosAplicado,
      interesMoratorioAplicado: pago.interesMoratorioAplicado,
    },
    saldoAnterior: pago.saldoCapitalAnterior + pago.saldoInteresAnterior,
    saldoActual: pago.saldoCapitalPosterior + pago.saldoInteresPosterior,
    nombreUsuario: pago.nombreUsuario || 'Sistema',
  };
}
```

## Testing

Ejemplo de test para el endpoint:

```typescript
describe('PagoController', () => {
  describe('getRecibo', () => {
    it('debe retornar los datos del recibo correctamente', async () => {
      const pagoId = 1;
      const mockRecibo = {
        numeroPago: 'PAG2026000001',
        fechaPago: '2026-01-23',
        fechaImpresion: '2026-01-23T16:30:45.000Z',
        cliente: {
          nombre: 'Juan',
          apellido: 'Pérez',
          numeroDui: '12345678-9',
        },
        prestamo: {
          numeroCredito: 'CRE-2026-0001',
          tipoCredito: 'Crédito Personal',
        },
        montoPagado: 500.00,
        distribucion: {
          capitalAplicado: 400.00,
          interesAplicado: 80.00,
          recargosAplicado: 10.00,
          interesMoratorioAplicado: 10.00,
        },
        saldoAnterior: 2500.00,
        saldoActual: 2100.00,
        nombreUsuario: 'admin',
      };

      jest.spyOn(pagoService, 'getRecibo').mockResolvedValue(mockRecibo);

      const result = await controller.getRecibo(pagoId);

      expect(result).toEqual(mockRecibo);
      expect(pagoService.getRecibo).toHaveBeenCalledWith(pagoId);
    });

    it('debe lanzar NotFoundException si el pago no existe', async () => {
      jest.spyOn(pagoService, 'getRecibo').mockRejectedValue(
        new NotFoundException('Pago con ID 999 no encontrado')
      );

      await expect(controller.getRecibo(999)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si el pago está anulado', async () => {
      jest.spyOn(pagoService, 'getRecibo').mockRejectedValue(
        new BadRequestException('No se puede generar recibo de un pago anulado')
      );

      await expect(controller.getRecibo(1)).rejects.toThrow(BadRequestException);
    });
  });
});
```

## Consideraciones de Seguridad

1. **Autenticación**: Asegurar que el endpoint requiera autenticación:
   ```typescript
   @UseGuards(JwtAuthGuard)
   @Get(':id/recibo')
   ```

2. **Autorización**: Validar que el usuario tenga permisos para ver el recibo:
   ```typescript
   @UseGuards(JwtAuthGuard, PermissionsGuard)
   @RequirePermissions('pagos:read')
   @Get(':id/recibo')
   ```

3. **Rate Limiting**: Implementar límite de solicitudes para evitar abuso:
   ```typescript
   @UseGuards(ThrottlerGuard)
   @Throttle(10, 60) // 10 requests por minuto
   @Get(':id/recibo')
   ```

4. **Auditoría**: Registrar las generaciones de recibos:
   ```typescript
   async getRecibo(id: number, user: User) {
     // ... lógica existente ...

     await this.auditService.log({
       action: 'GENERAR_RECIBO',
       entity: 'Pago',
       entityId: id,
       userId: user.id,
       details: { numeroPago: pago.numeroPago },
     });

     return reciboData;
   }
   ```

## Optimizaciones

1. **Caché**: Implementar caché para recibos generados recientemente:
   ```typescript
   @UseInterceptors(CacheInterceptor)
   @CacheTTL(300) // 5 minutos
   @Get(':id/recibo')
   ```

2. **Query Optimization**: Usar select específico para reducir datos:
   ```typescript
   const pago = await this.pagoRepository
     .createQueryBuilder('pago')
     .leftJoinAndSelect('pago.prestamo', 'prestamo')
     .leftJoinAndSelect('prestamo.persona', 'persona')
     .leftJoinAndSelect('prestamo.tipoCredito', 'tipoCredito')
     .select([
       'pago.id',
       'pago.numeroPago',
       'pago.fechaPago',
       // ... otros campos necesarios
     ])
     .where('pago.id = :id', { id })
     .getOne();
   ```

## Documentación con Swagger

Agregar decoradores de Swagger para documentar el endpoint:

```typescript
@ApiTags('Pagos')
@Controller('pagos')
export class PagoController {
  @Get(':id/recibo')
  @ApiOperation({ summary: 'Obtener datos del recibo de un pago' })
  @ApiParam({ name: 'id', description: 'ID del pago', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Datos del recibo obtenidos exitosamente',
    type: ReciboDataDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Pago no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede generar recibo de un pago anulado',
  })
  async getRecibo(@Param('id', ParseIntPipe) id: number) {
    return this.pagoService.getRecibo(id);
  }
}
```

## Ejemplo de Respuesta

```json
{
  "numeroPago": "PAG2026000001",
  "fechaPago": "2026-01-23",
  "fechaImpresion": "2026-01-23T16:30:45.123Z",
  "cliente": {
    "nombre": "Juan",
    "apellido": "Pérez García",
    "numeroDui": "12345678-9"
  },
  "prestamo": {
    "numeroCredito": "CRE-2026-0001",
    "tipoCredito": "Crédito Personal"
  },
  "montoPagado": 500.00,
  "distribucion": {
    "capitalAplicado": 400.00,
    "interesAplicado": 80.00,
    "recargosAplicado": 10.00,
    "interesMoratorioAplicado": 10.00
  },
  "saldoAnterior": 2500.00,
  "saldoActual": 2100.00,
  "nombreUsuario": "admin"
}
```

## Próximos Pasos

1. Implementar el endpoint en el backend según esta guía
2. Probar el endpoint con Postman o similar
3. Verificar que el frontend pueda consumir correctamente el endpoint
4. Realizar pruebas de impresión con impresoras térmicas reales
5. Ajustar formato según necesidades específicas de la empresa
