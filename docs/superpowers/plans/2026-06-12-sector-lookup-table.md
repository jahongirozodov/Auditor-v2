# Sector Lookup Table Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the free-text `sector` field in the org form with a `Select` dropdown backed by a user-managed `Sector` lookup table, with a "+" button that opens an inline `SectorManagerModal` for adding/deleting sectors.

**Architecture:** New `Sector` Prisma model (id, name unique) acts as a lookup list. `Organization.sector` stays as `String` — no FK, stores the sector name directly. Page fetches sectors server-side and threads them down to `OrgFormModal` via `OrgsScreen`. `SectorManagerModal` mutates via Server Actions and calls `router.refresh()` to keep the list live without closing the parent form.

**Tech Stack:** Prisma 5, Next.js 16 App Router, React 19, next-intl, Vitest + Testing Library, existing design-system classes (`.input`, `.iconbtn`, `.lrow`, `Modal`, `Select`, `Button`, `Field`).

---

## File map

| Action | Path | Purpose |
|--------|------|---------|
| Modify | `web/prisma/schema.prisma` | Add `Sector` model |
| Modify | `web/prisma/seed.ts` | Seed 8 sectors |
| Modify | `web/src/lib/types/entities.ts` | Add `Sector` interface |
| Create | `web/src/lib/data/sectors.ts` | `getSectors()` cached fetcher |
| Create | `web/src/lib/actions/sectors.ts` | `createSector`, `deleteSector` Server Actions |
| Create | `web/src/lib/actions/sectors.test.ts` | Tests for sector actions |
| Create | `web/src/components/organizations/SectorManagerModal.tsx` | Inline sector list + add/delete |
| Modify | `web/src/components/organizations/OrgFormModal.tsx` | Sector → Select + "+" button |
| Modify | `web/src/components/organizations/OrgsScreen.tsx` | Add `sectors` + `canManageSectors` props |
| Modify | `web/src/app/(app)/organizations/page.tsx` | Fetch sectors, pass to OrgsScreen |
| Modify | `web/messages/uz.json` | Update `fSector` label + 7 new sector-manager keys |

---

### Task 1: Prisma schema — add Sector model + migrate

**Files:**
- Modify: `web/prisma/schema.prisma`

- [ ] **Step 1: Add Sector model**

Open `web/prisma/schema.prisma`. After the `Organization` model block, add:

```prisma
model Sector {
  id   String @id @default(cuid())
  name String @unique
}
```

- [ ] **Step 2: Run migration**

```bash
cd web
npx prisma migrate dev --name add-sector-lookup
```

Expected: `✓ Your database is now in sync with your schema.`

- [ ] **Step 3: Verify Prisma client**

```bash
npx prisma generate
```

Expected: `✔ Generated Prisma Client`

- [ ] **Step 4: Commit**

```bash
git add web/prisma/schema.prisma web/prisma/migrations/
git commit -m "feat(db): add Sector lookup table"
```

---

### Task 2: Seed 8 sectors

**Files:**
- Modify: `web/prisma/seed.ts`

- [ ] **Step 1: Add sector upserts to seed**

In `web/prisma/seed.ts`, inside the `main()` function, after the organization upserts, add:

```typescript
const SEED_SECTORS = [
  "Davlat",
  "Moliya va bank",
  "Energetika",
  "Telekommunikatsiya",
  "Sogʻliqni saqlash",
  "Taʼlim",
  "Transport",
  "Sanoat",
];
for (const name of SEED_SECTORS) {
  await prisma.sector.upsert({ where: { name }, update: {}, create: { name } });
}
```

- [ ] **Step 2: Run seed**

```bash
cd web
npx prisma db seed
```

Expected: seed completes without errors. Sectors table now has 8 rows.

- [ ] **Step 3: Commit**

```bash
git add web/prisma/seed.ts
git commit -m "chore(seed): seed 8 initial sectors"
```

---

### Task 3: TypeScript type + data layer

**Files:**
- Modify: `web/src/lib/types/entities.ts`
- Create: `web/src/lib/data/sectors.ts`

- [ ] **Step 1: Add Sector interface to entities.ts**

In `web/src/lib/types/entities.ts`, after the `Organization` interface (around line 31), add:

```typescript
export interface Sector {
  id: string;
  name: string;
}
```

- [ ] **Step 2: Create data/sectors.ts**

Create `web/src/lib/data/sectors.ts`:

```typescript
import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Sector } from "@/lib/types/entities";

export const getSectors = cache(
  async (): Promise<Sector[]> =>
    prisma.sector.findMany({ orderBy: { name: "asc" } }),
);
```

- [ ] **Step 3: Verify typecheck**

```bash
cd web && npm run typecheck 2>&1 | grep -E "sectors|entities"
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/types/entities.ts web/src/lib/data/sectors.ts
git commit -m "feat(types): add Sector interface and getSectors data fetcher"
```

---

### Task 4: Sector Server Actions + tests

**Files:**
- Create: `web/src/lib/actions/sectors.ts`
- Create: `web/src/lib/actions/sectors.test.ts`

- [ ] **Step 1: Write the failing tests first**

Create `web/src/lib/actions/sectors.test.ts`:

```typescript
// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";

const h = vi.hoisted(() => ({
  canManage: true,
  createFails: false,
  deleteFails: false,
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: "u2", role: "head", name: "" })),
}));
vi.mock("@/lib/rbac.server", () => ({ requirePermission: vi.fn(async () => h.canManage) }));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    sector: {
      create: vi.fn(async () => {
        if (h.createFails) throw new Error("unique constraint");
        return { id: "sec_1", name: "Davlat" };
      }),
      delete: vi.fn(async () => {
        if (h.deleteFails) throw new Error("not_found");
        return {};
      }),
    },
  };
  return { prisma };
});

import { createSector, deleteSector } from "./sectors";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any;

beforeEach(() => {
  vi.clearAllMocks();
  h.canManage = true;
  h.createFails = false;
  h.deleteFails = false;
});

describe("sector actions", () => {
  it("creates a sector and revalidates /organizations", async () => {
    const res = await createSector({ name: "Davlat" });
    expect(res).toEqual({ ok: true, id: "sec_1" });
    expect(mockPrisma.sector.create).toHaveBeenCalledWith({ data: { name: "Davlat" } });
    expect(revalidatePath).toHaveBeenCalledWith("/organizations");
  });

  it("rejects a name shorter than 2 chars", async () => {
    await expect(createSector({ name: "A" })).resolves.toEqual({
      ok: false,
      error: "invalid",
    });
  });

  it("returns duplicate error on unique constraint violation", async () => {
    h.createFails = true;
    await expect(createSector({ name: "Davlat" })).resolves.toEqual({
      ok: false,
      error: "duplicate",
    });
  });

  it("forbids a role without org.create permission", async () => {
    h.canManage = false;
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u9", role: "t1", name: "" });
    await expect(createSector({ name: "Davlat" })).resolves.toEqual({
      ok: false,
      error: "forbidden",
    });
  });

  it("deletes a sector and revalidates /organizations", async () => {
    const res = await deleteSector("sec_1");
    expect(res).toEqual({ ok: true });
    expect(mockPrisma.sector.delete).toHaveBeenCalledWith({ where: { id: "sec_1" } });
    expect(revalidatePath).toHaveBeenCalledWith("/organizations");
  });

  it("returns not_found when delete target does not exist", async () => {
    h.deleteFails = true;
    await expect(deleteSector("missing")).resolves.toEqual({
      ok: false,
      error: "not_found",
    });
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
cd web && npm run test -- src/lib/actions/sectors.test.ts
```

Expected: FAIL with `Cannot find module './sectors'`

- [ ] **Step 3: Implement sectors.ts**

Create `web/src/lib/actions/sectors.ts`:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import type { ActionResult, CreateResult } from "./types";

const SectorInput = z.object({
  name: z.string().trim().min(2).max(80),
});

export async function createSector(input: { name: string }): Promise<CreateResult> {
  const parsed = SectorInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "org.create"))) return { ok: false, error: "forbidden" };

  try {
    const sector = await prisma.sector.create({ data: { name: parsed.data.name } });
    revalidatePath("/organizations");
    return { ok: true, id: sector.id };
  } catch {
    return { ok: false, error: "duplicate" };
  }
}

