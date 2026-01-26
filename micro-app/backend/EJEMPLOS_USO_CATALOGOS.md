# Ejemplos Prácticos de Uso de Catálogos

Este documento proporciona ejemplos concretos de cómo usar los catálogos en diferentes partes del código.

## 1. En Servicios

### Ejemplo 1: Crear una Solicitud con Estados de Catálogo

```typescript
// solicitud.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Solicitud } from './entities/solicitud.entity';
import { EstadoSolicitudService } from '../../catalogos/estado-solicitud/estado-solicitud.service';
import { DestinoCreditoService } from '../../catalogos/destino-credito/destino-credito.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';

@Injectable()
export class SolicitudService {
  constructor(
    @InjectRepository(Solicitud)
    private readonly solicitudRepository: Repository<Solicitud>,
    private readonly estadoSolicitudService: EstadoSolicitudService,
    private readonly destinoCreditoService: DestinoCreditoService,
  ) {}

  async create(createSolicitudDto: CreateSolicitudDto): Promise<Solicitud> {
    // Obtener el estado inicial por código
    const estadoCreada = await this.estadoSolicitudService.findByCodigo('CREADA');

    // Validar que el destino de crédito existe
    const destinoCredito = await this.destinoCreditoService.findOne(
      createSolicitudDto.destinoCreditoId
    );

    // Crear la solicitud con el ID del catálogo
    const solicitud = this.solicitudRepository.create({
      ...createSolicitudDto,
      estadoSolicitudId: estadoCreada.id,
      fechaSolicitud: new Date(),
    });

    return await this.solicitudRepository.save(solicitud);
  }

  async aprobar(id: number): Promise<Solicitud> {
    const solicitud = await this.findOne(id);
    const estadoAprobada = await this.estadoSolicitudService.findByCodigo('APROBADA');

    solicitud.estadoSolicitudId = estadoAprobada.id;
    solicitud.fechaAprobacion = new Date();

    return await this.solicitudRepository.save(solicitud);
  }

  async trasladarAComite(id: number): Promise<Solicitud> {
    const solicitud = await this.findOne(id);
    const estadoPendienteComite = await this.estadoSolicitudService
      .findByCodigo('PENDIENTE_COMITE');

    solicitud.estadoSolicitudId = estadoPendienteComite.id;
    solicitud.fechaTrasladoComite = new Date();

    return await this.solicitudRepository.save(solicitud);
  }

  async findOne(id: number): Promise<Solicitud> {
    return await this.solicitudRepository.findOne({
      where: { id },
      relations: [
        'estadoSolicitud',
        'destinoCredito',
        'recomendacionAsesor',
        'persona',
        'lineaCredito',
        'tipoCredito',
      ],
    });
  }
}
```

### Ejemplo 2: Registrar un Pago

```typescript
// pago.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from './entities/pago.entity';
import { TipoPagoService } from '../../catalogos/tipo-pago/tipo-pago.service';
import { EstadoPagoService } from '../../catalogos/estado-pago/estado-pago.service';
import { CreatePagoDto } from './dto/create-pago.dto';

@Injectable()
export class PagoService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    private readonly tipoPagoService: TipoPagoService,
    private readonly estadoPagoService: EstadoPagoService,
  ) {}

  async registrarPago(createPagoDto: CreatePagoDto): Promise<Pago> {
    // Determinar el tipo de pago según el monto
    const prestamo = await this.prestamoService.findOne(createPagoDto.prestamoId);
    let tipoPagoCodigo: string;

    if (createPagoDto.montoPagado >= prestamo.saldoCapital + prestamo.saldoInteres) {
      tipoPagoCodigo = 'CANCELACION_TOTAL';
    } else if (createPagoDto.montoPagado >= prestamo.cuotaNormal) {
      tipoPagoCodigo = 'CUOTA_COMPLETA';
    } else {
      tipoPagoCodigo = 'PAGO_PARCIAL';
    }

    const tipoPago = await this.tipoPagoService.findByCodigo(tipoPagoCodigo);
    const estadoAplicado = await this.estadoPagoService.findByCodigo('APLICADO');

    const pago = this.pagoRepository.create({
      ...createPagoDto,
      tipoPagoId: tipoPago.id,
      estadoPagoId: estadoAplicado.id,
      numeroPago: await this.generarNumeroPago(),
      fechaRegistro: new Date(),
    });

    return await this.pagoRepository.save(pago);
  }

  async anularPago(id: number, motivo: string, usuarioId: number): Promise<Pago> {
    const pago = await this.findOne(id);
    const estadoAnulado = await this.estadoPagoService.findByCodigo('ANULADO');

    pago.estadoPagoId = estadoAnulado.id;
    pago.fechaAnulacion = new Date();
    pago.motivoAnulacion = motivo;
    pago.usuarioAnulacionId = usuarioId;

    // Revertir el pago en el préstamo
    await this.revertirPago(pago);

    return await this.pagoRepository.save(pago);
  }
}
```

