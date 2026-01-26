import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { TipoCredito, CreateTipoCreditoRequest } from '@core/models/credito.model';

@Injectable({
  providedIn: 'root',
})
export class TipoCreditoService {
  private apiUrl = `${environment.apiUrl}/tipos-credito`;

  constructor(private http: HttpClient) {}

  getAll(lineaCreditoId?: number, activo?: boolean): Observable<TipoCredito[]> {
    const params: Record<string, string> = {};
    if (lineaCreditoId !== undefined) {
      params['lineaCreditoId'] = lineaCreditoId.toString();
    }
    if (activo !== undefined) {
      params['activo'] = activo.toString();
    }
    return this.http.get<TipoCredito[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<TipoCredito> {
    return this.http.get<TipoCredito>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateTipoCreditoRequest): Observable<TipoCredito> {
    return this.http.post<TipoCredito>(this.apiUrl, data);
  }

  update(id: number, data: Partial<CreateTipoCreditoRequest>): Observable<TipoCredito> {
    return this.http.patch<TipoCredito>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  validarParametros(
    id: number,
    monto: number,
    plazo: number,
    tasaInteres: number
  ): Observable<{ valid: boolean; errors: string[] }> {
    return this.http.post<{ valid: boolean; errors: string[] }>(
      `${this.apiUrl}/${id}/validar`,
      { monto, plazo, tasaInteres }
    );
  }
}
