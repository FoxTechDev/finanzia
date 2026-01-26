import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
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
  sidenavOpened = signal(false);

  constructor() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isMobile.set(result.matches);
        if (!result.matches) {
          this.sidenavOpened.set(false);
        }
      });
  }

  toggleSidenav(): void {
    this.sidenavOpened.update((v) => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}