### Ejemplo 3: Crear Préstamo con Catálogos

```typescript
// prestamo.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prestamo } from './entities/prestamo.entity';
import { TipoInteresService } from '../../catalogos/tipo-interes/tipo-interes.service';
import { PeriodicidadPagoService } from '../../catalogos/periodicidad-pago/periodicidad-pago.service';
import { CategoriaNcb022Service } from '../../catalogos/categoria-ncb022/categoria-ncb022.service';

@Injectable()
export class PrestamoService {
  constructor(
    @InjectRepository(Prestamo)
    private readonly prestamoRepository: Repository<Prestamo>,
    private readonly tipoInteresService: TipoInteresService,
    private readonly periodicidadPagoService: PeriodicidadPagoService,
    private readonly categoriaNcb022Service: CategoriaNcb022Service,
  ) {}

  async create(createPrestamoDto: CreatePrestamoDto): Promise<Prestamo> {
    // Obtener catálogos por código
    const tipoInteres = await this.tipoInteresService.findByCodigo('FLAT');
    const periodicidad = await this.periodicidadPagoService.findByCodigo('MENSUAL');
    const categoriaA = await this.categoriaNcb022Service.findByCodigo('A');

    const prestamo = this.prestamoRepository.create({
      ...createPrestamoDto,
      tipoInteresId: tipoInteres.id,
      periodicidadPagoId: periodicidad.id,
      categoriaNcb022Id: categoriaA.id,
      numeroCredito: await this.generarNumeroCredito(),
      fechaOtorgamiento: new Date(),
      saldoCapital: createPrestamoDto.montoDesembolsado,
    });

    return await this.prestamoRepository.save(prestamo);
  }

  async actualizarCategoria(prestamoId: number): Promise<void> {
    const prestamo = await this.findOne(prestamoId);

    let codigoCategoria: string;
    if (prestamo.diasMora === 0) {
      codigoCategoria = 'A';
    } else if (prestamo.diasMora <= 30) {
      codigoCategoria = 'A';
    } else if (prestamo.diasMora <= 60) {
      codigoCategoria = 'B';
    } else if (prestamo.diasMora <= 90) {
      codigoCategoria = 'C';
    } else if (prestamo.diasMora <= 120) {
      codigoCategoria = 'D';
    } else {
      codigoCategoria = 'E';
    }

    const categoria = await this.categoriaNcb022Service.findByCodigo(codigoCategoria);
    prestamo.categoriaNcb022Id = categoria.id;

    await this.prestamoRepository.save(prestamo);
  }
}
```

## 2. En Controllers

### Ejemplo: Controller con Validación de Catálogo

```typescript
// solicitud.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { SolicitudService } from './solicitud.service';
import { EstadoSolicitudService } from '../../catalogos/estado-solicitud/estado-solicitud.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';

@Controller('creditos/solicitud')
export class SolicitudController {
  constructor(
    private readonly solicitudService: SolicitudService,
    private readonly estadoSolicitudService: EstadoSolicitudService,
  ) {}

  @Post()
  async create(@Body() createSolicitudDto: CreateSolicitudDto) {
    return await this.solicitudService.create(createSolicitudDto);
  }

  // Obtener solicitudes por estado
  @Get('por-estado/:estadoCodigo')
  async findByEstado(@Param('estadoCodigo') estadoCodigo: string) {
    const estado = await this.estadoSolicitudService.findByCodigo(estadoCodigo);
    return await this.solicitudService.findByEstadoId(estado.id);
  }

  // Cambiar estado de solicitud
  @Post(':id/cambiar-estado')
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estadoCodigo') estadoCodigo: string,
  ) {
    const estado = await this.estadoSolicitudService.findByCodigo(estadoCodigo);
    return await this.solicitudService.cambiarEstado(id, estado.id);
  }

  // Endpoint para obtener estadísticas por estado
  @Get('estadisticas')
  async getEstadisticas() {
    const estados = await this.estadoSolicitudService.findActivos();

    const estadisticas = await Promise.all(
      estados.map(async (estado) => ({
        estado: estado.nombre,
        codigo: estado.codigo,
        color: estado.color,
        cantidad: await this.solicitudService.countByEstadoId(estado.id),
      }))
    );

    return estadisticas;
  }
}
```

