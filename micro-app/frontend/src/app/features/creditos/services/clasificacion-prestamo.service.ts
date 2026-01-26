import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  ClasificacionPrestamo,
  CreateClasificacionPrestamoRequest,
  UpdateClasificacionPrestamoRequest,
} from '@core/models/credito.model';

@Injectable({
  providedIn: 'root'
})
export class ClasificacionPrestamoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/clasificacion-prestamo`;

  /**
   * Obtiene todas las clasificaciones
   */
  getAll(): Observable<ClasificacionPrestamo[]> {
    return this.http.get<ClasificacionPrestamo[]>(this.apiUrl);
  }

  /**
   * Obtiene solo las clasificaciones activas
   */
  getActivas(): Observable<ClasificacionPrestamo[]> {
    return this.http.get<ClasificacionPrestamo[]>(`${this.apiUrl}/activas`);
  }

  /**
   * Obtiene una clasificación por ID
   */
  getById(id: number): Observable<ClasificacionPrestamo> {
    return this.http.get<ClasificacionPrestamo>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea una nueva clasificación
   */
  create(request: CreateClasificacionPrestamoRequest): Observable<ClasificacionPrestamo> {
    return this.http.post<ClasificacionPrestamo>(this.apiUrl, request);
  }

  /**
   * Actualiza una clasificación existente
   */
  update(id: number, request: UpdateClasificacionPrestamoRequest): Observable<ClasificacionPrestamo> {
    return this.http.put<ClasificacionPrestamo>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Elimina una clasificación
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Inicializa las clasificaciones NCB-022 por defecto
   */
  inicializarNCB022(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/inicializar`, {});
  }
}
