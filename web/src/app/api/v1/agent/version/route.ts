import { prisma } from "@/lib/prisma";
import { json } from "@/lib/agent/util";

/** Latest published agent build (anonymous) — drives the update notice (TZ §16). */
export async function GET() {
  const latest = await prisma.desktopAgentVersion.findFirst({
    orderBy: { createdAt: "desc" },
    select: { version: true, sha256: true, signature: true, notes: true, createdAt: true },
  });
  if (!latest) return json({ ok: false, error: "no_version" }, 404);
  return json({ ok: true, ...latest });
}
