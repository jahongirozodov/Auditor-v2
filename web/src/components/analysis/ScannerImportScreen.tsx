"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Activity,
  Boxes,
  Bug,
  Globe,
  History,
  Layers,
  Link,
  Network,
  Plus,
  RefreshCw,
  Server,
  Sparkles,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { SCANNER_LABELS } from "@/lib/analysis/scanner";
import type { ScannerNormalization } from "@/lib/analysis/scanner";
import { uploadScannerFile, reanalyzeScanner, createScannerDrafts } from "@/lib/actions/scanner";
import { ScannerAiResult } from "./ScannerAiResult";
import type { Audit, Task, ScanImportRowView, ScannerUploadView } from "@/lib/types/entities";

const SCANNER_ORDER = ["nessus", "openvas", "nmap", "zap", "burp", "universal"] as const;
type ScannerKey = (typeof SCANNER_ORDER)[number];

const SCANNER_ICON: Record<ScannerKey, LucideIcon> = {
  nessus: Bug,
  openvas: Bug,
  nmap: Network,
  zap: Globe,
  burp: Globe,
  universal: Layers,
};

const SCANNER_COLOR: Record<ScannerKey, "warning" | "info" | "ghost"> = {
  nessus: "warning",
  openvas: "warning",
  nmap: "info",
  zap: "info",
  burp: "info",
  universal: "ghost",
};

const FORMAT_TAGS = ["Nessus", "OpenVAS", "Nmap", "OWASP ZAP", "Burp Suite", "Custom CSV"];

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} daqiqa`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} soat`;
  return `${Math.floor(h / 24)} kun`;
}

function SevPills({ agg }: { agg: ScanImportRowView["severityAgg"] }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {agg.critical ? <span className="sev sev--critical">{agg.critical}</span> : null}
      {agg.high ? <span className="sev sev--high">{agg.high}</span> : null}
      {agg.medium ? <span className="sev sev--medium">{agg.medium}</span> : null}
      {agg.low ? <span className="sev sev--low">{agg.low}</span> : null}
    </div>
  );
}

interface ActiveUpload {
  uploadId: string;
  filename: string;
}

export interface ScannerImportScreenProps {
  audits: Audit[];
  tasks: Task[];
  imports: ScanImportRowView[];
  latest: ScannerUploadView | null;
  latestAi: ScannerNormalization | null;
}

