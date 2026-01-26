import { Component } from '@angular/core';
import { CatalogoListaComponent } from '../catalogo-lista/catalogo-lista.component';
import { CatalogoConfig } from '@core/models/catalogo.model';

@Component({
  selector: 'app-estado-solicitud',
  standalone: true,
  imports: [CatalogoListaComponent],
  template: `<app-catalogo-lista [config]="config"></app-catalogo-lista>`,
})
export class EstadoSolicitudComponent {
  config: CatalogoConfig = {
    titulo: 'Estados de Solicitud',
    tituloDialogo: 'Estado de Solicitud',
    endpoint: 'catalogos/estado-solicitud',
    icono: 'assignment',
  };
}
