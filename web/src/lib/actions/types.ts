/** Shared return shape for mutation Server Actions (plain module — not "use server"). */
export interface ActionResult {
  ok: boolean;
  /** Machine-readable failure reason (forbidden | illegal_transition | comment_required | …). */
  error?: string;
}

/** Return shape for create actions — carries the new entity id on success. */
export interface CreateResult {
  ok: boolean;
  id?: string;
  error?: string;
}
