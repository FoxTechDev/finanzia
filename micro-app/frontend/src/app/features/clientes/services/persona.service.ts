import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Persona, CreatePersonaRequest } from '@core/models/cliente.model';

@Injectable({
  providedIn: 'root',
})
export class PersonaService {
  private apiUrl = `${environment.apiUrl}/personas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Persona[]> {
    return this.http.get<Persona[]>(this.apiUrl);
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
