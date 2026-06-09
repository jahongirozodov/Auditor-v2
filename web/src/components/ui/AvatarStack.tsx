import { Avatar } from "./Avatar";

export interface StackItem {
  initials: string;
  name?: string;
}

/** Overlapping avatars with a `+N` overflow chip. */
export function AvatarStack({ items, max = 4 }: { items: StackItem[]; max?: number }) {
  const shown = items.slice(0, max);
  const more = items.length - shown.length;
  return (
    <div className="av-stack">
      {shown.map((u, i) => (
        <Avatar key={i} initials={u.initials} name={u.name} />
      ))}
      {more > 0 ? (
        <span
          className="avatar"
          style={{ background: "var(--bg-surface-3)", color: "var(--text-secondary)" }}
        >
          +{more}
        </span>
      ) : null}
    </div>
  );
}
