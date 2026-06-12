# RBAC Data-Scope Critical Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 4 critical privilege-escalation gaps where server actions check permission but not audit ownership/membership, allowing any role with the right permission to act on audits they don't belong to.

**Architecture:** Add `isAuditLeader(auditId, userId, role)` to the existing `audit-access.ts` helper (alongside `isAuditMember` which already exists), then apply the two helpers as ownership gates in 5 action files. `isAuditLeader` returns true for `super`/`head` roles unconditionally, or when the user is the audit's `leaderId`. `isAuditMember` (already implemented) returns true for leader or any member row.

**Tech Stack:** Next.js 16 Server Actions · TypeScript strict · Prisma · Vitest (node environment) · `server-only`

---

## Files

| Action | File | Change |
|--------|------|--------|
| Modify | `web/src/lib/audit-access.ts` | Add `isAuditLeader` function |
| Modify | `web/src/lib/audit-access.test.ts` | Add `isAuditLeader` tests |
| Modify | `web/src/lib/actions/audits.ts:120-220` | `addMember`/`removeMember`/`promoteLead` — inline leader check using `a.leaderId` |
| Modify | `web/src/lib/actions/config.ts` | `uploadConfig`/`reanalyzeConfig`/`createConfigDrafts` — add `isAuditMember` |
| Modify | `web/src/lib/actions/scanner.ts` | `uploadScannerFile`/`reanalyzeScanner`/`createScannerDrafts` — add `isAuditMember` |
| Modify | `web/src/lib/actions/traffic.ts` | `uploadTrafficFile`/`reanalyzeTraffic`/`createTrafficDrafts` — add `isAuditMember` |
| Modify | `web/src/lib/actions/tokens.ts` | `issueToken`/`revokeToken`/`rotateToken` — add `isAuditLeader` |
| Modify | `web/src/lib/actions/reports.ts` | `generateReport`/`deleteReport`/`regenerateReportSummary` — add membership + authorship checks |

---

## Task 1: Add `isAuditLeader` to audit-access.ts

**Files:**
- Modify: `web/src/lib/audit-access.ts`
- Modify: `web/src/lib/audit-access.test.ts`

**Context:** `audit-access.ts` already exports `isAuditMember(auditId, userId)` and `canManageEvidence`. It is `server-only`. The existing test mocks `@/lib/prisma` and `@/lib/rbac.server`. The mock returns `h.audit` from `prisma.audit.findUnique`.

`isAuditLeader` must return `true` when:
- `role === "super"` or `role === "head"` (no DB call needed)
- OR `audit.leaderId === userId`

Current `audit-access.ts` content (read before editing):
```typescript
import "server-only";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac.server";

export async function isAuditMember(auditId: string, userId: string): Promise<boolean> { ... }
export async function canManageEvidence(auditId: string, userId: string): Promise<boolean> { ... }
```

- [ ] **Step 1: Write failing tests**

Add to `web/src/lib/audit-access.test.ts`, after the existing imports line:

```typescript
import { isAuditMember, canManageEvidence, isAuditLeader } from "./audit-access";
```

Replace the existing import line (line 18):
```typescript
import { isAuditMember, canManageEvidence } from "./audit-access";
```

Add this `describe` block at the end of the file (after the `canManageEvidence` describe block):

```typescript
describe("isAuditLeader", () => {
  it("is true for the audit leader regardless of role", async () => {
    // h.audit.leaderId === "u9", default
    expect(await isAuditLeader("AUD-1", "u9", "chief")).toBe(true);
  });
  it("is true for super role even without being leader", async () => {
    expect(await isAuditLeader("AUD-1", "u99", "super")).toBe(true);
  });
  it("is true for head role even without being leader", async () => {
    expect(await isAuditLeader("AUD-1", "u99", "head")).toBe(true);
  });
  it("is false for non-leader with chief role", async () => {
    expect(await isAuditLeader("AUD-1", "u5", "chief")).toBe(false);
  });
  it("is false for non-leader with lead role", async () => {
    expect(await isAuditLeader("AUD-1", "u5", "lead")).toBe(false);
  });
  it("is false for non-leader with t1 role", async () => {
    expect(await isAuditLeader("AUD-1", "u5", "t1")).toBe(false);
  });
  it("is false when audit does not exist", async () => {
    h.audit = null;
    expect(await isAuditLeader("AUD-x", "u9", "chief")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd web && npm run test -- "audit-access"
```

