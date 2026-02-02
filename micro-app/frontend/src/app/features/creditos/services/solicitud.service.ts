import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  Solicitud,
  CreateSolicitudRequest,
  CambiarEstadoSolicitudRequest,
  SolicitudHistorial,
  SolicitudEstadisticas,
  EstadoSolicitud,
  TrasladarComiteRequest,
  CalcularPlanPagoRequest,
  PlanPagoCalculado,
} from '@core/models/credito.model';

export interface SolicitudFilters {
  estadoId?: number; // Cambiado a ID del estado
  personaId?: number;
  lineaCreditoId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SolicitudService {
  private apiUrl = `${environment.apiUrl}/solicitudes`;

  constructor(private http: HttpClient) {}

  getAll(filters?: SolicitudFilters): Observable<Solicitud[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.estadoId) params = params.set('estadoId', filters.estadoId.toString());
      if (filters.personaId) params = params.set('personaId', filters.personaId.toString());
      if (filters.lineaCreditoId) params = params.set('lineaCreditoId', filters.lineaCreditoId.toString());
      if (filters.fechaDesde) params = params.set('fechaDesde', filters.fechaDesde);
      if (filters.fechaHasta) params = params.set('fechaHasta', filters.fechaHasta);
    }
    return this.http.get<Solicitud[]>(this.apiUrl, { params });
  }

  /**
   * Obtiene todos los estados de solicitud desde el catálogo
   */
  getEstados(soloActivos = true): Observable<EstadoSolicitud[]> {
    const params = soloActivos ? new HttpParams().set('activos', 'true') : new HttpParams();
    return this.http.get<EstadoSolicitud[]>(`${environment.apiUrl}/catalogos/estado-solicitud`, { params });
  }

  /**
   * Obtiene un estado específico por su código
   */
  getEstadoPorCodigo(codigo: string): Observable<EstadoSolicitud> {
    return this.http.get<EstadoSolicitud>(`${environment.apiUrl}/catalogos/estado-solicitud/codigo/${codigo}`);
  }

  getById(id: number): Observable<Solicitud> {
    return this.http.get<Solicitud>(`${this.apiUrl}/${id}`);
  }

  getByNumero(numero: string): Observable<Solicitud> {
    return this.http.get<Solicitud>(`${this.apiUrl}/numero/${numero}`);
  }

  getEstadisticas(): Observable<SolicitudEstadisticas[]> {
    return this.http.get<SolicitudEstadisticas[]>(`${this.apiUrl}/estadisticas`);
  }

  create(data: CreateSolicitudRequest): Observable<Solicitud> {
    return this.http.post<Solicitud>(this.apiUrl, data);
  }

  update(id: number, data: Partial<CreateSolicitudRequest>): Observable<Solicitud> {
    return this.http.patch<Solicitud>(`${this.apiUrl}/${id}`, data);
  }

  cambiarEstado(id: number, data: CambiarEstadoSolicitudRequest): Observable<Solicitud> {
    return this.http.post<Solicitud>(`${this.apiUrl}/${id}/estado`, data);
  }

  getHistorial(id: number): Observable<SolicitudHistorial[]> {
    return this.http.get<SolicitudHistorial[]>(`${this.apiUrl}/${id}/historial`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  trasladarAComite(id: number, data: TrasladarComiteRequest): Observable<Solicitud> {
    return this.http.post<Solicitud>(`${this.apiUrl}/${id}/trasladar-comite`, data);
  }

  /**
   * Calcula el plan de pago sin guardar nada (previsualización)
   */
  calcularPlanPago(data: CalcularPlanPagoRequest): Observable<PlanPagoCalculado> {
    return this.http.post<PlanPagoCalculado>(`${this.apiUrl}/calcular-plan`, data);
  }

  /**
   * Guarda el plan de pago calculado en la base de datos
   */
  guardarPlanPago(solicitudId: number, data: CalcularPlanPagoRequest): Observable<PlanPagoCalculado> {
    return this.http.post<PlanPagoCalculado>(`${this.apiUrl}/${solicitudId}/guardar-plan-pago`, data);
  }

  /**
   * Obtiene el plan de pago guardado de una solicitud
   */
  obtenerPlanPago(solicitudId: number): Observable<PlanPagoCalculado> {
    return this.http.get<PlanPagoCalculado>(`${this.apiUrl}/${solicitudId}/plan-pago`);
  }
}
