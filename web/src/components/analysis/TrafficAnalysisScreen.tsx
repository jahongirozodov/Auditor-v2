"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Activity,
  AlertTriangle,
  Bug,
  PieChart,
  Plus,
  Server,
  Sparkles,
  Upload,
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
  analyzeTraffic,
  TRAFFIC_FORMAT_LABELS,
  type TrafficAnomaly,
  type TrafficParseResult,
} from "@/lib/analysis/traffic";
import { uploadTrafficFile, createTrafficDrafts } from "@/lib/actions/traffic";
import type { Audit, Task, TrafficUploadView } from "@/lib/types/entities";

interface ActiveTraffic {
  uploadId: string;
  filename: string;
  result: TrafficParseResult;
}

function fmtPackets(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function AnomalyChart({ anomalies, title }: { anomalies: TrafficAnomaly[]; title: string }) {
  const hasSpike = anomalies.length > 0;
  const topTitle = anomalies[0]?.title ?? "";
  const topTime  = anomalies[0]?.timeRange;

  return (
    <Panel title={title} icon={<Activity size={15} />} flush
      actions={
        hasSpike ? (
          <span className="tag tag--danger">
            Anomaly {anomalies.reduce((s, a) => s + a.eventCount, 0).toLocaleString()}
          </span>
        ) : undefined
      }
    >
      <svg width="100%" height={180} viewBox="0 0 600 180" preserveAspectRatio="none" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={0} y1={i * 36 + 18} x2={600} y2={i * 36 + 18}
            stroke="var(--border-color)" strokeWidth={1} />
        ))}
        <path
          d="M0 130 C 40 128,80 120,120 122 C 160 124,200 118,240 124 C 280 130,320 122,360 126 C 400 130,440 122,480 128 C 520 132,560 126,600 130 L 600 180 L 0 180 Z"
          fill="var(--brand)" fillOpacity={0.18}
        />
        <path
          d="M0 130 C 40 128,80 120,120 122 C 160 124,200 118,240 124 C 280 130,320 122,360 126 C 400 130,440 122,480 128 C 520 132,560 126,600 130"
          fill="none" stroke="var(--brand)" strokeWidth={1.5}
        />
        {hasSpike && (
          <>
            <path
              d="M280 130 C 285 130,290 60,320 30 C 340 20,360 22,380 50 C 400 80,420 95,440 120 C 460 130,470 130,480 130 L 480 180 L 280 180 Z"
              fill="var(--status-danger-fg)" fillOpacity={0.22}
            />
            <path
              d="M280 130 C 285 130,290 60,320 30 C 340 20,360 22,380 50 C 400 80,420 95,440 120 C 460 130,470 130,480 130"
              fill="none" stroke="var(--status-danger-fg)" strokeWidth={1.8}
            />
            <text x={340} y={14} textAnchor="middle" fontSize={11}
              fill="var(--status-danger-fg)" style={{ fontWeight: 700 }}>
              {topTime
                ? `▼ ${topTitle.slice(0, 24)} — ${topTime}`
                : `▼ ${topTitle.slice(0, 32)} — aniqlandi`}
            </text>
          </>
        )}
        {["00:00", "06:00", "12:00", "18:00", "23:59"].map((label, i) => (
          <text key={label} x={i * 150} y={174} fontSize={10} fill="var(--text-tertiary)"
            textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}>
            {label}
          </text>
        ))}
      </svg>
    </Panel>
  );
}