Expected: 7 new tests fail with "isAuditLeader is not a function" or similar.

- [ ] **Step 3: Implement `isAuditLeader`**

Add to `web/src/lib/audit-access.ts`, after the `canManageEvidence` function. Also add `RoleCode` import:

```typescript
import type { RoleCode } from "@/lib/types/roles";

/**
 * True if the user can manage this audit's team and tokens:
 * super/head roles always qualify; otherwise must be the audit's leaderId.
 */
export async function isAuditLeader(
  auditId: string,
  userId: string,
  role: RoleCode,
): Promise<boolean> {
  if (role === "super" || role === "head") return true;
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    select: { leaderId: true },
  });
  return audit?.leaderId === userId;
}
```

- [ ] **Step 4: Run test to verify passes**

```bash
cd web && npm run test -- "audit-access"
```

Expected: all tests pass (4 existing + 7 new = 11 total).

- [ ] **Step 5: Typecheck**

```bash
cd web && npm run typecheck
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add web/src/lib/audit-access.ts web/src/lib/audit-access.test.ts
git commit -m "fix(rbac): add isAuditLeader helper for audit ownership gate"
```

---

## Task 2: Fix audit team management (addMember / removeMember / promoteLead)

**Files:**
- Modify: `web/src/lib/actions/audits.ts:120-220`

**Context:** `loadAudit(auditId)` already returns `{ status, leaderId }`. So no extra DB call needed — we can inline the check using `a.leaderId` directly. We need to destructure `role` from `requireSession()` in all three functions.

The bug: any user with `group.edit` permission can add/remove/promote members in ANY audit. Fix: only the audit leader (or super/head) may do so.

**Existing pattern** (same in all three functions, lines ~125-129):
```typescript
const { userId: actorId } = await requireSession();
if (!(await requirePermission(actorId, "group.edit"))) return { ok: false, error: "forbidden" };
const a = await loadAudit(auditId);
if (!a) return { ok: false, error: "not_found" };
if (!EDITABLE.includes(a.status)) return { ok: false, error: "illegal_status" };
```

**Fixed pattern** (add `role` + leadership check after status check):
```typescript
const { userId: actorId, role } = await requireSession();
if (!(await requirePermission(actorId, "group.edit"))) return { ok: false, error: "forbidden" };
const a = await loadAudit(auditId);
if (!a) return { ok: false, error: "not_found" };
if (!EDITABLE.includes(a.status)) return { ok: false, error: "illegal_status" };
if (role !== "super" && role !== "head" && a.leaderId !== actorId)
  return { ok: false, error: "forbidden" };
```

Apply this same change to all three functions: `addMember` (line ~125), `removeMember` (line ~165), `promoteLead` (line ~194).

- [ ] **Step 1: Write failing tests**

Create `web/src/lib/actions/audits-team-scope.test.ts`:

