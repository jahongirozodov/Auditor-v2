import { requireSession } from "@/lib/session";
import { getActiveAuditCount, getOrgDetails, getOrgs } from "@/lib/data/orgs";
import { OrgsScreen } from "@/components/organizations/OrgsScreen";

export default async function OrganizationsPage() {
  await requireSession();
  const [orgs, orgDetails, activeAuditCount] = await Promise.all([
    getOrgs(),
    getOrgDetails(),
    getActiveAuditCount(),
  ]);
  return <OrgsScreen orgs={orgs} orgDetails={orgDetails} activeAuditCount={activeAuditCount} />;
}
