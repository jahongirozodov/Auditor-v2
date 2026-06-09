import { useTranslations } from "next-intl";
import { PageHeader, type Crumb } from "./PageHeader";

/** Placeholder for routes whose detail screen ships in a later increment. */
export function ComingSoon({ crumbs, title }: { crumbs?: Crumb[]; title?: string }) {
  const t = useTranslations("common");
  return (
    <div className="route-anim">
      <PageHeader crumbs={crumbs} title={title ?? t("soon")} sub={t("soonSub")} />
    </div>
  );
}
