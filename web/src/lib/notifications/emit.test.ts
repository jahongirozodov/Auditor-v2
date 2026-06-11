import { describe, it, expect, vi } from "vitest";
import { emitNotification } from "./emit";

function fakeTx(notifEnabled = true) {
  const created: unknown[] = [];
  return {
    created,
    systemSetting: {
      findUnique: vi.fn().mockResolvedValue({
        value: { notif: { nCritical: notifEnabled, nAssign: notifEnabled } },
      }),
    },
    notification: {
      createMany: vi.fn(async ({ data }: { data: unknown[] }) => {
        created.push(...data);
        return { count: data.length };
      }),
    },
  } as any;
}

describe("emitNotification", () => {
  it("fans out one row per recipient and drops the actor", async () => {
    const tx = fakeTx();
    await emitNotification(tx, {
      type: "task_review",
      recipients: ["u1", "u2", "actor"],
      actorId: "actor",
      params: { title: "X" },
      href: "/tasks/1",
    });
    expect(tx.created).toHaveLength(2);
    expect(tx.created.map((r: any) => r.userId).sort()).toEqual(["u1", "u2"]);
  });

  it("dedupes repeated recipients", async () => {
    const tx = fakeTx();
    await emitNotification(tx, {
      type: "task_review",
      recipients: ["u1", "u1"],
      actorId: "actor",
      params: {},
      href: null,
    });
    expect(tx.created).toHaveLength(1);
  });

  it("suppresses a gated type when its toggle is off", async () => {
    const tx = fakeTx(false);
    await emitNotification(tx, {
      type: "finding_critical",
      recipients: ["u1"],
      actorId: "actor",
      params: {},
      href: null,
    });
    expect(tx.notification.createMany).not.toHaveBeenCalled();
  });

  it("always fires an ungated type regardless of settings", async () => {
    const tx = fakeTx(false);
    await emitNotification(tx, {
      type: "task_returned",
      recipients: ["u1"],
      actorId: "actor",
      params: {},
      href: null,
    });
    expect(tx.created).toHaveLength(1);
  });

  it("no-ops when recipient list is empty after filtering", async () => {
    const tx = fakeTx();
    await emitNotification(tx, {
      type: "task_review",
      recipients: ["actor"],
      actorId: "actor",
      params: {},
      href: null,
    });
    expect(tx.notification.createMany).not.toHaveBeenCalled();
  });
});
