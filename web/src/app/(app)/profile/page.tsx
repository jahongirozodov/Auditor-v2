import { requireSession } from "@/lib/session";
import { getProfileData } from "@/lib/data/profile";
import { ProfileScreen } from "@/components/profile/ProfileScreen";

export default async function ProfilePage() {
  const { userId } = await requireSession();
  const data = await getProfileData(userId);
  return <ProfileScreen data={data} />;
}

export const dynamic = "force-dynamic";
