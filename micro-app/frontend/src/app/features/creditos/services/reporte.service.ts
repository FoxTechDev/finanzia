import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';

/**
 * Interface para filtros del reporte de colocación
 */
export interface FiltrosReporteColocacion {
  fechaDesde: string;
  fechaHasta: string;
  lineaCreditoId?: number;
  tipoCreditoId?: number;
}

/**
 * Interface para los datos del reporte de colocación
 */
export interface DatosReporteColocacion {
  id: number;
  numeroCredito: string;
  nombreCliente: string;
  lineaCredito: string;
  tipoCredito: string;
  montoDesembolsado: number;
  tasaInteres: number;
  plazo: number;
  periodicidadPago: string;
  saldoCapital: number;
  fechaOtorgamiento: string;
  fechaVencimiento: string;
}

/**
 * Interface para filtros del reporte de pagos
 */
export interface FiltrosReportePagos {
  fechaDesde: string;
  fechaHasta: string;
  estado?: string;
}

/**
 * Interface para los datos del reporte de pagos
 */
export interface DatosReportePagos {
  id: number;
  fechaPago: string;
  numeroCredito: string;
  nombreCliente: string;
  lineaCredito: string;
  tipoCredito: string;
  montoPagado: number;
  capitalAplicado: number;
  interesAplicado: number;
  recargosAplicado: number;
  interesMoratorioAplicado: number;
  saldoAnterior: number;
  saldoNuevo: number;
  estado: string;
}

/**
 * Service para generación de reportes del módulo de créditos
 */
@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/prestamos`;

  /**
   * Obtiene datos para el reporte de colocación de créditos
   * @param filtros Filtros para el reporte
   * @returns Observable con los datos del reporte
   */
  getReporteColocacion(filtros: FiltrosReporteColocacion): Observable<DatosReporteColocacion[]> {
    let params = new HttpParams();

    // Agregar filtros
    params = params.set('fechaDesde', filtros.fechaDesde);
    params = params.set('fechaHasta', filtros.fechaHasta);

    if (filtros.lineaCreditoId) {
      params = params.set('lineaCreditoId', filtros.lineaCreditoId.toString());
    }

    if (filtros.tipoCreditoId) {
      params = params.set('tipoCreditoId', filtros.tipoCreditoId.toString());
    }

    // Solicitar todos los registros sin paginación (limit alto para reportes)
    params = params.set('limit', '10000');
    params = params.set('page', '1');

    // Endpoint para obtener préstamos desembolsados en el rango de fechas
    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      map(response => {
        // Normalizar la respuesta
        const data = Array.isArray(response) ? response :
                     (response && typeof response === 'object' && 'data' in response) ?
                     (response as any).data : [];

        // Transformar los datos al formato del reporte
        return data.map((item: any) => this.transformarDatosReporte(item));
      })
    );
  }

  /**
   * Transforma los datos del préstamo al formato del reporte
   */
  private transformarDatosReporte(prestamo: any): DatosReporteColocacion {
    return {
      id: prestamo.id,
      numeroCredito: prestamo.numeroCredito,
      nombreCliente: prestamo.persona ?
        `${prestamo.persona.nombre} ${prestamo.persona.apellido}` :
        (prestamo.cliente?.nombreCompleto || 'N/A'),
      lineaCredito: prestamo.tipoCredito?.lineaCredito?.nombre || 'N/A',
      tipoCredito: prestamo.tipoCredito?.nombre || 'N/A',
      montoDesembolsado: Number(prestamo.montoDesembolsado) || 0,
      tasaInteres: Number(prestamo.tasaInteres) || 0,
      plazo: Number(prestamo.numeroCuotas) || 0,
      periodicidadPago: prestamo.periodicidadPago || 'N/A',
      saldoCapital: Number(prestamo.saldoCapital) || 0,
      fechaOtorgamiento: prestamo.fechaOtorgamiento,
      fechaVencimiento: prestamo.fechaVencimiento
    };
  }

  /**
   * Obtiene datos para el reporte de pagos
   * @param filtros Filtros para el reporte
   * @returns Observable con los datos del reporte
   */
  getReportePagos(filtros: FiltrosReportePagos): Observable<DatosReportePagos[]> {
    let params = new HttpParams();

    // Agregar filtros
    params = params.set('fechaDesde', filtros.fechaDesde);
    params = params.set('fechaHasta', filtros.fechaHasta);

    if (filtros.estado) {
      params = params.set('estado', filtros.estado);
    }

    // Solicitar todos los registros sin paginación (limit alto para reportes)
    params = params.set('limit', '10000');
    params = params.set('page', '1');

    // Endpoint para obtener pagos en el rango de fechas
    return this.http.get<any>(`${environment.apiUrl}/pagos`, { params }).pipe(
      map(response => {
        // Normalizar la respuesta
        const data = Array.isArray(response) ? response :
                     (response && typeof response === 'object' && 'data' in response) ?
                     (response as any).data : [];

        // Transformar los datos al formato del reporte
        return data.map((item: any) => this.transformarDatosPago(item));
      })
    );
  }

  /**
   * Transforma los datos del pago al formato del reporte
   */
  private transformarDatosPago(pago: any): DatosReportePagos {
    return {
      id: pago.id,
      fechaPago: pago.fechaPago,
      numeroCredito: pago.prestamo?.numeroCredito || 'N/A',
      nombreCliente: pago.prestamo?.persona ?
        `${pago.prestamo.persona.nombre} ${pago.prestamo.persona.apellido}` :
        'N/A',
      lineaCredito: pago.prestamo?.tipoCredito?.lineaCredito?.nombre || 'N/A',
      tipoCredito: pago.prestamo?.tipoCredito?.nombre || 'N/A',
      montoPagado: Number(pago.montoPagado) || 0,
      capitalAplicado: Number(pago.capitalAplicado) || 0,
      interesAplicado: Number(pago.interesAplicado) || 0,
      recargosAplicado: Number(pago.recargosAplicado) || 0,
      interesMoratorioAplicado: Number(pago.interesMoratorioAplicado) || 0,
      saldoAnterior: Number(pago.saldoCapitalAnterior) || 0,
      saldoNuevo: Number(pago.saldoCapitalPosterior) || 0,
      estado: pago.estado || 'N/A'
    };
  }
}
