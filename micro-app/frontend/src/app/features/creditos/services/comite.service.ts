import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  Solicitud,
  DecisionComite,
  DecisionComiteRequest,
  ComiteEstadisticas,
  TipoDecisionComite,
} from '@core/models/credito.model';

export interface ComitePendientesFilters {
  lineaCreditoId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  montoMinimo?: number;
  montoMaximo?: number;
}

export interface ComiteHistorialFilters {
  lineaCreditoId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  tipoDecision?: TipoDecisionComite;
}

@Injectable({
  providedIn: 'root',
})
export class ComiteService {
  private apiUrl = `${environment.apiUrl}/comite`;

  constructor(private http: HttpClient) {}

  getPendientes(filters?: ComitePendientesFilters): Observable<Solicitud[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.lineaCreditoId) params = params.set('lineaCreditoId', filters.lineaCreditoId.toString());
      if (filters.fechaDesde) params = params.set('fechaDesde', filters.fechaDesde);
      if (filters.fechaHasta) params = params.set('fechaHasta', filters.fechaHasta);
      if (filters.montoMinimo) params = params.set('montoMinimo', filters.montoMinimo.toString());
      if (filters.montoMaximo) params = params.set('montoMaximo', filters.montoMaximo.toString());
    }
    return this.http.get<Solicitud[]>(`${this.apiUrl}/pendientes`, { params });
  }

  getHistorial(filters?: ComiteHistorialFilters): Observable<DecisionComite[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.lineaCreditoId) params = params.set('lineaCreditoId', filters.lineaCreditoId.toString());
      if (filters.fechaDesde) params = params.set('fechaDesde', filters.fechaDesde);
      if (filters.fechaHasta) params = params.set('fechaHasta', filters.fechaHasta);
      if (filters.tipoDecision) params = params.set('tipoDecision', filters.tipoDecision);
    }
    return this.http.get<DecisionComite[]>(`${this.apiUrl}/historial`, { params });
  }

  getEstadisticas(): Observable<ComiteEstadisticas> {
    return this.http.get<ComiteEstadisticas>(`${this.apiUrl}/estadisticas`);
  }

  getDecisionesBySolicitud(solicitudId: number): Observable<DecisionComite[]> {
    return this.http.get<DecisionComite[]>(`${this.apiUrl}/${solicitudId}/decisiones`);
  }

  registrarDecision(solicitudId: number, decision: DecisionComiteRequest): Observable<DecisionComite> {
    return this.http.post<DecisionComite>(`${this.apiUrl}/${solicitudId}/decision`, decision);
  }
}
