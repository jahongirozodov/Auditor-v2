# Remove Org Fields (address, region, risk, since) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strip `address`, `region`, `risk`, and `since` from the Organization model — DB, types, Zod schema, data layer, fixtures, components, tests, and i18n.

**Architecture:** Top-down deletion: DB schema → TypeScript types → data/actions → fixtures → components → tests → i18n. Each layer's change creates TypeScript errors that serve as the failing-test signal; fix them before moving to the next layer.

**Tech Stack:** Prisma 5, TypeScript strict, Next.js 16 Server Actions, Vitest + Testing Library, next-intl.

---

### Task 1: Prisma schema — drop 4 columns + RiskLevel enum

**Files:**
- Modify: `web/prisma/schema.prisma:73-77` (RiskLevel enum)
- Modify: `web/prisma/schema.prisma:130-134` (Organization model fields)

- [ ] **Step 1: Remove RiskLevel enum from schema**

Replace lines 73–77 in `web/prisma/schema.prisma`:

```prisma
// DELETE the entire enum block:
enum RiskLevel {
  high
  medium
  low
}
```

- [ ] **Step 2: Remove 4 fields from Organization model**

The `Organization` model currently has these lines (around 130–134); delete them:

```prisma
  region  String
  address String
  risk    RiskLevel
  since   String
```

The model after edit:

```prisma
model Organization {
  id      String @id
  name    String
  stir    String
  sector  String
  audits  Int
  contact String

  // OrgDetail folded in
  head    String

  contacts   OrgContact[]
  devices    OrgDevice[]
  auditsList Audit[]      @relation("AuditOrg")
}
```

- [ ] **Step 3: Generate and apply migration**

Run from `web/`:

```bash
npx prisma migrate dev --name remove-org-risk-fields
```

Expected output: `The following migration(s) have been created and applied from new schema changes: migrations/…_remove_org_risk_fields`

Prisma client is regenerated automatically. If it errors on existing data in the SQLite dev DB (column not nullable), reset the dev DB:

```bash
npx prisma migrate reset --force
```

- [ ] **Step 4: Verify Prisma client compiles**

```bash
npx prisma generate
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add web/prisma/schema.prisma web/prisma/migrations/
git commit -m "chore(db): drop region/address/risk/since from Organization"
```

---

### Task 2: TypeScript types — remove RiskLevel + update OrgDetail

**Files:**
- Modify: `web/src/lib/types/entities.ts:21` (RiskLevel type)
- Modify: `web/src/lib/types/entities.ts:49-57` (OrgDetail interface)

- [ ] **Step 1: Run typecheck to capture the baseline error list**

```bash
cd web && npm run typecheck 2>&1 | head -40
```

Expected: errors referencing `RiskLevel`, `region`, `address`, `risk`, `since` in multiple files.

- [ ] **Step 2: Delete RiskLevel type export**

In `web/src/lib/types/entities.ts`, delete line 21:

```typescript
// DELETE this line:
export type RiskLevel = "high" | "medium" | "low";
```

- [ ] **Step 3: Update OrgDetail interface**

Replace the `OrgDetail` interface (lines 49–57):

```typescript
// OLD:
export interface OrgDetail {
  region: string;
  address: string;
  risk: RiskLevel;
  head: string;
  since: string;
  contacts: OrgContact[];
  devices: OrgDevice[];
}

// NEW:
export interface OrgDetail {
  head: string;
  contacts: OrgContact[];
  devices: OrgDevice[];
}
```

- [ ] **Step 4: Run typecheck — expect errors only in downstream consumers (not in entities.ts itself)**

```bash
npm run typecheck 2>&1 | grep "entities.ts"
```

