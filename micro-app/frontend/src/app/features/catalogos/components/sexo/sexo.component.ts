import { Component } from '@angular/core';
import { CatalogoListaComponent } from '../catalogo-lista/catalogo-lista.component';
import { CatalogoConfig } from '@core/models/catalogo.model';

@Component({
  selector: 'app-sexo',
  standalone: true,
  imports: [CatalogoListaComponent],
  template: `<app-catalogo-lista [config]="config"></app-catalogo-lista>`,
})
export class SexoComponent {
  config: CatalogoConfig = {
    titulo: 'Género/Sexo',
    tituloDialogo: 'Género/Sexo',
    endpoint: 'catalogos/sexo',
    icono: 'wc',
  };
}
