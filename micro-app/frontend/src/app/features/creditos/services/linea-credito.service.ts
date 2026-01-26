import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { LineaCredito, CreateLineaCreditoRequest } from '@core/models/credito.model';

@Injectable({
  providedIn: 'root',
})
export class LineaCreditoService {
  private apiUrl = `${environment.apiUrl}/lineas-credito`;

  constructor(private http: HttpClient) {}

  getAll(activo?: boolean): Observable<LineaCredito[]> {
    const params: Record<string, string> = {};
    if (activo !== undefined) {
      params['activo'] = activo.toString();
    }
    return this.http.get<LineaCredito[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<LineaCredito> {
    return this.http.get<LineaCredito>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateLineaCreditoRequest): Observable<LineaCredito> {
    return this.http.post<LineaCredito>(this.apiUrl, data);
  }

  update(id: number, data: Partial<CreateLineaCreditoRequest>): Observable<LineaCredito> {
    return this.http.patch<LineaCredito>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
