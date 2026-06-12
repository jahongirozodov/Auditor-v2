import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { Overview } from "./Overview";
import type { Audit } from "@/lib/types/entities";

vi.mock("@/lib/fixtures", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/fixtures")>();
  return {
    ...actual,
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
  };
});

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
    expect(screen.queryByText("AI xulosa")).not.toBeInTheDocument();
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
    // critical+high+medium+low = 4+9+14+7 = 34 (appears in stat + donut SVG)
    renderOverview();
    expect(screen.getAllByText("34").length).toBeGreaterThanOrEqual(1);
  });

  it("stat card shows team member count", () => {
    renderOverview();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("workflow marks the current stage", () => {
    renderOverview();
    expect(screen.getByText(messages.auditDetail.currentStage)).toBeInTheDocument();
  });

  it("critical findings table renders mocked findings", () => {
    renderOverview();
    expect(screen.getByText("RCE orqali yuklab olish")).toBeInTheDocument();
    expect(screen.getByText("SQLi login")).toBeInTheDocument();
  });
});
