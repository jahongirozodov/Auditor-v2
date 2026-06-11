import { requireSession } from "@/lib/session";
import { listNotifications } from "@/lib/data/notifications";
import { NotificationsScreen } from "@/components/notifications/NotificationsScreen";

export default async function NotificationsPage() {
  const { userId } = await requireSession();
  const items = await listNotifications(userId);
  return <NotificationsScreen items={items} />;
}
