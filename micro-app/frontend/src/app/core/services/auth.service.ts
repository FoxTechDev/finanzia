import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RoleCodes,
  FeatureAccess,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'user';

  private currentUserSignal = signal<User | null>(this.getStoredUser());

  currentUser = computed(() => this.currentUserSignal());
  isAuthenticated = computed(() => !!this.currentUserSignal());

  // Computed signals para roles
  userRole = computed(() => this.currentUserSignal()?.rol?.codigo as RoleCodes | null);
  isAdmin = computed(() => this.userRole() === RoleCodes.ADMIN);
  isAsesor = computed(() => this.userRole() === RoleCodes.ASESOR);
  isComite = computed(() => this.userRole() === RoleCodes.COMITE);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          this.setToken(response.accessToken);
          this.setUser(response.user);
          this.currentUserSignal.set(response.user);
        })
      );
  }

  register(data: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/register`, data);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   * ADMIN siempre tiene acceso
   */
  hasRole(...roles: RoleCodes[]): boolean {
    const currentRole = this.userRole();
    if (!currentRole) return false;

    // ADMIN siempre tiene acceso
    if (currentRole === RoleCodes.ADMIN) return true;

    return roles.includes(currentRole);
  }

  /**
   * Verifica si el usuario puede acceder a una funcionalidad
   * basándose en el mapa de FeatureAccess
   */
  canAccess(feature: string): boolean {
    const allowedRoles = FeatureAccess[feature];
    if (!allowedRoles) return false;

    return this.hasRole(...allowedRoles);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredUser(): User | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }
}
