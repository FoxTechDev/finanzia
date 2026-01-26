import { Component } from '@angular/core';
import { CatalogoListaComponent } from '../catalogo-lista/catalogo-lista.component';
import { CatalogoConfig } from '@core/models/catalogo.model';

@Component({
  selector: 'app-estado-cuota',
  standalone: true,
  imports: [CatalogoListaComponent],
  template: `<app-catalogo-lista [config]="config"></app-catalogo-lista>`,
})
export class EstadoCuotaComponent {
  config: CatalogoConfig = {
    titulo: 'Estados de Cuota',
    tituloDialogo: 'Estado de Cuota',
    endpoint: 'catalogos/estado-cuota',
    icono: 'event_note',
  };
}
