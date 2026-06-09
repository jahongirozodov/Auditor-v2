import { requireSession } from "@/lib/session";
import { ComingSoon } from "@/components/ui/ComingSoon";

// Placeholder — Users screen ships in a later increment.
export default async function UsersPage() {
  await requireSession();
  return (
    <ComingSoon
      crumbs={[{ label: "Boshqaruv paneli", href: "/dashboard" }, { label: "Foydalanuvchilar" }]}
      title="Foydalanuvchilar"
    />
  );
}
