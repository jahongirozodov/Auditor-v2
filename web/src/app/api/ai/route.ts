import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac.server";
import { generate, getOllamaConfig, isAiEnabled } from "@/lib/ai/ollama";
import { SYSTEM } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  scope: z.literal("chat"),
  prompt: z.string().min(1).max(20_000),
});

/**
 * Local-Ollama proxy for the /ai chat report builder. Config analysis no longer
 * goes through here — it runs as a server action (uploadConfig / reanalyzeConfig)
 * because the model IS the analyzer. Writes every call to AiAnalysisResult and
 * degrades gracefully when the model is unreachable.
 */
export async function POST(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session?.user) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (!(await requirePermission(session.user.id, "ai.use")))
    return Response.json({ ok: false, error: "forbidden" }, { status: 403 });

  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  const { scope, prompt } = parsed.data;

  if (!isAiEnabled()) return Response.json({ ok: false, degraded: true, text: "" });

  const { model } = getOllamaConfig();
  const reply = await generate(`${SYSTEM[scope]}\n\n${prompt}`);

  await prisma.aiAnalysisResult.create({
    data: {
      uploadId: null,
      scope,
      model,
      input: prompt.slice(0, 20_000),
      output: reply.text,
      latencyMs: reply.latencyMs,
      tokens: reply.tokens,
      ok: reply.ok,
      createdById: session.user.id,
    },
  });

  return reply.ok
    ? Response.json({ ok: true, text: reply.text })
    : Response.json({ ok: false, degraded: true, text: "" });
}
