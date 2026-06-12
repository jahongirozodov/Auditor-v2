import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; fileId: string }> },
) {
  const session = await getSession();
  if (!session?.user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id, fileId } = await params;

  const af = await prisma.appealFile.findFirst({
    where: { id: fileId, appealId: id },
    select: {
      uploadedById: true,
      appeal: { select: { submittedById: true } },
      file: { select: { filename: true, mimeType: true, bytes: true } },
    },
  });
  if (!af?.file?.bytes) return Response.json({ error: "not_found" }, { status: 404 });

  // Super can download anything; others can only download files from their own appeals.
  const { id: userId, role } = session.user;
  if (role !== "super" && af.appeal.submittedById !== userId) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const safeName = af.file.filename.replace(/["\r\n]/g, "_");
  return new Response(new Uint8Array(af.file.bytes), {
    headers: {
      "Content-Type": af.file.mimeType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${safeName}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
