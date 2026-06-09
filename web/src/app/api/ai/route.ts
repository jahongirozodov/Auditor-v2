import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { generate, getOllamaConfig, isAiEnabled } from "@/lib/ai/ollama";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  scope: z.literal("config"),
  uploadId: z.string().min(1),
  prompt: z.string().min(1).max(20_000),
});

const SYSTEM = [
  "Sen Auditor kiberxavfsizlik audit platformasining AI yordamchisisan — lokal Ollama, yopiq tarmoq.",
  "Faqat o‘zbek tilida (lotin yozuvi), rasmiy va aniq javob ber.",
  "Konfiguratsiya tahlili natijalarini izohlab, har bir kamchilik uchun qisqa remediation tavsiyasini ber.",
].join("\n");

/**
 * Local-Ollama proxy for config-analysis enrichment. Writes every call to
 * AiAnalysisResult (docs/05) and degrades gracefully: unreachable AI → `degraded`
 * with no text, so the caller still creates drafts. Output is plain text (the
 * client never renders it as HTML).
 */
export async function POST(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session?.user) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  const { scope, uploadId, prompt } = parsed.data;

  if (!isAiEnabled()) return Response.json({ ok: false, degraded: true, text: "" });

  const { model } = getOllamaConfig();
  const reply = await generate(`${SYSTEM}\n\n${prompt}`);

  // Persist the call. The upload may be transient (not yet/never stored) — null the
  // FK in that case rather than failing the request.
  const exists = uploadId
    ? await prisma.configUpload.findUnique({ where: { id: uploadId }, select: { id: true } })
    : null;
  await prisma.aiAnalysisResult.create({
    data: {
      uploadId: exists ? uploadId : null,
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
