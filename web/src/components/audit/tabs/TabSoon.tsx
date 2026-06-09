import { useTranslations } from "next-intl";

/** Placeholder body for audit-detail tabs not yet built (AI / Log). */
export function TabSoon() {
  const t = useTranslations("auditDetail");
  return (
    <div className="panel">
      <div className="panel__body" style={{ color: "var(--text-tertiary)" }}>
        {t("soon")}
      </div>
    </div>
  );
}
