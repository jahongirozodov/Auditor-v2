import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import { getReportById } from "@/lib/data/reports";
import { getAuditById } from "@/lib/data/audits";
import { getFindingsByAudit } from "@/lib/data/findings";
import { getUsersById } from "@/lib/data/users";
import { PrintButton } from "./PrintButton";
import styles from "./print.module.css";

export const dynamic = "force-dynamic";

const STATUS_LABEL_KEY: Record<string, string> = {
  draft: "statusDraft",
  review: "statusReview",
  approved: "statusApproved",
  returned: "statusReturned",
};

export default async function ReportPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "report.export"))) notFound();

  const { id } = await params;
  const report = await getReportById(id);
  if (!report) notFound();

  const [audit, findings, usersById, t, tReports] = await Promise.all([
    getAuditById(report.audit),
    getFindingsByAudit(report.audit),
    getUsersById(),
    getTranslations("print"),
    getTranslations("reports"),
  ]);

  const author = usersById[report.author];
  const statusLabel = STATUS_LABEL_KEY[report.status]
    ? tReports(STATUS_LABEL_KEY[report.status])
    : report.status;

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <PrintButton />
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>{report.title}</h1>
        <div className={styles.subtitle}>
          {audit ? `${audit.code} — ${audit.title}` : t("subtitle")}
        </div>
      </header>

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>{t("audit")}</span>
          <span>{audit?.code ?? report.audit}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>{t("type")}</span>
          <span>{report.type}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>{t("author")}</span>
          <span>{author?.name ?? report.author}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>{t("generated")}</span>
          <span>{report.generated}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>{t("status")}</span>
          <span>{statusLabel}</span>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("executiveSummary")}</h2>
        {report.summary ? (
          <p className={styles.summary}>{report.summary}</p>
        ) : (
          <p className={styles.muted}>{t("noSummary")}</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          {t("findings")} ({findings.length})
        </h2>
        {findings.length ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("thFinding")}</th>
                <th>{t("thSeverity")}</th>
                <th>{t("thStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f) => (
                <tr key={f.id}>
                  <td>{f.title}</td>
                  <td>{f.severity}</td>
                  <td>{f.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.muted}>{t("noFindings")}</p>
        )}
      </section>

      <footer className={styles.footer}>{t("confidential")}</footer>
    </div>
  );
}
