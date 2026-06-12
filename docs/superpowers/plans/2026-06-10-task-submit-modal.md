# Task Submit Modal + Findings Lock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When submitting a task for review, show a modal with a mandatory comment and optional file uploads (max 5 files × 20 MB); hide the "Add finding" button once the task enters review/review_head/done.

**Architecture:** New `TaskSubmissionFile` Prisma model links `TaskStatusHistory` rows to `FileStorage` blobs. A dedicated `submitTaskForReview(formData)` server action replaces the old `taskTransition("submit")` path. A new `SubmitForReviewModal` client component owns the form. `TaskDetailScreen` is updated to open the modal on submit and to hide the findings button after review starts.

**Tech Stack:** Next.js 16 App Router · React 19 · Prisma ORM · Vitest · Testing Library · `next-intl`

---

## File Map

| Status | Path |
|--------|------|
| Modify | `web/prisma/schema.prisma` |
| Modify | `web/src/lib/tasks-machine.ts` |
| Modify | `web/src/lib/tasks-machine.test.ts` |
| Modify | `web/src/lib/actions/tasks.ts` |
| Modify | `web/src/lib/actions/tasks.test.ts` |
| Modify | `web/src/lib/data/tasks.ts` |
| Modify | `web/src/lib/data/tasks.test.ts` |
| Create | `web/src/components/tasks/SubmitForReviewModal.tsx` |
| Create | `web/src/components/tasks/SubmitForReviewModal.test.tsx` |
| Modify | `web/src/components/tasks/TaskDetailScreen.tsx` |
| Modify | `web/messages/uz.json` |

---

## Task 1: DB Schema — Add TaskSubmissionFile

**Files:**
- Modify: `web/prisma/schema.prisma`

- [ ] **Step 1: Add TaskSubmissionFile model and relations**

Open `web/prisma/schema.prisma`. In `FileStorage` (after the `auditEvidences` line), add:

```prisma
  taskSubmissions  TaskSubmissionFile[]
```

After the `AuditEvidence` model block, add:

```prisma
// Files attached when a task is submitted for review (in_progress → review).
// One row per file per submission. historyId points to the TaskStatusHistory row
// that recorded the status change; the bytes live in FileStorage (provider "db").
model TaskSubmissionFile {
  id        String            @id @default(cuid())
  history   TaskStatusHistory @relation(fields: [historyId], references: [id], onDelete: Cascade)
  historyId String
  file      FileStorage       @relation(fields: [fileId], references: [id])
  fileId    String
  createdAt DateTime          @default(now())

  @@index([historyId])
}
```

In `TaskStatusHistory`, add the back-relation:

```prisma
model TaskStatusHistory {
  id         String   @id @default(cuid())
  taskId     String
  fromStatus String
  toStatus   String
  changedBy  String
  comment    String?
  createdAt  DateTime @default(now())

  submissionFiles TaskSubmissionFile[]

  @@index([taskId])
}
```

- [ ] **Step 2: Push schema to dev DB and regenerate Prisma client**

```powershell
cd "D:\MY PROJECTS\Auditor v6\Auditor-v2\web"
npx prisma db push
npx prisma generate
```

