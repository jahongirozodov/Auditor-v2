"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  ChevronRight,
  Cpu,
  FileText,
  History,
  Layers,
  RefreshCw,
  Send,
  Server,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ChatHistoryModal } from "./ChatHistoryModal";
import { saveExchange, getConversation } from "@/lib/actions/ai-chat";
import { analyzeAudit } from "@/lib/actions/audit-ai";
import type { Audit } from "@/lib/types/entities";

/** Report-builder rows — `key` matches the server's REPORT_SECTIONS. */
const SECTIONS = [
  { key: "overview", i18n: "secOverview", required: true },
  { key: "group", i18n: "secGroup", required: true },
  { key: "findings", i18n: "secFindings", required: true },
  { key: "exec", i18n: "secExec", ai: true },
  { key: "remediation", i18n: "secRemediation", ai: true },
  { key: "topology", i18n: "secTopology" },
  { key: "kpi", i18n: "secKpi" },
  { key: "appendix", i18n: "secAppendix" },
] as const;

const DEFAULT_CHECKED: Record<string, boolean> = {
  overview: true,
  group: true,
  findings: true,
  exec: true,
  remediation: true,
  topology: false,
  kpi: true,
  appendix: false,
};

interface Msg {
  role: "system" | "user" | "ai";
  text: string;
  time: string;
  pending?: boolean;
  error?: boolean;
}

function nowTime(): string {
  return new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
}

export interface AiScreenProps {
  audits: Audit[];
  orgsById: Record<string, string>;
  userName: string;
  /** Real configured Ollama model (server truth) — no longer a fake client list. */
  model: string;
}

