import { Component } from '@angular/core';
import { CatalogoListaComponent } from '../catalogo-lista/catalogo-lista.component';
import { CatalogoConfig } from '@core/models/catalogo.model';

@Component({
  selector: 'app-tipo-interes',
  standalone: true,
  imports: [CatalogoListaComponent],
  template: `<app-catalogo-lista [config]="config"></app-catalogo-lista>`,
})
export class TipoInteresComponent {
  config: CatalogoConfig = {
    titulo: 'Tipos de Interés',
    tituloDialogo: 'Tipo de Interés',
    endpoint: 'catalogos/tipo-interes',
    icono: 'percent',
  };
}
