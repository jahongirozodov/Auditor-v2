import { requireSession } from "@/lib/session";
import { getAuditsByOrg } from "@/lib/data/audits";
import { getOrgById, getOrgDetail } from "@/lib/data/orgs";
import { OrgDetailScreen } from "@/components/organizations/OrgDetailScreen";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;
  const [org, det, orgAudits] = await Promise.all([
    getOrgById(id),
    getOrgDetail(id),
    getAuditsByOrg(id),
  ]);
  return <OrgDetailScreen org={org} det={det} orgAudits={orgAudits} />;
}