```typescript
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  session: { userId: "actor1", role: "chief" as string },
  permission: true,
  audit: { status: "active", leaderId: "other-user" } as { status: string; leaderId: string } | null,
}));

vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => h.session),
}));
vi.mock("@/lib/rbac.server", () => ({
  requirePermission: vi.fn(async () => h.permission),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    audit: { findUnique: vi.fn(async () => h.audit) },
    auditMember: {
      upsert: vi.fn(async () => ({})),
      deleteMany: vi.fn(async () => ({})),
    },
    auditLog: { create: vi.fn(async () => ({})) },
    user: { findUnique: vi.fn(async () => ({ id: "u5" })) },
    $transaction: vi.fn(async (ops: unknown) =>
      Array.isArray(ops) ? Promise.all(ops) : (ops as (tx: unknown) => Promise<unknown>)({}),
    ),
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/kpi/events", () => ({ emitKpiEvent: vi.fn(async () => {}) }));

import { addMember, removeMember, promoteLead } from "./audits";

beforeEach(() => {
  h.session = { userId: "actor1", role: "chief" };
  h.permission = true;
  h.audit = { status: "active", leaderId: "other-user" };
});

describe("addMember — leadership gate", () => {
  it("returns forbidden when caller is not the leader (chief, not leader)", async () => {
    const result = await addMember({ auditId: "AUD-1", userId: "u5" });
    expect(result).toEqual({ ok: false, error: "forbidden" });
  });
  it("allows when caller IS the leader", async () => {
    h.audit = { status: "active", leaderId: "actor1" };
    const result = await addMember({ auditId: "AUD-1", userId: "u5" });
    expect(result.ok).toBe(true);
  });
  it("allows when role is super regardless of leaderId", async () => {
    h.session = { userId: "actor1", role: "super" };
    const result = await addMember({ auditId: "AUD-1", userId: "u5" });
    expect(result.ok).toBe(true);
  });
  it("allows when role is head regardless of leaderId", async () => {
    h.session = { userId: "actor1", role: "head" };
    const result = await addMember({ auditId: "AUD-1", userId: "u5" });
    expect(result.ok).toBe(true);
  });
});

describe("removeMember — leadership gate", () => {
  it("returns forbidden when caller is not the leader", async () => {
    h.audit = { status: "active", leaderId: "other-user" };
    const result = await removeMember({ auditId: "AUD-1", userId: "u5" });
    expect(result).toEqual({ ok: false, error: "forbidden" });
  });
  it("allows when caller IS the leader", async () => {
    h.audit = { status: "active", leaderId: "actor1" };
    const result = await removeMember({ auditId: "AUD-1", userId: "u5" });
    expect(result.ok).toBe(true);
  });
});

describe("promoteLead — leadership gate", () => {
  it("returns forbidden when caller is not the leader", async () => {
    const result = await promoteLead({ auditId: "AUD-1", userId: "u5" });
    expect(result).toEqual({ ok: false, error: "forbidden" });
  });
  it("allows when role is head", async () => {
    h.session = { userId: "actor1", role: "head" };
    const result = await promoteLead({ auditId: "AUD-1", userId: "u5" });
    expect(result.ok).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd web && npm run test -- "audits-team-scope"
```

Expected: 4 "forbidden" tests fail (currently returns `{ ok: true }` because no leader check).

- [ ] **Step 3: Apply fix to addMember (line ~125)**

In `web/src/lib/actions/audits.ts`, in `addMember`:

Change:
```typescript
const { userId: actorId } = await requireSession();
```
to:
```typescript
const { userId: actorId, role } = await requireSession();
```

After `if (!EDITABLE.includes(a.status)) return { ok: false, error: "illegal_status" };`, add:
```typescript
if (role !== "super" && role !== "head" && a.leaderId !== actorId)
  return { ok: false, error: "forbidden" };
```

- [ ] **Step 4: Apply same fix to removeMember (line ~165)**

Change:
```typescript
const { userId: actorId } = await requireSession();
```
to:
```typescript
const { userId: actorId, role } = await requireSession();
```

After `if (!EDITABLE.includes(a.status)) return { ok: false, error: "illegal_status" };`, add:
```typescript
if (role !== "super" && role !== "head" && a.leaderId !== actorId)
  return { ok: false, error: "forbidden" };
```

- [ ] **Step 5: Apply same fix to promoteLead (line ~194)**

Change:
```typescript
const { userId: actorId } = await requireSession();
```
to:
```typescript
const { userId: actorId, role } = await requireSession();
```

After `if (!EDITABLE.includes(a.status)) return { ok: false, error: "illegal_status" };`, add:
```typescript
if (role !== "super" && role !== "head" && a.leaderId !== actorId)
  return { ok: false, error: "forbidden" };
```

- [ ] **Step 6: Run tests to verify pass**

```bash
cd web && npm run test -- "audits-team-scope"
```

Expected: all 8 tests pass.

- [ ] **Step 7: Typecheck**

```bash
cd web && npm run typecheck
```

Expected: clean.

- [ ] **Step 8: Commit**

```bash
git add web/src/lib/actions/audits.ts web/src/lib/actions/audits-team-scope.test.ts
git commit -m "fix(rbac): enforce audit leadership gate on addMember/removeMember/promoteLead"
```

---

## Task 3: Fix config / scanner / traffic upload actions