Expected: zero errors in entities.ts.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/types/entities.ts
git commit -m "chore(types): remove RiskLevel and strip OrgDetail to head/contacts/devices"
```

---

### Task 3: Data layer — strip removed fields from DetailRow + toDetail

**Files:**
- Modify: `web/src/lib/data/orgs.ts:4` (import)
- Modify: `web/src/lib/data/orgs.ts:24-32` (DetailRow type)
- Modify: `web/src/lib/data/orgs.ts:34-54` (toDetail function)

- [ ] **Step 1: Update import — remove RiskLevel**

Change line 4:

```typescript
// OLD:
import type { Organization, OrgDetail, RiskLevel } from "@/lib/types/entities";

// NEW:
import type { Organization, OrgDetail } from "@/lib/types/entities";
```

- [ ] **Step 2: Update DetailRow type**

Replace the `DetailRow` type (lines 24–32):

```typescript
// OLD:
type DetailRow = {
  region: string;
  address: string;
  risk: string;
  head: string;
  since: string;
  contacts: { name: string; role: string; email: string; phone: string }[];
  devices: { name: string; kind: string; vendor: string; ip: string; crit: string }[];
};

// NEW:
type DetailRow = {
  head: string;
  contacts: { name: string; role: string; email: string; phone: string }[];
  devices: { name: string; kind: string; vendor: string; ip: string; crit: string }[];
};
```

- [ ] **Step 3: Update toDetail function**

Replace `toDetail` (lines 34–55):

```typescript
// OLD:
function toDetail(o: DetailRow): OrgDetail {
  return {
    region: o.region,
    address: o.address,
    risk: o.risk as RiskLevel,
    head: o.head,
    since: o.since,
    contacts: o.contacts.map((c) => ({
      name: c.name,
      role: c.role,
      email: c.email,
      phone: c.phone,
    })),
    devices: o.devices.map((d) => ({
      name: d.name,
      kind: d.kind,
      vendor: d.vendor,
      ip: d.ip,
      crit: d.crit,
    })),
  };
}

// NEW:
function toDetail(o: DetailRow): OrgDetail {
  return {
    head: o.head,
    contacts: o.contacts.map((c) => ({
      name: c.name,
      role: c.role,
      email: c.email,
      phone: c.phone,
    })),
    devices: o.devices.map((d) => ({
      name: d.name,
      kind: d.kind,
      vendor: d.vendor,
      ip: d.ip,
      crit: d.crit,
    })),
  };
}
```

- [ ] **Step 4: Verify no errors in data layer**

```bash
npm run typecheck 2>&1 | grep "data/orgs"
```

Expected: zero errors in `data/orgs.ts`.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/data/orgs.ts
git commit -m "chore(data): remove region/address/risk/since from org data layer"
```

---

### Task 4: Zod schema + actions — remove 4 fields

**Files:**
- Modify: `web/src/lib/actions/orgs.ts:12-25` (OrganizationInput schema)

- [ ] **Step 1: Update OrganizationInput Zod schema**

Replace lines 12–25 in `web/src/lib/actions/orgs.ts`:

```typescript
// OLD:
const OrganizationInput = z.object({
  name: z.string().trim().min(3).max(160),
  stir: z
    .string()
    .trim()
    .regex(/^\d{9}$/),
  sector: z.string().trim().min(2).max(80),
  contact: z.string().trim().min(2).max(120),
  region: z.string().trim().min(2).max(80),
  address: z.string().trim().min(2).max(200),
  risk: z.enum(["high", "medium", "low"]),
  head: z.string().trim().min(2).max(120),
  since: z.string().trim().min(2).max(40),
});

// NEW:
const OrganizationInput = z.object({
  name: z.string().trim().min(3).max(160),
  stir: z
    .string()
    .trim()
    .regex(/^\d{9}$/),
  sector: z.string().trim().min(2).max(80),
  contact: z.string().trim().min(2).max(120),
  head: z.string().trim().min(2).max(120),
});
```

- [ ] **Step 2: Verify actions compile**

```bash
npm run typecheck 2>&1 | grep "actions/orgs"
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/actions/orgs.ts
git commit -m "chore(actions): remove region/address/risk/since from OrganizationInput schema"
```

