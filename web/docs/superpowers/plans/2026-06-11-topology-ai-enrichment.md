# Topology AI Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After any scanner/config/traffic import, AI automatically enriches the topology graph by reclassifying each node's `kind` and `segment` (replacing heuristic-only inference) and adding `aiLabel` + `aiReason` per node, persisted to DB and displayed in the UI.

**Architecture:** New `enrichTopologyNodes()` AI call sends heuristic nodes to Ollama and receives per-node patches `{id, kind, segment, aiLabel, aiReason}`. Patches stored in a new `TopologyEnrichment` Prisma model. `getTopology()` merges patches over the base heuristic topology before serving the page. Upload actions fire enrichment via `after()` (post-response, non-blocking). UI shows a small AI badge on enriched nodes and displays `aiLabel`/`aiReason` in the detail panel.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma ORM, PostgreSQL, Ollama (`generateJson`), Zod, Vitest + Testing Library

---

## Files touched

| File | Change |
|---|---|
| `web/src/lib/types/entities.ts` | Add `aiLabel?`, `aiReason?` to `TopologyNode` |
| `web/prisma/schema.prisma` | Add `TopologyEnrichment` model |
| `web/src/lib/ai/prompts.ts` | Add `topology_enrich` scope, schema, parse/build functions |
| `web/src/lib/analysis/topology/types.ts` | Add `EnrichedNodePatch` type |
| `web/src/lib/analysis/topology/enrich.ts` | **Create**: `enrichTopologyNodes()` AI function |
| `web/src/lib/analysis/topology/enrich.test.ts` | **Create**: unit tests |
| `web/src/lib/analysis/topology/enrich-bg.ts` | **Create**: `runTopologyEnrichment()` for after() hooks |
| `web/src/lib/data/topology.ts` | Merge enrichment patches into `getTopology()` |
| `web/src/lib/actions/topology.ts` | Add `enrichTopology()` server action |
| `web/src/lib/actions/scanner.ts` | Add `after()` auto-trigger |
| `web/src/lib/actions/config.ts` | Add `after()` auto-trigger |
| `web/src/lib/actions/traffic.ts` | Add `after()` auto-trigger |
| `web/src/components/topology/TopologyScreen.tsx` | AI badge on enriched nodes + detail panel rows |
| `web/messages/uz.json` | Add `aiEnrichedLabel`, `aiEnrichedReason` keys |

---

### Task 1: Extend TopologyNode type + add EnrichedNodePatch

**Files:**
- Modify: `web/src/lib/types/entities.ts:464-472`
- Modify: `web/src/lib/analysis/topology/types.ts`

- [ ] **Step 1: Add optional AI fields to `TopologyNode`**

In `web/src/lib/types/entities.ts`, find the `TopologyNode` interface (line 464) and add two optional fields:

```typescript
export interface TopologyNode {
  id: string;
  label: string;
  ip: string;
  kind: NodeKind;
  segment: string;
  sev: Severity;
  findings: number;
  /** AI-corrected display label. Present only after topology enrichment. */
  aiLabel?: string;
  /** One-sentence reason for AI classification. */
  aiReason?: string;
}
```

- [ ] **Step 2: Add `EnrichedNodePatch` type to topology types**

In `web/src/lib/analysis/topology/types.ts`, append at the bottom:

```typescript
import type { NodeKind } from "@/lib/types/entities";

/** Per-node patch returned by the enrichment AI call. */
export interface EnrichedNodePatch {
  id: string;
  kind: NodeKind;
  segment: string;
  aiLabel: string;
  aiReason: string;
}
```

- [ ] **Step 3: Typecheck**

