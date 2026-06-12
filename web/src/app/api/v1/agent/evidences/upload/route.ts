import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireAgent } from "@/lib/agent/auth";
import { json, clientIp } from "@/lib/agent/util";

export const runtime = "nodejs";

const MAX_BYTES = 100 * 1024 * 1024; // pcaps can be large

/**
 * Upload one evidence file for an agent-synced finding (multipart, agent JWT). Bytes
 * are stored in Postgres (FileStorage.bytes = bytea); a FindingEvidence row links it
 * to the finding (matched by its offline idempotency_key, scoped to the token's audit).
 */
export async function POST(req: Request) {
  const auth = await requireAgent(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const { userId, auditId, tokenId } = auth.identity;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ ok: false, error: "invalid" }, 400);
  }

  const file = form.get("file");
  const findingKey = String(form.get("findingKey") ?? "");
  if (!(file instanceof File) || !findingKey) return json({ ok: false, error: "invalid" }, 400);
  if (file.size > MAX_BYTES) return json({ ok: false, error: "too_large" }, 413);

  // The finding must already be synced (findings/sync runs before evidence).
  const finding = await prisma.finding.findFirst({
    where: { idempotencyKey: findingKey, auditId },
    select: { id: true },
  });
  if (!finding) return json({ ok: false, error: "finding_not_found" }, 404);

  const bytes = Buffer.from(await file.arrayBuffer());
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const mimeType = file.type || "application/octet-stream";
  const kind = mimeType.startsWith("image/") ? "screenshot" : "file";

  let evidenceId = "";
  await prisma.$transaction(async (tx) => {
    const stored = await tx.fileStorage.create({
      data: {
        filename: file.name,
        mimeType,
        sizeBytes: bytes.byteLength,
        sha256,
        provider: "db",
        bytes,
        uploadedById: userId,
      },
    });
    const ev = await tx.findingEvidence.create({
      data: { findingId: finding.id, fileId: stored.id, kind, uploadedById: userId },
    });
    evidenceId = ev.id;
    await tx.finding.update({
      where: { id: finding.id },
      data: { evidence: { increment: 1 } },
    });
    await tx.auditTokenUsageLog.create({
      data: { tokenId, action: "evidence.upload", status: "ok", ip: clientIp(req) },
    });
  });

  return json({ ok: true, id: evidenceId });
}
