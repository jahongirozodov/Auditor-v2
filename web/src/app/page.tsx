import { redirect } from "next/navigation";

// Canonical home is /dashboard (the (app) group). Unauthenticated users are sent
// to /login by the proxy + requireSession().
export default function RootPage() {
  redirect("/dashboard");
}
