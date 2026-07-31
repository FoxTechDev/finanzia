import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Accion, CreateAccionRequest, AccionDividendo } from '@core/models/accion.model';

@Injectable({ providedIn: 'root' })
export class AccionService {
  private apiUrl = `${environment.apiUrl}/acciones`;

  constructor(private http: HttpClient) {}

  abrir(data: CreateAccionRequest): Observable<Accion> {
    return this.http.post<Accion>(this.apiUrl, data);
  }

  getAll(personaId?: number, activa?: boolean): Observable<Accion[]> {
    const params: Record<string, string> = {};
    if (personaId !== undefined) params['personaId'] = personaId.toString();
    if (activa !== undefined) params['activa'] = activa.toString();
    return this.http.get<Accion[]>(this.apiUrl, { params });
  }

  getOne(id: number): Observable<Accion> {
    return this.http.get<Accion>(`${this.apiUrl}/${id}`);
  }

  getDividendos(id: number): Observable<AccionDividendo[]> {
    return this.http.get<AccionDividendo[]>(`${this.apiUrl}/${id}/dividendos`);
  }

  procesarDividendos(): Observable<{ procesados: number }> {
    return this.http.post<{ procesados: number }>(`${this.apiUrl}/dividendos/procesar`, {});
  }
}
