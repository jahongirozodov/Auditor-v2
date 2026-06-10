"use client";

import { useState, useTransition, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Download, FileText, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ReportGenerateModal } from "./ReportGenerateModal";
import { deleteReport } from "@/lib/actions/reports";
import type { Report, Audit } from "@/lib/types/entities";

const STATUS_TAG: Record<string, string> = {
  draft:    "tag--warning",
  review:   "tag--info",
  approved: "tag--success",
};
const STATUS_LABEL: Record<string, string> = {
  draft:    "Qoralama",
  review:   "Tekshiruvda",
  approved: "Tasdiqlangan",
};

interface Props {
  reports: Report[];
  audits: Audit[];
  usersById: Record<string, { name: string; avatar: string }>;
}

export function ReportsScreen({ reports, audits, usersById }: Props) {
  const t    = useTranslations("reports");
  const tNav = useTranslations("nav");
  const toast  = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query,  setQuery]  = useState("");
  const [modal,  setModal]  = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q
      ? reports.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.audit.toLowerCase().includes(q) ||
            r.type.toLowerCase().includes(q),
        )
      : reports;
  }, [reports, query]);

  const draftCount    = reports.filter((r) => r.status === "draft").length;
  const approvedCount = reports.filter((r) => r.status === "approved").length;

  function remove(r: Report) {
    if (!confirm(t("deleteConfirm", { title: r.title }))) return;
    startTransition(async () => {
      await deleteReport(r.id);
      toast(t("deleted"), "warning");
      router.refresh();
    });
  }

  function download(r: Report) {
    toast(t("downloading", { title: r.title, format: r.format[0] ?? "PDF" }), "success");
  }

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[{ label: tNav("dashboard"), href: "/dashboard" }, { label: t("crumb") }]}
        title={t("title")}
        sub={t("sub", { total: reports.length, drafts: draftCount, approved: approvedCount })}
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="input-group" style={{ width: 240 }}>
              <Search className="icon-l" size={14} />
              <input className="input" placeholder={t("searchPlaceholder")}
                value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Button size="sm" variant="primary" icon={<Plus size={14} />}
              onClick={() => setModal(true)}>
              {t("generate")}
            </Button>
          </div>
        }
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted" style={{ padding: "32px 0", textAlign: "center" }}>
          {t("empty")}
        </p>
      ) : (
        <div className="grid"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {filtered.map((r) => {
            const author = usersById[r.author];
            return (
              <div key={r.id} className="card card--hover">
                {/* Top */}
                <div style={{ padding: "16px 18px 12px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                  {/* File icon */}
                  <div style={{
                    width: 48, height: 56, flexShrink: 0,
                    background: "linear-gradient(180deg, var(--bg-surface) 0%, var(--brand-soft) 100%)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px 6px 6px 14px",
                    display: "grid", placeItems: "center",
                    color: "var(--brand)", position: "relative",
                  }}>
                    <FileText size={20} />
                    <span className="font-mono" style={{
                      position: "absolute", bottom: 4,
                      fontSize: 8, fontWeight: 700, color: "var(--brand)",
                    }}>
                      {r.format[0]}
                    </span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4 }}>
                      {r.title}
                    </div>
                    <div className="cell-sub" style={{ marginTop: 4 }}>{r.type}</div>
                  </div>

                  {/* Actions row */}
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button className="btn btn--ghost btn--xs btn--icon"
                      title={t("download")} onClick={() => download(r)}>
                      <Download size={13} />
                    </button>
                    <button className="btn btn--ghost btn--xs btn--icon"
                      title={t("aiRegenerate")}
                      onClick={() => toast(t("aiStarted"), "info")}>
                      <Sparkles size={13} />
                    </button>
                    <button className="btn btn--ghost btn--xs btn--icon btn--danger-hover"
                      title={t("delete")} onClick={() => remove(r)} disabled={pending}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Middle — audit code + format tags */}
                <div style={{ padding: "0 18px 12px", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <span className="font-mono cell-sub">{r.audit}</span>
                  {r.format.map((f) => (
                    <span key={f} className="tag tag--outline">{f}</span>
                  ))}
                </div>

                {/* Bottom */}
                <div style={{
                  padding: "12px 18px",
                  borderTop: "1px solid var(--border-color)",
                  background: "var(--bg-surface-2)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {author && (
                      <Avatar initials={author.avatar} name={author.name} />
                    )}
                    <div>
                      <div className="cell-sub" style={{ fontSize: 11 }}>
                        {r.generated === "—" ? t("notGenerated") : r.generated}
                      </div>
                      <div className="cell-sub" style={{ fontSize: 11 }}>{r.size}</div>
                    </div>
                  </div>
                  <span className={`tag ${STATUS_TAG[r.status] ?? "tag--outline"}`}>
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ReportGenerateModal
        open={modal}
        onClose={() => { setModal(false); router.refresh(); }}
        audits={audits}
      />
    </div>
  );
}
