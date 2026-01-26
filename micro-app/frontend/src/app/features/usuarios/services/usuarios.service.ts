import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { User, Rol } from '@core/models/user.model';

/**
 * DTO para crear un nuevo usuario
 */
export interface CreateUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  rolId?: number;
}

/**
 * DTO para actualizar un usuario existente
 */
export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  rolId?: number;
  isActive?: boolean;
}

/**
 * Usuario extendido con información de estado
 */
export interface UsuarioExtendido extends User {
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Servicio para la gestión de usuarios
 */
@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`;

  /**
   * Obtener todos los usuarios
   */
  getAll(): Observable<UsuarioExtendido[]> {
    return this.http.get<UsuarioExtendido[]>(this.baseUrl);
  }

  /**
   * Obtener un usuario por ID
   */
  getById(id: string): Observable<UsuarioExtendido> {
    return this.http.get<UsuarioExtendido>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crear un nuevo usuario
   */
  create(data: CreateUserDto): Observable<UsuarioExtendido> {
    return this.http.post<UsuarioExtendido>(this.baseUrl, data);
  }

  /**
   * Actualizar un usuario existente
   */
  update(id: string, data: UpdateUserDto): Observable<UsuarioExtendido> {
    return this.http.patch<UsuarioExtendido>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Obtener roles activos para el selector
   */
  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${environment.apiUrl}/roles/activos`);
  }

  /**
   * Activar o desactivar un usuario
   */
  toggleActive(id: string, isActive: boolean): Observable<UsuarioExtendido> {
    return this.http.patch<UsuarioExtendido>(`${this.baseUrl}/${id}`, { isActive });
  }

  /**
   * Restablecer contraseña de un usuario
   */
  resetPassword(id: string, newPassword: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/reset-password`, { newPassword });
  }
}
