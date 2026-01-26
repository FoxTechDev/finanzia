import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CatalogoBase, CatalogoDto } from '@core/models/catalogo.model';

/**
 * Servicio base genérico para operaciones CRUD de catálogos
 */
@Injectable({
  providedIn: 'root',
})
export class CatalogoBaseService<T extends CatalogoBase> {
  protected http = inject(HttpClient);
  protected baseUrl = environment.apiUrl;

  /**
   * Obtener todos los registros de un catálogo
   */
  getAll(endpoint: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${endpoint}`);
  }

  /**
   * Obtener solo los registros activos de un catálogo
   */
  getActivos(endpoint: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${endpoint}?activo=true`);
  }

  /**
   * Obtener un registro por ID
   */
  getById(endpoint: string, id: number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  /**
   * Crear un nuevo registro
   */
  create(endpoint: string, data: CatalogoDto): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  /**
   * Actualizar un registro existente
   */
  update(endpoint: string, id: number, data: Partial<CatalogoDto>): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}/${id}`, data);
  }

  /**
   * Eliminar un registro (soft delete - marca como inactivo)
   */
  delete(endpoint: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  /**
   * Cambiar el estado activo/inactivo de un registro
   */
  toggleActivo(endpoint: string, id: number, activo: boolean): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}/${id}`, { activo });
  }
}
