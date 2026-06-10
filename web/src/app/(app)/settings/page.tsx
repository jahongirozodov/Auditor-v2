import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { requireAnyPermission } from "@/lib/rbac.server";
import { getSystemSettings, getCustomRoles, getKpiRules } from "@/lib/data/settings";
import { SettingsScreen } from "@/components/settings/SettingsScreen";

export default async function SettingsPage() {
  const { userId } = await requireSession();
  if (!(await requireAnyPermission(userId, ["system.settings", "role.manage"])))
    redirect("/dashboard");

  const [settings, customRoles, kpiRules] = await Promise.all([
    getSystemSettings(),
    getCustomRoles(),
    getKpiRules(),
  ]);

  return <SettingsScreen settings={settings} customRoles={customRoles} kpiRules={kpiRules} />;
}
