/** New audit-token id: `tk_` + 16 hex chars. Unique per issue. */
export function newTokenId(): string {
  const uuid = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}${Math.random()}`;
  return `tk_${uuid.replace(/[^a-f0-9]/gi, "").slice(0, 16)}`;
}
