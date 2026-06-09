import { useTranslations } from "next-intl";
import { Tag, type TagTone } from "@/components/ui/Tag";
import { Avatar } from "@/components/ui/Avatar";
import { TOKENS, userById } from "@/lib/fixtures";
import type { Audit, TokenStatus } from "@/lib/types/entities";

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

export function Tokens({ a }: { a: Audit }) {
  const t = useTranslations("auditDetail");
  const tokens = TOKENS.filter((x) => x.audit === a.id);

  return (
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
            {tokens.map((tok) => {
              const u = userById(tok.user);
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
