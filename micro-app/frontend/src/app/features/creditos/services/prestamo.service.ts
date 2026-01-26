import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '@env/environment';
import {
  Prestamo,
  PlanPago,
  EstadoPrestamo
} from '@core/models/credito.model';

export interface PrestamoFilters {
  estado?: EstadoPrestamo;
  personaId?: number;
  numeroCredito?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  clasificacionPrestamoId?: number;
  conMora?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PrestamoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/prestamos`;

  /**
   * Obtiene todos los préstamos con filtros opcionales
   */
  getAll(filters?: PrestamoFilters): Observable<Prestamo[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.estado) {
        params = params.set('estado', filters.estado);
      }
      if (filters.personaId) {
        params = params.set('personaId', filters.personaId.toString());
      }
      if (filters.numeroCredito) {
        params = params.set('numeroCredito', filters.numeroCredito);
      }
      if (filters.fechaDesde) {
        params = params.set('fechaDesde', filters.fechaDesde);
      }
      if (filters.fechaHasta) {
        params = params.set('fechaHasta', filters.fechaHasta);
      }
      if (filters.clasificacionPrestamoId) {
        params = params.set('clasificacionPrestamoId', filters.clasificacionPrestamoId.toString());
      }
      if (filters.conMora !== undefined) {
        params = params.set('conMora', filters.conMora.toString());
      }
    }

    return this.http.get<Prestamo[]>(this.apiUrl, { params }).pipe(
      map(response => {
        // Normalizar la respuesta: asegurar que siempre sea un array
        if (Array.isArray(response)) {
          return response;
        }
        // Si el backend envuelve la respuesta en un objeto con propiedad 'data'
        if (response && typeof response === 'object' && 'data' in response) {
          const data = (response as any).data;
          return Array.isArray(data) ? data : [];
        }
        // Si no es un array válido, retornar array vacío
        console.warn('Respuesta inesperada del backend:', response);
        return [];
      }),
      catchError(error => {
        console.error('Error al obtener préstamos:', error);
        // En caso de error, retornar array vacío en lugar de propagar el error
        // El componente manejará el error por su cuenta
        throw error;
      })
    );
  }

  /**
   * Obtiene un préstamo por su ID con toda la información relacionada
   */
  getById(id: number): Observable<Prestamo> {
    return this.http.get<Prestamo>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene el plan de pagos completo de un préstamo
   */
  getPlanPago(prestamoId: number): Observable<PlanPago[]> {
    return this.http.get<PlanPago[]>(`${this.apiUrl}/${prestamoId}/plan-pago`).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        }
        if (response && typeof response === 'object' && 'data' in response) {
          const data = (response as any).data;
          return Array.isArray(data) ? data : [];
        }
        console.warn('Respuesta inesperada del backend en getPlanPago:', response);
        return [];
      })
    );
  }

  /**
   * Obtiene todos los préstamos de un cliente específico
   */
  getByCliente(personaId: number): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${this.apiUrl}/cliente/${personaId}`).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        }
        if (response && typeof response === 'object' && 'data' in response) {
          const data = (response as any).data;
          return Array.isArray(data) ? data : [];
        }
        console.warn('Respuesta inesperada del backend en getByCliente:', response);
        return [];
      })
    );
  }

  /**
   * Obtiene préstamos activos de un cliente (VIGENTE o MORA)
   */
  getPrestamosActivosCliente(personaId: number): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${this.apiUrl}/cliente/${personaId}/activos`).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        }
        if (response && typeof response === 'object' && 'data' in response) {
          const data = (response as any).data;
          return Array.isArray(data) ? data : [];
        }
        console.warn('Respuesta inesperada del backend en getPrestamosActivosCliente:', response);
        return [];
      })
    );
  }

  /**
   * Obtiene estadísticas generales de préstamos
   */
  getEstadisticas(): Observable<{
    totalPrestamos: number;
    totalCartera: number;
    prestamosVigentes: number;
    prestamosEnMora: number;
    porcentajeMora: number;
    totalCapitalMora: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/estadisticas`);
  }
}
