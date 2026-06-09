import { Fragment, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

/** Page title block with breadcrumbs + actions over the `.pageh` classes. */
export function PageHeader({
  crumbs,
  title,
  sub,
  actions,
}: {
  crumbs?: Crumb[];
  title: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="pageh">
      <div className="pageh__title">
        {crumbs && crumbs.length > 0 ? (
          <div className="pageh__crumbs">
            {crumbs.map((c, i) => (
              <Fragment key={i}>
                {i > 0 ? <ChevronRight size={12} /> : null}
                {c.href ? <a href={c.href}>{c.label}</a> : <span>{c.label}</span>}
              </Fragment>
            ))}
          </div>
        ) : null}
        <h1>{title}</h1>
        {sub ? <p className="pageh__sub">{sub}</p> : null}
      </div>
      {actions ? <div className="pageh__actions">{actions}</div> : null}
    </div>
  );
}
