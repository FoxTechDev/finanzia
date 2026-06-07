import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface FormaPago {
  idFormaPago: number;
  formaPago: string;
}

@Injectable({
  providedIn: 'root',
})
export class FormaPagoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/catalogos/forma-pago`;

  getAll(): Observable<FormaPago[]> {
    return this.http.get<FormaPago[]>(this.apiUrl);
  }
}
