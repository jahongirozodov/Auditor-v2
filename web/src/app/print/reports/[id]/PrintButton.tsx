"use client";

import { useTranslations } from "next-intl";
import { Printer } from "lucide-react";

/** Tiny client island: triggers the browser print dialog for the report page. */
export function PrintButton() {
  const t = useTranslations("print");
  return (
    <button className="btn btn--primary btn--sm" onClick={() => window.print()}>
      <Printer size={14} />
      {t("print")}
    </button>
  );
}
