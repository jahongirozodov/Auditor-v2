"use client";

import { useTranslations } from "next-intl";
import { Sev } from "@/components/ui/Sev";
import type { TrafficAiAnalysis } from "@/lib/ai/prompts";

interface TrafficAiResultProps {
  analysis: TrafficAiAnalysis | null;
  loading: boolean;
  degraded: boolean;
}

/**
 * Renders the AI traffic analysis: a summary header + one card per anomaly
 * (severity, src/dst, risk / impact / recommendation). Plain-text only — model
 * output is never treated as HTML. Tokens/classes only. Mirrors ConfigAiResult.
 */
export function TrafficAiResult({ analysis, loading, degraded }: TrafficAiResultProps) {
  const t = useTranslations("traffic");

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
      </div>

      {analysis.summary ? (
        <p className="ai-card__body" style={{ whiteSpace: "pre-wrap" }}>
          {analysis.summary}
        </p>
      ) : null}

      {analysis.anomalies.length === 0 ? (
        <span className="text-sm text-muted">{t("aiNoAnomalies")}</span>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {analysis.anomalies.map((a, i) => (
            <div
              key={i}
              className="card"
              style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Sev level={a.severity} />
                <strong style={{ color: "var(--text-primary)" }}>{a.title}</strong>
                {a.attackType && a.attackType !== "other" ? (
                  <span className="tag tag--danger" style={{ textTransform: "uppercase", fontSize: 10 }}>
                    {a.attackType}
                  </span>
                ) : null}
                {a.confidence ? (
                  <span className="tag tag--ghost" style={{ fontSize: 10 }}>
                    {t("aiConfidence")}: {a.confidence}
                  </span>
                ) : null}
                {a.srcIp ? <span className="tag tag--outline font-mono">{a.srcIp}</span> : null}
                {a.dstIpPort ? (
                  <span className="tag tag--outline font-mono">{a.dstIpPort}</span>
                ) : null}
              </div>

              {a.affectedHosts && a.affectedHosts.length > 0 ? (
                <div className="ai-card__body">
                  <span className="stat__label" style={{ marginRight: 6 }}>
                    {t("aiAffected")}
                  </span>
                  <span className="font-mono" style={{ fontSize: 12 }}>
                    {a.affectedHosts.join(", ")}
                  </span>
                </div>
              ) : null}

              {a.risk ? (
                <div className="ai-card__body">
                  <span className="stat__label" style={{ marginRight: 6 }}>
                    {t("aiRisk")}
                  </span>
                  {a.risk}
                </div>
              ) : null}
              {a.impact ? (
                <div className="ai-card__body">
                  <span className="stat__label" style={{ marginRight: 6 }}>
                    {t("aiImpact")}
                  </span>
                  {a.impact}
                </div>
              ) : null}
              {a.recommendation ? (
                <div className="ai-card__body">
                  <span className="stat__label" style={{ marginRight: 6 }}>
                    {t("aiRemediation")}
                  </span>
                  {a.recommendation}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {analysis.recommendations.length > 0 ? (
        <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
          {analysis.recommendations.map((r, i) => (
            <li key={i} className="ai-card__body">
              {r}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