---

### Task 5: Actions test — update validInput

**Files:**
- Modify: `web/src/lib/actions/orgs.test.ts:37-47` (validInput)

- [ ] **Step 1: Update validInput**

Replace lines 37–47 in `web/src/lib/actions/orgs.test.ts`:

```typescript
// OLD:
const validInput = {
  name: "Yangi tashkilot",
  stir: "123456789",
  sector: "Davlat",
  contact: "info@gov.uz",
  region: "Toshkent",
  address: "Mustaqillik shoh kochasi",
  risk: "medium" as const,
  head: "Ali Valiyev",
  since: "2026",
};

// NEW:
const validInput = {
  name: "Yangi tashkilot",
  stir: "123456789",
  sector: "Davlat",
  contact: "info@gov.uz",
  head: "Ali Valiyev",
};
```

- [ ] **Step 2: Run actions tests**

```bash
npm run test -- src/lib/actions/orgs.test.ts
```

Expected: all 5 tests pass.

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/actions/orgs.test.ts
git commit -m "test(actions): remove deleted fields from org action validInput"
```

---

### Task 6: Fixtures — remove ORG_RISK + strip fields from ORG_DETAIL

**Files:**
- Modify: `web/src/lib/fixtures/index.ts:21` (import)
- Modify: `web/src/lib/fixtures/index.ts:57-107` (ORG_DETAIL + ORG_RISK)

- [ ] **Step 1: Remove RiskLevel from import**

Change line 21 in `web/src/lib/fixtures/index.ts`:

```typescript
// OLD — remove RiskLevel from the import list:
import type {
  AiMessage,
  Audit,
  AuditToken,
  Finding,
  KpiRule,
  KpiUser,
  LogEntry,
  Organization,
  OrgDetail,
  ProjectApproval,
  Report,
  RiskLevel,
  Task,
  TaskStatus,
  Topology,
  User,
  WorkflowStep,
} from "../types/entities";

