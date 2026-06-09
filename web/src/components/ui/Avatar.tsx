export type AvatarSize = "md" | "lg" | "xl";

const SIZE_CLASS: Record<AvatarSize, string> = { md: "", lg: "avatar--lg", xl: "avatar--xl" };

/** Initials avatar over the `.avatar` classes. */
export function Avatar({
  initials,
  name,
  size = "md",
  className,
}: {
  initials: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}) {
  const classes = ["avatar", SIZE_CLASS[size], className].filter(Boolean).join(" ");
  return (
    <span className={classes} title={name}>
      {initials}
    </span>
  );
}
