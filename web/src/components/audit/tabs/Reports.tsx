import { useTranslations } from "next-intl";
import { Download, Eye, FileText } from "lucide-react";
import { Tag } from "@/components/ui/Tag";
import type { Report } from "@/lib/types/entities";

const STATUS_TONE: Record<string, "success" | "warning" | "info" | "danger"> = {
  approved: "success",
  review: "info",
  returned: "danger",
  draft: "warning",
};
const STATUS_LABEL: Record<string, string> = {
  approved: "Tasdiqlangan",
  review: "Tekshiruvda",
  returned: "Qaytarilgan",
  draft: "Qoralama",
};

export function Reports({ reports }: { reports: Report[] }) {
  const t = useTranslations("auditDetail");

  if (reports.length === 0) {
    return (
      <p className="text-sm text-muted" style={{ padding: "24px 0", textAlign: "center" }}>
        {t("reportsEmpty")}
      </p>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
      {reports.map((r) => (
        <div key={r.id} className="card card--hover">
          <div className="card__pad">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span className="stat__icon">
                <FileText size={15} />
              </span>
              <div>
                <div className="text-primary font-semi">{r.title}</div>
                <div className="cell-sub">{r.type}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {r.format.map((f) => (
                <Tag key={f} tone="ghost">
                  {f}
                </Tag>
              ))}
              <Tag tone={STATUS_TONE[r.status] ?? "warning"}>
                {STATUS_LABEL[r.status] ?? r.status}
              </Tag>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a
                className="btn btn--ghost btn--sm"
                href={`/print/reports/${r.id}`}
                target="_blank"
                rel="noopener"
              >
                <Eye size={13} />
                <span>{t("preview")}</span>
              </a>
              <a
                className="btn btn--secondary btn--sm"
                href={`/print/reports/${r.id}`}
                target="_blank"
                rel="noopener"
              >
                <Download size={13} />
                <span>{t("download")}</span>
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
