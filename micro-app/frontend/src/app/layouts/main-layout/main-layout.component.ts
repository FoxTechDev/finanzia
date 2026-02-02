import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '@core/services/auth.service';
import { HasRoleDirective } from '@core/directives/has-role.directive';
import { RoleCodes } from '@core/models/user.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatDividerModule,
    HasRoleDirective,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private breakpointObserver = inject(BreakpointObserver);
  protected authService = inject(AuthService);

  // Exponer RoleCodes para usar en el template
  readonly RoleCodes = RoleCodes;

  isMobile = signal(false);
  // En mobile, el sidenav empieza cerrado; en desktop se controla con sidenavMode
  private mobileSidenavOpen = signal(false);

  // Computed para determinar si el sidenav está abierto
  // En desktop (mode='side'), siempre está abierto
  // En mobile (mode='over'), se controla con mobileSidenavOpen
  sidenavOpened = computed(() => {
    if (this.isMobile()) {
      return this.mobileSidenavOpen();
    }
    return true; // En desktop siempre abierto
  });

  constructor() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isMobile.set(result.matches);
      });
  }

  toggleSidenav(): void {
    if (this.isMobile()) {
      this.mobileSidenavOpen.update((v) => !v);
    }
  }

  // Cerrar sidenav solo en mobile cuando se navega
  closeSidenavOnMobile(): void {
    if (this.isMobile()) {
      this.mobileSidenavOpen.set(false);
    }
  }

  // Manejar el evento de cierre del sidenav
  onSidenavClosed(): void {
    this.mobileSidenavOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}
