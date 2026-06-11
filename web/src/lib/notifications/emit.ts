import "server-only";
import type { Prisma } from "@prisma/client";
import { NOTIF_GATING, type NotificationType, type NotifParams } from "./types";

const J = (v: unknown) => JSON.parse(JSON.stringify(v));

export async function emitNotification(
  tx: Prisma.TransactionClient,
  opts: {
    type: NotificationType;
    recipients: string[];
    actorId?: string | null;
    params: NotifParams;
    href: string | null;
    auditId?: string | null;
    entityType?: string | null;
    entityId?: string | null;
  },
): Promise<void> {
  const { type, recipients, actorId, params, href, auditId, entityType, entityId } = opts;

  // Dedupe + drop the actor (never notify someone of their own action).
  const targets = [...new Set(recipients)].filter((id) => id && id !== actorId);
  if (targets.length === 0) return;

  // Gating: only the mapped types consult the global toggle.
  const toggle = NOTIF_GATING[type];
  if (toggle) {
    const row = await tx.systemSetting.findUnique({ where: { key: "system" } });
    const notif = (row?.value as { notif?: Record<string, boolean> } | null)?.notif;
    if (notif && notif[toggle] === false) return;
  }

  await tx.notification.createMany({
    data: targets.map((userId) => ({
      userId,
      type,
      params: J(params),
      href: href ?? null,
      auditId: auditId ?? null,
      entityType: entityType ?? null,
      entityId: entityId ?? null,
      actorId: actorId ?? null,
    })),
  });
}
