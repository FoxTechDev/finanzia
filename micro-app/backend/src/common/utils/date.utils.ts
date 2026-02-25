/**
 * Utilidades para manejo de fechas sin problemas de timezone.
 *
 * Problema: new Date("2026-02-25") se interpreta como medianoche UTC.
 * En zonas horarias con offset negativo (ej. CST = UTC-6), esto resulta
 * en "2026-02-24 18:00:00" local, causando que MySQL guarde el día anterior.
 *
 * Solución: parsear strings de fecha como medianoche LOCAL y formatear
 * usando componentes locales en lugar de toISOString() (que convierte a UTC).
 */

/**
 * Parsea un string de fecha (YYYY-MM-DD) como medianoche LOCAL.
 * Si recibe un Date, lo retorna sin modificar.
 *
 * @example
 * // En CST (UTC-6):
 * new Date("2026-02-25")        → Feb 24 18:00 local ❌
 * parseLocalDate("2026-02-25")  → Feb 25 00:00 local ✅
 */
export function parseLocalDate(dateStr: string | Date): Date {
  if (dateStr instanceof Date) return dateStr;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formatea un Date a string YYYY-MM-DD usando timezone LOCAL.
 *
 * @example
 * // En CST (UTC-6), con fecha Feb 25 00:00 local:
 * date.toISOString().split('T')[0]  → "2026-02-25" (ok aquí, pero falla si es tarde)
 * formatLocalDate(date)             → "2026-02-25" (siempre correcto)
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
