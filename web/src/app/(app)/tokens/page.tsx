import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { requireAnyPermission } from "@/lib/rbac.server";
import { getAllTokens } from "@/lib/data/tokens";
import { getUsers, getUsersById } from "@/lib/data/users";
import { getAudits } from "@/lib/data/audits";
import { TokensScreen } from "@/components/tokens/TokensScreen";

export default async function TokensPage() {
  const { userId } = await requireSession();
  if (!(await requireAnyPermission(userId, ["agent.token", "agent.revoke"])))
    redirect("/dashboard");

  const [tokens, usersById, users, audits] = await Promise.all([
    getAllTokens(),
    getUsersById(),
    getUsers(),
    getAudits(),
  ]);

  return <TokensScreen tokens={tokens} usersById={usersById} users={users} audits={audits} />;
}

export const dynamic = "force-dynamic";
