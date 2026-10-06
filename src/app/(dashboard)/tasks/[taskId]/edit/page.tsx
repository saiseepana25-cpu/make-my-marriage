import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requirePageUser } from "@/features/auth/current-user";
import { hasPermission } from "@/features/auth/permissions";
import { getPageTask } from "@/features/tasks/page-data";
import { taskEventOptions } from "@/features/tasks/service";
import { deadlineLabel } from "@/features/tasks/format";
import { TaskForm } from "@/components/tasks/task-form";
import { BackToTasks, PriorityBadge, StatusBadge } from "@/components/tasks/task-ui";
export const metadata: Metadata = { title: "Edit task", robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ taskId: string }> }) {
  const user = await requirePageUser(); if (!hasPermission(user.role, "tasks:manage")) redirect("/tasks");
  const [{ task }, events] = await Promise.all([getPageTask((await params).taskId), taskEventOptions()]);
  return <div className="mx-auto max-w-5xl space-y-6"><BackToTasks /><div><h1 className="font-display-md text-3xl text-primary sm:text-4xl">Edit Task</h1><p className="mt-3 text-sm text-on-surface-variant">Update the details and keep your shared checklist on track.</p></div><div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]"><TaskForm task={task} events={events} /><aside className="space-y-5 rounded-2xl bg-surface-container-lowest p-6 shadow-sm"><h2 className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">Saved task summary</h2><p className="break-words font-display-md text-xl text-primary">{task.title}</p><div className="flex flex-wrap items-center gap-3"><StatusBadge status={task.status} /><PriorityBadge priority={task.priority} /></div><p className="text-sm text-on-surface-variant">{deadlineLabel(task.dueAt)}</p><p className="text-xs leading-relaxed text-on-surface-variant">Your changes are saved when you select Save changes.</p></aside></div></div>;
}
