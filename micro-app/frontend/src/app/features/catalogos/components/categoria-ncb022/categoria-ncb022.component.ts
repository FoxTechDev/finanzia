import { Component } from '@angular/core';
import { CatalogoListaComponent } from '../catalogo-lista/catalogo-lista.component';
import { CatalogoConfig } from '@core/models/catalogo.model';

@Component({
  selector: 'app-categoria-ncb022',
  standalone: true,
  imports: [CatalogoListaComponent],
  template: `<app-catalogo-lista [config]="config"></app-catalogo-lista>`,
})
export class CategoriaNcb022Component {
  config: CatalogoConfig = {
    titulo: 'Categorías NCB-022 (Clasificación de Préstamos)',
    tituloDialogo: 'Clasificación de Préstamo',
    endpoint: 'clasificacion-prestamo',
    icono: 'category',
  };
}