**Files:**
- Modify: `web/src/lib/actions/config.ts`
- Modify: `web/src/lib/actions/scanner.ts`
- Modify: `web/src/lib/actions/traffic.ts`

**Context:** All three have the same pattern: `uploadX` takes `auditId` in input, `reanalyzeX` and `createXDrafts` take `uploadId` (auditId resolved from fetched upload). All three currently check permission but not audit membership.

Fix pattern for **upload functions** (auditId in input, audit already fetched):
```typescript
// After: if (!audit) return { ok: false, error: "not_found" };
// Add:
if (!(await isAuditMember(auditId, userId))) return { ok: false, error: "forbidden" };
```

Fix pattern for **reanalyze + drafts functions** (auditId from upload):
```typescript
// After: const upload = await prisma.X.findUnique(...);
// After: if (!upload) return { ok: false, error: "not_found" };
// Add:
if (!(await isAuditMember(upload.auditId, userId))) return { ok: false, error: "forbidden" };
```

All three files need `import { isAuditMember } from "@/lib/audit-access";` added.

- [ ] **Step 1: Write failing tests**

Create `web/src/lib/actions/upload-scope.test.ts`:

```typescript
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  userId: "u1",
  permission: true,
  isMember: false,
  audit: { id: "AUD-1" } as { id: string } | null,
  task: { auditId: "AUD-1" } as { auditId: string } | null,
  upload: { id: "UP-1", auditId: "AUD-1", taskId: "T-1" } as Record<string, string> | null,
}));

vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: h.userId, role: "t1" })),
}));
vi.mock("@/lib/rbac.server", () => ({
  requirePermission: vi.fn(async () => h.permission),
}));
vi.mock("@/lib/audit-access", () => ({
  isAuditMember: vi.fn(async () => h.isMember),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    audit: { findUnique: vi.fn(async () => h.audit) },
    task: { findUnique: vi.fn(async () => h.task) },
    configUpload: { findUnique: vi.fn(async () => h.upload) },
    scannerUpload: { findUnique: vi.fn(async () => h.upload) },
    trafficUpload: { findUnique: vi.fn(async () => h.upload) },
    $transaction: vi.fn(async () => ({})),
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/ai/ollama", () => ({
  isAiEnabled: vi.fn(() => false),
  getOllamaConfig: vi.fn(() => ({})),
  generate: vi.fn(async () => ""),
}));
vi.mock("@/lib/analysis/config/analyzer", () => ({ analyzeConfig: vi.fn(async () => []) }));
vi.mock("@/lib/analysis/scanner/parsers/universal", () => ({ parseAny: vi.fn(() => ({ findings: [] })) }));
vi.mock("@/lib/topology/enrichment", () => ({ runTopologyEnrichment: vi.fn(async () => {}) }));
vi.mock("@/lib/kpi/events", () => ({ emitKpiEvent: vi.fn(async () => {}) }));

import { uploadConfig, reanalyzeConfig, createConfigDrafts } from "./config";
import { uploadScannerFile, reanalyzeScanner, createScannerDrafts } from "./scanner";
import { uploadTrafficFile, reanalyzeTraffic, createTrafficDrafts } from "./traffic";

beforeEach(() => {
  h.isMember = false;
  h.audit = { id: "AUD-1" };
  h.task = { auditId: "AUD-1" };
  h.upload = { id: "UP-1", auditId: "AUD-1", taskId: "T-1" };
});

describe("uploadConfig — membership gate", () => {
  it("returns forbidden when user is not audit member", async () => {
    const r = await uploadConfig({ filename: "f.txt", content: "x", auditId: "AUD-1", taskId: "T-1" });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
  it("proceeds when user is audit member", async () => {
    h.isMember = true;
    const r = await uploadConfig({ filename: "f.txt", content: "x", auditId: "AUD-1", taskId: "T-1" });
    expect(r.ok).toBe(true);
  });
});

describe("reanalyzeConfig — membership gate", () => {
  it("returns forbidden when user is not audit member", async () => {
    const r = await reanalyzeConfig({ uploadId: "UP-1" });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
});

describe("createConfigDrafts — membership gate", () => {
  it("returns forbidden when user is not audit member", async () => {
    const r = await createConfigDrafts({ uploadId: "UP-1", gapIndices: [] });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
});

describe("uploadScannerFile — membership gate", () => {
  it("returns forbidden when user is not audit member", async () => {
    const r = await uploadScannerFile({ filename: "f.xml", content: "x", auditId: "AUD-1", taskId: "T-1" });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
});

describe("reanalyzeScanner — membership gate", () => {
  it("returns forbidden when user is not audit member", async () => {
    const r = await reanalyzeScanner({ uploadId: "UP-1" });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
});

describe("uploadTrafficFile — membership gate", () => {
  it("returns forbidden when user is not audit member", async () => {
    const r = await uploadTrafficFile({ filename: "f.pcap", content: "x", auditId: "AUD-1", taskId: "T-1" });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
});

describe("reanalyzeTraffic — membership gate", () => {
  it("returns forbidden when user is not audit member", async () => {
    const r = await reanalyzeTraffic({ uploadId: "UP-1" });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd web && npm run test -- "upload-scope"
```

