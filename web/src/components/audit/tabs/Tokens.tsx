"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Tag, type TagTone } from "@/components/ui/Tag";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { IssueTokenModal } from "@/components/tokens/IssueTokenModal";
import type { Audit, AuditToken, TokenStatus, User } from "@/lib/types/entities";

const STATUS_TONE: Record<TokenStatus, TagTone> = {
  active: "success",
  expired: "warning",
  revoked: "danger",
};
const STATUS_LABEL: Record<TokenStatus, string> = {
  active: "Faol",
  expired: "Muddati tugagan",
  revoked: "Bekor qilingan",
};

export interface TokensTabProps {
  audit: Audit;
  tokens: AuditToken[];
  usersById: Record<string, User>;
  canIssue: boolean;
}

export function Tokens({ audit, tokens, usersById, canIssue }: TokensTabProps) {
  const t = useTranslations("auditDetail");
  const [open, setOpen] = useState(false);

  const userOf = (id: string): User =>
    usersById[id] ?? ({ id, name: id, avatar: "?", title: "", role: "t1", dept: "" } as User);

  return (
    <div>
      {canIssue ? (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={() => setOpen(true)}>
            {t("addToken")}
          </Button>
        </div>
      ) : null}

      <div className="tbl-wrap">
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t("thToken")}</th>
                <th>{t("thUser")}</th>
                <th>{t("thDevice")}</th>
                <th>{t("thExpires")}</th>
                <th>{t("thStatus")}</th>
                <th>{t("thLastUsed")}</th>
              </tr>
            </thead>
            <tbody>
              {tokens.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="cell-sub"
                    style={{ textAlign: "center", padding: "24px 0" }}
                  >
                    {t("emptyTokens")}
                  </td>
                </tr>
              ) : (
                tokens.map((tok) => {
                  const u = userOf(tok.user);
                  return (
                    <tr key={tok.id}>
                      <td className="cell-mono">{tok.id}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Avatar initials={u.avatar} name={u.name} />
                          <span className="cell-sub">{u.name}</span>
                        </div>
                      </td>
                      <td className="cell-sub">{tok.device}</td>
                      <td className="tabular cell-sub">{tok.expires}</td>
                      <td>
                        <Tag tone={STATUS_TONE[tok.status]}>{STATUS_LABEL[tok.status]}</Tag>
                      </td>
                      <td className="tabular cell-sub">{tok.lastUsed}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {canIssue ? (
        <IssueTokenModal
          open={open}
          onClose={() => setOpen(false)}
          audit={audit}
          usersById={usersById}
        />
      ) : null}
    </div>
  );
}
