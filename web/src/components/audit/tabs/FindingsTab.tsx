"use client";

import { useState } from "react";
import { FindingsList } from "@/components/findings/FindingsList";
import { FindingDrawer } from "@/components/findings/FindingDrawer";
import { FINDINGS, TASKS, USERS, findingsByAudit } from "@/lib/fixtures";
import type { Audit } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

const usersById = Object.fromEntries(USERS.map((u) => [u.id, u]));

export function FindingsTab({ a, role }: { a: Audit; role: RoleCode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const list = findingsByAudit(a.id);
  const selected = FINDINGS.find((f) => f.id === openId) ?? null;

  return (
    <>
      <FindingsList findings={list} usersById={usersById} onOpen={setOpenId} />
      <FindingDrawer
        finding={selected}
        approval={null}
        remediation={[]}
        evidences={[]}
        tasks={TASKS}
        usersById={usersById}
        userId=""
        role={role}
        onClose={() => setOpenId(null)}
      />
    </>
  );
}