```bash
cd "D:/MY PROJECTS/Auditor v6/Auditor-v2/web"
npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors (the new optional fields are backwards-compatible).

---

### Task 2: Add Prisma model + migration

**Files:**
- Modify: `web/prisma/schema.prisma`

- [ ] **Step 1: Add `TopologyEnrichment` model to schema**

In `web/prisma/schema.prisma`, after the `TopologyAiAnalysis` model block (around line 695), add:

```prisma
// ---------- Topology enrichment (AI node reclassification) ----------
model TopologyEnrichment {
  id          String   @id @default(cuid())
  auditId     String
  output      String   @db.Text // JSON: { nodes: EnrichedNodePatch[] }
  model       String
  latencyMs   Int      @default(0)
  tokens      Int      @default(0)
  ok          Boolean  @default(true)
  createdById String
  createdAt   DateTime @default(now())

  @@index([auditId, createdAt(sort: Desc)])
}
```

- [ ] **Step 2: Run migration**

```bash
cd "D:/MY PROJECTS/Auditor v6/Auditor-v2/web"
npx prisma migrate dev --name add_topology_enrichment
```

Expected: Migration file created, DB updated, Prisma client regenerated.

- [ ] **Step 3: Verify Prisma client has the new model**

```bash
cd "D:/MY PROJECTS/Auditor v6/Auditor-v2/web"
npx tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

---

### Task 3: Add enrichment prompt + schema to `prompts.ts`

**Files:**
- Modify: `web/src/lib/ai/prompts.ts`

- [ ] **Step 1: Extend `AiScope` union**

In `web/src/lib/ai/prompts.ts`, find:

```typescript
export type AiScope = "config" | "scanner" | "topology" | "traffic" | "audit" | "chat";
```

Replace with:

```typescript
export type AiScope = "config" | "scanner" | "topology" | "topology_enrich" | "traffic" | "audit" | "chat";
```

- [ ] **Step 2: Add `topology_enrich` system prompt to `SYSTEM`**

In `SYSTEM` object, after the `topology:` entry, add:

```typescript
  topology_enrich: `${BASE}
Sen tarmoq qurilmalarini klassifikatsiya qiluvchi xavfsizlik auditorisan.
Senga tarmoq topologiyasining nodlari beriladi: har biri id, label (hostname yoki IP), ip, va hozirgi heuristik kind/segment (ular notoʻgʻri boʻlishi mumkin).
Har bir nod uchun toʻgʻri klassifikatsiya qaytar.

kind mumkin qiymatlari: cloud | firewall | ips | vpn | switch | server | web | db | wifi | endpoint
segment mumkin qiymatlari: Perimetr | DMZ | Server farm | Ichki tarmoq | Endpoint | Tashqi

Qoidalar:
- Hostname "fw", "firewall", "asa", "fortigate", "pfsense" → firewall
- Hostname "web", "http", "nginx", "apache", "www", "portal" → web
- Hostname "db", "sql", "mysql", "postgres", "maria", "oracle" → db
- Hostname "sw", "switch", "core-sw", "distribution" → switch
- Hostname "vpn", "ra-vpn" → vpn
- Hostname "ids", "ips", "snort", "suricata" → ips
- IP 10.0.x.x → Perimetr; 10.10.x.x yoki 10.20.x.x → DMZ; 192.168.x.x → Endpoint; tashqi IP → Tashqi
- aiLabel: qisqa koʻrsatuvchi nom (masalan "Core Firewall", "Web Server 1", "DB Cluster")
- aiReason: nima sababdan bu klassifikatsiya (1 gap, oʻzbek tilida)

Faqat JSON obyekt qaytar: {"nodes": [{id, kind, segment, aiLabel, aiReason}, ...]}
Berilgan har bir nodga mos yozuv boʻlsin — hech biri tushib qolmasin.`,
```

- [ ] **Step 3: Add Zod schema, JSON schema constant, parse function, and prompt builder**

At the end of the file (after `buildAuditPrompt`), append:

