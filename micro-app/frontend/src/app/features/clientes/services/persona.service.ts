import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Persona, CreatePersonaRequest } from '@core/models/cliente.model';

export interface PersonaPaginatedResponse {
  data: Persona[];
  total: number;
  page: number;
  limit: number;
}

export interface PersonaFiltros {
  nombre?: string;
  dui?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PersonaService {
  private apiUrl = `${environment.apiUrl}/personas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Persona[]> {
    return this.http.get<Persona[]>(this.apiUrl);
  }

  getPaginated(filtros: PersonaFiltros): Observable<PersonaPaginatedResponse> {
    let params = new HttpParams();

    if (filtros.nombre) {
      params = params.set('nombre', filtros.nombre);
    }
    if (filtros.dui) {
      params = params.set('dui', filtros.dui);
    }
    if (filtros.page) {
      params = params.set('page', filtros.page.toString());
    }
    if (filtros.limit) {
      params = params.set('limit', filtros.limit.toString());
    }

    return this.http.get<PersonaPaginatedResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Persona> {
    return this.http.get<Persona>(`${this.apiUrl}/${id}`);
  }

  getByDui(dui: string): Observable<Persona> {
    return this.http.get<Persona>(`${this.apiUrl}/buscar?dui=${dui}`);
  }

  search(query: string, limit: number = 10): Observable<Persona[]> {
    return this.http.get<Persona[]>(
      `${this.apiUrl}/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  }

  create(persona: CreatePersonaRequest): Observable<Persona> {
    return this.http.post<Persona>(this.apiUrl, persona);
  }

  update(id: number, persona: Partial<CreatePersonaRequest>): Observable<Persona> {
    return this.http.patch<Persona>(`${this.apiUrl}/${id}`, persona);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
