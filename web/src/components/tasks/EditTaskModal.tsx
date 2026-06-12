"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Save } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { updateTask } from "@/lib/actions/tasks";
import type { Task, TaskPriority } from "@/lib/types/entities";

const PRIORITIES: TaskPriority[] = ["Yuqori", "Oʻrta", "Past"];

export interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task;
}

export function EditTaskModal({ open, onClose, task }: EditTaskModalProps) {
  const t = useTranslations("taskDetail");
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [due, setDue] = useState(task.due);

  function handleClose() {
    setTitle(task.title);
    setPriority(task.priority);
    setDue(task.due);
    onClose();
  }

  function save() {
    if (!title.trim()) return;
    startTransition(async () => {
      const res = await updateTask({ taskId: task.id, title: title.trim(), priority, due });
      if (res.ok) {
        toast(t("editDone"), "success");
        onClose();
      } else if (res.error === "forbidden") {
        toast(t("editForbidden"), "danger");
      } else {
        toast(t("editFailed"), "danger");
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t("editTitle")}
      footer={
        <>
          <Button size="sm" variant="ghost" onClick={handleClose} disabled={pending}>
            {t("cancel")}
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<Save size={14} />}
            onClick={save}
            disabled={pending || !title.trim()}
          >
            {t("editSave")}
          </Button>
        </>
      }
    >
      <div style={{ display: "grid", gap: 14 }}>
        <Field label={t("editTitleLabel")} htmlFor="edit-task-title">
          <Input
            id="edit-task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("editTitleLabel")}
            disabled={pending}
          />
        </Field>
        <Field label={t("priority")} htmlFor="edit-task-priority">
          <Select
            id="edit-task-priority"
            value={priority}
            onChange={(v) => setPriority(v as TaskPriority)}
            options={PRIORITIES.map((p) => ({ value: p, label: p }))}
            disabled={pending}
          />
        </Field>
        <Field label={t("due")} htmlFor="edit-task-due">
          <DatePicker
            id="edit-task-due"
            value={due}
            onChange={setDue}
            disabled={pending}
          />
        </Field>
      </div>
    </Modal>
  );
}
