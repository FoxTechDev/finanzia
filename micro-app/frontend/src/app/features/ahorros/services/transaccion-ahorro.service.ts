import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  TransaccionAhorro,
  DepositoRequest,
  RetiroRequest,
  PaginatedResponse,
} from '@core/models/ahorro.model';

@Injectable({ providedIn: 'root' })
export class TransaccionAhorroService {
  private baseUrl = `${environment.apiUrl}/ahorros/cuentas`;

  constructor(private http: HttpClient) {}

  getTransacciones(
    cuentaId: number,
    page: number = 1,
    limit: number = 50,
  ): Observable<PaginatedResponse<TransaccionAhorro>> {
    return this.http.get<PaginatedResponse<TransaccionAhorro>>(
      `${this.baseUrl}/${cuentaId}/transacciones`,
      { params: { page: page.toString(), limit: limit.toString() } },
    );
  }

  depositar(cuentaId: number, data: DepositoRequest): Observable<TransaccionAhorro> {
    return this.http.post<TransaccionAhorro>(
      `${this.baseUrl}/${cuentaId}/depositar`,
      data,
    );
  }

  retirar(cuentaId: number, data: RetiroRequest): Observable<TransaccionAhorro> {
    return this.http.post<TransaccionAhorro>(
      `${this.baseUrl}/${cuentaId}/retirar`,
      data,
    );
  }

  calcularProvision(fecha: string): Observable<{ procesados: number }> {
    return this.http.post<{ procesados: number }>(
      `${this.baseUrl}/provision/calcular`,
      { fecha },
    );
  }
}
