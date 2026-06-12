# Audit Module Hardening Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate test coverage gaps in the audit module's data layer, action layer, and two key UI components; fix one confirmed i18n bug in `Overview.tsx`.

**Architecture:** TDD throughout — write failing tests first, then implement or fix. Mock Prisma (unit style) matching the existing pattern in `audits.test.ts`. Component tests use Testing Library + NextIntlClientProvider (matching Group.test.tsx pattern). No integration DB needed.

**Tech Stack:** Vitest, @testing-library/react, next-intl, Prisma 5 mock pattern, React 19.

---

## Confirmed bugs

- **`Overview.tsx`** — AI card body is a hardcoded Uzbek placeholder string and shows a hardcoded model name "qwen2.5:14b". Both must be replaced with i18n keys: `t("aiTitle")` for the title and `t("aiNoData")` for the body. The model badge must be removed.

## Coverage gaps (no new features, just tests)

| File | Lines | Tests now | Gap |
|---|---|---|---|
| `src/lib/data/audits.ts` | 85 | 0 | All 4 exported functions untested |
| `src/lib/actions/audits.ts` | 250 | 14 | Missing: `invalid` input cases, `not_found`, `code_conflict` |
| `src/components/audit/tabs/Overview.tsx` | 230 | 0 | All rendering logic untested |
| `src/components/audit/tabs/Group.tsx` | 336 | 4 | Candidates list, search, empty states untested |

---

## File map

| Action | Path | Purpose |
|---|---|---|
| Create | `web/src/lib/data/audits.test.ts` | Unit tests for data layer (8 cases) |
| Modify | `web/src/lib/actions/audits.test.ts` | Add 6 gap cases to existing suite |
| Modify | `web/src/components/audit/tabs/Overview.tsx` | Fix AI card i18n bug |
| Create | `web/src/components/audit/tabs/Overview.test.tsx` | Component tests (7 cases) |
| Modify | `web/src/components/audit/tabs/Group.test.tsx` | Add 5 gap cases to existing suite |

---

## Task 1: `data/audits.ts` — unit tests

**Files:**
- Create: `web/src/lib/data/audits.test.ts`

