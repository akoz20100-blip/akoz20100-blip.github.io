/** Small, dependency-free date helpers operating on ISO `YYYY-MM-DD` strings (UTC). */

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseISODate(iso: string): Date {
  // Anchor at UTC midnight so day math is stable regardless of host timezone.
  const [y, m, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, day ?? 1));
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toISODate(d);
}

export function addMonths(iso: string, months: number): string {
  const d = parseISODate(iso);
  d.setUTCMonth(d.getUTCMonth() + months);
  return toISODate(d);
}

/** Whole days from `a` to `b` (b - a). Negative if b is before a. */
export function daysBetween(a: string, b: string): number {
  const ms = parseISODate(b).getTime() - parseISODate(a).getTime();
  return Math.round(ms / 86_400_000);
}

/** First day of the year-month for an ISO date, e.g. "2026-06-26" -> "2026-06". */
export function yearMonth(iso: string): string {
  return iso.slice(0, 7);
}

export function todayISO(): string {
  return toISODate(new Date());
}
