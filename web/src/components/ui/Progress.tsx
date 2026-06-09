export type ProgressTone = "brand" | "success" | "warning" | "danger";

/** Thin progress bar over the `.progress` classes. */
export function Progress({
  value,
  tone = "brand",
  className,
}: {
  value: number;
  tone?: ProgressTone;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const classes = ["progress", tone === "brand" ? "" : `progress--${tone}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <div
      className={classes}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}
