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
