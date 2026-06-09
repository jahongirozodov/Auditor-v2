"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Activity,
  AlertTriangle,
  Bug,
  Code,
  Copy,
  Download,
  Globe,
  History,
  Lock,
  Network,
  Plus,
  RefreshCw,
  Server,
  Shield,
  Sparkles,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Sev } from "@/components/ui/Sev";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import {
  analyzeConfig,
  VENDOR_LABELS,
  type ConfigGap,
  type VendorKey,
} from "@/lib/analysis/config";
import { uploadConfig, createConfigDrafts } from "@/lib/actions/config";
import type { Audit, Task, AnalyzedDeviceView, ConfigUploadView } from "@/lib/types/entities";

const VENDOR_ICON: Record<string, LucideIcon> = {
  cisco_asa: Shield,
  cisco_ios: Network,
  mikrotik: Network,
  juniper: Network,
  fortinet: Lock,
  linux_sshd: Server,
  linux_sudoers: Server,
  nginx: Globe,
  apache: Globe,
  pfsense: Shield,
  unknown: Server,
};

interface ActiveResult {
  uploadId: string;
  filename: string;
  content: string;
  vendor: string;
  gaps: ConfigGap[];
}

function fromUpload(u: ConfigUploadView): ActiveResult {
  return {
    uploadId: u.id,
    filename: u.filename,
    content: u.content,
    vendor: u.vendor,
    gaps: analyzeConfig(u.filename, u.content).gaps,
  };
}

export interface ConfigAnalysisScreenProps {
  audits: Audit[];
  tasks: Task[];
  devices: AnalyzedDeviceView[];
  latest: ConfigUploadView | null;
}

