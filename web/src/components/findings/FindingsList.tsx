"use client";

import { useTranslations } from "next-intl";
import { Paperclip } from "lucide-react";
import { Sev } from "@/components/ui/Sev";
import { FindingStatusTag } from "@/components/ui/StatusTag";
import { Avatar } from "@/components/ui/Avatar";
import type { Finding, User } from "@/lib/types/entities";

/** Findings table (ported from FindingsList). Row click opens the drawer. */
export function FindingsList({
  findings,
  usersById,
  onOpen,
}: {
  findings: Finding[];
  usersById: Record<string, User>;
  onOpen: (id: string) => void;
}) {
  const t = useTranslations("findings");
  const pick = (id: string): Pick<User, "avatar" | "name"> =>
    usersById[id] ?? { avatar: "?", name: id };
  return (
    <div className="tbl-wrap">
      <div className="tbl-scroll">
        <table className="tbl">
          <thead>
            <tr>
              <th />
              <th>{t("thFinding")}</th>
              <th>{t("thAsset")}</th>
              <th>{t("thCvss")}</th>
              <th>{t("thStatus")}</th>
              <th>{t("thEvidence")}</th>
              <th>{t("thAuditor")}</th>
              <th>{t("thDate")}</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((f) => {
              const u = pick(f.reportedBy);
              return (
                <tr key={f.id} onClick={() => onOpen(f.id)} style={{ cursor: "pointer" }}>
                  <td>
                    <Sev level={f.severity} />
                  </td>
                  <td>
                    <div className="text-primary font-semi">{f.title}</div>
                    <div className="cell-sub">
                      <span className="font-mono">{f.id}</span> · {f.cwe}
                      {f.ai ? (
                        <span style={{ marginLeft: 8, color: "var(--brand)", fontWeight: 600 }}>
                          ✦ AI
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="cell-mono" style={{ fontSize: 12 }}>
                    {f.asset}
                  </td>
                  <td className="tabular font-bold text-primary">{f.cvss}</td>
                  <td>
                    <FindingStatusTag status={f.status} />
                  </td>
                  <td>
                    <span
                      className="cell-sub"
                      style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      <Paperclip size={12} />
                      {f.evidence}
                    </span>
                  </td>
                  <td>
                    <Avatar initials={u.avatar} name={u.name} />
                  </td>
                  <td className="tabular cell-sub">{f.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
