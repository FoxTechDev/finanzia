import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { BeneficiarioCuentaAhorro, CreateBeneficiarioRequest } from '@core/models/ahorro.model';

@Injectable({ providedIn: 'root' })
export class BeneficiarioService {
  private baseUrl = `${environment.apiUrl}/ahorros/cuentas`;

  constructor(private http: HttpClient) {}

  getByCuenta(cuentaId: number): Observable<BeneficiarioCuentaAhorro[]> {
    return this.http.get<BeneficiarioCuentaAhorro[]>(`${this.baseUrl}/${cuentaId}/beneficiarios`);
  }

  create(cuentaId: number, data: CreateBeneficiarioRequest): Observable<BeneficiarioCuentaAhorro> {
    return this.http.post<BeneficiarioCuentaAhorro>(`${this.baseUrl}/${cuentaId}/beneficiarios`, data);
  }

  createBulk(cuentaId: number, data: CreateBeneficiarioRequest[]): Observable<BeneficiarioCuentaAhorro[]> {
    return this.http.post<BeneficiarioCuentaAhorro[]>(`${this.baseUrl}/${cuentaId}/beneficiarios/bulk`, data);
  }

  update(cuentaId: number, id: number, data: Partial<CreateBeneficiarioRequest>): Observable<BeneficiarioCuentaAhorro> {
    return this.http.patch<BeneficiarioCuentaAhorro>(`${this.baseUrl}/${cuentaId}/beneficiarios/${id}`, data);
  }

  remove(cuentaId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${cuentaId}/beneficiarios/${id}`);
  }
}
