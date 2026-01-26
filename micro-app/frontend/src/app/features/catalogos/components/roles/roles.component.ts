import { Component } from '@angular/core';
import { CatalogoListaComponent } from '../catalogo-lista/catalogo-lista.component';
import { CatalogoConfig } from '@core/models/catalogo.model';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CatalogoListaComponent],
  template: `<app-catalogo-lista [config]="config"></app-catalogo-lista>`,
})
export class RolesComponent {
  config: CatalogoConfig = {
    titulo: 'Roles del Sistema',
    tituloDialogo: 'Rol',
    endpoint: 'roles',
    icono: 'admin_panel_settings',
  };
}
