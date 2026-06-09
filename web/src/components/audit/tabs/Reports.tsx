import { useTranslations } from "next-intl";
import { Download, Eye, FileText } from "lucide-react";
import { Tag } from "@/components/ui/Tag";
import { REPORTS } from "@/lib/fixtures";
import type { Audit } from "@/lib/types/entities";

export function Reports({ a }: { a: Audit }) {
  const t = useTranslations("auditDetail");
  const reports = REPORTS.filter((r) => r.audit === a.id);

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
              <Tag tone={r.status === "approved" ? "success" : "warning"}>
                {r.status === "approved" ? "Tasdiqlangan" : "Qoralama"}
              </Tag>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="btn btn--ghost btn--sm">
                <Eye size={13} />
                <span>{t("preview")}</span>
              </button>
              <button type="button" className="btn btn--secondary btn--sm">
                <Download size={13} />
                <span>{t("download")}</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