Expected: "forbidden" tests fail (currently returns success or unrelated error).

- [ ] **Step 3: Fix config.ts**

Add import at top of `web/src/lib/actions/config.ts`:
```typescript
import { isAuditMember } from "@/lib/audit-access";
```

In `uploadConfig`, after the audit existence check:
```typescript
// After: if (!audit) return { ok: false, error: "not_found" };
if (!(await isAuditMember(auditId, userId))) return { ok: false, error: "forbidden" };
```

In `reanalyzeConfig`, after the upload existence check:
```typescript
// After: if (!upload) return { ok: false, error: "not_found" };
if (!(await isAuditMember(upload.auditId, userId))) return { ok: false, error: "forbidden" };
```

In `createConfigDrafts`, after the upload existence check:
```typescript
// After: if (!upload) return { ok: false, error: "not_found" };
if (!(await isAuditMember(upload.auditId, userId))) return { ok: false, error: "forbidden" };
```

- [ ] **Step 4: Fix scanner.ts**

Add import at top of `web/src/lib/actions/scanner.ts`:
```typescript
import { isAuditMember } from "@/lib/audit-access";
```

In `uploadScannerFile`, after the audit existence check:
```typescript
if (!(await isAuditMember(auditId, userId))) return { ok: false, error: "forbidden" };
```

In `reanalyzeScanner`, after the upload existence check:
```typescript
if (!(await isAuditMember(upload.auditId, userId))) return { ok: false, error: "forbidden" };
```

In `createScannerDrafts`, after the upload existence check:
```typescript
if (!(await isAuditMember(upload.auditId, userId))) return { ok: false, error: "forbidden" };
```

- [ ] **Step 5: Fix traffic.ts**

Add import at top of `web/src/lib/actions/traffic.ts`:
```typescript
import { isAuditMember } from "@/lib/audit-access";
```

In `uploadTrafficFile`, after the audit existence check:
```typescript
if (!(await isAuditMember(auditId, userId))) return { ok: false, error: "forbidden" };
```

In `reanalyzeTraffic`, after the upload existence check:
```typescript
if (!(await isAuditMember(upload.auditId, userId))) return { ok: false, error: "forbidden" };
```

In `createTrafficDrafts`, after the upload existence check:
```typescript
if (!(await isAuditMember(upload.auditId, userId))) return { ok: false, error: "forbidden" };
```

- [ ] **Step 6: Run tests**

```bash
cd web && npm run test -- "upload-scope"
```

Expected: all 7 tests pass.

- [ ] **Step 7: Typecheck**

```bash
cd web && npm run typecheck
```

Expected: clean.

- [ ] **Step 8: Commit**

```bash
git add web/src/lib/actions/config.ts web/src/lib/actions/scanner.ts web/src/lib/actions/traffic.ts web/src/lib/actions/upload-scope.test.ts
git commit -m "fix(rbac): enforce audit membership gate on config/scanner/traffic upload actions"
```

---

## Task 4: Fix token management (issueToken / revokeToken / rotateToken)

**Files:**
- Modify: `web/src/lib/actions/tokens.ts`