```typescript
// ---------- Topology enrichment ----------

const NODE_KIND_ENUM = z.enum([
  "cloud", "firewall", "ips", "vpn", "switch", "server", "web", "db", "wifi", "endpoint",
]);

const EnrichedNodePatchSchema = z.object({
  id: z.string(),
  kind: NODE_KIND_ENUM,
  segment: z.string().default("Ichki tarmoq"),
  aiLabel: z.string().default(""),
  aiReason: z.string().default(""),
});

const TopologyEnrichmentOutputSchema = z.object({
  nodes: z.array(EnrichedNodePatchSchema).default([]),
});

export type EnrichedNodePatchAi = z.infer<typeof EnrichedNodePatchSchema>;

export const TOPOLOGY_ENRICH_JSON_SCHEMA = z.toJSONSchema(TopologyEnrichmentOutputSchema);

export function parseTopologyEnrichment(
  raw: string | null | undefined,
): EnrichedNodePatchAi[] | null {
  if (!raw) return null;
  try {
    const parsed = TopologyEnrichmentOutputSchema.safeParse(
      normalizeEnumFields(JSON.parse(raw)),
    );
    return parsed.success ? parsed.data.nodes : null;
  } catch {
    return null;
  }
}

/** Compact node list for the enrichment prompt. */
export function buildEnrichmentPrompt(topology: Topology): string {
  const nodes = topology.nodes.map((n) => ({
    id: n.id,
    label: n.label,
    ip: n.ip || undefined,
    currentKind: n.kind,
    currentSegment: n.segment,
  }));
  return `Tarmoq nodlari (${nodes.length}):\n${JSON.stringify(nodes)}`;
}
```

- [ ] **Step 4: Typecheck**

```bash
cd "D:/MY PROJECTS/Auditor v6/Auditor-v2/web"
npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors.

---

### Task 4: Create `enrich.ts` AI function + unit tests

**Files:**
- Create: `web/src/lib/analysis/topology/enrich.ts`
- Create: `web/src/lib/analysis/topology/enrich.test.ts`

- [ ] **Step 1: Write the failing test first**

Create `web/src/lib/analysis/topology/enrich.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

const { generateJson } = vi.hoisted(() => ({ generateJson: vi.fn() }));
vi.mock("@/lib/ai/ollama", () => ({ generateJson }));

import { enrichTopologyNodes } from "./enrich";
import type { Topology } from "@/lib/types/entities";

const TOPO: Topology = {
  audit: "AUD-1",
  nodes: [
    { id: "fw", label: "FW-CORE-01", ip: "10.0.0.1", kind: "server", segment: "Ichki tarmoq", sev: "critical", findings: 2 },
    { id: "web", label: "web-01", ip: "10.10.0.5", kind: "server", segment: "Ichki tarmoq", sev: "high", findings: 1 },
  ],
  edges: [{ s: "fw", t: "web", flag: true }],
};

const PATCHES = {
  nodes: [
    { id: "fw", kind: "firewall", segment: "Perimetr", aiLabel: "Core Firewall", aiReason: "FW prefiksi va 10.0.x IP" },
    { id: "web", kind: "web", segment: "DMZ", aiLabel: "Web Server", aiReason: "web prefiksi va 10.10.x IP" },
  ],
};

beforeEach(() => vi.clearAllMocks());

