import { Component } from '@angular/core';
import { CatalogoListaComponent } from '../catalogo-lista/catalogo-lista.component';
import { CatalogoConfig } from '@core/models/catalogo.model';

@Component({
  selector: 'app-tipo-calculo',
  standalone: true,
  imports: [CatalogoListaComponent],
  template: `<app-catalogo-lista [config]="config"></app-catalogo-lista>`,
})
export class TipoCalculoComponent {
  config: CatalogoConfig = {
    titulo: 'Tipos de Cálculo',
    tituloDialogo: 'Tipo de Cálculo',
    endpoint: 'catalogos/tipo-calculo',
    icono: 'calculate',
  };
}