## 3. En DTOs

### Ejemplo: DTOs con Validación de Catálogos

```typescript
// create-solicitud.dto.ts
import {
  IsNumber,
  IsString,
  IsDecimal,
  IsOptional,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export class CreateSolicitudDto {
  @IsNumber()
  personaId: number;

  @IsNumber()
  lineaCreditoId: number;

  @IsNumber()
  tipoCreditoId: number;

  @IsDecimal()
  @Min(100)
  montoSolicitado: number;

  @IsNumber()
  @Min(1)
  @Max(360)
  plazoSolicitado: number;

  @IsDecimal()
  @Min(0)
  @Max(100)
  tasaInteresPropuesta: number;

  // ID del catálogo de destino de crédito
  @IsNumber()
  destinoCreditoId: number;

  @IsOptional()
  @IsString()
  descripcionDestino?: string;

  @IsDateString()
  fechaSolicitud: string;

  // El estado se asigna automáticamente en el servicio (CREADA)
  // No se envía en el DTO
}
```

```typescript
// create-pago.dto.ts
import {
  IsNumber,
  IsDateString,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePagoDto {
  @IsNumber()
  prestamoId: number;

  @IsDateString()
  fechaPago: string;

  @IsNumber()
  @Min(0.01)
  montoPagado: number;

  // Opcional: si no se envía, se calcula automáticamente en el servicio
  @IsOptional()
  @IsNumber()
  tipoPagoId?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  // El estado siempre es APLICADO al crear
  // estadoPagoId se asigna automáticamente
}
```

## 4. En Queries Personalizadas

### Ejemplo: Consultas con Joins a Catálogos

```typescript
// solicitud.service.ts (continuación)

async findWithFilters(filters: SolicitudFilterDto): Promise<Solicitud[]> {
  const query = this.solicitudRepository
    .createQueryBuilder('solicitud')
    .leftJoinAndSelect('solicitud.estadoSolicitud', 'estado')
    .leftJoinAndSelect('solicitud.destinoCredito', 'destino')
    .leftJoinAndSelect('solicitud.persona', 'persona');

  // Filtrar por código de estado
  if (filters.estadoCodigo) {
    query.andWhere('estado.codigo = :estadoCodigo', {
      estadoCodigo: filters.estadoCodigo,
    });
  }

  // Filtrar por múltiples estados
  if (filters.estadoCodigos && filters.estadoCodigos.length > 0) {
    query.andWhere('estado.codigo IN (:...estadoCodigos)', {
      estadoCodigos: filters.estadoCodigos,
    });
  }

  // Filtrar por destino de crédito
  if (filters.destinoCodigo) {
    query.andWhere('destino.codigo = :destinoCodigo', {
      destinoCodigo: filters.destinoCodigo,
    });
  }

  // Ordenar por estado (usando el orden del catálogo)
  query.orderBy('estado.orden', 'ASC');
  query.addOrderBy('solicitud.fechaSolicitud', 'DESC');

  return await query.getMany();
}

async countByEstado(): Promise<any[]> {
  return await this.solicitudRepository
    .createQueryBuilder('solicitud')
    .select('estado.nombre', 'estadoNombre')
    .addSelect('estado.color', 'color')
    .addSelect('COUNT(solicitud.id)', 'cantidad')
    .leftJoin('solicitud.estadoSolicitud', 'estado')
    .groupBy('estado.id')
    .orderBy('estado.orden', 'ASC')
    .getRawMany();
}
```

## 5. En Reportes

### Ejemplo: Reporte de Cartera por Categoría NCB-022

