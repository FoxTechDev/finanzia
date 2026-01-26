import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Garantia,
  CreateGarantiaRequest,
  UpdateGarantiaRequest,
  CoberturaGarantia,
  UpdateAnalisisAsesorRequest,
  TipoGarantiaCatalogo,
  TipoInmuebleCatalogo,
  TipoDocumentoCatalogo,
  CreateTipoGarantiaCatalogoRequest,
  CreateTipoInmuebleRequest,
  CreateTipoDocumentoRequest,
} from '../../../core/models/garantia.model';
import { Solicitud } from '../../../core/models/credito.model';

@Injectable({
  providedIn: 'root',
})
export class GarantiaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/garantias`;
  private readonly solicitudesUrl = `${environment.apiUrl}/solicitudes`;
  private readonly catalogosUrl = `${environment.apiUrl}/catalogos-garantia`;

  // ============ Garantías ============

  getAll(): Observable<Garantia[]> {
    return this.http.get<Garantia[]>(this.apiUrl);
  }

  getBySolicitud(solicitudId: number): Observable<Garantia[]> {
    return this.http.get<Garantia[]>(`${this.apiUrl}/solicitud/${solicitudId}`);
  }

  getById(id: number): Observable<Garantia> {
    return this.http.get<Garantia>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateGarantiaRequest): Observable<Garantia> {
    return this.http.post<Garantia>(this.apiUrl, data);
  }

  update(id: number, data: UpdateGarantiaRequest): Observable<Garantia> {
    return this.http.patch<Garantia>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCobertura(solicitudId: number): Observable<CoberturaGarantia> {
    return this.http.get<CoberturaGarantia>(
      `${this.apiUrl}/solicitud/${solicitudId}/cobertura`
    );
  }

  // ============ Análisis del Asesor ============

  actualizarAnalisisAsesor(
    solicitudId: number,
    data: UpdateAnalisisAsesorRequest
  ): Observable<Solicitud> {
    return this.http.patch<Solicitud>(
      `${this.solicitudesUrl}/${solicitudId}/analisis-asesor`,
      data
    );
  }

  // ============ Catálogos - Tipos de Garantía ============

  getTiposGarantia(soloActivos = false): Observable<TipoGarantiaCatalogo[]> {
    const params = soloActivos ? '?activos=true' : '';
    return this.http.get<TipoGarantiaCatalogo[]>(
      `${this.catalogosUrl}/tipos-garantia${params}`
    );
  }

  getTipoGarantiaById(id: number): Observable<TipoGarantiaCatalogo> {
    return this.http.get<TipoGarantiaCatalogo>(
      `${this.catalogosUrl}/tipos-garantia/${id}`
    );
  }

  createTipoGarantia(data: CreateTipoGarantiaCatalogoRequest): Observable<TipoGarantiaCatalogo> {
    return this.http.post<TipoGarantiaCatalogo>(
      `${this.catalogosUrl}/tipos-garantia`,
      data
    );
  }

  updateTipoGarantia(id: number, data: Partial<CreateTipoGarantiaCatalogoRequest>): Observable<TipoGarantiaCatalogo> {
    return this.http.patch<TipoGarantiaCatalogo>(
      `${this.catalogosUrl}/tipos-garantia/${id}`,
      data
    );
  }

  deleteTipoGarantia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.catalogosUrl}/tipos-garantia/${id}`);
  }

  // ============ Catálogos - Tipos de Inmueble ============

  getTiposInmueble(soloActivos = false): Observable<TipoInmuebleCatalogo[]> {
    const params = soloActivos ? '?activos=true' : '';
    return this.http.get<TipoInmuebleCatalogo[]>(
      `${this.catalogosUrl}/tipos-inmueble${params}`
    );
  }

  getTipoInmuebleById(id: number): Observable<TipoInmuebleCatalogo> {
    return this.http.get<TipoInmuebleCatalogo>(
      `${this.catalogosUrl}/tipos-inmueble/${id}`
    );
  }

  createTipoInmueble(data: CreateTipoInmuebleRequest): Observable<TipoInmuebleCatalogo> {
    return this.http.post<TipoInmuebleCatalogo>(
      `${this.catalogosUrl}/tipos-inmueble`,
      data
    );
  }

  updateTipoInmueble(id: number, data: Partial<CreateTipoInmuebleRequest>): Observable<TipoInmuebleCatalogo> {
    return this.http.patch<TipoInmuebleCatalogo>(
      `${this.catalogosUrl}/tipos-inmueble/${id}`,
      data
    );
  }

  deleteTipoInmueble(id: number): Observable<void> {
    return this.http.delete<void>(`${this.catalogosUrl}/tipos-inmueble/${id}`);
  }

  // ============ Catálogos - Tipos de Documento ============

  getTiposDocumento(soloActivos = false): Observable<TipoDocumentoCatalogo[]> {
    const params = soloActivos ? '?activos=true' : '';
    return this.http.get<TipoDocumentoCatalogo[]>(
      `${this.catalogosUrl}/tipos-documento${params}`
    );
  }

  getTipoDocumentoById(id: number): Observable<TipoDocumentoCatalogo> {
    return this.http.get<TipoDocumentoCatalogo>(
      `${this.catalogosUrl}/tipos-documento/${id}`
    );
  }

  createTipoDocumento(data: CreateTipoDocumentoRequest): Observable<TipoDocumentoCatalogo> {
    return this.http.post<TipoDocumentoCatalogo>(
      `${this.catalogosUrl}/tipos-documento`,
      data
    );
  }

  updateTipoDocumento(id: number, data: Partial<CreateTipoDocumentoRequest>): Observable<TipoDocumentoCatalogo> {
    return this.http.patch<TipoDocumentoCatalogo>(
      `${this.catalogosUrl}/tipos-documento/${id}`,
      data
    );
  }

  deleteTipoDocumento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.catalogosUrl}/tipos-documento/${id}`);
  }
}