export function AiScreen({ audits, orgsById, userName, model }: AiScreenProps) {
  const t = useTranslations("ai");
  const tNav = useTranslations("nav");
  const toast = useToast();

  const [auditId, setAuditId] = useState(audits[0]?.id ?? "");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>(DEFAULT_CHECKED);
  const [downloading, setDownloading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "system", text: t("greeting"), time: nowTime() },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const audit = audits.find((a) => a.id === auditId) ?? audits[0];
  const orgName = audit ? (orgsById[audit.org] ?? audit.org) : "";
  const fTotal = audit
    ? audit.findings.critical + audit.findings.high + audit.findings.medium + audit.findings.low
    : 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function resetThread() {
    setConversationId(null);
    setMessages([{ role: "system", text: t("greeting"), time: nowTime() }]);
  }

  function onAuditChange(id: string) {
    setAuditId(id);
    resetThread();
  }

  function buildPrompt(history: Msg[], text: string): string {
    const fc = audit?.findings ?? { critical: 0, high: 0, medium: 0, low: 0 };
    const ctx = [
      "Joriy audit konteksti:",
      `- Kod: ${audit?.code ?? "—"} — ${audit?.title ?? ""}`,
      `- Tashkilot: ${orgName}`,
      `- Findinglar: ${fc.critical} critical, ${fc.high} high, ${fc.medium} medium, ${fc.low} low`,
      `- Vazifalar: ${audit?.tasks.done ?? 0}/${audit?.tasks.total ?? 0} bajarilgan`,
    ].join("\n");
    const hist = history
      .filter((m) => (m.role === "user" || m.role === "ai") && m.text.trim() && !m.pending)
      .slice(-6)
      .map((m) => `${m.role === "ai" ? "AI" : "Auditor"}: ${m.text}`)
      .join("\n");
    return `${ctx}\n\n--- Suhbat ---\n${hist ? `${hist}\n` : ""}Auditor: ${text}\nAI:`;
  }

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || busy) return;
    const snapshot = messages;
    const ts = nowTime();
    setMessages((m) => [
      ...m,
      { role: "user", text, time: ts },
      { role: "ai", text: "", time: ts, pending: true },
    ]);
    setInput("");
    setBusy(true);
    let aiText = "";
    let aiError = false;
    try {
      const resp = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "chat", prompt: buildPrompt(snapshot, text) }),
      });
      const data = (await resp.json()) as { ok?: boolean; text?: string };
      aiError = !data.ok;
      aiText = data.ok ? data.text || "" : t("unreachable");
    } catch {
      aiError = true;
      aiText = t("unreachable");
    }
    const t2 = nowTime();
    setMessages((m) =>
      m.map((msg, i) =>
        i === m.length - 1 ? { role: "ai", text: aiText, time: t2, error: aiError } : msg,
      ),
    );
    setBusy(false);

    // Persist the exchange (auto-save). Failures here never disrupt the chat.
    try {
      const saved = await saveExchange({ conversationId, auditId, userText: text, aiText });
      if (saved.ok && saved.conversationId) setConversationId(saved.conversationId);
    } catch {
      /* ignore persistence errors */
    }
  }

  async function loadConversation(id: string) {
    setHistoryOpen(false);
    const conv = await getConversation({ id });
    if (!conv) {
      toast(t("histMissing"), "danger");
      return;
    }
    setAuditId(conv.auditId);
    setConversationId(conv.id);
    const ts = nowTime();
    setMessages([
      { role: "system", text: t("histRestored"), time: ts },
      ...conv.messages.map((m) => ({ role: m.role, text: m.text, time: ts })),
    ]);
  }

  async function downloadDocx() {
    const sections = SECTIONS.filter((s) => checked[s.key]).map((s) => s.key);
    if (!sections.length || !audit) {
      toast(t("rbNoSections"), "danger");
      return;
    }
    setDownloading(true);
    try {
      const resp = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId: audit.id, sections }),
      });
      if (!resp.ok) {
        toast(t("rbFailed"), "danger");
        return;
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${audit.code}-hisobot.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast(t("rbDownloaded"), "success");
    } catch {
      toast(t("rbFailed"), "danger");
    } finally {
      setDownloading(false);
    }
  }

  async function regenerate() {
    if (!audit) return;
    setRegenerating(true);
    try {
      const res = await analyzeAudit({ auditId: audit.id });
      toast(res.ok ? t("rbRegenerated") : t("rbRegenFailed"), res.ok ? "info" : "danger");
    } catch {
      toast(t("rbRegenFailed"), "danger");
    } finally {
      setRegenerating(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const presets = [
    { k: "presetExec", Icon: Star },
    { k: "presetRemediation", Icon: Target },
    { k: "presetCritical", Icon: AlertTriangle },
    { k: "presetConfig", Icon: Server },
    { k: "presetKpi", Icon: Trophy },
  ];

  const templates = ["pt1", "pt2", "pt3", "pt4", "pt5", "pt6"];
  const modelShort = model.split(":")[0];

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[{ label: tNav("dashboard"), href: "/dashboard" }, { label: t("crumb") }]}
        title={t("title")}
        sub={t("sub", { model, audit: audit?.code ?? "—" })}
        actions={
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <Select
              value={auditId}
              onChange={onAuditChange}
              style={{ width: 200 }}
              options={audits.map((a) => ({ value: a.id, label: a.code }))}
            />
            <span className="tag tag--brand" title={model} style={{ whiteSpace: "nowrap" }}>
              <Cpu size={11} /> {model}
            </span>
            <Button
              size="sm"
              variant="ghost"
              icon={<History size={14} />}
              onClick={() => setHistoryOpen(true)}
            >
              {t("history")}
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<FileText size={14} />}
              onClick={() => void downloadDocx()}
              disabled={downloading}
            >
              {downloading ? t("rbDownloading") : t("export")}
            </Button>
          </div>
        }
      />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 16 }}
      >
        {/* CHAT */}
        <div
          className="panel"
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: 540,
            maxHeight: "calc(100vh - 220px)",
          }}
        >
          <div className="panel__h">
            <div className="panel__t">
              <Sparkles size={15} />
              <span>{t("chatTitle", { audit: audit?.code ?? "—" })}</span>
            </div>
            <span className="tag tag--brand">
              <Cpu size={11} /> {modelShort}
            </span>
          </div>

          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {messages.map((m, i) => (
              <ChatBubble
                key={i}
                m={m}
                userName={userName}
                aiName={t("aiName")}
                model={modelShort}
              />
            ))}
          </div>

          <div
            style={{
              padding: 12,
              borderTop: "1px solid var(--border-color)",
              background: "var(--bg-surface-2)",
            }}
          >
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              {presets.map(({ k, Icon }) => (
                <Button
                  key={k}
                  size="xs"
                  variant="soft"
                  icon={<Icon size={12} />}
                  disabled={busy}
                  onClick={() => send(t(k))}
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
                onKeyDown={onKey}
                disabled={busy}
                style={{ minHeight: 44, resize: "none", flex: 1 }}
              />
              <Button
                variant="primary"
                icon={<Send size={14} />}
                onClick={() => send(input)}
                disabled={busy || !input.trim()}
                style={{ padding: "10px 16px" }}
              >
                {busy ? t("sending") : t("send")}
              </Button>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 6,
                fontSize: 11,
                color: "var(--text-tertiary)",
              }}
            >
              <span>{t("contextNote", { tasks: audit?.tasks.total ?? 0, findings: fTotal })}</span>
              <span>{t("closedNote")}</span>
            </div>
          </div>
        </div>

        {/* SIDE */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Panel
            title={t("rbTitle")}
            icon={<FileText size={15} />}
            footer={
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Button
                  size="sm"
                  variant="soft"
                  icon={<RefreshCw size={13} className={regenerating ? "spin" : undefined} />}
                  onClick={() => void regenerate()}
                  disabled={regenerating}
                >
                  {regenerating ? t("rbRegenerating") : t("rbRegenerate")}
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  icon={<FileText size={13} />}
                  onClick={() => void downloadDocx()}
                  disabled={downloading}
                >
                  {downloading ? t("rbDownloading") : t("rbDownload")}
                </Button>
              </div>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {SECTIONS.map((s) => (
                <label
                  key={s.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 0",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={!!checked[s.key]}
                    onChange={(e) => setChecked((c) => ({ ...c, [s.key]: e.target.checked }))}
                  />
                  <span style={{ flex: 1, fontSize: 13.5, color: "var(--text-primary)" }}>
                    {t(s.i18n)}
                  </span>
                  {"ai" in s && s.ai ? (
                    <span className="tag tag--brand" style={{ fontSize: 10 }}>
                      {t("tagAi")}
                    </span>
                  ) : null}
                  {"required" in s && s.required ? (
                    <span className="tag tag--ghost" style={{ fontSize: 10 }}>
                      {t("tagRequired")}
                    </span>
                  ) : null}
                </label>
              ))}
            </div>
          </Panel>

          <Panel title={t("ptTitle")} icon={<Layers size={15} />} flush>
            {templates.map((pt, i) => (
              <button
                key={pt}
                type="button"
                className="navitem"
                onClick={() => setInput(t(pt))}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderBottom: i < templates.length - 1 ? "1px solid var(--border-color)" : "none",
                  borderRadius: 0,
                }}
              >
                <Sparkles size={14} style={{ color: "var(--brand)" }} />
                <span className="label">{t(pt)}</span>
                <ChevronRight
                  size={12}
                  style={{ marginLeft: "auto", color: "var(--text-tertiary)" }}
                />
              </button>
            ))}
          </Panel>
        </div>
      </div>

      {historyOpen ? (
        <ChatHistoryModal
          onClose={() => setHistoryOpen(false)}
          auditId={auditId}
          onPick={(id) => void loadConversation(id)}
        />
      ) : null}
    </div>
  );
}

