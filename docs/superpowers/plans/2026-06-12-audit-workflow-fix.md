# Audit Workflow Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the audit workflow so project approval (Loyihani tasdiqlash) always happens before task assignment (Vazifalarni taqsimlash), both in the timeline display and in server logic, and gate task-related tabs behind the `assigning` status.

**Architecture:** Three bugs are fixed independently: (1) the `WORKFLOW` fixture has steps 4 and 5 swapped; (2) `projectApproval` action sets audit status to `"approved"` (the end-of-audit state) instead of `"assigning"` after final dept approval; (3) no tab gating in `AuditDetailScreen` — task-related tabs are clickable before the project is approved. Additionally, the task-creation guard in `data/tasks.ts` includes `"approved"` (wrong) and `Tabs` needs a `disabled` prop for locked tabs.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Vitest + Testing Library, `next-intl` (uz.json), vendored CSS design system (`.tabs__btn`)

---

## File Map

| File | Change |
|---|---|
| `web/src/lib/fixtures/index.ts` | Swap WORKFLOW n=4 and n=5 |
| `web/src/lib/actions/projects.ts` | Final approval: `"approved"` → `"assigning"`; notification guard update |
| `web/src/lib/actions/projects.test.ts` | Update dept-approve test assertion; add `assigning` expectation |
| `web/src/lib/data/tasks.ts` | Remove `"approved"` from `getCreatableTaskAudits` status filter |
| `web/src/components/ui/Tabs.tsx` | Add `disabled?` + `disabledTitle?` to `TabDef`, render accordingly |
| `web/src/components/ui/Tabs.test.tsx` | Add disabled tab tests |
| `web/src/components/audit/AuditDetailScreen.tsx` | Compute tab lock sets, pass `disabled`/`disabledTitle` to each tab |
| `web/src/components/audit/AuditDetailScreen.test.tsx` | Add tab-gating assertions |
| `web/messages/uz.json` | Add `tabLocked` key under `auditDetail` |

---

## Task 1: Fix WORKFLOW fixture — swap steps 4 and 5

**Files:**
- Modify: `web/src/lib/fixtures/index.ts:146-147`

### Background

`WORKFLOW` is a 10-step array that drives the stepper widget in `AuditDetailScreen`. Currently:
- `n=4` key `"assign"` — "Vazifalarni taqsimlash" (task assignment)
- `n=5` key `"approve"` — "Loyihani tasdiqlash" (project approval)

That is backwards. The correct order: approve (n=4) → assign (n=5).

- [ ] **Step 1: Open `web/src/lib/fixtures/index.ts` and find lines 146-147**

Current (wrong):
```typescript
  { n: 4, key: "assign", title: "Vazifalarni taqsimlash", who: "Guruh rahbari", short: "38 ta vazifa 4 ta auditor oʻrtasida taqsimlandi." },
  { n: 5, key: "approve", title: "Loyihani tasdiqlash", who: "Boʻlim boshligʻi", short: "Audit loyihasi tasdiqlandi." },
```

- [ ] **Step 2: Swap the two lines so approve is n=4 and assign is n=5**

```typescript
  { n: 4, key: "approve", title: "Loyihani tasdiqlash", who: "Boʻlim boshligʻi", short: "Audit loyihasi tasdiqlandi." },
  { n: 5, key: "assign", title: "Vazifalarni taqsimlash", who: "Guruh rahbari", short: "38 ta vazifa 4 ta auditor oʻrtasida taqsimlandi." },
```

- [ ] **Step 3: Run build to confirm no type errors**

```bash
cd web && npm run typecheck
```

