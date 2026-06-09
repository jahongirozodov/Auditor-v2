import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginScreen } from "./LoginScreen";

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");
  return <LoginScreen />;
}
