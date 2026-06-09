import { getTranslations } from "next-intl/server";
import { ComingSoon } from "@/components/ui/ComingSoon";

// Sibling of the config analysis tab — full build lands in a later increment.
export default async function ScannerPage() {
  const t = await getTranslations("nav");
  return (
    <ComingSoon
      crumbs={[{ label: t("dashboard"), href: "/dashboard" }, { label: t("scanner") }]}
      title={t("scanner")}
    />
  );
}