**Context:**
- `issueToken`: has `auditId` in input, already fetches audit (only selects `{ id: true }`). Add `isAuditLeader` check after audit fetch.
- `revokeToken`: fetches token selecting only `{ id: true }` — must change to `{ id: true, auditId: true }`, then add `isAuditLeader` check.
- `rotateToken`: already fetches full token (`old`), so `old.auditId` is available.
- All three need `role` from `requireSession()`.

- [ ] **Step 1: Write failing tests**

Create `web/src/lib/actions/token-scope.test.ts`:

```typescript
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  actor: "u1",
  role: "chief" as string,
  permission: true,
  isLeader: false,
  audit: { id: "AUD-1" } as { id: string } | null,
  token: { id: "TOK-1", auditId: "AUD-1", userId: "u2", device: "—", hostname: "—", os: "—", agent: "—", ip: "—", issued: "", expires: "", status: "active", lastUsed: "—", tasks: 0 } as Record<string, unknown> | null,
}));

vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: h.actor, role: h.role })),
}));
vi.mock("@/lib/rbac.server", () => ({
  requirePermission: vi.fn(async () => h.permission),
}));
vi.mock("@/lib/audit-access", () => ({
  isAuditLeader: vi.fn(async () => h.isLeader),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    audit: { findUnique: vi.fn(async () => h.audit) },
    user: { findUnique: vi.fn(async () => ({ id: "u2" })) },
    auditToken: {
      findUnique: vi.fn(async () => h.token),
      create: vi.fn(async () => ({})),
      update: vi.fn(async () => ({})),
    },
    auditLog: { create: vi.fn(async () => ({})) },
    $transaction: vi.fn(async (ops: unknown) =>
      Array.isArray(ops) ? Promise.all(ops) : ({}),
    ),
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { issueToken, revokeToken, rotateToken } from "./tokens";

beforeEach(() => {
  h.isLeader = false;
  h.audit = { id: "AUD-1" };
  h.token = { id: "TOK-1", auditId: "AUD-1", userId: "u2", device: "—", hostname: "—", os: "—", agent: "—", ip: "—", issued: "", expires: "", status: "active", lastUsed: "—", tasks: 0 };
});

describe("issueToken — leader gate", () => {
  it("returns forbidden when caller is not audit leader", async () => {
    const r = await issueToken({ auditId: "AUD-1", userId: "u2", expires: "2027-01-01" });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
  it("allows when caller is audit leader", async () => {
    h.isLeader = true;
    const r = await issueToken({ auditId: "AUD-1", userId: "u2", expires: "2027-01-01" });
    expect(r.ok).toBe(true);
  });
});

describe("revokeToken — leader gate", () => {
  it("returns forbidden when caller is not audit leader", async () => {
    const r = await revokeToken({ id: "TOK-1" });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
  it("allows when caller is audit leader", async () => {
    h.isLeader = true;
    const r = await revokeToken({ id: "TOK-1" });
    expect(r.ok).toBe(true);
  });
});

describe("rotateToken — leader gate", () => {
  it("returns forbidden when caller is not audit leader", async () => {
    const r = await rotateToken({ id: "TOK-1" });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
  it("allows when caller is audit leader", async () => {
    h.isLeader = true;
    const r = await rotateToken({ id: "TOK-1" });
    expect(r.ok).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd web && npm run test -- "token-scope"
```

Expected: 3 "forbidden" tests fail.

- [ ] **Step 3: Fix tokens.ts**

Add import at top of `web/src/lib/actions/tokens.ts`:
```typescript
import { isAuditLeader } from "@/lib/audit-access";
```

**`issueToken`** — change `requireSession` line and add leader check:
```typescript
// Change:
const { userId: actor } = await requireSession();
// To:
const { userId: actor, role } = await requireSession();
```
After `if (!audit) return { ok: false, error: "not_found" };`:
```typescript
if (!(await isAuditLeader(auditId, actor, role))) return { ok: false, error: "forbidden" };
```

