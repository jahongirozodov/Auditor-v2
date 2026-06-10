import { prisma } from "@/lib/prisma";
import { requireAgent } from "@/lib/agent/auth";
import { json } from "@/lib/agent/util";

/** Evidence files attached to a finding (agent JWT). The finding must be in the token's audit. */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAgent(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const { auditId } = auth.identity;
  const { id } = await ctx.params;

  const finding = await prisma.finding.findFirst({
    where: { id, auditId },
    select: { id: true },
  });
  if (!finding) return json({ ok: false, error: "not_found" }, 404);

  const rows = await prisma.findingEvidence.findMany({
    where: { findingId: id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      kind: true,
      createdAt: true,
      file: { select: { filename: true, mimeType: true, sizeBytes: true, sha256: true } },
    },
  });

  return json({
    ok: true,
    evidences: rows.map((e) => ({
      id: e.id,
      kind: e.kind,
      filename: e.file.filename,
      mimeType: e.file.mimeType,
      sizeBytes: e.file.sizeBytes,
      sha256: e.file.sha256,
      createdAt: e.createdAt.toISOString(),
    })),
  });
}
