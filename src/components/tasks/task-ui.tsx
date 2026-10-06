import Link from "next/link";
import { Icon } from "@/components/marketing/icon";
import { priorityLabels, statusLabels } from "@/features/tasks/format";
import type { TaskPriority, TaskStatus } from "@/types/domain";

export const primaryAction = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary";
export const secondaryAction = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-surface-container-low px-5 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container";
export const taskIdeas = ["Book a photographer", "Finalize the guest list", "Plan wedding outfits"];
export function BackToTasks() {
  return <Link href="/tasks" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary"><Icon name="arrow_back" className="text-lg" />Back to tasks</Link>;
}
export function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${status === "COMPLETED" ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-low text-on-surface-variant"}`}><Icon name={status === "COMPLETED" ? "check_circle" : status === "IN_PROGRESS" ? "timelapse" : "radio_button_unchecked"} />{statusLabels[status]}</span>;
}
export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${priority === "HIGH" ? "text-primary" : "text-on-surface-variant"}`}><span aria-hidden="true" className="size-1.5 rounded-full bg-current" />{priorityLabels[priority]}</span>;
}
export function OverdueBadge() { return <span className="inline-flex items-center gap-1 rounded-full bg-error-container px-2.5 py-1 text-xs text-on-error-container"><Icon name="warning" />Overdue</span>; }
export function TaskIllustration() {
  return <svg aria-hidden="true" viewBox="0 0 120 120" fill="none" className="size-32 text-primary-container"><circle cx="60" cy="60" r="55" fill="currentColor" opacity=".04" /><rect x="32" y="23" width="56" height="79" rx="9" fill="white" stroke="currentColor" strokeWidth="1.5" /><rect x="46" y="18" width="28" height="12" rx="5" fill="currentColor" opacity=".2" /><path d="m43 47 4 4 7-8m-11 22 4 4 7-8m-11 22 4 4 7-8M61 47h15M61 65h15M61 83h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="m98 26 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="currentColor" opacity=".4" /></svg>;
}
