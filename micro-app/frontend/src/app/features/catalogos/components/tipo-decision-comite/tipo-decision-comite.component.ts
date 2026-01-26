import { Component } from '@angular/core';
import { CatalogoListaComponent } from '../catalogo-lista/catalogo-lista.component';
import { CatalogoConfig } from '@core/models/catalogo.model';

@Component({
  selector: 'app-tipo-decision-comite',
  standalone: true,
  imports: [CatalogoListaComponent],
  template: `<app-catalogo-lista [config]="config"></app-catalogo-lista>`,
})
export class TipoDecisionComiteComponent {
  config: CatalogoConfig = {
    titulo: 'Tipos de Decisión del Comité',
    tituloDialogo: 'Tipo de Decisión del Comité',
    endpoint: 'catalogos/tipo-decision-comite',
    icono: 'gavel',
  };
}