function ChatBubble({
  m,
  userName,
  aiName,
  model,
}: {
  m: Msg;
  userName: string;
  aiName: string;
  model: string;
}) {
  if (m.role === "system") {
    return (
      <div
        style={{
          textAlign: "center",
          color: "var(--text-tertiary)",
          fontSize: 11.5,
          padding: "4px 0",
        }}
      >
        <span className="tag tag--ghost">
          <Cpu size={11} /> {m.text} · {m.time}
        </span>
      </div>
    );
  }
  const isAi = m.role === "ai";
  const bubble: React.CSSProperties = {
    padding: 14,
    background: m.error
      ? "var(--status-danger-bg)"
      : isAi
        ? "var(--brand-soft)"
        : "var(--bg-surface-2)",
    border: `1px solid ${m.error ? "var(--status-danger-fg)" : "var(--border-color)"}`,
    borderRadius: isAi ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
    fontSize: 13.5,
    color: m.error ? "var(--status-danger-fg)" : "var(--text-primary)",
    lineHeight: 1.65,
    whiteSpace: "pre-wrap",
  };
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: isAi ? "var(--brand)" : "var(--bg-surface-3)",
          color: isAi ? "white" : "var(--text-secondary)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {isAi ? <Sparkles size={14} /> : (userName[0] ?? "A")}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <strong style={{ fontSize: 13, color: "var(--text-primary)" }}>
            {isAi ? aiName : userName}
          </strong>
          <span className="cell-sub">{m.time}</span>
          {isAi ? (
            <span className="tag tag--brand" style={{ fontSize: 10 }}>
              {model}
            </span>
          ) : null}
        </div>
        {isAi && m.pending ? (
          <div style={bubble}>
            <span className="ai-typing">
              <i />
              <i />
              <i />
            </span>
          </div>
        ) : (
          <div style={bubble}>{m.text}</div>
        )}
      </div>
    </div>
  );
}
