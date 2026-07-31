/**
 * Formatea una fecha usando componentes locales (año, mes, día del dispositivo).
 * Evita el desfase de timezone que ocurre con toISOString().
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parsea un string de fecha (YYYY-MM-DD) como medianoche LOCAL.
 * Si recibe un Date, lo retorna sin modificar.
 *
 * new Date("2026-02-25") se interpreta como medianoche UTC; en timezones con
 * offset negativo (ej. CST = UTC-6) esto equivale a "2026-02-24 18:00" local,
 * por lo que sumar/restar días con setDate()/getDate() queda un día corrido.
 */
export function parseLocalDate(dateStr: string | Date): Date {
  if (dateStr instanceof Date) return dateStr;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}
