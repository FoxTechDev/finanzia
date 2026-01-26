import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, timer, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interceptor para manejo de errores HTTP con retry logic
 *
 * Características:
 * - Retry automático para errores de red (0, 408, 429, 500, 502, 503, 504)
 * - Máximo 2 reintentos con delay incremental
 * - No reintenta errores de autenticación (401) o permisos (403)
 * - Logging condicional basado en environment
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const maxRetries = 2;
  const initialDelay = 1000; // 1 segundo

  // Determinar si la petición debe ser reintentada en caso de error
  const shouldRetry = (error: HttpErrorResponse): boolean => {
    // No reintentar errores del cliente (4xx excepto 408, 429)
    if (error.status >= 400 && error.status < 500) {
      // Reintentar solo timeouts del cliente (408) y rate limiting (429)
      return error.status === 408 || error.status === 429;
    }

    // Reintentar errores del servidor (5xx) y errores de red (status 0)
    return error.status === 0 || error.status >= 500;
  };

  return next(req).pipe(
    retry({
      count: maxRetries,
      delay: (error: HttpErrorResponse, retryCount) => {
        // Solo reintentar si cumple las condiciones
        if (!shouldRetry(error)) {
          throw error;
        }

        // Log solo en desarrollo
        if (!environment.production) {
          console.warn(
            `Reintentando petición (${retryCount}/${maxRetries}):`,
            req.url,
            `Error: ${error.status} - ${error.message}`
          );
        }

        // Delay incremental: 1s, 2s, 4s
        const delayTime = initialDelay * Math.pow(2, retryCount - 1);
        return timer(delayTime);
      },
    }),
    catchError((error: HttpErrorResponse) => {
      // Log de errores en desarrollo
      if (!environment.production) {
        console.error('Error HTTP interceptado:', {
          url: req.url,
          method: req.method,
          status: error.status,
          message: error.message,
          error: error.error,
        });
      }

      // Mensaje de error amigable para el usuario
      let userMessage = 'Ha ocurrido un error. Por favor, intenta nuevamente.';

      if (error.status === 0) {
        userMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else if (error.status === 404) {
        userMessage = 'Recurso no encontrado.';
      } else if (error.status === 500) {
        userMessage = 'Error interno del servidor. Contacta al administrador.';
      } else if (error.error?.message) {
        userMessage = error.error.message;
      }

      // Agregar mensaje amigable al error
      const enhancedError = {
        ...error,
        userMessage,
      };

      return throwError(() => enhancedError);
    })
  );
};
