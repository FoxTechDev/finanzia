import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  LineaAhorro,
  CreateLineaAhorroRequest,
  TipoAhorro,
  CreateTipoAhorroRequest,
  EstadoCuentaAhorro,
  CreateEstadoCuentaAhorroRequest,
  TipoCapitalizacion,
  CreateTipoCapitalizacionRequest,
  NaturalezaMovimiento,
  CreateNaturalezaMovimientoRequest,
  TipoTransaccionAhorro,
  CreateTipoTransaccionAhorroRequest,
} from '@core/models/ahorro.model';

@Injectable({ providedIn: 'root' })
export class CatalogosAhorroService {
  private baseUrl = `${environment.apiUrl}/ahorros`;

  constructor(private http: HttpClient) {}

  // Líneas de ahorro
  getLineas(activo?: boolean): Observable<LineaAhorro[]> {
    const params: Record<string, string> = {};
    if (activo !== undefined) params['activo'] = activo.toString();
    return this.http.get<LineaAhorro[]>(`${this.baseUrl}/lineas-ahorro`, { params });
  }

  getLinea(id: number): Observable<LineaAhorro> {
    return this.http.get<LineaAhorro>(`${this.baseUrl}/lineas-ahorro/${id}`);
  }

  createLinea(data: CreateLineaAhorroRequest): Observable<LineaAhorro> {
    return this.http.post<LineaAhorro>(`${this.baseUrl}/lineas-ahorro`, data);
  }

  updateLinea(id: number, data: Partial<CreateLineaAhorroRequest>): Observable<LineaAhorro> {
    return this.http.patch<LineaAhorro>(`${this.baseUrl}/lineas-ahorro/${id}`, data);
  }

  // Tipos de ahorro
  getTipos(activo?: boolean): Observable<TipoAhorro[]> {
    const params: Record<string, string> = {};
    if (activo !== undefined) params['activo'] = activo.toString();
    return this.http.get<TipoAhorro[]>(`${this.baseUrl}/tipos-ahorro`, { params });
  }

  getTiposByLinea(lineaCodigo: string, activo: boolean = true): Observable<TipoAhorro[]> {
    const params: Record<string, string> = {
      activo: activo.toString(),
      lineaCodigo,
    };
    return this.http.get<TipoAhorro[]>(`${this.baseUrl}/tipos-ahorro`, { params });
  }

  getTipo(id: number): Observable<TipoAhorro> {
    return this.http.get<TipoAhorro>(`${this.baseUrl}/tipos-ahorro/${id}`);
  }

  createTipo(data: CreateTipoAhorroRequest): Observable<TipoAhorro> {
    return this.http.post<TipoAhorro>(`${this.baseUrl}/tipos-ahorro`, data);
  }

  updateTipo(id: number, data: Partial<CreateTipoAhorroRequest>): Observable<TipoAhorro> {
    return this.http.patch<TipoAhorro>(`${this.baseUrl}/tipos-ahorro/${id}`, data);
  }

  // Estados de cuenta
  getEstados(): Observable<EstadoCuentaAhorro[]> {
    return this.http.get<EstadoCuentaAhorro[]>(`${this.baseUrl}/catalogos/estados`);
  }

  createEstado(data: CreateEstadoCuentaAhorroRequest): Observable<EstadoCuentaAhorro> {
    return this.http.post<EstadoCuentaAhorro>(`${this.baseUrl}/catalogos/estados`, data);
  }

  updateEstado(id: number, data: Partial<CreateEstadoCuentaAhorroRequest>): Observable<EstadoCuentaAhorro> {
    return this.http.patch<EstadoCuentaAhorro>(`${this.baseUrl}/catalogos/estados/${id}`, data);
  }

  deleteEstado(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/catalogos/estados/${id}`);
  }

  // Tipos de capitalización
  getTiposCapitalizacion(): Observable<TipoCapitalizacion[]> {
    return this.http.get<TipoCapitalizacion[]>(`${this.baseUrl}/catalogos/tipos-capitalizacion`);
  }

  createTipoCapitalizacion(data: CreateTipoCapitalizacionRequest): Observable<TipoCapitalizacion> {
    return this.http.post<TipoCapitalizacion>(`${this.baseUrl}/catalogos/tipos-capitalizacion`, data);
  }

  updateTipoCapitalizacion(id: number, data: Partial<CreateTipoCapitalizacionRequest>): Observable<TipoCapitalizacion> {
    return this.http.patch<TipoCapitalizacion>(`${this.baseUrl}/catalogos/tipos-capitalizacion/${id}`, data);
  }

  deleteTipoCapitalizacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/catalogos/tipos-capitalizacion/${id}`);
  }

  // Naturalezas de movimiento
  getNaturalezas(): Observable<NaturalezaMovimiento[]> {
    return this.http.get<NaturalezaMovimiento[]>(`${this.baseUrl}/catalogos/naturalezas`);
  }

  createNaturaleza(data: CreateNaturalezaMovimientoRequest): Observable<NaturalezaMovimiento> {
    return this.http.post<NaturalezaMovimiento>(`${this.baseUrl}/catalogos/naturalezas`, data);
  }

  updateNaturaleza(id: number, data: Partial<CreateNaturalezaMovimientoRequest>): Observable<NaturalezaMovimiento> {
    return this.http.patch<NaturalezaMovimiento>(`${this.baseUrl}/catalogos/naturalezas/${id}`, data);
  }

  deleteNaturaleza(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/catalogos/naturalezas/${id}`);
  }

  // Transacciones por tipo de ahorro
  getTransaccionesByTipoAhorro(tipoAhorroId: number): Observable<TipoTransaccionAhorro[]> {
    return this.http.get<TipoTransaccionAhorro[]>(
      `${this.baseUrl}/catalogos/tipos-transaccion/por-tipo-ahorro/${tipoAhorroId}`,
    );
  }

  asignarTransaccion(tipoAhorroId: number, tipoTransaccionId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/catalogos/tipos-transaccion/asignar`, {
      tipoAhorroId,
      tipoTransaccionId,
    });
  }

  desasignarTransaccion(tipoAhorroId: number, tipoTransaccionId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/catalogos/tipos-transaccion/asignar/${tipoAhorroId}/${tipoTransaccionId}`,
    );
  }

  // Tipos de transacción
  getTiposTransaccion(): Observable<TipoTransaccionAhorro[]> {
    return this.http.get<TipoTransaccionAhorro[]>(`${this.baseUrl}/catalogos/tipos-transaccion`);
  }

  createTipoTransaccion(data: CreateTipoTransaccionAhorroRequest): Observable<TipoTransaccionAhorro> {
    return this.http.post<TipoTransaccionAhorro>(`${this.baseUrl}/catalogos/tipos-transaccion`, data);
  }

  updateTipoTransaccion(id: number, data: Partial<CreateTipoTransaccionAhorroRequest>): Observable<TipoTransaccionAhorro> {
    return this.http.patch<TipoTransaccionAhorro>(`${this.baseUrl}/catalogos/tipos-transaccion/${id}`, data);
  }

  deleteTipoTransaccion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/catalogos/tipos-transaccion/${id}`);
  }
}