Expected: `0 errors`

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/fixtures/index.ts
git commit -m "fix(fixtures): swap WORKFLOW steps 4/5 — approve before assign"
```

---

## Task 2: Fix `projectApproval` action — final approval → `assigning`

**Files:**
- Modify: `web/src/lib/actions/projects.ts:134,135,219`
- Modify: `web/src/lib/actions/projects.test.ts:160-177`

### Background

In `projects.ts`, the `approve` branch computes next status:
```typescript
nextAuditStatus = nxt ? "head_approved" : "approved";
nextAuditStage = nxt ? 4 : 5;
```

`nxt = nextStage(cur)` — when `cur === "dept"` (final stage), `nxt` is `null`, so `nextAuditStatus` becomes `"approved"`. But `"approved"` is the **end-of-audit** status (final report approved). After full project approval the audit should move to `"assigning"` (stage 5) so tasks can be assigned.

The notification block also fires `project_approved` when `nextAuditStatus === "approved"` — that condition must be updated to `"assigning"`.

An existing test at line 160 (`"dept approve sets project approved and audit approved (Tasdiqlangan)"`) asserts the old wrong behavior. It must be updated.

- [ ] **Step 1: Write the failing test first (update the existing test in `projects.test.ts`)**

Find the test `"dept approve sets project approved and audit approved (Tasdiqlangan)"` (around line 160) and replace it:

```typescript
  it("dept approve sets project approved and audit assigning", async () => {
    h.project = {
      ...h.project,
      status: "submitted",
      currentApprovalStage: "dept",
      audit: { status: "head_approved", leaderId: "u3", title: "Test Audit" },
    };
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u1", role: "super", name: "" });
    expect(await projectApproval({ auditId: "AUD-1", action: "approve" })).toEqual({ ok: true });
    expect(mockPrisma.auditProject.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { status: "approved", currentApprovalStage: null },
    });
    expect(mockPrisma.audit.update).toHaveBeenCalledWith({
      where: { id: "AUD-1" },
      data: { status: "assigning", stage: 5 },
    });
  });
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
cd web && npx vitest run src/lib/actions/projects.test.ts
```

Expected: FAIL — `received: { status: "approved", stage: 5 }`, expected: `{ status: "assigning", stage: 5 }`

- [ ] **Step 3: Fix `projects.ts` lines 134 and 219**

Line 134 — change `"approved"` to `"assigning"`:
```typescript
    nextAuditStatus = nxt ? "head_approved" : "assigning";
```
Line 135 stays unchanged (`nextAuditStage = nxt ? 4 : 5`).

Line 219 — update the notification guard from `"approved"` to `"assigning"`:
```typescript
    } else if (nextAuditStatus === "assigning") {
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
cd web && npx vitest run src/lib/actions/projects.test.ts
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/actions/projects.ts web/src/lib/actions/projects.test.ts
git commit -m "fix(projects): final project approval transitions audit to assigning, not approved"
```

---

## Task 3: Fix task creation guard in `data/tasks.ts`

**Files:**
- Modify: `web/src/lib/data/tasks.ts:96`

### Background

`getCreatableTaskAudits` currently allows task creation in audits with status `["approved", "assigning", "in_progress"]`. After the Task 2 fix, `"approved"` will never be reached during task assignment — it is the end-of-audit state. Remove it from the allowed list.

There is no dedicated test for this file's status filter yet — add one directly in `web/src/lib/data/tasks.test.ts` (check if it exists; if not, create it as a node environment test).

- [ ] **Step 1: Check if `web/src/lib/data/tasks.test.ts` exists**

```bash
ls web/src/lib/data/tasks.test.ts 2>/dev/null || echo "missing"
```

- [ ] **Step 2: If the file exists, open it and add the guard test. If it does not exist, create it.**

Add this test (or create the file with this content):

```typescript
// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

const h = vi.hoisted(() => ({
  rows: [] as { status: string; leaderId: string; members: { userId: string }[] }[],
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    audit: {
      findMany: vi.fn(async () => h.rows),
    },
  },
}));
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, cache: (fn: unknown) => fn };
});
vi.mock("server-only", () => ({}));
vi.mock("@/lib/rbac.server", () => ({
  userHasPermission: vi.fn(async () => true),
}));

