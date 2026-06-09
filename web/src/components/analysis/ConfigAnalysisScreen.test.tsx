import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { ConfigAnalysisScreen } from "./ConfigAnalysisScreen";
import { AUDITS, TASKS } from "@/lib/fixtures";
import type { ConfigUploadView } from "@/lib/types/entities";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

const { uploadConfig, createConfigDrafts } = vi.hoisted(() => ({
  uploadConfig: vi.fn(),
  createConfigDrafts: vi.fn(),
}));
vi.mock("@/lib/actions/config", () => ({ uploadConfig, createConfigDrafts }));

const ASA = `! ASA 9.16(4)
hostname FW-CORE-01
 no security-level
telnet 0.0.0.0 0.0.0.0 inside`;

const latest: ConfigUploadView = {
  id: "cu-1",
  filename: "fw-core-01.cfg",
  vendor: "cisco_asa",
  content: ASA,
  auditId: AUDITS[0].id,
  taskId: TASKS[0].id,
  createdAt: "2026-06-09T00:00:00.000Z",
};

const devices = [
  {
    id: "d1",
    uploadId: "cu-1",
    hostname: "FW-CORE-01",
    vendor: "cisco_asa",
    model: "Cisco ASA",
    firmware: "9.16(4)",
    findings: { critical: 2, high: 1, medium: 0 },
  },
];

function renderScreen(withLatest = true) {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <ConfigAnalysisScreen
        audits={AUDITS}
        tasks={TASKS}
        devices={withLatest ? devices : []}
        latest={withLatest ? latest : null}
      />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  uploadConfig.mockResolvedValue({ ok: true, uploadId: "cu-1", vendor: "cisco_asa", gapCount: 2 });
  createConfigDrafts.mockResolvedValue({ ok: true, ids: ["F-2026-0001"] });
});

describe("ConfigAnalysisScreen", () => {
  it("renders the header, the three analysis tabs and the upload control", () => {
    const { container } = renderScreen(false);
    expect(screen.getByRole("heading", { name: "Konfiguratsiya tahlili" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(screen.getByText("Tahlil qilingan qurilmalar")).toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).not.toBeNull();
  });

  it("shows the empty preview when nothing is uploaded yet", () => {
    renderScreen(false);
    expect(
      screen.getByText("Tahlil natijasini koʻrish uchun konfiguratsiya yuklang."),
    ).toBeInTheDocument();
  });

  it("renders the parsed device, code preview and AI gap list for the latest upload", () => {
    const { container } = renderScreen(true);
    expect(screen.getByText("FW-CORE-01")).toBeInTheDocument();
    expect(container.querySelector("pre.code-block")).not.toBeNull();
    expect(container.querySelector(".code-block .hl")).not.toBeNull(); // a highlighted gap line
    expect(screen.getByText("AI tahlil natijasi")).toBeInTheDocument();
  });

  it("navigates when another tab is clicked", async () => {
    renderScreen(true);
    await userEvent.click(screen.getByRole("tab", { name: /Trafik tahlili/ }));
    expect(push).toHaveBeenCalledWith("/analysis/traffic");
  });

  it("creates drafts from the detected gaps", async () => {
    renderScreen(true);
    await userEvent.click(screen.getByRole("button", { name: /finding yaratish/ }));
    expect(createConfigDrafts).toHaveBeenCalledWith({ uploadId: "cu-1" });
  });
});
