# Findings Approval RBAC Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix two bugs in the findings approval system: (1) `head`/`chief`/`lead` roles cannot approve findings despite being in the CAN_ACT stage gates, and (2) the FindingDrawer submit button ignores custom `finding.create` permission overrides.

**Architecture:** RBAC fix is one line in `rbac.server.ts` — change `finding` module access levels so `head`→"full", `chief`→"full", `lead`→"full". The `canCreate` prop chain: server resolves permission in `page.tsx` → passes through `FindingsScreen` → `FindingDrawer` replaces the role-only `canSubmit` check.

**Tech Stack:** Next.js 16 App Router · TypeScript strict · Vitest + Testing Library · `userHasPermission` from `@/lib/rbac.server.ts`

---

## Files

| Action | File | Change |
|--------|------|--------|
| Modify | `web/src/lib/rbac.server.ts:34` | `finding` row: head/chief/lead → "full" |
| Modify | `web/src/app/(app)/findings/page.tsx` | fetch `canCreate`, pass prop |
| Modify | `web/src/components/findings/FindingsScreen.tsx` | add `canCreate` prop, thread to FindingDrawer |
| Modify | `web/src/components/findings/FindingDrawer.tsx` | accept `canCreate`, replace `canSubmit` logic |
| Modify | `web/src/components/findings/FindingsScreen.test.tsx` | add `canCreate` prop to renderScreen |

---

## Task 1: Fix RBAC — head/chief/lead get finding.approve + finding.reject

**Files:**
- Modify: `web/src/lib/rbac.server.ts:34`

**Context:** Line 34 currently reads:
```typescript
finding: { super: "full", head: "read", chief: "own", lead: "own", t1: "own" },
```
`head: "read"` maps to `finding.read = []` → zero permissions. `chief`/`lead`: `"own"` → only `finding.create`. The `CAN_ACT` stage gate at `web/src/lib/approval.ts` expects `head`/`chief`/`lead` to act at various stages, but `requirePermission(userId, "finding.approve")` blocks them.

Fix: `head`/`chief`/`lead` → `"full"` which maps to `["finding.create", "finding.approve", "finding.reject"]`.

- [ ] **Step 1: Write failing test**

Create `web/src/lib/rbac-finding-permissions.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { SYSTEM_ROLE_DEFAULT_PERMISSIONS } from "./rbac.server";
import { hasPermission } from "./rbac.server";

describe("finding approval permissions", () => {
  it("lead has finding.approve", () => {
    expect(hasPermission(SYSTEM_ROLE_DEFAULT_PERMISSIONS.lead, "finding.approve")).toBe(true);
  });
  it("chief has finding.approve", () => {
    expect(hasPermission(SYSTEM_ROLE_DEFAULT_PERMISSIONS.chief, "finding.approve")).toBe(true);
  });
  it("head has finding.approve", () => {
    expect(hasPermission(SYSTEM_ROLE_DEFAULT_PERMISSIONS.head, "finding.approve")).toBe(true);
  });
  it("lead has finding.reject", () => {
    expect(hasPermission(SYSTEM_ROLE_DEFAULT_PERMISSIONS.lead, "finding.reject")).toBe(true);
  });
  it("chief has finding.reject", () => {
    expect(hasPermission(SYSTEM_ROLE_DEFAULT_PERMISSIONS.chief, "finding.reject")).toBe(true);
  });
  it("head has finding.reject", () => {
    expect(hasPermission(SYSTEM_ROLE_DEFAULT_PERMISSIONS.head, "finding.reject")).toBe(true);
  });
  it("t1 does NOT have finding.approve", () => {
    expect(hasPermission(SYSTEM_ROLE_DEFAULT_PERMISSIONS.t1, "finding.approve")).toBe(false);
  });
  it("t1 does NOT have finding.reject", () => {
    expect(hasPermission(SYSTEM_ROLE_DEFAULT_PERMISSIONS.t1, "finding.reject")).toBe(false);
  });
  it("all roles keep finding.create", () => {
    for (const role of ["lead", "chief", "head", "t1"] as const) {
      expect(hasPermission(SYSTEM_ROLE_DEFAULT_PERMISSIONS[role], "finding.create")).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run test — verify fails**

```bash
cd web && npm run test -- "rbac-finding-permissions"
```

Expected: 6 tests fail (`finding.approve`/`finding.reject` for lead/chief/head).

- [ ] **Step 3: Apply fix**

In `web/src/lib/rbac.server.ts` line 34, change:
```typescript
finding: { super: "full", head: "read", chief: "own", lead: "own", t1: "own" },
```
to:
```typescript
finding: { super: "full", head: "full", chief: "full", lead: "full", t1: "own" },
```

- [ ] **Step 4: Run test — verify passes**

```bash
cd web && npm run test -- "rbac-finding-permissions"
```

Expected: all 9 tests pass.

- [ ] **Step 5: Typecheck**

```bash
cd web && npm run typecheck
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add web/src/lib/rbac.server.ts web/src/lib/rbac-finding-permissions.test.ts
git commit -m "fix(rbac): grant head/chief/lead finding.approve and finding.reject permissions"
```

---

## Task 2: Thread canCreate from server → FindingDrawer

**Files:**
- Modify: `web/src/app/(app)/findings/page.tsx`
- Modify: `web/src/components/findings/FindingsScreen.tsx`
- Modify: `web/src/components/findings/FindingDrawer.tsx`
- Modify: `web/src/components/findings/FindingsScreen.test.tsx`

**Context:** `FindingDrawer.tsx:60` computes `canSubmit` using only role: `userId === finding.reportedBy || canActAt(role, "group_lead")`. This ignores custom `finding.create` permission overrides stored in DB. The fix: resolve permission server-side in `page.tsx`, pass as `canCreate: boolean` prop through `FindingsScreen` → `FindingDrawer`, and use it in the `canSubmit` computation.

### Step 2a — Add canCreate to FindingDrawer

- [ ] **Step 1: Update FindingDrawerProps + canSubmit logic**

In `web/src/components/findings/FindingDrawer.tsx`, change the props interface and canSubmit:

```typescript
// Change interface FindingDrawerProps — add canCreate:
export interface FindingDrawerProps {
  finding: Finding | null;
  approval: FindingApprovalView | null;
  remediation: ApprovalEvent[];
  evidences: FindingEvidenceView[];
  tasks: Task[];
  usersById: Record<string, User>;
  userId: string;
  role: RoleCode;
  canCreate: boolean;   // ← add this
  onClose: () => void;
}