**`revokeToken`** — change `requireSession`, update token select, add leader check:
```typescript
// Change:
const { userId } = await requireSession();
// To:
const { userId, role } = await requireSession();
```
Change the token fetch to also select `auditId`:
```typescript
// Change:
const tok = await prisma.auditToken.findUnique({ where: { id }, select: { id: true } });
// To:
const tok = await prisma.auditToken.findUnique({ where: { id }, select: { id: true, auditId: true } });
```
After `if (!tok) return { ok: false, error: "not_found" };`:
```typescript
if (!(await isAuditLeader(tok.auditId, userId, role))) return { ok: false, error: "forbidden" };
```

**`rotateToken`** — change `requireSession` and add leader check:
```typescript
// Change:
const { userId: actor } = await requireSession();
// To:
const { userId: actor, role } = await requireSession();
```
After `if (!old) return { ok: false, error: "not_found" };`:
```typescript
if (!(await isAuditLeader(old.auditId, actor, role))) return { ok: false, error: "forbidden" };
```

- [ ] **Step 4: Run tests**

```bash
cd web && npm run test -- "token-scope"
```

Expected: all 6 tests pass.

- [ ] **Step 5: Typecheck**

```bash
cd web && npm run typecheck
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add web/src/lib/actions/tokens.ts web/src/lib/actions/token-scope.test.ts
git commit -m "fix(rbac): enforce audit leadership gate on token issue/revoke/rotate"
```

---

## Task 5: Fix report actions (generateReport / deleteReport / regenerateReportSummary)

**Files:**
- Modify: `web/src/lib/actions/reports.ts`

**Context:**
- `generateReport`: takes `input.auditId`. Add `isAuditMember` check.
- `deleteReport`: currently deletes directly without fetching. Need to fetch report first to get `authorId`/`auditId`, then check `authorId === userId || isAuditLeader(auditId, userId, role)`.
- `regenerateReportSummary`: already fetches `report` — just add `isAuditMember` check before AI call.
- `generateReport` and `deleteReport` use `throw new Error(...)` pattern (not `return { ok: false }`). Match this.
- `reports.ts` already imports `RoleCode`.

- [ ] **Step 1: Write failing tests**

Create `web/src/lib/actions/report-scope.test.ts`:

```typescript
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  userId: "u1",
  role: "t1" as string,
  permission: true,
  isMember: false,
  isLeader: false,
  report: { id: "R-1", auditId: "AUD-1", authorId: "u9", status: "draft", approvalStage: null } as Record<string, unknown> | null,
  audit: { id: "AUD-1", title: "Test", code: "A-1" } as Record<string, unknown> | null,
}));

vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: h.userId, role: h.role })),
}));
vi.mock("@/lib/rbac.server", () => ({
  requirePermission: vi.fn(async () => h.permission),
}));
vi.mock("@/lib/audit-access", () => ({
  isAuditMember: vi.fn(async () => h.isMember),
  isAuditLeader: vi.fn(async () => h.isLeader),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    report: {
      create: vi.fn(async () => ({ id: "R-new" })),
      delete: vi.fn(async () => ({})),
      findUnique: vi.fn(async () => h.report),
      update: vi.fn(async () => ({})),
    },
    audit: { findUnique: vi.fn(async () => h.audit) },
    finding: { findMany: vi.fn(async () => []) },
    $transaction: vi.fn(async (ops: unknown) =>
      Array.isArray(ops) ? Promise.all(ops) : ({}),
    ),
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/ai/ollama", () => ({
  isAiEnabled: vi.fn(() => false),
  getOllamaConfig: vi.fn(() => ({})),
  generate: vi.fn(async () => ""),
}));
vi.mock("@/lib/ai/prompts", () => ({ SYSTEM: {} }));
vi.mock("@/lib/approval", () => ({
  canActAt: vi.fn(() => true),
  nextStage: vi.fn(() => null),
  reportCurrentOf: vi.fn(() => "draft"),
}));

import { generateReport, deleteReport, regenerateReportSummary } from "./reports";

beforeEach(() => {
  h.isMember = false;
  h.isLeader = false;
  h.report = { id: "R-1", auditId: "AUD-1", authorId: "u9", status: "draft", approvalStage: null };
});

describe("generateReport — membership gate", () => {
  it("throws when user is not audit member", async () => {
    await expect(
      generateReport({ title: "T", auditId: "AUD-1", type: "pentest", formats: ["pdf"] }),
    ).rejects.toThrow();
  });
  it("allows when user is audit member", async () => {
    h.isMember = true;
    const r = await generateReport({ title: "T", auditId: "AUD-1", type: "pentest", formats: ["pdf"] });
    expect(r.ok).toBe(true);
  });
});

describe("deleteReport — authorship + leader gate", () => {
  it("throws when user is neither author nor leader", async () => {
    await expect(deleteReport("R-1")).rejects.toThrow();
  });
  it("allows when user is the report author", async () => {
    h.userId = "u9"; // matches report.authorId
    const r = await deleteReport("R-1");
    expect(r.ok).toBe(true);
  });
  it("allows when user is audit leader", async () => {
    h.isLeader = true;
    const r = await deleteReport("R-1");
    expect(r.ok).toBe(true);
  });
});

describe("regenerateReportSummary — membership gate", () => {
  it("returns forbidden when user is not audit member", async () => {
    const r = await regenerateReportSummary("R-1");
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
  it("allows when user is audit member", async () => {
    h.isMember = true;
    const r = await regenerateReportSummary("R-1");
    expect(r.ok).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd web && npm run test -- "report-scope"
```

