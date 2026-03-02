import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Banco } from '@core/models/ahorro.model';

@Injectable({ providedIn: 'root' })
export class BancoService {
  private baseUrl = `${environment.apiUrl}/bancos`;

  constructor(private http: HttpClient) {}

  getAll(activo?: boolean): Observable<Banco[]> {
    const params: Record<string, string> = {};
    if (activo !== undefined) params['activo'] = activo.toString();
    return this.http.get<Banco[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Banco> {
    return this.http.get<Banco>(`${this.baseUrl}/${id}`);
  }

  create(data: { codigo: string; nombre: string; activo?: boolean }): Observable<Banco> {
    return this.http.post<Banco>(this.baseUrl, data);
  }

  update(id: number, data: Partial<{ codigo: string; nombre: string; activo: boolean }>): Observable<Banco> {
    return this.http.patch<Banco>(`${this.baseUrl}/${id}`, data);
  }
}
