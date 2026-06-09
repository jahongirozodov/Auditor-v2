/** Generate the next audit code `AUD-{year}-{NNN}` (zero-padded) for a year. Pure. */
export function nextAuditCode(year: string, existing: string[]): string {
  const prefix = `AUD-${year}-`;
  const max = existing
    .filter((c) => c.startsWith(prefix))
    .map((c) => Number.parseInt(c.slice(prefix.length), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((m, n) => Math.max(m, n), 0);
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}
