import { prisma } from "@/lib/prisma";
import { json } from "@/lib/agent/util";

/** Connectivity probe (anonymous). The agent uses this to flip online/offline. */
export async function GET() {
  const latest = await prisma.desktopAgentVersion.findFirst({
    orderBy: { createdAt: "desc" },
    select: { version: true },
  });
  return json({
    ok: true,
    serverTime: new Date().toISOString(),
    minAgentVersion: latest?.version ?? null,
  });
}
