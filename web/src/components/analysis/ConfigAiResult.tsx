"use client";

import { useTranslations } from "next-intl";
import { Sev } from "@/components/ui/Sev";
import type { ConfigAiAnalysis } from "@/lib/ai/prompts";

interface ConfigAiResultProps {
  analysis: ConfigAiAnalysis | null;
  loading: boolean;
  degraded: boolean;
}

/**
 * Renders the AI config analysis: a summary header plus one card per detected gap
 * (severity, line, risk / impact / remediation / optional fix command / refs).
 * Plain-text only — model output is never treated as HTML. Tokens/classes only.
 */
export function ConfigAiResult({ analysis, loading, degraded }: ConfigAiResultProps) {
  const t = useTranslations("config");

  if (loading) {
    return (
      <p className="ai-card__body" aria-live="polite">
        {t("aiAnalyzing")}
      </p>
    );
  }

  if (degraded) {
    return (
      <p className="ai-card__body" style={{ color: "var(--status-danger-fg)" }} role="alert">
        {t("aiUnreachable")}
      </p>
    );
  }

  if (!analysis) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="ai-card__body">
        <span className="stat__label" style={{ marginRight: 6 }}>
          {t("aiOverallRisk")}
        </span>
        <Sev level={analysis.overallRisk} />
        <span className="text-sm text-muted">{t("gapsDetected", { n: analysis.gaps.length })}</span>
      </div>

      {analysis.summary ? (
        <p className="ai-card__body" style={{ whiteSpace: "pre-wrap" }}>
          {analysis.summary}
        </p>
      ) : null}

      {analysis.gaps.length === 0 ? (
        <span className="text-sm text-muted">{t("noGaps")}</span>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {analysis.gaps.map((g, i) => (
            <div
              key={i}
              className="card"
              style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sev level={g.severity} />
                <strong style={{ color: "var(--text-primary)" }}>
                  {g.line > 0 ? `Satr ${g.line}: ` : ""}
                  {g.title}
                </strong>
              </div>

              {g.description ? <p className="ai-card__body">{g.description}</p> : null}
              {g.risk ? (
                <div className="ai-card__body">
                  <span className="stat__label" style={{ marginRight: 6 }}>
                    {t("aiRisk")}
                  </span>
                  {g.risk}
                </div>
              ) : null}
              {g.impact ? (
                <div className="ai-card__body">
                  <span className="stat__label" style={{ marginRight: 6 }}>
                    {t("aiImpact")}
                  </span>
                  {g.impact}
                </div>
              ) : null}
              <div className="ai-card__body">
                <span className="stat__label" style={{ marginRight: 6 }}>
                  {t("aiRemediation")}
                </span>
                {g.recommendation}
              </div>

              {g.command ? (
                <div>
                  <span className="stat__label" style={{ marginRight: 6 }}>
                    {t("aiCommand")}
                  </span>
                  <pre className="code-block" style={{ marginTop: 4, padding: 10 }}>
                    {g.command}
                  </pre>
                </div>
              ) : null}

              {g.refs && g.refs.length > 0 ? (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <span className="stat__label" style={{ marginRight: 6 }}>
                    {t("aiRefs")}
                  </span>
                  {g.refs.map((r, j) => (
                    <span key={j} className="tag">
                      {r}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