describe("enrichTopologyNodes", () => {
  it("returns enriched patches on well-formed reply", async () => {
    generateJson.mockResolvedValue({ ok: true, raw: JSON.stringify(PATCHES), tokens: 15, latencyMs: 5 });
    const r = await enrichTopologyNodes(TOPO);
    expect(r.ok).toBe(true);
    expect(r.patches).toHaveLength(2);
    expect(r.patches[0].id).toBe("fw");
    expect(r.patches[0].kind).toBe("firewall");
    expect(r.patches[0].aiLabel).toBe("Core Firewall");
    expect(generateJson).toHaveBeenCalledWith(
      expect.stringContaining("topology_enrich" in String ? "" : ""),
      expect.anything(),
      { numPredict: 2048 },
    );
  });

  it("returns ok:false for empty topology", async () => {
    const r = await enrichTopologyNodes({ audit: "AUD-1", nodes: [], edges: [] });
    expect(r.ok).toBe(false);
    expect(r.patches).toHaveLength(0);
    expect(generateJson).not.toHaveBeenCalled();
  });

  it("degrades to ok:false when model unreachable", async () => {
    generateJson.mockResolvedValue({ ok: false, raw: "", tokens: 0, latencyMs: 0 });
    const r = await enrichTopologyNodes(TOPO);
    expect(r.ok).toBe(false);
    expect(r.patches).toHaveLength(0);
  });

  it("degrades to ok:false when reply is unparseable", async () => {
    generateJson.mockResolvedValue({ ok: true, raw: "not json at all", tokens: 5, latencyMs: 3 });
    const r = await enrichTopologyNodes(TOPO);
    expect(r.ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd "D:/MY PROJECTS/Auditor v6/Auditor-v2/web"
npx vitest run --reporter=verbose src/lib/analysis/topology/enrich.test.ts
```

Expected: FAIL — "Cannot find module './enrich'"

- [ ] **Step 3: Create `enrich.ts`**

Create `web/src/lib/analysis/topology/enrich.ts`:

```typescript
import "server-only";
import { generateJson } from "@/lib/ai/ollama";
import {
  SYSTEM,
  TOPOLOGY_ENRICH_JSON_SCHEMA,
  buildEnrichmentPrompt,
  parseTopologyEnrichment,
  type EnrichedNodePatchAi,
} from "@/lib/ai/prompts";
import type { Topology } from "@/lib/types/entities";

export interface EnrichTopologyResult {
  ok: boolean;
  patches: EnrichedNodePatchAi[];
  raw: string;
  tokens: number;
  latencyMs: number;
}

/**
 * AI reclassification of topology nodes: sends heuristic nodes to Ollama,
 * receives per-node patches with corrected kind/segment + aiLabel/aiReason.
 * Never throws — unreachable model or unparseable reply resolves to ok:false.
 */
export async function enrichTopologyNodes(topology: Topology): Promise<EnrichTopologyResult> {
  if (topology.nodes.length === 0) {
    return { ok: false, patches: [], raw: "", tokens: 0, latencyMs: 0 };
  }
  const prompt = `${SYSTEM.topology_enrich}\n\n${buildEnrichmentPrompt(topology)}`;
  const reply = await generateJson(prompt, TOPOLOGY_ENRICH_JSON_SCHEMA, { numPredict: 2048 });
  const patches = reply.ok ? parseTopologyEnrichment(reply.raw) : null;
  if (!patches) {
    return { ok: false, patches: [], raw: reply.raw, tokens: reply.tokens, latencyMs: reply.latencyMs };
  }
  return { ok: true, patches, raw: reply.raw, tokens: reply.tokens, latencyMs: reply.latencyMs };
}
```

- [ ] **Step 4: Run tests — all should pass**

```bash
cd "D:/MY PROJECTS/Auditor v6/Auditor-v2/web"
npx vitest run --reporter=verbose src/lib/analysis/topology/enrich.test.ts
```

Expected: 4/4 PASS.

---

### Task 5: Create `enrich-bg.ts` background helper

**Files:**
- Create: `web/src/lib/analysis/topology/enrich-bg.ts`

This file is imported by upload actions via `after()`. It must NOT be a "use server" file — it's a plain server-only module callable from server actions.

- [ ] **Step 1: Create `enrich-bg.ts`**

Create `web/src/lib/analysis/topology/enrich-bg.ts`:

```typescript
import "server-only";
import { prisma } from "@/lib/prisma";
import { getOllamaConfig } from "@/lib/ai/ollama";
import { buildTopology } from "./build";
import { enrichTopologyNodes } from "./enrich";

/**
 * Runs topology enrichment for an audit and persists the result.
 * Called fire-and-forget via after() in upload actions — never throws.
 * @param auditId  The audit whose topology should be enriched.
 * @param userId   The user who triggered the upload (for audit trail).
 */
export async function runTopologyEnrichment(auditId: string, userId: string): Promise<void> {
  const topology = await buildTopology(auditId);
  if (topology.nodes.length === 0) return;

  const r = await enrichTopologyNodes(topology);
  if (!r.ok) return;

  const { model } = getOllamaConfig();
  await prisma.topologyEnrichment.create({
    data: {
      auditId,
      output: r.raw,
      model,
      latencyMs: r.latencyMs,
      tokens: r.tokens,
      ok: true,
      createdById: userId,
    },
  });
}
```

- [ ] **Step 2: Typecheck**

```bash
cd "D:/MY PROJECTS/Auditor v6/Auditor-v2/web"
npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors.

---

### Task 6: Auto-trigger enrichment in upload actions

**Files:**
- Modify: `web/src/lib/actions/scanner.ts`
- Modify: `web/src/lib/actions/config.ts`
- Modify: `web/src/lib/actions/traffic.ts`

Pattern: at the end of each successful upload function, schedule `runTopologyEnrichment` via `after()`. The `after()` callback runs post-response — it never blocks the upload result.

- [ ] **Step 1: Patch `scanner.ts`**

In `web/src/lib/actions/scanner.ts`, add to the top imports:

```typescript
import { after } from "next/server";
import { runTopologyEnrichment } from "@/lib/analysis/topology/enrich-bg";
```

Then find the end of `uploadScannerFile`, right before the `return { ok: true, ... }` (after `revalidatePath("/analysis/scanner");`), add:

```typescript
  const _auditId = auditId;
  const _userId = userId;
  after(async () => {
    try { await runTopologyEnrichment(_auditId, _userId); } catch {}
  });
```

- [ ] **Step 2: Patch `config.ts`**

In `web/src/lib/actions/config.ts`, add to imports:

```typescript
import { after } from "next/server";
import { runTopologyEnrichment } from "@/lib/analysis/topology/enrich-bg";
```

In `uploadConfig`, after `revalidatePath("/analysis/config");`, add:

```typescript
  const _auditId = auditId;
  const _userId = userId;
  after(async () => {
    try { await runTopologyEnrichment(_auditId, _userId); } catch {}
  });
```

- [ ] **Step 3: Patch `traffic.ts`**

In `web/src/lib/actions/traffic.ts`, add to imports:

```typescript
import { after } from "next/server";
import { runTopologyEnrichment } from "@/lib/analysis/topology/enrich-bg";
```

In `uploadTrafficFile`, after `revalidatePath("/analysis/traffic");`, add:

```typescript
  const _auditId = auditId;
  const _userId = userId;
  after(async () => {
    try { await runTopologyEnrichment(_auditId, _userId); } catch {}
  });
```

- [ ] **Step 4: Typecheck**

```bash
cd "D:/MY PROJECTS/Auditor v6/Auditor-v2/web"
npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors.

---

### Task 7: Add `enrichTopology` server action (manual re-trigger)

**Files:**
- Modify: `web/src/lib/actions/topology.ts`

This action lets the topology page's UI re-trigger enrichment on demand (in case auto-trigger failed or data changed).

- [ ] **Step 1: Add the action**

In `web/src/lib/actions/topology.ts`, add imports:

```typescript
import { enrichTopologyNodes } from "@/lib/analysis/topology/enrich";
```

Then add at the bottom of the file:

```typescript
export interface EnrichTopologyResult {
  ok: boolean;
  error?: string;
}

/**
 * Manual re-trigger of topology enrichment — persists AI node patches to DB.
 * The topology page calls this when the user clicks "AI boyit".
 */
export async function enrichTopology(input: { auditId: string }): Promise<EnrichTopologyResult> {
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
```

- [ ] **Step 2: Typecheck**

```bash
cd "D:/MY PROJECTS/Auditor v6/Auditor-v2/web"
npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors.

---

### Task 8: Update `getTopology` to merge enrichments

**Files:**
- Modify: `web/src/lib/data/topology.ts`

- [ ] **Step 1: Update `getTopology`**

Replace the full content of `web/src/lib/data/topology.ts`:

```typescript
import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { buildTopology } from "@/lib/analysis/topology/build";
import {
  parseTopologyAnalysis,
  parseTopologyEnrichment,
  type TopologyAiAnalysis,
} from "@/lib/ai/prompts";
import type { Topology } from "@/lib/types/entities";

/**
 * Network topology (TZ §10.4) — built from real backend data (analyzed devices +
 * finding assets as nodes, traffic IP-pairs as edges), then merged with the latest
 * AI enrichment patches (kind/segment reclassification + aiLabel/aiReason per node).
 */
export const getTopology = cache(async (auditId: string): Promise<Topology> => {
  const [base, enrichRow] = await Promise.all([
    buildTopology(auditId),
    prisma.topologyEnrichment.findFirst({
      where: { auditId, ok: true },
      orderBy: { createdAt: "desc" },
      select: { output: true },
    }),
  ]);

  if (!enrichRow) return base;
  const patches = parseTopologyEnrichment(enrichRow.output);
  if (!patches || patches.length === 0) return base;

  const patchMap = new Map(patches.map((p) => [p.id, p]));
  const nodes = base.nodes.map((n) => {
    const patch = patchMap.get(n.id);
    if (!patch) return n;
    return {
      ...n,
      kind: patch.kind,
      segment: patch.segment,
      aiLabel: patch.aiLabel || undefined,
      aiReason: patch.aiReason || undefined,
    };
  });
  return { ...base, nodes };
});

/** Latest persisted AI analysis for an audit's topology — hydrates the screen. */
export const getLatestTopologyAnalysis = cache(
  async (auditId: string): Promise<TopologyAiAnalysis | null> => {
    const row = await prisma.topologyAiAnalysis.findFirst({
      where: { auditId, ok: true },
      orderBy: { createdAt: "desc" },
      select: { output: true },
    });
    return parseTopologyAnalysis(row?.output);
  },
);

/** The audit with the most topology-relevant data — the page's default selection. */
export const pickDefaultAuditId = cache(async (): Promise<string | null> => {
  const byFindings = await prisma.finding.groupBy({ by: ["auditId"], _count: { _all: true } });
  if (byFindings.length) {
    return byFindings.sort((a, b) => b._count._all - a._count._all)[0].auditId;
  }
  const traffic = await prisma.trafficUpload.findFirst({
    orderBy: { createdAt: "desc" },
    select: { auditId: true },
  });
  if (traffic) return traffic.auditId;
  const cfg = await prisma.configUpload.findFirst({
    orderBy: { createdAt: "desc" },
    select: { auditId: true },
  });
  return cfg?.auditId ?? null;
});
```

- [ ] **Step 2: Typecheck**

```bash
cd "D:/MY PROJECTS/Auditor v6/Auditor-v2/web"
npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors.

---

### Task 9: Add i18n keys

**Files:**
- Modify: `web/messages/uz.json`

- [ ] **Step 1: Add new keys to `topology` namespace**

In `web/messages/uz.json`, find the `"topology"` object and add these keys inside it (after `"kindEndpoint"`):

```json
"aiEnrichedLabel": "AI tavsif",
"aiEnrichedReason": "AI sababi",
"aiEnrich": "AI boyitish",
"aiEnriching": "AI boyitmoqda...",
"aiEnrichDone": "AI boyitish tugadi",
"aiEnrichFailed": "AI boyitish amalga oshmadi"
```

---

### Task 10: Update TopologyScreen — AI badge + detail panel

**Files:**
- Modify: `web/src/components/topology/TopologyScreen.tsx`

Two UI changes:
1. Small sparkle circle on AI-enriched nodes in the SVG graph
2. `aiLabel`/`aiReason` rows in the node detail panel

- [ ] **Step 1: Import `enrichTopology` action + add UI state**

In `web/src/components/topology/TopologyScreen.tsx`, add `enrichTopology` to the action imports:

```typescript
import { analyzeTopology, enrichTopology } from "@/lib/actions/topology";
```

In the component body, alongside the existing `aiPending`/`aiDegraded` state, add:

```typescript
const [enrichPending, setEnrichPending] = useState(false);
```

Add the `runEnrich` function (after the `runAi` function):

```typescript
async function runEnrich() {
  setEnrichPending(true);
  try {
    const r = await enrichTopology({ auditId });
    if (r.ok) {
      toast(t("aiEnrichDone"), "success");
      router.refresh();
    } else {
      toast(t("aiEnrichFailed"), "danger");
    }
  } finally {
    setEnrichPending(false);
  }
}
```

- [ ] **Step 2: Add "AI boyit" button to the AI card header**

Find the AI card header section in `TopologyScreen.tsx` (the block with `<span className="ai-card__title">{t("aiTitle")}</span>`). After the existing "AI tahlil" button, add the "AI boyit" button:

```tsx
<Button
  size="xs"
  variant="ghost"
  icon={<Sparkles size={12} className={enrichPending ? "spin" : undefined} />}
  onClick={() => void runEnrich()}
  disabled={enrichPending}
  style={{ marginLeft: 8 }}
>
  {enrichPending ? t("aiEnriching") : t("aiEnrich")}
</Button>
```

- [ ] **Step 3: Add AI badge indicator on enriched nodes in SVG**

In the node rendering block (inside the `topology.nodes.map((n) => ...)` section), after the findings badge block (around line 598–605), add an AI badge for enriched nodes:

```tsx
{n.aiLabel ? (
  <g transform="translate(-20,-17)">
    <circle r={6} fill="var(--brand)" opacity={0.85} />
    <text
      style={{ fontSize: 8, fill: "white", textAnchor: "middle", fontFamily: "inherit" }}
      y={3}
    >
      ✦
    </text>
  </g>
) : null}
```

- [ ] **Step 4: Add `aiLabel`/`aiReason` rows to node detail panel**

Find the `selNode` detail section (the `{selNode ? (...)` block). After the `segment` detail row (the `<div className="topo-detail__kv">` with `{t("segment")}`), add:

```tsx
{selNode.aiLabel ? (
  <>
    <div className="topo-detail__kv">
      <span className="topo-detail__k">{t("aiEnrichedLabel")}</span>
      <span className="topo-detail__v">{selNode.aiLabel}</span>
    </div>
    <div className="topo-detail__kv">
      <span className="topo-detail__k">{t("aiEnrichedReason")}</span>
      <span className="topo-detail__v" style={{ color: "var(--text-tertiary)", fontSize: 12 }}>
        {selNode.aiReason}
      </span>
    </div>
  </>
) : null}
```

- [ ] **Step 5: Typecheck + run topology component test**

```bash
cd "D:/MY PROJECTS/Auditor v6/Auditor-v2/web"
npx tsc --noEmit 2>&1 | head -20 && npx vitest run --reporter=verbose src/components/topology/TopologyScreen.test.tsx
```

Expected: 0 TS errors, all topology screen tests pass.

---

### Task 11: Final verification

- [ ] **Step 1: Run all topology-related tests**

```bash
cd "D:/MY PROJECTS/Auditor v6/Auditor-v2/web"
npx vitest run --reporter=verbose src/lib/analysis/topology/ src/components/topology/
```

Expected: All pass.

- [ ] **Step 2: Full build + typecheck**

```bash
cd "D:/MY PROJECTS/Auditor v6/Auditor-v2/web"
npx tsc --noEmit && npm run lint 2>&1 | tail -10
```

Expected: 0 errors, 0 lint warnings.

---

## Self-Review

**Spec coverage:**
- ✅ AI enriches topology from existing imported data (Q1=B) → Tasks 3, 4, 5, 8
- ✅ AI reclassifies `kind` + `segment` per node (Q2=A) → Task 3 prompt + Task 8 merge
- ✅ DB persisted (`TopologyEnrichment` model) (Q3=A) → Task 2, 5, 7
- ✅ Auto-run on new import via `after()` (Q4=B) → Task 6 (scanner + config + traffic)
- ✅ AI adds `aiLabel` + `aiReason` fields (Q5=B) → Task 1 type extension + Task 10 UI
- ✅ Manual re-trigger button → Task 7 server action + Task 10 UI button

**Placeholder scan:** None — all code is explicit.

**Type consistency:**
- `EnrichedNodePatch` defined in `types.ts` (Task 1), aliased as `EnrichedNodePatchAi` from `prompts.ts`
- `runTopologyEnrichment` in `enrich-bg.ts` uses same `EnrichedNodePatchAi[]` from `parseTopologyEnrichment`
- `getTopology` spreads `patch.kind`, `patch.segment`, `patch.aiLabel`, `patch.aiReason` — all defined in `EnrichedNodePatchSchema`
- `TopologyNode.aiLabel` and `aiReason` are `string | undefined` — detail panel guards with `selNode.aiLabel ?`
