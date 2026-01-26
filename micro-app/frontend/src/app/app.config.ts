import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-SV';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

// Registrar el locale de español (El Salvador - usa punto como separador decimal)
registerLocaleData(localeEs, 'es-SV');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    // Los interceptores se ejecutan en el orden especificado
    // 1. errorInterceptor: maneja reintentos y errores generales
    // 2. authInterceptor: agrega token y maneja errores 401
    provideHttpClient(withInterceptors([errorInterceptor, authInterceptor])),
    provideNativeDateAdapter(),
    { provide: LOCALE_ID, useValue: 'es-SV' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-SV' },
  ],
};