The data module exports: `getAudits`, `getAuditById`, `getAuditsByOrg`, `getScopedAudits`. All use `cache()` from React (transparent in tests — memoization doesn't affect correctness). `import "server-only"` passes harmlessly in a Node vitest environment.

- [ ] **Step 1: Create the test file**

Create `D:\MY PROJECTS\Auditor v6\Auditor-v2\web\src\lib\data\audits.test.ts`:

```typescript
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRow = {
  id: "AUD-2026-001",
  code: "AUD-2026-001",
  title: "Test Audit",
  orgId: "org1",
  type: "Kompleks",
  status: "in_progress",
  stage: 5,
  startDate: "2026-01-01",
  endDate: "2026-06-01",
  progress: 40,
  leaderId: "u1",
  lastSync: "2026-06-01",
  pinned: false,
  goal: "Maqsad matni",
  methodology: null,
  scope: ["scope1"],
  tools: ["tool1"],
  findings: { critical: 1, high: 2, medium: 3, low: 4 },
  tasksAgg: { total: 10, done: 3, in_progress: 4, blocked: 1, new: 2 },
  members: [{ userId: "u1" }, { userId: "u2" }],
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    audit: {
      findMany: vi.fn(async () => [mockRow]),
      findUnique: vi.fn(async () => mockRow),
    },
  },
}));

import { getAuditById, getAudits, getAuditsByOrg, getScopedAudits } from "./audits";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mock = prisma as any;

beforeEach(() => {
  vi.clearAllMocks();
  mock.audit.findMany.mockResolvedValue([mockRow]);
  mock.audit.findUnique.mockResolvedValue(mockRow);
});

describe("toAudit mapping (via getAudits)", () => {
  it("maps orgId → org, leaderId → leader, members array to flat string[]", async () => {
    const [a] = await getAudits();
    expect(a.org).toBe("org1");
    expect(a.leader).toBe("u1");
    expect(a.members).toEqual(["u1", "u2"]);
  });

  it("converts null methodology to undefined, preserves non-null goal", async () => {
    const [a] = await getAudits();
    expect(a.methodology).toBeUndefined();
    expect(a.goal).toBe("Maqsad matni");
  });
});

describe("getAudits", () => {
  it("queries with include members and orderBy code desc", async () => {
    await getAudits();
    expect(mock.audit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { members: true },
        orderBy: { code: "desc" },
      }),
    );
  });
});

describe("getAuditById", () => {
  it("returns mapped audit when found", async () => {
    const a = await getAuditById("AUD-2026-001");
    expect(a).toBeDefined();
    expect(a!.id).toBe("AUD-2026-001");
    expect(mock.audit.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "AUD-2026-001" } }),
    );
  });

  it("returns undefined when record does not exist", async () => {
    mock.audit.findUnique.mockResolvedValueOnce(null);
    const a = await getAuditById("nonexistent");
    expect(a).toBeUndefined();
  });
});

describe("getAuditsByOrg", () => {
  it("passes orgId in the where clause", async () => {
    await getAuditsByOrg("org42");
    expect(mock.audit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { orgId: "org42" } }),
    );
  });
});

describe("getScopedAudits — RBAC branching", () => {
  it("lead: queries by leaderId only", async () => {
    await getScopedAudits("u99", "lead");
    expect(mock.audit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { leaderId: "u99" } }),
    );
  });

  it("t1: queries audits where user is a member", async () => {
    await getScopedAudits("u99", "t1");
    expect(mock.audit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { members: { some: { userId: "u99" } } } }),
    );
  });

  it("head: queries audits where user is a member (documents current behaviour)", async () => {
    await getScopedAudits("u99", "head");
    expect(mock.audit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { members: { some: { userId: "u99" } } } }),
    );
  });
});
```

- [ ] **Step 2: Run — expect PASS (no implementation changes needed)**

```powershell
cd "D:\MY PROJECTS\Auditor v6\Auditor-v2\web"
npx vitest run src/lib/data/audits.test.ts 2>&1
```

Expected: 8/8 pass. If React `cache()` causes deduplication issues between tests (findMany call count wrong), add `vi.resetModules()` in `beforeEach` and re-import inside each test.

- [ ] **Step 3: Commit**

```powershell
git -C "D:\MY PROJECTS\Auditor v6\Auditor-v2" add web/src/lib/data/audits.test.ts
git -C "D:\MY PROJECTS\Auditor v6\Auditor-v2" commit -m "test(data): audit data layer unit tests — 8 cases"
```

---

## Task 2: `actions/audits.ts` — gap tests

**Files:**
- Modify: `web/src/lib/actions/audits.test.ts`

Existing suite covers happy paths. Missing: `createAudit` with short title and `code_conflict` DB error; `addMember/removeMember/promoteLead` when audit is not found.

**Read the file first:** `D:\MY PROJECTS\Auditor v6\Auditor-v2\web\src\lib\actions\audits.test.ts` to understand current structure before editing.

- [ ] **Step 1: Extend the hoisted `h` object to allow null audit**

In `audits.test.ts`, find this type annotation in `vi.hoisted(...)`:

```typescript
audit: { status: "group_forming", leaderId: "u3", title: "Test Audit" } as {
  status: string;
  leaderId: string;
  title: string;
},
```

Change the type to allow `null`:

```typescript
audit: { status: "group_forming", leaderId: "u3", title: "Test Audit" } as {
  status: string;
  leaderId: string;
  title: string;
} | null,
```

Also reset `h.audit` to non-null in `beforeEach` — this already reads `h.audit = { status: "group_forming", leaderId: "u3", title: "Test Audit" };` so no change needed there.

- [ ] **Step 2: Add import for Prisma error class**

At the top of `audits.test.ts`, after the existing imports, add:

```typescript
import { Prisma } from "@prisma/client";
```

- [ ] **Step 3: Add 6 new test cases**

Append these `describe` blocks at the end of `audits.test.ts` (after the existing `describe("KPI emission", ...)` block):

```typescript
describe("createAudit — validation gaps", () => {
  it("rejects title shorter than 3 characters", async () => {
    expect(await createAudit({ ...validCreate, title: "AB" })).toEqual({
      ok: false,
      error: "invalid",
    });
  });

  it("returns code_conflict when Prisma throws P2002", async () => {
    mockPrisma.$transaction.mockImplementationOnce(async () => {
      throw new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "5.0.0",
      });
    });
    expect(await createAudit(validCreate)).toEqual({ ok: false, error: "code_conflict" });
  });
});

describe("team actions — audit not found", () => {
  beforeEach(() => {
    h.audit = null;
  });

  it("addMember returns not_found when audit does not exist", async () => {
    expect(await addMember({ auditId: "AUD-missing", userId: "u6" })).toEqual({
      ok: false,
      error: "not_found",
    });
  });

  it("removeMember returns not_found when audit does not exist", async () => {
    expect(await removeMember({ auditId: "AUD-missing", userId: "u6" })).toEqual({
      ok: false,
      error: "not_found",
    });
  });

  it("promoteLead returns not_found when audit does not exist", async () => {
    expect(await promoteLead({ auditId: "AUD-missing", userId: "u6" })).toEqual({
      ok: false,
      error: "not_found",
    });
  });
});

describe("team actions — invalid input", () => {
  it("addMember returns invalid when auditId is empty", async () => {
    expect(await addMember({ auditId: "", userId: "u6" })).toEqual({
      ok: false,
      error: "invalid",
    });
  });
});
```

- [ ] **Step 4: Run — expect all pass**

```powershell
cd "D:\MY PROJECTS\Auditor v6\Auditor-v2\web"
npx vitest run src/lib/actions/audits.test.ts 2>&1
```

Expected: 20/20 pass (14 existing + 6 new). If `PrismaClientKnownRequestError` constructor fails, check `@prisma/client` version — the third argument `clientVersion` may be required.

- [ ] **Step 5: Commit**

```powershell
git -C "D:\MY PROJECTS\Auditor v6\Auditor-v2" add web/src/lib/actions/audits.test.ts
git -C "D:\MY PROJECTS\Auditor v6\Auditor-v2" commit -m "test(actions): audit action gap tests — invalid input, not_found, code_conflict"
```

---

## Task 3: `Overview.tsx` — fix i18n bug + tests

**Files:**
- Modify: `web/src/components/audit/tabs/Overview.tsx`
- Create: `web/src/components/audit/tabs/Overview.test.tsx`

**Read first:** `D:\MY PROJECTS\Auditor v6\Auditor-v2\web\src\components\audit\tabs\Overview.tsx`

### Part A: Fix the bug (write failing test first)

- [ ] **Step 1: Create the test file with a failing test**

Create `D:\MY PROJECTS\Auditor v6\Auditor-v2\web\src\components\audit\tabs\Overview.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { Overview } from "./Overview";
import type { Audit } from "@/lib/types/entities";

vi.mock("@/lib/fixtures", () => ({
  WORKFLOW: [
    { n: 1, key: "create", title: "Audit yaratish", who: "Boʻlim boshligʻi", short: "Kartasi yaratildi." },
    { n: 5, key: "fieldwork", title: "Dala bosqichi", who: "Auditor", short: "Asosiy ish." },
    { n: 7, key: "in_progress", title: "Bajarish", who: "Auditor", short: "Bajarilmoqda." },
    { n: 10, key: "complete", title: "Yakunlash", who: "Bosh", short: "Tugatildi." },
  ],
  userById: vi.fn((id: string) => ({
    id,
    name: `Foydalanuvchi ${id}`,
    role: "t1",
    title: "Auditor",
    avatar: id.slice(0, 2).toUpperCase(),
    dept: "",
  })),
  findingsByAudit: vi.fn(() => [
    {
      id: "f1",
      auditId: "AUD-2026-001",
      severity: "critical",
      title: "RCE orqali yuklab olish",
      asset: "192.168.1.1",
      cvss: "9.8",
      status: "open",
      reportedBy: "u1",
    },
    {
      id: "f2",
      auditId: "AUD-2026-001",
      severity: "high",
      title: "SQLi login",
      asset: "api.local",
      cvss: "8.2",
      status: "approved",
      reportedBy: "u2",
    },
  ]),
}));

const AUDIT: Audit = {
  id: "AUD-2026-001",
  code: "AUD-2026-001",
  title: "Test Audit",
  org: "o1",
  type: "Kompleks audit",
  status: "in_progress",
  stage: 7,
  startDate: "2026-04-12",
  endDate: "2026-05-31",
  progress: 64,
  leader: "u3",
  members: ["u3", "u4", "u6"],
  findings: { critical: 4, high: 9, medium: 14, low: 7 },
  tasks: { total: 38, done: 22, in_progress: 11, blocked: 2, new: 3 },
  lastSync: "12 daqiqa oldin",
  pinned: true,
  scope: [],
  tools: [],
};

function renderOverview(a = AUDIT) {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <Overview a={a} />
    </NextIntlClientProvider>,
  );
}

describe("Overview tab", () => {
  it("AI card title uses i18n key, not hardcoded 'AI xulosa'", () => {
    renderOverview();
    // The hardcoded string "AI xulosa" must NOT appear
    expect(screen.queryByText("AI xulosa")).not.toBeInTheDocument();
    // The i18n value for aiTitle must appear instead
    expect(screen.getByText(messages.auditDetail.aiTitle)).toBeInTheDocument();
  });

  it("AI card body does not contain hardcoded Uzbek text", () => {
    renderOverview();
    expect(screen.queryByText(/kritik finding aniqlandi/)).not.toBeInTheDocument();
  });

  it("stat card shows correct task ratio done/total", () => {
    renderOverview();
    expect(screen.getByText("22/38")).toBeInTheDocument();
  });

  it("stat card shows total finding count", () => {
    // critical+high+medium+low = 4+9+14+7 = 34
    renderOverview();
    expect(screen.getByText("34")).toBeInTheDocument();
  });

  it("stat card shows team member count", () => {
    renderOverview();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("workflow marks stage 7 as current", () => {
    renderOverview();
    // t("currentStage") label appears on the current stage item
    expect(screen.getByText(messages.auditDetail.currentStage)).toBeInTheDocument();
  });

  it("critical findings table renders mocked findings", () => {
    renderOverview();
    expect(screen.getByText("RCE orqali yuklab olish")).toBeInTheDocument();
    expect(screen.getByText("SQLi login")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect the i18n tests to FAIL**

```powershell
cd "D:\MY PROJECTS\Auditor v6\Auditor-v2\web"
npx vitest run src/components/audit/tabs/Overview.test.tsx 2>&1
```

Expected: FAIL on "AI card title uses i18n key" and "AI card body" tests (hardcoded strings still there).

- [ ] **Step 3: Fix the bug in Overview.tsx**

Open `D:\MY PROJECTS\Auditor v6\Auditor-v2\web\src\components\audit\tabs\Overview.tsx`.

Find this block (around line 211):
```tsx
        <div className="ai-card">
          <div className="ai-card__inner">
            <div className="ai-card__head">
              <span className="ai-card__icon">
                <Sparkles size={15} />
              </span>
              <span className="ai-card__title">AI xulosa</span>
              <span className="tag tag--brand" style={{ marginLeft: "auto" }}>
                qwen2.5:14b
              </span>
            </div>
            <p className="ai-card__body">
              {a.findings.critical} ta kritik finding aniqlandi. Review jarayonini tezlashtirish va
              segmentatsiya kamchiliklarini birinchi navbatda bartaraf etish tavsiya etiladi.
            </p>
          </div>
        </div>
```

Replace with:
```tsx
        <div className="ai-card">
          <div className="ai-card__inner">
            <div className="ai-card__head">
              <span className="ai-card__icon">
                <Sparkles size={15} />
              </span>
              <span className="ai-card__title">{t("aiTitle")}</span>
            </div>
            <p className="ai-card__body">{t("aiNoData")}</p>
          </div>
        </div>
```

- [ ] **Step 4: Run — all 7 tests pass**

```powershell
npx vitest run src/components/audit/tabs/Overview.test.tsx 2>&1
```

Expected: 7/7 pass. If `messages.auditDetail.currentStage` renders in multiple places (workflow has multiple steps), narrow the assertion using `getAllByText` and check length, or use `toHaveLength(1)`.

- [ ] **Step 5: Typecheck**

```powershell
npx tsc --noEmit 2>&1 | Select-String "Overview" -SimpleMatch
```

Expected: no output.

- [ ] **Step 6: Commit**

```powershell
git -C "D:\MY PROJECTS\Auditor v6\Auditor-v2" add web/src/components/audit/tabs/Overview.tsx web/src/components/audit/tabs/Overview.test.tsx
git -C "D:\MY PROJECTS\Auditor v6\Auditor-v2" commit -m "fix(audit): Overview AI card uses i18n; add 7 component tests"
```

---

## Task 4: `Group.tsx` — gap tests

**Files:**
- Modify: `web/src/components/audit/tabs/Group.test.tsx`

Existing 4 tests cover: lead tagging, promote buttons for non-leads, no project-creation button in group tab, t1 cannot see edit controls. Missing: candidates panel population, name search, empty states.

**Read first:** `D:\MY PROJECTS\Auditor v6\Auditor-v2\web\src\components\audit\tabs\Group.test.tsx` — understand current `renderGroup` helper before adding tests.

Context:
- `AUDITS.find(a => a.id === "AUD-2026-014")!` has `members: ["u3", "u4", "u6", "u7"]`
- `USERS` has: u1(super), u2(head), u3(chief), u4(lead), u5(lead), u6(t1), u7(t1), u8…u10
- `ELIGIBLE = ["chief", "lead", "t1"]` (line 25 of Group.tsx)
- Candidates = ELIGIBLE users NOT in `a.members`
- For AUD-2026-014 with all 4 members in team: u3(chief✓), u4(lead✓), u6(t1✓), u7(t1✓) — so u5(lead) and any eligible users not listed are candidates

- [ ] **Step 1: Add import for fireEvent**

In `Group.test.tsx`, update the testing-library import to include `fireEvent`:

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
```

- [ ] **Step 2: Append 5 new test cases**

At the end of the `describe("Group tab", ...)` block (before the closing `}`), add:

```typescript
  it("candidates panel shows eligible users (chief/lead/t1) not in the team", () => {
    // Use a minimal audit with only u3 in team; u4,u5,u6,u7 are candidates (eligible + not member)
    const base = AUDITS.find((a) => a.id === "AUD-2026-014")!;
    renderGroup({ ...base, members: ["u3"], leader: "u3" }, "super");
    // u4 (lead) and u5 (lead) are eligible and not in team → appear in candidates panel
    expect(screen.getByText("Sevara Karimova")).toBeInTheDocument();
    expect(screen.getByText("Otabek Joʻrayev")).toBeInTheDocument();
    // u1 (super) is NOT eligible → must NOT appear in candidates
    expect(screen.queryByText("Akmal Yoʻldoshev")).not.toBeInTheDocument();
  });

  it("search filters candidates by name (case-insensitive)", () => {
    const base = AUDITS.find((a) => a.id === "AUD-2026-014")!;
    renderGroup({ ...base, members: ["u3"], leader: "u3" }, "super");
    const searchInput = screen.getByPlaceholderText(messages.auditDetail.groupSearch);
    fireEvent.change(searchInput, { target: { value: "sevara" } });
    // Sevara matches
    expect(screen.getByText("Sevara Karimova")).toBeInTheDocument();
    // Otabek does not match → filtered out
    expect(screen.queryByText("Otabek Joʻrayev")).not.toBeInTheDocument();
  });

  it("no-results message when search matches nobody", () => {
    const base = AUDITS.find((a) => a.id === "AUD-2026-014")!;
    renderGroup({ ...base, members: ["u3"], leader: "u3" }, "super");
    const searchInput = screen.getByPlaceholderText(messages.auditDetail.groupSearch);
    fireEvent.change(searchInput, { target: { value: "xxxxxxxxxx" } });
    expect(screen.getByText(messages.auditDetail.groupNoResults)).toBeInTheDocument();
  });

  it("noCandidates message when all eligible users are already members", () => {
    const base = AUDITS.find((a) => a.id === "AUD-2026-014")!;
    // u3(chief), u4(lead), u5(lead), u6(t1), u7(t1) are all eligible; put them all in team
    // u8/u9/u10 exist but may not be eligible — assume USERS array has these with roles
    const allEligibleIds = USERS.filter((u) => ["chief", "lead", "t1"].includes(u.role)).map((u) => u.id);
    renderGroup({ ...base, members: allEligibleIds, leader: allEligibleIds[0] }, "super");
    expect(screen.getByText(messages.auditDetail.noCandidates)).toBeInTheDocument();
  });

  it("add-member buttons visible when super (canEdit = true)", () => {
    const base = AUDITS.find((a) => a.id === "AUD-2026-014")!;
    renderGroup({ ...base, members: ["u3"], leader: "u3" }, "super");
    expect(screen.getAllByRole("button", { name: messages.auditDetail.addMember }).length).toBeGreaterThan(0);
  });

  it("no add-member buttons when t1 (canEdit = false)", () => {
    const base = AUDITS.find((a) => a.id === "AUD-2026-014")!;
    renderGroup({ ...base, members: ["u3"], leader: "u3" }, "t1");
    expect(screen.queryByRole("button", { name: messages.auditDetail.addMember })).not.toBeInTheDocument();
  });
```

- [ ] **Step 3: Run — expect all 9 pass (4 old + 5 new)**

```powershell
cd "D:\MY PROJECTS\Auditor v6\Auditor-v2\web"
npx vitest run src/components/audit/tabs/Group.test.tsx 2>&1
```

Expected: 10/10 pass (4 existing + 6 new).

Troubleshooting:
- If "Sevara Karimova" not found: check USERS in fixture file for exact name spelling. Read `src/lib/fixtures/index.ts` around line 34 to confirm.
- If `messages.auditDetail.groupSearch` is `undefined`: the key name might differ — check `web/messages/uz.json` for the `auditDetail.groupSearch` key.
- If `noCandidates` test fails with wrong count: read USERS fixture to count eligible users, adjust `allEligibleIds`.

- [ ] **Step 4: Commit**

```powershell
git -C "D:\MY PROJECTS\Auditor v6\Auditor-v2" add web/src/components/audit/tabs/Group.test.tsx
git -C "D:\MY PROJECTS\Auditor v6\Auditor-v2" commit -m "test(audit): Group tab gap tests — candidates, search, empty states"
```

---

## Task 5: Full verification

- [ ] **Step 1: Run entire audit test suite**

```powershell
cd "D:\MY PROJECTS\Auditor v6\Auditor-v2\web"
npx vitest run --reporter=verbose 2>&1 | Select-String -Pattern "audit|PASS|FAIL|Tests " -SimpleMatch
```

Expected: zero failures. Total should be 59 + 26 new = ~85 tests.

- [ ] **Step 2: Full typecheck**

```powershell
npx tsc --noEmit 2>&1
```

Expected: zero errors.

- [ ] **Step 3: Build**

```powershell
npx next build 2>&1 | Select-String -Pattern "error|warn|✓" -SimpleMatch
```

Expected: `✓ Compiled successfully`.