// NEW:
import type {
  AiMessage,
  Audit,
  AuditToken,
  Finding,
  KpiRule,
  KpiUser,
  LogEntry,
  Organization,
  OrgDetail,
  ProjectApproval,
  Report,
  Task,
  TaskStatus,
  Topology,
  User,
  WorkflowStep,
} from "../types/entities";
```

- [ ] **Step 2: Strip removed fields from each ORG_DETAIL entry**

Replace the entire `ORG_DETAIL` block (lines 57–101) and the `ORG_RISK` constant (lines 103–107):

```typescript
export const ORG_DETAIL: Record<string, OrgDetail> = {
  o1: {
    head: "Akmal Yoʻldoshev",
    contacts: [
      { name: "Rustam Qodirov", role: "CISO", email: "r.qodirov@aloqa.gov.uz", phone: "+998 71 207 10 01" },
      { name: "Gulnoza Ismoilova", role: "IT boʻlim boshligʻi", email: "g.ismoilova@aloqa.gov.uz", phone: "+998 71 207 10 14" },
    ],
    devices: [
      { name: "FW-CORE-01", kind: "Firewall", vendor: "Cisco ASA 5555-X", ip: "10.0.0.1", crit: "Kritik" },
      { name: "SW-CORE-02", kind: "Switch", vendor: "Cisco Catalyst 9300", ip: "10.0.0.2", crit: "Yuqori" },
      { name: "DC-01.gov.uz", kind: "Server", vendor: "Windows Server 2019", ip: "10.10.1.10", crit: "Kritik" },
      { name: "web-prod-03", kind: "Server", vendor: "Ubuntu 22.04 / Apache", ip: "10.20.3.3", crit: "Yuqori" },
      { name: "IPS-EDGE-01", kind: "IDS/IPS", vendor: "Suricata", ip: "10.0.0.5", crit: "Yuqori" },
      { name: "VPN-GW-01", kind: "VPN gateway", vendor: "FortiGate 100F", ip: "10.0.0.9", crit: "Oʻrta" },
    ],
  },
  o2: {
    head: "Dilshoda Rasulova",
    contacts: [{ name: "Sardor Aliyev", role: "CISO", email: "ciso@soliq.uz", phone: "+998 71 202 00 12" }],
    devices: [
      { name: "DB-PRD-01", kind: "Server", vendor: "PostgreSQL 16 / RHEL 9", ip: "10.30.1.4", crit: "Kritik" },
      { name: "APP-PRD-02", kind: "Server", vendor: "Windows Server 2022", ip: "10.30.1.6", crit: "Yuqori" },
    ],
  },
  o3: {
    head: "Bobur Mirzayev",
    contacts: [{ name: "Nodira Yusupova", role: "Axborot xavfsizligi", email: "ciso@cbu.uz", phone: "+998 71 212 60 00" }],
    devices: [{ name: "MOB-API-01", kind: "Server", vendor: "Kubernetes / Linux", ip: "10.40.2.2", crit: "Kritik" }],
  },
  o4: {
    head: "Sevara Karimova",
    contacts: [{ name: "Jamshid Toirov", role: "IT direktor", email: "info@dxa.uz", phone: "+998 71 207 30 11" }],
    devices: [{ name: "PREPROD-01", kind: "Server", vendor: "Ubuntu 22.04", ip: "10.50.1.1", crit: "Oʻrta" }],
  },
  o5: {
    head: "Lola Aliyeva",
    contacts: [{ name: "Akbar Saidov", role: "OT xavfsizligi", email: "sec@energy.uz", phone: "+998 71 207 40 22" }],
    devices: [{ name: "SCADA-HMI-01", kind: "OT/SCADA", vendor: "Siemens WinCC", ip: "172.16.5.10", crit: "Kritik" }],
  },
  o6: {
    head: "Otabek Joʻrayev",
    contacts: [{ name: "Dilnoza Rahimova", role: "Web admin", email: "it@tashkent.uz", phone: "+998 71 207 50 33" }],
    devices: [{ name: "WEB-PORTAL-01", kind: "Server", vendor: "Nginx / Debian 12", ip: "10.60.1.1", crit: "Oʻrta" }],
  },
};
```

Delete the `ORG_RISK` constant entirely (lines 103–107):

```typescript
// DELETE this entire block:
export const ORG_RISK: Record<RiskLevel, { label: string; tag: string }> = {
  high: { label: "Yuqori xavf", tag: "tag--danger" },
  medium: { label: "Oʻrta xavf", tag: "tag--warning" },
  low: { label: "Past xavf", tag: "tag--success" },
};
```

- [ ] **Step 3: Verify fixtures compile**

```bash
npm run typecheck 2>&1 | grep "fixtures"
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/fixtures/index.ts
git commit -m "chore(fixtures): remove ORG_RISK and strip region/address/risk/since from ORG_DETAIL"
```

---

### Task 7: OrgsScreen — remove columns, stat, imports

**Files:**
- Modify: `web/src/components/organizations/OrgsScreen.tsx`

- [ ] **Step 1: Update imports**

Replace the import block at the top of `OrgsScreen.tsx`:

```typescript
// OLD:
import {
  Building2,
  ChevronRight,
  Edit3,
  FolderKanban,
  Plus,
  Server,
  ShieldAlert,
} from "lucide-react";
// ...
import { ORG_RISK } from "@/lib/fixtures";
import type { Organization, OrgDetail, RiskLevel } from "@/lib/types/entities";
import type { TagTone } from "@/components/ui/Tag";

const RISK_TONE: Record<RiskLevel, TagTone> = {
  high: "danger",
  medium: "warning",
  low: "success",
};