export async function deleteSector(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "invalid" };

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "org.create"))) return { ok: false, error: "forbidden" };

  try {
    await prisma.sector.delete({ where: { id } });
    revalidatePath("/organizations");
    return { ok: true };
  } catch {
    return { ok: false, error: "not_found" };
  }
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
cd web && npm run test -- src/lib/actions/sectors.test.ts
```

Expected: 6/6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/actions/sectors.ts web/src/lib/actions/sectors.test.ts
git commit -m "feat(actions): createSector + deleteSector with org.create permission gate"
```

---

### Task 5: i18n keys

**Files:**
- Modify: `web/messages/uz.json`

- [ ] **Step 1: Update fSector and add 7 new keys**

In `web/messages/uz.json`, inside the `"orgs"` namespace:

Change:
```json
"fSector": "Soha",
```
To:
```json
"fSector": "Tashkilotning faoliyat sohasi",
```

Add these 7 keys anywhere inside the `"orgs"` block (e.g., after `"stirHint"`):
```json
"sectorMgrTitle": "Faoliyat sohalari",
"sectorNew": "Yangi soha",
"sectorAdd": "Qoʻshish",
"sectorEmpty": "Hozircha soha qoʻshilmagan",
"sectorPlaceholder": "Soha nomi",
"sectorDuplicate": "Bu soha allaqachon mavjud",
"sectorDelete": "{name} sohasini oʻchirish"
```

- [ ] **Step 2: Verify JSON**

```bash
cd web && node -e "require('./messages/uz.json'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add web/messages/uz.json
git commit -m "feat(i18n): sector manager keys + rename fSector label"
```

---

### Task 6: SectorManagerModal component

**Files:**
- Create: `web/src/components/organizations/SectorManagerModal.tsx`

- [ ] **Step 1: Create the component**

Create `web/src/components/organizations/SectorManagerModal.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Layers, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { createSector, deleteSector } from "@/lib/actions/sectors";
import type { Sector } from "@/lib/types/entities";

interface SectorManagerModalProps {
  open: boolean;
  onClose: () => void;
  sectors: Sector[];
}

export function SectorManagerModal({ open, onClose, sectors }: SectorManagerModalProps) {
  const t = useTranslations("orgs");
  const toast = useToast();
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [pending, startTransition] = useTransition();

  const canAdd = newName.trim().length >= 2;

  function add() {
    if (!canAdd || pending) return;
    startTransition(async () => {
      const res = await createSector({ name: newName.trim() });
      if (res.ok) {
        setNewName("");
        router.refresh();
      } else if (res.error === "duplicate") {
        toast(t("sectorDuplicate"), "danger");
      } else {
        toast(t("failed"), "danger");
      }
    });
  }

  function remove(id: string) {
    if (pending) return;
    startTransition(async () => {
      const res = await deleteSector(id);
      if (res.ok) {
        router.refresh();
      } else {
        toast(t("failed"), "danger");
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Layers size={16} /> {t("sectorMgrTitle")}
        </span>
      }
      footer={
        <Button size="sm" variant="ghost" onClick={onClose} disabled={pending}>
          {t("cancel")}
        </Button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {sectors.length === 0 ? (
          <p
            className="cell-sub"
            style={{ padding: "12px 0", textAlign: "center", marginBottom: 16 }}
          >
            {t("sectorEmpty")}
          </p>
        ) : (
          <div style={{ marginBottom: 16 }}>
            {sectors.map((s) => (
              <div
                key={s.id}
                className="lrow"
                style={{
                  border: "none",
                  borderBottom: "1px solid var(--border)",
                  borderRadius: 0,
                  padding: "8px 0",
                }}
              >
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>
                  {s.name}
                </span>
                <button
                  type="button"
                  className="iconbtn"
                  aria-label={t("sectorDelete", { name: s.name })}
                  disabled={pending}
                  onClick={() => remove(s.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <Field label={t("sectorNew")} htmlFor="sector-new-name">
          <div style={{ display: "flex", gap: 8 }}>
            <input
              id="sector-new-name"
              className="input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder={t("sectorPlaceholder")}
              disabled={pending}
              autoFocus
            />
            <Button
              size="sm"
              variant="primary"
              icon={<Plus size={14} />}
              onClick={add}
              disabled={pending || !canAdd}
            >
              {t("sectorAdd")}
            </Button>
          </div>
        </Field>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd web && npm run typecheck 2>&1 | grep "SectorManagerModal"
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add web/src/components/organizations/SectorManagerModal.tsx
git commit -m "feat(orgs): SectorManagerModal — add/delete sector lookup entries"
```

