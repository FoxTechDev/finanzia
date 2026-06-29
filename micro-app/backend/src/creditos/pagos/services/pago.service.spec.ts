import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PagoService } from './pago.service';
import {
  PagoCalculoService,
  DistribucionPago,
  ResumenAdeudo,
} from './pago-calculo.service';
import { Pago, EstadoPago, TipoPago } from '../entities/pago.entity';
import { PagoDetalleCuota } from '../entities/pago-detalle-cuota.entity';
import { Prestamo, EstadoPrestamo } from '../../desembolso/entities/prestamo.entity';
import { PlanPago, EstadoCuota } from '../../desembolso/entities/plan-pago.entity';
import { CrearPagoDto } from '../dto/crear-pago.dto';

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures reutilizables
// ─────────────────────────────────────────────────────────────────────────────

const FECHA_PAGO = '2026-06-20';

const prestamoVigente = {
  id: 1,
  estado: EstadoPrestamo.VIGENTE,
  saldoCapital: 20,
  saldoInteres: 5,
  capitalMora: 0,
  interesMora: 0,
  diasMora: 0,
};

/** Construye un ResumenAdeudo con el totalAdeudado indicado */
function buildResumenAdeudo(
  totalAdeudado: number,
  recargoManualOpts: Partial<ResumenAdeudo['recargoManual']> = {},
): ResumenAdeudo {
  return {
    prestamo: {
      id: 1,
      numeroCredito: 'PR000001',
      personaNombre: 'Juan Pérez',
      montoDesembolsado: 400,
      saldoCapital: 20,
      saldoInteres: 5,
      capitalMora: 0,
      interesMora: 0,
      diasMora: 0,
      estado: EstadoPrestamo.VIGENTE,
      tasaInteresMoratorio: 0,
    },
    cuotasPendientes: [
      {
        id: 1,
        numeroCuota: 1,
        fechaVencimiento: new Date('2026-06-15'),
        capital: 20,
        interes: 5,
        recargos: 0,
        interesMoratorio: 0,
        capitalPagado: 0,
        interesPagado: 0,
        recargosPagado: 0,
        interesMoratorioPagado: 0,
        diasMora: 0,
        estado: EstadoCuota.PENDIENTE,
        capitalPendiente: 20,
        interesPendiente: 5,
        recargosPendiente: 0,
        interesMoratorioPendiente: 0,
        totalPendiente: totalAdeudado,
      },
    ],
    totales: {
      capitalPendiente: 20,
      interesPendiente: 5,
      recargosPendiente: 0,
      interesMoratorioPendiente: 0,
      totalAdeudado,
    },
    cuotasVencidas: 0,
    cuotasParciales: 0,
    proximaCuota: null,
    recargoManual: {
      aplica: false,
      montoSugerido: 0,
      tieneAtraso: false,
      ...recargoManualOpts,
    },
  };
}

/** Distribución estándar: pago exacto de $25 (capital $20 + interés $5) */
const distribucionCompleta: DistribucionPago = {
  capitalAplicado: 20,
  interesAplicado: 5,
  recargosAplicado: 0,
  interesMoratorioAplicado: 0,
  recargoManualAplicado: 0,
  excedente: 0,
  cuotasAfectadas: [
    {
      planPagoId: 1,
      numeroCuota: 1,
      capitalAplicado: 20,
      interesAplicado: 5,
      recargosAplicado: 0,
      interesMoratorioAplicado: 0,
      estadoAnterior: EstadoCuota.PENDIENTE,
      estadoPosterior: EstadoCuota.PAGADA,
      capitalPagadoAnterior: 0,
      interesPagadoAnterior: 0,
      recargosPagadoAnterior: 0,
      interesMoratorioPagadoAnterior: 0,
      diasMoraAnterior: 0,
    },
  ],
  tipoPago: TipoPago.CANCELACION_TOTAL,
};

