import { Component } from '@angular/core';
import { CatalogoListaComponent } from '../catalogo-lista/catalogo-lista.component';
import { CatalogoConfig } from '@core/models/catalogo.model';

@Component({
  selector: 'app-estado-pago',
  standalone: true,
  imports: [CatalogoListaComponent],
  template: `<app-catalogo-lista [config]="config"></app-catalogo-lista>`,
})
export class EstadoPagoComponent {
  config: CatalogoConfig = {
    titulo: 'Estados de Pago',
    tituloDialogo: 'Estado de Pago',
    endpoint: 'catalogos/estado-pago',
    icono: 'receipt',
  };
}