// NEW (remove ShieldAlert, ORG_RISK, RiskLevel, TagTone, RISK_TONE):
import {
  Building2,
  ChevronRight,
  Edit3,
  FolderKanban,
  Plus,
  Server,
} from "lucide-react";
// ...
import type { Organization, OrgDetail } from "@/lib/types/entities";
```

- [ ] **Step 2: Remove highRisk variable and stat**

Remove line 55:

```typescript
// DELETE:
const highRisk = orgs.filter((o) => orgDetails[o.id]?.risk === "high").length;
```

Remove the `statHighRisk` Stat and change the grid from 4 to 3 columns:

```tsx
// OLD:
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 14,
    marginBottom: 16,
  }}
>
  <Stat icon={<Building2 size={15} />} label={t("statOrgs")} value={orgs.length} />
  <Stat icon={<FolderKanban size={15} />} label={t("statAudits")} value={activeAuditCount} />
  <Stat icon={<ShieldAlert size={15} />} label={t("statHighRisk")} value={highRisk} />
  <Stat icon={<Server size={15} />} label={t("statDevices")} value={devices} />
</div>

// NEW:
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14,
    marginBottom: 16,
  }}
>
  <Stat icon={<Building2 size={15} />} label={t("statOrgs")} value={orgs.length} />
  <Stat icon={<FolderKanban size={15} />} label={t("statAudits")} value={activeAuditCount} />
  <Stat icon={<Server size={15} />} label={t("statDevices")} value={devices} />
</div>
```

- [ ] **Step 3: Remove table columns**

Remove the two column headers:

```tsx
// DELETE these two <th> elements:
<th>{t("thRegion")}</th>
<th>{t("thRisk")}</th>
```

Remove the `risk` variable and two `<td>` cells inside the row map:

```tsx
// DELETE inside the row map:
const risk = det?.risk ?? "low";

// DELETE these two <td> elements:
<td className="cell-sub">{det?.region}</td>
<td>
  <Tag tone={RISK_TONE[risk]}>{ORG_RISK[risk].label}</Tag>
</td>
```

- [ ] **Step 4: Verify no errors**

```bash
npm run typecheck 2>&1 | grep "OrgsScreen"
```

Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add web/src/components/organizations/OrgsScreen.tsx
git commit -m "feat(orgs): remove region/risk columns and high-risk stat from orgs table"
```

---

### Task 8: OrgFormModal — remove 4 fields from form

**Files:**
- Modify: `web/src/components/organizations/OrgFormModal.tsx`

- [ ] **Step 1: Update imports — remove RiskLevel and Select**

```typescript
// OLD:
import { Select } from "@/components/ui/Select";
// ...
import type { Organization, OrgDetail, RiskLevel } from "@/lib/types/entities";

// NEW (drop Select and RiskLevel):
import type { Organization, OrgDetail } from "@/lib/types/entities";
```

- [ ] **Step 2: Update EMPTY constant**

```typescript
// OLD:
const EMPTY = {
  name: "",
  stir: "",
  sector: "",
  contact: "",
  region: "",
  address: "",
  risk: "medium" as RiskLevel,
  head: "",
  since: "",
};

// NEW:
const EMPTY = {
  name: "",
  stir: "",
  sector: "",
  contact: "",
  head: "",
};
```

- [ ] **Step 3: Update toFormValue**

```typescript
// OLD:
function toFormValue(value?: EditableOrganization | null): OrgFormValue {
  if (!value) return EMPTY;
  return {
    name: value.org.name,
    stir: value.org.stir,
    sector: value.org.sector,
    contact: value.org.contact,
    region: value.detail.region,
    address: value.detail.address,
    risk: value.detail.risk,
    head: value.detail.head,
    since: value.detail.since,
  };
}

// NEW:
function toFormValue(value?: EditableOrganization | null): OrgFormValue {
  if (!value) return EMPTY;
  return {
    name: value.org.name,
    stir: value.org.stir,
    sector: value.org.sector,
    contact: value.org.contact,
    head: value.detail.head,
  };
}
```

- [ ] **Step 4: Update valid check**