/** Distribución parcial: solo paga $10 de los $25 adeudados */
const distribucionParcial: DistribucionPago = {
  ...distribucionCompleta,
  capitalAplicado: 5,
  interesAplicado: 5,
  cuotasAfectadas: [
    {
      ...distribucionCompleta.cuotasAfectadas[0],
      capitalAplicado: 5,
      interesAplicado: 5,
      estadoPosterior: EstadoCuota.PARCIAL,
    },
  ],
  tipoPago: TipoPago.PAGO_PARCIAL,
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: construye el DTO mínimo para crear un pago
// ─────────────────────────────────────────────────────────────────────────────
function dto(montoPagar: number, extra: Partial<CrearPagoDto> = {}): CrearPagoDto {
  return { prestamoId: 1, montoPagar, fechaPago: FECHA_PAGO, ...extra };
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite principal
// ─────────────────────────────────────────────────────────────────────────────
describe('PagoService', () => {
  let service: PagoService;
  let pagoCalculoService: jest.Mocked<Pick<PagoCalculoService, 'obtenerResumenAdeudo' | 'calcularDistribucion'>>;
  let mockQueryRunner: any;
  let mockPagoRepository: any;

  beforeEach(async () => {
    // Mock de la transacción TypeORM (queryRunner)
    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: {
        findOne: jest.fn(),
        create: jest.fn().mockReturnValue({}),
        save: jest.fn().mockResolvedValue({ id: 1 }),
        update: jest.fn().mockResolvedValue(undefined),
        createQueryBuilder: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
          getCount: jest.fn().mockResolvedValue(0),
        }),
      },
    };

    // Por defecto: préstamo vigente encontrado en la transacción
    mockQueryRunner.manager.findOne.mockResolvedValue(prestamoVigente);

    // Mock del repositorio de pagos (usado en findOne al final del flujo)
    mockPagoRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 1, montoPagado: 25, estado: EstadoPago.APLICADO }),
    };

    const mockPagoCalculoService = {
      obtenerResumenAdeudo: jest.fn().mockResolvedValue(buildResumenAdeudo(25)),
      calcularDistribucion: jest.fn().mockReturnValue(distribucionCompleta),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagoService,
        { provide: PagoCalculoService, useValue: mockPagoCalculoService },
        { provide: getRepositoryToken(Pago), useValue: mockPagoRepository },
        { provide: getRepositoryToken(PagoDetalleCuota), useValue: {} },
        { provide: getRepositoryToken(Prestamo), useValue: {} },
        { provide: getRepositoryToken(PlanPago), useValue: {} },
        {
          provide: DataSource,
          useValue: { createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner) },
        },
      ],
    }).compile();

    service = module.get<PagoService>(PagoService);
    pagoCalculoService = module.get(PagoCalculoService) as any;
  });

  // ─── 1. Estado del préstamo ────────────────────────────────────────────────
  describe('validaciones de estado del préstamo', () => {
    it('lanza NotFoundException si el préstamo no existe', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue(null);
      await expect(service.crear(dto(25))).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si el préstamo está CANCELADO', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue({
        ...prestamoVigente,
        estado: EstadoPrestamo.CANCELADO,
      });
      await expect(service.crear(dto(25))).rejects.toThrow(
        new BadRequestException('El préstamo ya está cancelado'),
      );
    });

    it('lanza BadRequestException si el préstamo está CASTIGADO', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue({
        ...prestamoVigente,
        estado: EstadoPrestamo.CASTIGADO,
      });
      await expect(service.crear(dto(25))).rejects.toThrow(
        new BadRequestException('El préstamo está castigado'),
      );
    });
  });

  // ─── 2. Validación de monto máximo (nueva validación) ─────────────────────
  describe('validación: monto no puede superar el total adeudado', () => {
    // Escenario base: crédito debe $25 (capital $20 + interés $5)

    it('lanza BadRequestException cuando montoPagar supera el total adeudado', async () => {
      await expect(service.crear(dto(30))).rejects.toThrow(BadRequestException);
    });

    it('el mensaje de error indica el monto enviado y el adeudado', async () => {
      await expect(service.crear(dto(30))).rejects.toThrow(
        'El monto a pagar ($30.00) supera el total adeudado ($25.00)',
      );
    });

    it('lanza BadRequestException con solo $0.01 de excedente', async () => {
      await expect(service.crear(dto(25.01))).rejects.toThrow(BadRequestException);
    });

    it('acepta el pago cuando montoPagar es exactamente igual al total adeudado', async () => {
      await expect(service.crear(dto(25))).resolves.toBeDefined();
    });

    it('acepta el pago parcial (montoPagar menor al total adeudado)', async () => {
      (pagoCalculoService.calcularDistribucion as jest.Mock).mockReturnValue(distribucionParcial);
      await expect(service.crear(dto(10))).resolves.toBeDefined();
    });
  });

  // ─── 3. Validación con recargo manual ─────────────────────────────────────
  describe('validación: el tope incluye el recargo manual cuando aplica', () => {
    const RECARGO = 3; // $3 de recargo manual

    beforeEach(() => {
      // Crédito con atraso y tipo de crédito que usa recargo manual
      (pagoCalculoService.obtenerResumenAdeudo as jest.Mock).mockResolvedValue(
        buildResumenAdeudo(25, { aplica: true, montoSugerido: RECARGO, tieneAtraso: true }),
      );
    });

    it('lanza BadRequestException cuando montoPagar supera totalAdeudado + recargoManual', async () => {
      // totalMaximo = $25 + $3 = $28 → pagar $29 debe fallar
      await expect(service.crear(dto(29))).rejects.toThrow(
        'El monto a pagar ($29.00) supera el total adeudado ($28.00)',
      );
    });

    it('acepta el pago cuando montoPagar = totalAdeudado + recargoManual (pago exacto con recargo)', async () => {
      (pagoCalculoService.calcularDistribucion as jest.Mock).mockReturnValue({
        ...distribucionCompleta,
        recargoManualAplicado: RECARGO,
      });
      await expect(service.crear(dto(28))).resolves.toBeDefined();
    });

    it('no incluye el recargoManual en el tope si aplica=false aunque haya atraso', async () => {
      (pagoCalculoService.obtenerResumenAdeudo as jest.Mock).mockResolvedValue(
        buildResumenAdeudo(25, { aplica: false, montoSugerido: RECARGO, tieneAtraso: true }),
      );
      // aplica=false → recargoManual queda en 0 → tope es $25
      await expect(service.crear(dto(26))).rejects.toThrow(BadRequestException);
    });

    it('no incluye el recargoManual en el tope si tieneAtraso=false aunque aplica=true', async () => {
      (pagoCalculoService.obtenerResumenAdeudo as jest.Mock).mockResolvedValue(
        buildResumenAdeudo(25, { aplica: true, montoSugerido: RECARGO, tieneAtraso: false }),
      );
      // tieneAtraso=false → recargoManual queda en 0 → tope es $25
      await expect(service.crear(dto(26))).rejects.toThrow(BadRequestException);
    });

    it('respeta el recargoManual personalizado enviado en el DTO (dto.recargoManual = 2)', async () => {
      // Si se envía dto.recargoManual=2 en lugar del sugerido $3 → tope = $25 + $2 = $27
      (pagoCalculoService.calcularDistribucion as jest.Mock).mockReturnValue({
        ...distribucionCompleta,
        recargoManualAplicado: 2,
      });
      // $27 exacto → debe pasar
      await expect(service.crear(dto(27, { recargoManual: 2 }))).resolves.toBeDefined();
      // $28 → supera el tope de $27 → debe fallar
      await expect(service.crear(dto(28, { recargoManual: 2 }))).rejects.toThrow(
        'El monto a pagar ($28.00) supera el total adeudado ($27.00)',
      );
    });
  });

  // ─── 4. saldoInteres posterior: bug con préstamos donde saldoInteres=0 ─────
  //
  // Raíz del bug: pago.service.ts calcula el saldo posterior como:
  //   saldoInteresPosterior = Number(prestamo.saldoInteres) - distribucion.interesAplicado
  //
  // Para préstamos AMORTIZADO, saldoInteres se inicializa en 0 (desembolso.service.ts).
  // Con un pago parcial de $5 sobre un préstamo con $40 de interés pendiente en el plan:
  //   0 - 5 = -5 → Math.max(0,-5) = 0  ← incorrecto, debería ser $35
  //
  // La corrección usa resumenAdeudo.totales.interesPendiente como base:
  //   40 - 5 = 35  ← correcto para cualquier tipo de préstamo
  // ──────────────────────────────────────────────────────────────────────────
  describe('actualización de saldoInteres posterior al pago', () => {
    // Fixture: préstamo $200, saldoInteres=0 (caso AMORTIZADO o no inicializado)
    const prestamoConSaldoInteresEnCero = {
      id: 1,
      estado: EstadoPrestamo.VIGENTE,
      saldoCapital: 200,
      saldoInteres: 0,   // ← AMORTIZADO: 0 por diseño
      capitalMora: 0,
      interesMora: 0,
      diasMora: 0,
    };

    // El plan sí tiene $40 de interés pendiente (fuente de verdad real)
    const resumenAmortizado: ResumenAdeudo = {
      prestamo: {
        id: 1,
        numeroCredito: 'PR000002',
        personaNombre: 'María García',
        montoDesembolsado: 200,
        saldoCapital: 200,
        saldoInteres: 0,
        capitalMora: 0,
        interesMora: 0,
        diasMora: 0,
        estado: EstadoPrestamo.VIGENTE,
        tasaInteresMoratorio: 0,
      },
      cuotasPendientes: [
        {
          id: 10,
          numeroCuota: 1,
          fechaVencimiento: new Date('2026-08-01'),
          capital: 100,
          interes: 20,
          recargos: 0,
          interesMoratorio: 0,
          capitalPagado: 0,
          interesPagado: 0,
          recargosPagado: 0,
          interesMoratorioPagado: 0,
          diasMora: 0,
          estado: EstadoCuota.PENDIENTE,
          capitalPendiente: 100,
          interesPendiente: 20,
          recargosPendiente: 0,
          interesMoratorioPendiente: 0,
          totalPendiente: 120,
        },
        {
          id: 11,
          numeroCuota: 2,
          fechaVencimiento: new Date('2026-09-01'),
          capital: 100,
          interes: 20,
          recargos: 0,
          interesMoratorio: 0,
          capitalPagado: 0,
          interesPagado: 0,
          recargosPagado: 0,
          interesMoratorioPagado: 0,
          diasMora: 0,
          estado: EstadoCuota.PENDIENTE,
          capitalPendiente: 100,
          interesPendiente: 20,
          recargosPendiente: 0,
          interesMoratorioPendiente: 0,
          totalPendiente: 120,
        },
      ],
      totales: {
        capitalPendiente: 200,
        interesPendiente: 40,    // ← plan tiene $40 de interés pendiente
        recargosPendiente: 0,
        interesMoratorioPendiente: 0,
        totalAdeudado: 240,
      },
      cuotasVencidas: 0,
      cuotasParciales: 0,
      proximaCuota: null,
      recargoManual: { aplica: false, montoSugerido: 0, tieneAtraso: false },
    };

    // Distribución de un pago parcial de $5 (va todo a interés de cuota 1)
    const distribucionParcialDe5: DistribucionPago = {
      capitalAplicado: 0,
      interesAplicado: 5,
      recargosAplicado: 0,
      interesMoratorioAplicado: 0,
      recargoManualAplicado: 0,
      excedente: 0,
      cuotasAfectadas: [
        {
          planPagoId: 10,
          numeroCuota: 1,
          capitalAplicado: 0,
          interesAplicado: 5,
          recargosAplicado: 0,
          interesMoratorioAplicado: 0,
          estadoAnterior: EstadoCuota.PENDIENTE,
          estadoPosterior: EstadoCuota.PARCIAL,
          capitalPagadoAnterior: 0,
          interesPagadoAnterior: 0,
          recargosPagadoAnterior: 0,
          interesMoratorioPagadoAnterior: 0,
          diasMoraAnterior: 0,
        },
      ],
      tipoPago: TipoPago.PAGO_PARCIAL,
    };

    beforeEach(() => {
      mockQueryRunner.manager.findOne.mockResolvedValue(prestamoConSaldoInteresEnCero);
      (pagoCalculoService.obtenerResumenAdeudo as jest.Mock).mockResolvedValue(resumenAmortizado);
      (pagoCalculoService.calcularDistribucion as jest.Mock).mockReturnValue(distribucionParcialDe5);
    });

    it('saldoInteres posterior = interesPendiente del plan - interesAplicado (40 - 5 = 35)', async () => {
      await service.crear(dto(5));

      const updateCall = mockQueryRunner.manager.update.mock.calls.find(
        (call: any[]) => call[0] === Prestamo,
      );
      expect(updateCall[2].saldoInteres).toBe(35);
    });

    it('para préstamo FLAT con saldoInteres=40 ya inicializado, el resultado es igualmente correcto', async () => {
      // Con o sin el fix, para FLAT ambos caminos dan el mismo resultado:
      //   - Actual:  40 - 5 = 35 ✓
      //   - Fix:     resumen.interesPendiente(40) - 5 = 35 ✓
      const prestamoFlat = { ...prestamoConSaldoInteresEnCero, saldoInteres: 40 };
      mockQueryRunner.manager.findOne.mockResolvedValue(prestamoFlat);

      await service.crear(dto(5));

      const updateCall = mockQueryRunner.manager.update.mock.calls.find(
        (call: any[]) => call[0] === Prestamo,
      );
      expect(updateCall[2].saldoInteres).toBe(35);
    });
  });

  // ─── 5. Manejo de transacción ──────────────────────────────────────────────
  describe('manejo de transacción', () => {
    it('hace rollback si ocurre un error al obtener el resumen de adeudo', async () => {
      (pagoCalculoService.obtenerResumenAdeudo as jest.Mock).mockRejectedValue(
        new Error('DB timeout'),
      );
      await expect(service.crear(dto(25))).rejects.toThrow('DB timeout');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    });

    it('libera el queryRunner incluso cuando la validación de monto falla', async () => {
      // montoPagar $30 > totalAdeudado $25 → BadRequestException dentro del try
      await expect(service.crear(dto(30))).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('libera el queryRunner incluso cuando el préstamo no existe', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue(null);
      await expect(service.crear(dto(25))).rejects.toThrow(NotFoundException);
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('hace commit cuando el pago se procesa correctamente', async () => {
      await service.crear(dto(25));
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
    });
  });
});
