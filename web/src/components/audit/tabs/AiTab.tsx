"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  RefreshCw,
  Send,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { Sev } from "@/components/ui/Sev";
import { Button } from "@/components/ui/Button";
import { analyzeAudit } from "@/lib/actions/audit-ai";
import type { AuditAnalysis } from "@/lib/analysis/audit/types";
import type { Audit } from "@/lib/types/entities";

export interface AiTabProps {
  audit: Audit;
  latestAi: AuditAnalysis | null;
  userName: string;
  orgName: string;
}

export function AiTab({ audit, latestAi, userName, orgName }: AiTabProps) {
  const t = useTranslations("auditDetail");
  const [ai, setAi] = useState<AuditAnalysis | null>(latestAi);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<"no_data" | "ai_unavailable" | null>(null);
  const autoRan = useRef(false);

  async function runAi() {
    setPending(true);
    setFailure(null);
    try {
      const res = await analyzeAudit({ auditId: audit.id });
      if (res.ok && res.analysis) setAi(res.analysis);
      else setFailure(res.error === "no_data" ? "no_data" : "ai_unavailable");
    } finally {
      setPending(false);
    }
  }

  // Auto-run once on load when no analysis is stored yet (graceful). The ref guard
  // keeps it to a single call even under React StrictMode's double-invoke in dev.
  useEffect(() => {
    if (autoRan.current || ai) return;
    autoRan.current = true;
    void runAi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="ai-card">
        <div className="ai-card__inner">
          <div className="ai-card__head">
            <div className="ai-card__icon">
              <Sparkles size={14} />
            </div>
            <span className="ai-card__title">{t("aiExecTitle")}</span>
            <Button
              size="xs"
              variant="soft"
              icon={<RefreshCw size={12} className={pending ? "spin" : undefined} />}
              onClick={() => void runAi()}
              disabled={pending}
              style={{ marginLeft: "auto" }}
            >
              {pending ? t("aiAnalyzing") : t("aiAnalyze")}
            </Button>
          </div>
          <AuditAiResult analysis={ai} loading={pending} failure={failure} />
        </div>
      </div>

      <AuditAiChat audit={audit} userName={userName} orgName={orgName} />
    </div>
  );
}

function AuditAiResult({
  analysis,
  loading,
  failure,
}: {
  analysis: AuditAnalysis | null;
  loading: boolean;
  failure: "no_data" | "ai_unavailable" | null;
}) {
  const t = useTranslations("auditDetail");

  if (loading)
    return (
      <p className="ai-card__body" aria-live="polite">
        {t("aiAnalyzing")}
      </p>
    );
  if (failure === "no_data")
    return (
      <p className="ai-card__body" style={{ color: "var(--text-tertiary)" }} role="status">
        {t("aiNoData")}
      </p>
    );
  if (failure === "ai_unavailable")
    return (
      <p className="ai-card__body" style={{ color: "var(--status-danger-fg)" }} role="alert">
        {t("aiUnreachable")}
      </p>
    );
  if (!analysis) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="ai-card__body">
        <span className="stat__label" style={{ marginRight: 6 }}>
          {t("aiOverallRisk")}
        </span>
        <Sev level={analysis.overallRisk} />
      </div>
      {analysis.executiveSummary ? (
        <p className="ai-card__body" style={{ whiteSpace: "pre-wrap" }}>
          {analysis.executiveSummary}
        </p>
      ) : null}

      {analysis.topRisks.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="stat__label">{t("aiTopRisks")}</span>
          {analysis.topRisks.map((r, i) => (
            <div key={i} className="card" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sev level={r.severity} />
                <strong style={{ color: "var(--text-primary)" }}>{r.title}</strong>
              </div>
              {r.why ? (
                <div className="ai-card__body">
                  <span className="stat__label" style={{ marginRight: 6 }}>
                    {t("aiWhy")}
                  </span>
                  {r.why}
                </div>
              ) : null}
              {r.recommendation ? (
                <div className="ai-card__body">
                  <span className="stat__label" style={{ marginRight: 6 }}>
                    {t("aiRemediation")}
                  </span>
                  {r.recommendation}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {analysis.remediationPlan.length > 0 ? (
        <div className="ai-card__body">
          <span className="stat__label">{t("aiRemediationPlan")}</span>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
            {analysis.remediationPlan.map((r, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                <span style={{ textTransform: "capitalize", color: "var(--text-tertiary)", marginRight: 6 }}>
                  [{r.priority}]
                </span>
                {r.action}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {analysis.kpiNote ? (
        <div className="ai-card__body">
          <span className="stat__label" style={{ marginRight: 6 }}>
            {t("aiKpiNote")}
          </span>
          {analysis.kpiNote}
        </div>
      ) : null}
    </div>
  );
}

interface Msg {
  role: "user" | "ai";
  text: string;
  pending?: boolean;
  error?: boolean;
}

function AuditAiChat({ audit, userName, orgName }: { audit: Audit; userName: string; orgName: string }) {
  const t = useTranslations("ai");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);

  const fc = audit.findings;
  const fTotal = fc.critical + fc.high + fc.medium + fc.low;

  function buildPrompt(history: Msg[], text: string): string {
    const ctx = [
      "Joriy audit konteksti:",
      `- Kod: ${audit.code} — ${audit.title}`,
      `- Tashkilot: ${orgName}`,
      `- Findinglar: ${fc.critical} critical, ${fc.high} high, ${fc.medium} medium, ${fc.low} low`,
      `- Vazifalar: ${audit.tasks.done}/${audit.tasks.total} bajarilgan`,
    ].join("\n");
    const hist = history
      .filter((m) => m.text.trim() && !m.pending)
      .slice(-6)
      .map((m) => `${m.role === "ai" ? "AI" : "Auditor"}: ${m.text}`)
      .join("\n");
    return `${ctx}\n\n--- Suhbat ---\n${hist ? `${hist}\n` : ""}Auditor: ${text}\nAI:`;
  }

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || busy) return;
    const snapshot = messages;
    setMessages((m) => [...m, { role: "user", text }, { role: "ai", text: "", pending: true }]);
    setInput("");
    setBusy(true);
    try {
      const resp = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "chat", prompt: buildPrompt(snapshot, text) }),
      });
      const data = (await resp.json()) as { ok?: boolean; text?: string };
      setMessages((m) =>
        m.map((msg, i) =>
          i === m.length - 1
            ? data.ok
              ? { role: "ai", text: data.text || "" }
              : { role: "ai", text: t("unreachable"), error: true }
            : msg,
        ),
      );
    } catch {
      setMessages((m) =>
        m.map((msg, i) =>
          i === m.length - 1 ? { role: "ai", text: t("unreachable"), error: true } : msg,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  const presets = [
    { k: "presetExec", Icon: Star },
    { k: "presetRemediation", Icon: Target },
    { k: "presetCritical", Icon: AlertTriangle },
    { k: "presetKpi", Icon: Trophy },
  ] as const;

  return (
    <div className="panel" style={{ display: "flex", flexDirection: "column" }}>
      <div className="panel__h">
        <div className="panel__t">
          <Sparkles size={15} />
          <span>{t("chatTitle", { audit: audit.code })}</span>
        </div>
      </div>

      <div
        style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12, minHeight: 120 }}
      >
        {messages.length === 0 ? (
          <p className="text-sm text-muted">{t("greeting")}</p>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  background: m.role === "ai" ? "var(--brand)" : "var(--bg-surface-3)",
                  color: m.role === "ai" ? "white" : "var(--text-secondary)",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {m.role === "ai" ? <Sparkles size={13} /> : (userName[0] ?? "A")}
              </div>
              <div
                className="ai-card__body"
                style={{
                  whiteSpace: "pre-wrap",
                  color: m.error ? "var(--status-danger-fg)" : undefined,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {m.pending ? t("sending") : m.text}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: 12, borderTop: "1px solid var(--border-color)", background: "var(--bg-surface-2)" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          {presets.map(({ k, Icon }) => (
            <Button
              key={k}
              size="xs"
              variant="soft"
              icon={<Icon size={12} />}
              disabled={busy}
              onClick={() => void send(t(k))}
            >
              {t(k)}
            </Button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            className="textarea"
            aria-label={t("placeholder")}
            placeholder={t("placeholder")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            disabled={busy}
            style={{ minHeight: 44, resize: "none", flex: 1 }}
          />
          <Button
            variant="primary"
            icon={<Send size={14} />}
            onClick={() => void send(input)}
            disabled={busy || !input.trim()}
            style={{ padding: "10px 16px" }}
          >
            {busy ? t("sending") : t("send")}
          </Button>
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: "var(--text-tertiary)" }}>
          {t("contextNote", { tasks: audit.tasks.total, findings: fTotal })} · {t("closedNote")}
        </div>
      </div>
    </div>
  );
}