---

### Task 7: OrgFormModal — sector Select + "+" button

**Files:**
- Modify: `web/src/components/organizations/OrgFormModal.tsx`

The current `OrgFormModal` has a plain `<input>` for `sector`. Replace it with a `Select` dropdown and a "+" button that opens `SectorManagerModal`.

- [ ] **Step 1: Add imports**

Add to the import block at the top of `web/src/components/organizations/OrgFormModal.tsx`:

```typescript
import { Plus } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { SectorManagerModal } from "./SectorManagerModal";
import type { Sector } from "@/lib/types/entities";
```

The existing imports (`Building2`, `Save`, `Button`, `Field`, `Modal`, `useToast`, `createOrganization`, `updateOrganization`, `Organization`, `OrgDetail`) stay unchanged.

- [ ] **Step 2: Add props**

The `OrgFormModalProps` interface currently:
```typescript
interface OrgFormModalProps {
  open: boolean;
  onClose: () => void;
  organization?: EditableOrganization | null;
}
```

Replace with:
```typescript
interface OrgFormModalProps {
  open: boolean;
  onClose: () => void;
  organization?: EditableOrganization | null;
  sectors: Sector[];
  canManageSectors?: boolean;
}
```

- [ ] **Step 3: Update function signature + add sectorMgrOpen state**

Current function signature:
```typescript
export function OrgFormModal({ open, onClose, organization }: OrgFormModalProps) {
```

Replace with:
```typescript
export function OrgFormModal({
  open,
  onClose,
  organization,
  sectors,
  canManageSectors = false,
}: OrgFormModalProps) {
```

After the existing `const [pending, startTransition] = useTransition();` line, add:
```typescript
  const [sectorMgrOpen, setSectorMgrOpen] = useState(false);
```

- [ ] **Step 4: Replace sector input with Select + "+" button**

The current sector field:
```tsx
<Field label={t("fSector")} htmlFor="org-sector">
  <input
    id="org-sector"
    className="input"
    value={form.sector}
    onChange={(e) => set("sector", e.target.value)}
  />
</Field>
```

Replace with:
```tsx
<Field label={t("fSector")} htmlFor="org-sector">
  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
    <Select
      id="org-sector"
      options={sectors.map((s) => ({ value: s.name, label: s.name }))}
      value={form.sector}
      onChange={(v) => set("sector", v)}
      placeholder="—"
      style={{ flex: 1 }}
    />
    {canManageSectors && (
      <button
        type="button"
        className="iconbtn"
        aria-label={t("sectorMgrTitle")}
        title={t("sectorMgrTitle")}
        onClick={() => setSectorMgrOpen(true)}
      >
        <Plus size={15} />
      </button>
    )}
  </div>
</Field>
```

- [ ] **Step 5: Add SectorManagerModal below the main Modal**

At the very end of the component, just before the final closing `}`, add:

```tsx
      {sectorMgrOpen ? (
        <SectorManagerModal
          open={sectorMgrOpen}
          onClose={() => setSectorMgrOpen(false)}
          sectors={sectors}
        />
      ) : null}
```

The full return should end like:
```tsx
    </Modal>
    {sectorMgrOpen ? (
      <SectorManagerModal
        open={sectorMgrOpen}
        onClose={() => setSectorMgrOpen(false)}
        sectors={sectors}
      />
    ) : null}
  );
}
```

- [ ] **Step 6: Update valid check**

The `valid` check currently requires `form.sector.trim().length >= 2`. Since sector now comes from a Select (always a valid string from the list or empty), keep the check but it will naturally work — the user must pick a value.

No change needed to `valid`.

- [ ] **Step 7: Typecheck**

```bash
cd web && npm run typecheck 2>&1 | grep "OrgFormModal"
```

Expected: zero errors.

- [ ] **Step 8: Commit**

```bash
git add web/src/components/organizations/OrgFormModal.tsx
git commit -m "feat(orgs): sector field → Select dropdown with + button for sector management"
```