// Change function signature to destructure canCreate:
export function FindingDrawer({
  finding,
  approval,
  remediation,
  evidences,
  tasks,
  usersById,
  userId,
  role,
  canCreate,   // ← add this
  onClose,
}: FindingDrawerProps) {
```

Then change line 60 from:
```typescript
const canSubmit = userId === finding.reportedBy || canActAt(role, "group_lead");
```
to:
```typescript
const canSubmit = canCreate && (userId === finding.reportedBy || canActAt(role, "group_lead"));
```

### Step 2b — Pass canCreate through FindingsScreen

- [ ] **Step 2: Update FindingsScreenProps + FindingDrawer usage**

In `web/src/components/findings/FindingsScreen.tsx`:

Add `canCreate: boolean` to `FindingsScreenProps`:
```typescript
export interface FindingsScreenProps {
  findings: Finding[];
  usersById: Record<string, User>;
  approvals: Record<string, FindingApprovalView>;
  remediations: Record<string, ApprovalEvent[]>;
  evidenceByFindingId: Record<string, FindingEvidenceView[]>;
  audits: Audit[];
  tasks: Task[];
  orgsById: Record<string, Organization>;
  canCreate: boolean;   // ← add this
  userId: string;
  role: RoleCode;
}
```

Add `canCreate` to destructure in `FindingsScreen({ ..., canCreate, ... })`.

Pass it to `<FindingDrawer>`:
```tsx
<FindingDrawer
  finding={selected}
  approval={selected ? (approvals[selected.id] ?? null) : null}
  remediation={selected ? (remediations[selected.id] ?? []) : []}
  evidences={selected ? (evidenceByFindingId[selected.id] ?? []) : []}
  tasks={tasks}
  usersById={usersById}
  userId={userId}
  role={role}
  canCreate={canCreate}
  onClose={() => setOpenId(null)}
/>
```

### Step 2c — Resolve canCreate in page.tsx

- [ ] **Step 3: Fetch canCreate in page.tsx**

In `web/src/app/(app)/findings/page.tsx`:

Add import:
```typescript
import { userHasPermission } from "@/lib/rbac.server";
```

Add to Promise.all:
```typescript
const [findings, usersById, approvals, remediations, audits, tasks, evidenceByFindingId, orgs, canCreate] =
  await Promise.all([
    getScopedFindings(userId, role),
    getUsersById(),
    getFindingApprovals(),
    getFindingRemediations(),
    getScopedAudits(userId, role),
    getAssignableTasks(userId, role),
    getFindingEvidenceMap(),
    getOrgs(),
    userHasPermission(userId, "finding.create"),
  ]);
```

Pass to component:
```tsx
<FindingsScreen
  findings={findings}
  usersById={usersById}
  approvals={approvals}
  remediations={remediations}
  audits={audits}
  tasks={tasks}
  evidenceByFindingId={evidenceByFindingId}
  orgsById={orgsById}
  canCreate={canCreate}
  userId={userId}
  role={role}
/>
```

### Step 2d — Fix test

- [ ] **Step 4: Update FindingsScreen.test.tsx**

In `web/src/components/findings/FindingsScreen.test.tsx`, add `canCreate={true}` to the `<FindingsScreen>` render in `renderScreen()`:

```tsx
<FindingsScreen
  findings={FINDINGS}
  usersById={usersById}
  approvals={approvals}
  remediations={{}}
  evidenceByFindingId={evidenceByFindingId}
  audits={AUDITS}
  tasks={TASKS}
  orgsById={{}}
  canCreate={true}
  userId="u1"
  role="super"
/>
```

- [ ] **Step 5: Run all findings tests**

```bash
cd web && npm run test -- "FindingsScreen"
```

Expected: 4/4 pass.

- [ ] **Step 6: Run typecheck**

```bash
cd web && npm run typecheck
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add web/src/app/(app)/findings/page.tsx web/src/components/findings/FindingsScreen.tsx web/src/components/findings/FindingDrawer.tsx web/src/components/findings/FindingsScreen.test.tsx
git commit -m "fix(findings): thread server-resolved canCreate permission through to FindingDrawer submit gate"
```

---

## Self-Review

**Spec coverage:**
- ✅ head/chief/lead get finding.approve + finding.reject → Task 1
- ✅ canCreate from server → Task 2
- ✅ t1 keeps finding.create but not approve/reject → tested in Task 1 Step 1
- ✅ Remediation unchanged — not touched

**Placeholder scan:** None found. All code blocks complete.

**Type consistency:**
- `canCreate: boolean` used consistently across all 4 files
- `userHasPermission` imported from `@/lib/rbac.server` (confirmed exists at line 275)
- `SYSTEM_ROLE_DEFAULT_PERMISSIONS` exported from `rbac.server.ts` (confirmed at line 143)
