import { Component } from '@angular/core';
import { CatalogoListaComponent } from '../catalogo-lista/catalogo-lista.component';
import { CatalogoConfig } from '@core/models/catalogo.model';

@Component({
  selector: 'app-estado-garantia',
  standalone: true,
  imports: [CatalogoListaComponent],
  template: `<app-catalogo-lista [config]="config"></app-catalogo-lista>`,
})
export class EstadoGarantiaComponent {
  config: CatalogoConfig = {
    titulo: 'Estados de Garantía',
    tituloDialogo: 'Estado de Garantía',
    endpoint: 'catalogos/estado-garantia',
    icono: 'shield',
  };
}