function ProtocolBars({ protocols }: { protocols: TrafficParseResult["protocols"] }) {
  const max = Math.max(...protocols.map((p) => p.packets), 1);
  const RED   = new Set(["DNS"]);
  const AMBER = new Set(["FTP", "TELNET", "HTTP"]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {protocols.map((p) => {
        const pct = Math.round((p.packets / max) * 100);
        const color = RED.has(p.protocol)
          ? "var(--status-danger-fg)"
          : AMBER.has(p.protocol)
            ? "var(--status-warning-fg)"
            : "var(--brand)";
        return (
          <div key={p.protocol} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="font-mono"
              style={{ fontSize: 11, color: "var(--text-tertiary)", width: 56, flexShrink: 0 }}>
              {p.protocol}
            </span>
            <div style={{ flex: 1, height: 6, background: "var(--bg-surface-3)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }} />
            </div>
            <span className="tabular"
              style={{ fontSize: 11, color: "var(--text-tertiary)", width: 40, textAlign: "right" }}>
              {p.packets.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export interface TrafficAnalysisScreenProps {
  audits: Audit[];
  tasks: Task[];
  latest: TrafficUploadView | null;
}

export function TrafficAnalysisScreen({ audits, tasks, latest }: TrafficAnalysisScreenProps) {
  const t       = useTranslations("traffic");
  const tNav    = useTranslations("nav");
  const tCommon = useTranslations("common");
  const toast   = useToast();
  const router  = useRouter();
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const [active, setActive] = useState<ActiveTraffic | null>(
    latest
      ? { uploadId: latest.id, filename: latest.filename, result: analyzeTraffic(latest.filename, latest.content) }
      : null,
  );
  const [pendingFile, setPendingFile] = useState<{ name: string; text: string } | null>(null);
  const [auditId, setAuditId] = useState(audits[0]?.id ?? "");
  const [taskId, setTaskId]   = useState("");
  const auditTasks = tasks.filter((tk) => tk.auditId === auditId);

  const tabs = [
    { id: "scanner", label: tNav("scanner"), icon: <Bug size={14} /> },
    { id: "config",  label: tNav("config"),  icon: <Server size={14} /> },
    { id: "traffic", label: tNav("traffic"), icon: <Activity size={14} /> },
  ];

  function pickFile() { fileRef.current?.click(); }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast(t("fileTooLarge"), "danger"); return; }
    const text = await file.text();
    const first = audits[0]?.id ?? "";
    setAuditId(first);
    setTaskId(tasks.find((tk) => tk.auditId === first)?.id ?? "");
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
      const res = await uploadTrafficFile({ filename: name, content: text, auditId, taskId });
      if (res.ok && res.uploadId) {
        setActive({ uploadId: res.uploadId, filename: name, result: analyzeTraffic(name, text) });
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
      const res = await createTrafficDrafts({ uploadId: active.uploadId });
      if (res.ok) {
        toast(t("draftsCreated", { n: res.ids?.length ?? 0 }), "success");
        router.refresh();
      } else {
        toast(t("failed"), "danger");
      }
    });
  }

  const anomalies  = active?.result.anomalies ?? [];
  const protocols  = active?.result.protocols ?? [];
  const chartTitle = active?.filename
    ? `${active.filename} — 24 soat`
    : t("chartTitle");

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

      <Tabs tabs={tabs} active="traffic" onChange={(id) => router.push(`/analysis/${id}`)} />

      <input ref={fileRef} type="file"
        accept=".pcap,.pcapng,.json,.jsonl,.log,.csv,.txt"
        onChange={onFile} style={{ display: "none" }} aria-hidden="true" />

      <div className="grid" style={{ gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 16 }}>

        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Upload card — horizontal */}
          <div className="card" style={{ display: "flex", gap: 16, alignItems: "center", padding: "16px 20px", background: "var(--bg-surface-2)" }}>
            <div className="stat__icon"
              style={{ width: 56, height: 56, flexShrink: 0, background: "var(--brand-soft)", color: "var(--brand)" }}>
              <Activity size={24} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{t("uploadTitle")}</div>
              <div className="text-sm text-muted" style={{ marginTop: 2 }}>{t("uploadHint")}</div>
            </div>
            <Button size="sm" variant="primary" icon={<Upload size={14} />} onClick={pickFile}>
              {t("uploadBtn")}
            </Button>
          </div>

          {/* Anomaly chart */}
          <AnomalyChart anomalies={anomalies} title={chartTitle} />

          {/* Anomalies table */}
          <Panel title={t("anomaliesTitle")} icon={<AlertTriangle size={15} />} flush>
            {anomalies.length === 0 ? (
              <p className="text-sm text-muted" style={{ padding: "14px 16px" }}>
                {t("anomaliesEmpty")}
              </p>
            ) : (
              <div className="tbl-scroll">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Severity</th>
                      <th>Anomaliya</th>
                      <th>Manba IP</th>
                      <th>Maqsad / port</th>
                      <th>Vaqt</th>
                      <th>Hodisalar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {anomalies.map((a, i) => (
                      <tr key={i}>
                        <td><Sev level={a.severity} /></td>
                        <td className="text-primary" style={{ fontWeight: 500 }}>{a.title}</td>
                        <td className="font-mono" style={{ fontSize: 12 }}>{a.srcIp ?? "—"}</td>
                        <td className="font-mono" style={{ fontSize: 12 }}>{a.dstIpPort ?? "—"}</td>
                        <td className="tabular cell-sub">{a.timeRange ?? "—"}</td>
                        <td className="tabular" style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          {a.eventCount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Traffic profile */}
          <Panel title={t("profileTitle")} icon={<PieChart size={15} />}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: protocols.length > 0 ? 16 : 0 }}>
              {[
                { label: t("packets"),   value: active ? fmtPackets(active.result.totalPackets) : "—" },
                { label: t("anomalies"), value: active ? String(anomalies.length) : "—" },
                { label: t("uniqueIps"), value: active ? active.result.uniqueIps.toLocaleString() : "—" },
                { label: t("duration"),  value: active?.result.durationHours != null ? `${active.result.durationHours}h` : "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: 10, background: "var(--bg-surface-2)", borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
            {protocols.length > 0 && <ProtocolBars protocols={protocols} />}
          </Panel>

          {/* AI card */}
          <div className="ai-card">
            <div className="ai-card__inner">
              <div className="ai-card__head">
                <div className="ai-card__icon"><Sparkles size={14} /></div>
                <span className="ai-card__title">{t("aiTitle")}</span>
              </div>
              <p className="ai-card__body">{t("aiBody")}</p>
              {active && anomalies.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <Button size="sm" variant="primary" icon={<Plus size={13} />}
                    onClick={createDrafts} disabled={pending}>
                    {t("createDrafts", { n: anomalies.length })}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload target picker */}
      <Modal
        open={pendingFile !== null}
        onClose={() => setPendingFile(null)}
        title={t("targetTitle")}
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setPendingFile(null)} disabled={pending}>
              {tCommon("cancel")}
            </Button>
            <Button size="sm" variant="primary" icon={<Upload size={14} />}
              onClick={confirmUpload} disabled={pending || !auditId || !taskId}>
              {pending ? t("analyzing") : t("analyze")}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted" style={{ marginBottom: 14 }}>{t("targetSub")}</p>
        <div style={{ display: "grid", gap: 14 }}>
          <Field label={t("targetAudit")} htmlFor="trf-audit">
            <select id="trf-audit" className="select" value={auditId}
              onChange={(e) => changeAudit(e.target.value)}>
              {audits.map((a) => (
                <option key={a.id} value={a.id}>{a.code} — {a.title}</option>
              ))}
            </select>
          </Field>
          <Field label={t("targetTask")} htmlFor="trf-task">
            <select id="trf-task" className="select" value={taskId}
              onChange={(e) => setTaskId(e.target.value)}>
              {auditTasks.length === 0 ? <option value="">{t("noTasks")}</option> : null}
              {auditTasks.map((tk) => (
                <option key={tk.id} value={tk.id}>{tk.id} — {tk.title}</option>
              ))}
            </select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
