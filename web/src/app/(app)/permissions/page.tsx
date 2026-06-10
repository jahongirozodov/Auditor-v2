import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getPermissionMatrixSnapshot } from "@/lib/rbac.server";
import { PermissionsScreen } from "@/components/permissions/PermissionsScreen";

// Super-only — the RBAC matrix viewer (mirrors the nav allowlist roles:["super"]).
export default async function PermissionsPage() {
  const { role } = await requireSession();
  if (role !== "super") redirect("/dashboard");
  const matrix = await getPermissionMatrixSnapshot();
  return <PermissionsScreen matrix={matrix} />;
}
