import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { getSession } from "@/lib/session";
import { getAgentVersion } from "@/lib/data/agent";

export const runtime = "nodejs";

/**
 * Serve the published desktop-agent EXE (the /agent screen's "EXE yuklab olish").
 * Built by `agent/deploy/publish-agent.ps1` → `agent/publish/…exe`; override the
 * location with AGENT_EXE_PATH. Web-session gated (internal admin download).
 */
function exePath(): string {
  return (
    process.env.AGENT_EXE_PATH ||
    path.join(process.cwd(), "..", "agent", "publish", "Auditor.Agent.Desktop.exe")
  );
}

export async function GET() {
  const session = await getSession();
  if (!session?.user) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const file = exePath();
  let size: number;
  try {
    const s = await stat(file);
    if (!s.isFile()) throw new Error("not a file");
    size = s.size;
  } catch {
    // Not published yet — the UI surfaces this as a toast.
    return Response.json({ ok: false, error: "not_published" }, { status: 404 });
  }

  const version = (await getAgentVersion())?.version ?? "1.0.0";
  const body = Readable.toWeb(createReadStream(file)) as ReadableStream;

  return new Response(body, {
    headers: {
      "Content-Type": "application/vnd.microsoft.portable-executable",
      "Content-Length": String(size),
      "Content-Disposition": `attachment; filename="AuditorAgent_v${version}.exe"`,
      "Cache-Control": "no-store",
    },
  });
}
