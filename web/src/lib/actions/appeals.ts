"use server";

import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { emitNotification } from "@/lib/notifications/emit";
import type { ActionResult } from "./types";

const J = (v: unknown) => JSON.parse(JSON.stringify(v));
const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB
const MAX_FILES = 5;

export async function createAppeal(formData: FormData): Promise<ActionResult> {
  const { userId } = await requireSession();

  const type = String(formData.get("type") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priority = String(formData.get("priority") ?? "").trim() || null;

  if (!type || !["taklif", "kamchilik"].includes(type)) return { ok: false, error: "invalid_type" };
  if (!title) return { ok: false, error: "title_required" };

  const rawFiles = formData.getAll("files");
  const validFiles = rawFiles.filter((f): f is File => f instanceof File && f.size > 0);
  if (validFiles.length > MAX_FILES) return { ok: false, error: "too_many_files" };
  for (const f of validFiles) {
    if (f.size > MAX_FILE_BYTES) return { ok: false, error: "file_too_large" };
  }

  const fileBuffers = await Promise.all(
    validFiles.map(async (f) => ({
      name: f.name,
      type: f.type || "application/octet-stream",
      size: f.size,
      buf: Buffer.from(await f.arrayBuffer()),
      sha256: createHash("sha256").update(Buffer.from(await f.arrayBuffer())).digest("hex"),
    })),
  );

  await prisma.$transaction(async (tx) => {
    const appeal = await tx.appeal.create({
      data: {
        type,
        title,
        description,
        priority: type === "kamchilik" ? priority : null,
        submittedById: userId,
      },
    });

    for (const fb of fileBuffers) {
      const stored = await tx.fileStorage.create({
        data: {
          filename: fb.name,
          mimeType: fb.type,
          sizeBytes: fb.size,
          sha256: fb.sha256,
          provider: "db",
          bytes: fb.buf,
          uploadedById: userId,
        },
      });
      await tx.appealFile.create({
        data: { appealId: appeal.id, fileId: stored.id, uploadedById: userId },
      });
    }

    await tx.auditLog.create({
      data: {
        userId,
        action: "appeal.create",
        entity: appeal.id,
        level: "info",
        payload: J({ type, title }),
      },
    });
  });

  revalidatePath("/appeals");
  return { ok: true };
}

export async function reviewAppeal(params: {
  id: string;
  status: "reviewing" | "accepted" | "rejected" | "completed";
  comment?: string;
}): Promise<ActionResult> {
  const { userId, role } = await requireSession();
  if (role !== "super") return { ok: false, error: "forbidden" };

  const appeal = await prisma.appeal.findUnique({
    where: { id: params.id },
    select: { id: true, status: true, submittedById: true, title: true },
  });
  if (!appeal) return { ok: false, error: "not_found" };

  const isTerminal = appeal.status === "accepted" || appeal.status === "rejected" || appeal.status === "completed";
  if (isTerminal) return { ok: false, error: "already_resolved" };

  await prisma.$transaction(async (tx) => {
    await tx.appeal.update({
      where: { id: params.id },
      data: {
        status: params.status,
        reviewComment: params.comment?.trim() || null,
        reviewedById: params.status !== "reviewing" ? userId : undefined,
        reviewedAt: params.status !== "reviewing" ? new Date() : undefined,
      },
    });

    await tx.auditLog.create({
      data: {
        userId,
        action: "appeal.status_change",
        entity: params.id,
        level: "info",
        payload: J({ from: appeal.status, to: params.status, comment: params.comment }),
      },
    });

    await emitNotification(tx, {
      type: "appeal_status_changed",
      recipients: [appeal.submittedById],
      actorId: userId,
      params: { title: appeal.title, status: params.status },
      href: "/appeals",
      entityType: "appeal",
      entityId: params.id,
    });
  });

  revalidatePath("/appeals");
  return { ok: true };
}
