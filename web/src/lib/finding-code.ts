/** Generate the next finding code `F-{year}-{NNNN}` (4-pad) for a year. Pure. */
export function nextFindingCode(year: string, existing: string[]): string {
  const prefix = `F-${year}-`;
  const max = existing
    .filter((c) => c.startsWith(prefix))
    .map((c) => Number.parseInt(c.slice(prefix.length), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((m, n) => Math.max(m, n), 0);
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}
