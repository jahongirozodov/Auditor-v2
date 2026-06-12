"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import { getOllamaConfig } from "@/lib/ai/ollama";
import { buildTopology } from "@/lib/analysis/topology/build";
import { analyzeTopologyAI } from "@/lib/analysis/topology/ai";
import { enrichTopologyNodes } from "@/lib/analysis/topology/enrich";
import type { TopologyAnalysis } from "@/lib/analysis/topology/types";

const J = (v: unknown) => JSON.parse(JSON.stringify(v));

export interface AnalyzeTopologyResult {
  ok: boolean;
  error?: string;
  analysis?: TopologyAnalysis;
}

/**
 * Build the audit's topology from the DB, run the AI analysis, and persist it
 * (`TopologyAiAnalysis`). Graceful — the graph is already rendered by the page, so
 * a down model just returns `ai_unavailable` and nothing is stored.
 */
export async function analyzeTopology(input: { auditId: string }): Promise<AnalyzeTopologyResult> {
  const auditId = z.string().min(1).safeParse(input?.auditId);
  if (!auditId.success) return { ok: false, error: "invalid" };

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "ai.use"))) return { ok: false, error: "forbidden" };

  const topology = await buildTopology(auditId.data);
  if (topology.nodes.length === 0) return { ok: false, error: "empty" };

  const r = await analyzeTopologyAI(topology);
  if (!r.ok || !r.analysis) return { ok: false, error: "ai_unavailable" };
  const { model } = getOllamaConfig();

  await prisma.topologyAiAnalysis.create({
    data: {
      auditId: auditId.data,
      model,
      input: `topology:${auditId.data}`,
      output: r.raw,
      latencyMs: r.latencyMs,
      tokens: r.tokens,
      ok: true,
      createdById: userId,
    },
  });
  await prisma.auditLog.create({
    data: {
      userId,
      action: "topology.analyze",
      entity: auditId.data,
      level: "info",
      payload: J({ nodes: topology.nodes.length, edges: topology.edges.length }),
    },
  });

  revalidatePath("/analysis/topology");
  return { ok: true, analysis: r.analysis };
}

export interface EnrichTopologyActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Manual re-trigger of topology enrichment — persists AI node patches to DB.
 * Called when the user clicks "AI boyit" on the topology page.
 */
export async function enrichTopology(input: {
  auditId: string;
}): Promise<EnrichTopologyActionResult> {
  const auditId = z.string().min(1).safeParse(input?.auditId);
  if (!auditId.success) return { ok: false, error: "invalid" };

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "ai.use"))) return { ok: false, error: "forbidden" };

  const topology = await buildTopology(auditId.data);
  if (topology.nodes.length === 0) return { ok: false, error: "empty" };

  const r = await enrichTopologyNodes(topology);
  if (!r.ok) return { ok: false, error: "ai_unavailable" };

  const { model } = getOllamaConfig();
  await prisma.topologyEnrichment.create({
    data: {
      auditId: auditId.data,
      output: r.raw,
      model,
      latencyMs: r.latencyMs,
      tokens: r.tokens,
      ok: true,
      createdById: userId,
    },
  });
  await prisma.auditLog.create({
    data: {
      userId,
      action: "topology.enrich",
      entity: auditId.data,
      level: "info",
      payload: J({ nodes: topology.nodes.length, patches: r.patches.length }),
    },
  });

  revalidatePath("/analysis/topology");
  return { ok: true };
}