import { prisma } from "@/lib/prisma";
import { getCreatableTaskAudits } from "./tasks";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("getCreatableTaskAudits", () => {
  it("queries only assigning and in_progress statuses — not approved", async () => {
    h.rows = [];
    await getCreatableTaskAudits("u1", "super");
    expect(
      (mockPrisma.audit.findMany as ReturnType<typeof vi.fn>).mock.calls[0][0].where.status.in,
    ).not.toContain("approved");
    expect(
      (mockPrisma.audit.findMany as ReturnType<typeof vi.fn>).mock.calls[0][0].where.status.in,
    ).toEqual(expect.arrayContaining(["assigning", "in_progress"]));
  });
});
```

- [ ] **Step 3: Run the test to confirm it fails**

```bash
cd web && npx vitest run src/lib/data/tasks.test.ts
```

Expected: FAIL — the array currently contains `"approved"`

- [ ] **Step 4: Fix `data/tasks.ts` line 96**

```typescript
        status: { in: ["assigning", "in_progress"] },
```

- [ ] **Step 5: Run the test to confirm it passes**

```bash
cd web && npx vitest run src/lib/data/tasks.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add web/src/lib/data/tasks.ts web/src/lib/data/tasks.test.ts
git commit -m "fix(tasks): remove approved from creatable-task audit statuses"
```

---

## Task 4: Add `disabled` prop to `Tabs` component

**Files:**
- Modify: `web/src/components/ui/Tabs.tsx`
- Modify: `web/src/components/ui/Tabs.test.tsx`

### Background

`Tabs` renders a `<button role="tab">` per tab. It needs to accept `disabled?: boolean` and `disabledTitle?: string` so that locked tabs render grayed with a tooltip and cannot be clicked. Use the HTML `disabled` attribute (simplest, no-click, browser-styled) plus a `title` for tooltip text.

- [ ] **Step 1: Write the failing tests in `Tabs.test.tsx`**

Add two tests after the existing ones:

```typescript
  it("renders a disabled tab with reduced opacity and title tooltip", () => {
    const TABS_WITH_DISABLED = [
      { id: "overview", label: "Umumiy" },
      { id: "tasks", label: "Vazifalar", disabled: true, disabledTitle: "Loyiha tasdiqlanishi kerak" },
    ];
    render(<Tabs active="overview" onChange={() => {}} tabs={TABS_WITH_DISABLED} />);
    const btn = screen.getByRole("tab", { name: /Vazifalar/ });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("title", "Loyiha tasdiqlanishi kerak");
  });

  it("does not call onChange when a disabled tab is clicked", async () => {
    const onChange = vi.fn();
    const TABS_WITH_DISABLED = [
      { id: "overview", label: "Umumiy" },
      { id: "tasks", label: "Vazifalar", disabled: true, disabledTitle: "Loyiha tasdiqlanishi kerak" },
    ];
    render(<Tabs active="overview" onChange={onChange} tabs={TABS_WITH_DISABLED} />);
    // userEvent won't click a disabled button — click is a no-op
    await userEvent.click(screen.getByRole("tab", { name: /Vazifalar/ }));
    expect(onChange).not.toHaveBeenCalled();
  });
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
cd web && npx vitest run src/components/ui/Tabs.test.tsx
```

Expected: FAIL — `disabled` prop not on `TabDef`, button not disabled

- [ ] **Step 3: Update `Tabs.tsx`**

Full replacement of `Tabs.tsx`:

```typescript
"use client";

import type { ReactNode } from "react";

export interface TabDef {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
  disabled?: boolean;
  disabledTitle?: string;
}

