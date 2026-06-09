import { useTranslations } from "next-intl";
import { Folder } from "lucide-react";
import { tasksByAudit } from "@/lib/fixtures";
import type { Audit } from "@/lib/types/entities";

const NAMES = [
  "config-dump.txt",
  "screenshot.png",
  "scan-output.csv",
  "capture.pcap",
  "report.docx",
];
const SIZES = ["4 KB", "1.2 MB", "18 KB", "3.4 MB", "220 KB"];

export function Files({ a }: { a: Audit }) {
  const t = useTranslations("auditDetail");
  const count = tasksByAudit(a.id).reduce((s, x) => s + x.files, 0);

  return (
    <section className="panel">
      <div className="panel__h">
        <div className="panel__t">
          <Folder size={15} />
          <span>
            {t("evidenceTitle")} ({count})
          </span>
        </div>
      </div>
      <div className="panel__body">
        <div className="tile-grid">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="tile">
              <div className={`tile__thumb${i % 3 === 1 ? " tile__thumb--code" : ""}`} />
              <div className="tile__body">
                <div className="tile__name font-mono">{NAMES[i % 5]}</div>
                <div className="tile__meta">{SIZES[i % 5]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
