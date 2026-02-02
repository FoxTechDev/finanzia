import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  Pago,
  PreviewPagoRequest,
  PreviewPagoResponse,
  CrearPagoRequest,
  AnularPagoRequest,
  ResumenAdeudo,
  EstadoCuenta,
  EstadoCuentaDatos,
  FiltrosPago,
  PaginatedPagos,
  ReciboData,
} from '@core/models/credito.model';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pagos`;

  /**
   * Obtiene preview de un pago sin aplicarlo
   */
  preview(request: PreviewPagoRequest): Observable<PreviewPagoResponse> {
    return this.http.post<PreviewPagoResponse>(`${this.apiUrl}/preview`, request);
  }

  /**
   * Crea y aplica un pago
   */
  crear(request: CrearPagoRequest): Observable<Pago> {
    return this.http.post<Pago>(this.apiUrl, request);
  }

  /**
   * Obtiene un pago por su ID
   */
  getById(id: number): Observable<Pago> {
    return this.http.get<Pago>(`${this.apiUrl}/${id}`);
  }

  /**
   * Lista pagos con filtros y paginación
   * Incluye relaciones de préstamo y persona para mostrar información completa
   */
  getAll(filtros?: FiltrosPago): Observable<PaginatedPagos> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.prestamoId) {
        params = params.set('prestamoId', filtros.prestamoId.toString());
      }
      if (filtros.estado) {
        params = params.set('estado', filtros.estado);
      }
      if (filtros.fechaDesde) {
        params = params.set('fechaDesde', filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        params = params.set('fechaHasta', filtros.fechaHasta);
      }
      if (filtros.page) {
        params = params.set('page', filtros.page.toString());
      }
      if (filtros.limit) {
        params = params.set('limit', filtros.limit.toString());
      }
    }

    return this.http.get<PaginatedPagos>(this.apiUrl, { params });
  }

  /**
   * Lista pagos de un préstamo específico
   */
  getByPrestamo(prestamoId: number): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.apiUrl}/prestamo/${prestamoId}`);
  }

  /**
   * Obtiene el estado de cuenta de un préstamo
   */
  getEstadoCuenta(prestamoId: number): Observable<EstadoCuenta> {
    return this.http.get<EstadoCuenta>(`${this.apiUrl}/prestamo/${prestamoId}/estado-cuenta`);
  }

  /**
   * Obtiene el resumen de adeudo de un préstamo
   */
  getResumenAdeudo(prestamoId: number): Observable<ResumenAdeudo> {
    return this.http.get<ResumenAdeudo>(`${this.apiUrl}/prestamo/${prestamoId}/resumen-adeudo`);
  }

  /**
   * Anula un pago
   */
  anular(id: number, request: AnularPagoRequest): Observable<Pago> {
    return this.http.post<Pago>(`${this.apiUrl}/${id}/anular`, request);
  }

  /**
   * Obtiene los datos del recibo de un pago
   */
  getRecibo(id: number): Observable<ReciboData> {
    return this.http.get<ReciboData>(`${this.apiUrl}/${id}/recibo`);
  }

  /**
   * Descarga el estado de cuenta en PDF de un préstamo
   * @param prestamoId ID del préstamo
   * @returns Observable<Blob> con el contenido del PDF
   */
  descargarEstadoCuentaPdf(prestamoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/prestamo/${prestamoId}/estado-cuenta-pdf`, {
      responseType: 'blob'
    });
  }

  /**
   * Obtiene los datos del estado de cuenta para visualización móvil
   * @param prestamoId ID del préstamo
   * @returns Observable con los datos del estado de cuenta
   */
  getEstadoCuentaDatos(prestamoId: number): Observable<EstadoCuentaDatos> {
    return this.http.get<EstadoCuentaDatos>(`${this.apiUrl}/prestamo/${prestamoId}/estado-cuenta-datos`);
  }
}
