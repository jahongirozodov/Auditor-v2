// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  role: "t1" as string,
  userId: "u1",
  findRows: [] as Array<Record<string, unknown>>,
  findMany: vi.fn(),
  count: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: h.userId, role: h.role, name: "" })),
}));
vi.mock("@/lib/rbac.server", () => ({ requirePermission: vi.fn(async () => true) }));
vi.mock("@/lib/prisma", () => ({
  prisma: { auditLog: { findMany: h.findMany, count: h.count } },
}));

import { fetchAuditLogs } from "./logs";

const findMany = h.findMany;

const row = (id: string) => ({
  id,
  createdAt: new Date("2026-06-01T10:00:00.000Z"),
  userId: "u1",
  user: { name: "Akmal", avatar: "AY" },
  action: "auth.login",
  entity: "u1",
  ip: "10.0.0.1",
  device: "Chrome",
  level: "info",
  payload: { ok: true },
});

beforeEach(() => {
  vi.clearAllMocks();
  h.role = "t1";
  h.findRows = [row("L1")];
  h.findMany.mockImplementation(async () => h.findRows);
  h.count.mockResolvedValue(3);
});

describe("fetchAuditLogs scope", () => {
  it("scopes non-admins to their own actions", async () => {
    h.role = "t1";
    await fetchAuditLogs({});
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: "u1" }) }),
    );
  });

  it("does not force userId for admins, honours actorId", async () => {
    h.role = "super";
    await fetchAuditLogs({ actorId: "u7" });
    const where = findMany.mock.calls[0][0].where;
    expect(where.userId).toBe("u7");
  });

  it("admin without actorId sees all (no userId filter)", async () => {
    h.role = "head";
    await fetchAuditLogs({});
    const where = findMany.mock.calls[0][0].where;
    expect(where.userId).toBeUndefined();
  });
});

describe("fetchAuditLogs filters", () => {
  it("maps a category to an action prefix", async () => {
    await fetchAuditLogs({ category: "finding" });
    const where = findMany.mock.calls[0][0].where;
    expect(where.action).toEqual({ startsWith: "finding" });
  });

  it("maps the error category to level != info", async () => {
    await fetchAuditLogs({ category: "error" });
    const where = findMany.mock.calls[0][0].where;
    expect(where.level).toEqual({ not: "info" });
  });

  it("builds an OR text search", async () => {
    await fetchAuditLogs({ q: "login" });
    const where = findMany.mock.calls[0][0].where;
    expect(Array.isArray(where.OR)).toBe(true);
    expect(where.OR.length).toBe(5);
  });
});

describe("fetchAuditLogs pagination + shape", () => {
  it("trims the extra row and sets nextCursor when more exist", async () => {
    h.findRows = Array.from({ length: 51 }, (_, i) => row(`L${i}`));
    const page = await fetchAuditLogs({});
    expect(page.rows.length).toBe(50);
    expect(page.nextCursor).toBe("L49");
  });

  it("returns null cursor when no more rows", async () => {
    h.findRows = [row("L1")];
    const page = await fetchAuditLogs({});
    expect(page.nextCursor).toBeNull();
    expect(page.rows[0]).toMatchObject({ action: "auth.login", payload: { ok: true } });
    expect(page.counts.all).toBe(3);
  });
});