---

### Task 8: Wire sectors through page → OrgsScreen

**Files:**
- Modify: `web/src/components/organizations/OrgsScreen.tsx`
- Modify: `web/src/app/(app)/organizations/page.tsx`

- [ ] **Step 1: Update OrgsScreen props**

In `web/src/components/organizations/OrgsScreen.tsx`:

Add `Sector` to imports:
```typescript
import type { Organization, OrgDetail, Sector } from "@/lib/types/entities";
```

Update `OrgsScreenProps` interface — add 2 new props:
```typescript
export interface OrgsScreenProps {
  orgs: Organization[];
  orgDetails: Record<string, OrgDetail>;
  activeAuditCount: number;
  canEdit?: boolean;
  sectors: Sector[];
  canManageSectors?: boolean;
}
```

Update the function signature to destructure the new props:
```typescript
export function OrgsScreen({
  orgs,
  orgDetails,
  activeAuditCount,
  canEdit = true,
  sectors,
  canManageSectors = false,
}: OrgsScreenProps) {
```

Update the `OrgFormModal` usage (inside the JSX, near the bottom):
```tsx
{modalOpen ? (
  <OrgFormModal
    key={editing?.org.id ?? "new"}
    open={modalOpen}
    onClose={() => setModalOpen(false)}
    organization={editing}
    sectors={sectors}
    canManageSectors={canManageSectors}
  />
) : null}
```

- [ ] **Step 2: Update page.tsx**

Replace the entire content of `web/src/app/(app)/organizations/page.tsx`:

```typescript
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getActiveAuditCount, getOrgDetails, getOrgs } from "@/lib/data/orgs";
import { getSectors } from "@/lib/data/sectors";
import { OrgsScreen } from "@/components/organizations/OrgsScreen";
import { requireAnyPermission } from "@/lib/rbac.server";

export default async function OrganizationsPage() {
  const { userId } = await requireSession();
  const [orgs, orgDetails, activeAuditCount, canView, canEdit, sectors] = await Promise.all([
    getOrgs(),
    getOrgDetails(),
    getActiveAuditCount(),
    requireAnyPermission(userId, ["org.view_all", "org.view_own", "org.create", "org.update"]),
    requireAnyPermission(userId, ["org.create", "org.update", "org.delete"]),
    getSectors(),
  ]);
  if (!canView) redirect("/dashboard");
  return (
    <OrgsScreen
      orgs={orgs}
      orgDetails={orgDetails}
      activeAuditCount={activeAuditCount}
      canEdit={canEdit}
      sectors={sectors}
      canManageSectors={canEdit}
    />
  );
}
```

- [ ] **Step 3: Typecheck**

```bash
cd web && npm run typecheck
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add web/src/components/organizations/OrgsScreen.tsx web/src/app/(app)/organizations/page.tsx
git commit -m "feat(orgs): thread sectors prop from page → OrgsScreen → OrgFormModal"
```

---

### Task 9: Full verification

- [ ] **Step 1: Run sector action tests**

```bash
cd web && npm run test -- src/lib/actions/sectors.test.ts
```

Expected: 6/6 pass.

- [ ] **Step 2: Run org component tests**

```bash
npm run test -- src/components/organizations/
```

Expected: 11/11 pass (3 OrgsScreen + 3 OrgDetailScreen + 5 org actions — note: OrgFormModal has no dedicated test file).

- [ ] **Step 3: Full typecheck**

```bash
npm run typecheck
```

Expected: zero errors.

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: `✓ Compiled successfully`, no errors.

- [ ] **Step 5: Manual smoke-check**

1. Open http://localhost:3000/organizations (log in first if needed)
2. Click "Tashkilot qoʻshish"
3. The "Tashkilotning faoliyat sohasi" field should show a `Select` dropdown with 8 options
4. Click the "+" icon next to the sector Select
5. `SectorManagerModal` opens — shows 8 sectors, each with a trash icon
6. Type a new sector name in the add field and press Enter or click "Qoʻshish" — sector appears in list and in the parent Select
7. Click the trash icon on a sector — it disappears from the list
8. Close the sector manager, select a sector from the dropdown, fill other fields, submit — org is created with the selected sector
