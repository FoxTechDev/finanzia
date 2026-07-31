import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { TipoAccion, CreateTipoAccionRequest } from '@core/models/accion.model';

@Injectable({ providedIn: 'root' })
export class TipoAccionService {
  private baseUrl = `${environment.apiUrl}/acciones/tipos-accion`;

  constructor(private http: HttpClient) {}

  getAll(activo?: boolean): Observable<TipoAccion[]> {
    const params: Record<string, string> = {};
    if (activo !== undefined) params['activo'] = activo.toString();
    return this.http.get<TipoAccion[]>(this.baseUrl, { params });
  }

  getOne(id: number): Observable<TipoAccion> {
    return this.http.get<TipoAccion>(`${this.baseUrl}/${id}`);
  }

  create(data: CreateTipoAccionRequest): Observable<TipoAccion> {
    return this.http.post<TipoAccion>(this.baseUrl, data);
  }

  update(id: number, data: Partial<CreateTipoAccionRequest>): Observable<TipoAccion> {
    return this.http.patch<TipoAccion>(`${this.baseUrl}/${id}`, data);
  }
}
