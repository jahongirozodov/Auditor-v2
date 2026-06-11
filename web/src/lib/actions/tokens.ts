"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import { isAuditLeader } from "@/lib/audit-access";
import { newTokenId } from "@/lib/token-code";
import type { ActionResult, CreateResult } from "./types";

const J = (v: unknown) => JSON.parse(JSON.stringify(v));
const stamp = () => new Date().toISOString().slice(0, 16).replace("T", " ");

const IssueInput = z.object({
  auditId: z.string().min(1),
  userId: z.string().min(1),
  expires: z.string().min(4),
  device: z.string().optional(),
});

/**
 * Issue a new audit token for (audit, user). Device identity (hostname/OS/IP) is
 * bound later when the EXE agent first connects — placeholders until then. Admin-only.
 */
export async function issueToken(input: z.input<typeof IssueInput>): Promise<CreateResult> {
  const parsed = IssueInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { auditId, userId, expires, device } = parsed.data;

  const { userId: actor, role } = await requireSession();
  if (!(await requirePermission(actor, "agent.token"))) return { ok: false, error: "forbidden" };

  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    select: { id: true, leaderId: true },
  });
  if (!audit) return { ok: false, error: "not_found" };
  if (role !== "super" && role !== "head" && audit.leaderId !== actor) return { ok: false, error: "forbidden" };
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) return { ok: false, error: "not_found" };

  const id = newTokenId();
  await prisma.$transaction([
    prisma.auditToken.create({
      data: {
        id,
        auditId,
        userId,
        device: device?.trim() || "—",
        hostname: "—",
        os: "—",
        agent: "—",
        ip: "—",
        issued: stamp(),
        expires,
        status: "active",
        lastUsed: "—",
        tasks: 0,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: actor,
        action: "token.issue",
        entity: id,
        level: "info",
        payload: J({ auditId, userId }),
      },
    }),
  ]);

  revalidatePath("/tokens");
  return { ok: true, id };
}

export async function revokeToken(input: { id: string }): Promise<ActionResult> {
  const id = String(input?.id ?? "");
  if (!id) return { ok: false, error: "invalid" };

  const { userId, role } = await requireSession();
  if (!(await requirePermission(userId, "agent.revoke"))) return { ok: false, error: "forbidden" };

  const tok = await prisma.auditToken.findUnique({ where: { id }, select: { id: true, auditId: true } });
  if (!tok) return { ok: false, error: "not_found" };
  if (!(await isAuditLeader(tok.auditId, userId, role))) return { ok: false, error: "forbidden" };

  await prisma.$transaction([
    prisma.auditToken.update({ where: { id }, data: { status: "revoked" } }),
    prisma.auditLog.create({
      data: { userId, action: "token.revoke", entity: id, level: "warn", payload: J({}) },
    }),
  ]);

  revalidatePath("/tokens");
  return { ok: true };
}

/** Revoke a token and issue a fresh one for the same audit/user (rotate). Admin-only. */
export async function rotateToken(input: { id: string }): Promise<CreateResult> {
  const id = String(input?.id ?? "");
  if (!id) return { ok: false, error: "invalid" };

  const { userId: actor, role } = await requireSession();
  if (!(await requirePermission(actor, "agent.revoke"))) return { ok: false, error: "forbidden" };

  const old = await prisma.auditToken.findUnique({ where: { id } });
  if (!old) return { ok: false, error: "not_found" };
  if (!(await isAuditLeader(old.auditId, actor, role))) return { ok: false, error: "forbidden" };

  const newId = newTokenId();
  await prisma.$transaction([
    prisma.auditToken.update({ where: { id }, data: { status: "revoked" } }),
    prisma.auditToken.create({
      data: {
        id: newId,
        auditId: old.auditId,
        userId: old.userId,
        device: old.device,
        hostname: old.hostname,
        os: old.os,
        agent: old.agent,
        ip: old.ip,
        issued: stamp(),
        expires: old.expires,
        status: "active",
        lastUsed: "—",
        tasks: old.tasks,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: actor,
        action: "token.rotate",
        entity: newId,
        level: "info",
        payload: J({ replaced: id }),
      },
    }),
  ]);

  revalidatePath("/tokens");
  return { ok: true, id: newId };
}
