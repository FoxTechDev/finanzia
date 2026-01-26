import { Component } from '@angular/core';
import { CatalogoListaComponent } from '../catalogo-lista/catalogo-lista.component';
import { CatalogoConfig } from '@core/models/catalogo.model';

@Component({
  selector: 'app-destino-credito',
  standalone: true,
  imports: [CatalogoListaComponent],
  template: `<app-catalogo-lista [config]="config"></app-catalogo-lista>`,
})
export class DestinoCreditoComponent {
  config: CatalogoConfig = {
    titulo: 'Destinos del Crédito',
    tituloDialogo: 'Destino del Crédito',
    endpoint: 'catalogos/destino-credito',
    icono: 'trending_up',
  };
}
