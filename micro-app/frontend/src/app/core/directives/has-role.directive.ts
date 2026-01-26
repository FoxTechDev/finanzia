import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
  effect,
} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RoleCodes } from '../models/user.model';

/**
 * Directiva estructural para mostrar/ocultar elementos basándose en roles
 *
 * Uso:
 * <div *appHasRole="[RoleCodes.ADMIN, RoleCodes.ASESOR]">
 *   Solo visible para ADMIN y ASESOR
 * </div>
 *
 * <ng-container *appHasRole="[RoleCodes.ADMIN]">
 *   <a routerLink="/admin">Admin</a>
 * </ng-container>
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  private hasView = false;
  private requiredRoles: RoleCodes[] = [];

  constructor() {
    // Usar effect para reaccionar a cambios en el rol del usuario
    effect(() => {
      // Acceder al signal para que se suscriba a cambios
      this.authService.userRole();
      this.updateView();
    });
  }

  @Input()
  set appHasRole(roles: RoleCodes[] | RoleCodes) {
    this.requiredRoles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  private updateView(): void {
    const hasRole = this.requiredRoles.length === 0 ||
      this.authService.hasRole(...this.requiredRoles);

    if (hasRole && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasRole && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
