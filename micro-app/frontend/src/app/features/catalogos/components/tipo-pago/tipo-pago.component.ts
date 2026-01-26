import { Component } from '@angular/core';
import { CatalogoListaComponent } from '../catalogo-lista/catalogo-lista.component';
import { CatalogoConfig } from '@core/models/catalogo.model';

@Component({
  selector: 'app-tipo-pago',
  standalone: true,
  imports: [CatalogoListaComponent],
  template: `<app-catalogo-lista [config]="config"></app-catalogo-lista>`,
})
export class TipoPagoComponent {
  config: CatalogoConfig = {
    titulo: 'Tipos de Pago',
    tituloDialogo: 'Tipo de Pago',
    endpoint: 'catalogos/tipo-pago',
    icono: 'payment',
  };
}
