import { Component } from '@angular/core';
import { CatalogoListaComponent } from '../catalogo-lista/catalogo-lista.component';
import { CatalogoConfig } from '@core/models/catalogo.model';

@Component({
  selector: 'app-estado-prestamo',
  standalone: true,
  imports: [CatalogoListaComponent],
  template: `<app-catalogo-lista [config]="config"></app-catalogo-lista>`,
})
export class EstadoPrestamoComponent {
  config: CatalogoConfig = {
    titulo: 'Estados del Préstamo',
    tituloDialogo: 'Estado del Préstamo',
    endpoint: 'estado-prestamo',
    icono: 'account_balance_wallet',
  };
}
