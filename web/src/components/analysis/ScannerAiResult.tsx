"use client";

import { useTranslations } from "next-intl";
import { Sev } from "@/components/ui/Sev";
import type { ScannerNormalization } from "@/lib/analysis/scanner";

interface ScannerAiResultProps {
  analysis: ScannerNormalization | null;
  loading: boolean;
  degraded: boolean;
}

/**
 * Renders the AI normalization of a scan: a summary + original→normalized count
 * (the dedup win) + one card per normalized finding (severity, host:port, plain
 * description, remediation, CVE tags, merge badge). Falls back to the static promo
 * copy when no analysis is present yet. Plain-text only; tokens/classes only.
 */
export function ScannerAiResult({ analysis, loading, degraded }: ScannerAiResultProps) {
  const t = useTranslations("scanner");

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

  if (!analysis) {
    return <p className="ai-card__body">{t("aiBody")}</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="ai-card__body">
        <Sev level={analysis.overallRisk} />
        <span className="text-sm text-muted">
          {t("aiNormalized", { from: analysis.originalCount, to: analysis.normalizedCount })}
        </span>
      </div>

      {analysis.summary ? (
        <p className="ai-card__body" style={{ whiteSpace: "pre-wrap" }}>
          {analysis.summary}
        </p>
      ) : null}
      {analysis.note ? <p className="text-sm text-muted">{analysis.note}</p> : null}

      {analysis.findings.length === 0 ? (
        <span className="text-sm text-muted">{t("noFindings")}</span>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {analysis.findings.map((f, i) => (
            <div
              key={i}
              className="card"
              style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Sev level={f.severity} />
                <strong style={{ color: "var(--text-primary)" }}>{f.title}</strong>
                {f.mergedCount && f.mergedCount > 1 ? (
                  <span className="tag tag--ghost">{t("aiMerged", { n: f.mergedCount })}</span>
                ) : null}
              </div>

              {f.host ? (
                <div className="cell-sub font-mono">
                  {f.host}
                  {f.port ? `:${f.port}` : ""}
                </div>
              ) : null}
              {f.description ? <p className="ai-card__body">{f.description}</p> : null}
              {f.remediation ? (
                <div className="ai-card__body">
                  <span className="stat__label" style={{ marginRight: 6 }}>
                    {t("aiRemediation")}
                  </span>
                  {f.remediation}
                </div>
              ) : null}
              {f.cve && f.cve.length > 0 ? (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {f.cve.map((c, j) => (
                    <span key={j} className="tag">
                      {c}
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
