import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogoBaseService } from './catalogo-base.service';
import { CatalogoBase } from '@core/models/catalogo.model';

/**
 * Servicio de conveniencia para acceder a todos los catálogos del sistema
 * Proporciona métodos específicos para cada catálogo
 */
@Injectable({
  providedIn: 'root',
})
export class CatalogosService {
  private catalogoService = inject(CatalogoBaseService);

  // Estados de Garantía
  getEstadosGarantia(soloActivos = true): Observable<CatalogoBase[]> {
    return soloActivos
      ? this.catalogoService.getActivos('catalogos/estado-garantia')
      : this.catalogoService.getAll('catalogos/estado-garantia');
  }

  // Recomendaciones del Asesor
  getRecomendacionesAsesor(soloActivos = true): Observable<CatalogoBase[]> {
    return soloActivos
      ? this.catalogoService.getActivos('catalogos/recomendacion-asesor')
      : this.catalogoService.getAll('catalogos/recomendacion-asesor');
  }

  // Tipos de Decisión del Comité
  getTiposDecisionComite(soloActivos = true): Observable<CatalogoBase[]> {
    return soloActivos
      ? this.catalogoService.getActivos('catalogos/tipo-decision-comite')
      : this.catalogoService.getAll('catalogos/tipo-decision-comite');
  }

  // Tipos de Pago
  getTiposPago(soloActivos = true): Observable<CatalogoBase[]> {
    return soloActivos
      ? this.catalogoService.getActivos('catalogos/tipo-pago')
      : this.catalogoService.getAll('catalogos/tipo-pago');
  }

  // Estados de Pago
  getEstadosPago(soloActivos = true): Observable<CatalogoBase[]> {
    return soloActivos
      ? this.catalogoService.getActivos('catalogos/estado-pago')
      : this.catalogoService.getAll('catalogos/estado-pago');
  }

  // Género/Sexo
  getSexos(soloActivos = true): Observable<CatalogoBase[]> {
    return soloActivos
      ? this.catalogoService.getActivos('catalogos/sexo')
      : this.catalogoService.getAll('catalogos/sexo');
  }

  // Estados de Solicitud
  getEstadosSolicitud(soloActivos = true): Observable<CatalogoBase[]> {
    return soloActivos
      ? this.catalogoService.getActivos('catalogos/estado-solicitud')
      : this.catalogoService.getAll('catalogos/estado-solicitud');
  }

  // Destinos de Crédito
  getDestinosCredito(soloActivos = true): Observable<CatalogoBase[]> {
    return soloActivos
      ? this.catalogoService.getActivos('catalogos/destino-credito')
      : this.catalogoService.getAll('catalogos/destino-credito');
  }

  // Estados de Cuota
  getEstadosCuota(soloActivos = true): Observable<CatalogoBase[]> {
    return soloActivos
      ? this.catalogoService.getActivos('catalogos/estado-cuota')
      : this.catalogoService.getAll('catalogos/estado-cuota');
  }

  // Tipos de Interés
  getTiposInteres(soloActivos = true): Observable<CatalogoBase[]> {
    return soloActivos
      ? this.catalogoService.getActivos('catalogos/tipo-interes')
      : this.catalogoService.getAll('catalogos/tipo-interes');
  }

  // Periodicidad de Pago
  getPeriodicidadesPago(soloActivos = true): Observable<CatalogoBase[]> {
    return soloActivos
      ? this.catalogoService.getActivos('catalogos/periodicidad-pago')
      : this.catalogoService.getAll('catalogos/periodicidad-pago');
  }

  // Estados de Préstamo
  getEstadosPrestamo(soloActivos = true): Observable<CatalogoBase[]> {
    return soloActivos
      ? this.catalogoService.getActivos('estado-prestamo')
      : this.catalogoService.getAll('estado-prestamo');
  }

  // Categorías NCB-022
  getCategoriasNCB022(soloActivos = true): Observable<CatalogoBase[]> {
    return soloActivos
      ? this.catalogoService.getActivos('catalogos/categoria-ncb022')
      : this.catalogoService.getAll('catalogos/categoria-ncb022');
  }

  // Tipos de Cálculo
  getTiposCalculo(soloActivos = true): Observable<CatalogoBase[]> {
    return soloActivos
      ? this.catalogoService.getActivos('catalogos/tipo-calculo')
      : this.catalogoService.getAll('catalogos/tipo-calculo');
  }

  /**
   * Método genérico para obtener cualquier catálogo por endpoint
   */
  getCatalogo(endpoint: string, soloActivos = true): Observable<CatalogoBase[]> {
    return soloActivos
      ? this.catalogoService.getActivos(endpoint)
      : this.catalogoService.getAll(endpoint);
  }
}
