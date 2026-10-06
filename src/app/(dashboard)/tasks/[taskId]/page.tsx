import type { Metadata } from "next";
import Link from "next/link";
import { requirePageUser } from "@/features/auth/current-user";
import { canUpdateTaskStatus, hasPermission } from "@/features/auth/permissions";
import { getCurrentWedding } from "@/features/weddings/service";
import { getPageTask } from "@/features/tasks/page-data";
import { eventDate, eventTiming } from "@/features/events/dates";
import { deadlineLabel, isOverdue } from "@/features/tasks/format";
import { BackToTasks, PriorityBadge, StatusBadge, primaryAction } from "@/components/tasks/task-ui";
import { TaskStatusControl } from "@/components/tasks/task-status-control";
import { DeleteTaskButton } from "@/components/tasks/delete-task-button";
import { Icon } from "@/components/marketing/icon";

export const metadata: Metadata = { title: "Task details", robots: { index: false, follow: false } };
export default async function Page({ params, searchParams }: {
  params: Promise<{ taskId: string }>; searchParams: Promise<{ saved?: string }>;
}) {
  const user = await requirePageUser();
  const [{ task, event, asOf }, wedding, search] = await Promise.all([
    getPageTask((await params).taskId), getCurrentWedding(), searchParams,
  ]);
  const manage = hasPermission(user.role, "tasks:manage");
  const overdue = isOverdue(task, asOf);
  return <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-[1fr_auto]">
    <div className="sm:col-start-1 sm:row-start-1 sm:self-center"><BackToTasks /></div>
    {(search.saved === "created" || search.saved === "updated") &&
      <p role="status" className="rounded-xl bg-secondary-container p-4 text-sm sm:col-span-2 sm:row-start-2">
        Task {search.saved === "created" ? "created" : "updated"} successfully.
      </p>}
    <article className="min-w-0 overflow-hidden rounded-[20px] bg-surface-container-lowest shadow-sm sm:col-span-2 sm:row-start-3">
      <div className="space-y-5 border-b border-outline-variant/30 p-5 sm:p-8">
        <div className="flex flex-wrap items-center gap-3"><StatusBadge status={task.status} /><PriorityBadge priority={task.priority} /></div>
        {overdue && <p className="flex items-start gap-2 rounded-xl bg-error-container p-4 text-sm text-on-error-container">
          <Icon name="warning" className="mt-0.5" /><span><strong>Overdue</strong> · Deadline was {deadlineLabel(task.dueAt)}</span>
        </p>}
        <h1 className="break-words font-display-md text-[32px] leading-tight text-primary sm:text-4xl">{task.title}</h1>
        <p className="text-xs text-on-surface-variant">{wedding.groomName} &amp; {wedding.brideName}’s shared wedding checklist</p>
      </div>
      <div className="space-y-7 p-5 sm:p-8">
        {canUpdateTaskStatus(user, task) && <div className="rounded-2xl bg-surface-container-low p-5"><TaskStatusControl id={task.id} status={task.status} /></div>}
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3 rounded-2xl bg-surface-container-low p-5">
            <dt className="flex items-center gap-2 text-xs text-on-surface-variant"><Icon name="calendar_month" />Related event</dt>
            <dd className="break-words text-sm font-semibold">
              {event ? <Link href={`/events/${event.id}`} className="text-primary underline">{event.name}</Link> : "Wedding-wide"}
            </dd>
            {event && <dd className="space-y-2 text-xs text-on-surface-variant">
              <p>{eventDate(event.startAt)} · {eventTiming(event)}</p><p className="break-words">{event.venue}</p>
            </dd>}
          </div>
          <div className="space-y-3 rounded-2xl bg-surface-container-low p-5">
            <dt className="flex items-center gap-2 text-xs text-on-surface-variant"><Icon name="schedule" />Deadline (IST)</dt>
            <dd className="text-sm font-semibold">{deadlineLabel(task.dueAt)}</dd>
            {overdue && <dd className="text-xs text-error">This task is past its deadline and still unfinished.</dd>}
          </div>
        </dl>
        <section aria-labelledby="description-title">
          <h2 id="description-title" className="mb-3 font-display-md text-2xl text-primary">Description &amp; notes</h2>
          <p className="whitespace-pre-wrap break-words rounded-xl bg-surface-container-low p-5 text-sm leading-relaxed text-on-surface-variant">{task.description || "No description added."}</p>
        </section>
      </div>
    </article>
    {manage && <div className="flex flex-col-reverse gap-3 sm:col-start-2 sm:row-start-1 sm:flex-row sm:items-center">
      <DeleteTaskButton id={task.id} title={task.title} /><Link href={`/tasks/${task.id}/edit`} className={primaryAction}><Icon name="edit" />Edit task</Link>
    </div>}
  </div>;
}