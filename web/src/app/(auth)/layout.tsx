// Bare auth shell — no sidebar/topbar chrome. The .login screen fills it.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="app--noshell">{children}</div>;
}
