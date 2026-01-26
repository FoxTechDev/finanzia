import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Departamento, Municipio, Distrito } from '@core/models/cliente.model';

@Injectable({
  providedIn: 'root',
})
export class UbicacionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDepartamentos(): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(`${this.apiUrl}/departamentos`);
  }

  getMunicipios(departamentoId?: number): Observable<Municipio[]> {
    const url = departamentoId
      ? `${this.apiUrl}/municipios?departamentoId=${departamentoId}`
      : `${this.apiUrl}/municipios`;
    return this.http.get<Municipio[]>(url);
  }

  getDistritos(municipioId?: number): Observable<Distrito[]> {
    const url = municipioId
      ? `${this.apiUrl}/distritos?municipioId=${municipioId}`
      : `${this.apiUrl}/distritos`;
    return this.http.get<Distrito[]>(url);
  }
}
