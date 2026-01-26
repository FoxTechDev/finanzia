import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  Solicitud,
  Prestamo,
  PlanPago,
  TipoDeduccion,
  TipoRecargo,
  PreviewDesembolsoRequest,
  PreviewDesembolsoResponse,
  CrearDesembolsoRequest,
  CreateTipoDeduccionRequest,
  CreateTipoRecargoRequest,
  EstadoPrestamo,
} from '@core/models/credito.model';

@Injectable({
  providedIn: 'root',
})
export class DesembolsoService {
  private apiUrl = `${environment.apiUrl}/desembolso`;
  private tiposDeduccionUrl = `${environment.apiUrl}/tipos-deduccion`;
  private tiposRecargoUrl = `${environment.apiUrl}/tipos-recargo`;

  constructor(private http: HttpClient) {}

  // ============================================
  // DESEMBOLSO
  // ============================================

  /**
   * Obtiene las solicitudes autorizadas pendientes de desembolso
   */
  getPendientes(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.apiUrl}/pendientes`);
  }

  /**
   * Genera un preview del desembolso sin guardar
   */
  preview(data: PreviewDesembolsoRequest): Observable<PreviewDesembolsoResponse> {
    return this.http.post<PreviewDesembolsoResponse>(`${this.apiUrl}/preview`, data);
  }

  /**
   * Confirma y crea el desembolso
   */
  crear(data: CrearDesembolsoRequest): Observable<Prestamo> {
    return this.http.post<Prestamo>(this.apiUrl, data);
  }

  /**
   * Obtiene el detalle de un préstamo
   */
  getById(id: number): Observable<Prestamo> {
    return this.http.get<Prestamo>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene el plan de pago de un préstamo
   */
  getPlanPago(prestamoId: number): Observable<PlanPago[]> {
    return this.http.get<PlanPago[]>(`${this.apiUrl}/${prestamoId}/plan-pago`);
  }

  /**
   * Lista todos los préstamos
   */
  getAll(estado?: EstadoPrestamo): Observable<Prestamo[]> {
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<Prestamo[]>(this.apiUrl, { params });
  }

  // ============================================
  // TIPOS DE DEDUCCIÓN (Catálogo)
  // ============================================

  /**
   * Lista todos los tipos de deducción
   */
  getTiposDeduccion(activo?: boolean): Observable<TipoDeduccion[]> {
    let params = new HttpParams();
    if (activo !== undefined) {
      params = params.set('activo', activo.toString());
    }
    return this.http.get<TipoDeduccion[]>(this.tiposDeduccionUrl, { params });
  }

  /**
   * Obtiene un tipo de deducción por ID
   */
  getTipoDeduccionById(id: number): Observable<TipoDeduccion> {
    return this.http.get<TipoDeduccion>(`${this.tiposDeduccionUrl}/${id}`);
  }

  /**
   * Crea un nuevo tipo de deducción
   */
  createTipoDeduccion(data: CreateTipoDeduccionRequest): Observable<TipoDeduccion> {
    return this.http.post<TipoDeduccion>(this.tiposDeduccionUrl, data);
  }

  /**
   * Actualiza un tipo de deducción
   */
  updateTipoDeduccion(id: number, data: Partial<CreateTipoDeduccionRequest>): Observable<TipoDeduccion> {
    return this.http.put<TipoDeduccion>(`${this.tiposDeduccionUrl}/${id}`, data);
  }

  /**
   * Elimina un tipo de deducción (soft delete)
   */
  deleteTipoDeduccion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.tiposDeduccionUrl}/${id}`);
  }

  // ============================================
  // TIPOS DE RECARGO (Catálogo)
  // ============================================

  /**
   * Lista todos los tipos de recargo
   */
  getTiposRecargo(activo?: boolean): Observable<TipoRecargo[]> {
    let params = new HttpParams();
    if (activo !== undefined) {
      params = params.set('activo', activo.toString());
    }
    return this.http.get<TipoRecargo[]>(this.tiposRecargoUrl, { params });
  }

  /**
   * Obtiene un tipo de recargo por ID
   */
  getTipoRecargoById(id: number): Observable<TipoRecargo> {
    return this.http.get<TipoRecargo>(`${this.tiposRecargoUrl}/${id}`);
  }

  /**
   * Crea un nuevo tipo de recargo
   */
  createTipoRecargo(data: CreateTipoRecargoRequest): Observable<TipoRecargo> {
    return this.http.post<TipoRecargo>(this.tiposRecargoUrl, data);
  }

  /**
   * Actualiza un tipo de recargo
   */
  updateTipoRecargo(id: number, data: Partial<CreateTipoRecargoRequest>): Observable<TipoRecargo> {
    return this.http.put<TipoRecargo>(`${this.tiposRecargoUrl}/${id}`, data);
  }

  /**
   * Elimina un tipo de recargo (soft delete)
   */
  deleteTipoRecargo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.tiposRecargoUrl}/${id}`);
  }
}
