import { CountUp } from "@/components/ui/CountUp";
import { Avatar } from "@/components/ui/Avatar";
import type { KpiUser, User } from "@/lib/types/entities";

/** Top-3 KPI leaderboard podium (visual order 2 · 1 · 3; ported from wow.jsx). */
export function Podium({
  users,
  usersById,
}: {
  users: KpiUser[];
  usersById: Record<string, User>;
}) {
  const top = users.slice(0, 3);
  const order = [top[1], top[0], top[2]].filter(Boolean);
  const maxTotal = Math.max(...top.map((t) => t.total), 1);

  return (
    <div className="podium">
      {order.map((k) => {
        const rank = k === top[0] ? 1 : k === top[1] ? 2 : 3;
        const u = usersById[k.user] ?? { avatar: "?", name: k.user };
        const barH = 30 + (k.total / maxTotal) * 64;
        return (
          <div key={k.user} className={`podium__col podium__col--${rank}`}>
            <div className={`podium__medal podium__medal--${rank}`}>{rank}</div>
            <Avatar initials={u.avatar} name={u.name} size={rank === 1 ? "lg" : "md"} />
            <div className="podium__name">{u.name}</div>
            <div className="podium__sub">
              {k.audits} audit · {k.findings} finding
            </div>
            <div className="podium__score">
              <CountUp value={k.total} />
            </div>
            <div className="podium__bar" style={{ height: barH }} />
          </div>
        );
      })}
    </div>
  );
}
