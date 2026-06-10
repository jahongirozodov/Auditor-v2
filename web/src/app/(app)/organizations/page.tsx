import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getActiveAuditCount, getOrgDetails, getOrgs } from "@/lib/data/orgs";
import { OrgsScreen } from "@/components/organizations/OrgsScreen";
import { requireAnyPermission } from "@/lib/rbac.server";

export default async function OrganizationsPage() {
  const { userId } = await requireSession();
  const [orgs, orgDetails, activeAuditCount, canView, canEdit] = await Promise.all([
    getOrgs(),
    getOrgDetails(),
    getActiveAuditCount(),
    requireAnyPermission(userId, ["org.view_all", "org.view_own", "org.create", "org.update"]),
    requireAnyPermission(userId, ["org.create", "org.update", "org.delete"]),
  ]);
  if (!canView) redirect("/dashboard");
  return (
    <OrgsScreen
      orgs={orgs}
      orgDetails={orgDetails}
      activeAuditCount={activeAuditCount}
      canEdit={canEdit}
    />
  );
}
