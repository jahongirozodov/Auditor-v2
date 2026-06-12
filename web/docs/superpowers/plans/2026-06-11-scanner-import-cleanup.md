# Scanner Import Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the "Supported formats" panel, remove the "Create findings" button (import is archive-only), and fix the status display bug in the recent imports table.

**Architecture:** All changes are confined to `ScannerImportScreen.tsx` and its test file. The server action `createScannerDrafts` stays in `actions/scanner.ts` (unused by UI for now). Status values in the DB are `analyzed | imported`; the UI was incorrectly checking for `"done"`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest + Testing Library, next-intl

---

## Files touched

| File | Change |
|---|---|
| `web/src/components/analysis/ScannerImportScreen.tsx` | Remove formats panel, remove createDrafts button, fix status labels, clean up dead code |
| `web/src/components/analysis/ScannerImportScreen.test.tsx` | Remove createScannerDrafts mock + test, fix IMPORTS fixture status |

---

### Task 1: Fix status display in recent imports table

**Files:**
- Modify: `web/src/components/analysis/ScannerImportScreen.test.tsx:26-35` (fixture status)
- Modify: `web/src/components/analysis/ScannerImportScreen.tsx:328-334` (status rendering)

- [ ] **Step 1: Update IMPORTS fixture — change `status: "done"` to `status: "analyzed"`**

In `web/src/components/analysis/ScannerImportScreen.test.tsx`, the `IMPORTS` fixture has `status: "done"` which never matches the DB values (`analyzed | imported`). Fix the fixture:

```typescript
const IMPORTS: ScanImportRowView[] = [
  {
    id: "si-1",
    filename: "scan-result.nessus",
    scanner: "nessus",
    auditCode: "AUD-2026-014",
    severityAgg: { critical: 3, high: 5, medium: 8, low: 2, info: 1 },
    status: "analyzed",   // was "done" — DB values are "analyzed" | "imported"
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];
```

- [ ] **Step 2: Write a failing test that checks "Bajarildi" label appears for `status: "analyzed"`**

Add this test inside `describe("ScannerImportScreen", ...)` in the test file:

```typescript
it("shows 'Bajarildi' tag for analyzed imports", () => {
  renderScreen(IMPORTS);
  expect(screen.getByText("Bajarildi")).toBeInTheDocument();
});
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
cd "D:/MY PROJECTS/Auditor v6/Auditor-v2/web"
npx vitest run --reporter=verbose src/components/analysis/ScannerImportScreen.test.tsx
```

Expected: FAIL — `Unable to find an element with the text: Bajarildi` (currently renders "Jarayonda" for everything).

- [ ] **Step 4: Fix status rendering in `ScannerImportScreen.tsx`**

Find this block (around line 328):
```typescript
<span
  className={
    imp.status === "done" ? "tag tag--success" : "tag tag--warning"
  }
>
  {imp.status === "done" ? "Bajarildi" : "Jarayonda"}
</span>
```

Replace with:
```typescript
<span
  className={
    imp.status === "analyzed" || imp.status === "imported"
      ? "tag tag--success"
      : "tag tag--warning"
  }
>
  {imp.status === "analyzed"
    ? "Bajarildi"
    : imp.status === "imported"
      ? "Yaratildi"
      : "Jarayonda"}
</span>
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd "D:/MY PROJECTS/Auditor v6/Auditor-v2/web"
npx vitest run --reporter=verbose src/components/analysis/ScannerImportScreen.test.tsx
```

Expected: All existing tests PASS + new "Bajarildi" test PASS.

---

### Task 2: Remove "Qo'llab-quvvatlanadigan formatlar" panel and clean up dead code

**Files:**
- Modify: `web/src/components/analysis/ScannerImportScreen.tsx`

Dead code to remove after the panel is gone:
- `Boxes` import (only used by the panel icon)
- `SCANNER_ORDER` constant (only used by panel rows)
- `SCANNER_COLOR` constant (only used by panel rows)
- `countByScanner` variable (only used by panel badge counts)

Keep: `SCANNER_ICON`, `SCANNER_LABELS`, `ScannerKey` — still used by the recent imports table.

- [ ] **Step 1: Remove the formats Panel block from the right column**

In `ScannerImportScreen.tsx`, find the right column div (`{/* RIGHT — supported formats + AI card */}`). Remove the entire `Panel` component for formats. The right column should become:

```tsx
{/* RIGHT — AI card */}
<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
  <div className="ai-card" style={{ flex: 1 }}>
    <div className="ai-card__inner">
      {/* ... existing AI card content unchanged ... */}
    </div>
  </div>
</div>
```

- [ ] **Step 2: Remove `Boxes` from the lucide import line**

Find:
```typescript
import {
  Activity,
  Boxes,
  Bug,
  ...
} from "lucide-react";
```

Remove `Boxes,` from the list.

- [ ] **Step 3: Remove `SCANNER_ORDER`, `SCANNER_COLOR`, and `countByScanner`**

Remove these three declarations entirely:

```typescript
// DELETE this:
const SCANNER_ORDER = ["nessus", "openvas", "nmap", "zap", "burp", "universal"] as const;

// DELETE this:
const SCANNER_COLOR: Record<ScannerKey, "warning" | "info" | "ghost"> = {
  nessus: "warning",
  openvas: "warning",
  nmap: "info",
  zap: "info",
  burp: "info",
  universal: "ghost",
};
```

And inside the component function, remove:
```typescript
// DELETE this block:
const countByScanner: Record<string, number> = {};
for (const imp of imports) {
  countByScanner[imp.scanner] = (countByScanner[imp.scanner] ?? 0) + 1;
}
```

- [ ] **Step 4: Run typecheck to confirm no leftover references**

