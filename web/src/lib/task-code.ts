/** Generate the next task code `T-{N}` from existing ids (max + 1, unpadded). Pure. */
export function nextTaskCode(existing: string[]): string {
  const prefix = "T-";
  const max = existing
    .filter((c) => c.startsWith(prefix))
    .map((c) => Number.parseInt(c.slice(prefix.length), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((m, n) => Math.max(m, n), 0);
  return `${prefix}${max + 1}`;
}