export function ScannerImportScreen({
  audits,
  tasks,
  imports,
  latest,
  latestAi,
}: ScannerImportScreenProps) {
  const t = useTranslations("scanner");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const [active, setActive] = useState<ActiveUpload | null>(
    latest ? { uploadId: latest.id, filename: latest.filename } : null,
  );
  const [ai, setAi] = useState<ScannerNormalization | null>(latestAi);
  const [aiDegraded, setAiDegraded] = useState(false);
  const [aiPending, setAiPending] = useState(false);

  const [pendingFile, setPendingFile] = useState<{ name: string; text: string } | null>(null);
  const [auditId, setAuditId] = useState(audits[0]?.id ?? "");
  const [taskId, setTaskId] = useState("");
  const auditTasks = tasks.filter((tk) => tk.auditId === auditId);

  // Count imports per scanner type for badge display
  const countByScanner: Record<string, number> = {};
  for (const imp of imports) {
    countByScanner[imp.scanner] = (countByScanner[imp.scanner] ?? 0) + 1;
  }

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
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_BYTES) {
      toast(t("fileTooLarge"), "danger");
      return;
    }
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
    setAiPending(true);
    setAiDegraded(false);
    startTransition(async () => {
      const res = await uploadScannerFile({ filename: name, content: text, auditId, taskId });
      if (res.ok && res.uploadId) {
        setActive({ uploadId: res.uploadId, filename: name });
        setAi(res.ai ?? null);
        setAiDegraded(res.aiOk === false); // imported, but AI normalization deferred
        setPendingFile(null);
        toast(t("uploaded"), "success");
        router.refresh();
      } else {
        toast(t("failed"), "danger");
      }
      setAiPending(false);
    });
  }

  async function reanalyze() {
    if (!active) return;
    setAiPending(true);
    setAiDegraded(false);
    try {
      const res = await reanalyzeScanner({ uploadId: active.uploadId });
      if (res.ok && res.normalization) {
        setAi(res.normalization);
      } else {
        setAiDegraded(true);
      }
    } finally {
      setAiPending(false);
      router.refresh();
    }
  }

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

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[{ label: tNav("dashboard"), href: "/dashboard" }, { label: t("crumb") }]}
        title={t("title")}
        sub={t("sub")}
        actions={
          <Button size="sm" variant="primary" icon={<Upload size={14} />} onClick={pickFile}>
            {t("fileUpload")}
          </Button>
        }
      />

      <Tabs tabs={tabs} active="scanner" onChange={(id) => router.push(`/analysis/${id}`)} />

      <input
        ref={fileRef}
        type="file"
        accept=".nessus,.xml,.gnmap,.json,.html,.csv,.txt,.xlsx"
        onChange={onFile}
        style={{ display: "none" }}
        aria-hidden="true"
      />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 16 }}
      >
        {/* LEFT — drop zone + recent imports */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Drop zone */}
          <div
            className="card"
            style={{
              padding: 28,
              textAlign: "center",
              border: "1.5px dashed var(--border-strong)",
              background: "var(--bg-surface-2)",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                background: "var(--brand-soft)",
                color: "var(--brand)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}
            >
              <Upload size={24} />
            </div>
            <h3 style={{ fontSize: 17, marginBottom: 6 }}>{t("dropTitle")}</h3>
            <p className="text-sm text-muted" style={{ margin: "0 0 16px" }}>
              {t("dropHint")}
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
              <Button size="sm" variant="primary" icon={<Upload size={14} />} onClick={pickFile}>
                {t("selectFile")}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                icon={<Link size={14} />}
                onClick={() => toast(t("uploaded"), "info")}
              >
                {t("urlUpload")}
              </Button>
            </div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
              {FORMAT_TAGS.map((tag) => (
                <span key={tag} className="tag tag--outline">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Recent imports */}
          <Panel title={t("recentTitle")} icon={<History size={15} />} flush>
            {imports.length === 0 ? (
              <p className="text-sm text-muted" style={{ padding: "14px 16px" }}>
                {t("recentEmpty")}
              </p>
            ) : (
              <div className="tbl-scroll">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Fayl</th>
                      <th>Skaner</th>
                      <th>Audit</th>
                      <th>Topildi</th>
                      <th>Holat</th>
                      <th>Vaqt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {imports.map((imp) => {
                      const Icon = SCANNER_ICON[imp.scanner as ScannerKey] ?? Layers;
                      return (
                        <tr key={imp.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div className="stat__icon">
                                <Icon size={13} />
                              </div>
                              <span className="font-mono" style={{ fontSize: 13 }}>
                                {imp.filename}
                              </span>
                            </div>
                          </td>
                          <td>{SCANNER_LABELS[imp.scanner as ScannerKey]?.name ?? imp.scanner}</td>
                          <td>{imp.auditCode}</td>
                          <td>
                            <SevPills agg={imp.severityAgg} />
                          </td>
                          <td>
                            <span
                              className={
                                imp.status === "done" ? "tag tag--success" : "tag tag--warning"
                              }
                            >
                              {imp.status === "done" ? "Bajarildi" : "Jarayonda"}
                            </span>
                          </td>
                          <td className="cell-sub">{relTime(imp.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>

        {/* RIGHT — supported formats + AI card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Panel title={t("formatsTitle")} icon={<Boxes size={15} />} flush>
            {SCANNER_ORDER.map((key, i) => {
              const Icon = SCANNER_ICON[key];
              const color = SCANNER_COLOR[key];
              const label = SCANNER_LABELS[key];
              const count = countByScanner[key];
              const iconStyle =
                color === "warning"
                  ? { color: "var(--status-warning-fg)" }
                  : color === "info"
                    ? { color: "var(--status-info-fg)" }
                    : { color: "var(--text-muted)" };
              return (
                <div
                  key={key}
                  style={{
                    padding: "10px 14px",
                    borderBottom:
                      i < SCANNER_ORDER.length - 1 ? "1px solid var(--border-color)" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div className="stat__icon" style={iconStyle}>
                    <Icon size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                      {label.name}
                    </div>
                    <div className="cell-sub font-mono">{label.desc}</div>
                  </div>
                  {count ? <span className="tag tag--ghost">{count}</span> : null}
                </div>
              );
            })}
          </Panel>

          <div className="ai-card">
            <div className="ai-card__inner">
              <div className="ai-card__head">
                <div className="ai-card__icon">
                  <Sparkles size={14} />
                </div>
                <span className="ai-card__title">{t("aiTitle")}</span>
              </div>

              <ScannerAiResult analysis={ai} loading={aiPending} degraded={aiDegraded} />

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
            </div>
          </div>
        </div>
      </div>

      {/* Target picker modal */}
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
          <Field label={t("targetAudit")} htmlFor="scn-audit">
            <select
              id="scn-audit"
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
          <Field label={t("targetTask")} htmlFor="scn-task">
            <select
              id="scn-task"
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
