import { Component } from '@angular/core';
import { CatalogoListaComponent } from '../catalogo-lista/catalogo-lista.component';
import { CatalogoConfig } from '@core/models/catalogo.model';

/**
 * Componente para gestionar el catálogo de Tipos de Vivienda
 *
 * Utiliza el componente genérico CatalogoListaComponent para proporcionar
 * funcionalidad CRUD completa (Crear, Leer, Actualizar, Eliminar).
 */
@Component({
  selector: 'app-tipos-vivienda',
  standalone: true,
  imports: [CatalogoListaComponent],
  template: `<app-catalogo-lista [config]="config"></app-catalogo-lista>`,
})
export class TiposViviendaComponent {
  config: CatalogoConfig = {
    titulo: 'Tipos de Vivienda',
    tituloDialogo: 'Tipo de Vivienda',
    endpoint: 'tipo-vivienda',
    icono: 'home',
  };
}
