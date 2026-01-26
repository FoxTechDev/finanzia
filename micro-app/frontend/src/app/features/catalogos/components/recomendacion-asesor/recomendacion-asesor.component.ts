import { Component } from '@angular/core';
import { CatalogoListaComponent } from '../catalogo-lista/catalogo-lista.component';
import { CatalogoConfig } from '@core/models/catalogo.model';

@Component({
  selector: 'app-recomendacion-asesor',
  standalone: true,
  imports: [CatalogoListaComponent],
  template: `<app-catalogo-lista [config]="config"></app-catalogo-lista>`,
})
export class RecomendacionAsesorComponent {
  config: CatalogoConfig = {
    titulo: 'Recomendaciones del Asesor',
    tituloDialogo: 'Recomendación del Asesor',
    endpoint: 'catalogos/recomendacion-asesor',
    icono: 'recommend',
  };
}
