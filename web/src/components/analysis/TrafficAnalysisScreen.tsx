"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Activity,
  AlertTriangle,
  Bug,
  Hash,
  History,
  Network,
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
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import {
  analyzeTraffic,
  type TrafficAnomaly,
  type TrafficParseResult,
} from "@/lib/analysis/traffic";
import type {
  TrafficTimelinePoint,
  TrafficTalker,
  TrafficPort,
} from "@/lib/analysis/traffic/types";
import { uploadTrafficFile, createTrafficDrafts, reanalyzeTraffic } from "@/lib/actions/traffic";
import { TrafficAiResult } from "./TrafficAiResult";
import { TrafficGraph } from "./TrafficGraph";
import type { TrafficAiAnalysis } from "@/lib/ai/prompts";
import type { Audit, Task, TrafficUploadView, TrafficHistoryRowView } from "@/lib/types/entities";
import { relTime } from "@/lib/utils/time";

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

const isPcapName = (name: string): boolean => /\.(pcap|pcapng)$/i.test(name);

/** Base64-encode an ArrayBuffer in chunks (avoids call-stack limits on big files). */
function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

/** Re-derive the parse result for a stored upload (binary pcap keeps it in `parsed`). */
function resultFromView(v: TrafficUploadView): TrafficParseResult {
  if (v.parsed) {
    try {
      return JSON.parse(v.parsed) as TrafficParseResult;
    } catch {
      /* fall through */
    }
  }
  return analyzeTraffic(v.filename, v.content);
}

/** Real packet-volume timeline drawn from the parser's `timeline` buckets. */
function TrafficTimelineChart({
  timeline,
  anomalies,
  title,
  emptyLabel,
}: {
  timeline: TrafficTimelinePoint[];
  anomalies: TrafficAnomaly[];
  title: string;
  emptyLabel: string;
}) {
  const W = 600;
  const H = 180;
  const padBottom = 22;
  const padTop = 16;

  if (timeline.length === 0) {
    return (
      <Panel title={title} icon={<Activity size={15} />} flush>
        <p className="text-sm text-muted" style={{ padding: "28px 16px", textAlign: "center" }}>
          {emptyLabel}
        </p>
      </Panel>
    );
  }

  const max = Math.max(...timeline.map((p) => p.packets), 1);
  const n = timeline.length;
  const x = (i: number) => (n === 1 ? W / 2 : (i / (n - 1)) * W);
  const y = (v: number) => padTop + (1 - v / max) * (H - padTop - padBottom);

  const linePts = timeline.map((p, i) => `${x(i).toFixed(1)},${y(p.packets).toFixed(1)}`).join(" ");
  const areaPath = `M${x(0).toFixed(1)},${(H - padBottom).toFixed(1)} L ${linePts.replace(/ /g, " L ")} L ${x(n - 1).toFixed(1)},${(H - padBottom).toFixed(1)} Z`;

  // Peak bucket — real maximum, marked on the axis.
  let peakIdx = 0;
  for (let i = 1; i < n; i++) if (timeline[i].packets > timeline[peakIdx].packets) peakIdx = i;

  const totalEvents = anomalies.reduce((s, a) => s + a.eventCount, 0);
  const labelStep = Math.max(1, Math.floor(n / 5));

  return (
    <Panel
      title={title}
      icon={<Activity size={15} />}
      flush
      actions={
        anomalies.length > 0 ? (
          <span className="tag tag--danger">Anomaly {totalEvents.toLocaleString()}</span>
        ) : undefined
      }
    >
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img">
        {[0, 1, 2, 3].map((i) => {
          const gy = padTop + (i / 3) * (H - padTop - padBottom);
          return (
            <line
              key={i}
              x1={0}
              y1={gy}
              x2={W}
              y2={gy}
              stroke="var(--border-color)"
              strokeWidth={1}
            />
          );
        })}
        <path d={areaPath} fill="var(--brand)" fillOpacity={0.16} />
        <polyline points={linePts} fill="none" stroke="var(--brand)" strokeWidth={1.8} />
        {/* peak marker */}
        <line
          x1={x(peakIdx)}
          y1={padTop}
          x2={x(peakIdx)}
          y2={H - padBottom}
          stroke="var(--status-danger-fg)"
          strokeWidth={1.2}
          strokeDasharray="3 3"
        />
        <circle
          cx={x(peakIdx)}
          cy={y(timeline[peakIdx].packets)}
          r={3.2}
          fill="var(--status-danger-fg)"
        />
        <text
          x={Math.min(W - 4, Math.max(40, x(peakIdx)))}
          y={11}
          textAnchor="middle"
          fontSize={10.5}
          fill="var(--status-danger-fg)"
          style={{ fontWeight: 700 }}
        >
          ▼ {timeline[peakIdx].packets.toLocaleString()} · {timeline[peakIdx].label}
        </text>
        {timeline.map((p, i) =>
          i % labelStep === 0 || i === n - 1 ? (
            <text
              key={i}
              x={x(i)}
              y={H - 6}
              fontSize={10}
              fill="var(--text-tertiary)"
              textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
            >
              {p.label}
            </text>
          ) : null,
        )}
      </svg>
    </Panel>
  );
}