Expected: no errors, Prisma client regenerated.

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(schema): add TaskSubmissionFile for task review evidence"
```

---

## Task 2: tasks-machine — require comment on submit

**Files:**
- Modify: `web/src/lib/tasks-machine.ts`
- Modify: `web/src/lib/tasks-machine.test.ts`

- [ ] **Step 1: Write failing tests**

In `web/src/lib/tasks-machine.test.ts`, inside the `canDoTask` describe block, add after the existing tests:

```typescript
it("requires a comment to submit a task for review", () => {
  const ctx = { role: "t1" as const, isAssignee: true, isAuditLeader: false, isSuper: false };
  expect(canDoTask("submit", "in_progress", ctx).reason).toBe("comment_required");
  expect(
    canDoTask("submit", "in_progress", ctx, "Vazifa bajarildi, dalillar yuklandi").ok,
  ).toBe(true);
});
```

- [ ] **Step 2: Run test to confirm it fails**

```powershell
npx vitest run src/lib/tasks-machine.test.ts
```

Expected: new test fails with "Expected: 'comment_required', Received: undefined".

- [ ] **Step 3: Add needsComment to submit transition**

In `web/src/lib/tasks-machine.ts`, change the `submit` entry:

```typescript
submit: {
  from: ["in_progress"],
  to: "review",
  needsComment: true,
  allow: (c) => c.isAssignee || isLead(c.role),
},
```

- [ ] **Step 4: Run tests — all pass**

```powershell
npx vitest run src/lib/tasks-machine.test.ts
```

Expected: all tests pass (actionsFor still shows submit button because it passes `"__visible__"` as mock comment).

- [ ] **Step 5: Commit**

```bash
git add src/lib/tasks-machine.ts src/lib/tasks-machine.test.ts
git commit -m "feat(machine): require comment when submitting task for review"
```

---

## Task 3: Server Action — submitTaskForReview

**Files:**
- Modify: `web/src/lib/actions/tasks.ts`
- Modify: `web/src/lib/actions/tasks.test.ts`

- [ ] **Step 1: Write failing tests**

In `web/src/lib/actions/tasks.test.ts`, add this import at the top (alongside the existing import):

```typescript
import { createTask, taskTransition, submitTaskForReview } from "./tasks";
```

Add a new describe block at the bottom of the file:

```typescript
describe("submitTaskForReview", () => {
  const makeForm = (
    overrides: Partial<{ taskId: string; comment: string; files: File[] }> = {},
  ): FormData => {
    const fd = new FormData();
    fd.set("taskId", overrides.taskId ?? "T-1");
    fd.set("comment", overrides.comment ?? "Vazifa bajarildi, barcha tekshiruvlar o'tdi");
    for (const f of overrides.files ?? []) fd.append("files", f);
    return fd;
  };

  beforeEach(() => {
    h.task = { id: "T-1", status: "in_progress", assigneeId: "u1", auditId: "AUD-1", due: "2099-12-31" };
    h.audit = { status: "in_progress", leaderId: "u3", members: [{ userId: "u1" }] };
  });

  it("rejects a missing comment", async () => {
    expect(await submitTaskForReview(makeForm({ comment: "" }))).toEqual({
      ok: false,
      error: "comment_required",
    });
  });

  it("rejects a comment shorter than 10 chars", async () => {
    expect(await submitTaskForReview(makeForm({ comment: "qisqa" }))).toEqual({
      ok: false,
      error: "comment_required",
    });
  });

  it("rejects more than 5 files", async () => {
    const files = Array.from({ length: 6 }, (_, i) => new File(["x"], `f${i}.txt`));
    expect(await submitTaskForReview(makeForm({ files }))).toEqual({
      ok: false,
      error: "too_many_files",
    });
  });

  it("rejects a file exceeding 20 MB", async () => {
    const big = new File([new ArrayBuffer(21 * 1024 * 1024)], "big.bin");
    expect(await submitTaskForReview(makeForm({ files: [big] }))).toEqual({
      ok: false,
      error: "too_large",
    });
  });

  it("submits task with comment and no files → task status review", async () => {
    const res = await submitTaskForReview(makeForm());
    expect(res).toEqual({ ok: true });
    expect(mockPrisma.task.update).toHaveBeenCalledWith({
      where: { id: "T-1" },
      data: { status: "review" },
    });
    expect(mockPrisma.taskStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fromStatus: "in_progress",
          toStatus: "review",
          comment: "Vazifa bajarildi, barcha tekshiruvlar o'tdi",
        }),
      }),
    );
  });

  it("forbids a non-assignee non-lead from submitting", async () => {
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u9", role: "t1", name: "" });
    expect(await submitTaskForReview(makeForm())).toEqual({ ok: false, error: "forbidden" });
  });
});
```

Also add `taskSubmissionFile` mock inside the `vi.mock("@/lib/prisma", ...)` factory:

```typescript
// inside the prisma mock object — add alongside task, audit, etc.:
taskSubmissionFile: { create: vi.fn(async () => ({})) },
fileStorage: { create: vi.fn(async () => ({ id: "fs-1" })) },
```

- [ ] **Step 2: Run tests — confirm they fail**

```powershell
npx vitest run src/lib/actions/tasks.test.ts
```

Expected: new tests fail with "submitTaskForReview is not a function".

- [ ] **Step 3: Implement submitTaskForReview in tasks.ts**

At the top of `web/src/lib/actions/tasks.ts`, add to the imports:

```typescript
import { createHash } from "crypto";
```

Remove `"submit"` from the `TaskTransitionInput` z.enum (it now has its own action):

```typescript
const TaskTransitionInput = z.object({
  taskId: z.string().min(1),
  action: z.enum([
    "assign",
    "start",
    "approve",
    "approve_head",
    "return",
    "restart",
    "unblock",
  ]),
  comment: z.string().optional(),
});
```

Also remove `submit` from `AUDIT_ACTION`:

```typescript
const AUDIT_ACTION: Record<TaskAction, string> = {
  assign: "task.assign",
  start: "task.update_status",
  approve: "task.approve",
  approve_head: "task.approve",
  return: "task.return",
  restart: "task.update_status",
  unblock: "task.update_status",
};
```

> Note: `TaskAction` type (from `tasks-machine.ts`) still includes `"submit"` for the machine guard — we just remove it from the `taskTransition` route handler since submit now has its own dedicated action.

Add this export function after `taskTransition`:

```typescript
const MAX_SUBMIT_FILES = 5;
const MAX_SUBMIT_FILE_BYTES = 20 * 1024 * 1024; // 20 MB