```typescript
// OLD:
const valid =
  form.name.trim().length >= 3 &&
  /^\d{9}$/.test(form.stir.trim()) &&
  form.sector.trim().length >= 2 &&
  form.contact.trim().length >= 2 &&
  form.region.trim().length >= 2 &&
  form.address.trim().length >= 2 &&
  form.head.trim().length >= 2 &&
  form.since.trim().length >= 2;

// NEW:
const valid =
  form.name.trim().length >= 3 &&
  /^\d{9}$/.test(form.stir.trim()) &&
  form.sector.trim().length >= 2 &&
  form.contact.trim().length >= 2 &&
  form.head.trim().length >= 2;
```

- [ ] **Step 5: Replace the form JSX grid**

Replace the entire grid `<div>` inside `<Modal>` (lines 121–215):

```tsx
<div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
  <div style={{ gridColumn: "span 2" }}>
    <Field label={t("fName")} htmlFor="org-name">
      <input
        id="org-name"
        className="input"
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        autoFocus
      />
    </Field>
  </div>

  <Field label={t("fStir")} htmlFor="org-stir" hint={t("stirHint")}>
    <input
      id="org-stir"
      className="input font-mono"
      inputMode="numeric"
      maxLength={9}
      value={form.stir}
      onChange={(e) => set("stir", e.target.value.replace(/\D/g, "").slice(0, 9))}
    />
  </Field>

  <Field label={t("fSector")} htmlFor="org-sector">
    <input
      id="org-sector"
      className="input"
      value={form.sector}
      onChange={(e) => set("sector", e.target.value)}
    />
  </Field>

  <Field label={t("fContact")} htmlFor="org-contact">
    <input
      id="org-contact"
      className="input"
      value={form.contact}
      onChange={(e) => set("contact", e.target.value)}
    />
  </Field>

  <Field label={t("fHead")} htmlFor="org-head">
    <input
      id="org-head"
      className="input"
      value={form.head}
      onChange={(e) => set("head", e.target.value)}
    />
  </Field>
</div>
```

- [ ] **Step 6: Verify no errors**

```bash
npm run typecheck 2>&1 | grep "OrgFormModal"
```

Expected: zero errors.

- [ ] **Step 7: Commit**

```bash
git add web/src/components/organizations/OrgFormModal.tsx
git commit -m "feat(orgs): remove address/region/risk/since fields from org create/edit modal"
```

---

### Task 9: OrgDetailScreen — remove risk tag, fix info rows + subtitle

**Files:**
- Modify: `web/src/components/organizations/OrgDetailScreen.tsx`

- [ ] **Step 1: Update imports — remove RiskLevel, ORG_RISK, RISK_TONE**

```typescript
// OLD:
import { ORG_RISK } from "@/lib/fixtures";
import type { TagTone } from "@/components/ui/Tag";
import type { Audit, Organization, OrgDetail, RiskLevel } from "@/lib/types/entities";

const RISK_TONE: Record<RiskLevel, TagTone> = { high: "danger", medium: "warning", low: "success" };

// NEW (delete those 3 import lines and RISK_TONE constant):
import type { Audit, Organization, OrgDetail } from "@/lib/types/entities";
```

Note: `Tag` import stays — it's used for audit type tags and the contacts/devices panel count badges.

- [ ] **Step 2: Update info array**

Replace lines 70–77:

```typescript
// OLD:
const info: [string, string][] = [
  [t("fSector"), org.sector],
  [t("fRegion"), det.region],
  [t("fAddress"), det.address],
  [t("fHead"), det.head],
  [t("fContact"), org.contact],
  [t("fSince"), det.since],
];

// NEW:
const info: [string, string][] = [
  [t("fSector"), org.sector],
  [t("fHead"), det.head],
  [t("fContact"), org.contact],
];
```

- [ ] **Step 3: Fix subtitle**

Change line 88:

```tsx
// OLD:
sub={`${org.sector} · ${det.region}`}

// NEW:
sub={org.sector}
```

- [ ] **Step 4: Remove risk tag from panel header**

