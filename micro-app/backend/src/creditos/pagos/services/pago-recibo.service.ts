import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago, EstadoPago } from '../entities/pago.entity';
import { ReciboDataDto } from '../dto/recibo-data.dto';

@Injectable()
export class PagoReciboService {
  constructor(
    @InjectRepository(Pago)
    private pagoRepository: Repository<Pago>,
  ) {}

  /**
   * Obtiene todos los datos necesarios para generar un recibo de pago
   * @param pagoId ID del pago
   * @returns Datos formateados del recibo
   */
  async obtenerDatosRecibo(pagoId: number): Promise<ReciboDataDto> {
    // Obtener el pago con todas sus relaciones necesarias
    const pago = await this.pagoRepository.findOne({
      where: { id: pagoId },
      relations: [
        'prestamo',
        'prestamo.persona',
        'prestamo.tipoCredito',
      ],
    });

    if (!pago) {
      throw new NotFoundException(`Pago ${pagoId} no encontrado`);
    }

    if (!pago.prestamo) {
      throw new NotFoundException(
        `No se encontró el préstamo asociado al pago ${pagoId}`,
      );
    }

    if (!pago.prestamo.persona) {
      throw new NotFoundException(
        `No se encontró la persona asociada al préstamo ${pago.prestamo.numeroCredito}`,
      );
    }

    if (!pago.prestamo.tipoCredito) {
      throw new NotFoundException(
        `No se encontró el tipo de crédito asociado al préstamo ${pago.prestamo.numeroCredito}`,
      );
    }

    // Construir el objeto de respuesta
    const reciboData: ReciboDataDto = {
      // Datos de la institución
      institucion: 'FINANZIA S.C. DE R.L. DE C.V.',

      // Datos del recibo
      numeroPago: pago.numeroPago,
      pagoId: pago.id,
      fechaPago: pago.fechaPago,
      fechaEmision: pago.fechaRegistro,

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

      // Datos del pago
      montoPagado: Number(pago.montoPagado),
      distribucion: {
        capitalAplicado: Number(pago.capitalAplicado),
        interesAplicado: Number(pago.interesAplicado),
        recargosAplicado: Number(pago.recargosAplicado),
        interesMoratorioAplicado: Number(pago.interesMoratorioAplicado),
        recargoManualAplicado: Number(pago.recargoManualAplicado || 0),
      },

      // Saldos
      saldoAnterior: Number(pago.saldoCapitalAnterior) + Number(pago.saldoInteresAnterior),
      saldoActual: Number(pago.saldoCapitalPosterior) + Number(pago.saldoInteresPosterior),

      // Usuario
      usuario: {
        nombre: pago.nombreUsuario || 'Sistema',
      },
    };

    return reciboData;
  }
}
