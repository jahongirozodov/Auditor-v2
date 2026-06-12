import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Stream a finding evidence file's bytes (DB-blob storage). Auth-gated. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const ev = await prisma.findingEvidence.findUnique({
    where: { id },
    select: { file: { select: { filename: true, mimeType: true, bytes: true } } },
  });
  if (!ev?.file?.bytes) return Response.json({ error: "not_found" }, { status: 404 });

  const safeName = ev.file.filename.replace(/["\r\n]/g, "_");
  return new Response(new Uint8Array(ev.file.bytes), {
    headers: {
      "Content-Type": ev.file.mimeType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${safeName}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