```bash
cd "D:/MY PROJECTS/Auditor v6/Auditor-v2/web"
npx tsc --noEmit 2>&1 | head -30
```

Expected: 0 errors.

- [ ] **Step 5: Run tests**

```bash
cd "D:/MY PROJECTS/Auditor v6/Auditor-v2/web"
npx vitest run --reporter=verbose src/components/analysis/ScannerImportScreen.test.tsx
```

Expected: All tests PASS.

---

### Task 3: Remove "Findinglar uchun qo'shish" button and clean up

**Files:**
- Modify: `web/src/components/analysis/ScannerImportScreen.tsx`
- Modify: `web/src/components/analysis/ScannerImportScreen.test.tsx`

- [ ] **Step 1: Remove the createDrafts test case**

In the test file, delete this entire `it(...)` block:

```typescript
// DELETE:
it("creates drafts from the active upload", async () => {
  renderScreen([], LATEST, NORM);
  await userEvent.click(screen.getByRole("button", { name: /finding yaratish/ }));
  expect(createScannerDrafts).toHaveBeenCalledWith({ uploadId: "su-1" });
});
```

- [ ] **Step 2: Remove `createScannerDrafts` from the mock setup**

In the test file, find the `vi.hoisted` block:

```typescript
const { uploadScannerFile, reanalyzeScanner, createScannerDrafts } = vi.hoisted(() => ({
  uploadScannerFile: vi.fn(),
  reanalyzeScanner: vi.fn(),
  createScannerDrafts: vi.fn(),
}));
vi.mock("@/lib/actions/scanner", () => ({
  uploadScannerFile,
  reanalyzeScanner,
  createScannerDrafts,
}));
```

Replace with:

```typescript
const { uploadScannerFile, reanalyzeScanner } = vi.hoisted(() => ({
  uploadScannerFile: vi.fn(),
  reanalyzeScanner: vi.fn(),
}));
vi.mock("@/lib/actions/scanner", () => ({
  uploadScannerFile,
  reanalyzeScanner,
}));
```

Also remove the `beforeEach` line that sets up `createScannerDrafts`:
```typescript
// DELETE this line from beforeEach:
createScannerDrafts.mockResolvedValue({ ok: true, ids: ["F-2026-0001"] });
```

- [ ] **Step 3: Run tests to verify the mock removal doesn't break anything**

```bash
cd "D:/MY PROJECTS/Auditor v6/Auditor-v2/web"
npx vitest run --reporter=verbose src/components/analysis/ScannerImportScreen.test.tsx
```

Expected: All remaining tests PASS.

- [ ] **Step 4: Remove `createDrafts` function and button from `ScannerImportScreen.tsx`**

Remove the function:
```typescript
// DELETE:
function createDrafts() {
  if (!active) return;
  startTransition(async () => {
    const res = await createScannerDrafts({ uploadId: active.uploadId });
    if (res.ok) {
      toast(t("draftsCreated", { n: res.ids?.length ?? 0 }), "success");
      router.refresh();
    } else {
      toast(t("failed"), "danger");
    }
  });
}
```

Remove the button from the AI card (inside `{active ? (...) : null}`):

```tsx
// BEFORE — delete the Button with createDrafts:
{active ? (
  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
    <Button
      size="sm"
      variant="primary"
      icon={<Plus size={13} />}
      onClick={createDrafts}
      disabled={pending || aiPending}
    >
      {t("createDrafts", { n: ai?.findings.length ?? 0 })}
    </Button>
    <Button
      size="sm"
      variant="soft"
      icon={<RefreshCw size={13} className={aiPending ? "spin" : undefined} />}
      onClick={reanalyze}
      disabled={aiPending}
    >
      {aiPending ? t("aiAnalyzing") : t("aiReanalyze")}
    </Button>
  </div>
) : null}
```

Replace with (only the reanalyze button remains):
```tsx
{active ? (
  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
    <Button
      size="sm"
      variant="soft"
      icon={<RefreshCw size={13} className={aiPending ? "spin" : undefined} />}
      onClick={reanalyze}
      disabled={aiPending}
    >
      {aiPending ? t("aiAnalyzing") : t("aiReanalyze")}
    </Button>
  </div>
) : null}
```

- [ ] **Step 5: Remove `createScannerDrafts` and `Plus` imports from `ScannerImportScreen.tsx`**

From the lucide import:
```typescript
// Remove Plus from lucide imports
```

From the actions import:
```typescript
// BEFORE:
import { uploadScannerFile, reanalyzeScanner, createScannerDrafts } from "@/lib/actions/scanner";

// AFTER:
import { uploadScannerFile, reanalyzeScanner } from "@/lib/actions/scanner";
```

Also check if `pending` (from `useTransition`) is still used. After removing `createDrafts`, `startTransition` is still used in `confirmUpload`. Keep `const [pending, startTransition] = useTransition()`.

- [ ] **Step 6: Final typecheck + full test run**

```bash
cd "D:/MY PROJECTS/Auditor v6/Auditor-v2/web"
npx tsc --noEmit && npx vitest run src/components/analysis/ScannerImportScreen.test.tsx
```

Expected: 0 TypeScript errors, all tests PASS.

---

## Self-Review

**Spec coverage:**
- ✅ Remove "Qo'llab-quvvatlanadigan formatlar" panel → Task 2
- ✅ Remove "Findinglar uchun qo'shish" button → Task 3
- ✅ Fix recent imports status display (`done` → `analyzed/imported`) → Task 1
- ✅ AI card fills right column full height (`flex: 1`) → Task 2 Step 1

**Placeholder scan:** No TBDs, all code is explicit.

**Type consistency:** `ScanImportRowView.status` is `string` in the entity type — no type change needed for the status fix.
