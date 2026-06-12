import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;

  const submission = await prisma.taskSubmissionFile.findFirst({
    where: { fileId: id },
    select: {
      file: { select: { filename: true, mimeType: true, bytes: true } },
      history: { select: { taskId: true } },
    },
  });

  if (!submission?.file?.bytes) return Response.json({ error: "not_found" }, { status: 404 });

  const userId = session.user.id;
  const role = session.user.role;

  if (role !== "super" && role !== "head") {
    const task = await prisma.task.findUnique({
      where: { id: submission.history.taskId },
      select: {
        audit: {
          select: {
            leaderId: true,
            members: { select: { userId: true } },
          },
        },
      },
    });
    const audit = task?.audit;
    const isMember = audit?.leaderId === userId || audit?.members.some((m) => m.userId === userId);
    if (!isMember) return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const safeName = submission.file.filename.replace(/["\r\n]/g, "_");
  return new Response(new Uint8Array(submission.file.bytes), {
    headers: {
      "Content-Type": submission.file.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safeName}"`,
    },
  });
}