```typescript
// reporte.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prestamo } from '../prestamo/entities/prestamo.entity';

@Injectable()
export class ReporteService {
  constructor(
    @InjectRepository(Prestamo)
    private readonly prestamoRepository: Repository<Prestamo>,
  ) {}

  async carteraPorCategoria(): Promise<any[]> {
    const resultado = await this.prestamoRepository
      .createQueryBuilder('prestamo')
      .select('categoria.nombre', 'categoria')
      .addSelect('categoria.codigo', 'codigo')
      .addSelect('categoria.color', 'color')
      .addSelect('COUNT(prestamo.id)', 'cantidadCreditos')
      .addSelect('SUM(prestamo.saldoCapital)', 'saldoTotal')
      .addSelect('AVG(prestamo.diasMora)', 'diasMoraPromedio')
      .leftJoin('prestamo.categoriaNcb022', 'categoria')
      .where('categoria.activo = :activo', { activo: true })
      .groupBy('categoria.id')
      .orderBy('categoria.orden', 'ASC')
      .getRawMany();

    return resultado.map(item => ({
      ...item,
      saldoTotal: parseFloat(item.saldoTotal || 0),
      diasMoraPromedio: parseFloat(item.diasMoraPromedio || 0),
    }));
  }

  async carteraPorTipoInteres(): Promise<any[]> {
    return await this.prestamoRepository
      .createQueryBuilder('prestamo')
      .select('tipo.nombre', 'tipoInteres')
      .addSelect('COUNT(prestamo.id)', 'cantidad')
      .addSelect('SUM(prestamo.montoDesembolsado)', 'montoDesembolsado')
      .addSelect('SUM(prestamo.saldoCapital)', 'saldoActual')
      .leftJoin('prestamo.tipoInteres', 'tipo')
      .where('tipo.activo = :activo', { activo: true })
      .groupBy('tipo.id')
      .getRawMany();
  }
}
```

## 6. En Seeders/Fixtures

### Ejemplo: Crear Datos de Prueba con Catálogos

```typescript
// test-data.seed.ts
import { DataSource } from 'typeorm';

export async function seedTestData(dataSource: DataSource): Promise<void> {
  const solicitudRepository = dataSource.getRepository('solicitud');
  const estadoRepository = dataSource.getRepository('estado_solicitud');
  const destinoRepository = dataSource.getRepository('destino_credito');

  // Obtener catálogos
  const estadoCreada = await estadoRepository.findOne({
    where: { codigo: 'CREADA' },
  });
  const destinoConsumo = await destinoRepository.findOne({
    where: { codigo: 'CONSUMO_PERSONAL' },
  });

  // Crear solicitudes de prueba
  const solicitudes = [];
  for (let i = 1; i <= 10; i++) {
    solicitudes.push({
      numeroSolicitud: `SOL2026${String(i).padStart(6, '0')}`,
      personaId: i,
      lineaCreditoId: 1,
      tipoCreditoId: 1,
      montoSolicitado: 5000 * i,
      plazoSolicitado: 12,
      tasaInteresPropuesta: 15.5,
      estadoSolicitudId: estadoCreada.id,
      destinoCreditoId: destinoConsumo.id,
      fechaSolicitud: new Date(),
    });
  }

  await solicitudRepository.save(solicitudes);
}
```

## 7. En Middleware/Guards

### Ejemplo: Guard que Valida Permisos por Estado

```typescript
// estado-solicitud.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { SolicitudService } from '../solicitud/solicitud.service';
import { EstadoSolicitudService } from '../catalogos/estado-solicitud/estado-solicitud.service';

@Injectable()
export class EstadoSolicitudGuard implements CanActivate {
  constructor(
    private readonly solicitudService: SolicitudService,
    private readonly estadoSolicitudService: EstadoSolicitudService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const solicitudId = request.params.id;
    const user = request.user;

    const solicitud = await this.solicitudService.findOne(solicitudId);
    const estado = await this.estadoSolicitudService.findOne(
      solicitud.estadoSolicitudId
    );

    // Solo analistas pueden modificar solicitudes en estado CREADA
    if (estado.codigo === 'CREADA' && user.rol !== 'ANALISTA') {
      return false;
    }

    // Solo gerentes pueden aprobar
    if (
      ['APROBADA', 'DENEGADA'].includes(estado.codigo) &&
      user.rol !== 'GERENTE'
    ) {
      return false;
    }

    return true;
  }
}
```

