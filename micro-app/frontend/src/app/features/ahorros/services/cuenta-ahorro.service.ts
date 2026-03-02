import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  CuentaAhorroResumen,
  CuentaAhorroDetalle,
  CuentaAVResumen,
  CreateCuentaAhorroRequest,
  PaginatedResponse,
  PlanCapitalizacion,
  InteresCapitalizacion,
} from '@core/models/ahorro.model';

@Injectable({ providedIn: 'root' })
export class CuentaAhorroService {
  private apiUrl = `${environment.apiUrl}/ahorros/cuentas`;

  constructor(private http: HttpClient) {}

  getAll(params: Record<string, string> = {}): Observable<PaginatedResponse<CuentaAhorroResumen>> {
    return this.http.get<PaginatedResponse<CuentaAhorroResumen>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<CuentaAhorroDetalle> {
    return this.http.get<CuentaAhorroDetalle>(`${this.apiUrl}/${id}`);
  }

  abrir(data: CreateCuentaAhorroRequest): Observable<CuentaAhorroDetalle> {
    return this.http.post<CuentaAhorroDetalle>(this.apiUrl, data);
  }

  cancelar(id: number): Observable<CuentaAhorroDetalle> {
    return this.http.patch<CuentaAhorroDetalle>(`${this.apiUrl}/${id}/cancelar`, {});
  }

  pignorar(id: number, monto: number): Observable<CuentaAhorroDetalle> {
    return this.http.patch<CuentaAhorroDetalle>(`${this.apiUrl}/${id}/pignorar`, { monto });
  }

  despignorar(id: number): Observable<CuentaAhorroDetalle> {
    return this.http.patch<CuentaAhorroDetalle>(`${this.apiUrl}/${id}/pignorar`, { despignorar: true });
  }

  renovar(id: number, nuevoVencimiento: string): Observable<CuentaAhorroDetalle> {
    return this.http.post<CuentaAhorroDetalle>(`${this.apiUrl}/${id}/renovar`, { nuevoVencimiento });
  }

  getEstadoCuenta(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/estado-cuenta`);
  }

  getPlanCapitalizacion(id: number): Observable<PlanCapitalizacion[]> {
    return this.http.get<PlanCapitalizacion[]>(`${this.apiUrl}/${id}/plan-capitalizacion`);
  }

  descargarContratoDpf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/contrato-dpf`, {
      responseType: 'blob',
    });
  }

  getActivasAV(personaId?: number): Observable<CuentaAVResumen[]> {
    const params: Record<string, string> = {};
    if (personaId) params['personaId'] = personaId.toString();
    return this.http.get<CuentaAVResumen[]>(`${this.apiUrl}/activas-av`, { params });
  }

  getInteresesPorPagar(fechaDesde: string, fechaHasta: string): Observable<PaginatedResponse<InteresCapitalizacion>> {
    return this.http.get<PaginatedResponse<InteresCapitalizacion>>(
      `${this.apiUrl}/reportes/intereses-por-pagar`,
      { params: { fechaDesde, fechaHasta } },
    );
  }
}
