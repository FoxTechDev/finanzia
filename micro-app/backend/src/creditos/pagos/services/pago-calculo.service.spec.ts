import { PagoCalculoService } from './pago-calculo.service';
import { EstadoCuota } from '../../desembolso/entities/plan-pago.entity';
import { CuotaPendiente } from './pago-calculo.service';
import { TipoPago } from '../entities/pago.entity';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: construye CuotaPendiente lista para usar en calcularDistribucion
// ─────────────────────────────────────────────────────────────────────────────
function buildCuota(
  id: number,
  numeroCuota: number,
  capital: number,
  interes: number,
  capitalPagado = 0,
  interesPagado = 0,
  estado = EstadoCuota.PENDIENTE,
): CuotaPendiente {
  return {
    id,
    numeroCuota,
    fechaVencimiento: new Date('2026-08-01'),
    capital,
    interes,
    recargos: 0,
    interesMoratorio: 0,
    capitalPagado,
    interesPagado,
    recargosPagado: 0,
    interesMoratorioPagado: 0,
    diasMora: 0,
    estado,
    capitalPendiente: capital - capitalPagado,
    interesPendiente: interes - interesPagado,
    recargosPendiente: 0,
    interesMoratorioPendiente: 0,
    totalPendiente: (capital - capitalPagado) + (interes - interesPagado),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Se instancia el servicio sin repositorios porque calcularDistribucion
// es un método puro (no accede a la BD)
// ─────────────────────────────────────────────────────────────────────────────
describe('PagoCalculoService.calcularDistribucion', () => {
  let service: PagoCalculoService;

  beforeEach(() => {
    service = new PagoCalculoService(null as any, null as any, null as any);
  });

  // ─── Escenario del bug reportado ────────────────────────────────────────
  describe('préstamo $200, 2 cuotas de $120 ($100 capital + $20 interés)', () => {
    const cuota1 = buildCuota(1, 1, 100, 20);
    const cuota2 = buildCuota(2, 2, 100, 20);
    const cuotasPendientes = [cuota1, cuota2];

    it('pago parcial de $5 aplica SOLO a interés de cuota 1', () => {
      const resultado = service.calcularDistribucion(5, cuotasPendientes);

      expect(resultado.interesAplicado).toBe(5);
      expect(resultado.capitalAplicado).toBe(0);
      expect(resultado.excedente).toBe(0);
    });

    it('pago parcial de $5 deja cuota 1 en estado PARCIAL', () => {
      const resultado = service.calcularDistribucion(5, cuotasPendientes);

      expect(resultado.cuotasAfectadas).toHaveLength(1);
      expect(resultado.cuotasAfectadas[0].planPagoId).toBe(1);
      expect(resultado.cuotasAfectadas[0].estadoPosterior).toBe(EstadoCuota.PARCIAL);
      expect(resultado.cuotasAfectadas[0].interesAplicado).toBe(5);
      expect(resultado.cuotasAfectadas[0].capitalAplicado).toBe(0);
    });

    it('pago parcial de $5 NO afecta a cuota 2', () => {
      const resultado = service.calcularDistribucion(5, cuotasPendientes);

      const cuota2Afectada = resultado.cuotasAfectadas.find(c => c.planPagoId === 2);
      expect(cuota2Afectada).toBeUndefined();
    });

    it('el interés pendiente total tras el pago parcial debe ser $35 (no $0)', () => {
      const resultado = service.calcularDistribucion(5, cuotasPendientes);

      // El interés pendiente restante = total inicial - interés aplicado
      // = 40 - 5 = 35 (NO 0)
      const interesPendienteRestante = cuotasPendientes.reduce((sum, c) => {
        const afectada = resultado.cuotasAfectadas.find(a => a.planPagoId === c.id);
        const interesYaPagado = c.interesPagado + (afectada?.interesAplicado ?? 0);
        return sum + Math.max(0, c.interes - interesYaPagado);
      }, 0);

      expect(interesPendienteRestante).toBe(35);
    });

    it('pago de exactamente $20 (solo interés de cuota 1) deja cuota 1 PARCIAL (capital no pagado)', () => {
      const resultado = service.calcularDistribucion(20, cuotasPendientes);

      expect(resultado.interesAplicado).toBe(20);
      expect(resultado.capitalAplicado).toBe(0);
      expect(resultado.cuotasAfectadas[0].estadoPosterior).toBe(EstadoCuota.PARCIAL);
    });

    it('pago de $120 paga cuota 1 completa y deja cuota 2 PENDIENTE', () => {
      const resultado = service.calcularDistribucion(120, cuotasPendientes);

      expect(resultado.interesAplicado).toBe(20);
      expect(resultado.capitalAplicado).toBe(100);
      expect(resultado.cuotasAfectadas[0].estadoPosterior).toBe(EstadoCuota.PAGADA);
      expect(resultado.cuotasAfectadas).toHaveLength(1); // cuota 2 no afectada
    });

    it('pago de $240 cancela ambas cuotas (cancelación total)', () => {
      const resultado = service.calcularDistribucion(240, cuotasPendientes);

      expect(resultado.capitalAplicado).toBe(200);
      expect(resultado.interesAplicado).toBe(40);
      expect(resultado.tipoPago).toBe(TipoPago.CANCELACION_TOTAL);
      expect(resultado.cuotasAfectadas).toHaveLength(2);
      expect(resultado.cuotasAfectadas.every(c => c.estadoPosterior === EstadoCuota.PAGADA)).toBe(true);
    });
  });

  // ─── Pago sobre cuota ya parcialmente pagada ─────────────────────────────
  describe('segunda cuota parcial sobre cuota 1 ya con interesPagado=$5', () => {
    // Simula el estado DESPUÉS de un primer pago parcial de $5
    const cuota1Parcial = buildCuota(1, 1, 100, 20, 0, 5, EstadoCuota.PARCIAL);
    const cuota2 = buildCuota(2, 2, 100, 20);
    const cuotasPendientes = [cuota1Parcial, cuota2];

    it('segundo pago de $5 aplica a los $15 de interés restantes de cuota 1', () => {
      const resultado = service.calcularDistribucion(5, cuotasPendientes);

      expect(resultado.interesAplicado).toBe(5);
      expect(resultado.capitalAplicado).toBe(0);
    });

    it('pago de $15 cubre exactamente el interés restante de cuota 1, capital sigue PARCIAL', () => {
      const resultado = service.calcularDistribucion(15, cuotasPendientes);

      expect(resultado.interesAplicado).toBe(15);
      expect(resultado.capitalAplicado).toBe(0);
      expect(resultado.cuotasAfectadas[0].estadoPosterior).toBe(EstadoCuota.PARCIAL);
    });

    it('pago de $115 cubre interés restante ($15) + capital ($100) de cuota 1 → PAGADA', () => {
      const resultado = service.calcularDistribucion(115, cuotasPendientes);

      expect(resultado.interesAplicado).toBe(15);
      expect(resultado.capitalAplicado).toBe(100);
      expect(resultado.cuotasAfectadas[0].estadoPosterior).toBe(EstadoCuota.PAGADA);
    });
  });
});