/** Underline tab bar over the `.tabs` classes (content rendered by the parent). */
export function Tabs({
  active,
  onChange,
  tabs,
}: {
  active: string;
  onChange: (id: string) => void;
  tabs: TabDef[];
}) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          disabled={tab.disabled}
          title={tab.disabled ? tab.disabledTitle : undefined}
          className={`tabs__btn${active === tab.id ? " is-active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {tab.count != null ? <span className="count">{tab.count}</span> : null}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run all Tabs tests**

```bash
cd web && npx vitest run src/components/ui/Tabs.test.tsx
```

Expected: all 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/components/ui/Tabs.tsx web/src/components/ui/Tabs.test.tsx
git commit -m "feat(ui/Tabs): add disabled+disabledTitle props for locked tabs"
```

---

## Task 5: Gate tabs in `AuditDetailScreen` + i18n

**Files:**
- Modify: `web/messages/uz.json`
- Modify: `web/src/components/audit/AuditDetailScreen.tsx`
- Modify: `web/src/components/audit/AuditDetailScreen.test.tsx`

### Background

`AuditDetailScreen` renders 11 tabs unconditionally. After this task:
- **Locked before `assigning`** (statuses `planning | group_forming | project_draft | project_pending | head_approved`): `tasks`, `findings`, `files`, `tokens`, `ai`, `kpi`
- **Locked before `in_progress`** (the above + `assigning`): `reports`
- **Always accessible**: `overview`, `group`, `project`, `log`

Tooltip message key: `auditDetail.tabLocked` = "Loyiha tasdiqlanishi kerak"

The fixture `AUD-2026-015` has `status: "project_pending"` — perfect for testing locked state.
The fixture `AUD-2026-014` has `status: "in_progress"` — for testing unlocked state.

- [ ] **Step 1: Add `tabLocked` key to `messages/uz.json`**

Find the `auditDetail` object (around line 1068) and add after `tabLog`:

```json
    "tabLog": "Audit log",
    "tabLocked": "Loyiha tasdiqlanishi kerak"
```

- [ ] **Step 2: Write failing tests in `AuditDetailScreen.test.tsx`**

Add these tests after the existing ones. Note: `renderDetail` helper already exists in the file and uses `AUDITS.find((a) => a.id === id)`.

```typescript
  it("disables task-related tabs for a project_pending audit", () => {
    // AUD-2026-015 has status "project_pending"
    renderDetail("AUD-2026-015");
    const lockedMsg = messages.auditDetail.tabLocked;
    expect(screen.getByRole("tab", { name: /Vazifalar/ })).toBeDisabled();
    expect(screen.getByRole("tab", { name: /Vazifalar/ })).toHaveAttribute("title", lockedMsg);
    expect(screen.getByRole("tab", { name: /Findinglar/ })).toBeDisabled();
    expect(screen.getByRole("tab", { name: /Tokenlar/ })).toBeDisabled();
    expect(screen.getByRole("tab", { name: /KPI/ })).toBeDisabled();
    expect(screen.getByRole("tab", { name: /AI tahlil/ })).toBeDisabled();
    expect(screen.getByRole("tab", { name: /Fayllar/ })).toBeDisabled();
  });

  it("does not disable task-related tabs for an in_progress audit", () => {
    // AUD-2026-014 has status "in_progress"
    renderDetail("AUD-2026-014");
    expect(screen.getByRole("tab", { name: /Vazifalar/ })).not.toBeDisabled();
    expect(screen.getByRole("tab", { name: /Findinglar/ })).not.toBeDisabled();
    expect(screen.getByRole("tab", { name: /Tokenlar/ })).not.toBeDisabled();
  });

  it("never disables overview, group, project, log tabs regardless of status", () => {
    renderDetail("AUD-2026-015");
    expect(screen.getByRole("tab", { name: /Umumiy/ })).not.toBeDisabled();
    expect(screen.getByRole("tab", { name: /Audit guruhi/ })).not.toBeDisabled();
    expect(screen.getByRole("tab", { name: /Audit loyihasi/ })).not.toBeDisabled();
    expect(screen.getByRole("tab", { name: /Audit log/ })).not.toBeDisabled();
  });
```

- [ ] **Step 3: Run the tests to confirm they fail**

```bash
cd web && npx vitest run src/components/audit/AuditDetailScreen.test.tsx
```

Expected: FAIL — tabs are not disabled for `project_pending`

- [ ] **Step 4: Update `AuditDetailScreen.tsx` — add lock sets and wire tabs**

Import `AuditStatus` at the top if not already imported (it comes from types/entities):
```typescript
import type { AuditStatus } from "@/lib/types/entities";
```

After `const findingsCount = ...` (around line 102), add:

```typescript
  const LOCK_PRE_ASSIGNING = new Set<AuditStatus>([
    "planning", "group_forming", "project_draft", "project_pending", "head_approved",
  ]);
  const LOCK_PRE_IN_PROGRESS = new Set<AuditStatus>([
    "planning", "group_forming", "project_draft", "project_pending", "head_approved", "assigning",
  ]);
  const lockMsg = t("tabLocked");
  const lock = (set: Set<AuditStatus>) =>
    set.has(a.status) ? { disabled: true as const, disabledTitle: lockMsg } : {};
```

Then update the `tabs` array (lines 104-121). Replace it with:

```typescript
  const tabs = [
    { id: "overview", label: t("tabOverview"), icon: <LayoutDashboard size={15} /> },
    { id: "group", label: t("tabGroup"), icon: <Users size={15} /> },
    { id: "project", label: t("tabProject"), icon: <Map size={15} /> },
    { id: "tasks", label: t("tabTasks"), icon: <CheckSquare size={15} />, count: a.tasks.total, ...lock(LOCK_PRE_ASSIGNING) },
    { id: "findings", label: t("tabFindings"), icon: <AlertTriangle size={15} />, count: findingsCount, ...lock(LOCK_PRE_ASSIGNING) },
    { id: "files", label: t("tabFiles"), icon: <Folder size={15} />, ...lock(LOCK_PRE_ASSIGNING) },
    { id: "tokens", label: t("tabTokens"), icon: <KeyRound size={15} />, ...lock(LOCK_PRE_ASSIGNING) },
    { id: "ai", label: t("tabAi"), icon: <Sparkles size={15} />, ...lock(LOCK_PRE_ASSIGNING) },
    { id: "kpi", label: t("tabKpi"), icon: <Trophy size={15} />, ...lock(LOCK_PRE_ASSIGNING) },
    { id: "reports", label: t("tabReports"), icon: <FileText size={15} />, ...lock(LOCK_PRE_IN_PROGRESS) },
    { id: "log", label: t("tabLog"), icon: <History size={15} /> },
  ];
```

`AuditStatus` is already imported via `import type { ..., AuditStatus } from "@/lib/types/entities"` — confirm it's in the import list; if not, add it.

- [ ] **Step 5: Run the tests**

```bash
cd web && npx vitest run src/components/audit/AuditDetailScreen.test.tsx
```

Expected: all tests including new ones PASS

- [ ] **Step 6: Run the full test + typecheck suite**

```bash
cd web && npm run typecheck && npm run test
```

Expected: typecheck exits 0; all pre-existing + new tests pass (16 pre-existing failures in unrelated modules are known and acceptable — check nothing new broke)

- [ ] **Step 7: Commit**

```bash
git add web/messages/uz.json web/src/components/audit/AuditDetailScreen.tsx web/src/components/audit/AuditDetailScreen.test.tsx
git commit -m "feat(audit-detail): gate task-related tabs behind assigning status"
```

---

## Self-Review

**Spec coverage:**
- ✅ WORKFLOW step order fixed (Task 1)
- ✅ Final project approval transitions to `assigning` not `approved` (Task 2)  
- ✅ Task creation guard corrected (Task 3)
- ✅ `Tabs` supports disabled state (Task 4)
- ✅ Tab gating in `AuditDetailScreen` (Task 5)
- ✅ i18n tooltip key added (Task 5)

**Placeholder scan:** No TBD, TODO, or hand-wavy steps found.

**Type consistency:**
- `TabDef.disabled?: boolean` defined in Task 4, consumed in Task 5 ✅
- `TabDef.disabledTitle?: string` defined in Task 4, consumed in Task 5 ✅
- `AuditStatus` type used in `Set<AuditStatus>` — already in entities.ts ✅
- `lock()` helper returns `{ disabled: true, disabledTitle: string }` or `{}` — spread-safe ✅
- Notification guard `nextAuditStatus === "assigning"` matches the new value set in Task 2 ✅
