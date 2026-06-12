import { requireSession } from "@/lib/session";
import { getAppeals } from "@/lib/data/appeals";
import { getUsersById } from "@/lib/data/users";
import { AppealsScreen } from "@/components/appeals/AppealsScreen";

export default async function AppealsPage() {
  const { userId, role } = await requireSession();
  const [appeals, usersById] = await Promise.all([getAppeals(userId, role), getUsersById()]);
  return <AppealsScreen appeals={appeals} usersById={usersById} userId={userId} role={role} />;
}
