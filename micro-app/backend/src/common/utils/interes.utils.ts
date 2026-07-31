/**
 * Utilidades de cálculo de interés prorrateado (Actual/365, con corte por año
 * calendario para contemplar años bisiestos correctamente).
 *
 * Compartido entre módulos que necesitan prorratear interés entre dos fechas
 * (capitalización de ahorros/DPF, dividendos de acciones, etc.).
 */

export function esAnioBisiesto(anio: number): boolean {
  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
}

export function calcularInteresProrrateo(
  saldo: number,
  tasaAnual: number,
  fechaInicio: Date,
  fechaFin: Date,
): number {
  const tasa = tasaAnual / 100;
  let interes = 0;
  let current = new Date(fechaInicio);

  while (current < fechaFin) {
    const anio = current.getFullYear();
    const diasAnio = esAnioBisiesto(anio) ? 366 : 365;

    const finAnio = new Date(anio + 1, 0, 1); // 1 enero del siguiente
    const endDate = fechaFin < finAnio ? fechaFin : finAnio;

    const dias = Math.round(
      (endDate.getTime() - current.getTime()) / (1000 * 60 * 60 * 24),
    );
    interes += ((saldo * tasa) / diasAnio) * dias;

    current = new Date(endDate);
  }

  return Math.round(interes * 100) / 100;
}