## 8. En Transformaciones/Pipes

### Ejemplo: Pipe para Validar Código de Catálogo

```typescript
// catalogo-codigo.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class CatalogoCodigoPipe implements PipeTransform {
  constructor(private readonly catalogoService: any) {}

  async transform(value: string): Promise<any> {
    if (!value) {
      throw new BadRequestException('Código de catálogo requerido');
    }

    try {
      const catalogo = await this.catalogoService.findByCodigo(value);

      if (!catalogo.activo) {
        throw new BadRequestException(
          `El valor "${value}" no está activo en el catálogo`
        );
      }

      return catalogo;
    } catch (error) {
      throw new BadRequestException(
        `Código de catálogo inválido: ${value}`
      );
    }
  }
}

// Uso en controller:
@Post('cambiar-estado/:codigo')
async cambiarEstado(
  @Param('id') id: number,
  @Param('codigo', new CatalogoCodigoPipe(estadoSolicitudService)) estado: EstadoSolicitud,
) {
  return await this.solicitudService.cambiarEstado(id, estado.id);
}
```

## 9. En Tests

### Ejemplo: Tests Unitarios con Catálogos

```typescript
// solicitud.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudService } from './solicitud.service';
import { EstadoSolicitudService } from '../catalogos/estado-solicitud/estado-solicitud.service';

describe('SolicitudService', () => {
  let service: SolicitudService;
  let estadoService: EstadoSolicitudService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolicitudService,
        {
          provide: EstadoSolicitudService,
          useValue: {
            findByCodigo: jest.fn().mockResolvedValue({
              id: 1,
              codigo: 'CREADA',
              nombre: 'Creada',
              activo: true,
            }),
          },
        },
        // ... otros providers
      ],
    }).compile();

    service = module.get<SolicitudService>(SolicitudService);
    estadoService = module.get<EstadoSolicitudService>(EstadoSolicitudService);
  });

  it('debe crear una solicitud con estado CREADA', async () => {
    const dto = {
      // ... datos de prueba
    };

    const result = await service.create(dto);

    expect(estadoService.findByCodigo).toHaveBeenCalledWith('CREADA');
    expect(result.estadoSolicitudId).toBe(1);
  });
});
```

## 10. Helpers/Utilidades

### Ejemplo: Helper para Transiciones de Estado

```typescript
// estado-transicion.helper.ts
import { BadRequestException } from '@nestjs/common';

interface TransicionPermitida {
  desde: string[];
  hacia: string;
  rol?: string[];
}

const TRANSICIONES_PERMITIDAS: TransicionPermitida[] = [
  {
    desde: ['CREADA'],
    hacia: 'EN_ANALISIS',
    rol: ['ANALISTA', 'GERENTE'],
  },
  {
    desde: ['EN_ANALISIS'],
    hacia: 'APROBADA',
    rol: ['GERENTE'],
  },
  {
    desde: ['EN_ANALISIS'],
    hacia: 'DENEGADA',
    rol: ['GERENTE'],
  },
  {
    desde: ['EN_ANALISIS'],
    hacia: 'PENDIENTE_COMITE',
    rol: ['GERENTE'],
  },
  {
    desde: ['PENDIENTE_COMITE'],
    hacia: 'AUTORIZADA',
    rol: ['COMITE'],
  },
  // ... más transiciones
];

export function validarTransicionEstado(
  estadoActual: string,
  nuevoEstado: string,
  rolUsuario: string,
): void {
  const transicion = TRANSICIONES_PERMITIDAS.find(
    t => t.hacia === nuevoEstado && t.desde.includes(estadoActual)
  );

  if (!transicion) {
    throw new BadRequestException(
      `No se puede cambiar de "${estadoActual}" a "${nuevoEstado}"`
    );
  }

  if (transicion.rol && !transicion.rol.includes(rolUsuario)) {
    throw new BadRequestException(
      `No tienes permisos para cambiar al estado "${nuevoEstado}"`
    );
  }
}
```

---

Estos ejemplos muestran cómo integrar los catálogos en diferentes partes de la aplicación, manteniendo un código limpio, type-safe y fácil de mantener.