/** Top source IPs (talkers) as labelled volume bars. */
function TopTalkers({
  talkers,
  title,
  label,
}: {
  talkers: TrafficTalker[];
  title: string;
  label: string;
}) {
  const max = Math.max(...talkers.map((t) => t.packets), 1);
  return (
    <Panel title={title} icon={<Network size={15} />}>
      {talkers.length === 0 ? (
        <p className="text-sm text-muted">{label}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {talkers.map((t) => (
            <div key={t.ip} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="font-mono" style={{ fontSize: 12, width: 120, flexShrink: 0 }}>
                {t.ip}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  background: "var(--bg-surface-3)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.round((t.packets / max) * 100)}%`,
                    height: "100%",
                    background: "var(--brand)",
                    borderRadius: 3,
                  }}
                />
              </div>
              <span
                className="tabular"
                style={{
                  fontSize: 11,
                  color: "var(--text-tertiary)",
                  width: 56,
                  textAlign: "right",
                }}
              >
                {t.packets.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

/** Top destination ports with service labels and volume bars. */
function TopPorts({ ports, title, label }: { ports: TrafficPort[]; title: string; label: string }) {
  const max = Math.max(...ports.map((p) => p.packets), 1);
  return (
    <Panel title={title} icon={<Hash size={15} />}>
      {ports.length === 0 ? (
        <p className="text-sm text-muted">{label}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ports.map((p) => (
            <div key={p.port} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="font-mono" style={{ fontSize: 12, width: 120, flexShrink: 0 }}>
                {p.port}
                {p.service ? (
                  <span style={{ color: "var(--text-tertiary)" }}> · {p.service}</span>
                ) : null}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  background: "var(--bg-surface-3)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.round((p.packets / max) * 100)}%`,
                    height: "100%",
                    background: "var(--status-warning-fg)",
                    borderRadius: 3,
                  }}
                />
              </div>
              <span
                className="tabular"
                style={{
                  fontSize: 11,
                  color: "var(--text-tertiary)",
                  width: 56,
                  textAlign: "right",
                }}
              >
                {p.packets.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function ProtocolBars({ protocols }: { protocols: TrafficParseResult["protocols"] }) {
  const max = Math.max(...protocols.map((p) => p.packets), 1);
  const RED = new Set(["DNS"]);
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
            <span
              className="font-mono"
              style={{ fontSize: 11, color: "var(--text-tertiary)", width: 56, flexShrink: 0 }}
            >
              {p.protocol}
            </span>
            <div
              style={{
                flex: 1,
                height: 6,
                background: "var(--bg-surface-3)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }}
              />
            </div>
            <span
              className="tabular"
              style={{ fontSize: 11, color: "var(--text-tertiary)", width: 40, textAlign: "right" }}
            >
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
  latestAi: TrafficAiAnalysis | null;
  uploads: TrafficHistoryRowView[];
}

export function TrafficAnalysisScreen({
  audits,
  tasks,
  latest,
  latestAi,
  uploads,
}: TrafficAnalysisScreenProps) {
  const t = useTranslations("traffic");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const [active, setActive] = useState<ActiveTraffic | null>(
    latest
      ? { uploadId: latest.id, filename: latest.filename, result: resultFromView(latest) }
      : null,
  );
  const [pendingFile, setPendingFile] = useState<{ name: string; text: string } | null>(null);
  const [ai, setAi] = useState<TrafficAiAnalysis | null>(latestAi);
  const [aiPending, setAiPending] = useState(false);
  const [aiDegraded, setAiDegraded] = useState(false);
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
    e.target.value = "";
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast(t("fileTooLarge"), "danger");
      return;
    }
    // Binary pcap must be read as bytes (base64) — reading it as text corrupts it.
    const text = isPcapName(file.name)
      ? bufferToBase64(await file.arrayBuffer())
      : await file.text();
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
    setAiPending(true);
    setAiDegraded(false);
    startTransition(async () => {
      const res = await uploadTrafficFile({ filename: name, content: text, auditId, taskId });
      setAiPending(false);
      if (res.ok && res.uploadId) {
        setActive({
          uploadId: res.uploadId,
          filename: name,
          result: res.result ?? analyzeTraffic(name, text),
        });
        setAi(res.ai ?? null);
        setPendingFile(null);
        toast(t("uploaded"), "success");
        router.refresh();
      } else if (res.error === "ai_unreachable") {
        setAiDegraded(true);
        toast(t("aiUnreachable"), "danger");
      } else {
        toast(t("failed"), "danger");
      }
    });
  }

  function reanalyze() {
    if (!active) return;
    setAiPending(true);
    setAiDegraded(false);
    startTransition(async () => {
      const res = await reanalyzeTraffic({ uploadId: active.uploadId });
      setAiPending(false);
      if (res.ok && res.analysis) {
        setAi(res.analysis);
        toast(t("uploaded"), "success");
      } else {
        setAiDegraded(true);
        toast(t("aiUnreachable"), "danger");
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

  const anomalies = active?.result.anomalies ?? [];
  const protocols = active?.result.protocols ?? [];
  const timeline = active?.result.timeline ?? [];
  const talkers = active?.result.topTalkers ?? [];
  const ports = active?.result.topPorts ?? [];
  const conversations = active?.result.conversations ?? [];
  const chartTitle = active?.filename
    ? `${active.filename} — ${t("chartWindow")}`
    : t("chartTitle");

  const note = active?.result.note;
  const noteMessage = !note
    ? null
    : note === "pcapng"
      ? t("notePcapng")
      : note === "unknown"
        ? t("noteUnknown")
        : note.startsWith("linktype_")
          ? t("noteLinktype")
          : t("noteError");

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

      <input
        ref={fileRef}
        type="file"
        accept=".pcap,.pcapng,.json,.jsonl,.log,.csv,.txt"
        onChange={onFile}
        style={{ display: "none" }}
        aria-hidden="true"
      />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 16 }}
      >
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Upload card — horizontal */}
          <div
            className="card"
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              padding: "16px 20px",
              background: "var(--bg-surface-2)",
            }}
          >
            <div
              className="stat__icon"
              style={{
                width: 56,
                height: 56,
                flexShrink: 0,
                background: "var(--brand-soft)",
                color: "var(--brand)",
              }}
            >
              <Activity size={24} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                {t("uploadTitle")}
              </div>
              <div className="text-sm text-muted" style={{ marginTop: 2 }}>
                {t("uploadHint")}
              </div>
            </div>
            <Button size="sm" variant="primary" icon={<Upload size={14} />} onClick={pickFile}>
              {t("uploadBtn")}
            </Button>
          </div>

          {noteMessage ? (
            <div
              className="card"
              role="status"
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                padding: "12px 16px",
                background: "var(--status-warning-bg)",
                border: "1px solid var(--status-warning-fg)",
              }}
            >
              <AlertTriangle
                size={16}
                style={{ color: "var(--status-warning-fg)", flexShrink: 0 }}
              />
              <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{noteMessage}</span>
            </div>
          ) : null}

          {/* Real packet-volume timeline */}
          <TrafficTimelineChart
            timeline={timeline}
            anomalies={anomalies}
            title={chartTitle}
            emptyLabel={t("timelineEmpty")}
          />

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
                        <td>
                          <Sev level={a.severity} />
                        </td>
                        <td className="text-primary" style={{ fontWeight: 500 }}>
                          {a.title}
                        </td>
                        <td className="font-mono" style={{ fontSize: 12 }}>
                          {a.srcIp ?? "—"}
                        </td>
                        <td className="font-mono" style={{ fontSize: 12 }}>
                          {a.dstIpPort ?? "—"}
                        </td>
                        <td className="tabular cell-sub">{a.timeRange ?? "—"}</td>
                        <td
                          className="tabular"
                          style={{ fontWeight: 600, color: "var(--text-primary)" }}
                        >
                          {a.eventCount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          {/* Top talkers + top ports (real, from the parser) */}
          {active ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <TopTalkers talkers={talkers} title={t("topTalkers")} label={t("noData")} />
              <TopPorts ports={ports} title={t("topPorts")} label={t("noData")} />
            </div>
          ) : null}

          {/* Host communication graph */}
          {active && conversations.length > 0 ? (
            <TrafficGraph conversations={conversations} anomalies={anomalies} />
          ) : null}
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Traffic profile */}
          <Panel title={t("profileTitle")} icon={<PieChart size={15} />}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: protocols.length > 0 ? 16 : 0,
              }}
            >
              {[
                {
                  label: t("packets"),
                  value: active ? fmtPackets(active.result.totalPackets) : "—",
                },
                { label: t("anomalies"), value: active ? String(anomalies.length) : "—" },
                {
                  label: t("uniqueIps"),
                  value: active ? active.result.uniqueIps.toLocaleString() : "—",
                },
                {
                  label: t("duration"),
                  value:
                    active?.result.durationHours != null ? `${active.result.durationHours}h` : "—",
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{ padding: 10, background: "var(--bg-surface-2)", borderRadius: 8 }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-tertiary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 4,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      fontFamily: "var(--font-display)",
                      color: "var(--text-primary)",
                    }}
                  >
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
                <div className="ai-card__icon">
                  <Sparkles size={14} />
                </div>
                <span className="ai-card__title">{t("aiTitle")}</span>
              </div>
              {!active && !aiPending && !aiDegraded ? (
                <p className="ai-card__body">{t("aiBody")}</p>
              ) : (
                <TrafficAiResult analysis={ai} loading={aiPending} degraded={aiDegraded} />
              )}
              {active && (
                <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                  {anomalies.length > 0 && (
                    <Button
                      size="sm"
                      variant="primary"
                      icon={<Plus size={13} />}
                      onClick={createDrafts}
                      disabled={pending}
                    >
                      {t("createDrafts", { n: anomalies.length })}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Sparkles size={13} />}
                    onClick={reanalyze}
                    disabled={pending}
                  >
                    {t("aiReanalyze")}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Recent traffic uploads history */}
          <Panel title={t("recentTitle")} icon={<History size={15} />} flush>
            {uploads.length === 0 ? (
              <p className="text-sm text-muted" style={{ padding: "14px 16px" }}>
                {t("recentEmpty")}
              </p>
            ) : (
              <div className="tbl-scroll">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Fayl</th>
                      <th>Format</th>
                      <th>Audit</th>
                      <th>Paketlar</th>
                      <th>Anomaliyalar</th>
                      <th>Vaqt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploads.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <span className="font-mono" style={{ fontSize: 13 }}>
                            {u.filename}
                          </span>
                        </td>
                        <td>
                          <span className="tag tag--outline">{u.format.toUpperCase()}</span>
                        </td>
                        <td>{u.auditCode}</td>
                        <td className="tabular">{u.totalPackets.toLocaleString()}</td>
                        <td>
                          {u.anomalyCount > 0 ? (
                            <span className="sev sev--high">{u.anomalyCount}</span>
                          ) : (
                            <span className="tag tag--success">0</span>
                          )}
                        </td>
                        <td className="cell-sub">{relTime(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* Upload target picker */}
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
          <Field label={t("targetAudit")} htmlFor="trf-audit">
            <Select
              id="trf-audit"
              value={auditId}
              onChange={changeAudit}
              options={audits.map((a) => ({ value: a.id, label: `${a.code} — ${a.title}` }))}
            />
          </Field>
          <Field label={t("targetTask")} htmlFor="trf-task">
            <Select
              id="trf-task"
              value={taskId}
              onChange={setTaskId}
              options={[
                ...(auditTasks.length === 0 ? [{ value: "", label: t("noTasks") }] : []),
                ...auditTasks.map((tk) => ({ value: tk.id, label: `${tk.id} — ${tk.title}` })),
              ]}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