Find the info panel header (around line 131–137):

```tsx
// OLD:
<div className="panel__h">
  <div className="panel__t">
    <Building2 size={15} />
    <span>{t("infoTitle")}</span>
  </div>
  <Tag tone={RISK_TONE[det.risk]}>{ORG_RISK[det.risk].label}</Tag>
</div>

// NEW:
<div className="panel__h">
  <div className="panel__t">
    <Building2 size={15} />
    <span>{t("infoTitle")}</span>
  </div>
</div>
```

- [ ] **Step 5: Verify no errors**

```bash
npm run typecheck 2>&1 | grep "OrgDetailScreen"
```

Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add web/src/components/organizations/OrgDetailScreen.tsx
git commit -m "feat(orgs): remove risk tag and address/region/since from org detail screen"
```

---

### Task 10: OrgsScreen test — remove risk tag test

**Files:**
- Modify: `web/src/components/organizations/OrgsScreen.test.tsx:35-38`

- [ ] **Step 1: Delete the risk tag test case**

Remove lines 35–38 from `web/src/components/organizations/OrgsScreen.test.tsx`:

```typescript
// DELETE this entire it() block:
it("renders a risk tag per org", () => {
  renderScreen();
  expect(screen.getAllByText("Yuqori xavf").length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run OrgsScreen tests**

```bash
npm run test -- src/components/organizations/OrgsScreen.test.tsx
```

Expected: 3 tests pass (title+link, create dialog, edit dialog).

- [ ] **Step 3: Run OrgDetailScreen tests**

```bash
npm run test -- src/components/organizations/OrgDetailScreen.test.tsx
```

Expected: all 3 tests pass (renders info/devices/contacts, not-found, audit links).

- [ ] **Step 4: Commit**

```bash
git add web/src/components/organizations/OrgsScreen.test.tsx
git commit -m "test(orgs): remove risk tag assertion from OrgsScreen test"
```

---

### Task 11: i18n — remove 10 dead keys from uz.json

**Files:**
- Modify: `web/messages/uz.json` (orgs namespace, lines ~892–942)

- [ ] **Step 1: Delete the 10 removed-field keys**

In the `"orgs"` namespace of `web/messages/uz.json`, delete these key-value pairs:

```json
"statHighRisk": "Yuqori xavfli",
"thRegion": "Hudud",
"thRisk": "Xavf darajasi",
"fRegion": "Hudud",
"fAddress": "Manzil",
"fSince": "Hamkorlikdan beri",
"fRisk": "Xavf darajasi",
"riskHigh": "Yuqori xavf",
"riskMedium": "Oʻrta xavf",
"riskLow": "Past xavf"
```

- [ ] **Step 2: Verify JSON is valid**

```bash
node -e "require('./messages/uz.json'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Run full typecheck to confirm zero errors**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add web/messages/uz.json
git commit -m "chore(i18n): remove risk/address/region/since translation keys from orgs namespace"
```

---

### Task 12: Full verification

**Files:** none (read-only verification)

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected: `✓ Compiled successfully`

- [ ] **Step 2: Lint**

```bash
npm run lint
```

Expected: no warnings or errors.

- [ ] **Step 3: All tests**

```bash
npm run test
```

Expected: all suites pass. Confirm no skipped/broken tests referencing the removed fields.

- [ ] **Step 4: Typecheck final pass**

```bash
npm run typecheck
```

Expected: zero errors.

- [ ] **Step 5: Smoke-check grep — no stray references**

```bash
grep -r "ORG_RISK\|RiskLevel\|\.risk\b\|fRegion\|fAddress\|fSince\|fRisk\|statHighRisk\|thRegion\|thRisk" src/ messages/ --include="*.ts" --include="*.tsx" --include="*.json"
```

Expected: zero matches (the analysis module's `a.risk` / `g.risk` / `p.risk` strings are plain inline properties unrelated to `RiskLevel` — those are fine if they appear).
