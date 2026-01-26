import { Component } from '@angular/core';
import { CatalogoListaComponent } from '../catalogo-lista/catalogo-lista.component';
import { CatalogoConfig } from '@core/models/catalogo.model';

@Component({
  selector: 'app-periodicidad-pago',
  standalone: true,
  imports: [CatalogoListaComponent],
  template: `<app-catalogo-lista [config]="config"></app-catalogo-lista>`,
})
export class PeriodicidadPagoComponent {
  config: CatalogoConfig = {
    titulo: 'Periodicidad de Pago',
    tituloDialogo: 'Periodicidad de Pago',
    endpoint: 'catalogos/periodicidad-pago',
    icono: 'calendar_month',
  };
}
