import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Stream an evidence file's bytes (DB-blob storage). Auth-gated; any signed-in user may download. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const ev = await prisma.auditEvidence.findUnique({
    where: { id },
    select: { file: { select: { filename: true, mimeType: true, bytes: true } } },
  });
  if (!ev?.file?.bytes) return Response.json({ error: "not_found" }, { status: 404 });

  const safeName = ev.file.filename.replace(/["\r\n]/g, "_");
  return new Response(new Uint8Array(ev.file.bytes), {
    headers: {
      "Content-Type": ev.file.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safeName}"`,
    },
  });
}
