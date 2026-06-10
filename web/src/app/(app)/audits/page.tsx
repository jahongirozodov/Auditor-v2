import { requireSession } from "@/lib/session";
import { getAudits } from "@/lib/data/audits";
import { getOrgs } from "@/lib/data/orgs";
import { getUsers, getUsersById } from "@/lib/data/users";
import { requirePermission } from "@/lib/rbac.server";
import { AuditsListScreen } from "@/components/audits/AuditsListScreen";

const ELIGIBLE = ["chief", "lead", "t1"];

export default async function AuditsPage() {
  const { userId } = await requireSession();
  const [audits, orgs, usersById, users, canCreate] = await Promise.all([
    getAudits(),
    getOrgs(),
    getUsersById(),
    getUsers(),
    requirePermission(userId, "audit.create"),
  ]);
  const orgsById = Object.fromEntries(orgs.map((o) => [o.id, o]));
  const eligibleUsers = users.filter((u) => ELIGIBLE.includes(u.role));

  return (
    <AuditsListScreen
      audits={audits}
      orgsById={orgsById}
      usersById={usersById}
      orgs={orgs}
      eligibleUsers={eligibleUsers}
      canCreate={canCreate}
    />
  );
}
