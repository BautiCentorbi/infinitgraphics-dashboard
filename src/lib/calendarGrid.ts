// Arma la grilla de un mes (6 semanas x 7 días, empezando el lunes) para la
// vista de calendario. Devuelve fechas fuera del mes también (se muestran
// atenuadas) para no dejar la grilla incompleta.
export function getMonthGrid(monthCursor: Date): Date[] {
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  // getDay(): 0=domingo..6=sábado. Convertimos a "días desde el lunes".
  const offset = (firstOfMonth.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - offset);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