export function ConfigAnalysisScreen({
  audits,
  tasks,
  devices,
  latest,
}: ConfigAnalysisScreenProps) {
  const t = useTranslations("config");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const [active, setActive] = useState<ActiveResult | null>(latest ? fromUpload(latest) : null);
  const [ai, setAi] = useState<{ text: string; degraded: boolean } | null>(null);
  const [aiPending, setAiPending] = useState(false);

  // Upload target picker (audit + task), mirroring CreateFindingModal.
  const [pendingFile, setPendingFile] = useState<{ name: string; text: string } | null>(null);
  const [auditId, setAuditId] = useState(audits[0]?.id ?? "");
  const [taskId, setTaskId] = useState("");
  const auditTasks = tasks.filter((tk) => tk.auditId === auditId);

  const tabs = [
    { id: "scanner", label: tNav("scanner"), icon: <Bug size={14} /> },
    { id: "config", label: tNav("config"), icon: <Server size={14} /> },
    { id: "traffic", label: tNav("traffic"), icon: <Activity size={14} /> },
  ];

  function pickFile() {
    fileRef.current?.click();
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    const text = await file.text();
    const firstAudit = audits[0]?.id ?? "";
    setAuditId(firstAudit);
    setTaskId(tasks.find((tk) => tk.auditId === firstAudit)?.id ?? "");
    setPendingFile({ name: file.name, text });
  }

  function changeAudit(id: string) {
    setAuditId(id);
    setTaskId(tasks.find((tk) => tk.auditId === id)?.id ?? "");
  }

  function confirmUpload() {
    if (!pendingFile || !auditId || !taskId) return;
    const { name, text } = pendingFile;
    startTransition(async () => {
      const res = await uploadConfig({ filename: name, content: text, auditId, taskId });
      if (res.ok && res.uploadId) {
        setActive({
          uploadId: res.uploadId,
          filename: name,
          content: text,
          vendor: res.vendor ?? "unknown",
          gaps: analyzeConfig(name, text).gaps,
        });
        setAi(null);
        setPendingFile(null);
        toast(t("uploaded"), "success");
        router.refresh();
      } else {
        toast(t("failed"), "danger");
      }
    });
  }

  function createDrafts() {
    if (!active) return;
    startTransition(async () => {
      const res = await createConfigDrafts({ uploadId: active.uploadId });
      if (res.ok) {
        toast(t("draftsCreated", { n: res.ids?.length ?? 0 }), "success");
        router.refresh();
      } else {
        toast(t("failed"), "danger");
      }
    });
  }

  async function reanalyze() {
    if (!active) return;
    setAiPending(true);
    try {
      const prompt = [
        `Qurilma: ${VENDOR_LABELS[active.vendor as VendorKey] ?? active.vendor} (${active.filename}).`,
        `Aniqlangan kamchiliklar (${active.gaps.length}):`,
        ...active.gaps.map((g, i) => `${i + 1}. [${g.severity}] ${g.title} — ${g.description}`),
      ].join("\n");
      const resp = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "config", uploadId: active.uploadId, prompt }),
      });
      const data = (await resp.json()) as { ok?: boolean; text?: string };
      setAi(data.ok ? { text: data.text ?? "", degraded: false } : { text: "", degraded: true });
    } catch {
      setAi({ text: "", degraded: true });
    } finally {
      setAiPending(false);
    }
  }

  function copyConfig() {
    if (!active) return;
    navigator.clipboard?.writeText(active.content).catch(() => {});
    toast(t("copied"), "success");
  }

  function downloadConfig() {
    if (!active) return;
    const url = URL.createObjectURL(new Blob([active.content], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = active.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const lines = active ? active.content.split(/\r?\n/) : [];
  const hlLines = new Set(active ? active.gaps.map((g) => g.line).filter((n) => n > 0) : []);

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[{ label: tNav("dashboard"), href: "/dashboard" }, { label: t("crumb") }]}
        title={t("title")}
        sub={t("sub")}
        actions={
          <>
            <Button size="sm" variant="ghost" icon={<History size={14} />} disabled>
              {t("history")}
            </Button>
            <Button size="sm" variant="primary" icon={<Upload size={14} />} onClick={pickFile}>
              {t("fileUpload")}
            </Button>
          </>
        }
      />

      <Tabs tabs={tabs} active="config" onChange={(id) => router.push(`/analysis/${id}`)} />

      <input
        ref={fileRef}
        type="file"
        accept=".cfg,.conf,.txt,.rsc,.config,.xml,.ios"
        onChange={onFile}
        style={{ display: "none" }}
        aria-hidden="true"
      />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 }}
      >
        {/* LEFT — upload + analyzed devices */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            className="card"
            style={{
              padding: 20,
              textAlign: "center",
              border: "1.5px dashed var(--border-strong)",
              background: "var(--bg-surface-2)",
            }}
          >
            <Server size={32} style={{ margin: "0 auto 12px", color: "var(--brand)" }} />
            <h3 style={{ fontSize: 17 }}>{t("uploadTitle")}</h3>
            <p className="text-sm text-muted" style={{ margin: "6px 0 14px" }}>
              {t("uploadHint")}
            </p>
            <Button size="sm" variant="primary" icon={<Upload size={14} />} onClick={pickFile}>
              {t("uploadBtn")}
            </Button>
          </div>

          <Panel title={t("devicesTitle")} icon={<Server size={15} />} flush>
            {devices.length === 0 ? (
              <p className="text-sm text-muted" style={{ padding: "14px 16px" }}>
                {t("devicesEmpty")}
              </p>
            ) : (
              devices.map((d, i) => {
                const Icon = VENDOR_ICON[d.vendor] ?? Server;
                return (
                  <div
                    key={d.id}
                    style={{
                      padding: "12px 16px",
                      borderBottom:
                        i < devices.length - 1 ? "1px solid var(--border-color)" : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div className="stat__icon">
                      <Icon size={14} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="font-mono"
                        style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}
                      >
                        {d.hostname}
                      </div>
                      <div className="cell-sub">
                        {[VENDOR_LABELS[d.vendor as VendorKey] ?? d.vendor, d.model, d.firmware]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {d.findings.critical ? (
                        <span className="sev sev--critical">{d.findings.critical}</span>
                      ) : null}
                      {d.findings.high ? (
                        <span className="sev sev--high">{d.findings.high}</span>
                      ) : null}
                      {d.findings.medium ? (
                        <span className="sev sev--medium">{d.findings.medium}</span>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </Panel>
        </div>

        {/* RIGHT — config preview + AI analysis */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Panel
            title={
              active
                ? t("previewTitle", { filename: active.filename })
                : t("previewTitle", { filename: "—" })
            }
            icon={<Code size={15} />}
            flush
            actions={
              active ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <Button size="xs" variant="ghost" icon={<Copy size={12} />} onClick={copyConfig}>
                    {t("copy")}
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    icon={<Download size={12} />}
                    onClick={downloadConfig}
                  >
                    {t("download")}
                  </Button>
                </div>
              ) : undefined
            }
            footer={
              active ? (
                <>
                  <span>{t("gapsDetected", { n: active.gaps.length })}</span>
                  <Button
                    size="xs"
                    variant="soft"
                    icon={<AlertTriangle size={12} />}
                    onClick={() => router.push("/findings")}
                  >
                    {t("viewFindings")}
                  </Button>
                </>
              ) : undefined
            }
          >
            {active ? (
              <pre
                className="code-block"
                style={{
                  borderRadius: 0,
                  border: "none",
                  padding: 16,
                  maxHeight: 420,
                  overflow: "auto",
                }}
              >
                {lines.map((ln, i) => (
                  <div key={i} className={hlLines.has(i + 1) ? "hl" : undefined}>
                    <span className="ln">{String(i + 1).padStart(2, "0")}</span>
                    {ln}
                  </div>
                ))}
              </pre>
            ) : (
              <p className="text-sm text-muted" style={{ padding: 16 }}>
                {t("previewEmpty")}
              </p>
            )}
          </Panel>

          {active ? (
            <div className="ai-card">
              <div className="ai-card__inner">
                <div className="ai-card__head">
                  <div className="ai-card__icon">
                    <Sparkles size={14} />
                  </div>
                  <span className="ai-card__title">{t("aiTitle")}</span>
                </div>

                {ai?.degraded ? (
                  <p className="ai-card__body" style={{ color: "var(--status-danger-fg)" }}>
                    {t("aiUnreachable")}
                  </p>
                ) : ai?.text ? (
                  <p className="ai-card__body" style={{ whiteSpace: "pre-wrap" }}>
                    {ai.text}
                  </p>
                ) : null}

                <div
                  className="ai-card__body"
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {active.gaps.length === 0 ? (
                    <span className="text-sm text-muted">{t("noGaps")}</span>
                  ) : (
                    active.gaps.map((g, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <Sev level={g.severity} />
                        <div>
                          <strong style={{ color: "var(--text-primary)" }}>
                            {g.line > 0 ? `Satr ${g.line}: ` : ""}
                            {g.title}
                          </strong>
                          <p style={{ marginTop: 4 }}>{g.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<Plus size={13} />}
                    onClick={createDrafts}
                    disabled={pending || active.gaps.length === 0}
                  >
                    {t("aiCreateDrafts", { n: active.gaps.length })}
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
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Target picker — attach the upload + its drafts to an audit + task */}
      <Modal
        open={pendingFile !== null}
        onClose={() => setPendingFile(null)}
        title={t("targetTitle")}
        footer={
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPendingFile(null)}
              disabled={pending}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Upload size={14} />}
              onClick={confirmUpload}
              disabled={pending || !auditId || !taskId}
            >
              {pending ? t("analyzing") : t("analyze")}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted" style={{ marginBottom: 14 }}>
          {t("targetSub")}
        </p>
        <div style={{ display: "grid", gap: 14 }}>
          <Field label={t("targetAudit")} htmlFor="cfg-audit">
            <select
              id="cfg-audit"
              className="select"
              value={auditId}
              onChange={(e) => changeAudit(e.target.value)}
            >
              {audits.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} — {a.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("targetTask")} htmlFor="cfg-task">
            <select
              id="cfg-task"
              className="select"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
            >
              {auditTasks.length === 0 ? <option value="">{t("noTasks")}</option> : null}
              {auditTasks.map((tk) => (
                <option key={tk.id} value={tk.id}>
                  {tk.id} — {tk.title}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
