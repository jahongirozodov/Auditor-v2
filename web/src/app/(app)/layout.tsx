import { requireSession } from "@/lib/session";
import { getUserById } from "@/lib/data/users";
import { AppShell } from "@/components/chrome/AppShell";

// Secure boundary for the authenticated app — the proxy guard is optimistic, this
// (requireSession) is the real check (docs/08-security.md).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId, role } = await requireSession();
  const u = await getUserById(userId);

  return (
    <AppShell user={{ id: u.id, name: u.name, title: u.title, avatar: u.avatar, role }}>
      {children}
    </AppShell>
  );
}