export async function submitTaskForReview(formData: FormData): Promise<ActionResult> {
  const { userId, role } = await requireSession();

  const taskId = String(formData.get("taskId") ?? "").trim();
  const comment = String(formData.get("comment") ?? "").trim();
  const rawFiles = formData.getAll("files");
  const files = rawFiles.filter((f): f is File => f instanceof File && f.size > 0);

  if (!taskId) return { ok: false, error: "invalid" };
  if (comment.length < 10) return { ok: false, error: "comment_required" };
  if (files.length > MAX_SUBMIT_FILES) return { ok: false, error: "too_many_files" };
  for (const f of files) {
    if (f.size > MAX_SUBMIT_FILE_BYTES) return { ok: false, error: "too_large" };
  }

  if (!(await requirePermission(userId, "task.update_status"))) {
    return { ok: false, error: "forbidden" };
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { audit: { select: { leaderId: true } } },
  });
  if (!task) return { ok: false, error: "not_found" };

  const guard = canDoTask(
    "submit",
    task.status as TaskStatus,
    {
      role,
      isAssignee: task.assigneeId === userId,
      isAuditLeader: task.audit.leaderId === userId,
      isSuper: role === "super",
    },
    comment,
  );
  if (!guard.ok) return { ok: false, error: guard.reason };

  await prisma.$transaction(async (tx) => {
    const fileIds: string[] = [];
    for (const f of files) {
      const buf = Buffer.from(await f.arrayBuffer());
      const sha256 = createHash("sha256").update(buf).digest("hex");
      const stored = await tx.fileStorage.create({
        data: {
          filename: f.name,
          mimeType: f.type || "application/octet-stream",
          sizeBytes: buf.length,
          sha256,
          provider: "db",
          bytes: buf,
          uploadedById: userId,
        },
      });
      fileIds.push(stored.id);
    }

    await tx.task.update({ where: { id: taskId }, data: { status: "review" } });

    const history = await tx.taskStatusHistory.create({
      data: {
        taskId,
        fromStatus: task.status,
        toStatus: "review",
        changedBy: userId,
        comment,
      },
    });

    for (const fileId of fileIds) {
      await tx.taskSubmissionFile.create({ data: { historyId: history.id, fileId } });
    }

    await tx.auditLog.create({
      data: {
        userId,
        action: "task.update_status",
        entity: taskId,
        level: "info",
        payload: J({ from: task.status, to: "review", files: fileIds.length }),
      },
    });

    await recountTasksAgg(tx, task.auditId);
  });

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath(`/audits/${task.auditId}`);
  return { ok: true };
}
```

- [ ] **Step 4: Run tests — all pass**

```powershell
npx vitest run src/lib/actions/tasks.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/actions/tasks.ts src/lib/actions/tasks.test.ts
git commit -m "feat(actions): add submitTaskForReview with comment + file upload"
```

---

## Task 4: Data Layer — history includes files

**Files:**
- Modify: `web/src/lib/data/tasks.ts`
- Modify: `web/src/lib/data/tasks.test.ts`

- [ ] **Step 1: Write failing tests**

In `web/src/lib/data/tasks.test.ts`, update the prisma mock to include `taskStatusHistory` with nested `submissionFiles`:

```typescript
// inside h = vi.hoisted(() => ({ ... })), replace taskRows / auditRows with:
taskStatusHistoryRows: [] as Array<{
  id: string;
  fromStatus: string;
  toStatus: string;
  changedBy: string;
  comment: string | null;
  createdAt: Date;
  submissionFiles: Array<{ file: { id: string; filename: string; sizeBytes: number; mimeType: string } }>;
}>,
```

Update the prisma mock:

```typescript
vi.mock("@/lib/prisma", () => ({
  prisma: {
    task: { findMany: vi.fn(async () => h.taskRows), findUnique: vi.fn() },
    audit: { findMany: vi.fn(async () => h.auditRows) },
    taskStatusHistory: { findMany: vi.fn(async () => h.taskStatusHistoryRows) },
  },
}));
```

Add a new describe block:

```typescript
describe("getTaskStatusHistory", () => {
  it("returns empty array when no history", async () => {
    h.taskStatusHistoryRows = [];
    const { getTaskStatusHistory } = await import("./tasks");
    expect(await getTaskStatusHistory("T-1")).toEqual([]);
  });

  it("maps submission files onto the history entry", async () => {
    h.taskStatusHistoryRows = [
      {
        id: "h-1",
        fromStatus: "in_progress",
        toStatus: "review",
        changedBy: "u6",
        comment: "Bajarildi",
        createdAt: new Date("2026-06-10T10:00:00Z"),
        submissionFiles: [
          { file: { id: "fs-1", filename: "scan.png", sizeBytes: 1024, mimeType: "image/png" } },
        ],
      },
    ];
    const { getTaskStatusHistory } = await import("./tasks");
    const result = await getTaskStatusHistory("T-1");
    expect(result[0].comment).toBe("Bajarildi");
    expect(result[0].files).toEqual([
      { id: "fs-1", filename: "scan.png", sizeBytes: 1024, mimeType: "image/png" },
    ]);
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```powershell
npx vitest run src/lib/data/tasks.test.ts
```

Expected: new tests fail (wrong shape from old query).

- [ ] **Step 3: Update TaskHistoryEntry type and getTaskStatusHistory**

Replace the bottom of `web/src/lib/data/tasks.ts` (from `TaskHistoryEntry` onwards):

```typescript
export interface TaskHistoryFile {
  id: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
}

export interface TaskHistoryEntry {
  who: string;
  action: string;
  time: string;
  comment?: string;
  files?: TaskHistoryFile[];
}

export const getTaskStatusHistory = cache(async (taskId: string): Promise<TaskHistoryEntry[]> => {
  const rows = await prisma.taskStatusHistory.findMany({
    where: { taskId },
    include: {
      submissionFiles: {
        include: {
          file: { select: { id: true, filename: true, sizeBytes: true, mimeType: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => ({
    who: r.changedBy,
    action: `${r.fromStatus} → ${r.toStatus}`,
    time: r.createdAt.toISOString().slice(0, 16).replace("T", " "),
    comment: r.comment ?? undefined,
    files: r.submissionFiles.length
      ? r.submissionFiles.map((sf) => ({
          id: sf.file.id,
          filename: sf.file.filename,
          sizeBytes: sf.file.sizeBytes,
          mimeType: sf.file.mimeType,
        }))
      : undefined,
  }));
});
```

- [ ] **Step 4: Run tests — all pass**

```powershell
npx vitest run src/lib/data/tasks.test.ts
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/data/tasks.ts src/lib/data/tasks.test.ts
git commit -m "feat(data): include submission files in task status history"
```

---

## Task 5: SubmitForReviewModal component

**Files:**
- Create: `web/src/components/tasks/SubmitForReviewModal.tsx`
- Create: `web/src/components/tasks/SubmitForReviewModal.test.tsx`

Add these strings to `web/messages/uz.json` inside the `"taskDetail"` object (before the closing `}`):

```json
"submitModal": {
  "title": "Tekshiruvga yuborish",
  "commentLabel": "Bajarilgan ishlar haqida",
  "commentPlaceholder": "Nima qilindi, qanday natijalar olindi (kamida 10 ta belgi)",
  "filesLabel": "Dalil fayllar (ixtiyoriy, max 5 ta, 20 MB)",
  "filesHint": "Fayl tanlanmagan",
  "submit": "Yuborish",
  "cancel": "Bekor qilish",
  "errorTooMany": "Maksimal 5 ta fayl yuklash mumkin",
  "errorTooLarge": "Fayl hajmi 20 MB dan oshmasligi kerak",
  "errorComment": "Izoh kamida 10 ta belgi bo'lishi kerak"
}
```

- [ ] **Step 1: Write failing component test**

Create `web/src/components/tasks/SubmitForReviewModal.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { SubmitForReviewModal } from "./SubmitForReviewModal";

vi.mock("@/lib/actions/tasks", () => ({
  submitTaskForReview: vi.fn(async () => ({ ok: true })),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import { submitTaskForReview } from "@/lib/actions/tasks";

function setup(open = true) {
  const onClose = vi.fn();
  render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <SubmitForReviewModal open={open} onClose={onClose} taskId="T-1" />
    </NextIntlClientProvider>,
  );
  return { onClose };
}

describe("SubmitForReviewModal", () => {
  it("renders nothing when closed", () => {
    setup(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the form when open", () => {
    setup();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(messages.taskDetail.submitModal.commentLabel)).toBeInTheDocument();
  });

  it("shows error when submitting with short comment", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: messages.taskDetail.submitModal.submit }));
    expect(screen.getByText(messages.taskDetail.submitModal.errorComment)).toBeInTheDocument();
    expect(submitTaskForReview).not.toHaveBeenCalled();
  });

  it("calls submitTaskForReview with FormData on valid submit", async () => {
    setup();
    await userEvent.type(
      screen.getByLabelText(messages.taskDetail.submitModal.commentLabel),
      "Barcha testlar muvaffaqiyatli o'tdi",
    );
    await userEvent.click(screen.getByRole("button", { name: messages.taskDetail.submitModal.submit }));
    expect(submitTaskForReview).toHaveBeenCalledWith(expect.any(FormData));
  });

  it("calls onClose when cancel is clicked", async () => {
    const { onClose } = setup();
    await userEvent.click(screen.getByRole("button", { name: messages.taskDetail.submitModal.cancel }));
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test — confirm it fails**

```powershell
npx vitest run src/components/tasks/SubmitForReviewModal.test.tsx
```

Expected: FAIL — "Cannot find module './SubmitForReviewModal'".

- [ ] **Step 3: Implement SubmitForReviewModal**

Create `web/src/components/tasks/SubmitForReviewModal.tsx`:

```typescript
"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Paperclip, Send, X } from "lucide-react";
import { submitTaskForReview } from "@/lib/actions/tasks";

const MAX_FILES = 5;
const MAX_BYTES = 20 * 1024 * 1024;

export interface SubmitForReviewModalProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
}

export function SubmitForReviewModal({ open, onClose, taskId }: SubmitForReviewModalProps) {
  const t = useTranslations("taskDetail.submitModal");
  const [pending, startTransition] = useTransition();
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return;
    const next = [...files, ...Array.from(incoming)].slice(0, MAX_FILES);
    setFiles(next);
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit() {
    if (comment.trim().length < 10) {
      setError(t("errorComment"));
      return;
    }
    for (const f of files) {
      if (f.size > MAX_BYTES) {
        setError(t("errorTooLarge"));
        return;
      }
    }
    setError(null);

    const fd = new FormData();
    fd.set("taskId", taskId);
    fd.set("comment", comment.trim());
    for (const f of files) fd.append("files", f);

    startTransition(async () => {
      const res = await submitTaskForReview(fd);
      if (res.ok) {
        setComment("");
        setFiles([]);
        onClose();
      } else {
        if (res.error === "too_many_files") setError(t("errorTooMany"));
        else if (res.error === "too_large") setError(t("errorTooLarge"));
        else setError(t("errorComment"));
      }
    });
  }

  function handleClose() {
    setComment("");
    setFiles([]);
    setError(null);
    onClose();
  }

  return (
    <div role="dialog" aria-modal="true" className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal__h">
          <span className="modal__title">{t("title")}</span>
          <button type="button" className="btn btn--ghost btn--xs" onClick={handleClose} disabled={pending}>
            <X size={14} />
          </button>
        </div>

        <div className="modal__body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="field">
            <label className="field__label" htmlFor="submit-comment">
              {t("commentLabel")}
            </label>
            <textarea
              id="submit-comment"
              className="select"
              rows={4}
              style={{ width: "100%", resize: "vertical" }}
              placeholder={t("commentPlaceholder")}
              value={comment}
              disabled={pending}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field__label">{t("filesLabel")}</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                disabled={pending || files.length >= MAX_FILES}
                onClick={() => fileRef.current?.click()}
              >
                <Paperclip size={13} />
                <span>{t("filesHint")}</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>
            {files.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                {files.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <span className="font-mono" style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {f.name}
                    </span>
                    <span className="cell-sub">{(f.size / 1024).toFixed(0)} KB</span>
                    <button type="button" className="btn btn--ghost btn--xs" onClick={() => removeFile(i)} disabled={pending}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div style={{ color: "var(--danger)", fontSize: 13 }}>{error}</div>
          )}
        </div>

        <div className="modal__foot">
          <button type="button" className="btn btn--ghost btn--sm" onClick={handleClose} disabled={pending}>
            {t("cancel")}
          </button>
          <button type="button" className="btn btn--primary btn--sm" onClick={handleSubmit} disabled={pending}>
            <Send size={13} />
            <span>{t("submit")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests — all pass**

```powershell
npx vitest run src/components/tasks/SubmitForReviewModal.test.tsx
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/tasks/SubmitForReviewModal.tsx src/components/tasks/SubmitForReviewModal.test.tsx messages/uz.json
git commit -m "feat(ui): add SubmitForReviewModal with comment and file upload"
```

---

## Task 6: Wire TaskDetailScreen

**Files:**
- Modify: `web/src/components/tasks/TaskDetailScreen.tsx`

- [ ] **Step 1: Add submit modal state and import**

At the top of `TaskDetailScreen.tsx`, add to imports:

```typescript
import { SubmitForReviewModal } from "./SubmitForReviewModal";
```

Inside the component, after the existing `const [returning, setReturning] = useState(false)` line, add:

```typescript
const [showSubmitModal, setShowSubmitModal] = useState(false);
```

- [ ] **Step 2: Intercept submit action to open modal**

Change the `onAction` function:

```typescript
function onAction(action: TaskAction) {
  if (action === "return") {
    setReturning((v) => !v);
    return;
  }
  if (action === "submit") {
    setShowSubmitModal(true);
    return;
  }
  run(action);
}
```

- [ ] **Step 3: Hide findings button when task is in review/done**

Find the findings section button:

```typescript
<button
  type="button"
  className="btn btn--primary btn--xs"
  onClick={() => setShowAddFinding(true)}
>
```

Replace it with a conditional render:

```typescript
{!["review", "review_head", "done"].includes(task.status) && (
  <button
    type="button"
    className="btn btn--primary btn--xs"
    onClick={() => setShowAddFinding(true)}
  >
    <Plus size={13} />
    <span>{t("addFinding")}</span>
  </button>
)}
```

- [ ] **Step 4: Add SubmitForReviewModal to JSX**

After the closing `</CreateFindingModal>` tag, add:

```typescript
<SubmitForReviewModal
  open={showSubmitModal}
  onClose={() => setShowSubmitModal(false)}
  taskId={task.id}
/>
```

- [ ] **Step 5: Run typecheck**

```powershell
cd "D:\MY PROJECTS\Auditor v6\Auditor-v2\web"
npm run typecheck
```

Expected: only the pre-existing `TrafficConversation` error — no new errors from our changes.

- [ ] **Step 6: Run all lib tests**

```powershell
npx vitest run src/lib/ src/app/api/ src/components/tasks/
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/tasks/TaskDetailScreen.tsx
git commit -m "feat(ui): wire submit modal and hide findings button after review"
```

---

## Self-Review

**Spec coverage:**
- ✅ Submit modal with comment (mandatory ≥10 chars) — Task 2 + 3 + 5
- ✅ Submit modal with file upload (optional, max 5 × 20 MB, any type) — Task 1 + 3 + 5
- ✅ Files stored in FileStorage DB-blob — Task 1 + 3
- ✅ Files displayed in timeline — Task 4
- ✅ Add finding button hidden on review/review_head/done — Task 6
- ✅ tasks-machine submit requires comment — Task 2
- ✅ Agent API route unaffected (uses `review` target, not `submit` action) — unchanged

**Type consistency:**
- `TaskHistoryFile` defined in Task 4, consumed by `TaskDetailScreen` (passed as `history` prop) ✓
- `SubmitForReviewModal` props: `open: boolean, onClose: () => void, taskId: string` ✓
- `submitTaskForReview(formData: FormData): Promise<ActionResult>` matches import in test ✓

**No placeholders:** All code blocks are complete.