Expected: 4 tests fail (forbidden/throw checks).

- [ ] **Step 3: Fix reports.ts**

Add import at top of `web/src/lib/actions/reports.ts`:
```typescript
import { isAuditMember, isAuditLeader } from "@/lib/audit-access";
```

**`generateReport`** — add `role` to requireSession, add membership check:
```typescript
// Change:
const { userId } = await requireSession();
// To:
const { userId, role } = await requireSession();
```
After the validation check `if (!input.title.trim() || ...)`, add:
```typescript
if (!(await isAuditMember(input.auditId, userId))) throw new Error("Ruxsat yoʻq");
```

**`deleteReport`** — add `role`, fetch report before delete, add authorship+leader check:
```typescript
export async function deleteReport(id: string) {
  const { userId, role } = await requireSession();
  if (!(await requirePermission(userId, "report.create"))) throw new Error("Ruxsat yoʻq");
  const report = await prisma.report.findUnique({
    where: { id },
    select: { id: true, authorId: true, auditId: true },
  });
  if (!report) throw new Error("Topilmadi");
  if (report.authorId !== userId && !(await isAuditLeader(report.auditId, userId, role)))
    throw new Error("Ruxsat yoʻq");
  await prisma.report.delete({ where: { id } });
  revalidatePath("/reports");
  return { ok: true };
}
```

**`regenerateReportSummary`** — add membership check after report fetch:
```typescript
// report is already fetched. After: if (!report) return { ok: false, error: "not_found" };
if (!(await isAuditMember(report.auditId, userId))) return { ok: false, error: "forbidden" };
```

- [ ] **Step 4: Run tests**

```bash
cd web && npm run test -- "report-scope"
```

Expected: all 7 tests pass.

- [ ] **Step 5: Typecheck**

```bash
cd web && npm run typecheck
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add web/src/lib/actions/reports.ts web/src/lib/actions/report-scope.test.ts
git commit -m "fix(rbac): enforce audit membership/authorship gates on report generate/delete/regenerate"
```

---

## Self-Review

**Spec coverage:**
- ✅ Gap 1 (audit team management) → Task 2
- ✅ Gap 2 (config/scanner/traffic uploads) → Task 3
- ✅ Gap 3 (token issuance/revoke/rotate) → Task 4
- ✅ Gap 4 (report generate/delete/regenerate) → Task 5
- ✅ Foundation helper `isAuditLeader` → Task 1
- ✅ `deleteReport` uses `authorId OR isAuditLeader` → Task 5

**Placeholder scan:** None. All code blocks complete with exact implementations.

**Type consistency:**
- `isAuditLeader(auditId: string, userId: string, role: RoleCode)` — consistent across Task 1 (definition) and Tasks 2/4/5 (usage)
- `isAuditMember(auditId: string, userId: string)` — already exists, used in Tasks 3/5
- `tok.auditId` — requires `auditId: true` in `revokeToken` select (noted in Task 4 Step 3)
- `report.auditId` — requires `auditId: true` in `deleteReport` select (noted in Task 5 Step 3)
- Tasks 2-5 all depend on Task 1 completing first (import chain)
