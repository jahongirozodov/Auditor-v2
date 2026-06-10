"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";

export interface ChatMessageDTO {
  role: "user" | "ai";
  text: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  auditId: string;
  updatedAt: string;
  messageCount: number;
}

export interface ConversationDetail {
  id: string;
  title: string;
  auditId: string;
  messages: ChatMessageDTO[];
}

function titleFrom(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  return (t.length > 60 ? `${t.slice(0, 60)}…` : t) || "Suhbat";
}

const SaveInput = z.object({
  conversationId: z.string().min(1).nullish(),
  auditId: z.string().min(1),
  userText: z.string().min(1).max(20_000),
  aiText: z.string().max(20_000).default(""),
});

/**
 * Persist one chat exchange (user turn + AI turn) on the /ai assistant. Creates the
 * conversation on the first exchange (title derived from the first user message) and
 * appends to it thereafter. Scoped to the current user; never throws on a normal flow.
 */
export async function saveExchange(
  input: z.input<typeof SaveInput>,
): Promise<{ ok: boolean; conversationId?: string; title?: string; error?: string }> {
  const parsed = SaveInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { conversationId, auditId, userText, aiText } = parsed.data;

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "ai.use"))) return { ok: false, error: "forbidden" };

  const messages = {
    create: [
      { role: "user", text: userText },
      ...(aiText.trim() ? [{ role: "ai", text: aiText }] : []),
    ],
  };

  if (conversationId) {
    const existing = await prisma.aiConversation.findUnique({
      where: { id: conversationId },
      select: { userId: true },
    });
    if (!existing || existing.userId !== userId) return { ok: false, error: "not_found" };
    await prisma.aiConversation.update({
      where: { id: conversationId },
      data: { messages, updatedAt: new Date() },
    });
    return { ok: true, conversationId };
  }

  const title = titleFrom(userText);
  const created = await prisma.aiConversation.create({
    data: { userId, auditId, title, messages },
    select: { id: true, title: true },
  });
  return { ok: true, conversationId: created.id, title: created.title };
}

/** Recent saved threads for the current user + audit, newest first (for the History panel). */
export async function listConversations(input: {
  auditId: string;
}): Promise<ConversationSummary[]> {
  const auditId = z.string().min(1).safeParse(input?.auditId);
  if (!auditId.success) return [];

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "ai.use"))) return [];

  const rows = await prisma.aiConversation.findMany({
    where: { userId, auditId: auditId.data },
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: { id: true, title: true, auditId: true, updatedAt: true, _count: { select: { messages: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    auditId: r.auditId,
    updatedAt: r.updatedAt.toISOString(),
    messageCount: r._count.messages,
  }));
}

/** Load one thread's messages (ownership-checked) to restore it into the chat. */
export async function getConversation(input: {
  id: string;
}): Promise<ConversationDetail | null> {
  const id = z.string().min(1).safeParse(input?.id);
  if (!id.success) return null;

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "ai.use"))) return null;

  const row = await prisma.aiConversation.findUnique({
    where: { id: id.data },
    select: {
      id: true,
      title: true,
      auditId: true,
      userId: true,
      messages: { orderBy: { createdAt: "asc" }, select: { role: true, text: true } },
    },
  });
  if (!row || row.userId !== userId) return null;
  return {
    id: row.id,
    title: row.title,
    auditId: row.auditId,
    messages: row.messages.map((m) => ({ role: m.role === "ai" ? "ai" : "user", text: m.text })),
  };
}

/** Delete a saved thread (ownership-checked). */
export async function deleteConversation(input: {
  id: string;
}): Promise<{ ok: boolean; error?: string }> {
  const id = z.string().min(1).safeParse(input?.id);
  if (!id.success) return { ok: false, error: "invalid" };

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "ai.use"))) return { ok: false, error: "forbidden" };

  const row = await prisma.aiConversation.findUnique({
    where: { id: id.data },
    select: { userId: true },
  });
  if (!row || row.userId !== userId) return { ok: false, error: "not_found" };
  await prisma.aiConversation.delete({ where: { id: id.data } });
  return { ok: true };
}
