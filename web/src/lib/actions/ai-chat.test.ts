// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({ allowed: true, userId: "u1" }));

vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: h.userId, role: "head", name: "" })),
}));
vi.mock("@/lib/rbac.server", () => ({ requirePermission: vi.fn(async () => h.allowed) }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    aiConversation: {
      create: vi.fn(async () => ({ id: "c-new", title: "salom" })),
      update: vi.fn(async () => ({})),
      findUnique: vi.fn(async () => ({ userId: "u1" })),
      findMany: vi.fn(async () => [
        {
          id: "c1",
          title: "T",
          auditId: "a1",
          updatedAt: new Date("2026-06-10T10:00:00Z"),
          _count: { messages: 4 },
        },
      ]),
      delete: vi.fn(async () => ({})),
    },
  },
}));

import { saveExchange, listConversations, getConversation, deleteConversation } from "./ai-chat";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

beforeEach(() => {
  vi.clearAllMocks();
  h.allowed = true;
  h.userId = "u1";
});

describe("saveExchange", () => {
  it("creates a new conversation (title from first message) when no id given", async () => {
    const res = await saveExchange({ auditId: "a1", userText: "salom dunyo", aiText: "javob" });
    expect(res).toMatchObject({ ok: true, conversationId: "c-new" });
    expect(db.aiConversation.create).toHaveBeenCalledOnce();
    const arg = db.aiConversation.create.mock.calls[0][0];
    expect(arg.data.title).toContain("salom");
    expect(arg.data.messages.create).toHaveLength(2);
  });

  it("appends to an existing owned conversation", async () => {
    const res = await saveExchange({
      conversationId: "c1",
      auditId: "a1",
      userText: "yana",
      aiText: "ok",
    });
    expect(res).toMatchObject({ ok: true, conversationId: "c1" });
    expect(db.aiConversation.update).toHaveBeenCalledOnce();
    expect(db.aiConversation.create).not.toHaveBeenCalled();
  });

  it("refuses to append to a conversation owned by someone else", async () => {
    db.aiConversation.findUnique.mockResolvedValueOnce({ userId: "other" });
    expect(await saveExchange({ conversationId: "c1", auditId: "a1", userText: "x" })).toEqual({
      ok: false,
      error: "not_found",
    });
    expect(db.aiConversation.update).not.toHaveBeenCalled();
  });

  it("forbids a user without ai permission", async () => {
    h.allowed = false;
    expect(await saveExchange({ auditId: "a1", userText: "x" })).toEqual({
      ok: false,
      error: "forbidden",
    });
  });
});

describe("listConversations", () => {
  it("maps rows to summaries with ISO dates and message counts", async () => {
    const rows = await listConversations({ auditId: "a1" });
    expect(rows[0]).toMatchObject({ id: "c1", messageCount: 4 });
    expect(rows[0].updatedAt).toMatch(/^2026-06-10/);
  });
});

describe("getConversation", () => {
  it("returns messages for an owned conversation", async () => {
    db.aiConversation.findUnique.mockResolvedValueOnce({
      id: "c1",
      title: "T",
      auditId: "a1",
      userId: "u1",
      messages: [
        { role: "user", text: "hi" },
        { role: "ai", text: "salom" },
      ],
    });
    const conv = await getConversation({ id: "c1" });
    expect(conv?.messages).toHaveLength(2);
    expect(conv?.messages[1]).toEqual({ role: "ai", text: "salom" });
  });

  it("returns null for a conversation owned by another user", async () => {
    db.aiConversation.findUnique.mockResolvedValueOnce({
      id: "c1",
      userId: "other",
      auditId: "a1",
      title: "T",
      messages: [],
    });
    expect(await getConversation({ id: "c1" })).toBeNull();
  });
});

describe("deleteConversation", () => {
  it("deletes an owned conversation", async () => {
    const res = await deleteConversation({ id: "c1" });
    expect(res).toEqual({ ok: true });
    expect(db.aiConversation.delete).toHaveBeenCalledWith({ where: { id: "c1" } });
  });
});
